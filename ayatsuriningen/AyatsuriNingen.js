var Instance = require('../Instance')
    , Const = require('./Const')
    , Player = require('./Player')
    , Game = require('./Game')
    , State = Const.State
    , Phase = Const.Phase
    , Color = Const.Color
    , Card = Const.Card
    , Job = Const.Job;

var AyatsuriNingen = function () {
    this.super();
    this.title = '操り人間';
    this.game = new Game();
    Game.clear(this.game);
};

AyatsuriNingen.prototype = new Instance();

AyatsuriNingen.prototype.onMessage = function (uid, msg) {
    var i, j, hoge, foo, bar;

    if (msg[0] === 'a') {
        this.unicast(uid, JSON.stringify(this.game));
    } else {
        if (this.game.state === State.Ready) {
            switch (msg[0]) {
                case 'b':
                    for (i = 0; i < this.game.playerList.length; i++) {
                        if (this.game.playerList[i].uid === '') {
                            this.game.playerList[i].uid = uid;
                            break;
                        }
                    }
                    break;
                case 'c':
                    for (i = 0; i < this.game.playerList.length; i++) {
                        if (this.game.playerList[i].uid === uid) this.game.playerList[i].uid = '';
                    }
                    break;
                case 'd':
                    if (
                        this.game.playerList[0].uid !== ''
                        && this.game.playerList[1].uid !== ''
                        && this.game.playerList[2].uid !== ''
                        && this.game.playerList[3].uid !== ''
                        && this.game.playerList[4].uid !== ''
                    ) Game.start(this.game);
                    break;
            }
        } else {
            switch (msg[0]) {
                case 'e':
                    if (
                        this.game.phase === Phase.Draft
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.job[msg[1]] === -1
                    ) {
                        this.game.job[msg[1]] = this.game.active;
                        this.game.playerList[this.game.active].job = parseInt(msg[1]);
                        this.game.active = (this.game.active + 1) % 5;
                        if (this.game.active === this.game.king) {
                            for (i = 0; i < this.game.job.length; i++) {
                                if (
                                    this.game.job[i] >= 0
                                    && !this.game.playerList[this.game.job[i]].isOpen
                                ) {
                                    this.game.active = this.game.job[i];
                                    this.game.playerList[this.game.job[i]].isOpen = true;
                                    break;
                                }
                            }
                            this.chat(
                                '?', 'deeppink',
                                '★' + Game.job(this.game.playerList[this.game.active].job)
                                + '(' + this.game.playerList[this.game.active].uid + ')のターン'
                            );
                            Game.openTurn(this.game);
                        }
                        this.game.sound = 'end';
                    }
                    break;
                case 'f':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        this.game.phase = Phase.DrawCard;
                        this.game.peek.push(this.game.deck.shift());
                        this.game.peek.push(this.game.deck.shift());
                        if (
                            this.game.isFirst
                            && this.game.obsOwner === this.game.active
                        ) {
                            this.game.peek.push(this.game.deck.shift());
                            this.chat('?', 'deeppink', '=>山札の上から3枚見ます。(天文台含む)');
                        } else {
                            this.chat('?', 'deeppink', '=>山札の上から2枚見ます。');
                        }
                    }
                    break;
                case 'g':
                    if (
                        this.game.phase === Phase.DrawCard
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        this.game.playerList[this.game.active].hand.push(this.game.peek[msg[1]]);
                        this.game.peek.splice(msg[1], 1);
                        if (
                            this.game.isFirst
                            && this.game.canLib
                        ) {
                            this.chat('?', 'deeppink', '=>1枚手札に加えました。(図書館)');
                            this.game.canLib = false;
                        } else {
                            this.chat('?', 'deeppink', '=>1枚手札に加えました。');
                            while (this.game.peek.length > 0) {
                                this.chat('?', 'deeppink', '=>「' + Game.build(this.game.peek[0]) + '」を諦めました。');
                                this.game.deck.push(this.game.peek.shift());
                            }
                            this.game.canDrawCard = false;
                            this.game.canGet2Coin = false;
                            if (this.game.isFirst) this.game.isFirst = false;
                            this.game.phase = Phase.Main;
                        }
                        this.game.sound = 'dice';
                    }
                    break;
                case 'h':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        this.chat('?', 'deeppink', '=>コインを2枚貰いました。');
                        this.game.playerList[this.game.active].coin += 2;
                        this.game.canDrawCard = false;
                        this.game.canGet2Coin = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'get';
                    }
                    break;
                case 'i':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.buildCount > 0
                    ) {
                        this.game.phase = Phase.Build;
                    }
                    break;
                case 'j':
                    if (
                        this.game.phase === Phase.Build
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.buildCount > 0
                    ) {
                        foo = Game.option(msg);
                        this.game.playerList[this.game.active].coin -= (this.game.playerList[this.game.active].hand[foo[0]] & 0x0f00) >> 8;
                        this.game.playerList[this.game.active].build.push(this.game.playerList[this.game.active].hand[foo[0]]);
                        switch (this.game.playerList[this.game.active].hand[foo[0]]) {
                            case Card.Cemetery:
                                this.game.cemeteryOwner = this.game.active;
                                break;
                            case Card.Laboratory:
                                this.game.laboOwner = this.game.active;
                                this.game.canLabo = true;
                                break;
                            case Card.Smith:
                                this.game.smithOwner = this.game.active;
                                this.game.canSmith = true;
                                break;
                            case Card.Observatory:
                                this.game.obsOwner = this.game.active;
                                break;
                            case Card.Library:
                                this.game.libOwner = this.game.active;
                                break;
                        }
                        if (
                            this.game.firstFinish === -1
                            && this.game.playerList[this.game.active].build.length >= 8
                        ) this.game.firstFinish = this.game.active;
                        this.chat(
                            '?', 'deeppink',
                            '=>「' + Game.build(this.game.playerList[this.game.active].hand[foo[0]])
                            + '」を建築しました。'
                        );
                        this.game.playerList[this.game.active].hand.splice(foo[0], 1);
                        this.game.buildCount--;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.phase = Phase.Main;
                        this.game.sound = 'build';
                    }
                    break;
                case 'k':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        for (i = 0; i < this.game.job.length; i++) {
                            if (i === this.game.kill) {
                                if (this.game.active < i)
                                    this.chat('?', 'deeppink', '【!】' + Game.job(i) + 'は暗殺により飛ばします。');
                            } else if (
                                this.game.job[i] >= 0
                                && !this.game.playerList[this.game.job[i]].isOpen
                            ) {
                                this.game.active = this.game.job[i];
                                this.game.playerList[this.game.job[i]].isOpen = true;
                                break;
                            }
                        }
                        if (i < this.game.job.length) {
                            this.chat(
                                '?', 'deeppink',
                                '★' + Game.job(i) + '('
                                + this.game.playerList[this.game.active].uid + ')のターン'
                            );
                            if (i === this.game.steal) {
                                this.game.playerList[this.game.job[Job.Robber]].coin += this.game.playerList[this.game.active].coin;
                                this.game.playerList[this.game.active].coin = 0;
                                this.chat('?', 'deeppink', '【!】盗賊によってコインを盗まれました。');
                            }
                            Game.openTurn(this.game);
                            this.game.sound = 'end';
                        } else {
                            if (this.game.firstFinish === -1) {
                                if (this.game.job[Job.King] >= 0) {
                                    this.game.king = this.game.job[Job.King];
                                    this.chat(
                                        '?', 'deeppink',
                                        '【!】' + this.game.playerList[this.game.king].uid
                                        + '(' + Game.color(this.game.king) + ')' + 'が王冠を獲得しました。'
                                    );
                                }
                                Game.nextRound(this.game);
                                this.game.sound = 'end';
                            } else {
                                foo = [0];
                                bar = Game.score(this.game, 0);
                                for (i = 1; i < 5; i++) {
                                    hoge = Game.score(this.game, i);
                                    if ((bar.score + bar.bonus) < (hoge.score + hoge.bonus)) {
                                        foo.length = 0;
                                        foo.push(i);
                                        bar = hoge;
                                    } else if ((bar.score + bar.bonus) === (hoge.score + hoge.bonus)) {
                                        if (bar.score < hoge.score) {
                                            foo.length = 0;
                                            foo.push(i);
                                            bar = hoge;
                                        } else if (bar.score === hoge.score) {
                                            foo.push(i);
                                        }
                                    }
                                }
                                this.chat('?', 'deeppink', '** おめでとうございます。 **');
                                for (i = 0; i < foo.length; i++) {
                                    this.chat(
                                        '?', 'deeppink',
                                        this.game.playerList[foo[i]].uid
                                        + '(' + Game.color(foo[i]) + ')の勝利です。'
                                    );
                                }
                                for (i = 0; i < 5; i++) this.game.playerList[i].uid = '';
                                this.game.sound = 'finish';
                                this.game.state = State.Ready;
                            }
                        }
                    }
                    break;
                case 'l':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canKill
                    ) {
                        this.game.phase = Phase.Kill;
                    }
                    break;
                case 'm':
                    if (
                        this.game.phase === Phase.Kill
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canKill
                    ) {
                        foo = parseInt((Game.option(msg))[0]);
                        this.chat('?', 'deeppink', '■暗殺者(暗殺)');
                        this.chat('?', 'deeppink', '→' + Game.job(foo) + 'を暗殺しました。')
                        this.game.kill = foo;
                        this.game.canKill = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.phase = Phase.Main;
                        this.game.sound = 'robber';
                    }
                    break;
                case 'n':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canSteal
                    ) {
                        this.game.phase = Phase.Steal;
                    }
                    break;
                case 'o':
                    if (
                        this.game.phase === Phase.Steal
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canSteal
                    ) {
                        foo = parseInt((Game.option(msg))[0]);
                        this.game.steal = foo;
                        this.chat('?', 'deeppink', '■泥棒(盗み)');
                        this.chat('?', 'deeppink', '→' + Game.job(foo) + 'から盗みました。');
                        this.game.canSteal = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.phase = Phase.Main;
                        this.game.sound = 'robber';
                    }
                    break;
                case 'p':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canTrade
                    ) {
                        this.game.phase = Phase.Trade;
                    }
                    break;
                case 'q':
                    if (
                        this.game.phase === Phase.Trade
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canTrade
                    ) {
                        foo = this.game.playerList[this.game.active].hand;
                        this.game.playerList[this.game.active].hand = this.game.playerList[msg[1]].hand;
                        this.game.playerList[msg[1]].hand = foo;
                        this.game.canTrade = false;
                        this.game.canReplace = false;
                        this.chat('?', 'deeppink', '■魔術師(交換)');
                        this.chat(
                            '?', 'deeppink',
                            '→' + this.game.playerList[msg[1]].uid
                            + '(' + Game.color(parseInt(msg[1])) + ')と手札を交換しました。'
                        );
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.phase = Phase.Main;
                        this.game.sound = 'robber';
                    }
                    break;
                case 'r':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canReplace
                    ) {
                        this.game.phase = Phase.Replace;
                    }
                    break;
                case 's':
                    if (
                        this.game.phase === Phase.Replace
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canReplace
                    ) {
                        if (this.game.discard === 0) this.chat('?', 'deeppink', '■魔術師(入替)');
                        foo = Game.option(msg);
                        this.chat(
                            '?', 'deeppink', 
                            '→「'
                            + Game.build(this.game.playerList[this.game.active].hand[foo[0]])
                            + '」を破棄'
                        );
                        this.game.deck.push(
                            (this.game.playerList[this.game.active].hand.splice(foo[0], 1))[0]
                        );
                        this.game.discard++;
                    }
                    break;
                case 't':
                    if (
                        this.game.phase === Phase.Replace
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canReplace
                    ) {
                        this.chat('?', 'deeppink', '→山札から' + this.game.discard + '枚引きました。');
                        while (this.game.discard > 0) {
                            this.game.playerList[this.game.active].hand.push(this.game.deck.shift());
                            this.game.discard--;
                        }
                        this.game.canTrade = false;
                        this.game.canReplace = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.phase = Phase.Main;
                        this.game.sound = 'dice';
                    }
                    break;
                case 'u':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canYellowCoin
                    ) {
                        foo = 0;
                        for (i = 0; i < this.game.playerList[this.game.active].build.length; i++) {
                            if (
                                (this.game.playerList[this.game.active].build[i] & 0xf000) === Color.Yellow
                                || this.game.playerList[this.game.active].build[i] === Card.MagicSchool
                            ) foo++;
                        }
                        this.chat('?', 'deeppink', '■国王(黄コイン)');
                        this.chat('?', 'deeppink', '→コインを' + foo + '枚貰いました。');
                        this.game.playerList[this.game.active].coin += foo;
                        this.game.canYellowCoin = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'get';
                    }
                    break;
                case 'v':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canBlueCoin
                    ) {
                        foo = 0;
                        for (i = 0; i < this.game.playerList[this.game.active].build.length; i++) {
                            if (
                                (this.game.playerList[this.game.active].build[i] & 0xf000) === Color.Blue
                                || this.game.playerList[this.game.active].build[i] === Card.MagicSchool
                            ) foo++;
                        }
                        this.chat('?', 'deeppink', '■伝道師(青コイン)');
                        this.chat('?', 'deeppink', '→コインを' + foo + '枚貰いました。');
                        this.game.playerList[this.game.active].coin += foo;
                        this.game.canBlueCoin = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'get';
                    }
                    break;
                case 'w':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canGet1Coin
                    ) {
                        this.chat('?', 'deeppink', '■商人(1コイン)');
                        this.chat('?', 'deeppink', '→コインを1枚貰いました。');
                        this.game.playerList[this.game.active].coin += 1;
                        this.game.canGet1Coin = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'get';
                    }
                    break;
                case 'x':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canGreenCoin
                    ) {
                        foo = 0;
                        for (i = 0; i < this.game.playerList[this.game.active].build.length; i++) {
                            if (
                                (this.game.playerList[this.game.active].build[i] & 0xf000) === Color.Green
                                || this.game.playerList[this.game.active].build[i] === Card.MagicSchool
                            ) foo++;
                        }
                        this.chat('?', 'deeppink', '■商人(緑コイン)');
                        this.chat('?', 'deeppink', '→コインを' + foo + '枚貰いました。');
                        this.game.playerList[this.game.active].coin += foo;
                        this.game.canGreenCoin = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'get';
                    }
                    break;
                case 'y':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canDraw2Cards
                    ) {
                        this.chat('?', 'deeppink', '■建築家(2カード)');
                        this.chat('?', 'deeppink', '→山札から2枚引きました。');
                        this.game.playerList[this.game.active].hand.push(this.game.deck.shift());
                        this.game.playerList[this.game.active].hand.push(this.game.deck.shift());
                        this.game.canDraw2Cards = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'dice';
                    }
                    break;
                case 'z':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canDestroy
                    ) {
                        this.game.phase = Phase.Destroy;
                    }
                    break;
                case 'A':
                    if (
                        this.game.phase === Phase.Destroy
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canDestroy
                    ) {
                        this.game.canDestroy = false;
                        foo = Game.option(msg);
                        this.chat('?', 'deeppink', '■傭兵(破壊)');
                        this.chat(
                            '?', 'deeppink', 
                            '→' + this.game.playerList[foo[0]].uid + '('
                            + Game.color(parseInt(foo[0])) + ')の「'
                            + Game.build(this.game.playerList[foo[0]].build[foo[1]])
                            + '」を破壊しました。'
                        );
                        this.game.playerList[this.game.active].coin -= ((this.game.playerList[foo[0]].build[foo[1]] & 0x0f00) >> 8) - 1
                        this.game.cemeteryCard = (this.game.playerList[foo[0]].build.splice(foo[1], 1))[0];
                        switch (this.game.cemeteryCard) {
                            case Card.Cemetery:
                                this.game.cemeteryOwner = -1;
                                break;
                            case Card.Laboratory:
                                this.game.cemeteryOwner = -1;
                                break;
                            case Card.Smith:
                                this.game.smithOwner = -1;
                                break;
                            case Card.Observatory:
                                this.game.obsOwner = -1;
                                break;
                            case Card.Library:
                                this.game.libOwner = -1;
                                break;
                        }
                        if (this.game.isFirst) this.game.isFirst = false;
                        if (
                            this.game.cemeteryOwner !== -1
                            && this.game.cemeteryOwner !== this.game.active
                            && this.game.playerList[this.game.cemeteryOwner].coin >= 1
                        ) {
                            this.game.phase = Phase.Cemetery;
                        } else {
                            this.game.deck.push(this.game.cemeteryCard);
                            this.game.cemeteryCard = -1;
                            this.game.phase = Phase.Main;
                        }
                        this.game.sound = 'robber';
                    }
                    break;
                case 'B':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.canRedCoin
                    ) {
                        foo = 0;
                        for (i = 0; i < this.game.playerList[this.game.active].build.length; i++) {
                            if (
                                (this.game.playerList[this.game.active].build[i] & 0xf000) === Color.Red
                                || this.game.playerList[this.game.active].build[i] === Card.MagicSchool
                            ) foo++;
                        }
                        this.chat('?', 'deeppink', '■傭兵(赤コイン)');
                        this.chat('?', 'deeppink', '→コインを' + foo + '枚貰いました。');
                        this.game.playerList[this.game.active].coin += foo;
                        this.game.canRedCoin = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.sound = 'get';
                    }
                    break;
                case 'C':
                    if (
                        this.game.phase === Phase.Cemetery
                        && this.game.playerList[this.game.cemeteryOwner].uid === uid
                    ) {
                        this.game.playerList[this.game.cemeteryOwner].coin--;
                        this.game.playerList[this.game.cemeteryOwner].hand.push(this.game.cemeteryCard);
                        this.chat(
                            '?', 'deeppink', 
                            '■墓地 [' + this.game.playerList[this.game.cemeteryOwner].uid
                            + '(' + Game.color(this.game.cemeteryOwner) + ')]'
                        );
                        this.chat('?', 'deeppink', '→１コイン支払いました。');
                        this.chat('?', 'deeppink', '→破壊されたカードを手札に加えました。');
                        this.game.cemeteryCard = -1;
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'D':
                    if (
                        this.game.phase === Phase.Cemetery
                        && this.game.playerList[this.game.cemeteryOwner].uid === uid
                    ) {
                        this.game.deck.push(this.game.cemeteryCard);
                        this.game.cemeteryCard = -1;
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'E':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.laboOwner].uid === uid
                        && this.game.canLabo
                    ) {
                        this.game.phase = Phase.Laboratory;
                    }
                    break;
                case 'F':
                    if (
                        this.game.phase === Phase.Laboratory
                        && this.game.playerList[this.game.laboOwner].uid === uid
                        && this.game.canLabo
                    ) {
                        foo = Game.option(msg);
                        this.chat('?', 'deeppink', '■研究所');
                        this.chat(
                            '?', 'deeppink', 
                            '→「'
                            + Game.build(this.game.playerList[this.game.active].hand[foo[0]])
                            + '」を捨てました。'
                        );
                        this.chat('?', 'deeppink', '→コインを1枚貰いました。');
                        this.game.deck.push(
                            (this.game.playerList[this.game.active].hand.splice(foo[0], 1))[0]
                        );
                        this.game.playerList[this.game.active].coin++;
                        this.game.canLabo = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                        this.game.phase = Phase.Main;
                        this.game.sound = 'get';
                    }
                    break;
                case 'G':
                    if (
                        this.game.phase === Phase.Main
                        && this.game.playerList[this.game.smithOwner].uid === uid
                        && this.game.canSmith
                    ) {
                        this.game.playerList[this.game.smithOwner].coin -= 3;
                        this.chat('?', 'deeppink', '■鍛冶屋');
                        this.chat('?', 'deeppink', '→山札から2枚引きました。');
                        this.game.playerList[this.game.active].hand.push(this.game.deck.shift());
                        this.game.playerList[this.game.active].hand.push(this.game.deck.shift());
                        this.game.canSmith = false;
                        if (this.game.isFirst) this.game.isFirst = false;
                    }
            }
        }
        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

AyatsuriNingen.prototype.onChat = function (user, msg) {
    var i, color = 'white';

    for (i = 0; i < this.game.playerList.length && color === 'white'; i++) {
        if (this.game.playerList[i].uid === user.uid) {
            switch (i) {
                case 0:
                    color = 'red';
                    break;
                case 1:
                    color = 'dodgerblue';
                    break;
                case 2:
                    color = 'yellow';
                    break;
                case 3:
                    color = 'lime';
                    break;
                case 4:
                    color = 'orchid';
                    break;
            }
        }
    }

    this.chat(user.uid, color, (msg.split('<').join('&lt;')).split('>').join('&gt;'));
}

AyatsuriNingen.prototype.onCommand = function (user, msg) {
    this.basicCommand(user, msg);
    switch (msg[0]) {
        case '/reset':
            if (this.ctrlr !== null && this.ctrlr.uid === user.uid) {
                Game.clear(this.game);
                this.broadcast(JSON.stringify(this.game));
                this.chat('?', 'deeppink', 'ゲームをリセットしました。');
            } else {
                this.chat('?', 'deeppink', '管理者でないためリセットできません。');
            }
            break;
    }
}

module.exports = AyatsuriNingen;