import * as fs from './lib/filesystem.js';

export function PngReadHeader(filename) {
  let file = fs.openSync(filename, 'rb');

  let buf = new ArrayBuffer(32);

  fs.readSync(file, buf, 0, 32, 0);
  fs.closeSync(file);
  return buf;
}

export function PngSize(buffer) {
  if(typeof buffer == 'string') buffer = PngReadHeader(buffer);

  let dv = new DataView(buffer, 16, 8);

  return [dv.getUint32(0), dv.getUint32(4)];
}
