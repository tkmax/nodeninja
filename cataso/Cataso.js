var Room = require('../Room');
var MersenneTwister = require('../MersenneTwister');
var Game = require('./Game');
var Dice = require('./Dice');
var Const = require('./Const');
var Option = Const.Option;
var State = Const.State;
var Phase = Const.Phase;
var Sound = Const.Sound;
var Index = Const.Index;
var Resource = Const.Resource;
var Land = Const.Land;
var SettlementRank = Const.SettlementRank;
var Card = Const.Card;
var FONT_COLOR = Const.FONT_COLOR;
var COLOR_NAME = Const.COLOR_NAME;
var LAND_LINK = Const.LAND_LINK;
var RESOURCE_NAME = Const.RESOURCE_NAME;

var Cataso = function () {
    this.initialize('c');
    
    this.game = new Game();
    this.dice = new Dice();
    this.mt = new MersenneTwister();
    
    Game.clear(this.game);
}

Cataso.prototype = new Room();

Cataso.prototype.split = function (source) {
    return source.slice(1).split(' ');
}

Cataso.prototype.reset = function () {
    this.isPlaying = false;

    Game.clear(this.game);

    this.broadcast(JSON.stringify(this.game));
}

Cataso.prototype.onCommand = function (user, message) {
    this.basicCommand(user, message);

    switch (message[0]) {
        case '/alphabet':
            if (this.isPlaying) {
                this.chat('?', 'deeppink', 'プレイ中には変更できません。');
            } else {
                this.game.setup = Option.ALPHABET_SETUP;

                this.chat('?', 'deeppink', 'アルファベット配置に変更しました。');

                this.broadcast(JSON.stringify(this.game));
            }
            break;
        case '/random':
            if (this.isPlaying) {
                this.chat('?', 'deeppink', 'プレイ中には変更できません。');
            } else {
                this.game.setup = Option.RANDOM_SETUP;

                this.chat('?', 'deeppink', 'ランダム配置に変更しました。');

                this.broadcast(JSON.stringify(this.game));
            }
            break;
    }
}

Cataso.prototype.onChat = function (user, message) {
    var playerList = this.game.playerList;
    var color = 'white';
    
    var i;
    var len1 = playerList.length;
    for (i = 0; i < len1; i++) {
        if (playerList[i].uid === user.uid) {
            color = FONT_COLOR[i];
            break;
        }
    }
    
    this.chat(user.uid, color, (message.split('<').join('&lt;')).split('>').join('&gt;'));
}

