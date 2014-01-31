var Const = require('./Const')
  , Player = require('./Player')
  , Index = Const.Index
  , State = Const.State
  , Phase = Const.Phase
  , HotelChain = Const.HotelChain
  , StockPrice = Const.StockPrice
  , MajorityBonus = Const.MajorityBonus
  , MinorityBonus = Const.MinorityBonus
  , Position = Const.Position
  , Rotation = Const.Rotation;

var Game = function () { }

Game.split = function (src) {
    return src.slice(1).split(' ');
}

Game.suffle = function (src, mt) {
    var tmp = [];

    while (src.length > 0)
        tmp.push(src.splice(mt.nextInt(src.length), 1)[0]);
    while (tmp.length > 0)
        src.push(tmp.splice(mt.nextInt(tmp.length), 1)[0]);
}

Game.getNextPhaseFromPlay = function (game) {
    var i = game.justPlayTile, cell, isJoinCoverNone = false
      , isJoinHotelChain = [false, false, false, false, false, false, false]
      , genus = 0, phase;

    if (i >= 12) {
        cell = game.map[i - 12];
        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.None)
                isJoinCoverNone = true;
            else
                isJoinHotelChain[cell.hotelChain] = true;
        }
    }
    if (i % 12 > 0) {
        cell = game.map[i - 1];
        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.None)
                isJoinCoverNone = true;
            else
                isJoinHotelChain[cell.hotelChain] = true;
        }
    }
    if (i % 12 < 11) {
        cell = game.map[i + 1];
        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.None)
                isJoinCoverNone = true;
            else
                isJoinHotelChain[cell.hotelChain] = true;
        }
    }
    if (i <= 95) {
        cell = game.map[i + 12];
        if (cell.isCover) {
            if (cell.hotelChain === HotelChain.None)
                isJoinCoverNone = true;
            else
                isJoinHotelChain[cell.hotelChain] = true;
        }
    }

    for (i = isJoinHotelChain.length - 1; i >= 0; i--)
        if (isJoinHotelChain[i]) genus++;
    
    if (genus >= 2) {
        phase = Phase.Absorb;
    } else {
        if (isJoinCoverNone && genus === 0)
            phase = Phase.Chain;
        else
            phase = Phase.Buy;
    }

    return phase;
}

Game.playHotelChain = function (game, type) {
    var i = game.justPlayTile, position, rotation;

    if (i % 12 > 0 && game.map[i - 1].isCover) {
        position = i - 1;
        rotation = Rotation.Horizontal;
    } else if (i >= 12 && game.map[i - 12].isCover) {
        position = i - 12;
        rotation = Rotation.Vertical;
    } else if (i <= 95 && game.map[i + 12].isCover) {
        position = i;
        rotation = Rotation.Vertical;
    } else if (i % 12 < 11 && game.map[i + 1].isCover) {
        position = i;
        rotation = Rotation.Horizontal;
    }

    game.hotelChain[type].position = position;
    game.hotelChain[type].rotation = rotation;

    if (game.certificate[type] > 0)
        this.gainCertificate(game, type, 1);

    this.setMajorityAndMinority(game, type);
}

Game.repaintPlayedHotelChain = function (game) {
    var i, hotelChain = game.hotelChain, position;

    for (i = game.map.length - 1; i >= 0; i--)
        game.map[i].hotelChain = HotelChain.None;

    for (i = hotelChain.length - 1; i >= 0; i--) {
        position = hotelChain[i].position;
        if (position !== Position.None)
            hotelChain[i].size = this.paintPlayedHotelChain(game, position, i, 0);
    }
}

Game.paintPlayedHotelChain = function (game, i, type, size) {
    game.map[i].hotelChain = type;
    size++;
   
    if (
           i >= 12
        && game.map[i - 12].isCover
        && game.map[i - 12].hotelChain === HotelChain.None
    ) size = this.paintPlayedHotelChain(game, i - 12, type, size);
    
    if (
           i % 12 > 0
        && game.map[i - 1].isCover
        && game.map[i - 1].hotelChain === HotelChain.None
    ) size = this.paintPlayedHotelChain(game, i - 1, type, size);
    
    if (
           i % 12 < 11
        && game.map[i + 1].isCover
        && game.map[i + 1].hotelChain === HotelChain.None
    ) size = this.paintPlayedHotelChain(game, i + 1, type, size);

    if (
           i <= 95
        && game.map[i + 12].isCover
        && game.map[i + 12].hotelChain === HotelChain.None
    ) size = this.paintPlayedHotelChain(game, i + 12, type, size);

    return size;
}

