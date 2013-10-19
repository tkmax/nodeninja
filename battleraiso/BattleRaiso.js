var Instance = require('../Instance')
    , Const = require('./Const')
    , Player = require('./Player')
    , Game = require('./Game')
    , State = Const.State
    , Phase = Const.Phase
    , Tactics = Const.Tactics;

var BattleRaiso = function () {
    this.super();
    this.game = new Game();
    Game.clear(this.game);
};

BattleRaiso.prototype = new Instance();

BattleRaiso.prototype.onMessage = function (uid, msg) {
    var unActive, i, optn;

    if (this.game.active === 0) {
        unActive = 1;
    } else {
        unActive = 0;
    }

    if (msg[0] === 't') {
        this.unicast(uid, JSON.stringify(this.game));
    } if (this.game.state === State.Ready) {
        switch (msg[0]) {
            case 'a':
                for (i in this.game.playerList) {
                    if (this.game.playerList[i].uid === '') {
                        this.game.playerList[i].uid = uid;
                        break;
                    }
                }
                break;
            case 'b':
                for (i in this.game.playerList) {
                    if (this.game.playerList[i].uid === uid) this.game.playerList[i].uid = '';
                }
                break;
            case 'c':
                if (this.game.playerList[0].uid !== '' && this.game.playerList[1].uid !== '') Game.start(this.game);
                break;
        }
        this.broadcast(JSON.stringify(this.game));
    } else {
        switch (msg[0]) {
            case 'd':
                optn = Game.split(msg);
                if (this.game.phase === Phase.Main && this.game.flagList[optn[0]] === -1) {
                    this.game.sound = 'get';
                    this.chat((parseInt(optn[0]) + 1) + '列目の旗を獲得しました。');
                    this.game.flagList[optn[0]] = this.game.active;
                    if (Game.isFinish(this.game)) {
                        this.game.sound = 'finish';
                        if (this.game.active === 0) {
                            this.chat("おめでとうございます。" + this.game.playerList[0].uid + "さん(青)の勝利です。");
                        } else {
                            this.chat("おめでとうございます。" + this.game.playerList[1].uid + "さん(黄)の勝利です。");
                        }
                        this.game.playerList[0].uid = this.game.playerList[1].uid = '';
                        this.game.state = State.Ready;
                    }
                }
                break;
            case 'e':
                if (this.game.phase === Phase.Main
                || this.game.phase === Phase.Common
                || this.game.phase === Phase.Fog
                || this.game.phase === Phase.Mud
                || this.game.phase === Phase.Scout1
                || this.game.phase === Phase.Redeploy1
                || this.game.phase === Phase.Deserter
                || this.game.phase === Phase.Traitor1
                ) {
                    optn = Game.split(msg);
                    this.game.play = parseInt(optn[0]);
                    switch (this.game.playerList[this.game.active].hand[this.game.play]) {
                        case Tactics.Fog:
                            this.game.phase = Phase.Fog;
                            break;
                        case Tactics.Mud:
                            this.game.phase = Phase.Mud;
                            break;
                        case Tactics.Scout:
                            this.game.phase = Phase.Scout1;
                            break;
                        case Tactics.Redeploy:
                            this.game.phase = Phase.Redeploy1;
                            break;
                        case Tactics.Deserter:
                            this.game.phase = Phase.Deserter;
                            break;
                        case Tactics.Traitor:
                            this.game.phase = Phase.Traitor1;
                            break;
                        default:
                            this.game.phase = Phase.Common;
                            break;
                    }
                }
                break;
            case 'f':
                if (this.game.phase === Phase.Common) {
                    this.game.sound = 'build';
                    optn = Game.split(msg);
                    this.game.playerList[this.game.active].field[optn[0]].push(this.game.playerList[this.game.active].hand[this.game.play]);
                    this.game.before.idx = this.game.active;
                    this.game.before.x = this.game.playerList[this.game.active].field[optn[0]].length - 1;
                    this.game.before.y = parseInt(optn[0]);
                    if ((this.game.playerList[this.game.active].hand[this.game.play] & 0xff00) !== 0x0600) {
                        this.game.stock[
                            ((this.game.playerList[this.game.active].hand[this.game.play] & 0xff00) >> 8) * 10 + (this.game.playerList[this.game.active].hand[this.game.play] & 0x00ff)
                        ] = -1;
                    } else {
                        this.game.playerList[this.game.active].count++;
                        if (
                        this.game.playerList[this.game.active].hand[this.game.play] === Tactics.Alexander
                        || this.game.playerList[this.game.active].hand[this.game.play] === Tactics.Darius
                        ) this.game.playerList[this.game.active].leader++;
                    }
                    this.game.playerList[this.game.active].hand.splice(this.game.play, 1);
                    this.game.play = -1;
                    if (this.game.troopDeck.length > 0 || this.game.tacticsDeck.length > 0) {
                        this.game.phase = Phase.Draw;
                    } else {
                        Game.nextTurn(this.game);
                    }
                }
                break;
            case 'g':
                if (this.game.phase === Phase.Fog) {
                    this.game.sound = 'build';
                    this.chat('霧をプレイしました。');
                    this.game.playerList[this.game.active].count++;
                    optn = Game.split(msg);
                    this.game.weather[optn[0]] += 1;
                    this.game.playerList[this.game.active].hand.splice(this.game.play, 1);
                    this.game.play = -1;
                    if (this.game.troopDeck.length > 0 || this.game.tacticsDeck.length > 0) {
                        this.game.phase = Phase.Draw;
                    } else {
                        Game.nextTurn(this.game);
                    }
                    this.game.before.idx = this.game.before.x = this.game.before.y = -1;
                }
                break;
            case 'h':
                if (this.game.phase === Phase.Mud) {
                    this.game.sound = 'build';
                    this.chat('泥をプレイしました。');
                    this.game.playerList[this.game.active].count++;
                    optn = Game.split(msg);
                    this.game.weather[optn[0]] += 2;
                    this.game.size[optn[0]] = 4;
                    this.game.playerList[this.game.active].hand.splice(this.game.play, 1);
                    this.game.play = -1;
                    if (this.game.troopDeck.length > 0 || this.game.tacticsDeck.length > 0) {
                        this.game.phase = Phase.Draw;
                    } else {
                        Game.nextTurn(this.game);
                    }
                    this.game.before.idx = this.game.before.x = this.game.before.y = -1;
                }
                break;
            case 'i':
                if ((this.game.phase === Phase.Scout1 || this.game.phase === Phase.Scout2)
                && this.game.troopDeck.length > 0
                ) {
                    this.game.sound = 'build';
                    if (this.game.phase === Phase.Scout1) {
                        this.chat('偵察をプレイしました。');
                        this.game.playerList[this.game.active].count++;
                        Game.discard(this.game);
                        this.game.phase = Phase.Scout2;
                    }
                    this.chat('部隊カードを１枚引きました。');
                    this.game.playerList[this.game.active].hand.push(this.game.troopDeck.shift());
                    if (this.game.playerList[this.game.active].hand.length >= 9
                    || (this.game.troopDeck.length === 0 && this.game.tacticsDeck.length === 0)
                    ) {
                        this.game.phase = Phase.Scout3;
                        if (this.game.playerList[this.game.active].hand.length <= 7) Game.nextTurn(this.game);
                    }
                }
                break;
            case 'j':
                if ((this.game.phase === Phase.Scout1 || this.game.phase === Phase.Scout2)
                && this.game.tacticsDeck.length > 0
                ) {
                    this.game.sound = 'build';
                    if (this.game.phase === Phase.Scout1) {
                        this.chat('偵察をプレイしました。');
                        this.game.playerList[this.game.active].count++;
                        Game.discard(this.game);
                        this.game.phase = Phase.Scout2;
                    }
                    this.chat('戦術カードを１枚引きました。');
                    this.game.playerList[this.game.active].hand.push(this.game.tacticsDeck.shift());
                    if (this.game.playerList[this.game.active].hand.length >= 9
                    || (this.game.troopDeck.length === 0 && this.game.tacticsDeck.length === 0)
                    ) {
                        this.game.phase = Phase.Scout3;
                        if (this.game.playerList[this.game.active].hand.length <= 7) Game.nextTurn(this.game);
                    }
                }
                break;
            case 'k':
                optn = Game.split(msg);
                if (this.game.phase === Phase.Scout3
                && this.game.playerList[this.game.active].hand.length > 7
                && this.game.playerList[this.game.active].hand.length > parseInt(optn[0])
                ) {
                    this.game.sound = 'build';
                    if ((this.game.playerList[this.game.active].hand[optn[0]] & 0xff00) === 0x0600) {
                        this.chat('戦術カードを１枚山札の一番上に置きました。');
                        this.game.tacticsDeck.unshift(this.game.playerList[this.game.active].hand[optn[0]]);
                    } else {
                        this.chat('部隊カードを１枚山札の一番上に置きました。');
                        this.game.troopDeck.unshift(this.game.playerList[this.game.active].hand[optn[0]]);
                    }
                    this.game.playerList[this.game.active].hand.splice(optn[0], 1);
                    if (this.game.playerList[this.game.active].hand.length <= 7) {
                        this.game.before.idx = this.game.before.x = this.game.before.y = -1;
                        Game.nextTurn(this.game);
                    }
                }
                break;
            case 'l':
                if (this.game.phase === Phase.Redeploy1) {
                    this.game.sound = 'build';
                    this.chat('再配置をプレイしました。');
                    this.game.playerList[this.game.active].count++;
                    optn = Game.split(msg);
                    this.game.target.y = parseInt(optn[0]);
                    this.game.target.x = parseInt(optn[1]);
                    this.game.phase = Phase.Redeploy2;
                }
                break;
            case 'm':
                if (this.game.phase === Phase.Redeploy2) {
                    optn = Game.split(msg);
                    this.game.sound = 'build';
                    if (optn[0] === '-1') {
                        this.chat((this.game.target.y + 1) + '列目から除外しました。');
                        this.game.playerList[this.game.active].talon.push(
                            this.game.playerList[this.game.active].field[this.game.target.y][this.game.target.x]
                        );
                        this.game.playerList[this.game.active].field[this.game.target.y].splice(this.game.target.x, 1);
                        this.game.before.idx = this.game.before.x = this.game.before.y = -1;
                    } else {
                        this.game.playerList[this.game.active].field[optn[0]].push(
                            this.game.playerList[this.game.active].field[this.game.target.y][this.game.target.x]
                        );
                        this.game.playerList[this.game.active].field[this.game.target.y].splice(this.game.target.x, 1);
                        this.game.before.idx = this.game.active;
                        this.game.before.x = this.game.playerList[this.game.active].field[optn[0]].length - 1;
                        this.game.before.y = parseInt(optn[0]);
                    }
                    this.game.target.y = -1;
                    this.game.target.x = -1;
                    Game.discard(this.game);
                    if (this.game.troopDeck.length > 0 || this.game.tacticsDeck.length > 0) {
                        this.game.phase = Phase.Draw;
                    } else {
                        Game.nextTurn(this.game);
                    }
                }
                break;
            case 'n':
                if (this.game.phase === Phase.Deserter) {
                    this.game.sound = 'build';
                    this.chat('脱走をプレイしました。');
                    this.game.playerList[this.game.active].count++;
                    optn = Game.split(msg);
                    this.chat((parseInt(optn[0]) + 1) + '列目から除外しました。');
                    this.game.playerList[unActive].talon.push(
                        this.game.playerList[unActive].field[optn[0]][optn[1]]
                    );
                    this.game.playerList[unActive].field[optn[0]].splice(optn[1], 1);
                    this.game.before.idx = this.game.before.x = this.game.before.y = -1;
                    Game.discard(this.game);
                    if (this.game.troopDeck.length > 0 || this.game.tacticsDeck.length > 0) {
                        this.game.phase = Phase.Draw;
                    } else {
                        Game.nextTurn(this.game);
                    }
                }
                break;
            case 'o':
                if (this.game.phase === Phase.Traitor1) {
                    this.game.sound = 'build';
                    this.chat('裏切りをプレイしました。');
                    this.game.playerList[this.game.active].count++;
                    optn = Game.split(msg);
                    this.game.target.y = parseInt(optn[0]);
                    this.game.target.x = parseInt(optn[1]);
                    this.game.phase = Phase.Traitor2;
                }
                break;
            case 'p':
                if (this.game.phase === Phase.Traitor2) {
                    this.game.sound = 'build';
                    optn = Game.split(msg);
                    this.game.playerList[this.game.active].field[optn[0]].push(
                        this.game.playerList[unActive].field[this.game.target.y][this.game.target.x]
                    );
                    this.game.before.idx = this.game.active;
                    this.game.before.x = this.game.playerList[this.game.active].field[optn[0]].length - 1;
                    this.game.before.y = parseInt(optn[0]);
                    this.game.playerList[unActive].field[this.game.target.y].splice(this.game.target.x, 1);
                    this.game.target.y = -1;
                    this.game.target.x = -1;
                    Game.discard(this.game);
                    if (this.game.troopDeck.length > 0 || this.game.tacticsDeck.length > 0) {
                        this.game.phase = Phase.Draw;
                    } else {
                        Game.nextTurn(this.game);
                    }
                }
                break;
            case 'q':
                if (this.game.phase === Phase.Draw) {
                    this.game.playerList[this.game.active].hand.push(this.game.troopDeck.shift());
                    Game.nextTurn(this.game);
                }
                break;
            case 'r':
                if (this.game.phase === Phase.Draw) {
                    this.game.playerList[this.game.active].hand.push(this.game.tacticsDeck.shift());
                    Game.nextTurn(this.game);
                }
                break;
            case 's':
                if (this.game.phase === Phase.Main) {
                    this.chat('パスしました。');
                    Game.nextTurn(this.game);
                }
                break;
        }
        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

BattleRaiso.prototype.onCommand = function (uid, msg) {
    this.basicCommand(uid, msg);
    switch (msg[0]) {
        case '/reset':
            if (this.ctrlr.uid === uid) {
                Game.clear(this.game);
                this.broadcast(JSON.stringify(this.game));
                this.chat('リセットしました。');
            } else {
                this.chat('管理者でないためリセットできません。');
            }
            break;
    }
}

module.exports = BattleRaiso;