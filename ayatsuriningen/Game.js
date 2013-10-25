var Const = require('./Const')
    , Player = require('./Player')
    , State = Const.State
    , Phase = Const.Phase
    , Color = Const.Color
    , Card = Const.Card
    , Job = Const.Job;

var Game = function () { }

Game.option = function (msg) {
    return (msg.slice(1)).split(' ');
}

Game.clear = function (game) {
    var i;

    game.state = State.Ready;
    game.sound = '';
    game.phase = '';
    game.active = -1;
    game.playerList = [
        new Player()
        , new Player()
        , new Player()
        , new Player()
        , new Player()
    ];
    for (i = 0; i < game.playerList.length; i++) Player.clear(game.playerList[i]);
    game.deck = [];
    game.job = [-1, -1, -1, -1, -1, -1, -1, -1];
    game.king = -1;
    game.active = -1;
    game.isFirst = false;
    game.canKill = false;
    game.canSteal = false;
    game.canTrade = false;
    game.canReplace = false;
    game.canGet1Coin = false;
    game.canYellowCoin = false;
    game.canBlueCoin = false;
    game.canGreenCoin = false;
    game.canDraw2Cards = false;
    game.canDestroy = false;
    game.canRedCoin = false;
    game.canDrawCard = false;
    game.canGet2Coin = false;
    game.canLabo = false;
    game.canSmith = false;
    game.canLib = false;
    game.buildCount = 0;
    game.cemeteryOwner = -1;
    game.cemeteryCard = -1;
    game.laboOwner = -1;
    game.smithOwner = -1;
    game.obsOwner = -1;
    game.libOwner = -1;
    game.peek = [];
    game.kill = -1;
    game.steal = -1;
    game.discard = 0;
    game.firstFinish = -1;
}

Game.start = function (game) {
    var i, j, tmp;

    game.state = State.Play;
    game.sound = '';
    game.active = 0;
    game.isFirst = false;
    for (i = 0; i < game.playerList.length; i++) Player.start(game.playerList[i]);
    game.deck.length = 0;
    for (i = 0; i < 5; i++) game.deck.push(Card.HuntingLodge);
    for (i = 0; i < 4; i++) game.deck.push(Card.Castle);
    for (i = 0; i < 3; i++) game.deck.push(Card.Palace);
    for (i = 0; i < 3; i++) game.deck.push(Card.Temple);
    for (i = 0; i < 3; i++) game.deck.push(Card.Church);
    for (i = 0; i < 3; i++) game.deck.push(Card.Abbey);
    for (i = 0; i < 2; i++) game.deck.push(Card.Cathedral);
    for (i = 0; i < 5; i++) game.deck.push(Card.Pub);
    for (i = 0; i < 4; i++) game.deck.push(Card.Market);
    for (i = 0; i < 3; i++) game.deck.push(Card.GuildHouse);
    for (i = 0; i < 3; i++) game.deck.push(Card.Office);
    for (i = 0; i < 3; i++) game.deck.push(Card.Harbor);
    for (i = 0; i < 2; i++) game.deck.push(Card.CityHall);
    for (i = 0; i < 3; i++) game.deck.push(Card.Watchtower);
    for (i = 0; i < 3; i++) game.deck.push(Card.Prison);
    for (i = 0; i < 3; i++) game.deck.push(Card.Arena);
    for (i = 0; i < 2; i++) game.deck.push(Card.Fortress);
    game.deck.push(Card.GhostTown);
    for (i = 0; i < 2; i++) game.deck.push(Card.Lookout);
    game.deck.push(Card.Cemetery);
    game.deck.push(Card.Laboratory);
    game.deck.push(Card.Smith);
    game.deck.push(Card.Observatory);
    game.deck.push(Card.Library);
    game.deck.push(Card.MagicSchool);
    game.deck.push(Card.DragonsProtection);
    game.deck.push(Card.University);
    tmp = [];
    while (game.deck.length > 0) {
        i = Math.floor(Math.random() * game.deck.length);
        tmp.push(game.deck[i]);
        game.deck.splice(i, 1);
    }
    while (tmp.length > 0) {
        i = Math.floor(Math.random() * tmp.length);
        game.deck.push(tmp[i]);
        tmp.splice(i, 1);
    }
    for (i = 0; i < game.playerList.length; i++) {
        for (j = 0; j < 4; j++) game.playerList[i].hand.push(game.deck.shift());
    }
    game.canKill = false;
    game.canSteal = false;
    game.canTrade = false;
    game.canReplace = false;
    game.canYellowCoin = false;
    game.canBlueCoin = false;
    game.canGet1Coin = false;
    game.canGreenCoin = false;
    game.canDraw2Cards = false;
    game.canDrawCard = false;
    game.canDestroy = false;
    game.canRedCoin = false;
    game.canGet2Coin = false;
    game.canLabo = false;
    game.canSmith = false;
    game.canLib = false;
    game.buildCount = 0;
    game.cemeteryOwner = -1;
    game.cemeteryCard = -1;
    game.laboOwner = -1;
    game.smithOwner = -1;
    game.obsOwner = -1;
    game.libOwner = -1;
    game.peek.length = 0;
    game.kill = -1;
    game.steal = -1;
    game.discard = 0;
    game.king = 0;
    game.firstFinish = -1;
    Game.nextRound(game);
}

