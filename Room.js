var MersenneTwister = require('./MersenneTwister');

var Room = function () {
}

Room.prototype.title = null;
Room.prototype.userList = null;
Room.prototype.ctrlr = null;

Room.prototype.initialize = function (symbol) {
    this.symbol = symbol;
    this.userList = [];
    this.ctrlr = null;
    this.isPlaying = false;
}

Room.prototype.removeUser = function (user) {
    var i;

    for (i = 0; i < this.userList.length; i++) {
        if (this.userList[i].ws === user.ws) {
            this.userList.splice(i, 1);
            if (user.trip !== '')
                this._broadcast('E' + user.uid + '%' + user.trip);
            else
                this._broadcast('E' + user.uid);
            break;
        }
    }

    if (this.ctrlr === user) {
        this._broadcast('G');
        this.ctrlr = null;
    }
}

Room.prototype._unicast = function (user, msg) {
    try {
        user.ws.send(msg);
    } catch (e) {
        this.removeUser(user);
    }
}

Room.prototype.unicast = function (uid, msg) {
    var i, user = null;

    for (i = 0; i < this.userList.length; i++) {
        if (this.userList[i].uid === uid) {
            user = this.userList[i];
            break;
        }
    }
    if (user !== null) this._unicast(user, 'I' + msg);
}

Room.prototype._broadcast = function (msg) {
    var i;

    for (i = 0; i < this.userList.length; i++)
        this._unicast(this.userList[i], msg);
}

Room.prototype.broadcast = function (msg) {
    this._broadcast('I' + msg);
}

Room.prototype.chat = function (uid, color, msg) {
    this._broadcast('H' + uid + ' ' + color + ' ' + msg);
}

Room.prototype.onLoad = function () { }

Room.prototype.onMessage = function (uid, msg) { }

Room.prototype.onCommand = function (user, msg) { }

Room.prototype.onChat = function (user, msg) {
    this.chat(user.uid, 'white', (msg.split('<').join('&lt;')).split('>').join('&gt;'));
}

Room.prototype.basicCommand = function (user, msg) {
    switch (msg[0]) {
        case '/grant':
            if (this.ctrlr === null) {
                this.ctrlr = user;
                this._broadcast('F' + user.uid);
                this.chat('?', 'deeppink', user.uid + 'が管理者を取得しました。');
            } else {
                this.chat('?', 'deeppink', '既に管理者が居ます。');
            }
            break;
        case '/revoke':
            if (this.ctrlr !== null && this.ctrlr === user) {
                this.ctrlr = null;
                this._broadcast('G');
                this.chat('?', 'deeppink', user.uid + 'が管理者を辞退しました。');
            } else {
                this.chat('?', 'deeppink', '元から管理者ではありません。');
            }
            break;
        case '/dice':
            this.chat('?', 'deeppink', user.uid + 'のダイス=>[' + MersenneTwister.Share.nextInt(1, 100) + ']');
            break;
    }
}

module.exports = Room;
