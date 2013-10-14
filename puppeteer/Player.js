var Player = function () { };

Player.clear = function (player) {
    player.uid = '';
    player.coin = 0;
    player.hand = [];
    player.build = [];
    player.job = -1;
    player.isOpen = false;
}

Player.start = function (player) {
    player.coin = 2;
    player.hand.length = 0;
    player.build.length = 0;
    player.job = -1;
    player.isOpen = false;
}

module.exports = Player;