Game.nextRound = function (game) {
    var i, j;

    game.phase = Phase.Draft;
    game.kill = -1;
    game.steal = -1;
    game.active = game.king;
    for (i = 0; i < game.job.length; i++) game.job[i] = -1;
    for (i = 0; i < game.playerList.length; i++) {
        game.playerList[i].job = -1;
        game.playerList[i].isOpen = false;
    }
    for (; ; ) {
        j = Math.floor(Math.random() * game.job.length);
        if (j !== 3) {
            game.job[j] = -2;
            break;
        }
    }
    for (; ; ) {
        j = Math.floor(Math.random() * game.job.length);
        if (j !== 3 && game.job[j] !== -2) {
            game.job[j] = -3;
            break;
        }
    }
}

Game.openTurn = function (game) {
    game.phase = Phase.Main;
    game.isFirst = true;
    game.canDrawCard = true;
    game.canGet2Coin = true;
    if (game.playerList[game.active].job === Job.Assassin) {
        game.canKill = true;
    } else {
        game.canKill = false;
    }
    if (game.playerList[game.active].job === Job.Robber) {
        game.canSteal = true;
    } else {
        game.canSteal = false;
    }
    if (game.playerList[game.active].job === Job.Magician) {
        game.canTrade = true;
        game.canReplace = true;
    } else {
        game.canTrade = false;
        game.canReplace = false;
    }
    if (game.playerList[game.active].job === Job.King) {
        game.canYellowCoin = true;
    } else {
        game.canYellowCoin = false;
    }
    if (game.playerList[game.active].job === Job.Evangelist) {
        game.canBlueCoin = true;
    } else {
        game.canBlueCoin = false;
    }
    if (game.playerList[game.active].job === Job.Merchant) {
        game.canGet1Coin = true;
        game.canGreenCoin = true;
    } else {
        game.canGet1Coin = false;
        game.canGreenCoin = false;
    }
    if (game.playerList[game.active].job === Job.Architect) {
        game.buildCount = 3;
        game.canDraw2Cards = true;
    } else {
        game.buildCount = 1;
        game.canDraw2Cards = false;
    }
    if (game.playerList[game.active].job === Job.Soldier) {
        game.canDestroy = true;
        game.canRedCoin = true;
    } else {
        game.canDestroy = false;
        game.canRedCoin = false;
    }
    if (game.active === game.laboOwner) {
        game.canLabo = true;
    } else {
        game.canLabo = false;
    }
    if (game.active === game.smithOwner) {
        game.canSmith = true;
    } else {
        game.canSmith = false;
    }
    if (game.active === game.libOwner) {
        game.canLib = true;
    } else {
        game.canLib = false;
    }
}

