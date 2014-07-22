var Const = require('./Const');
var Player = require('./Player');
var Index = Const.Index;
var State = Const.State;
var Phase = Const.Phase;
var Position = Const.Position;
var Rotation = Const.Rotation;
var HotelChain = Const.HotelChain;
var STOCK_PRICE = Const.STOCK_PRICE;
var MAJORITY_BONUS = Const.MAJORITY_BONUS;
var MINORITY_BONUS = Const.MINORITY_BONUS;

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
    game.sound = '';
    game.playerSize = 4;
    game.phase = Phase.NONE;
    game.active = Index.NONE;
    game.priority = Index.NONE;
    game.playerList = [
          new Player()
        , new Player()
        , new Player()
        , new Player()
    ];
    var i;
    var len1 = game.playerList.length;
    for (i = 0; i < len1; i++) { Player.clear(game.playerList[i]); }
    game.map = [];
    game.hotelChain = [];
    game.deck = [];
    game.certificate = [0, 0, 0, 0, 0, 0, 0];
    game.justTile = Position.NONE;
    game.buyTicket = 0;
    game.canTrash = false;
}

Game.start = function (game, mt) {
    mt.setSeed((new Date()).getTime());
    game.state = State.PLAYING;

    if (game.playerList[3].uid === '') {
        game.playerSize = 3;
        Player.clear(game.playerList[3]);
    } else {
        game.playerSize = 4;
    }

    game.phase = Phase.PLAY;
    game.active = 0;
    game.priority = 0;
    game.map.length = 0;
    game.deck.length = 0;

    var i;
    for (i = 0; i < 108; i++) {
        game.map.push({ isCover: false, hotelChain: HotelChain.NONE });
        game.deck.push(i);
    }

    this.suffle(game.deck, mt);

    game.hotelChain.length = 0;

    for (i = 0; i < 7; i++) {
        game.hotelChain.push({
              position: Position.NONE
            , rotation: Rotation.NONE
            , size: 0
            , isParent: false
            , isSubsidiary: false
            , majority: []
            , minority: []
        });
    }

    var len1 = game.playerSize;
    for (i = 0; i < len1; i++) { game.map[game.deck.shift()].isCover = true; }

    len1 = game.playerSize;
    for (i = 0; i < len1; i++) {
        Player.start(game.playerList[i]);
        this.drawTile(game, i);
        game.playerList[i].fresh.length = 0;
    }

    len1 = game.certificate.length;
    for (i = 0; i < len1; i++) { game.certificate[i] = 25; }

    game.justTile = Position.NONE;
    game.buyTicket = 3;
    game.canTrash = true;
}

Game.nextPhase = function (game) {
    var cell;
    var hasNone = false;
    var hasJoin = [false, false, false, false, false, false, false];

    var justTile = game.justTile;

    if (justTile >= 12) {
        cell = game.map[justTile - 12];

        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.NONE) {
                hasNone = true;
            } else {
                hasJoin[cell.hotelChain] = true;
            }
        }
    }

    if (justTile % 12 > 0) {
        cell = game.map[justTile - 1];

        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.NONE) {
                hasNone = true;
            } else {
                hasJoin[cell.hotelChain] = true;
            }
        }
    }

    if (justTile % 12 < 11) {
        cell = game.map[justTile + 1];

        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.NONE) {
                hasNone = true;
            } else {
                hasJoin[cell.hotelChain] = true;
            }
        }
    }

    if (justTile <= 95) {
        cell = game.map[justTile + 12];

        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.NONE) {
                hasNone = true;
            } else {
                hasJoin[cell.hotelChain] = true;
            }
        }
    }

    var j = 0;

    var i;
    var len1 = hasJoin.length;
    for (i = 0; i < len1; i++) { if (hasJoin[i]) { j++; } }
    
    if (j >= 2) {
        game.phase = Phase.ABSORB;
    } else {
        if (hasNone && j === 0) {
            game.phase = Phase.CHAIN;
        } else {
            game.phase = Phase.BUY;
        }
    }
}

Game.playTile = function (game, type) {
    var justTile = game.justTile;
    var position;
    var rotation;

    if (justTile % 12 > 0 && game.map[justTile - 1].isCover) {
        position = justTile - 1;
        rotation = Rotation.HORIZONTAL;
    } else if (justTile >= 12 && game.map[justTile - 12].isCover) {
        position = justTile - 12;
        rotation = Rotation.VERTICAL;
    } else if (justTile <= 95 && game.map[justTile + 12].isCover) {
        position = justTile;
        rotation = Rotation.VERTICAL;
    } else if (justTile % 12 < 11 && game.map[justTile + 1].isCover) {
        position = justTile;
        rotation = Rotation.HORIZONTAL;
    }

    game.hotelChain[type].position = position;
    game.hotelChain[type].rotation = rotation;

    if (game.certificate[type] > 0) {
        this.gainCertificate(game, type, 1);
    }

    this.updateMajorityAndMinority(game, type);
}

