var Room = function () { }

Room.prototype.symbol = null;
Room.prototype.userList = null;
Room.prototype.owner = null;

Room.prototype.initialize = function (symbol) {
    this.symbol = symbol;
    this.userList = [];
    this.owner = null;
    this.isPlaying = false;
}

Room.prototype.removeUser = function (user) {
    var i;
    var len1 = this.userList.length;
    for (i = 0; i < len1; i++) {
        if (this.userList[i].ws === user.ws) {
            this.userList.splice(i, 1);

            if (user.trip !== '') {
                this._broadcast('E' + user.uid + '%' + user.trip);
            } else {
                this._broadcast('E' + user.uid);
            }

            break;
        }
    }

    if (this.owner === user) {
        this._broadcast('G');
        this.owner = null;
    }
}

Room.prototype._unicast = function (user, message) {
    try {
        user.ws.send(message);
    } catch (e) {
        this.removeUser(user);
    }
}

Room.prototype.unicast = function (uid, message) {
    var user = null;

    var i;
    var len1 = this.userList.length;
    for (i = 0; i < len1; i++) {
        if (this.userList[i].uid === uid) {
            user = this.userList[i];
            break;
        }
    }

    if (user !== null) { this._unicast(user, 'I' + message); }
}

Room.prototype._broadcast = function (message) {
    var i;
    var len1 = this.userList.length;
    for (i = 0; i < len1; i++) { this._unicast(this.userList[i], message); }
}

Room.prototype.broadcast = function (message) {
    this._broadcast('I' + message);
}

Room.prototype.chat = function (uid, color, message) {
    this._broadcast('H' + uid + ' ' + color + ' ' + message);
}

Room.prototype.reset = function () { }

Room.prototype.onLoad = function () { }

Room.prototype.onMessage = function (uid, message) { }

Room.prototype.onCommand = function (user, message) {
    this.basicCommand(user, message);
}

Room.prototype.onChat = function (user, message) {
    this.chat(user.uid, 'white', (message.split('<').join('&lt;')).split('>').join('&gt;'));
}

Room.prototype.basicCommand = function (user, message) {
    switch (message[0]) {
        case '/grant':
            if (this.owner === null) {
                this.owner = user;
                this._broadcast('F' + user.uid);

                this.chat('?', 'deeppink', user.uid + 'が管理者を取得しました。');
            } else {
                this.chat('?', 'deeppink', '既に管理者が居ます。');
            }
            break;
        case '/revoke':
            if (this.owner !== null && this.owner === user) {
                this.owner = null;
                this._broadcast('G');

                this.chat('?', 'deeppink', user.uid + 'が管理者を辞退しました。');
            } else {
                this.chat('?', 'deeppink', '元から管理者ではありません。');
            }
            break;
        case '/reset':
            if (this.owner !== null && this.owner.uid === user.uid) {
                this.reset();

                this.chat('?', 'deeppink', 'コンテンツをリセットしました。');
            } else {
                this.chat('?', 'deeppink', '管理者でないためリセットできません。');
            }
            break;
    }
}

module.exports = Room;
