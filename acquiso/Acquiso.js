var Room = require('../Room')
    , Const = require('./Const')
    , Player = require('./Player')
    , Game = require('./Game')
    , MersenneTwister = require('../MersenneTwister')
    , FontColor = Const.FontColor
    , State = Const.State
    , Phase = Const.Phase
    , ColorName = Const.ColorName
    , HotelChain = Const.HotelChain
    , HotelChainName = Const.HotelChainName
    , TileName = Const.TileName
    , Position = Const.Position
    , Rotation = Const.Rotation;

var Acquiso = function () {
    this.initialize('a');
    this.game = new Game();
    this.mt = new MersenneTwister();
    Game.clear(this.game);
};

Acquiso.prototype = new Room();

Acquiso.prototype.mergeHotelChainChat = function () {
    var i, j, majority, minority
        , hotelChain = this.game.hotelChain
        , majorityBonus, minorityBonus;

    for (i = this.game.hotelChain.length - 1; i >= 0; i--) {
        if (this.game.hotelChain[i].isParent) {
            this.chat(
                '?', 'deeppink'
                , '(親)「' + HotelChainName[i] + '」合併'
            );
        }
    }

    for (i = 0; i < hotelChain.length; i++) {
        if (hotelChain[i].isSubsidiary) {
            this.chat(
                '?', 'deeppink'
                , '「' + HotelChainName[i] + '」吸収'
            );
            if (hotelChain[i].majority.length > 0) {
                majority = hotelChain[i].majority;
                minority = hotelChain[i].minority;
                majorityBonus = Game.getMajorityBonus(this.game, i);
                minorityBonus = Game.getMinorityBonus(this.game, i);

                if (majority.length === 1) {
                    if (minority.length === 0)
                        majorityBonus += minorityBonus;

                    this.chat(
                        '?', FontColor[majority[0]]
                        , '筆頭株主「' + this.game.playerList[majority[0]].uid
                          + '(' + ColorName[majority[0]] + ')」'
                          + '$' + majorityBonus
                    );

                    if (minority.length > 0) {
                        minorityBonus
                            = Math.floor(minorityBonus / minority.length / 100) * 100;

                        for (j = 0; j < minority.length; j++) {
                            this.chat(
                                '?', FontColor[minority[j]]
                                , '次席株主「' + this.game.playerList[minority[j]].uid
                                  + '(' + ColorName[minority[j]] + ')」'
                                  + '$' + minorityBonus
                            );
                        }
                    }
                } else {
                    majorityBonus
                        = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                    for (j = 0; j < majority.length; j++) {
                        this.chat(
                            '?', FontColor[majority[j]]
                            , '筆頭株主「' + this.game.playerList[majority[j]].uid
                              + '(' + ColorName[majority[j]] + ')」'
                              + '$' + majorityBonus
                        );
                    }
                }
            }
        }
    }
}

