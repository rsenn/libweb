import { PngReadHeader, isPng, PngSize } from './png.js';
import { isJpeg, jpegProps } from './jpeg.js';
import * as path from 'path';

export function ImageSize(filename) {
  let ext = path.extname(filename).toLowerCase();
  switch (ext.slice(1)) {
    case 'png': {
      let buf = PngReadHeader(filename);
      if(isPng(buf)) return PngSize(buf);

      break;
    }
    case 'jpg':
    case 'jpeg': {
      let buf = fs.readFileSync(filename, null);
      console.log('buf', buf);

      if(isJpeg(buf)) {
        let arr = new Uint8Array(buf);
        let props = jpegProps(arr);

        let { width, height } = props ?? {};
        return [width, height];
      }

      break;
    }
  }
}
