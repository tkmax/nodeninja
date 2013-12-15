var Const = require('./Const')
    , Player = require('./Player')
    , State = Const.State
    , Phase = Const.Phase
    , Resource = Const.Resource
    , Card = Const.Card
    , SettlementRank = Const.SettlementRank
    , SettlementLink = Const.SettlementLink
    , TileLink = Const.TileLink
    , RoadLink = Const.RoadLink
    , Harbor = Const.Harbor
    , Sea = Const.Sea;

var Game = function () { }

Game.option = function (msg) {
    return msg.slice(1).split(' ');
}

Game.suffle = function (src, mt) {
    var tmp = [];

    while (src.length > 0)
        tmp.push(src.splice(mt.nextInt(src.length), 1)[0]);
    while (tmp.length > 0)
        src.push(tmp.splice(mt.nextInt(tmp.length), 1)[0]);
}

Game.clear = function (game) {
    var i;

    game.state = State.Ready;
    game.sound = '';
    game.playerNumber = 4;
    game.phase = '';
    game.active = -1;
    game.trade = {
        destroy: [0, 0, 0, 0, 0]
        , create: [0, 0, 0, 0, 0]
        , playerIdx: -1
    };
    game.largestArmy = -1;
    game.longestRoad = -1;
    game.robber = -1;
    game.dice1 = 0;
    game.dice2 = 0;
    game.harbor = [];
    game.tileList = [];
    game.numList = [];
    game.resource = [0, 0, 0, 0, 0];
    game.card = [];
    game.playerList = [
        new Player(), new Player(), new Player(), new Player()
    ];
    for (i = game.playerList.length - 1; i >= 0; i--)
        Player.clear(game.playerList[i]);
    game.settlementList = [];
    for (i = 0; i < 54; i++)
        game.settlementList.push(SettlementRank.None | 0x00ff);
    game.roadList = [];
    for (i = 0; i < 72; i++)
        game.roadList.push(-1);
}

Game.start = function (game, mt) {
    var i, j;

    mt.setSeed((new Date()).getTime());
    game.state = State.Play;
    game.phase = Phase.SetupSettlement1;
    game.sound = '';
    if (game.playerList[3].uid === '')
        game.playerNumber = 3;
    else
        game.playerNumber = 4;
    for (i = 0; i < 5; i++)
        game.trade.destroy[i] = game.trade.create[i] = 0;
    game.dice1 = 0;
    game.dice2 = 0;
    game.trade.target = -1;
    game.largestArmy = -1;
    game.longestRoad = -1;
    for (i = game.settlementList.length - 1; i >= 0; i--)
        game.settlementList[i] = (SettlementRank.None | 0x00ff);
    for (i = game.roadList.length - 1; i >= 0; i--)
        game.roadList[i] = -1;
    game.active = 0;
    for (i = 0; i < 6; i++)
        game.harbor[i] = i;
    this.suffle(game.harbor, mt);
    game.tileList = [
        Resource.Brick, Resource.Brick, Resource.Brick
        , Resource.Wool, Resource.Wool, Resource.Wool, Resource.Wool
        , Resource.Ore, Resource.Ore, Resource.Ore
        , Resource.Grain, Resource.Grain, Resource.Grain, Resource.Grain
        , Resource.Lumber, Resource.Lumber, Resource.Lumber, Resource.Lumber
        , -1
    ];
    this.suffle(game.tileList, mt);
    for (i = game.tileList.length - 1; i >= 0; i--) {
        if (game.tileList[i] === -1) {
            game.robber = parseInt(i);
            break;
        }
    }
    game.numList = this.createNumList(game.tileList, mt);
    game.card.length = 0;
    for (i = 0; i < 14; i++)
        game.card.push(Card.Soldier);
    for (i = 0; i < 5; i++)
        game.card.push(Card.VictoryPoint);
    for (i = 0; i < 2; i++)
        game.card.push(Card.RoadBuilding);
    for (i = 0; i < 2; i++)
        game.card.push(Card.YearOfPlenty);
    for (i = 0; i < 2; i++)
        game.card.push(Card.Monopoly);
    this.suffle(game.card, mt);
    for (i = game.resource.length - 1; i >= 0; i--)
        game.resource[i] = 19;
    for (i = game.playerNumber - 1; i >= 0; i--)
        Player.start(game.playerList[i]);
    if (game.playerNumber === 3) Player.clear(game.playerList[3]);
}

