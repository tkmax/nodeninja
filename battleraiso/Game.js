var Player = require('./Player');
var Const = require('./Const');
var Index = Const.Index;
var State = Const.State;
var Phase = Const.Phase;

var Game = function () { }

Game.clear = function (game) {
    game.state = State.READY;
    game.sound = '';
    game.phase = Phase.NONE;
    game.active = Index.NONE;
    game.playing = Index.NONE;
    game.target = { x: Index.NONE, y: Index.NONE };
    game.troopDeck = [];
    game.tacticsDeck = [];
    game.flagList = [];
    game.size = [];
    game.weather = [];
    game.stock = [];
    game.before = { idx: Index.NONE, x: Index.NONE, y: Index.NONE };

    var playerList = game.playerList = [new Player(), new Player()];

    Player.clear(playerList[0]);
    Player.clear(playerList[1]);
}

Game.start = function (game, mt) {
    game.state = State.PLAYING;
    game.sound = '';
    game.phase = Phase.MAIN;
    game.active = 0;
    game.playing = Index.NONE;
    game.target.x = game.target.y = Index.NONE;
    game.before.idx = game.before.x = game.before.y = Index.NONE;

    var stock = game.stock;

    var i, j;
    for (i = 0; i < 6; i++) {
        for (j = 0; j < 10; j++) {
            stock.push(j);
        }
    }

    var flagList = game.flagList;
    var size = game.size;
    var weather = game.weather;

    flagList.length = size.length = weather.length = stock.length = 0;
    for (i = 0; i < 9; i++) {
        flagList.push(Index.NONE);
        size.push(3);
        weather.push(0);
    }

    var playerList = game.playerList;

    Player.start(playerList[0]);
    Player.start(playerList[1]);

    var troopDeck = game.troopDeck;

    troopDeck.length = 0;
    for (i = 0x0000; i < 0x0600; i += 0x0100) {
        for (j = 0x0009; j >= 0x0000; j -= 0x0001) {
            troopDeck.push(i | j);
        }
    }

    var tmp = [];

    while (troopDeck.length > 0) {
        i = mt.nextInt(troopDeck.length);
        tmp.push(troopDeck[i]);
        troopDeck.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = mt.nextInt(tmp.length);
        troopDeck.push(tmp[i]);
        tmp.splice(i, 1);
    }

    var tacticsDeck = game.tacticsDeck;

    tacticsDeck.length = 0;
    for (i = 0x0009; i >= 0x0000; i -= 0x0001) {
        tacticsDeck.push(0x0600 | i);
    }

    while (tacticsDeck.length > 0) {
        i = Math.floor(Math.random() * tacticsDeck.length);
        tmp.push(tacticsDeck[i]);
        tacticsDeck.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        tacticsDeck.push(tmp[i]);
        tmp.splice(i, 1);
    }

    for (i = 0; i < 7; i++) {
        playerList[0].hand.push(troopDeck.shift());
        playerList[1].hand.push(troopDeck.shift());
    }
}

Game.discard = function (game) {
    var playerList = game.playerList;
    var active = game.active;
    var playing = game.playing;
    var talon = playerList[active].talon;
    var hand = playerList[active].hand;

    talon.push(hand[playing]);
    hand.splice(playing, 1);

    game.playing = Index.NONE;
}

Game.nextTurn = function (game) {
    game.active = game.active === 0 ? 1 : 0;
    game.phase = Phase.MAIN;
}

Game.isFinish = function (game) {
    var active = game.active;
    var flagList = game.flagList;

    var i, sequence = 0, count = 0;
    var len1 = flagList.length;
    for (i = 0; i < len1; i++) {
        if (flagList[i] === active) {
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
