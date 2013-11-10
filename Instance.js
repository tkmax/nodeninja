Instance = function () {
}

Instance.prototype.title = null;
Instance.prototype.userList = null;
Instance.prototype.ctrlr = null;

Instance.prototype.super = function () {
    this.title = 'nosubject';
    this.userList = [];
    this.ctrlr = null;
}

Instance.prototype.removeUser = function (user) {
    var i;

    for (i = 0; i < this.userList.length; i++) {
        if (this.userList[i].ws === user.ws) {
            this.userList.splice(i, 1);
            if (user.trip !== '')
                this._broadcast('F' + user.uid + '%' + user.trip);
            else
                this._broadcast('F' + user.uid);
            break;
        }
    }

    if (this.ctrlr === user) {
        this._broadcast('G');
        this.ctrlr = null;
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

    for (i = 0; i < this.userList.length; i++) {
        if (this.userList[i].uid === uid) {
            user = this.userList[i];
            break;
        }
    }
    if (user !== null) this._unicast(user, 'J' + msg);
}

Instance.prototype._broadcast = function (msg) {
    var i;

    for (i = 0; i < this.userList.length; i++) this._unicast(this.userList[i], msg);
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

Instance.prototype.onCommand = function (user, msg) { }

Instance.prototype.basicCommand = function (user, msg) {
    switch (msg[0]) {
        case '/title':
            if (msg.length > 1) {
                this.title = msg[1].substring(0, 15);
                this.chat('タイトルが「' + this.title + '」に変更されました。');
            }
            break;
        case '/grant':
            if (this.ctrlr === null) {
                this.ctrlr = user;
                this._broadcast('I' + user.uid);
                this.chat(user.uid + 'が管理者を取得しました。');
            } else {
                this.chat('既に管理者が居ます。');
            }
            break;
        case '/revoke':
            if (this.ctrlr !== null && this.ctrlr === user) {
                this.ctrlr = null;
                this._broadcast('G');
                this.chat(user.uid + 'が管理者を辞退しました。');
            } else {
                this.chat('元から管理者ではありません。');
            }
            break;
        case '/dice':
            this.chat(user.uid + 'のダイス => [' + (Math.floor(Math.random() * 100) + 1) + ']');
            break;
    }
}

module.exports = Instance;
