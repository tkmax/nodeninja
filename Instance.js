Instance = function () {
}

Instance.prototype.title = null;
Instance.prototype.userList = null;
Instance.prototype.ctrlr = null;

Instance.prototype.super = function () {
    this.title = 'ようこそ!';
    this.userList = [];
    this.ctrlr = null;
}

Instance.prototype.removeUser = function (user) {
    var i;

    for (i in this.userList) {
        if (this.userList[i].ws === user.ws) {
            this.userList.splice(i, 1);
            if (user.trip !== '') {
                this._broadcast('F' + user.uid + '%' + user.trip);
            } else {
                this._broadcast('F' + user.uid);
            }
            break;
        }
    }
    if (this.ctrlr === user) {
        if (this.userList.length > 0) {
            this.ctrlr = this.userList[0];
            if (this.ctrlr.trip !== '') {
                this._broadcast('I' + this.ctrlr.uid + '%' + this.ctrlr.trip);
            } else {
                this._broadcast('I' + this.ctrlr.uid);
            }
        } else {
            this.ctrlr = null;
        }
    }
}

Instance.prototype._unicast = function (user, msg) {
    try {
        user.ws.send(msg);
    } catch (e) {
        this.removeUser(user);
    }
}

Instance.prototype.unicast = function (uid, msg) {
    var i, user = null;
    for (i in this.userList) {
        if (this.userList[i].uid === uid) {
            user = this.userList[i];
            break;
        }
    }
    if (user !== null) this._unicast(user, 'J' + msg);
}

Instance.prototype._broadcast = function (msg) {
    var i;
    for (i in this.userList) {
        this._unicast(this.userList[i], msg);
    }
}

Instance.prototype.broadcast = function (msg) {
    this._broadcast('J' + msg);
}

Instance.prototype.chat = function (msg) {
    var i;
    for (i in this.userList) {
        this.userList[i].ws.send('H? ' + msg);
    }
}

Instance.prototype.onLoad = function () { }

Instance.prototype.onMessage = function (uid, msg) { }

Instance.prototype.onCommand = function (uid, msg) { }

Instance.prototype.basicCommand = function (uid, msg) {
    switch (msg[0]) {
        case '/title':
            if (msg.length > 1) {
                this.title = msg[1].substring(0, 16);
                this.chat('タイトルが「' + this.title + '」に変更されました。');
            }
            break;
        case '/dice':
            this.chat('<span class="label label-inverse">' + uid + '</span>のダイス => [' + (Math.floor(Math.random() * 100) + 1) + ']');
            break;
    }
}
module.exports = Instance;
