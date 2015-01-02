var Player = function () { }

Player.clear = function (player) {
    player.uid = '';
    player.hand = [];
    player.talon = [];
    player.count = 0;
    player.leader = 0;
    player.field = [ [], [], [], [], [], [], [], [], [] ];
}

Player.start = function (player) {
    player.hand.length = 0;
    player.talon.length = 0;
    player.count = 0;
    player.leader = 0;
    player.field = [ [], [], [], [], [], [], [], [], [] ];
}

module.exports = Player;