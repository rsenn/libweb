/**
 * Start of frame markers.
 */

var sof = {
  0xc0: true,
  0xc1: true,
  0xc2: true,
  0xc3: true,
  0xc5: true,
  0xc6: true,
  0xc7: true,
  0xc9: true,
  0xca: true,
  0xcb: true,
  0xcd: true,
  0xce: true,
  0xcf: true,
};

/**
 * Uint16BE.
 */

function u16(buf, o) {
  return (buf[o] << 8) | buf[o + 1];
}

export function isJpeg(buf) {
  if(typeof buf == 'object' && buf !== null && buf.byteLength >= 10) {
    let a = new Uint8Array(buf, 6, 4);
    return /*a[0] == 0x4a && a[1] == 0x46 &&*/ (a[2] | 0x20) == 0x69 && (a[3] | 0x20) == 0x66;
  }
}

/**
 * Return dimensions from jpeg `buf`.
 *
 * @param {Buffer} buf
 * @return {Object} or undefined
 * @api public
 */

export function jpegSize(buf) {
  var len = buf.length;
  var o = 0;

  // magick
  var jpeg = 0xff == buf[0] && 0xd8 == buf[1];
  if(!jpeg) return;
  o += 2;

  while(o < len) {
    // find next marker
    while(0xff != buf[o]) o++;

    // skip marker
    while(0xff == buf[o]) o++;

    // non-SOF jump to the next marker
    if(!sof[buf[o]]) {
      o += u16(buf, ++o);
      continue;
    }

    var w = u16(buf, o + 6);
    var h = u16(buf, o + 4);

    return { width: w, height: h };
  }
}

export default jpegSize;
