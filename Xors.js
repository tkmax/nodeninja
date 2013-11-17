var Xors = function () { }

var x = 123456789, y = 362436069, z = 521288629, w = 88675123;

Xors.seed = function(s) {
    w = s;
}

Xors.rand = function () {
    var t;
    t = x ^ (x << 11);
    x = y;
    y = z;
    z = w;
    w = (w ^ (w >> 19)) ^ (t ^ (t >> 8));
    return w;
}

module.exports = Xors;