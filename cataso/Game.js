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

var Game = function() {}

Game.split = function (src) {
    return (src.slice(1)).split(' ');
}

Game.clear = function (game) {
    var i;

    game.state = State.Ready;
    game.sound = '';
    game.phase = '';
    game.active = -1;
    game.trade = {
        consume: [0, 0, 0, 0, 0]
        , produce: [0, 0, 0, 0, 0]
        , target: -1
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
    for (i in game.playerList) Player.clear(game.playerList[i]);
    game.settlementList = [];
    for (i = 0; i < 54; i++) game.settlementList.push(SettlementRank.None | 0x00ff);
    game.roadList = [];
    for (i = 0; i < 72; i++) game.roadList.push(-1);
}

Game.start = function (game) {
    var i, tmp;

    game.state = State.Play;
    game.sound = '';
    game.phase = Phase.SetupSettlement1;
    for (i = 0; i < 5; i++) {
        game.trade.consume[i] = 0;
        game.trade.produce[i] = 0;
    }
    game.trade.target = -1;
    game.largestArmy = -1;
    game.longestRoad = -1;
    game.dice1 = 0;
    game.dice2 = 0;
    for (i in game.settlementList) game.settlementList[i] = (SettlementRank.None | 0x00ff);
    for (i in game.roadList) game.roadList[i] = -1;
    game.active = 0;
    for (i = 0; i < 6; i++) game.harbor.push(i);
    tmp = [];
    while (game.harbor.length > 0) {
        i = Math.floor(Math.random() * game.harbor.length);
        tmp.push(game.harbor[i]);
        game.harbor.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        game.harbor.push(tmp[i]);
        tmp.splice(i, 1);
    }
    game.tileList = [
        Resource.Brick, Resource.Brick, Resource.Brick
        , Resource.Wool, Resource.Wool, Resource.Wool, Resource.Wool
        , Resource.Ore, Resource.Ore, Resource.Ore
        , Resource.Grain, Resource.Grain, Resource.Grain, Resource.Grain
        , Resource.Lumber, Resource.Lumber, Resource.Lumber, Resource.Lumber
        , -1
    ];
    tmp.length = 0;
    while (game.tileList.length > 0) {
        i = Math.floor(Math.random() * game.tileList.length);
        tmp.push(game.tileList[i]);
        game.tileList.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        game.tileList.push(tmp[i]);
        tmp.splice(i, 1);
    }
    for (i in game.tileList) {
        if (game.tileList[i] === -1) {
            game.robber = parseInt(i);
            break;
        }
    }
    game.numList = Game.createNumList(game.tileList);

    game.card.length = 0;
    for (i = 0; i < 14; i++) game.card.push(Card.Soldier);
    for (i = 0; i < 5; i++) game.card.push(Card.VictoryPoint);
    for (i = 0; i < 2; i++) game.card.push(Card.RoadBuilding);
    for (i = 0; i < 2; i++) game.card.push(Card.YearOfPlenty);
    for (i = 0; i < 2; i++) game.card.push(Card.Monopoly);
    tmp.length = 0;
    while (game.card.length > 0) {
        i = Math.floor(Math.random() * game.card.length);
        tmp.push(game.card[i]);
        game.card.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        game.card.push(tmp[i]);
        tmp.splice(i, 1);
    }
    for (i in game.resource) game.resource[i] = 19;
    for (i in game.playerList) Player.start(game.playerList[i]);
}

Game.createNumList = function (tileList) {
    var seed = [], list, i;
    do {
        list = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
        while (list.length > 0) {
            i = Math.floor(Math.random() * list.length);
            seed.push(list[i]);
            list.splice(i, 1);
        }
        while (seed.length > 0) {
            if (tileList[list.length] === -1) list.push(-1);
            i = Math.floor(Math.random() * seed.length);
            list.push(seed[i]);
            seed.splice(i, 1);
        }
    } while (Game.isWrongNumList(list));

    return list;
}

Game.isWrongNumList = function (map) {
    var i;
    for (i = 0; i < map.length; i++) {
        if (map[i] === 6 || map[i] === 8) {
            switch (i) {
                case 0: case 1:
                    if ((map[i + 1] === 6 || map[i + 1] === 8)
                        || (map[i + 3] === 6 || map[i + 3] === 8)
                        || (map[i + 4] === 6 || map[i + 4] === 8)
                    ) return true;
                    break;
                case 2:
                    if ((map[i + 3] === 6 || map[i + 3] === 8)
                        || (map[i + 4] === 6 || map[i + 4] === 8)
                    ) return true;
                    break;
                case 3: case 4: case 5: case 8: case 9: case 10:
                    if ((map[i + 1] === 6 || map[i + 1] === 8)
                        || (map[i + 4] === 6 || map[i + 4] === 8)
                        || (map[i + 5] === 6 || map[i + 5] === 8)
                    ) return true;
                    break;
                case 6:
                    if ((map[i + 4] === 6 || map[i + 4] === 8)
                        || (map[i + 5] === 6 || map[i + 5] === 8)
                    ) return true;
                    break;
                case 7:
                    if ((map[i + 1] === 6 || map[i + 1] === 8)
                        || (map[i + 5] === 6 || map[i + 5] === 8)
                    ) return true;
                    break;
                case 11:
                    if (map[i + 4] === 6 || map[i + 4] === 8) return true;
                    break;
                case 12:
                    if ((map[i + 1] === 6 || map[i + 1] === 8)
                        || (map[i + 4] === 6 || map[i + 4] === 8)
                    ) return true;
                    break;
                case 13: case 14:
                    if ((map[i + 1] === 6 || map[i + 1] === 8)
                        || (map[i + 3] === 6 || map[i + 3] === 8)
                        || (map[i + 4] === 6 || map[i + 4] === 8)
                    ) return true;
                    break;
                case 15:
                    if (map[i + 3] === 6 || map[i + 3] === 8) return true;
                    break;
                case 16: case 17:
                    if (map[i + 1] === 6 || map[i + 1] === 8) return true;
                    break;
            }
        }
    }
    return false;
}

Game.buildSettlement = function (game, idx) {
    game.settlementList[idx] = (SettlementRank.Settlement | game.active);
    game.playerList[game.active].settlement--;
    game.playerList[game.active].score++;

    if ((idx === 0 || idx === 3) && Sea[game.harbor[0]][0] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[0]][0]] = true;
    } else if ((idx === 1 || idx === 4) && Sea[game.harbor[0]][1] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[0]][1]] = true;
    } else if ((idx === 1 || idx === 5) && Sea[game.harbor[0]][2] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[0]][2]] = true;
    } else if ((idx === 2 || idx === 6) && Sea[game.harbor[1]][0] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[1]][0]] = true;
    } else if ((idx === 10 || idx === 15) && Sea[game.harbor[1]][1] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[1]][1]] = true;
    } else if ((idx === 15 || idx === 20) && Sea[game.harbor[1]][2] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[1]][2]] = true;
    } else if ((idx === 26 || idx === 32) && Sea[game.harbor[2]][0] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[2]][0]] = true;
    } else if ((idx === 37 || idx === 42) && Sea[game.harbor[2]][1] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[2]][1]] = true;
    } else if ((idx === 42 || idx === 46) && Sea[game.harbor[2]][2] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[2]][2]] = true;
    } else if ((idx === 50 || idx === 53) && Sea[game.harbor[3]][0] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[3]][0]] = true;
    } else if ((idx === 49 || idx === 52) && Sea[game.harbor[3]][1] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[3]][1]] = true;
    } else if ((idx === 48 || idx === 52) && Sea[game.harbor[3]][2] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[3]][2]] = true;
    } else if ((idx === 47 || idx === 51) && Sea[game.harbor[4]][0] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[4]][0]] = true;
    } else if ((idx === 38 || idx === 43) && Sea[game.harbor[4]][1] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[4]][1]] = true;
    } else if ((idx === 33 || idx === 38) && Sea[game.harbor[4]][2] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[4]][2]] = true;
    } else if ((idx === 21 || idx === 27) && Sea[game.harbor[5]][0] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[5]][0]] = true;
    } else if ((idx === 11 || idx === 16) && Sea[game.harbor[5]][1] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[5]][1]] = true;
    } else if ((idx === 7 || idx === 11) && Sea[game.harbor[5]][2] !== Harbor.None) {
        game.playerList[game.active].harbor[Sea[game.harbor[5]][2]] = true;
    }
    return Game.longestRoad(game);
}