Acquiso.prototype.settleChat = function () {
    var i, j, majority, minority
        , hotelChain = this.game.hotelChain
        , majorityBonus, minorityBonus
        , playerCertificateNumber;

    for (i = 0; i < hotelChain.length; i++) {
        if (hotelChain[i].position !== Position.None) {
            this.chat(
                '?', 'deeppink'
                , '--「' + HotelChainName[i] + '」配当--'
            );
            if (hotelChain[i].majority.length > 0) {
                majority = hotelChain[i].majority;
                minority = hotelChain[i].minority;
                majorityBonus = Game.getMajorityBonus(this.game, i);
                minorityBonus = Game.getMinorityBonus(this.game, i);

                if (majority.length === 1) {
                    if (minority.length === 0)
                        majorityBonus += minorityBonus;

                    this.chat(
                        '?', FontColor[majority[0]]
                        , '筆頭株主「' + this.game.playerList[majority[0]].uid
                          + '(' + ColorName[majority[0]] + ')」'
                          + '$' + majorityBonus
                    );

                    if (minority.length > 0) {
                        minorityBonus
                            = Math.floor(minorityBonus / minority.length / 100) * 100;

                        for (j = 0; j < minority.length; j++) {
                            this.chat(
                                '?', FontColor[minority[j]]
                                , '次席株主「' + this.game.playerList[minority[j]].uid
                                  + '(' + ColorName[minority[j]] + ')」'
                                  + '$' + minorityBonus
                            );
                        }
                    }
                } else {
                    majorityBonus
                        = Math.floor((majorityBonus + minorityBonus) / majority.length / 100) * 100;

                    for (j = 0; j < majority.length; j++) {
                        this.chat(
                            '?', FontColor[majority[j]]
                            , '筆頭株主「' + this.game.playerList[majority[j]].uid
                              + '(' + ColorName[majority[j]] + ')」'
                              + '$' + majorityBonus
                        );
                    }
                }
            }
            for (j = 0; j < this.game.playerNumber; j++) {
                playerCertificateNumber = this.game.playerList[j].certificate[i];

                if (playerCertificateNumber > 0) {
                    this.chat(
                        '?', FontColor[j]
                        , '「' + this.game.playerList[j].uid
                          + '(' + ColorName[j] + ')」'
                          + playerCertificateNumber + '枚'
                          + ' $' + Game.getStockPrice(this.game, i)
                          * playerCertificateNumber
                    );
                }
            }
        }
    }
}

Acquiso.prototype.winnerChat = function () {
    var i, winner = [], max = 0;

    for (i = 0; i < this.game.playerNumber; i++) {
        if (this.game.playerList[i].money > max) {
            max = this.game.playerList[i].money;
            winner.length = 0;
            winner.push(i);
        } else if (this.game.playerList[i].money === max) {
            winner.push(i);
        }
    }

    this.chat(
        '?', 'orange'
        , '++勝利 おめでとう++'
    );

    for (i = 0; i < winner.length; i++) {
        this.chat(
            '?', 'deeppink'
            , '「' + this.game.playerList[winner[i]].uid
              + '(' + ColorName[winner[i]] + ')」'
        );
    }
}

