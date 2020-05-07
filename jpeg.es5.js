"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isJpeg = isJpeg;
exports.default = exports.jpegProps = void 0;

function isJpeg(buf) {
  return typeof buf == "object" && buf !== null && buf.length >= 10 ? buf.readUInt32LE(6) == 0x4649464a : false;
}

const jpegProps = data => {
  var ret = {};
  var off = 0;

  while (off < data.length) {
    while (data[off] == 0xff) off++;

    var mrkr = data[off];
    off++;

    if (!((mrkr & 0xf0) == 0xc0)) {
      if (mrkr == 0xd8) continue;
      if (mrkr == 0xd9) break;
      if (0xd0 <= mrkr && mrkr <= 0xd7) continue;
      if (mrkr == 0x01) continue;
    }

    var len = data[off] << 8 | data[off + 1];
    off += 2;

    if ((mrkr & 0xf0) == 0xc0) {
      ret = {
        depth: data[off] * data[off + 5],
        height: data[off + 1] << 8 | data[off + 2],
        width: data[off + 3] << 8 | data[off + 4],
        channels: data[off + 5]
      };

      if (ret.width > 0 && ret.height > 0) {
        ret.aspect = (ret.width / ret.height).toFixed(3);
        ret.orientation = ret.aspect > 1 ? "landscape" : ret.aspect < 1 ? "portrait" : "square";
      }

      break;
    }

    off += len - 2;
  }

  if (ret.depth === undefined) return null;
  return ret;
};

exports.jpegProps = jpegProps;
var _default = {
  isJpeg,
  jpegProps
};
exports.default = _default;