Game.longestRoad = function (game) {
    var i, j, tmp, size = [0, 0, 0, 0], result = -1;

    for (i = 0; i < size.length; i++) {
        for (j in game.roadList) {
            tmp = Game.roadSize(game, i, j, 0, 0);
            if (tmp > size[i]) size[i] = tmp;
        }
    }
    tmp = 0;
    for (i = 1; i < size.length; i++) {
        if (size[i] > size[tmp]) tmp = i;
    }
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

Game.buildCity = function (game, idx) {
    game.settlementList[idx] = (SettlementRank.City | game.active);
    game.playerList[game.active].city--;
    game.playerList[game.active].settlement++;
    game.playerList[game.active].score++;
}

Game.buildRoad = function (game, idx) {
    game.roadList[idx] = game.active;
    game.playerList[game.active].road--;
    return Game.longestRoad(game);
}

Game.produceResource = function (game, idx, resource, num) {
    game.playerList[idx].resource[resource] += num;
    game.resource[resource] -= num;
}

Game.consumeResource = function (game, idx, resource, num) {
    game.playerList[idx].resource[resource] -= num;
    game.resource[resource] += num; 
}

Game.pillageResource = function (game, idx) {
    var tmp;
    do {
        tmp = Math.floor(Math.random() * 5);
    } while (game.playerList[idx].resource[tmp] <= 0);
    game.playerList[idx].resource[tmp]--;
    game.playerList[game.active].resource[tmp]++;
}

Game.canBuildRoad = function (game, idx) {
    var i, j, result = false;

    if (game.roadList[idx] === -1) {
        for (i in RoadLink[idx]) {
            if ((game.settlementList[RoadLink[idx][i]] & 0x00ff) === game.active) {
                result = true;
                break;
            }
            for (j in SettlementLink[RoadLink[idx][i]]) {
                if (game.roadList[SettlementLink[RoadLink[idx][i]][j]] === game.active) {
                    result = true;
                    break;
                }
            }
            if (result) break;
        }
    }
    return result;
}

Game.canBuildRoads = function (game) {
    var i, result = false;

    for (i in game.roadList) {
        result = Game.canBuildRoad(game, i);
        if (result) break;
    }
    return result;
}

Game.canBuildSettlement = function (game, idx) {
    var i, j, result = false;

    for (i in SettlementLink[idx]) {
        if (game.roadList[SettlementLink[idx][i]] === game.active) {
            result = true;
            for (j in RoadLink[SettlementLink[idx][i]]) {
                if ((game.settlementList[RoadLink[SettlementLink[idx][i]][j]] & 0xff00) !== SettlementRank.None) {
                    result = false;
                    break;
                }
            }
        }
    }
    return result;
}

Game.canBuildSettlements = function (game) {
    var i, result = false;

    for (i in game.settlementList) {
        result = Game.canBuildSettlement(game, i);
        if (result) break;
    }
    return result;
}

Game.canBuildCity = function (game, idx) {
    if(game.settlementList[idx] === (SettlementRank.Settlement | game.active)) return true;
    return false;
}

Game.canBuildCitys = function (game) {
    var i, result = false;
    for (i in game.settlementList) {
        if (Game.canBuildCity(game, i)) {
            result = true;
            break;
        }
    }
    return result;
}

Game.roadSize = function (game, playerIdx, pt, max, depth) {
    var i, j, foo, bar;

    if (game.roadList[pt] !== playerIdx) {
        return depth;
    } else {
        game.roadList[pt] = -1;
        for (i in RoadLink[pt]) {
            if ((game.settlementList[RoadLink[pt][i]] & 0xff00) === SettlementRank.None
            || (game.settlementList[RoadLink[pt][i]] & 0x00ff) === playerIdx) {
                foo = game.settlementList[RoadLink[pt][i]];
                game.settlementList[RoadLink[pt][i]] = (SettlementRank.Settlement | 0x00ff);
                for (j in SettlementLink[RoadLink[pt][i]]) {
                    bar = Game.roadSize(game, playerIdx, SettlementLink[RoadLink[pt][i]][j], max, depth + 1);
                    if (bar > max) max = bar;
                }
                game.settlementList[RoadLink[pt][i]] = foo;
            }
        }
        game.roadList[pt] = playerIdx;
    }
    return max;
}

Game.sumResource = function (game) {
    var i, sum = 0;

    for (i in game.resource) sum += game.resource[i];
    return sum;
}

Game.color = function (i) {
    var result;
    switch (i) {
        case 0:
            result = '赤';
            break;
        case 1:
            result = '青';
            break;
        case 2:
            result = '黄';
            break;
        case 3:
            result = '緑';
            break;
    }
    return result;
}

Game.resource = function (type) {
    switch (type) {
        case Resource.Brick:
            return '土';
        case Resource.Wool:
            return '羊';
        case Resource.Ore:
            return '鉄';
        case Resource.Grain:
            return '麦';
        case Resource.Lumber:
            return '木';
    }
}

module.exports = Game;