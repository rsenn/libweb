const WS = 0x01;
const START = 0x02;
const END = 0x04;
const QUOTE = 0x08;
const CLOSE = 0x10;
const EQUAL = 0x20;
const SPECIAL = 0x40;
const SLASH = 0x80;
const BACKSLASH = 0x100;
const QUESTION = 0x200;
const EXCLAM = 0x400;

const CharacterClasses = {
  ' ': WS,
  '\t': WS,
  '\r': WS,
  '\n': WS,
  '!': SPECIAL | EXCLAM,
  '"': QUOTE,
  '/': END | SLASH,
  '<': START,
  '=': EQUAL,
  '>': END | CLOSE,
  '?': SPECIAL | QUESTION,
  '\\': BACKSLASH
};
const CharCodeClasses = {
  0x20: WS,
  0x09: WS,
  0x0d: WS,
  0x0a: WS,
  0x21: SPECIAL | EXCLAM,
  0x22: QUOTE,
  0x2f: END | SLASH,
  0x3c: START,
  0x3d: EQUAL,
  0x3e: END | CLOSE,
  0x3f: SPECIAL | QUESTION,
  0x5c: BACKSLASH
};

export function parse(s) {
  if(typeof s != 'string') {
    if(s instanceof ArrayBuffer) s = new Uint8Array(s);
  }
  let i = 0;
  let n = s.length;
  let r = [];
  let st = [r];
  let e;
  const m = typeof s == 'string' ? CharacterClasses : CharCodeClasses;
  const codeAt = typeof s == 'string' ? i => s.codePointAt(i) : i => s[i];
  const range =
    typeof s == 'string'
      ? (i, j) => s.substring(i, j)
      : (i, j) => [...s.slice(i, j)].reduce((a, c) => a + String.fromCharCode(c), '');
  const start = tagName => {
    e = { tagName, attributes: {}, children: [] };
    st[0].push(e);
    st.unshift(e.children);
  };
  const end = tagName => {
    st.shift();
    e = null;
  };
  const skip = pred => {
    let k;
    for(k = i; pred(s[k]); ) k++;
    return k;
  };
  const skipws = () => {
    while(m[s[i]] & WS) i++;
  };

  while(i < n) {
    let j;
    for(j = i; (m[s[j]] & START) == 0; ) j++;
    if(j > i) {
      const data = range(i, j);
      if(data.trim() != '') st[0].push(data);
    }
    i = j;
    if(m[s[i]] & START) {
      let closing = false;
      i++;
      if(m[s[i]] & SLASH) {
        closing = true;
        i++;
      }
      //console.log('#1', { i, n,closing }, `'${range(i,i+1)}'`, `c=${codeAt(i)}`);
      j = skip(c => (m[c] & (WS | END)) == 0);
      let name = range(i, j);
      i = j;
      if(!closing) {
        start(name);
        for(;;) {
          skipws();
          if(m[s[i]] & END) break;
          j = skip(c => (m[c] & (EQUAL | WS | SPECIAL | CLOSE)) == 0);
          if(j == i) break;
          let attr = range(i, j);
          let value = true;
          i = j;
          if(m[s[i]] & EQUAL && m[s[i + 1]] & QUOTE) {
            //console.log('#2', { i, name }, `'${range(i,i+1)}'`, `"${range(i, i + 20)}..."`);
            i += 2;
            for(j = i; (m[s[j]] & QUOTE) == 0; j++) if(m[s[j]] & BACKSLASH) j++;
            value = range(i, j);
            if(m[s[j]] & QUOTE) j++;
            i = j;
          }
          e.attributes[attr] = value;
          //console.log('#3', { attr, value });
        }
      } else {
        end(name);
      }
      //console.log('#4', { i, j }, `'${range(i,i+1)}'`, `"${range(i, i + 10)}..."`);
      if(name[0] == '!') {
        end(name);
      }
      if(name[0] == '?' && m[s[i]] & QUESTION) {
        i++;
      } else if(m[s[i]] & SLASH) {
        i++;
        end(name);
      }
      skipws();
      if(m[s[i]] & CLOSE) i++;
      skipws();
      //console.log('#5', { i,  n }, `'${range(i,i+1)}'`, `"${range(i, i + 10)}..."`);
    }
  }
  //console.log('#6', { i,  n } , r);
  return r;
}

export default parse;