Game.score = function (game, playerIdx) {
    var i, score = 0, bonus = 0, haveYellow = 0, haveBlue = 0, haveGreen = 0, haveRed = 0,
    havePurple = 0, haveGhostTown = 0;

    for (i = 0; i < game.playerList[playerIdx].build.length; i++) {
        score += (game.playerList[playerIdx].build[i] & 0x0f00) >> 8;

        switch (game.playerList[playerIdx].build[i]) {
            case Card.DragonsProtection:
            case Card.University:
                bonus += 2;
                break;
        }

        switch (game.playerList[playerIdx].build[i] & 0xf000) {
            case Color.Yellow:
                if (haveYellow === 0) haveYellow++;
                break;
            case Color.Blue:
                if (haveBlue === 0) haveBlue++;
                break;
            case Color.Green:
                if (haveGreen === 0) haveGreen++;
                break;
            case Color.Red:
                if (haveRed === 0) haveRed++;
                break;
            case Color.Purple:
                if (game.playerList[playerIdx].build[i] === Card.GhostTown) {
                    haveGhostTown++;
                } else if (havePurple === 0) {
                    havePurple++;
                }
                break;
        }
    }

    if (
        (haveYellow + haveBlue + haveGreen + haveRed + havePurple + haveGhostTown)
        >= 5
    ) {
        bonus += 3;
    }

    if (game.playerList[playerIdx].build.length >= 8) {
        if (game.firstFinish === playerIdx) {
            bonus += 4;
        } else {
            bonus += 2;
        }
    }

    return { 'score': score, 'bonus': bonus };
}

Game.job = function (type) {
    switch (type) {
        case Job.Assassin:
            return '暗殺者';
        case Job.Robber:
            return '泥棒';
        case Job.Magician:
            return '魔術師';
        case Job.King:
            return '国王';
        case Job.Evangelist:
            return '伝道師';
        case Job.Merchant:
            return '商人';
        case Job.Architect:
            return '建築家';
        case Job.Soldier:
            return '傭兵';
    }
}

Game.color = function (type) {
    switch (type) {
        case 0:
            return '赤';
        case 1:
            return '青';
        case 2:
            return '黄';
        case 3:
            return '緑';
        case 4:
            return '紫';
    }
}

Game.build = function (type) {
    switch(type) {
        case Card.HuntingLodge:
            return '(黄) 3:猟城';
        case Card.Castle:
            return '(黄) 4:居城';
        case Card.Palace:
            return '(黄) 5:王宮';
        case Card.Temple:
            return '(青) 1:聖堂';
        case Card.Church:
            return '(青) 2:教会';
        case Card.Abbey:
            return '(青) 3:修道院';
        case Card.Cathedral:
            return '(青) 5:大聖堂';
        case Card.Pub:
            return '(緑) 1:酒場';
        case Card.Market:
            return '(緑) 2:市場';
        case Card.GuildHouse:
            return '(緑) 3:ギルドハウス';
        case Card.Office:
            return '(緑) 3:営業所';
        case  Card.Harbor:
            return '(緑) 4:港';
        case Card.CityHall:
            return '(緑) 5:市庁舎';
        case Card.Watchtower:
            return '(赤) 1:監視塔';
        case Card.Prison:
            return '(赤) 2:牢獄';
        case Card.Arena:
            return '(赤) 3:競技場';
        case Card.Fortress:
            return '(赤) 5:要塞';
        case Card.GhostTown:
            return '(紫) 2:幽霊都市';
        case Card.Lookout:
            return '(紫) 3:見張り台';
        case Card.Cemetery:
            return '(紫) 5:墓地';
        case Card.Laboratory:
            return '(紫) 5:研究所';
        case Card.Smith:
            return '(紫) 5:鍛冶屋';
        case Card.Observatory:
            return '(紫) 5:天文台';
        case Card.Library:
            return '(紫) 6:図書館';
        case Card.MagicSchool:
            return '(紫) 6:魔術学校';
        case Card.DragonsProtection:
            return '(紫) 6(+2):ドラゴンの守り';
        case Card.University:
            return '(紫) 6(+2):大学';
    }
}

module.exports = Game;