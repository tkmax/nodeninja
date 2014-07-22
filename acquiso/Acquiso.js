var Room = require('../Room');
var MersenneTwister = require('../MersenneTwister');
var Game = require('./Game');
var Const = require('./Const');
var State = Const.State;
var Phase = Const.Phase;
var Sound = Const.Sound;
var FONT_COLOR = Const.FONT_COLOR;
var COLOR_NAME = Const.COLOR_NAME;
var HOTEL_CHAIN_NAME = Const.HOTEL_CHAIN_NAME;
var TILE_NAME = Const.TILE_NAME;
var Position = Const.Position;
var Rotation = Const.Rotation;

var Acquiso = function () {
    this.initialize('a');

    this.game = new Game();
    this.mt = new MersenneTwister();

    Game.clear(this.game);
}

Acquiso.prototype = new Room();

Acquiso.prototype.split = function (source) {
    return source.slice(1).split(' ');
}

Acquiso.prototype.reset = function () {
    this.isPlaying = false;

    Game.clear(this.game);

    this.broadcast(JSON.stringify(this.game));
}

Acquiso.prototype.onChat = function (user, message) {
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

Acquiso.prototype.chatMergeHotelChain = function () {
    var game = this.game;
    var hotelChain = game.hotelChain;
    var hotelChainSize = hotelChain.length;

    var i;
    for (i = 0; i < hotelChainSize; i++) {
        if (hotelChain[i].isParent) {
            this.chat(
                  '?'
                , 'deeppink'
                , '(親)「' + HOTEL_CHAIN_NAME[i] + '」合併'
            );
        }
    }

    var playerList = game.playerList;

    for (i = 0; i < hotelChainSize; i++) {
        if (hotelChain[i].isSubsidiary) {
            this.chat(
                  '?'
                , 'deeppink'
                , '「' + HOTEL_CHAIN_NAME[i] + '」吸収'
            );

            if (hotelChain[i].majority.length > 0) {
                var majority = hotelChain[i].majority;
                var minority = hotelChain[i].minority;
                var majorityBonus = Game.MajorityBonus(game, i);
                var minorityBonus = Game.MinorityBonus(game, i);

                var j;
                var len1;

                if (majority.length === 1) {
                    if (minority.length === 0) { majorityBonus += minorityBonus; }

                    this.chat(
                          '?'
                        , FONT_COLOR[majority[0]]
                        , '筆頭株主「' + playerList[majority[0]].uid
                          + '(' + COLOR_NAME[majority[0]] + ')」'
                          + '$' + majorityBonus
                    );

                    if (minority.length > 0) {
                        minorityBonus = Math.floor(minorityBonus / minority.length / 100) * 100;

                        len1 = minority.length;
                        for (j = 0; j < len1; j++) {
                            this.chat(
                                  '?'
                                , FONT_COLOR[minority[j]]
                                , '次席株主「' + playerList[minority[j]].uid
                                  + '(' + COLOR_NAME[minority[j]] + ')」'
                                  + '$' + minorityBonus
                            );
                        }
                    }
                } else {
                    majorityBonus = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                    for (j = 0; j < majority.length; j++) {
                        this.chat(
                              '?'
                            , FONT_COLOR[majority[j]]
                            , '筆頭株主「' + this.game.playerList[majority[j]].uid
                              + '(' + COLOR_NAME[majority[j]] + ')」'
                              + '$' + majorityBonus
                        );
                    }
                }
            }
        }
    }
}

Acquiso.prototype.chatSettle = function () {
    var game = this.game;
    var playerList = game.playerList;
    var hotelChain = game.hotelChain;

    var i;
    var len1 = hotelChain.length;
    for (i = 0; i < len1; i++) {
        var j;
        var len2;

        if (hotelChain[i].position !== Position.NONE) {
            this.chat(
                  '?'
                , 'deeppink'
                , '--「' + HOTEL_CHAIN_NAME[i] + '」配当--'
            );

            if (hotelChain[i].majority.length > 0) {
                var majority = hotelChain[i].majority;
                var minority = hotelChain[i].minority;
                var majorityBonus = Game.MajorityBonus(game, i);
                var minorityBonus = Game.MinorityBonus(game, i);

                if (majority.length === 1) {
                    if (minority.length === 0) { majorityBonus += minorityBonus; }

                    this.chat(
                          '?'
                        , FONT_COLOR[majority[0]]
                        , '筆頭株主「' + playerList[majority[0]].uid
                          + '(' + COLOR_NAME[majority[0]] + ')」'
                          + '$' + majorityBonus
                    );

                    if (minority.length > 0) {
                        minorityBonus = Math.floor(minorityBonus / minority.length / 100) * 100;

                        len2 = minority.length;
                        for (j = 0; j < len2; j++) {
                            this.chat(
                                  '?'
                                , FONT_COLOR[minority[j]]
                                , '次席株主「' + playerList[minority[j]].uid
                                  + '(' + COLOR_NAME[minority[j]] + ')」'
                                  + '$' + minorityBonus
                            );
                        }
                    }
                } else {
                    majorityBonus = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                    len2 = majority.length;
                    for (j = 0; j < len2; j++) {
                        this.chat(
                              '?'
                            , FONT_COLOR[majority[j]]
                            , '筆頭株主「' + playerList[majority[j]].uid
                              + '(' + COLOR_NAME[majority[j]] + ')」'
                              + '$' + majorityBonus
                        );
                    }
                }
            }

            len2 = game.playerSize;
            for (j = 0; j < len2; j++) {
                var size = playerList[j].certificate[i];

                if (size > 0) {
                    this.chat(
                          '?'
                        , FONT_COLOR[j]
                        , '「' + playerList[j].uid
                          + '(' + COLOR_NAME[j] + ')」'
                          + size + '枚'
                          + ' $' + Game.StockPrice(this.game, i) * size
                    );
                }
            }
        }
    }
}

Acquiso.prototype.chatWinner = function () {
    var game = this.game;
    var playerList = game.playerList;
    var win = [];
    var max = 0;

    var i;
    var len1 = game.playerSize;
    for (i = 0; i < len1; i++) {
        if (playerList[i].money > max) {
            max = playerList[i].money;
            win.length = 0;
            win.push(i);
        } else if (this.game.playerList[i].money === max) {
            win.push(i);
        }
    }

    this.chat(
          '?'
        , 'orange'
        , '++勝利 おめでとう++'
    );

    len1 = win.length;
    for (i = 0; i < len1; i++) {
        this.chat(
              '?'
            , 'deeppink'
            , '「' + this.game.playerList[win[i]].uid
              + '(' + COLOR_NAME[win[i]] + ')」'
        );
    }
}

Acquiso.prototype.onMessage = function (uid, message) {
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
                            if (playerList[i].uid === '') {
                                game.sound = Sound.JOIN;
                                game.playerList[i].uid = uid;
                                break;
                            }
                        }
                    })(this);
                    break;
                case 'c':
                    (function (that) {
                        var game = that.game;
                        var playerList = game.playerList;

                        var i;
                        var len1 = playerList.length;
                        for (i = 0; i < len1; i++) {
                            if (playerList[i].uid === uid) { playerList[i].uid = ''; }
                        }
                    })(this);
                    break;
                case 'd':
                    (function (that) {
                        var game = that.game;
                        var playerList = game.playerList;

                        if (
                               playerList[0].uid !== ''
                            && playerList[1].uid !== ''
                            && playerList[2].uid !== ''
                        ) {
                            Game.start(game, that.mt);

                            var active = game.active;

                            that.chat(
                                  '?'
                                , 'orange'
                                , '--「' + playerList[active].uid
                                  + '(' + COLOR_NAME[active] + ')」ターン--'
                            );

                            that.isPlaying = true;
                            game.sound = Sound.OPENING;
                        }
                    })(this);
                    break;
            }
        } else {
            if (this.game.playerList[this.game.priority].uid === uid) {
                switch (message[0]) {
                    case 'e':
                        (function (that) {
                            var game = that.game;

                            if (
                                   game.phase === Phase.SELL
                                || game.phase === Phase.TRADE
                            ) {
                                game.phase = Phase.MERGE;
                            }
                        })(this);
                        break;
                    case 'f':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.PLAY) {
                                var priorityPlayer = game.playerList[game.priority];
                                var index = that.split(message)[0];

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , '「' + TILE_NAME[priorityPlayer.hand[index]] + '」を廃棄'
                                );

                                priorityPlayer.hand.splice(index, 1);

                                game.canTrash = false;
                                game.phase = Phase.PLAY;
                            }
                        })(this);
                        break;
                    case 'g':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.PLAY) {
                                var priorityPlayer = game.playerList[game.priority];
                                var index = that.split(message);
                                var justTile = game.justTile = priorityPlayer.hand.splice(index, 1)[0];

                                game.map[justTile].isCover = true;
                                that.chat('?', 'deeppink', '「' + TILE_NAME[justTile] + '」配置');

                                Game.nextPhase(game);

                                game.sound = Sound.GET;

                                switch (game.phase) {
                                    case Phase.ABSORB:
                                        if (Game.absorbUniqueHotelChain(game)) {
                                            game.sound = Sound.ROBBER;
                                            that.chatMergeHotelChain();
                                            Game.payBonus(game);
                                            game.phase = Phase.MERGE;
                                        }
                                        break;
                                    case Phase.BUY:
                                        Game.repaintHotelChain(game);
                                        game.sound = Sound.BUILD;
                                        break;
                                }
                            }
                        })(this);
                        break;
                    case 'h':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.PLAY) {
                                that.chat('?', 'deeppink', 'パス');
                                game.phase = Phase.BUY;
                            }
                        })(this);
                        break;
                    case 'i':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.CHAIN) {
                                var index = that.split(message)[0];
                                Game.playTile(game, index);

                                that.chat('?', 'deeppink', '「' + HOTEL_CHAIN_NAME[index] + '」設立');

                                Game.repaintHotelChain(that.game);

                                game.phase = Phase.BUY;
                                game.sound = Sound.DICE;
                            }
                        })(this);
                        break;
                    case 'j':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.ABSORB) {
                                var hotelChain = game.hotelChain;
                                var index = parseInt(that.split(message)[0]);

                                var i;
                                var len1 = hotelChain.length;
                                for (i = 0; i < len1; i++) {
                                    if (index !== i && hotelChain[i].isParent) {
                                        hotelChain[i].isParent = false;
                                        hotelChain[i].isSubsidiary = true;
                                    }
                                }

                                that.chatMergeHotelChain();
                                Game.payBonus(game);

                                game.phase = Phase.MERGE;
                                game.sound = Sound.ROBBER;
                            }
                        })(this);
                        break;
                    case 'k':
                        if (this.game.phase === Phase.MERGE) { this.game.phase = Phase.SELL; }
                        break;
                    case 'l':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.SELL) {
                                var param = that.split(message);

                                var i;
                                var len1 = param.length;
                                for (i = 0; i < len1; i++) {
                                    if (param[i] !== '0') {
                                        var size = parseInt(param[i]);

                                        that.chat(
                                              '?'
                                            , FONT_COLOR[that.game.priority]
                                            , '売却:「' + HOTEL_CHAIN_NAME[i] + '」' + size
                                              + '枚→$' + Game.StockPrice(game, i) * size
                                        );

                                        Game.sellCertificate(game, i, size);
                                    }
                                }

                                game.phase = Phase.MERGE;
                            }
                        })(this);
                        break;
                    case 'm':
                        if (this.game.phase === Phase.MERGE) { this.game.phase = Phase.TRADE; }
                        break;
                    case 'n':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.TRADE) {
                                var priority = game.priority;

                                that.chat(
                                      '?'
                                    , FONT_COLOR[priority]
                                    , '交換:'
                                );

                                var param = that.split(message);

                                var i;
                                for (i = 0; i < 7; i++) {
                                    if (param[i] !== '0') {
                                        that.chat(
                                              '?'
                                            , FONT_COLOR[priority]
                                            , '「' + HOTEL_CHAIN_NAME[i] + '」' + param[i] + '枚'
                                        );

                                        Game.loseCertificate(game, i, parseInt(param[i]));
                                    }
                                }

                                that.chat('?', FONT_COLOR[priority], '↓');

                                for (i = 7; i < 14; i++) {
                                    if (param[i] !== '0') {
                                        that.chat(
                                              '?'
                                            , FONT_COLOR[priority]
                                            , '「' + HOTEL_CHAIN_NAME[i - 7] + '」' + param[i] + '枚'
                                        );

                                        Game.gainCertificate(that.game, i - 7, parseInt(param[i]));
                                    }
                                }

                                game.phase = Phase.MERGE;
                            }
                        })(this);
                        break;
                    case 'o':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.MERGE) {
                                game.priority = (game.priority + 1) % game.playerSize;

                                if (game.priority === game.active) {
                                    var hotelChain = game.hotelChain;

                                    var i;
                                    var len1 = hotelChain.length;
                                    for (i = 0; i < len1; i++) {
                                        if (hotelChain[i].isSubsidiary) {
                                            hotelChain[i].isSubsidiary = false;
                                            hotelChain[i].position = Position.NONE;
                                            hotelChain[i].rotation = Rotation.NONE;
                                            hotelChain[i].size = 0;
                                        }
                                    }

                                    Game.repaintHotelChain(game);

                                    game.phase = Phase.BUY;
                                }

                                game.sound = Sound.PASS;
                            }
                        })(this);
                        break;
                    case 'p':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.BUY) {
                                var param = that.split(message);

                                var i;
                                var len1 = param.length;
                                for (i = 0; i < len1; i++) {
                                    if (param[i] !== '0') {
                                        var size = parseInt(param[i]);

                                        Game.buyCertificate(game, i, size);

                                        game.buyTicket -= size;

                                        that.chat(
                                              '?'
                                            , 'deeppink'
                                            , '購入:「' + HOTEL_CHAIN_NAME[i] + '」' + size + '枚'
                                        );
                                    }
                                }
                            }
                        })(this);
                        break;
                    case 'q':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.BUY) {
                                var active = game.active;

                                Game.drawTile(game, active);

                                active = game.active = (active + 1) % game.playerSize;

                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[active].uid
                                      + '(' + COLOR_NAME[active] + ')」ターン--'
                                );

                                game.priority = active;
                                game.buyTicket = 3;
                                game.canTrash = true;

                                game.phase = Phase.PLAY;
                                game.sound = Sound.PASS;
                            }
                        })(this);
                        break;
                    case 'r':
                        (function (that) {
                            var game = that.game;

                            if (game.phase === Phase.BUY) {
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--決済宣言--'
                                );

                                that.chatSettle();
                                Game.settle(game);
                                that.chatWinner();

                                var playerList = game.playerList;

                                var i;
                                var len1 = that.game.playerSize;
                                for (i = 0; i < len1; i++) { playerList[i].uid = ''; }

                                game.playerSize = 4;
                                that.isPlaying = false;

                                that.game.state = State.READY;
                                that.game.sound = Sound.ENDING;
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

module.exports = Acquiso;