Game.createNumList = function (tileList, mt) {
    var numList = [], tmp = [];

    do {
        numList = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
        while (numList.length > 0)
            tmp.push(numList.splice(mt.nextInt(numList.length), 1)[0]);
        while (tmp.length > 0) {
            if (tileList[numList.length] === -1) numList.push(-1);
            numList.push(tmp.splice(mt.nextInt(tmp.length), 1)[0]);
        }
    } while (this.isWrongNumList(numList));

    return numList;
}

Game.isWrongNumList = function (numList) {
    var i;

    for (i = 0; i < numList.length; i++) {
        if (numList[i] === 6 || numList[i] === 8) {
            switch (i) {
                case 0: case 1:
                    if (
                           (numList[i + 1] === 6 || numList[i + 1] === 8)
                        || (numList[i + 3] === 6 || numList[i + 3] === 8)
                        || (numList[i + 4] === 6 || numList[i + 4] === 8)
                    ) return true;
                    break;
                case 2:
                    if (
                           (numList[i + 3] === 6 || numList[i + 3] === 8)
                        || (numList[i + 4] === 6 || numList[i + 4] === 8)
                    ) return true;
                    break;
                case 3: case 4: case 5: case 8: case 9: case 10:
                    if (
                           (numList[i + 1] === 6 || numList[i + 1] === 8)
                        || (numList[i + 4] === 6 || numList[i + 4] === 8)
                        || (numList[i + 5] === 6 || numList[i + 5] === 8)
                    ) return true;
                    break;
                case 6:
                    if (
                           (numList[i + 4] === 6 || numList[i + 4] === 8)
                        || (numList[i + 5] === 6 || numList[i + 5] === 8)
                    ) return true;
                    break;
                case 7:
                    if (
                           (numList[i + 1] === 6 || numList[i + 1] === 8)
                        || (numList[i + 5] === 6 || numList[i + 5] === 8)
                    ) return true;
                    break;
                case 11:
                    if (numList[i + 4] === 6 || numList[i + 4] === 8) return true;
                    break;
                case 12:
                    if (
                           (numList[i + 1] === 6 || numList[i + 1] === 8)
                        || (numList[i + 4] === 6 || numList[i + 4] === 8)
                    ) return true;
                    break;
                case 13: case 14:
                    if (
                           (numList[i + 1] === 6 || numList[i + 1] === 8)
                        || (numList[i + 3] === 6 || numList[i + 3] === 8)
                        || (numList[i + 4] === 6 || numList[i + 4] === 8)
                    ) return true;
                    break;
                case 15:
                    if (numList[i + 3] === 6 || numList[i + 3] === 8) return true;
                    break;
                case 16: case 17:
                    if (numList[i + 1] === 6 || numList[i + 1] === 8) return true;
                    break;
            }
        }
    }

    return false;
}

