var Xors = function () { }

var x0 = 123456789, y0 = 362436069, z0 = 521288629, w0 = 88675123
  , x1 = 123456789, y1 = 362436069, z1 = 521288629, w1 = 88675123
  , shift = 0;

Xors.seed0 = function (s) {
    var i;

    w0 = s;
}

Xors.seed1 = function (s) {
    w1 = s;
}

Xors.skip = function (i) {
    while (i > 0) {
        this.rand();
        i--;
    }
}

Xors.rand = function () {
    var t;

    if (shift === 0) {
        shift = 1;
        t = x0 ^ (x0 << 11);
        x0 = y0;
        y0 = z0;
        z0 = w0;
        return w0 = (w0 ^ (w0 >> 19)) ^ (t ^ (t >> 8));
    } else {
        shift = 0;
        t = x1 ^ (x1 << 11);
        x1 = y1;
        y1 = z1;
        z1 = w1;
        return w1 = (w1 ^ (w1 >> 19)) ^ (t ^ (t >> 8));
    }
}

module.exports = Xors;