var Player = require('./Player');
var Const = require('./Const');
var Index = Const.Index;
var Option = Const.Option;
var State = Const.State;
var Phase = Const.Phase;
var Land = Const.Land;
var Resource = Const.Resource;
var Card = Const.Card;
var SettlementRank = Const.SettlementRank;
var Harbor = Const.Harbor;
var ALPHABET_CHIP = Const.ALPHABET_CHIP;
var ALPHABET_SIGNPOST = Const.ALPHABET_SIGNPOST;
var ROAD_LINK = Const.ROAD_LINK;
var SETTLEMENT_LINK = Const.SETTLEMENT_LINK;

var Game = function () { }

Game.suffle = function (source, mt) {
    var tmp = [];
    
    while (source.length > 0) { tmp.push(source.splice(mt.nextInt(source.length), 1)[0]); }
    
    while (tmp.length > 0) { source.push(tmp.splice(mt.nextInt(tmp.length), 1)[0]); }

    while (source.length > 0) { tmp.push(source.splice(mt.nextInt(source.length), 1)[0]); }

    while (tmp.length > 0) { source.push(tmp.splice(mt.nextInt(tmp.length), 1)[0]); }
}

Game.clear = function (game) {
    game.state = State.READY;
    game.setup = Option.ALPHABET_SETUP;
    game.sound = '';
    game.playerSize = 4;
    game.phase = Phase.NONE;
    game.active = Index.NONE;
    game.priority = [];
    game.canPlayCard = true;
    
    game.secondSettlement = Index.NONE;
    
    game.trade = {
          output: [0, 0, 0, 0, 0]
        , input: [0, 0, 0, 0, 0]
        , playerIndex: Index.NONE
    };
    
    game.largestArmy = Index.NONE;
    game.longestRoad = Index.NONE;
    game.robber = Index.NONE;
    game.dice1 = Index.NONE;
    game.dice2 = Index.NONE;
    game.landList = [];
    
    var settlementList = game.settlementList = [];
    
    var i;
    for (i = 0; i < 54; i++) { settlementList.push(SettlementRank.NONE | 0x00ff); }
    
    var roadList = game.roadList = [];
    
    for (i = 0; i < 72; i++) { roadList.push(Index.NONE); }
    
    game.numberList = [];
    game.resourceStock = [0, 0, 0, 0, 0];
    game.cardStock = [];
    
    var playerList = game.playerList = [
          new Player()
        , new Player()
        , new Player()
        , new Player()
    ];

    var len1 = playerList.length;
    for (i = 0; i < len1; i++) { Player.clear(playerList[i]); }
}

Game.start = function (game, mt) {
    mt.setSeed((new Date()).getTime());
    game.state = State.PLAYING;
    game.phase = Phase.SETUP_SETTLEMENT1;
    game.secondSettlement = Index.NONE;
    game.dice1 = Index.NONE;
    game.dice2 = Index.NONE;
    game.trade.playerIndex = Index.NONE;
    game.largestArmy = Index.NONE;
    game.longestRoad = Index.NONE;
    
    var settlementList = game.settlementList;

    var i;
    var len1 = settlementList.length;
    for (i = 0; i < len1; i++) { settlementList[i] = SettlementRank.NONE | 0x00ff; }
    
    var roadList = game.roadList;

    len1 = roadList.length;
    for (i = 0; i < len1; i++) { roadList[i] = Index.NONE; }
    
    game.active = 0;
    game.priority.length = 0;
    game.priority.push(0);
    game.canPlayCard = true;
    
    var landList = game.landList;
    
    landList.length = 0;
    for (i = 0; i < 3; i++) { landList.push(Resource.BRICK); }
    for (i = 0; i < 4; i++) { landList.push(Resource.WOOL); }
    for (i = 0; i < 3; i++) { landList.push(Resource.ORE); }
    for (i = 0; i < 4; i++) { landList.push(Resource.GRAIN); }
    for (i = 0; i < 4; i++) { landList.push(Resource.LUMBER); }
    landList.push(Land.DESERT);
    
    this.suffle(landList, mt);
    
    for (i = 0; game.landList[i] !== Land.DESERT; i++);
    game.robber = i;
    
    if (game.setup === Option.ALPHABET_SETUP) {
        this.setupAlphabet(game, mt);
    } else {
        this.setupRandom(game, mt);
    }

    var cardStock = game.cardStock;
    cardStock.length = 0;

    for (i = 0; i < 14; i++) { cardStock.push(Card.SOLDIER); }
    for (i = 0; i < 5; i++) { cardStock.push(Card.VICTORY_POINT); }
    for (i = 0; i < 2; i++) { cardStock.push(Card.ROAD_BUILDING); }
    for (i = 0; i < 2; i++) { cardStock.push(Card.YEAR_OF_PLENTY); }
    for (i = 0; i < 2; i++) { cardStock.push(Card.MONOPOLY); }
    
    this.suffle(cardStock, mt);
    
    var resourceStock = game.resourceStock;

    len1 = resourceStock.length;
    for (i = 0; i <  len1; i++) { resourceStock[i] = 19; }
    
    var playerList = game.playerList;

    len1 = game.playerSize = game.playerList[3].uid === '' ? 3 : 4;
    for (i = 0; i < len1; i++) { Player.start(playerList[i]); }
    
    if (len1 === 3) { Player.clear(playerList[3]); }
}

