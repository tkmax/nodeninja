var Game = require('./Game');

var Dice = function () { }

Dice.clear = function(dice, mt) {
    dice.first = 0;
    dice.seccond = 0;
    dice.seek = 0;
    dice.reel = [];
    dice.mt = mt;

    this.reset(dice);
}

Dice.reset = function(dice) {
    dice.seek = 0;
    dice.reel.length = 0;

    var i;
    for(i = 0; i < 10; i++) {
        var j;
        for(j = 1; j <= 6; j++) {
            dice.reel.push(j);
        }
    }

    Game.suffle(dice.reel, dice.mt);
}

Dice.roll = function(dice) {
    if(dice.seek > dice.reel.length / 2) { this.reset(dice); }

    dice.first = dice.reel[dice.seek];
    dice.seccond = dice.reel[dice.reel.length - (dice.seek + 1)];

    dice.seek++;
}


module.exports = Dice;