Acquiso.prototype.onMessage = function (uid, msg) {
    var option = Game.split(msg), i, j, priorityPlayer;

    if (msg[0] === 'a') {
        this.unicast(uid, JSON.stringify(this.game));
    } else {
        if (this.game.state === State.Ready) {
            switch (msg[0]) {
                case 'b':
                    for (i = 0; i < this.game.playerList.length; i++) {
                        if (this.game.playerList[i].uid === '') {
                            this.game.sound = 'join';
                            this.game.playerList[i].uid = uid;
                            break;
                        }
                    }
                    break;
                case 'c':
                    for (i = 0; i < this.game.playerList.length; i++)
                        if (this.game.playerList[i].uid === uid) this.game.playerList[i].uid = '';
                    break;
                case 'd':
                    if (
                           this.game.playerList[0].uid !== ''
                        && this.game.playerList[1].uid !== ''
                        && this.game.playerList[2].uid !== ''
                    ) {
                        this.game.sound = 'opening';
                        this.isPlaying = true;
                        Game.start(this.game, this.mt);
                        this.chat(
                            '?', 'orange'
                            , '--「' + this.game.playerList[this.game.active].uid
                              + '(' + ColorName[this.game.active] + ')」ターン--'
                        );
                    }
                    break;
            }
        } else {
            priorityPlayer = this.game.playerList[this.game.priority];

            if (priorityPlayer.uid === uid) {
                switch (msg[0]) {
                    case 'e':
                        if (this.game.phase === Phase.Trash)
                            this.game.phase = Phase.Play;
                        else if (
                               this.game.phase === Phase.Sell
                            || this.game.phase === Phase.Trade
                        )
                            this.game.phase = Phase.Merge;
                        break;
                    case 'f':
                        if (this.game.phase === Phase.Play) this.game.phase = Phase.Trash;
                        break;
                    case 'g':
                        if (this.game.phase === Phase.Trash) {
                            this.chat(
                                '?', 'deeppink'
                                , '「' + TileName[
                                        this.game.playerList[this.game.priority].hand[option[0]]
                                    ] + '」を廃棄'
                            );
                            this.game.playerList[this.game.priority].hand.splice(option[0], 1);
                            this.game.canTrash = false;
                            this.game.phase = Phase.Play;
                        }
                        break;
                    case 'h':
                        if (this.game.phase === Phase.Play) {
                            this.game.sound = 'get';
                            this.game.justPlayTile = priorityPlayer.hand.splice(option[0], 1)[0];
                            this.game.map[this.game.justPlayTile].isCover = true;
                            this.chat('?', 'deeppink', '「' + TileName[this.game.justPlayTile] + '」配置');
                            this.game.phase = Game.getNextPhaseFromPlay(this.game);
                            switch (this.game.phase) {
                                case Phase.Absorb:
                                    if (Game.absorbUniqueHotelChain(this.game)) {
                                        this.game.sound = 'robber';
                                        this.mergeHotelChainChat();
                                        Game.payBonus(this.game);
                                        this.game.phase = Phase.Merge;
                                    }
                                    break;
                                case Phase.Buy:
                                    Game.repaintPlayedHotelChain(this.game);
                                    this.game.sound = 'build';
                                    break;
                            }
                        }
                        break;
                    case 'i':
                        if (this.game.phase === Phase.Play) {
                            this.chat('?', 'deeppink', 'パス');
                            this.game.phase = Phase.Buy;
                        }
                        break;
                    case 'j':
                        if (this.game.phase === Phase.Chain) {
                            this.game.sound = 'dice';
                            Game.playHotelChain(this.game, option[0]);
                            this.chat('?', 'deeppink', '「' + HotelChainName[option[0]] + '」設立');
                            Game.repaintPlayedHotelChain(this.game);
                            this.game.phase = Phase.Buy;
                        }
                        break;
                    case 'k':
                        if (this.game.phase === Phase.Absorb) {
                            this.game.sound = 'robber';
                            i = parseInt(option[0]);
                            for (j = this.game.hotelChain.length - 1; j >= 0; j--) {
                                if (this.game.hotelChain[j].isParent && i !== j) {
                                    this.game.hotelChain[j].isParent = false;
                                    this.game.hotelChain[j].isSubsidiary = true;
                                }
                            }
                            this.mergeHotelChainChat();
                            Game.payBonus(this.game);
                            this.game.phase = Phase.Merge;
                        }
                        break;
                    case 'l':
                        if (this.game.phase === Phase.Merge) this.game.phase = Phase.Sell;
                        break;
                    case 'm':
                        if (this.game.phase === Phase.Sell) {
                            for (i = option.length - 1; i >= 0; i--) {
                                if (option[i] !== '0') {
                                    j = parseInt(option[i]);
                                    this.chat(
                                        '?', FontColor[this.game.priority]
                                        , '売却:「' + HotelChainName[i] + '」' + option[i]
                                          + '枚→$' + Game.getStockPrice(this.game, i) * j
                                    );
                                    Game.sellCertificate(this.game, i, j);
                                }
                            }
                            this.game.phase = Phase.Merge;
                        }
                        break;
                    case 'n':
                        if (this.game.phase === Phase.Merge) this.game.phase = Phase.Trade;
                        break;
                    case 'o':
                        if (this.game.phase === Phase.Trade) {
                            this.chat(
                                '?', FontColor[this.game.priority]
                                , '交換:'
                            );
                            for (i = 0; i < 7; i++) {
                                if (option[i] !== '0') {
                                    this.chat(
                                        '?', FontColor[this.game.priority]
                                        , '「' + HotelChainName[i] + '」' + option[i] + '枚'
                                    );
                                    Game.loseCertificate(this.game, i, parseInt(option[i]));
                                }
                            }
                            this.chat('?', FontColor[this.game.priority], '↓');
                            for (i = 7; i < 14; i++) {
                                if (option[i] !== '0') {
                                    j = i - 7;
                                    this.chat(
                                        '?', FontColor[this.game.priority]
                                        , '「' + HotelChainName[j] + '」' + option[i] + '枚'
                                    );
                                    Game.gainCertificate(this.game, j, parseInt(option[i]));
                                }
                            }
                            this.game.phase = Phase.Merge;
                        }
                        break;
                    case 'p':
                        if (this.game.phase === Phase.Merge) {
                            this.game.sound = 'end'
                            this.game.priority = (this.game.priority + 1) % this.game.playerNumber;
                            if (this.game.priority === this.game.active) {
                                for (i = this.game.hotelChain.length - 1; i >= 0; i--) {
                                    if (this.game.hotelChain[i].isSubsidiary) {
                                        this.game.hotelChain[i].isSubsidiary = false;
                                        this.game.hotelChain[i].position = Position.None;
                                        this.game.hotelChain[i].rotation = Rotation.None;
                                        this.game.hotelChain[i].size = 0;
                                    }
                                }
                                Game.repaintPlayedHotelChain(this.game);
                                this.game.phase = Phase.Buy;
                            }
                        }
                        break;
                    case 'q':
                        if (this.game.phase === Phase.Buy) {
                            for (i = option.length - 1; i >= 0; i--) {
                                if (option[i] !== '0') {
                                    Game.buyCertificate(this.game, i, parseInt(option[i]));
                                    this.game.buyTicket -= parseInt(option[i]);
                                    this.chat(
                                        '?', 'deeppink'
                                        , '購入:「' + HotelChainName[i] + '」' + option[i] + '枚'
                                    );
                                }
                            }
                        }
                        break;
                    case 'r':
                        if (this.game.phase === Phase.Buy) {
                            this.game.sound = 'end';
                            Game.drawTile(this.game, this.game.priority);
                            this.game.active = (this.game.active + 1) % this.game.playerNumber;
                            this.chat(
                                '?', 'orange'
                                , '--「' + this.game.playerList[this.game.active].uid
                                  + '(' + ColorName[this.game.active] + ')」ターン--'
                            );
                            this.game.priority = this.game.active;
                            this.game.phase = Phase.Play;
                            this.game.buyTicket = 3;
                            this.game.canTrash = true;
                        }
                        break;
                    case 's':
                        if (this.game.phase === Phase.Buy) {
                            this.game.sound = 'finish';
                            this.chat(
                                '?', 'orange'
                                , '--決済宣言--'
                            );
                            this.settleChat();
                            Game.settle(this.game);
                            this.winnerChat();
                            for (i = this.game.playerNumber - 1; i >= 0; i--)
                                this.game.playerList[i].uid = '';
                            this.game.state = State.Ready;
                            this.game.playerNumber = 4;
                            this.isPlaying = false;
                        }
                        break;
                }
            }
        }
        this.broadcast(JSON.stringify(this.game));
        this.game.sound = '';
    }
}

Acquiso.prototype.onChat = function (user, msg) {
    var i, color = 'white';

    for (i = 0; i < this.game.playerList.length; i++) {
        if (this.game.playerList[i].uid === user.uid) {
            color = FontColor[i];
            break;
        }
    }

    this.chat(user.uid, color, (msg.split('<').join('&lt;')).split('>').join('&gt;'));
}

Acquiso.prototype.onCommand = function (user, msg) {
    this.basicCommand(user, msg);
    switch (msg[0]) {
        case '/reset':
            if (this.ctrlr !== null && this.ctrlr.uid === user.uid) {
                this.isPlaying = false;
                Game.clear(this.game);
                this.broadcast(JSON.stringify(this.game));
                this.chat('?', 'deeppink', 'ゲームをリセットしました。');
            } else {
                this.chat('?', 'deeppink', '管理者でないためリセットできません。');
            }
            break;
    }
}

module.exports = Acquiso;