Game.drawTile = function (game, index) {
    var player = game.playerList[index], tile;

    player.fresh.length = 0;

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

Game.getStockPrice = function (game, type) {
    var size = game.hotelChain[type].size, price = 0;

    if (size >= 41)
        price = StockPrice[type][8];
    else if(size >= 31)
        price = StockPrice[type][7];
    else if(size >= 21)
        price = StockPrice[type][6];
    else if(size >= 11)
        price = StockPrice[type][5];
    else if(size >= 6)
        price = StockPrice[type][4];
    else if(size >= 5)
        price = StockPrice[type][3];
    else if(size >= 4)
        price = StockPrice[type][2];
    else if(size >= 3)
        price = StockPrice[type][1];
    else if(size >= 2)
        price = StockPrice[type][0];

    return price;
}

Game.getMajorityBonus = function (game, type) {
    var size = game.hotelChain[type].size, bonus = 0;

    if (size >= 41)
        bonus = MajorityBonus[type][8];
    else if(size >= 31)
        bonus = MajorityBonus[type][7];
    else if(size >= 21)
        bonus = MajorityBonus[type][6];
    else if(size >= 11)
        bonus = MajorityBonus[type][5];
    else if(size >= 6)
        bonus = MajorityBonus[type][4];
    else if(size >= 5)
        bonus = MajorityBonus[type][3];
    else if(size >= 4)
        bonus = MajorityBonus[type][2];
    else if(size >= 3)
        bonus = MajorityBonus[type][1];
    else if(size >= 2)
        bonus = MajorityBonus[type][0];

    return bonus;
}

Game.getMinorityBonus = function (game, type) {
    var size = game.hotelChain[type].size, bonus = 0;

    if (size >= 41)
        bonus = MinorityBonus[type][8];
    else if(size >= 31)
        bonus = MinorityBonus[type][7];
    else if(size >= 21)
        bonus = MinorityBonus[type][6];
    else if(size >= 11)
        bonus = MinorityBonus[type][5];
    else if(size >= 6)
        bonus = MinorityBonus[type][4];
    else if(size >= 5)
        bonus = MinorityBonus[type][3];
    else if(size >= 4)
        bonus = MinorityBonus[type][2];
    else if(size >= 3)
        bonus = MinorityBonus[type][1];
    else if(size >= 2)
        bonus = MinorityBonus[type][0];

    return bonus;
}

Game.setMajorityAndMinority = function (game, type) {
    var i, size, majoritySize = 0, minoritySize = 0
        , majority = [], minority = [];

    for (i = game.playerNumber - 1; i >= 0; i--) {
        size = game.playerList[i].certificate[type];
        
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
    priorityPlayer.money -= this.getStockPrice(game, type) * num;
}

Game.sellCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    this.loseCertificate(game, type, num);
    priorityPlayer.money += this.getStockPrice(game, type) * num;
}

Game.absorbUniqueHotelChain = function (game) {
    var mergeSize = [0, 0, 0, 0, 0, 0, 0]
        , i = game.justPlayTile, j, max = 0, count = 0, type;

    if (i >= 12) {
        type = game.map[i - 12].hotelChain;
        if (type !== HotelChain.None && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;
            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    if (i % 12 > 0) {
        type = game.map[i - 1].hotelChain;
        if (type !== HotelChain.None && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;
            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    if (i % 12 < 11) {
        type = game.map[i + 1].hotelChain;
        if (type !== HotelChain.None && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;
            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    if (i <= 95) {
        type = game.map[i + 12].hotelChain;
        if (type !== HotelChain.None && mergeSize[type] === 0) {
            mergeSize[type] = game.hotelChain[type].size;
            if (mergeSize[type] > max) {
                max = mergeSize[type];
                count = 1;
            } else if (mergeSize[type] === max) {
                count++;
            }
        }
    }

    for (i = game.hotelChain.length - 1; i >= 0; i--) {
        game.hotelChain[i].isParent = false;
        game.hotelChain[i].isSubsidiary = false;
    }

    if (count === 1) {
        for (i = mergeSize.length - 1; i >= 0; i--) {
            if (mergeSize[i] > 0) {
                if (mergeSize[i] === max)
                    game.hotelChain[i].isParent = true;
                else
                    game.hotelChain[i].isSubsidiary = true;
            }
        }

        return true;
    } else {
        for (i = mergeSize.length - 1; i >= 0; i--)
            if (mergeSize[i] === max) game.hotelChain[i].isParent = true;

        return false;
    }
}

Game.payBonus = function (game) {
    var i, j, majority, minority
        , hotelChain = game.hotelChain
        , majorityBonus, minorityBonus;

    for (i = hotelChain.length - 1; i >= 0; i--) {
        if (
               hotelChain[i].isSubsidiary
            && hotelChain[i].majority.length > 0
        ) {
            majority = hotelChain[i].majority;
            minority = hotelChain[i].minority;
            majorityBonus = this.getMajorityBonus(game, i);
            minorityBonus = this.getMinorityBonus(game, i);

            if (majority.length === 1) {
                game.playerList[majority[0]].money += majorityBonus;

                if (minority.length === 0) {
                    game.playerList[majority[0]].money += minorityBonus;
                } else {
                    minorityBonus
                        = Math.floor(minorityBonus / minority.length / 100) * 100;

                    for (j = minority.length - 1; j >= 0; j--)
                        game.playerList[minority[j]].money += minorityBonus;
                }
            } else {
                majorityBonus
                    = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                for (j = majority.length - 1; j >= 0; j--)
                    game.playerList[majority[j]].money += majorityBonus;
            }
        }
    }
}

Game.gainCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    priorityPlayer.certificate[type] += num;
    game.certificate[type] -= num;

    this.setMajorityAndMinority(game, type);
}

Game.loseCertificate = function (game, type, num) {
    var priorityPlayer = game.playerList[game.priority];

    priorityPlayer.certificate[type] -= num;
    game.certificate[type] += num;

    this.setMajorityAndMinority(game, type);
}

Game.settle = function (game) {
    var i, j, majority, minority
        , hotelChain = game.hotelChain
        , majorityBonus, minorityBonus;

    for (i = hotelChain.length - 1; i >= 0; i--) {
        if (hotelChain[i].position !== Position.None) {
            if (hotelChain[i].majority.length > 0) {
                majority = hotelChain[i].majority;
                minority = hotelChain[i].minority;
                majorityBonus = this.getMajorityBonus(game, i);
                minorityBonus = this.getMinorityBonus(game, i);

                if (majority.length === 1) {
                    game.playerList[majority[0]].money += majorityBonus;

                    if (minority.length === 0) {
                        game.playerList[majority[0]].money += minorityBonus;
                    } else {
                        minorityBonus
                            = Math.floor(minorityBonus / minority.length / 100) * 100;

                        for (j = minority.length - 1; j >= 0; j--)
                            game.playerList[minority[j]].money += minorityBonus;
                    }
                } else {
                    majorityBonus
                        = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                    for (j = majority.length - 1; j >= 0; j--)
                        game.playerList[majority[j]].money += majorityBonus;
                }
            }
            for (j = game.playerNumber - 1; j >= 0; j--) {
                if(game.playerList[j].certificate[i] > 0) {
                    game.playerList[j].money
                        += this.getStockPrice(game, i) * game.playerList[j].certificate[i];
                }
            }
        }
    }
}

Game.clear = function (game) {
    var i;

    game.state = State.Ready;
    game.sound = '';
    game.playerNumber = 4;
    game.phase = Phase.None;
    game.active = Index.None;
    game.priority = Index.None;
    game.playerList = [
        new Player()
        , new Player()
        , new Player()
        , new Player()
    ];
    for (i = game.playerList.length - 1; i >= 0; i--)
        Player.clear(game.playerList[i]);
    game.map = [];
    game.hotelChain = [];
    game.deck = [];
    game.certificate = [0, 0, 0, 0, 0, 0, 0];
    game.justPlayTile = Position.None;
    game.buyTicket = 0;
    game.canTrash = false;
}

Game.start = function (game, mt) {
    var i, j;

    mt.setSeed((new Date()).getTime());
    game.state = State.Playing;
    if (game.playerList[3].uid === '')
        game.playerNumber = 3;
    else
        game.playerNumber = 4;
    game.phase = Phase.Play;
    game.active = 0;
    game.priority = 0;
    game.map.length = 0;
    game.deck.length = 0;
    for (i = 0; i < 108; i++) {
        game.map.push({ isCover: false, hotelChain: HotelChain.None });
        game.deck.push(i);
    }
    this.suffle(game.deck, mt);
    game.hotelChain.length = 0;
    for (i = 0; i < 7; i++) {
        game.hotelChain.push({
            position: Position.None
            , rotation: Rotation.None
            , size: 0
            , isParent: false
            , isSubsidiary: false
            , majority: []
            , minority: []
        });
    }
    for (i = 0; i < game.playerNumber; i++) game.map[game.deck.shift()].isCover = true;
    for (i = game.playerList.length - 1; i >= 0; i--) {
        Player.start(game.playerList[i]);
        this.drawTile(game, i);
        game.playerList[i].fresh.length = 0;
    }
    for (i = game.certificate.length - 1; i >= 0; i--) game.certificate[i] = 25;
    game.justPlayTile = Position.None;
    game.buyTicket = 3;
    game.canTrash = true;
}

module.exports = Game;