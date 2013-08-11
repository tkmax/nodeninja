var Instance = require('../Instance')
    , util = require('util');

var Youtube = function () {
    var i;
    this.super();
    this.currentVideo = null;
    this.currentVideoStart = null;
    this.idList = [];
    for (i = 0; i < 100; i++) this.idList.push(false);
    this.videoList = [];
    this.timeoutId = null;
}

Youtube.prototype = new Instance();

Youtube.prototype.getVideo = function (id) {
    var i;
    for (i in this.videoList) {
        if (this.videoList[i].id === id) return this.videoList[i];
    }
    return null;
}

Youtube.nextPlay = function (youtube) {
    var i, idx = null, nextIdx;

    if (youtube.videoList.length === 0) return;

    if (youtube.videoList.length > 1) {
        for (i in youtube.videoList) {
            if (youtube.videoList[i].id === youtube.currentVideo.id) {
                idx = parseInt(i);
                break;
            }
        }
        if (idx === null) return;
        nextIdx = (idx + 1) % youtube.videoList.length;
    } else {
        nextIdx = 0;
    }
    youtube.currentVideo = youtube.videoList[nextIdx];
    youtube.currentVideoStart = new Date().getTime();
    youtube.broadcast('B ' + youtube.currentVideo.id + ' ' + 0 + ' ' + youtube.currentVideoStart);
    youtube.timeoutId = setTimeout(Youtube.nextPlay, (youtube.currentVideo.duration + 3) * 1000, youtube);
}

Youtube.prototype.onMessage = function (uid, msg) {
    var tmp, i, foo, bar, data;

    switch (msg[0]) {
        case 'a':
            this.unicast(uid, 'A ' + JSON.stringify(this.videoList));
            if (this.currentVideo !== null) {
                foo = new Date().getTime();
                bar = Math.floor((foo - this.currentVideoStart) / 1000);
                if (bar < this.currentVideo.duration) this.unicast(uid, 'B ' + this.currentVideo.id + ' ' + bar + ' ' + this.currentVideoStart);
            }
            break;
        case 'b':
            if (this.videoList.length < 100) {
                data = JSON.parse(msg.substring(2));
                for (i in this.idList) {
                    if (!this.idList[i]) {
                        data.id = parseInt(i);
                        break;
                    }
                }
                this.idList[data.id] = true;
                this.videoList.push(data);
                this.broadcast('A ' + JSON.stringify(this.videoList));
            } else {
                this.chat('100件までしか登録できません。');
            }
            break;
        case 'c':
            tmp = msg.split(' ');
            foo = parseInt(tmp[1]);
            bar = null;
            for (i in this.videoList) {
                if (this.videoList[i].id === foo) {
                    bar = i;
                    break;
                }
            }
            if (bar === null) return;
            this.videoList.splice(bar, 1);
            this.idList[foo] = false;
            this.broadcast('A ' + JSON.stringify(this.videoList));
            break;
        case 'd':
            tmp = msg.split(' ');
            foo = parseInt(tmp[1]);
            data = null;
            for (i in this.videoList) {
                if (this.videoList[i].id === foo) {
                    data = i;
                    break;
                }
            }
            if (data === null) return;
            this.currentVideo = this.videoList[data];
            this.currentVideoStart = new Date().getTime();
            this.broadcast('B ' + this.currentVideo.id + ' ' + 0 + ' ' + this.currentVideoStart);
            if (this.timeoutId !== null) clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(Youtube.nextPlay, (this.currentVideo.duration + 3) * 1000, this);
            break;
        case 'e':
            tmp = msg.split(' ');
            foo = tmp[1].split(',');
            bar = [];
            for (i in foo) {
                data = this.getVideo(parseInt(foo[i]));
                if (data !== null) bar.push(data);
            }
            if (bar.length > 0) this.videoList = bar;
            this.broadcast('A ' + JSON.stringify(this.videoList));
            break;
    }
}

Youtube.prototype.onCommand = function (uid, msg) { 
    this.basicCommand(uid, msg);
}

module.exports = Youtube;