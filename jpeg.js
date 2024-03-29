export function isJpeg(buf) {
  let dv = new DataView(buf);
  return typeof buf == 'object' && buf !== null && buf.byteLength >= 10 ? dv.getUint32(6, true) == 0x4649464a : false;
}

export const jpegProps = data => {
  let ret = {};
  //data is an array of bytes
  let off = 0;
  while(off < data.length) {
    while(data[off] == 0xff) off++;
    let mrkr = data[off];
    off++;
    if(!((mrkr & 0xf0) == 0xc0)) {
      if(mrkr == 0xd8) continue; //SOI
      if(mrkr == 0xd9) break; //EOI
      if(0xd0 <= mrkr && mrkr <= 0xd7) continue;
      if(mrkr == 0x01) continue; //TEM
    }
    let len = (data[off] << 8) | data[off + 1];
    off += 2;
    if((mrkr & 0xf0) == 0xc0) {
      ret = {
        depth: data[off] * data[off + 5], //precission (bits per channel)
        height: (data[off + 1] << 8) | data[off + 2],
        width: (data[off + 3] << 8) | data[off + 4],
        channels: data[off + 5] //number of color components
      };
      if(ret.width > 0 && ret.height > 0) {
        ret.aspect = (ret.width / ret.height).toFixed(3);
        ret.orientation = ret.aspect > 1 ? 'landscape' : ret.aspect < 1 ? 'portrait' : 'square';
      }
      break;
    }

    off += len - 2;
  }
  if(ret.depth === undefined) return null;
  return ret;
};

export default { isJpeg, jpegProps };