Game.isWrongNumberList = function (numberList) {
    var i;
    var len1 = numberList.length;
    for (i = 0; i < len1; i++) {
        if (numberList[i] === 6 || numberList[i] === 8) {
            switch (i) {
                case 0: case 1:
                    if (
                           (numberList[i + 1] === 6 || numberList[i + 1] === 8)
                        || (numberList[i + 3] === 6 || numberList[i + 3] === 8)
                        || (numberList[i + 4] === 6 || numberList[i + 4] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 2:
                    if (
                           (numberList[i + 3] === 6 || numberList[i + 3] === 8)
                        || (numberList[i + 4] === 6 || numberList[i + 4] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 3: case 4: case 5: case 8: case 9: case 10:
                    if (
                           (numberList[i + 1] === 6 || numberList[i + 1] === 8)
                        || (numberList[i + 4] === 6 || numberList[i + 4] === 8)
                        || (numberList[i + 5] === 6 || numberList[i + 5] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 6:
                    if (
                           (numberList[i + 4] === 6 || numberList[i + 4] === 8)
                        || (numberList[i + 5] === 6 || numberList[i + 5] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 7:
                    if (
                           (numberList[i + 1] === 6 || numberList[i + 1] === 8)
                        || (numberList[i + 5] === 6 || numberList[i + 5] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 11:
                    if (numberList[i + 4] === 6 || numberList[i + 4] === 8) { return true; }
                    break;
                case 12:
                    if (
                           (numberList[i + 1] === 6 || numberList[i + 1] === 8)
                        || (numberList[i + 4] === 6 || numberList[i + 4] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 13: case 14:
                    if (
                           (numberList[i + 1] === 6 || numberList[i + 1] === 8)
                        || (numberList[i + 3] === 6 || numberList[i + 3] === 8)
                        || (numberList[i + 4] === 6 || numberList[i + 4] === 8)
                    ) {
                        return true;
                    }
                    break;
                case 15:
                    if (numberList[i + 3] === 6 || numberList[i + 3] === 8) { return true; }
                    break;
                case 16: case 17:
                    if (numberList[i + 1] === 6 || numberList[i + 1] === 8) { return true; }
                    break;
            }
        }
    }
    
    return false;
}

Game.setupRandom = function(game, mt) {
    var tmp = [];
    do {
        var numberList = game.numberList = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

        while (numberList.length > 0) {
            tmp.push(numberList.splice(mt.nextInt(numberList.length), 1)[0]);
        }

        while (tmp.length > 0) {
            if (game.landList[numberList.length] === Land.DESERT) { numberList.push(Land.DESERT); }
            numberList.push(tmp.splice(mt.nextInt(tmp.length), 1)[0]);
        }
    } while (this.isWrongNumberList(numberList));
}

Game.setupAlphabet = function(game, mt) {
    var index = mt.nextInt(ALPHABET_SIGNPOST.length);

    var j = 0;

    var i;
    var len1 = ALPHABET_SIGNPOST[index].length;
    for (i = 0; i < len1; i++) {
        var k = ALPHABET_SIGNPOST[index][i];

        if (game.landList[k] === Land.DESERT) {
            game.numberList[k] = Land.DESERT;
        } else {
            game.numberList[k] = ALPHABET_CHIP[j];

            j++;
        }
    }
}

Game.hasPriorityUid = function (game, uid) {
    var playerList = game.playerList;
    var priority = game.priority;

    var i;
    var len1 = priority.length;
    for (i = 0; i < len1; i++) {
        if (playerList[priority[i]].uid === uid) { return true; }
    }
    
    return false;
}

Game.gainResource = function (game, color, type, size) {
    game.resourceStock[type] -= size;
    game.playerList[color].resource[type] += size;
}

Game.loseResource = function (game, color, type, size) {
    game.resourceStock[type] += size;
    game.playerList[color].resource[type] -= size;
}

Game.roadSize = function (game, color, index, max, depth) {
    if (game.roadList[index] !== color) {
        return depth;
    } else {
        var roadList = game.roadList;
        roadList[index] = Index.NONE;

        if (depth + 1 > max) { max = depth + 1; }

        var settlementList = game.settlementList;
        
        var i;
        var len1 = ROAD_LINK[index].length;
        for (i = 0; i < len1; i++) {
            if (
                   (settlementList[ROAD_LINK[index][i]] & 0xff00) === SettlementRank.NONE
                || (settlementList[ROAD_LINK[index][i]] & 0x00ff) === color
            ) {
                var before = settlementList[ROAD_LINK[index][i]];
                
                settlementList[ROAD_LINK[index][i]] = (SettlementRank.SETTLEMENT | 0x00ff);

                var j;
                var len2 = SETTLEMENT_LINK[ROAD_LINK[index][i]].length;
                for (j = 0; j < len2; j++) {
                    var size = this.roadSize(game, color, SETTLEMENT_LINK[ROAD_LINK[index][i]][j], max, depth + 1);
                    if (size > max) { max = size; }
                }
                
                settlementList[ROAD_LINK[index][i]] = before;
            }
        }
        
        roadList[index] = color;
    }
    
    return max;
}

Game.longestRoad = function (game) {
    var sizeList = [0, 0, 0, 0];
    
    var i;
    var len1 = sizeList.length;
    for (i = 0; i < len1; i++) {
        var j;
        var len2 = game.roadList.length;
        for (j = 0; j < len2; j++) {
            var size = this.roadSize(game, i, j, 0, 0);
            if (size > sizeList[i]) { sizeList[i] = size; }
        }
    }
    
    var max = 0;

    len1 = sizeList.length;
    for (i = 0; i < len1; i++) {
        if (sizeList[i] > sizeList[max]) { max = i; }
    }
    
    var longestRoad = game.longestRoad;
    var playerList = game.playerList;
    
    if (sizeList[max] < 5) {
        max = Index.NONE;
        
        if (longestRoad !== Index.NONE) {
            playerList[longestRoad].bonusScore -= 2;
            game.longestRoad = Index.NONE;
        }
    } else {
        if (longestRoad === Index.NONE) {
            game.longestRoad = max;
            playerList[max].bonusScore += 2;
        } else if (max !== longestRoad && sizeList[max] > sizeList[longestRoad]) {
            playerList[longestRoad].bonusScore -= 2;
            game.longestRoad = max;
            playerList[max].bonusScore += 2;
        } else {
            max = Index.NONE;
        }
    }
    
    return max;
}

Game.largestArmy = function (game) {
    var result = Index.NONE;

    var active = game.active;
    var activePlayer = game.playerList[active];
    var largestArmy = game.largestArmy;
    var size = activePlayer.deadCard[Card.SOLDIER];

    if (largestArmy === Index.NONE) {
        if (size >= 3) {
            result = game.largestArmy = active;
            activePlayer.bonusScore += 2;
        }
    } else if (largestArmy !== active) {
        var largestArmyPlayer = game.playerList[largestArmy];

        if (size > largestArmyPlayer.deadCard[Card.SOLDIER]) {
            largestArmyPlayer.bonusScore -= 2;
            result = game.largestArmy = active;
            activePlayer.bonusScore += 2;
        }
    }

    return result;
}

Game.buildSettlement = function (game, index) {
    var active = game.active;
    var playerList = game.playerList;
        
    game.settlementList[index] = SettlementRank.SETTLEMENT | active;
    playerList[active].settlementStock--;
    playerList[active].baseScore++;
    
    switch (index) {
        case 5: case 6: case 16: case 27: case 36: case 46: case 52: case 53:
            playerList[active].harbor[Harbor.GENERIC] = true;
            break;
        case 2: case 3:
            playerList[active].harbor[Harbor.ORE] = true;
            break;
        case 7: case 8:
            playerList[active].harbor[Harbor.GRAIN] = true;
            break;
        case 15: case 25:
            playerList[active].harbor[Harbor.WOOL] = true;
            break;
        case 38: case 39:
            playerList[active].harbor[Harbor.LUMBER] = true;
            break;
        case 49: case 50:
            playerList[active].harbor[Harbor.BRICK] = true;
            break;
    }
}

Game.buildRoad = function (game, index) {
    var active = game.active;
    
    game.roadList[index] = active;
    game.playerList[active].roadStock--;
}

Game.buildCity = function (game, index) {
    var active = game.active;
    var playerList = game.playerList;
    
    game.settlementList[index] = SettlementRank.CITY | active;
    playerList[active].cityStock--;
    playerList[active].settlementStock++;
    playerList[active].baseScore++;
}

Game.canBuildRoad = function (game, index) {
    var roadList = game.roadList;
    
    if (roadList[index] === Index.NONE) {
        var active = game.active;
        var settlementList = game.settlementList;

        var i;
        var len1 = ROAD_LINK[index].length;
        for (i = 0; i < len1; i++) {
            if ((settlementList[ROAD_LINK[index][i]] & 0x00ff) === active) {
                return true;
            } else if ((settlementList[ROAD_LINK[index][i]] & 0xff00) === SettlementRank.NONE) {
                var j;
                var len2 = SETTLEMENT_LINK[ROAD_LINK[index][i]].length;
                for (j = 0; j < len2; j++) {
                    if (roadList[SETTLEMENT_LINK[ROAD_LINK[index][i]][j]] === active) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

Game.hasCanBuildRoad = function (game) {
    var i;
    var len1 = game.roadList.length;
    for (i = 0; i < len1; i++) {
        if(this.canBuildRoad(game, i)) { return true; }
    }
    
    return false;
}

module.exports = Game;