Game.repaintHotelChain = function (game) {
    var i;
    var len1 = game.map.length;
    for (i = 0; i < len1; i++) {
        game.map[i].hotelChain = HotelChain.NONE;
    }

    var position;

    len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        position = game.hotelChain[i].position;

        if (position !== Position.NONE) {
            game.hotelChain[i].size = this.paintHotelChain(game, position, i, 0);
        }
    }
}

Game.paintHotelChain = function (game, i, type, size) {
    game.map[i].hotelChain = type;
    size++;
   
    if (
           i >= 12
        && game.map[i - 12].isCover
        && game.map[i - 12].hotelChain === HotelChain.NONE
    ) {
        size = this.paintHotelChain(game, i - 12, type, size);
    }
    
    if (
           i % 12 > 0
        && game.map[i - 1].isCover
        && game.map[i - 1].hotelChain === HotelChain.NONE
    ) {
        size = this.paintHotelChain(game, i - 1, type, size);
    }
    
    if (
           i % 12 < 11
        && game.map[i + 1].isCover
        && game.map[i + 1].hotelChain === HotelChain.NONE
    ) {
        size = this.paintHotelChain(game, i + 1, type, size);
    }

    if (
           i <= 95
        && game.map[i + 12].isCover
        && game.map[i + 12].hotelChain === HotelChain.NONE
    ) {
        size = this.paintHotelChain(game, i + 12, type, size);
    }

    return size;
}

Game.drawTile = function (game, color) {
    var player = game.playerList[color];

    player.fresh.length = 0;

    var tile;

    while (
           game.deck.length > 0
        && player.hand.length < 6
    ) {
        tile = game.deck.shift();
        player.hand.push(tile);
        player.fresh.push(tile);
    }

    player.hand.sort(function (a, b) { return a - b; });
}

Game.StockPrice = function (game, type) {
    var size = game.hotelChain[type].size;
    var price = 0;

    if (size >= 41) {
        price = STOCK_PRICE[type][8];
    } else if(size >= 31) {
        price = STOCK_PRICE[type][7];
    } else if(size >= 21) {
        price = STOCK_PRICE[type][6];
    } else if(size >= 11) {
        price = STOCK_PRICE[type][5];
    } else if(size >= 6) {
        price = STOCK_PRICE[type][4];
    } else if(size >= 5) {
        price = STOCK_PRICE[type][3];
    } else if(size >= 4) {
        price = STOCK_PRICE[type][2];
    } else if(size >= 3) {
        price = STOCK_PRICE[type][1];
    } else if(size >= 2) {
        price = STOCK_PRICE[type][0];
    }

    return price;
}

Game.MajorityBonus = function (game, type) {
    var size = game.hotelChain[type].size;
    var bonus = 0;

    if (size >= 41) {
        bonus = MAJORITY_BONUS[type][8];
    } else if(size >= 31) {
        bonus = MAJORITY_BONUS[type][7];
    } else if(size >= 21) {
        bonus = MAJORITY_BONUS[type][6];
    } else if(size >= 11) {
        bonus = MAJORITY_BONUS[type][5];
    } else if(size >= 6) {
        bonus = MAJORITY_BONUS[type][4];
    } else if(size >= 5) {
        bonus = MAJORITY_BONUS[type][3];
    } else if(size >= 4) {
        bonus = MAJORITY_BONUS[type][2];
    } else if(size >= 3) {
        bonus = MAJORITY_BONUS[type][1];
    } else if(size >= 2) {
        bonus = MAJORITY_BONUS[type][0];
    }

    return bonus;
}

Game.MinorityBonus = function (game, type) {
    var size = game.hotelChain[type].size;
    var bonus = 0;

    if (size >= 41) {
        bonus = MINORITY_BONUS[type][8];
    } else if(size >= 31) {
        bonus = MINORITY_BONUS[type][7];
    } else if(size >= 21) {
        bonus = MINORITY_BONUS[type][6];
    } else if(size >= 11) {
        bonus = MINORITY_BONUS[type][5];
    } else if(size >= 6) {
        bonus = MINORITY_BONUS[type][4];
    } else if(size >= 5) {
        bonus = MINORITY_BONUS[type][3];
    } else if(size >= 4) {
        bonus = MINORITY_BONUS[type][2];
    } else if(size >= 3) {
        bonus = MINORITY_BONUS[type][1];
    } else if(size >= 2) {
        bonus = MINORITY_BONUS[type][0];
    }

    return bonus;
}

Game.updateMajorityAndMinority = function (game, type) {
    var majoritySize = 0;
    var minoritySize = 0;
    var majority = [];
    var minority = [];

    var i;
    var len1 = game.playerSize;
    for (i = 0; i < len1; i++) {
        var size = game.playerList[i].certificate[type];
        
        if (size > 0) {
            if (size > majoritySize) {
                minoritySize = majoritySize;
                majoritySize = size;
                minority = majority;
                majority = [];
                majority.push(i);
            } else if (size === majoritySize) {
                majority.push(i);
            } else if (size > minoritySize) {
                minoritySize = size;
                minority.length = 0;
                minority.push(i);
            } else if(size === minoritySize) {
                minority.push(i);
            }
        }
    }

    game.hotelChain[type].majority = majority;
    game.hotelChain[type].minority = minority;
}