Game.buildSettlement = function (game, pt) {
    game.settlementList[pt] = (SettlementRank.Settlement | game.active);
    game.playerList[game.active].settlement--;
    game.playerList[game.active].score++;

    if ((pt === 0 || pt === 3) && Sea[game.harbor[0]][0] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[0]][0]] = true;
    else if ((pt === 1 || pt === 4) && Sea[game.harbor[0]][1] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[0]][1]] = true;
    else if ((pt === 1 || pt === 5) && Sea[game.harbor[0]][2] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[0]][2]] = true;
    else if ((pt === 2 || pt === 6) && Sea[game.harbor[1]][0] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[1]][0]] = true;
    else if ((pt === 10 || pt === 15) && Sea[game.harbor[1]][1] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[1]][1]] = true;
    else if ((pt === 15 || pt === 20) && Sea[game.harbor[1]][2] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[1]][2]] = true;
    else if ((pt === 26 || pt === 32) && Sea[game.harbor[2]][0] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[2]][0]] = true;
    else if ((pt === 37 || pt === 42) && Sea[game.harbor[2]][1] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[2]][1]] = true;
    else if ((pt === 42 || pt === 46) && Sea[game.harbor[2]][2] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[2]][2]] = true;
    else if ((pt === 50 || pt === 53) && Sea[game.harbor[3]][0] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[3]][0]] = true;
    else if ((pt === 49 || pt === 52) && Sea[game.harbor[3]][1] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[3]][1]] = true;
    else if ((pt === 48 || pt === 52) && Sea[game.harbor[3]][2] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[3]][2]] = true;
    else if ((pt === 47 || pt === 51) && Sea[game.harbor[4]][0] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[4]][0]] = true;
    else if ((pt === 38 || pt === 43) && Sea[game.harbor[4]][1] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[4]][1]] = true;
    else if ((pt === 33 || pt === 38) && Sea[game.harbor[4]][2] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[4]][2]] = true;
    else if ((pt === 21 || pt === 27) && Sea[game.harbor[5]][0] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[5]][0]] = true;
    else if ((pt === 11 || pt === 16) && Sea[game.harbor[5]][1] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[5]][1]] = true;
    else if ((pt === 7 || pt === 11) && Sea[game.harbor[5]][2] !== Harbor.None)
        game.playerList[game.active].harbor[Sea[game.harbor[5]][2]] = true;

    return this.longestRoad(game);
}

Game.longestRoad = function (game) {
    var i, j, tmp, size = [0, 0, 0, 0], result = -1;

    for (i = size.length - 1; i >= 0; i--) {
        for (j = game.roadList.length - 1; j >= 0; j--) {
            tmp = this.roadSize(game, i, j, 0, 0);
            if (tmp > size[i]) size[i] = tmp;
        }
    }
    tmp = 0;
    for (i = size.length - 1; i >= 1; i--)
        if (size[i] > size[tmp]) tmp = i;
    if (size[tmp] < 5) {
        if (game.longestRoad !== -1) {
            game.playerList[game.longestRoad].bonus -= 2;
            game.longestRoad = -1;
        }
    } else {
        if (game.longestRoad === -1) {
            result = game.longestRoad = tmp;
            game.playerList[tmp].bonus += 2;
        } else if (tmp !== game.longestRoad && size[tmp] > size[game.longestRoad]) {
            game.playerList[game.longestRoad].bonus -= 2;
            result = game.longestRoad = tmp;
            game.playerList[tmp].bonus += 2;
        }
    }

    return result;
}

Game.buildCity = function (game, pt) {
    game.settlementList[pt] = (SettlementRank.City | game.active);
    game.playerList[game.active].city--;
    game.playerList[game.active].settlement++;
    game.playerList[game.active].score++;
}

Game.buildRoad = function (game, pt) {
    game.roadList[pt] = game.active;
    game.playerList[game.active].road--;

    return this.longestRoad(game);
}

Game.createResource = function (game, playerIdx, type, size) {
    game.playerList[playerIdx].resource[type] += size;
    game.resource[type] -= size;
}

Game.destroyResource = function (game, playerIdx, type, size) {
    game.playerList[playerIdx].resource[type] -= size;
    game.resource[type] += size; 
}

Game.huntResource = function (game, fromIdx, toIdx, type, size) {
    game.playerList[fromIdx].resource[type] -= size;
    game.playerList[toIdx].resource[type] += size;
}

Game.robberResource = function (game, playerIdx, mt) {
    var i, j, tmp = [];

    for (i = 0; i < 5; i++) {
        for (j = game.playerList[playerIdx].resource[i]; j >= 0; j--)
            tmp.push(i);
    }
    this.suffle(tmp, mt);
    this.huntResource(game, playerIdx, game.active, tmp[mt.nextInt(tmp.length)], 1);
}

