var Const = require('./Const')
    , Player = require('./Player')
    , State = Const.State
    , Phase = Const.Phase
    , Tactics = Const.Tactics;

var Game = function () { };

Game.split = function (src) {
    return (src.substring(1)).split(' ');
}

Game.clear = function (game) {
    game.sound = '';
    game.state = State.Ready;
    game.phase = '';
    game.active = -1;
    game.play = -1;
    game.target = {
        x: -1, y: -1
    };
    game.troopDeck = [];
    game.tacticsDeck = [];
    game.flagList = [];
    game.size = [];
    game.weather = [];
    game.stock = [];
    game.before = {
        idx: -1, x: -1, y: -1
    };
    game.playerList = [new Player(), new Player()];
    Player.clear(game.playerList[0]);
    Player.clear(game.playerList[1]);
}

Game.start = function (game) {
    var i, j, tmp;
    game.sound = '';
    game.state = State.Play;
    game.phase = Phase.Main;
    game.active = 0;
    game.play = -1;
    game.target.x = game.target.y = -1;
    game.before.idx = game.before.x = game.before.y = -1;
    game.flagList.length = game.size.length = game.weather.length = game.stock.length = 0;
    for (i = 0; i < 6; i++) {
        for (j = 0; j < 10; j++) {
            game.stock.push(j);
        }
    }
    for (i = 0; i < 9; i++) {
        game.flagList.push(-1);
        game.size.push(3);
        game.weather.push(0);
    }
    Player.start(game.playerList[0]);
    Player.start(game.playerList[1]);
    game.troopDeck.length = 0;
    for (i = 0x0000; i < 0x0600; i += 0x0100) {
        for (j = 0x0009; j >= 0x0000; j -= 0x0001) {
            game.troopDeck.push(i | j);
        }
    }
    tmp = [];
    while (game.troopDeck.length > 0) {
        i = Math.floor(Math.random() * game.troopDeck.length);
        tmp.push(game.troopDeck[i]);
        game.troopDeck.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        game.troopDeck.push(tmp[i]);
        tmp.splice(i, 1);
    }
    game.tacticsDeck.length = 0;
    for (i = 0x0009; i >= 0x0000; i -= 0x0001) {
        game.tacticsDeck.push(0x0600 | i);
    }
    while (game.tacticsDeck.length > 0) {
        i = Math.floor(Math.random() * game.tacticsDeck.length);
        tmp.push(game.tacticsDeck[i]);
        game.tacticsDeck.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        game.tacticsDeck.push(tmp[i]);
        tmp.splice(i, 1);
    }
    for (i = 0; i < 7; i++) {
        game.playerList[0].hand.push(game.troopDeck.shift());
        game.playerList[1].hand.push(game.troopDeck.shift());
    }
}

Game.discard = function (game) {
    game.playerList[game.active].talon.push(
        game.playerList[game.active].hand[game.play]
    );
    game.playerList[game.active].hand.splice(game.play, 1);
    game.play = -1;
}

Game.nextTurn = function (game) {
    if (game.active === 0) {
        game.active = 1;
    } else {
        game.active = 0;
    }
    game.phase = Phase.Main;
    game.sound = 'end';
}

Game.isFinish = function (game) {
    var i, sequence = 0, count = 0;
    for (i in game.flagList) {
        if (game.flagList[i] === game.active) {
            sequence++;
            count++;
        } else {
            sequence = 0;
        }
        if (sequence >= 3 || count >= 5) {
            return true;
        }
    }
    return false;
}

module.exports = Game;