Game.buyCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    this.gainCertificate(game, type, num);

    priorityPlayer.money -= this.StockPrice(game, type) * num;
}

Game.sellCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    this.loseCertificate(game, type, num);

    priorityPlayer.money += this.StockPrice(game, type) * num;
}

Game.absorbUniqueHotelChain = function (game) {
    var justTile = game.justTile;
    var type;
    var mergeSize = [0, 0, 0, 0, 0, 0, 0];
    var max = 0;
    var count = 0;

    if (justTile >= 12) {
        type = game.map[justTile - 12].hotelChain;

        if (type !== HotelChain.NONE && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;

            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    if (justTile % 12 > 0) {
        type = game.map[justTile - 1].hotelChain;

        if (type !== HotelChain.NONE && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;

            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    if (justTile % 12 < 11) {
        type = game.map[justTile + 1].hotelChain;

        if (type !== HotelChain.NONE && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;

            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    if (justTile <= 95) {
        type = game.map[justTile + 12].hotelChain;

        if (type !== HotelChain.NONE && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;

            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        game.hotelChain[i].isParent = false;
        game.hotelChain[i].isSubsidiary = false;
    }

    if (count === 1) {
        len1 = mergeSize.length;
        for (i = 0; i < len1; i++) {
            if (mergeSize[i] > 0) {
                if (mergeSize[i] === max) {
                    game.hotelChain[i].isParent = true;
                } else {
                    game.hotelChain[i].isSubsidiary = true;
                }
            }
        }

        return true;
    } else {
        len1 = mergeSize.length;
        for (i = 0; i < len1; i++) {
            if (mergeSize[i] === max) { game.hotelChain[i].isParent = true; }
        }

        return false;
    }
}

Game.payBonus = function (game) {
    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        if (
               game.hotelChain[i].isSubsidiary
            && game.hotelChain[i].majority.length > 0
        ) {
            var majority = game.hotelChain[i].majority;
            var minority = game.hotelChain[i].minority;
            var majorityBonus = this.MajorityBonus(game, i);
            var minorityBonus = this.MinorityBonus(game, i);

            var j;
            var len2;

            if (majority.length === 1) {
                game.playerList[majority[0]].money += majorityBonus;

                if (minority.length === 0) {
                    game.playerList[majority[0]].money += minorityBonus;
                } else {
                    minorityBonus = Math.floor(minorityBonus / minority.length / 100) * 100;

                    len2 = minority.length;
                    for (j = 0; j < len2; j++) {
                        game.playerList[minority[j]].money += minorityBonus;
                    }
                }
            } else {
                majorityBonus = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                len2 = majority.length;
                for (j = 0; j < len2; j++) {
                    game.playerList[majority[j]].money += majorityBonus;
                }
            }
        }
    }
}

Game.gainCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    priorityPlayer.certificate[type] += num;
    game.certificate[type] -= num;

    this.updateMajorityAndMinority(game, type);
}

Game.loseCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    priorityPlayer.certificate[type] -= num;
    game.certificate[type] += num;

    this.updateMajorityAndMinority(game, type);
}

Game.settle = function (game) {
    var i;
    var len1 = game.hotelChain.length;
    for (i = 0; i < len1; i++) {
        var j;
        var len2;

        if (game.hotelChain[i].position !== Position.NONE) {
            if (game.hotelChain[i].majority.length > 0) {
                var majority = game.hotelChain[i].majority;
                var minority = game.hotelChain[i].minority;
                var majorityBonus = this.MajorityBonus(game, i);
                var minorityBonus = this.MinorityBonus(game, i);

                if (majority.length === 1) {
                    game.playerList[majority[0]].money += majorityBonus;

                    if (minority.length === 0) {
                        game.playerList[majority[0]].money += minorityBonus;
                    } else {
                        minorityBonus = Math.floor(minorityBonus / minority.length / 100) * 100;

                        len2 = minority.length;
                        for (j = 0; j < len2; j++) {
                            game.playerList[minority[j]].money += minorityBonus;
                        }
                    }
                } else {
                    majorityBonus = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                    len2 = majority.length;
                    for (j = 0; j < len2; j++) {
                        game.playerList[majority[j]].money += majorityBonus;
                    }
                }
            }

            len2 = game.playerSize;
            for (j = 0; j < len2; j++) {
                if(game.playerList[j].certificate[i] > 0) {
                    game.playerList[j].money += this.StockPrice(game, i) * game.playerList[j].certificate[i];
                }
            }
        }
    }
}

module.exports = Game;