Game.canBuildRoad = function (game, pt) {
    var i, j;

    if (game.roadList[pt] === -1) {
        for (i = RoadLink[pt].length - 1; i >= 0; i--) {
            if ((game.settlementList[RoadLink[pt][i]] & 0x00ff) === game.active) {
                return true;
            } else if ((game.settlementList[RoadLink[pt][i]] & 0xff00) === SettlementRank.None) {
                for (j = SettlementLink[RoadLink[pt][i]].length - 1; j >= 0; j--) {
                    if (game.roadList[SettlementLink[RoadLink[pt][i]][j]] === game.active) return true;
                }
            }
        }
    }

    return false;
}

Game.canBuildRoads = function (game) {
    var i, result = false;

    for (i = game.roadList.length - 1; i >= 0; i--)
        if(this.canBuildRoad(game, i)) return true;

    return false;
}

Game.canBuildSettlement = function (game, playerIdx) {
    var i, j, result = false;

    for (i = SettlementLink[playerIdx].length - 1; i >= 0; i--) {
        if (game.roadList[SettlementLink[playerIdx][i]].length === game.active) {
            result = true;
            for (j = RoadLink[SettlementLink[playerIdx][i]].length - 1; j >= 0; j--) {
                if ((game.settlementList[RoadLink[SettlementLink[playerIdx][i]][j]] & 0xff00) !== SettlementRank.None) {
                    result = false;
                    break;
                }
            }
        }
    }

    return result;
}

Game.canBuildSettlements = function (game) {
    var i;

    for (i = game.settlementList.length - 1; i >= 0; i--)
        if(this.canBuildSettlement(game, i)) return true;
    
    return false;
}

Game.canBuildCity = function (game, playerIdx) {
    if(game.settlementList[playerIdx] === (SettlementRank.Settlement | game.active)) return true;
    return false;
}

Game.canBuildCitys = function (game) {
    var i;

    for (i = game.settlementList.length - 1; i >= 0; i--)
        if (this.canBuildCity(game, i)) return true;
    
    return false;
}

Game.roadSize = function (game, playerIdx, pt, max, depth) {
    var i, j, foo, bar;

    if (game.roadList[pt] !== playerIdx) {
        return depth;
    } else {
        game.roadList[pt] = -1;
        for (i = RoadLink[pt].length - 1; i >= 0; i--) {
            if (
                   (game.settlementList[RoadLink[pt][i]] & 0xff00) === SettlementRank.None
                || (game.settlementList[RoadLink[pt][i]] & 0x00ff) === playerIdx
            ) {
                foo = game.settlementList[RoadLink[pt][i]];
                game.settlementList[RoadLink[pt][i]] = (SettlementRank.Settlement | 0x00ff);
                for (j = SettlementLink[RoadLink[pt][i]].length - 1; j >= 0; j--) {
                    bar = this.roadSize(game, playerIdx, SettlementLink[RoadLink[pt][i]][j], max, depth + 1);
                    if (bar > max) max = bar;
                }
                game.settlementList[RoadLink[pt][i]] = foo;
            }
        }
        game.roadList[pt] = playerIdx;
    }

    return max;
}

Game.sumPlayerResource = function (game, playerIdx) {
    var i, sum = 0;

    for (i = game.playerList[playerIdx].resource.length - 1; i >= 0; i--)
        sum += game.playerList[playerIdx].resource[i];

    return sum;
}

Game.playCard = function (game, type) {
    game.playerList[game.active].wakeCard[type]--;
    game.playerList[game.active].deadCard[type]++;
    game.playerList[game.active].isPlayedCard = true;
}


Game.sumResource = function (game) {
    var i, sum = 0;

    for (i = game.resource.length - 1; i >= 0; i--) sum += game.resource[i];

    return sum;
}

Game.diceRoll = function (mt) {
    var foo = [1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1], bar = [];

    while (foo.length > 0)
        bar.push(foo.splice(mt.nextInt(foo.length), 1)[0]);

    return bar.splice(mt.nextInt(bar.length), 1)[0];
}

module.exports = Game;