Cataso.prototype.onMessage = function (uid, message) {
    if (message[0] === 'a') {
        this.unicast(uid, JSON.stringify(this.game));
    } else {
        if (this.game.state === State.READY) {
            switch (message[0]) {
                case 'b':
                    (function (that) {
                        var game = that.game;
                        var playerList = game.playerList;

                        var i;
                        var len1 = playerList.length;
                        for (i = 0; i < len1; i++) {
                            var player = playerList[i];
                            
                            if (player.uid === '') {
                                player.uid = uid;
                                game.sound = Sound.JOIN;
                                break;
                            }
                        }
                    })(this);
                    break;
                case 'c':
                    (function (that) {
                        var playerList = that.game.playerList;

                        var i;
                        var len1 = playerList.length;
                        for (i = 0; i < len1; i++) {
                            var player = playerList[i];
                            
                            if (player.uid === uid) { player.uid = ''; }
                        }
                    })(this);
                    break;
                case 'd':
                    (function (that) {
                        var game = that.game;
                        var mt = that.mt;
                        var playerList = game.playerList;
                        
                        if (
                               playerList[0].uid !== ''
                            && playerList[1].uid !== ''
                            && playerList[2].uid !== ''
                        ) {
                            Game.start(game, mt);
                            Dice.clear(that.dice, mt);

                            var active = game.active;
                            
                            that.chat(
                                  '?'
                                , 'orange'
                                , '--「' + playerList[active].uid + '(' + COLOR_NAME[active] + ')」ターン--'
                            );
                            
                            that.isPlaying = true;
                            game.sound = Sound.OPENING;
                        }
                    })(this);
                    break;
            }
        } else {
            if (Game.hasPriorityUid(this.game, uid)) {
                switch (message[0]) {
                    case 'e':
                        (function (that) {
                            var game = that.game;
                            
                            switch (game.phase) {
                                case Phase.BUILD_ROAD:
                                case Phase.BUILD_SETTLEMENT:
                                case Phase.BUILD_CITY:
                                case Phase.DOMESTIC_TRADE1:
                                case Phase.INTERNATIONAL_TRADE:
                                    game.phase = Phase.MAIN;
                                    break;
                            }
                        })(this);
                        break;
                    case 'f':
                        (function (that) {
                            var game = that.game;
                            
                            if (game.phase === Phase.SETUP_SETTLEMENT1) {
                                that.chat('?', 'deeppink', '家を配置しました。');
                                
                                var index = parseInt(that.split(message)[0]);
                                Game.buildSettlement(game, index);
                                
                                game.phase = Phase.SETUP_ROAD1;
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'g':
                        (function (that) {
                            var game = that.game;
                            
                            if (game.phase === Phase.SETUP_ROAD1) {
                                that.chat('?', 'deeppink', '道を配置しました。');
                                
                                var index = that.split(message)[0];
                                Game.buildRoad(game, index);
                                
                                if (game.active === game.playerSize - 1) {
                                    game.phase = Phase.SETUP_SETTLEMENT2;
                                } else {
                                    var active = game.active = ++game.active;
                                    
                                    var priority = game.priority;
                                    priority.length = 0;
                                    priority.push(active);
                                    
                                    that.chat(
                                          '?'
                                        , 'orange'
                                        , '--「' + game.playerList[active].uid + '(' + COLOR_NAME[active] + ')」ターン--'
                                    );
                                    
                                    game.phase = Phase.SETUP_SETTLEMENT1;
                                }

                                game.sound = Sound.PASS;
                            }
                        })(this);
                        break;
                    case 'h':
                        (function (that) {
                            var game = that.game;
                            
                            if (game.phase === Phase.SETUP_SETTLEMENT2) {
                                that.chat('?', 'deeppink', '家を配置しました。');
                                
                                var active = game.active;
                                var index = parseInt(that.split(message)[0]);
                                var secondSettlement = game.playerList[active].secondSettlement = parseInt(index);
                                
                                Game.buildSettlement(game, secondSettlement);
                                
                                var landList = game.landList;
                                
                                var i;
                                var len1 = LAND_LINK.length;
                                for (i = 0; i < len1; i++) {
                                    if (landList[i] !== Land.DESERT) {
                                        var j;
                                        var len2 = LAND_LINK[i].length;
                                        for (j = 0; j < len2; j++) {
                                            if (LAND_LINK[i][j] === secondSettlement) {
                                                Game.gainResource(game, active, landList[i], 1);
                                            }
                                        }
                                    }
                                }
                                
                                game.phase = Phase.SETUP_ROAD2;
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'i':
                        (function (that) {
                            var game = that.game;
                            
                            if (game.phase === Phase.SETUP_ROAD2) {
                                that.chat('?', 'deeppink', '道を配置しました。');
                                
                                var index = that.split(message)[0];
                                Game.buildRoad(game, index);
                                
                                var active = game.active;
                                if (active === 0) {
                                    game.phase = Phase.DICE;
                                    game.sound = Sound.BUILD;
                                } else {
                                    active = --game.active;
                                    
                                    var priority = game.priority;
                                    priority.length = 0;
                                    priority.push(active);
                                    
                                    that.chat(
                                          '?'
                                        , 'orange'
                                        , '--「' + game.playerList[active].uid + '(' + COLOR_NAME[active] + ')」ターン--'
                                    );
                                    
                                    game.phase = Phase.SETUP_SETTLEMENT2;
                                    game.sound = Sound.PASS;
                                }
                            }
                        })(this);
                        break;
                    case 'j':
                        this.diceRoll();
                        break;
                    case 'k':
                        (function (that) {
                            var game = that.game;
                            var param = that.split(message);
                            var color = parseInt(param[0]);
                            var type = param[1];
                            var player = game.playerList[color];
                            
                            if (
                                   game.phase === Phase.BURST
                                && player.burst > 0
                                && player.resource[type] > 0
                                && player.uid === uid
                            ) {
                                that.chat(
                                      '?'
                                    , FONT_COLOR[color]
                                    , player.uid + '(' + COLOR_NAME[color] + ')「' + RESOURCE_NAME[type] + '」廃棄'
                                );
                                
                                Game.loseResource(game, color, type, 1);
                                player.burst--;
                                
                                if (player.burst === 0) {
                                    var priority = game.priority;

                                    var i;
                                    var len1 = priority.length;
                                    for (i = 0; i < len1; i++) {
                                        if (priority[i] === color) { priority.splice(i, 1); }
                                    }
                                    
                                    if (priority.length === 0) {
                                        priority.push(game.active);
                                        game.phase = Phase.ROBBER1;
                                    }
                                }
                            }
                        })(this);
                        break;
                    case 'l':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.ROBBER1) {
                                that.chat('?', 'deeppink', '盗賊を移動しました。');

                                var robber = game.robber =parseInt(that.split(message)[0]);
                                var settlementList = game.settlementList;
                                var playerList = game.playerList;
                                var active = game.active;
                                var canPillage = false;

                                var i;
                                var len1 = LAND_LINK[robber].length;
                                for (i = 0; !canPillage && i < len1; i++) {
                                    var settlement = settlementList[LAND_LINK[robber][i]];
                                    var rank = settlement & 0xff00;
                                    var color = settlement & 0x00ff;
                                    
                                    if (rank !== SettlementRank.NONE && color !== active) {
                                        var resource = playerList[color].resource;
                                        
                                        if (
                                              resource[Resource.BRICK]
                                            + resource[Resource.WOOL]
                                            + resource[Resource.ORE]
                                            + resource[Resource.GRAIN]
                                            + resource[Resource.LUMBER]
                                            > 0
                                        ) {
                                            canPillage = true;
                                        }
                                    }
                                }
                                
                                if (canPillage) {
                                    game.phase = Phase.ROBBER2;
                                } else {
                                    game.phase = Phase.MAIN;
                                }

                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'm':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.ROBBER2) {
                                var loseColor = that.split(message)[0];
                                var losePlayer = game.playerList[loseColor];

                                that.chat(
                                      '?'
                                    , FONT_COLOR[loseColor]
                                    , '資源の略奪「' + losePlayer.uid + '(' + COLOR_NAME[loseColor] + ')」'
                                );

                                var loseResource = losePlayer.resource;
                                var tmp = [];

                                var i;
                                var len1 = loseResource.length;
                                for (i = 0; i < len1; i++) {
                                    var j;
                                    var len2 = loseResource[i];
                                    for (j = 0; j < len2; j++) { tmp.push(i); }
                                }

                                i = tmp[that.mt.nextInt(0, tmp.length - 1)];
                                
                                loseResource[i]--;
                                game.playerList[game.active].resource[i]++;
                                
                                game.phase = Phase.MAIN;
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'n':
                        if (this.game.phase === Phase.MAIN) { this.game.phase = Phase.BUILD_ROAD; }
                        break;
                    case 'o':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.BUILD_ROAD) {
                                that.chat('?', 'deeppink', '道を配置しました。');

                                var active = game.active;

                                Game.loseResource(game, active, Resource.BRICK, 1);
                                Game.loseResource(game, active, Resource.LUMBER, 1);

                                var index = that.split(message)[0];
                                Game.buildRoad(game, index);
                                
                                game.phase = Phase.MAIN;

                                var i = Game.longestRoad(game);

                                if (i !== Index.NONE) {
                                    that.chat(
                                        '?'
                                      , FONT_COLOR[i]
                                      , '**' + game.playerList[i].uid + '(' + COLOR_NAME[i] + ')が道賞を獲得しました**'
                                    );
                                    
                                    game.sound = Sound.GET;
                                } else {
                                    game.sound = Sound.BUILD;
                                }
                            }
                        })(this);
                        break;
                    case 'p':
                        if (this.game.phase === Phase.MAIN) { this.game.phase = Phase.BUILD_SETTLEMENT; }
                        break;
                    case 'q':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.BUILD_SETTLEMENT) {
                                that.chat('?', 'deeppink', '家を配置しました。');

                                var active = game.active;

                                Game.loseResource(game, active, Resource.BRICK, 1);
                                Game.loseResource(game, active, Resource.WOOL, 1);
                                Game.loseResource(game, active, Resource.GRAIN, 1);
                                Game.loseResource(game, active, Resource.LUMBER, 1);

                                var index = parseInt(that.split(message)[0]);
                                Game.buildSettlement(game, index);
                                
                                game.phase = Phase.MAIN;
                                
                                var i = Game.longestRoad(game);
                                
                                if (i !== Index.NONE) {
                                    that.chat(
                                        '?'
                                      , FONT_COLOR[i]
                                      , '**' + game.playerList[i].uid + '(' + COLOR_NAME[i] + ')が道賞を獲得しました**'
                                    );
                                    
                                    game.sound = Sound.GET;
                                } else {
                                    game.sound = Sound.BUILD;
                                }
                            }
                        })(this);
                        break;
                    case 'r':
                        if (this.game.phase === Phase.MAIN) { this.game.phase = Phase.BUILD_CITY; }
                        break;
                    case 's':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.BUILD_CITY) {
                                that.chat('?', 'deeppink', '街を配置しました。');

                                var active = game.active;

                                Game.loseResource(game, active, Resource.ORE, 3);
                                Game.loseResource(game, active, Resource.GRAIN, 2);

                                var index = that.split(message)[0];
                                Game.buildCity(game, index);
                                
                                game.phase = Phase.MAIN;
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 't':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.MAIN) {
                                that.chat('?', 'deeppink', 'カードを引きました。');

                                var active = game.active;
                                var activePlayer = game.playerList[active];

                                Game.loseResource(game, active, Resource.WOOL, 1);
                                Game.loseResource(game, active, Resource.ORE, 1);
                                Game.loseResource(game, active, Resource.GRAIN, 1);

                                var i = game.cardStock.shift();

                                activePlayer.sleepCard[i]++;
                                if (i === Card.VICTORY_POINT) {
                                    activePlayer.bonusScore++;
                                }

                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'u':
                        if (this.game.phase === Phase.MAIN) { this.game.phase = Phase.DOMESTIC_TRADE1; }
                        break;
                    case 'v':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DOMESTIC_TRADE1) {
                                var param = that.split(message);
                                var playerList = game.playerList;
                                var trade = game.trade;
                                var playerIndex = trade.playerIndex = parseInt(param[0]);

                                that.chat(
                                      '?'
                                    , FONT_COLOR[playerIndex]
                                    , '国内貿易を申し込みました「'
                                      + playerList[playerIndex].uid
                                      + '(' + COLOR_NAME[playerIndex] + ')」'
                                );

                                var tmp = '';
                                var inputSum = 0;

                                var i;
                                for (i = 1; i < 6; i++) {
                                    if (param[i] !== '0') { tmp += '「' + RESOURCE_NAME[i - 1] + ':' + param[i] + '」'; }
                                    inputSum += trade.input[i - 1] = parseInt(param[i]);
                                }
                                
                                if (tmp === '') {
                                    that.chat('?', 'deeppink', '国内貿易(出)「なし」');
                                } else {
                                    that.chat('?', 'deeppink', '国内貿易(出)' + tmp);
                                }

                                tmp = '';
                                var outputSum = 0;
                                
                                for (i = 6; i < 11; i++) {
                                    if (param[i] !== '0') { tmp += '「' + RESOURCE_NAME[i - 6] + ':' + param[i] + '」'; }
                                    outputSum += trade.output[i - 6] = parseInt(param[i]);
                                }
                                
                                if (tmp === '') {
                                    that.chat('?', 'deeppink', '国内貿易(求)「なし」');
                                } else {
                                    that.chat('?', 'deeppink', '国内貿易(求)' + tmp);
                                }

                                if (inputSum === 0 || outputSum === 0) {
                                    that.chat('?', 'deeppink', 'お互いに最低1枚の資源が必要です。');

                                    game.phase = Phase.MAIN;
                                } else {
                                    var isNegotiation = false;

                                    for (i = 0; !isNegotiation && i < 5; i++) {
                                        if (trade.input[i] > 0 && trade.output[i] > 0) { isNegotiation = true; }
                                    }

                                    if (isNegotiation) {
                                        that.chat('?', 'deeppink', '偽装譲渡はできません。');
                                        game.phase = Phase.MAIN;
                                    } else {
                                        var priority = game.priority;
                                        priority.length = 0;
                                        priority.push(playerIndex);

                                        game.phase = Phase.DOMESTIC_TRADE2;
                                    }
                                }
                            }
                        })(this);
                        break;
                    case 'w':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DOMESTIC_TRADE2) {
                                var trade = game.trade;
                                var output = trade.output;
                                var tradeResource = game.playerList[trade.playerIndex].resource;

                                if (
                                       tradeResource[Resource.BRICK] >= output[Resource.BRICK]
                                    && tradeResource[Resource.WOOL] >= output[Resource.WOOL]
                                    && tradeResource[Resource.ORE] >= output[Resource.ORE]
                                    && tradeResource[Resource.GRAIN] >= output[Resource.GRAIN]
                                    && tradeResource[Resource.LUMBER] >= output[Resource.LUMBER]
                                ) {
                                    var active = game.active;
                                    var activeResource = game.playerList[active].resource;
                                    var input = trade.input;

                                    var i;
                                    for (i = 0; i < 5; i++) {
                                        activeResource[i] -= input[i];
                                        activeResource[i] += output[i];
                                        tradeResource[i] += input[i];
                                        tradeResource[i] -= output[i];
                                    }
                                    
                                    that.chat('?', 'deeppink', '交換しました。');
                                } else {
                                    that.chat('?', 'deeppink', '資源が足りませんでした。');
                                }

                                var priority = game.priority;
                                priority.length = 0;
                                priority.push(active);
                                that.game.phase = Phase.MAIN;
                            }
                        })(this);
                        break;
                    case 'x':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DOMESTIC_TRADE2) {
                                that.chat('?', 'deeppink', '拒否されました。');

                                var active = game.active;
                                var priority = game.priority;
                                priority.length = 0;
                                priority.push(active);

                                that.game.phase = Phase.MAIN;
                            }
                        })(this);
                        break;
                    case 'y':
                        if (this.game.phase === Phase.MAIN) { this.game.phase = Phase.INTERNATIONAL_TRADE; }
                        break;
                    case 'z':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.INTERNATIONAL_TRADE) {
                                that.chat('?', 'deeppink', '海外貿易を申し込みました。');

                                var param = that.split(message);
                                var active = game.active;

                                var tmp = '海外貿易(出)';

                                var i;
                                for (i = 0; i < 5; i++) {
                                    if (param[i] !== '0') {
                                        tmp += '「' + RESOURCE_NAME[i] + ':' + param[i] + '」';
                                        Game.loseResource(game, active, i, parseInt(param[i]));
                                    }
                                }
                                
                                that.chat('?', 'deeppink', tmp);

                                var tmp = '海外貿易(求)';

                                for (i = 5; i < 10; i++) {
                                    if (param[i] !== '0') {
                                        tmp += '「' + RESOURCE_NAME[i - 5] + ':' + param[i] + '」';
                                        Game.gainResource(game, active, i - 5, parseInt(param[i]));
                                    }
                                }
                                
                                that.chat('?', 'deeppink', tmp);

                                that.chat('?', 'deeppink', '交換しました。');
                                
                                that.game.phase = Phase.MAIN;
                            }
                        })(this);
                        break;
                    case 'A':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DICE || game.phase === Phase.MAIN) {
                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , '++勝利 おめでとう++'
                                );

                                var active = game.active;
                                var playerList = game.playerList;
                                var activePlayer = playerList[active];

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , activePlayer.uid + '(' + COLOR_NAME[active] + ')'
                                );

                                var i;
                                for (i = 0; i < game.playerSize; i++) { playerList[i].uid = ''; }
                                
                                game.playerSize = 4;
                                game.state = State.READY;
                                game.isPlaying = false;

                                game.sound = Sound.ENDING;
                            }
                        })(this);
                        break;
                    case 'B':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.MAIN) {
                                var active = game.active;
                                var playerList = game.playerList;
                                var activePlayer = playerList[active];
                                var wakeCard = activePlayer.wakeCard;
                                var sleepCard = activePlayer.sleepCard;

                                var i;
                                for (i = 0; i < 5; i++) {
                                    wakeCard[i] += sleepCard[i];
                                    sleepCard[i] = 0;
                                }
                                
                                game.canPlayCard = true;
                                game.dice1 = game.dice2 = Index.NONE;
                                active = game.active = (active + 1) % game.playerSize;

                                var priority = game.priority;
                                priority.length = 0;
                                priority.push(game.active);
                                
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + playerList[active].uid + '(' + COLOR_NAME[active] + ')」ターン--'
                                );

                                game.phase = Phase.DICE;
                                game.sound = Sound.PASS;
                            }
                        })(this);
                        break;
                    case 'C':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DICE || game.phase === Phase.MAIN) {
                                that.chat('?', 'deeppink', 'カード「騎士」');

                                var active = game.active;
                                var activePlayer = game.playerList[active];

                                activePlayer.wakeCard[Card.SOLDIER]--;
                                activePlayer.deadCard[Card.SOLDIER]++;
                                
                                game.canPlayCard = false;

                                game.phase = Phase.SOLDIER1;

                                var i = Game.largestArmy(game);

                                if (i !== Index.NONE) {
                                    that.chat(
                                        '?'
                                        , FONT_COLOR[i]
                                        , '**' + game.playerList[i].uid + '(' + COLOR_NAME[i] + ')が騎士賞を獲得しました**'
                                    );

                                    game.sound = Sound.GET;
                                } else {
                                    game.sound = Sound.BUILD;
                                }
                            }
                        })(this);
                        break;
                    case 'D':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.SOLDIER1) {
                                that.chat('?', 'deeppink', '盗賊を移動しました。');

                                var playerList = game.playerList;
                                var settlementList = game.settlementList;
                                var robber = game.robber = parseInt(that.split(message)[0]);
                                var canPillage = false;

                                var i;
                                var len1 = LAND_LINK[robber].length;
                                for (i = 0; !canPillage && i < len1; i++) {
                                    var settlement = settlementList[LAND_LINK[robber][i]];
                                    var rank = settlement & 0xff00;
                                    var color = settlement & 0x00ff;
                                    
                                    if (rank !== SettlementRank.NONE && color !== game.active) {
                                        var resource = playerList[color].resource;
                                        
                                        if (
                                              resource[Resource.BRICK]
                                            + resource[Resource.WOOL]
                                            + resource[Resource.ORE]
                                            + resource[Resource.GRAIN]
                                            + resource[Resource.LUMBER]
                                            > 0
                                        ) {
                                            canPillage = true;
                                        }
                                    }
                                }
                                
                                if (canPillage) {
                                    game.phase = Phase.SOLDIER2;
                                } else {
                                    if (game.dice1 === Index.NONE) {
                                        game.phase = Phase.DICE;
                                    } else {
                                        game.phase = Phase.MAIN;
                                    }
                                }
                                
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'E':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.SOLDIER2) {
                                var loseColor = that.split(message)[0];
                                var losePlayer = game.playerList[loseColor];

                                that.chat(
                                      '?'
                                    , FONT_COLOR[loseColor]
                                    , '資源の略奪「' + losePlayer.uid + '(' + COLOR_NAME[loseColor] + ')」'
                                );

                                var loseResource = losePlayer.resource;
                                var tmp = [];

                                var i;
                                var len1 = loseResource.length;
                                for (i = 0; i < len1; i++) {
                                    var j;
                                    var len2 = loseResource[i];
                                    for (j = 0; j < len2; j++) { tmp.push(i); }
                                }
                                
                                i = tmp[that.mt.nextInt(0, tmp.length - 1)];

                                loseResource[i]--;
                                game.playerList[game.active].resource[i]++;
                                
                                if (game.dice1 === Index.NONE) {
                                    game.phase = Phase.DICE;
                                } else {
                                    game.phase = Phase.MAIN;
                                }

                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'F':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DICE || game.phase === Phase.MAIN) {
                                that.chat('?', 'deeppink', 'カード「街道」');

                                var activePlayer = game.playerList[game.active];

                                activePlayer.wakeCard[Card.ROAD_BUILDING]--;
                                activePlayer.deadCard[Card.ROAD_BUILDING]++;
                                
                                game.canPlayCard = false;
                                
                                if (activePlayer.roadStock > 0 && Game.hasCanBuildRoad(game)) {
                                    game.phase = Phase.ROAD_BUILDING1;
                                } else {
                                    if (game.dice1 === Index.NONE) {
                                        game.phase = Phase.DICE;
                                    } else {
                                        game.phase = Phase.MAIN;
                                    }
                                }

                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'G':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.ROAD_BUILDING1) {
                                that.chat('?', 'deeppink', '道を配置しました。');

                                var index = that.split(message)[0];
                                Game.buildRoad(game, index);
                                
                                if (game.playerList[game.active].roadStock > 0 && Game.hasCanBuildRoad(game)) {
                                    game.phase = Phase.ROAD_BUILDING2;
                                } else {
                                    if (game.dice1 === Index.NONE) {
                                        game.phase = Phase.DICE;
                                    } else {
                                        game.phase = Phase.MAIN;
                                    }
                                }

                                var i = Game.longestRoad(game);
                                
                                if (i !== Index.NONE) {
                                    that.chat(
                                        '?'
                                      , FONT_COLOR[i]
                                      , '**' + game.playerList[i].uid + '(' + COLOR_NAME[i] + ')が道賞を獲得しました**'
                                    );
                                    
                                    game.sound = Sound.GET;
                                } else {
                                    game.sound = Sound.BUILD;
                                }
                            }
                        })(this);
                        break;
                    case 'H':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.ROAD_BUILDING2) {
                                that.chat('?', 'deeppink', '道を配置しました。');

                                var index = that.split(message)[0];
                                Game.buildRoad(game, index);

                                if (game.dice1 === Index.NONE) {
                                    game.phase = Phase.DICE;
                                } else {
                                    game.phase = Phase.MAIN;
                                }
                                
                                var i = Game.longestRoad(game);
                                
                                if (i !== Index.NONE) {
                                    that.chat(
                                        '?'
                                      , FONT_COLOR[i]
                                      , '**' + game.playerList[i].uid + '(' + COLOR_NAME[i] + ')が道賞を獲得しました**'
                                    );
                                    
                                    game.sound = Sound.GET;
                                } else {
                                    game.sound = Sound.BUILD;
                                }
                            }
                        })(this);
                        break;
                    case 'I':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DICE || game.phase === Phase.MAIN) {
                                that.chat('?', 'deeppink', 'カード「収穫」');

                                var activePlayer = game.playerList[game.active];

                                activePlayer.wakeCard[Card.YEAR_OF_PLENTY]--;
                                activePlayer.deadCard[Card.YEAR_OF_PLENTY]++;

                                game.canPlayCard = false;

                                var resourceStock = game.resourceStock;

                                if (
                                      resourceStock[Resource.BRICK]
                                    + resourceStock[Resource.WOOL]
                                    + resourceStock[Resource.ORE]
                                    + resourceStock[Resource.GRAIN]
                                    + resourceStock[Resource.LUMBER]
                                    > 0
                                ) {
                                    game.phase = Phase.YEAR_OF_PLENTY1;
                                } else {
                                    that.chat('?', 'deeppink', '資源不足のため収穫失敗。');

                                    if (game.dice1 === Index.NONE) {
                                        game.phase = Phase.DICE;
                                    } else {
                                        game.phase = Phase.MAIN;
                                    }
                                }

                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'J':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.YEAR_OF_PLENTY1) {
                                var type = that.split(message)[0];

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , '「' + RESOURCE_NAME[type] + '」を収穫しました。'
                                );

                                var resourceStock = game.resourceStock;
                                resourceStock[type]--;
                                game.playerList[game.active].resource[type]++;
                                
                                if (
                                      resourceStock[Resource.BRICK]
                                    + resourceStock[Resource.WOOL]
                                    + resourceStock[Resource.ORE]
                                    + resourceStock[Resource.GRAIN]
                                    + resourceStock[Resource.LUMBER]
                                    > 0
                                ) {
                                    game.phase = Phase.YEAR_OF_PLENTY2;
                                } else {
                                    if (game.dice1 === Index.NONE) {
                                        game.phase = Phase.DICE;
                                    } else {
                                        game.phase = Phase.MAIN;
                                    }
                                }
                                
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'K':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.YEAR_OF_PLENTY2) {
                                var type = that.split(message)[0];

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , '「' + RESOURCE_NAME[type] + '」を収穫しました。'
                                );

                                game.resourceStock[type]--;
                                game.playerList[game.active].resource[type]++;

                                if (game.dice1 === Index.NONE) {
                                    game.phase = Phase.DICE;
                                } else {
                                    game.phase = Phase.MAIN;
                                }

                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'L':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.DICE || game.phase === Phase.MAIN) {
                                that.chat('?', 'deeppink', 'カード「独占」');

                                var activePlayer = game.playerList[game.active];
                                activePlayer.wakeCard[Card.MONOPOLY]--;
                                activePlayer.deadCard[Card.MONOPOLY]++;
                                
                                game.canPlayCard = false;

                                game.phase = Phase.MONOPOLY;
                                game.sound = Sound.BUILD;
                            }
                        })(this);
                        break;
                    case 'M':
                        (function (that) {
                            var game = that.game;

                            if(game.phase === Phase.MONOPOLY) {
                                var type = that.split(message)[0];

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , '「' + RESOURCE_NAME[type] + '」を独占しました。'
                                );

                                var active = game.active;
                                var playerList = game.playerList;
                                var activeResource = playerList[active].resource;
                                var playerSize = game.playerSize;

                                var i;
                                for (i = 0; i < playerSize; i++) {
                                    if(i !== active) {
                                        var loseResource = playerList[i].resource;

                                        activeResource[type] += loseResource[type];
                                        loseResource[type] = 0;
                                    }
                                }

                                if (game.dice1 === Index.NONE) {
                                    game.phase = Phase.DICE;
                                } else {
                                    game.phase = Phase.MAIN;
                                }

                                game.sound = Sound.ROBBER;
                            }
                        })(this);
                        break;
                }
            }
        }
        
        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

