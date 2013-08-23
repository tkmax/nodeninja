var Instance = require('../Instance')
    , Const = require('./Const')
    , Player = require('./Player')
    , Game = require('./Game')
    , State = Const.State
    , Phase = Const.Phase
    , Resource = Const.Resource
    , Card = Const.Card
    , SettlementRank = Const.SettlementRank
    , SettlementLink = Const.SettlementLink
    , TileLink = Const.TileLink
    , RoadLink = Const.RoadLink
    , Harbor = Const.Harbor
    , Sea = Const.Sea;

var Cataso = function () {
    this.super();
    this.game = new Game();
    Game.clear(this.game);
};

Cataso.prototype = new Instance();

Cataso.prototype.onMessage = function (uid, msg) {
    var optn, i, j, tmp1, tmp2, resource;

    if (msg[0] === 'a') {
        this.unicast(uid, JSON.stringify(this.game));
    } else {
        if (this.game.state === State.Ready) {
            switch (msg[0]) {
                case 'b':
                    for (i in this.game.playerList) {
                        if (this.game.playerList[i].uid === '') {
                            this.game.playerList[i].uid = uid;
                            break;
                        }
                    }
                    break;
                case 'c':
                    for (i in this.game.playerList) {
                        if (this.game.playerList[i].uid === uid) {
                            this.game.playerList[i].uid = '';
                        }
                    }
                    break;
                case 'd':
                    if (this.game.playerList[0].uid !== ''
                        && this.game.playerList[1].uid !== ''
                        && this.game.playerList[2].uid !== ''
                        && this.game.playerList[3].uid !== ''
                    ) {
                        Game.start(this.game);
                    }
                    break;
            }
        } else {
            switch (msg[0]) {
                case 'e':
                    if (this.game.phase === Phase.SetupSettlement1 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        Game.buildSettlement(this.game, parseInt(optn[0]));
                        this.game.phase = Phase.SetupRoad1;
                        this.game.sound = 'build';
                    }
                    break;
                case 'f':
                    if (this.game.phase === Phase.SetupRoad1 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        Game.buildRoad(this.game, optn[0]);
                        if (this.game.active < 3) {
                            this.game.phase = Phase.SetupSettlement1;
                            this.game.active++;
                        } else {
                            this.game.phase = Phase.SetupSettlement2;
                        }
                        this.game.sound = 'end';
                    }
                    break;
                case 'g':
                    if (this.game.phase === Phase.SetupSettlement2 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        tmp1 = parseInt(optn[0]);
                        Game.buildSettlement(this.game, tmp1);
                        this.game.playerList[this.game.active].secondSettlement = tmp1;
                        for (i in TileLink) {
                            for (j in TileLink[i]) {
                                if (TileLink[i][j] === tmp1) {
                                    Game.produceResource(this.game, this.game.active, this.game.tileList[i], 1);
                                }
                            }
                        }
                        this.game.phase = Phase.SetupRoad2;
                        this.game.sound = 'build';
                    }
                    break;
                case 'h':
                    if (this.game.phase === Phase.SetupRoad2 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        Game.buildRoad(this.game, optn[0]);
                        if (this.game.active > 0) {
                            this.game.phase = Phase.SetupSettlement2;
                            this.game.active--;
                        } else {
                            this.game.phase = Phase.DiceRoll;
                        }
                        this.game.sound = 'end';
                    }
                    break;
                case 'i':
                    if (this.game.phase === Phase.DiceRoll && this.game.playerList[this.game.active].uid === uid) {
                        tmp1 = [1, 2, 3, 4, 5, 6];
                        tmp2 = [];
                        while (tmp1.length > 0) {
                            i = Math.floor(Math.random() * tmp1.length);
                            tmp2.push(tmp1[i]);
                            tmp1.splice(i, 1);
                        }
                        while (tmp2.length > 0) {
                            i = Math.floor(Math.random() * tmp2.length);
                            tmp1.push(tmp2[i]);
                            tmp2.splice(i, 1);
                        }

                        this.game.dice1 = tmp1[Math.floor(Math.random() * tmp1.length)];
                        this.game.dice2 = tmp1[Math.floor(Math.random() * tmp1.length)];
                        tmp1 = (this.game.dice1 + this.game.dice2);
                        this.chat('ダイスロール -> ' + tmp1);
                        if (tmp1 === 7) {
                            for (i = 0; i < this.game.playerList.length; i++) {
                                if (Player.sumResource(this.game.playerList[i]) >= 8) {
                                    this.chat('バースト発生 -> ' + this.game.playerList[i].uid + '(' + Game.color(i) + ')');
                                    this.game.playerList[i].burst = Math.floor(Player.sumResource(this.game.playerList[i]) / 2);
                                    this.game.phase = Phase.Burst;
                                }
                            }
                            this.chat('** 盗賊が発生しました **');
                            if (this.game.phase !== Phase.Burst) this.game.phase = Phase.Robber1;
                        } else {
                            resource = [0, 0, 0, 0, 0];
                            for (i in this.game.numList) {
                                if (
                                    i !== this.game.robber
                                    && this.game.numList[i] === tmp1
                                ) {
                                    for (j in TileLink[i]) {
                                        switch ((this.game.settlementList[TileLink[i][j]] & 0xff00)) {
                                            case SettlementRank.Settlement:
                                                resource[this.game.tileList[i]]++;
                                                break;
                                            case SettlementRank.City:
                                                resource[this.game.tileList[i]] += 2;
                                                break;
                                        }
                                    }
                                }
                            }
                            console.log(JSON.stringify(resource));
                            for (i = 0; i < resource.length; i++) {
                                if (this.game.resource[i] < resource[i]) {
                                    resource[i] = -1;
                                    switch (i) {
                                        case Resource.Brick:
                                            this.chat('** 資源不足で土の生産失敗 **');
                                            break;
                                        case Resource.Wool:
                                            this.chat('** 資源不足で羊の生産失敗 **');
                                            break;
                                        case Resource.Ore:
                                            this.chat('** 資源不足で鉄の生産失敗 **');
                                            break;
                                        case Resource.Grain:
                                            this.chat('** 資源不足で麦の生産失敗 **');
                                            break;
                                        case Resource.Lumber:
                                            this.chat('** 資源不足で木の生産失敗 **');
                                            break;
                                    }
                                    break;
                                }
                            }
                            for (i = 0; i < this.game.numList.length; i++) {
                                if (
                                    i !== this.game.robber
                                    && resource[this.game.tileList[i]] !== -1
                                    && this.game.numList[i] === tmp1
                                ) {
                                    for (j in TileLink[i]) {
                                        switch ((this.game.settlementList[TileLink[i][j]] & 0xff00)) {
                                            case SettlementRank.Settlement:
                                                Game.produceResource(this.game, this.game.settlementList[TileLink[i][j]] & 0x00ff, this.game.tileList[i], 1);
                                                break;
                                            case SettlementRank.City:
                                                Game.produceResource(this.game, this.game.settlementList[TileLink[i][j]] & 0x00ff, this.game.tileList[i], 2);
                                                break;
                                        }
                                    }
                                }
                            }
                            this.game.phase = Phase.Main;
                        }
                        this.game.sound = 'dice';
                    }
                    break;
                case 'j':
                    optn = Game.split(msg);
                    if (this.game.phase === Phase.Burst && this.game.playerList[optn[0]].uid === uid
                    && this.game.playerList[optn[0]].burst > 0 && this.game.playerList[optn[0]].resource[optn[1]] > 0) {
                        switch (parseInt(optn[1])) {
                            case Resource.Brick:
                                this.chat('土を1枚破棄 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                                break;
                            case Resource.Wool:
                                this.chat('羊を1枚破棄 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                                break;
                            case Resource.Ore:
                                this.chat('鉄を1枚破棄 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                                break;
                            case Resource.Grain:
                                this.chat('麦を1枚破棄 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                                break;
                            case Resource.Lumber:
                                this.chat('木を1枚破棄 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                                break;
                        }
                        this.game.playerList[optn[0]].burst--;
                        Game.consumeResource(this.game, optn[0], optn[1], 1);
                        tmp1 = true;
                        for (i in this.game.playerList) {
                            if (this.game.playerList[i].burst > 0) {
                                tmp1 = false;
                                break;
                            }
                        }
                        if (tmp1) this.game.phase = Phase.Robber1;
                    }
                    break;
                case 'k':
                    if (this.game.phase === Phase.Robber1 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        this.game.robber = parseInt(optn[0]);
                        tmp1 = false;
                        for (i in TileLink[this.game.robber]) {
                            if (
                                (this.game.settlementList[TileLink[this.game.robber][i]] & 0xff00) !== SettlementRank.None
                                && (this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff) !== this.game.active
                                && Player.sumResource(this.game.playerList[(this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff)]) > 0
                            ) {
                                tmp1 = true;
                            }
                        }
                        if (tmp1) {
                            this.game.phase = Phase.Robber2;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'l':
                    if (this.game.phase === Phase.Robber2 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        Game.pillageResource(this.game, optn[0]);
                        this.chat('資源を１枚略奪 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'm':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                    && this.game.playerList[this.game.active].resource[Resource.Brick] >= 1
                    && this.game.playerList[this.game.active].resource[Resource.Lumber] >= 1
                    && this.game.playerList[this.game.active].road >= 1
                    && Game.canBuildRoads(this.game)) {
                        Game.consumeResource(this.game, this.game.active, Resource.Brick, 1);
                        Game.consumeResource(this.game, this.game.active, Resource.Lumber, 1);
                        this.game.phase = Phase.BuildRoad;
                    }
                    break;
                case 'n':
                    optn = Game.split(msg);
                    if (this.game.phase === Phase.BuildRoad && this.game.playerList[this.game.active].uid === uid
                    && Game.canBuildRoad(this.game, optn[0])) {
                        tmp1 = Game.buildRoad(this.game, optn[0]);
                        this.chat('道１本を配置しました。');
                        if (tmp1 !== -1) this.chat('** ' + this.game.playerList[tmp1].uid + '(' + Game.color(tmp1) + ')' + 'が道賞を獲得しました **');
                        this.game.phase = Phase.Main;
                        this.game.sound = 'build';
                    }
                    break;
                case 'o':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                    && this.game.playerList[this.game.active].resource[Resource.Brick] >= 1
                    && this.game.playerList[this.game.active].resource[Resource.Wool] >= 1
                    && this.game.playerList[this.game.active].resource[Resource.Grain] >= 1
                    && this.game.playerList[this.game.active].resource[Resource.Lumber] >= 1
                    && this.game.playerList[this.game.active].settlement >= 1
                    && Game.canBuildSettlements(this.game)) {
                        Game.consumeResource(this.game, this.game.active, Resource.Brick, 1);
                        Game.consumeResource(this.game, this.game.active, Resource.Wool, 1);
                        Game.consumeResource(this.game, this.game.active, Resource.Grain, 1);
                        Game.consumeResource(this.game, this.game.active, Resource.Lumber, 1);
                        this.game.phase = Phase.BuildSettlement;
                    }
                    break;
                case 'p':
                    optn = Game.split(msg);
                    if (this.game.phase === Phase.BuildSettlement && this.game.playerList[this.game.active].uid === uid
                    && Game.canBuildSettlement(this.game, optn[0])) {
                        tmp1 = Game.buildSettlement(this.game, parseInt(optn[0]));
                        this.chat('家１件を配置しました。');
                        if (tmp1 !== -1) this.chat('** ' + this.game.playerList[tmp1].uid + '(' + Game.color(tmp1) + ')' + 'が道賞を獲得しました **');
                        this.game.phase = Phase.Main;
                        this.game.sound = 'build';
                    }
                    break;
                case 'q':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                    && this.game.playerList[this.game.active].resource[Resource.Ore] >= 3
                    && this.game.playerList[this.game.active].resource[Resource.Grain] >= 2
                    && this.game.playerList[this.game.active].city >= 1
                    && Game.canBuildCitys(this.game)) {
                        Game.consumeResource(this.game, this.game.active, Resource.Ore, 3);
                        Game.consumeResource(this.game, this.game.active, Resource.Grain, 2);
                        this.game.phase = Phase.BuildCity;
                    }
                    break;
                case 'r':
                    optn = Game.split(msg);
                    if (this.game.phase === Phase.BuildCity && this.game.playerList[this.game.active].uid === uid
                    && Game.canBuildCity(this.game, optn[0])) {
                        Game.buildCity(this.game, optn[0]);
                        this.chat('１件を街にしました。');
                        this.game.phase = Phase.Main;
                        this.game.sound = 'build';
                    }
                    break;
                case 's':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                    && this.game.playerList[this.game.active].resource[Resource.Wool] >= 1
                    && this.game.playerList[this.game.active].resource[Resource.Ore] >= 1
                    && this.game.playerList[this.game.active].resource[Resource.Grain] >= 1
                    && this.game.card.length >= 1) {
                        tmp1 = this.game.card.shift();
                        if (tmp1 === Card.VictoryPoint) this.game.playerList[this.game.active].bonus++;
                        this.game.playerList[this.game.active].sleepCard[tmp1]++;
                        Game.consumeResource(this.game, this.game.active, Resource.Wool, 1);
                        Game.consumeResource(this.game, this.game.active, Resource.Ore, 1);
                        Game.consumeResource(this.game, this.game.active, Resource.Grain, 1);
                        this.chat('カードを1枚引きました。');
                    }
                    break;
                case 't':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid) this.game.phase = Phase.DomesticTrade;
                    break;
                case 'u':
                    if (this.game.phase === Phase.DomesticTrade && this.game.playerList[this.game.active].uid === uid) this.game.phase = Phase.Main;
                    break;
                case 'v':
                    if (this.game.phase === Phase.DomesticTrade && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        tmp1 = '国内貿易(消費) ->';
                        if (optn[0] !== '0') {
                            tmp1 += ' 土:' + optn[0];
                            Game.consumeResource(this.game, this.game.active, Resource.Brick, parseInt(optn[0]));
                        }
                        if (optn[1] !== '0') {
                            tmp1 += ' 羊:' + optn[1];
                            Game.consumeResource(this.game, this.game.active, Resource.Wool, parseInt(optn[1]));
                        }
                        if (optn[2] !== '0') {
                            tmp1 += ' 鉄:' + optn[2];
                            Game.consumeResource(this.game, this.game.active, Resource.Ore, parseInt(optn[2]));
                        }
                        if (optn[3] !== '0') {
                            tmp1 += ' 麦:' + optn[3];
                            Game.consumeResource(this.game, this.game.active, Resource.Grain, parseInt(optn[3]));
                        }
                        if (optn[4] !== '0') {
                            tmp1 += ' 木:' + optn[4];
                            Game.consumeResource(this.game, this.game.active, Resource.Lumber, parseInt(optn[4]));
                        }
                        this.chat(tmp1);
                        tmp1 = '国内貿易(生産) ->';
                        if (optn[5] !== '0') {
                            tmp1 += ' 土:' + optn[5];
                            Game.produceResource(this.game, this.game.active, Resource.Brick, parseInt(optn[5]));
                        }
                        if (optn[6] !== '0') {
                            tmp1 += ' 羊:' + optn[6];
                            Game.produceResource(this.game, this.game.active, Resource.Wool, parseInt(optn[6]));
                        }
                        if (optn[7] !== '0') {
                            tmp1 += ' 鉄:' + optn[7];
                            Game.produceResource(this.game, this.game.active, Resource.Ore, parseInt(optn[7]));
                        }
                        if (optn[8] !== '0') {
                            tmp1 += ' 麦:' + optn[8];
                            Game.produceResource(this.game, this.game.active, Resource.Grain, parseInt(optn[8]));
                        }
                        if (optn[9] !== '0') {
                            tmp1 += ' 木:' + optn[9];
                            Game.produceResource(this.game, this.game.active, Resource.Lumber, parseInt(optn[9]));
                        }
                        this.chat(tmp1);
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'w':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid) this.game.phase = Phase.InternationalTrade1;
                    break;
                case 'x':
                    if (this.game.phase === Phase.InternationalTrade1 && this.game.playerList[this.game.active].uid === uid) this.game.phase = Phase.Main;
                    break;
                case 'y':
                    if (this.game.phase === Phase.InternationalTrade1 && this.game.playerList[this.game.active].uid === uid) {
                        optn = Game.split(msg);
                        this.game.trade.target = parseInt(optn[0]);
                        this.chat('海外貿易を申し込みました -> ' + this.game.playerList[this.game.trade.target].uid + '(' + Game.color(this.game.trade.target) + ')');
                        tmp1 = '海外貿易(出) ->';
                        if (optn[1] !== '0') {
                            tmp1 += ' 土:' + optn[1];
                            this.game.trade.consume[Resource.Brick] = parseInt(optn[1]);
                        } else {
                            this.game.trade.consume[Resource.Brick] = 0;
                        }
                        if (optn[2] !== '0') {
                            tmp1 += ' 羊:' + optn[2];
                            this.game.trade.consume[Resource.Wool] = parseInt(optn[2]);
                        } else {
                            this.game.trade.consume[Resource.Wool] = 0;
                        }
                        if (optn[3] !== '0') {
                            tmp1 += ' 鉄:' + optn[3];
                            this.game.trade.consume[Resource.Ore] = parseInt(optn[3]);
                        } else {
                            this.game.trade.consume[Resource.Ore] = 0;
                        }
                        if (optn[4] !== '0') {
                            tmp1 += ' 麦:' + optn[4];
                            this.game.trade.consume[Resource.Grain] = parseInt(optn[4]);
                        } else {
                            this.game.trade.consume[Resource.Grain] = 0;
                        }
                        if (optn[5] !== '0') {
                            tmp1 += ' 木:' + optn[5];
                            this.game.trade.consume[Resource.Lumber] = parseInt(optn[5]);
                        } else {
                            this.game.trade.consume[Resource.Lumber] = 0;
                        }
                        this.chat(tmp1);
                        tmp1 = '海外貿易(求) ->';
                        if (optn[6] !== '0') {
                            tmp1 += ' 土:' + optn[6];
                            this.game.trade.produce[Resource.Brick] = parseInt(optn[6]);
                        } else {
                            this.game.trade.produce[Resource.Brick] = 0;
                        }
                        if (optn[7] !== '0') {
                            tmp1 += ' 羊:' + optn[7];
                            this.game.trade.produce[Resource.Wool] = parseInt(optn[7]);
                        } else {
                            this.game.trade.produce[Resource.Wool] = 0;
                        }
                        if (optn[8] !== '0') {
                            tmp1 += ' 鉄:' + optn[8];
                            this.game.trade.produce[Resource.Ore] = parseInt(optn[8]);
                        } else {
                            this.game.trade.produce[Resource.Ore] = 0;
                        }
                        if (optn[9] !== '0') {
                            tmp1 += ' 麦:' + optn[9];
                            this.game.trade.produce[Resource.Grain] = parseInt(optn[9]);
                        } else {
                            this.game.trade.produce[Resource.Grain] = 0;
                        }
                        if (optn[10] !== '0') {
                            tmp1 += ' 木:' + optn[10];
                            this.game.trade.produce[Resource.Lumber] = parseInt(optn[10]);
                        } else {
                            this.game.trade.produce[Resource.Lumber] = 0;
                        }
                        this.chat(tmp1);
                        this.game.phase = Phase.InternationalTrade2;
                    }
                    break;
                case 'z':
                    if (this.game.phase === Phase.InternationalTrade2 && this.game.playerList[this.game.trade.target].uid === uid) {
                        this.chat('海外貿易が拒否されました。');
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'A':
                    if (this.game.phase === Phase.InternationalTrade2 && this.game.playerList[this.game.trade.target].uid === uid) {
                        optn = Game.split(msg);
                        if (this.game.playerList[this.game.trade.target].resource[Resource.Brick] >= this.game.trade.produce[Resource.Brick]
                        && this.game.playerList[this.game.trade.target].resource[Resource.Wool] >= this.game.trade.produce[Resource.Wool]
                        && this.game.playerList[this.game.trade.target].resource[Resource.Ore] >= this.game.trade.produce[Resource.Ore]
                        && this.game.playerList[this.game.trade.target].resource[Resource.Grain] >= this.game.trade.produce[Resource.Grain]
                        && this.game.playerList[this.game.trade.target].resource[Resource.Lumber] >= this.game.trade.produce[Resource.Lumber]
                        ) {
                            for (i = 0; i < 5; i++) {
                                this.game.playerList[this.game.active].resource[i] -= this.game.trade.consume[i];
                                this.game.playerList[this.game.active].resource[i] += this.game.trade.produce[i];
                                this.game.playerList[this.game.trade.target].resource[i] += this.game.trade.consume[i];
                                this.game.playerList[this.game.trade.target].resource[i] -= this.game.trade.produce[i];
                            }
                        } else {
                            this.chat(this.game.playerList[this.game.trade.target].uid + '(' + Game.color(this.game.trade.target) + ')の資源不足のため貿易できません。');
                        }
                        this.game.phase = Phase.Main;
                    }
                    break;
                case 'B':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid
                    && (this.game.playerList[this.game.active].score + this.game.playerList[this.game.active].bonus) >= 10) {
                        this.chat('** ' + this.game.playerList[this.game.active].uid + '(' + Game.color(this.game.active) + ')が勝利しました **');
                        for (i in this.game.playerList) this.game.playerList[i].uid = '';
                        this.game.state = State.Ready;
                    }
                    break;
                case 'C':
                    if (this.game.phase === Phase.Main && this.game.playerList[this.game.active].uid === uid) {
                        for (i = 0; i < 5; i++) {
                            this.game.playerList[this.game.active].wakeCard[i] += this.game.playerList[this.game.active].sleepCard[i];
                            this.game.playerList[this.game.active].sleepCard[i] = 0;
                        }
                        this.game.playerList[this.game.active].isPlayedCard = false;
                        this.game.dice1 = 0;
                        this.game.dice2 = 0;
                        this.game.active = (this.game.active + 1) % 4;
                        this.game.phase = Phase.DiceRoll;
                        this.game.sound = 'end';
                    }
                    break;
                case 'D':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.Soldier] > 0
                    ) {
                        Player.playCard(this.game.playerList[this.game.active], Card.Soldier);
                        if (this.game.largestArmy === -1) {
                            if (this.game.playerList[this.game.active].deadCard[Card.Soldier] >= 3) {
                                this.game.largestArmy = this.game.active;
                                this.game.playerList[this.game.active].bonus += 2;
                                this.chat('** ' + this.game.playerList[this.game.active].uid + '(' + Game.color(this.game.active) + ')' + 'が騎士賞を獲得しました **');
                            }
                        } else if (
                            this.game.largestArmy !== this.game.active
                            && this.game.playerList[this.game.active].deadCard[Card.Soldier] > this.game.playerList[this.game.largestArmy].deadCard[Card.Soldier]
                        ) {
                            this.game.playerList[this.game.largestArmy].bonus -= 2;
                            this.game.largestArmy = this.game.active;
                            this.game.playerList[this.game.active].bonus += 2;
                            this.chat('** ' + this.game.playerList[this.game.active].uid + '(' + Game.color(this.game.active) + ')' + 'が騎士賞を獲得しました **');
                        }
                        this.game.phase = Phase.Soldier1;
                    }
                    break;
                case 'E':
                    if (
                        this.game.phase === Phase.Soldier1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        optn = Game.split(msg);
                        this.game.robber = parseInt(optn[0]);
                        tmp1 = false;
                        for (i in TileLink[this.game.robber]) {
                            if (
                                (this.game.settlementList[TileLink[this.game.robber][i]] & 0xff00) !== SettlementRank.None
                                && (this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff) !== this.game.active
                                && Player.sumResource(this.game.playerList[(this.game.settlementList[TileLink[this.game.robber][i]] & 0x00ff)]) > 0
                            ) {
                                tmp1 = true;
                            }
                        }
                        if (tmp1) {
                            this.game.phase = Phase.Soldier2;
                        } else {
                            if (this.game.dice1 === 0) {
                                this.game.phase = Phase.DiceRoll;
                            } else {
                                this.game.phase = Phase.Main;
                            }
                        }
                    }
                    break;
                case 'F':
                    if (
                        this.game.phase === Phase.Soldier2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        optn = Game.split(msg);
                        Game.pillageResource(this.game, optn[0]);
                        this.chat('資源を１枚略奪 -> ' + this.game.playerList[optn[0]].uid + '(' + Game.color(parseInt(optn[0])) + ')');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'G':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.RoadBuilding] > 0
                        && Game.canBuildRoads(this.game)
                    ) {
                        Player.playCard(this.game.playerList[this.game.active], Card.RoadBuilding);
                        this.game.phase = Phase.RoadBuilding1;
                    }
                    break;
                case 'H':
                    if (
                        this.game.phase === Phase.RoadBuilding1
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        optn = Game.split(msg);
                        tmp1 = Game.buildRoad(this.game, optn[0]);
                        if (tmp1 !== -1) this.chat('** ' + this.game.playerList[tmp1].uid + '(' + Game.color(tmp1) + ')' + 'が道賞を獲得しました **');
                        if (Game.canBuildRoads(this.game)) {
                            this.game.phase = Phase.RoadBuilding2;
                        } else {
                            if (this.game.dice1 === 0) {
                                this.game.phase = Phase.DiceRoll;
                            } else {
                                this.game.phase = Phase.Main;
                            }
                        }
                        this.game.sound = 'build';
                    }
                    break;
                case 'I':
                    if (
                        this.game.phase === Phase.RoadBuilding2
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        optn = Game.split(msg);
                        tmp1 = Game.buildRoad(this.game, optn[0]);
                        if (tmp1 !== -1) this.chat('** ' + this.game.playerList[tmp1].uid + '(' + Game.color(tmp1) + ')' + 'が道賞を獲得しました **');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                        this.game.sound = 'build';
                    }
                    break;
                case 'J':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.YearOfPlenty] > 0
                        && Game.sumResource(this.game) > 0
                    ) {
                        Player.playCard(this.game.playerList[this.game.active], Card.YearOfPlenty);
                        this.game.phase = Phase.YearOfPlenty1;
                    }
                    break;
                case 'K':
                    optn = Game.split(msg);
                    if (
                        this.game.phase === Phase.YearOfPlenty1
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.resource[optn[0]] > 0
                    ) {
                        Game.produceResource(this.game, this.game.active, optn[0], 1);
                        this.chat(Game.resource(parseInt(optn[0])) + 'を生産しました。');
                        if (Game.sumResource(this.game) > 0) {
                            this.game.phase = Phase.YearOfPlenty2;
                        } else {
                            if (this.game.dice1 === 0) {
                                this.game.phase = Phase.DiceRoll;
                            } else {
                                this.game.phase = Phase.Main;
                            }
                        }
                    }
                    break;
                case 'L':
                    optn = Game.split(msg);
                    if (
                        this.game.phase === Phase.YearOfPlenty2
                        && this.game.playerList[this.game.active].uid === uid
                        && this.game.resource[optn[0]] > 0
                    ) {
                        Game.produceResource(this.game, this.game.active, optn[0], 1);
                        this.chat(Game.resource(parseInt(optn[0])) + 'を生産しました。');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
                case 'M':
                    if (
                        (this.game.phase === Phase.DiceRoll || this.game.phase === Phase.Main)
                        && this.game.playerList[this.game.active].uid === uid
                        && !this.game.playerList[this.game.active].isPlayedCard
                        && this.game.playerList[this.game.active].wakeCard[Card.Monopoly] > 0
                    ) {
                        Player.playCard(this.game.playerList[this.game.active], Card.Monopoly);
                        this.game.phase = Phase.Monopoly;
                    }
                    break;
                case 'N':
                    if (
                        this.game.phase === Phase.Monopoly
                        && this.game.playerList[this.game.active].uid === uid
                    ) {
                        optn = Game.split(msg);
                        for (i = 0; i < this.game.playerList.length; i++) {
                            if (i !== this.game.active) {
                                this.game.playerList[this.game.active].resource[optn[0]] += this.game.playerList[i].resource[optn[0]];
                                this.game.playerList[i].resource[optn[0]] = 0;
                            }
                        }
                        this.chat(Game.resource(parseInt(optn[0])) + 'を独占しました。');
                        if (this.game.dice1 === 0) {
                            this.game.phase = Phase.DiceRoll;
                        } else {
                            this.game.phase = Phase.Main;
                        }
                    }
                    break;
            }
        }
        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

Cataso.prototype.onCommand = function (uid, msg) {
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

module.exports = Cataso;