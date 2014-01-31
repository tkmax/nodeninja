var Player = function () { }

Player.clear = function (player) {
    player.uid = '';
    player.money = 0;
    player.hand = [];
    player.fresh = [];
    player.certificate = [0, 0, 0, 0, 0, 0, 0];
}

Player.start = function (player) {
    var i;

    player.money = 6000;
    player.hand.length = 0;
    player.fresh.length = 0;
    for (i = player.certificate.length - 1; i >= 0; i--)
        player.certificate[i] = 0;
}

module.exports = Player;