Cataso.prototype.diceRoll = function () {
    var game = this.game;

    if (game.phase === Phase.DICE) {
        var dice = this.dice;;

        Dice.roll(dice);

        game.dice1 = dice.first;
        game.dice2 = dice.seccond;
        
        var dice = game.dice1 + game.dice2;
        
        this.chat(
              '?'
            , 'deeppink'
            , 'ダイス「' + dice + '」'
        );

        var i;
        var len1;
        if (dice === 7) {
            var playerSize = game.playerSize;

            var playerList = game.playerList;
            var isBurst = false;

            for (i = 0; i < playerSize; i++) {
                var player = playerList[i];
                var resource = player.resource;

                var sum = resource[Resource.BRICK]
                        + resource[Resource.WOOL]
                        + resource[Resource.ORE]
                        + resource[Resource.GRAIN]
                        + resource[Resource.LUMBER];

                if (sum > 7) {
                    isBurst = true;
                    player.burst = Math.floor(sum / 2);
                } else {
                    player.burst = 0;
                }
            }
            
            if (isBurst) {
                var priority = game.priority;
                priority.length = 0;

                len1 = playerList.length;
                for (i = 0; i < len1; i++) {
                    if (playerList[i].burst > 0) { priority.push(i); }
                }

                this.chat(
                      '?'
                    , 'deeppink'
                    , '**バースト発生**'
                );
                
                game.phase = Phase.BURST;
            } else {
                game.phase = Phase.ROBBER1;
            }
            
            game.sound = Sound.ROBBER;
        } else {
            var numberList = game.numberList;
            var settlementList = game.settlementList;
            var landList = game.landList;

            var pool = [0, 0, 0, 0, 0];
            var rank;
            var color;

            var j;
            var len2;

            len1 = numberList.length;
            for (i = 0; i < len1; i++) {
                if (i !== game.robber && numberList[i] === dice) {
                    len2 = LAND_LINK[i].length;
                    for (j = 0; j < len2; j++) {
                        rank = settlementList[LAND_LINK[i][j]] & 0xff00;
                        color = settlementList[LAND_LINK[i][j]] & 0x00ff;
                        
                        if (rank !== SettlementRank.NONE) {
                            if (rank === SettlementRank.SETTLEMENT) {
                                pool[landList[i]]++;
                            } else {
                                pool[landList[i]] += 2;
                            }
                        }
                    }
                }
            }

            var resourceStock = game.resourceStock;

            for (i = 0; i < 5; i++) {
                if (resourceStock[i] - pool[i] < 0) {
                    pool[i] = -1;
                    
                    this.chat(
                          '?'
                        , 'deeppink'
                        , '「' + RESOURCE_NAME[i] + '」不足のため生産に失敗'
                    );
                }
            }

            len1 = numberList.length;
            for (i = 0; i < len1; i++) {
                if (i !== game.robber && numberList[i] === dice) {
                    len2 = LAND_LINK[i].length;
                    for (j = 0; j < len2; j++) {
                        rank = settlementList[LAND_LINK[i][j]] & 0xff00;
                        color = settlementList[LAND_LINK[i][j]] & 0x00ff;
                        
                        if (
                               rank !== SettlementRank.NONE
                            && pool[landList[i]] !== -1
                        ) {
                            if (rank === SettlementRank.SETTLEMENT) {
                                Game.gainResource(game, color, landList[i], 1);
                            } else {
                                Game.gainResource(game, color, landList[i], 2);
                            }
                        }
                    }
                }
            }
            
            game.phase = Phase.MAIN;
            game.sound = Sound.DICE;
        }
    }
}

module.exports = Cataso;