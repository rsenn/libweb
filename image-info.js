import * as path from 'path';
import { isJpeg } from './jpegSize.js';
import { jpegSize } from './jpegSize.js';
import { isPng } from './png.js';
import { PngReadHeader } from './png.js';
import { PngSize } from './png.js';

export function ImageInfo(filename) {
  let ext = path.extname(filename).toLowerCase();
  let info = { filename };

  switch (ext.slice(1)) {
    case 'png': {
      let buf = PngReadHeader(filename);
      if(isPng(buf)) {
        let [width, height] = PngSize(buf) ?? [];
        Object.assign(info, { width, height });
      }
      break;
    }
    case 'jpg':
    case 'jpeg': {
      let buf = fs.readFileSync(filename, null);
      //console.log('buf',buf);

      if(isJpeg(buf)) {
        let arr = new Uint8Array(buf);
        let props = jpegSize(arr);
        Object.assign(info, props);
      }

      break;
    }
  }
  return info;
}