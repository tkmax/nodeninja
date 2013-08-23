var Player = function () { }

Player.clear = function (player) {
    player.uid = '';
    player.burst = 0;
    player.secondSettlement = -1;
    player.road = 0;
    player.settlement = 0;
    player.city = 0;
    player.score = 0;
    player.bonus = 0;
    player.resource = [0, 0, 0, 0, 0];
    player.sleepCard = [0, 0, 0, 0, 0];
    player.wakeCard = [0, 0, 0, 0, 0];
    player.deadCard = [0, 0, 0, 0, 0];
    player.isPlayedCard = false;
    player.harbor = [false, false, false, false, false, false];
}

Player.start = function (player) {
    var i;

    player.burst = 0;
    player.secondSettlement = -1;
    player.road = 15;
    player.settlement = 5;
    player.city = 4;
    player.score = 0;
    player.bonus = 0;
    for (i in player.resource) player.resource[i] = 0;
    for (i = 0; i < 5; i++) {
        player.sleepCard[i] = 0;
        player.wakeCard[i] = 0;
        player.deadCard[i] = 0;
    }
    player.isPlayedCard = false;
}

Player.sumResource = function (player) {
    var i, sum = 0;

    for (i in player.resource) sum += player.resource[i];
    return sum;
}

Player.playCard = function (player, type) {
    player.wakeCard[type]--;
    player.deadCard[type]++;
    player.isPlayedCard = true;
}

module.exports = Player;