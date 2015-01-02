var Room = require('../Room');
var MersenneTwister = require('../MersenneTwister');
var Game = require('./Game');
var Const = require('./Const');
var State = Const.State;
var Phase = Const.Phase;
var Sound = Const.Sound;
var Index = Const.Index;
var Tactics = Const.Tactics;
var FONT_COLOR = Const.FONT_COLOR;
var COLOR_NAME = Const.COLOR_NAME;

var BattleRaiso = function () {
    this.initialize('b');

    this.game = new Game();
    this.mt = new MersenneTwister();

    Game.clear(this.game);
}

BattleRaiso.prototype = new Room();

BattleRaiso.prototype.split = function (source) {
    return source.slice(1).split(' ');
}

BattleRaiso.prototype.reset = function () {
    this.isPlaying = false;

    Game.clear(this.game);

    this.broadcast(JSON.stringify(this.game));
}

BattleRaiso.prototype.onCommand = function (user, message) {
    this.basicCommand(user, message);
}

BattleRaiso.prototype.onChat = function (user, message) {
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

BattleRaiso.prototype.onMessage = function (uid, message) {
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

                            if (player.uid === uid) {
                                player.uid = '';
                            }
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
                        ) {
                            Game.start(game, mt);

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
            switch (message[0]) {
                case 'd':
                    (function (that) {
                        var game = that.game;

                        if (
                               game.phase === Phase.MAIN
                            || game.phase === Phase.COMMON
                            || game.phase === Phase.FOG
                            || game.phase === Phase.MUD
                            || game.phase === Phase.SCOUT1
                            || game.phase === Phase.REDEPLOY1
                            || game.phase === Phase.DESERTER
                            || game.phase === Phase.TRAITOR1
                        ) {
                            var index = parseInt(that.split(message)[0]);
                            that.chat('?', 'deeppink', '**' + (index + 1) + '列目 旗獲得**');

                            var active = game.active;
                            game.flagList[index] = active;

                            if (Game.isFinish(that.game)) {
                                var playerList = game.playerList;

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , '++勝利 おめでとう++'
                                );

                                that.chat(
                                      '?'
                                    , 'deeppink'
                                    , playerList[active].uid + "(" + COLOR_NAME[active] + ")"
                                );

                                playerList[0].uid = playerList[1].uid = '';
                                game.state = State.READY;
                                that.isPlaying = false;
                                game.sound = Sound.ENDING;
                            } else {
                                game.sound = Sound.GET;
                            }
                        }
                    })(this);
                    break;
                case 'e':
                    (function (that) {
                        var game = that.game;

                        if (
                               game.phase === Phase.MAIN
                            || game.phase === Phase.COMMON
                            || game.phase === Phase.FOG
                            || game.phase === Phase.MUD
                            || game.phase === Phase.SCOUT1
                            || game.phase === Phase.REDEPLOY1
                            || game.phase === Phase.DESERTER
                            || game.phase === Phase.TRAITOR1
                        ) {
                            game.playing = parseInt(that.split(message)[0]);

                            switch (game.playerList[game.active].hand[game.playing]) {
                                case Tactics.FOG:
                                    game.phase = Phase.FOG;
                                    break;
                                case Tactics.MUD:
                                    game.phase = Phase.MUD;
                                    break;
                                case Tactics.SCOUT:
                                    game.phase = Phase.SCOUT1;
                                    break;
                                case Tactics.REDEPLOY:
                                    game.phase = Phase.REDEPLOY1;
                                    break;
                                case Tactics.DESERTER:
                                    game.phase = Phase.DESERTER;
                                    break;
                                case Tactics.TRAITOR:
                                    game.phase = Phase.TRAITOR1;
                                    break;
                                default:
                                    game.phase = Phase.COMMON;
                                    break;
                            }
                        }
                    })(this);
                    break;
                case 'f':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.COMMON) {
                            var active = game.active;
                            var activePlayer = game.playerList[active];
                            var playing = game.playing;
                            var index = parseInt(that.split(message)[0]);
                            var activeHand = activePlayer.hand;
                            var playingCard = activeHand[playing];

                            activePlayer.field[index].push(playingCard);

                            var before = game.before;

                            before.idx = active;
                            before.x = activePlayer.field[index].length - 1;
                            before.y = index;

                            switch (playingCard)
                            {
                                case Tactics.ALEXANDER:
                                case Tactics.DARIUS:
                                    that.chat(
                                          '?'
                                        , 'deeppink'
                                        , '隊長をプレイしました。'
                                    );
                                    break;
                                case Tactics.COMPANION:
                                    that.chat(
                                          '?'
                                        , 'deeppink'
                                        , '援軍をプレイしました。'
                                    );
                                    break;
                                case Tactics.SHIELD:
                                    that.chat(
                                          '?'
                                        , 'deeppink'
                                        , '盾をプレイしました。'
                                    );
                                    break;
                                default :
                                    that.chat(
                                          '?'
                                        , 'deeppink'
                                        , '部隊カードをプレイしました。'
                                    );
                                    break;
                            }

                            if ((playingCard & 0xff00) !== 0x0600) {
                                game.stock[((playingCard & 0xff00) >> 8) * 10 + (playingCard & 0x00ff)] = Index.NONE;
                            } else {
                                activePlayer.count++;

                                if (
                                       playingCard === Tactics.ALEXANDER
                                    || playingCard === Tactics.DARIUS
                                ) {
                                    playingCard.leader++;
                                }
                            }

                            activeHand.splice(game.playing, 1);
                            game.playing = Index.NONE;

                            if (game.troopDeck.length > 0 || game.tacticsDeck.length > 0) {
                                game.phase = Phase.DRAW;
                                game.sound = Sound.BUILD;
                            } else {
                                Game.nextTurn(game);
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            }
                        }
                    })(this);
                    break;
                case 'g':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.FOG) {
                            var playerList = game.playerList;
                            var i = that.split(message)[0];

                            that.chat('?', 'deeppink', '霧をプレイしました。');

                            playerList[game.active].count++;
                            game.weather[i]++;
                            playerList[game.active].hand.splice(game.playing, 1);
                            game.playing = Index.NONE;

                            if (game.troopDeck.length > 0 || game.tacticsDeck.length > 0) {
                                game.phase = Phase.DRAW;
                                game.sound = Sound.BUILD;
                            } else {
                                Game.nextTurn(game);
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            }

                            game.before.idx = game.before.x = game.before.y = Index.NONE;
                        }
                    })(this);
                    break;
                case 'h':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.MUD) {
                            var activePlayer = game.playerList[game.active];
                            var index = that.split(message)[0];

                            that.chat('?', 'deeppink', '泥をプレイしました。');

                            activePlayer.count++;
                            game.weather[index] += 2;
                            game.size[index] = 4;
                            activePlayer.hand.splice(game.playing, 1);
                            game.playing = Index.NONE;

                            if (game.troopDeck.length > 0 || game.tacticsDeck.length > 0) {
                                game.phase = Phase.DRAW;
                            } else {
                                Game.nextTurn(game);
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            }

                            game.before.idx = game.before.x = game.before.y = Index.NONE;
                            game.sound = Sound.BUILD;
                        }
                    })(this);
                    break;
                case 'i':
                    (function (that) {
                        var game = that.game;
                        var troopDeck = game.troopDeck;

                        if (
                            (game.phase === Phase.SCOUT1 || game.phase === Phase.SCOUT2)
                            && troopDeck.length > 0
                            ) {
                            var activePlayer = game.playerList[game.active];

                            if (game.phase === Phase.SCOUT1) {
                                that.chat('?', 'deeppink', '偵察をプレイしました。');

                                activePlayer.count++;
                                Game.discard(game);
                                game.phase = Phase.SCOUT2;
                            }

                            that.chat('?', 'deeppink', '部隊カード ドロー。');

                            var activeHand = activePlayer.hand;

                            activeHand.push(troopDeck.shift());

                            game.sound = Sound.BUILD;

                            if (
                                activeHand.length >= 9
                                || (troopDeck.length === 0 && game.tacticsDeck.length === 0)
                                ) {
                                game.phase = Phase.SCOUT3;
                                if (activeHand.length <= 7) {
                                    Game.nextTurn(game);
                                    that.chat(
                                          '?'
                                        , 'orange'
                                        , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                    );
                                    game.sound = Sound.PASS;
                                }
                            }
                        }
                    })(this);
                    break;
                case 'j':
                    (function (that) {
                        var game = that.game;
                        var tacticsDeck = game.tacticsDeck;

                        if (
                            (game.phase === Phase.SCOUT1 || game.phase === Phase.SCOUT2)
                            && tacticsDeck.length > 0
                            ) {
                            var activePlayer = game.playerList[game.active];

                            if (game.phase === Phase.SCOUT1) {
                                that.chat('?', 'deeppink', '偵察をプレイしました。');

                                activePlayer.count++;
                                Game.discard(game);
                                game.phase = Phase.SCOUT2;
                            }

                            that.chat('?', 'deeppink', '戦術カード ドロー。');

                            var activeHand = activePlayer.hand;

                            activeHand.push(game.tacticsDeck.shift());

                            game.sound = Sound.BUILD;

                            if (
                                activeHand.length >= 9
                                || (game.troopDeck.length === 0 && tacticsDeck.length === 0)
                                ) {
                                game.phase = Phase.SCOUT3;
                                if (activeHand.length <= 7) {
                                    Game.nextTurn(game);
                                    that.chat(
                                          '?'
                                        , 'orange'
                                        , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                    );
                                    game.sound = Sound.PASS;
                                }
                            }
                        }
                    })(this);
                    break;
                case 'k':
                    (function (that) {
                        var game = that.game;
                        var activeHand = game.playerList[game.active].hand;
                        var index = parseInt(that.split(message)[0]);

                        if (
                            game.phase === Phase.SCOUT3
                            && activeHand.length > 7
                            && activeHand.length > index
                            ) {
                            if ((activeHand[index] & 0xff00) === 0x0600) {
                                that.chat('?', 'deeppink', '戦術カード デッキトップ。');

                                game.tacticsDeck.unshift(activeHand[index]);
                            } else {
                                that.chat('?', 'deeppink', '部隊カード デッキトップ。');

                                game.troopDeck.unshift(activeHand[index]);
                            }

                            activeHand.splice(index, 1);

                            if (activeHand.length <= 7) {
                                game.before.idx = game.before.x = game.before.y = Index.NONE;
                                Game.nextTurn(game);
                                that.chat(
                                     '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            } else {
                                game.sound = Sound.BUILD;
                            }
                        }
                    })(this);
                    break;
                case 'l':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.REDEPLOY1) {
                            var param = that.split(message);

                            that.chat('?', 'deeppink', '再配置をプレイしました。');

                            game.playerList[game.active].count++;

                            var target = game.target;

                            target.y = parseInt(param[0]);
                            target.x = parseInt(param[1]);

                            that.chat('?', 'deeppink', (target.y + 1) + '列目から対象にしました。');

                            game.phase = Phase.REDEPLOY2;
                            game.sound = Sound.BUILD;
                        }
                    })(this);
                    break;
                case 'm':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.REDEPLOY2) {
                            var activePlayer = game.playerList[game.active];
                            var activeTalon = activePlayer.talon;
                            var target = game.target;
                            var activeField = activePlayer.field;
                            var targetField = activeField[target.y];
                            var targetCard = targetField[target.x];
                            var before = game.before;
                            var index = parseInt(that.split(message)[0]);

                            if (index === Index.NONE) {
                                that.chat('?', 'deeppink', (target.y + 1) + '列目から除外しました。');

                                activeTalon.push(targetCard);

                                targetField.splice(target.x, 1);
                                before.idx = before.x = before.y = Index.NONE;
                            } else {
                                activeField[index].push(targetCard);

                                that.chat('?', 'deeppink', (index + 1) + '列目に移動しました。');

                                targetField.splice(target.x, 1);

                                before.idx = game.active;
                                before.x = activeField[index].length - 1;
                                before.y = index;
                            }

                            target.y = target.x = Index.NONE;
                            Game.discard(game);

                            if (game.troopDeck.length > 0 || game.tacticsDeck.length > 0) {
                                game.phase = Phase.DRAW;
                                game.sound = Sound.BUILD;
                            } else {
                                Game.nextTurn(game);
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            }
                        }
                    })(this);
                    break;
                case 'n':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.DESERTER) {
                            var active = game.active;
                            var activePlayer = game.playerList[active];
                            var inactivePlayer = game.playerList[active === 0 ? 1 : 0];
                            var param = that.split(message);
                            var i = parseInt(param[0]);
                            var j = parseInt(param[1]);

                            that.chat('?', 'deeppink', '脱走をプレイしました。');
                            activePlayer.count++;

                            that.chat('?', 'deeppink', (i + 1) + '列目から除外しました。');

                            inactivePlayer.talon.push(inactivePlayer.field[i][j]);
                            inactivePlayer.field[i].splice(j, 1);

                            var before = game.before;

                            before.idx = before.x = before.y = Index.NONE;

                            Game.discard(game);

                            if (game.troopDeck.length > 0 || game.tacticsDeck.length > 0) {
                                game.phase = Phase.DRAW;
                                game.sound = Sound.BUILD;
                            } else {
                                Game.nextTurn(game);
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            }
                        }
                    })(this);
                    break;
                case 'o':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.TRAITOR1) {
                            var param = that.split(message);

                            that.chat('?', 'deeppink', '裏切りをプレイしました。');

                            game.playerList[game.active].count++;

                            var target = game.target;

                            target.y = parseInt(param[0]);
                            target.x = parseInt(param[1]);

                            that.chat('?', 'deeppink', (target.y + 1) + '列目から対象にしました。');

                            game.phase = Phase.TRAITOR2;
                            game.sound = Sound.BUILD;
                        }
                    })(this);
                    break;
                case 'p':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.TRAITOR2) {
                            var active = game.active;
                            var activePlayer = game.playerList[active];
                            var inactivePlayer = game.playerList[active === 0 ? 1 : 0];
                            var index = parseInt(that.split(message)[0]);
                            var activeField = activePlayer.field[index];
                            var target = game.target;
                            var inactiveField = inactivePlayer.field[target.y];

                            that.chat('?', 'deeppink', (index + 1) + '列目に移動しました。');

                            activeField.push(inactiveField[target.x]);

                            var before = game.before;

                            before.idx = active;
                            before.x = activeField.length - 1;
                            before.y = index;
                            inactiveField.splice(target.x, 1);
                            target.y = target.x = Index.NONE;

                            Game.discard(game);

                            if (game.troopDeck.length > 0 || game.tacticsDeck.length > 0) {
                                game.phase = Phase.DRAW;
                                game.sound = Sound.BUILD;
                            } else {
                                Game.nextTurn(game);
                                that.chat(
                                      '?'
                                    , 'orange'
                                    , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                                );
                                game.sound = Sound.PASS;
                            }
                        }
                    })(this);
                    break;
                case 'q':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.DRAW) {
                            that.chat('?', 'deeppink', '部隊カード ドロー。');

                            game.playerList[game.active].hand.push(game.troopDeck.shift());
                            Game.nextTurn(game);
                            that.chat(
                                  '?'
                                , 'orange'
                                , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                            );
                            game.sound = Sound.PASS;
                        }
                    })(this);
                    break;
                case 'r':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.DRAW) {
                            that.chat('?', 'deeppink', '戦術カード ドロー。');

                            game.playerList[game.active].hand.push(game.tacticsDeck.shift());
                            Game.nextTurn(game);
                            that.chat(
                                  '?'
                                , 'orange'
                                , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                            );
                            game.sound = Sound.PASS;
                        }
                    })(this);
                    break;
                case 's':
                    (function (that) {
                        var game = that.game;

                        if (game.phase === Phase.MAIN) {
                            that.chat('?', 'deeppink', 'パスしました。');
                            Game.nextTurn(game);
                            that.chat(
                                  '?'
                                , 'orange'
                                , '--「' + game.playerList[game.active].uid + '(' + COLOR_NAME[game.active] + ')」ターン--'
                            );
                            game.sound = Sound.PASS;
                        }
                    })(this);
                    break;
            }
        }

        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

module.exports = BattleRaiso;