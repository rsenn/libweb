const UTF8FirstCodeMask = [0x1f, 0xf, 0x7, 0x3, 0x1];
const UTF8MinCode = [0x80, 0x800, 0x10000, 0x00200000, 0x04000000];

export function toString(arrayBuf, encoding = 'utf-8') {
  if(encoding == 'latin1') {
    let binary = '';
    let bytes = new Uint8Array(arrayBuf);
    let len = bytes.byteLength;
    for(let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return binary;
  }

  let a = new Uint8Array(arrayBuf);
  let p = 0;
  let o = '';
  let len = a.length;
  for(p = 0; p < len; ) {
    let max_len = len - p;
    let l, c, b, i;

    c = a[p++];
    if(c < 0x80) {
      o += String.fromCodePoint(c);
      continue;
    }

    switch (c) {
      case 0xc0:
      case 0xc1:
      case 0xc2:
      case 0xc3:
      case 0xc4:
      case 0xc5:
      case 0xc6:
      case 0xc7:
      case 0xc8:
      case 0xc9:
      case 0xca:
      case 0xcb:
      case 0xcc:
      case 0xcd:
      case 0xce:
      case 0xcf:
      case 0xd0:
      case 0xd1:
      case 0xd2:
      case 0xd3:
      case 0xd4:
      case 0xd5:
      case 0xd6:
      case 0xd7:
      case 0xd8:
      case 0xd9:
      case 0xda:
      case 0xdb:
      case 0xdc:
      case 0xdd:
      case 0xde:
      case 0xdf:
        l = 1;
        break;
      case 0xe0:
      case 0xe1:
      case 0xe2:
      case 0xe3:
      case 0xe4:
      case 0xe5:
      case 0xe6:
      case 0xe7:
      case 0xe8:
      case 0xe9:
      case 0xea:
      case 0xeb:
      case 0xec:
      case 0xed:
      case 0xee:
      case 0xef:
        l = 2;
        break;
      case 0xf0:
      case 0xf1:
      case 0xf2:
      case 0xf3:
      case 0xf4:
      case 0xf5:
      case 0xf6:
      case 0xf7:
        l = 3;
        break;
      case 0xf8:
      case 0xf9:
      case 0xfa:
      case 0xfb:
        l = 4;
        break;
      case 0xfc:
      case 0xfd:
        l = 5;
        break;
      default: return null;
    }
    /* check that we have enough characters */
    if(l > max_len - 1) return -1;

    c &= UTF8FirstCodeMask[l - 1];
    for(i = 0; i < l; i++) {
      b = a[p++];
      if(b < 0x80 || b >= 0xc0) return -1;

      c = (c << 6) | (b & 0x3f);
    }
    if(c < UTF8MinCode[l - 1]) return -1;
    o += String.fromCodePoint(c);
  }
  return o;
}

export function toArrayBuffer(str, encoding) {
  if(encoding == 'latin1') {
    let i,
      len = str.length;
    let a = new Uint8Array(len);
    for(i = 0; i < len; i++) {
      a[i] = str.charCodeAt(i);
    }
    return a.buffer;
  }
  let offset, length;
  const end = Math.min((length ?? str.length - (offset | 0)) + (offset | 0), str.length);
  console.log('end:', end);

  const a = [];
  for(let i = offset | 0; i < end; i++) {
    const c = str.codePointAt(i);

    if(c < 0x80) {
      a.push(c);
    } else {
      if(c < 0x800) {
        a.push((c >> 6) | 0xc0);
      } else {
        if(c < 0x10000) {
          a.push((c >> 12) | 0xe0);
        } else {
          if(c < 0x00200000) {
            a.push((c >> 18) | 0xf0);
          } else {
            if(c < 0x04000000) {
              a.push((c >> 24) | 0xf8);
            } else if(c < 0x80000000) {
              a.push((c >> 30) | 0xfc);
              a.push(((c >> 24) & 0x3f) | 0x80);
            } else {
              return 0;
            }
            a.push(((c >> 18) & 0x3f) | 0x80);
          }
          a.push(((c >> 12) & 0x3f) | 0x80);
        }
        a.push(((c >> 6) & 0x3f) | 0x80);
      }
      a.push((c & 0x3f) | 0x80);
    }
  }
  const u8a = Uint8Array.from(a);
  console.log('toArrayBuffer', { a, u8a });
  return u8a.buffer;
}
