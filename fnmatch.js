export const PATH_FNM_NOMATCH = 1;
export const PATH_FNM_PATHNAME = 1 << 0;
export const PATH_FNM_NOESCAPE = 1 << 1;
export const PATH_FNM_PERIOD = 1 << 2;
export const PATH_NOTFIRST = 1 << 8;

export function fnmatch(pattern, string, f = 0, depth = 0) {
  let pi = 0,
    si = 0,
    plen = pattern.length,
    slen = string.length;
  let ret = PATH_FNM_NOMATCH;
  let c = 0;

  const pinc = (n = 1) => (pi += n),
    sinc = (n = 1) => (si += n);
  const pstr = (i = 0) => pattern.substring(pi + i, plen),
    sstr = (j = 0) => string.substring(si + j, slen);

  let d = (...args) => {} //console.debug(depth, c, 'fnmatch(', inspect(pstr()), ',', inspect(sstr()), ',', f, ')', ...args);

  do {
    again:
    ++c;    d();
    if(ret === 0) break;
    if(slen == 0) {
      while(plen && pattern[pi] == '*') {
        pinc();
      }
      return plen ? PATH_FNM_NOMATCH : 0;
    }
    if(plen == 0) break;
    if(string[si] == '.' && pattern[pi] != '.' && f & PATH_FNM_PERIOD) {
      if(!(f & PATH_NOTFIRST)) return PATH_FNM_NOMATCH;
      if(f & PATH_FNM_PATHNAME && string[si - 1] == '/') return PATH_FNM_NOMATCH;
    }
    //f |= PATH_NOTFIRST;
    switch (pattern[pi]) {
      case '[': {
        let start,
          m = 0;
        pinc();
        if(string[si] == '/' && f & PATH_FNM_PATHNAME) return PATH_FNM_NOMATCH;
        m = pattern[pi] == '!';
        pinc(m);
        start = pi;
        while(plen) {
          let b = 0;
          if(pattern[pi] == ']' && pi != start) break;
          if(pattern[pi] == '[' && pattern[pi + 1] == ':') {
          } else {
            if(pi + 2 < plen && pattern[pi + 1] == '-' && pattern[pi + 2] != ']') {
              b = string[si] >= pattern[pi] && string[si] <= pattern[pi + 2];
              pinc();
            } else {
              b = pattern[pi] == string[si];
              pinc();
            }
          }
          if((b && !m) || (!b && m && pattern[pi] == ']')) {
            while(pi < plen && pattern[pi] != ']') {
              pi++;
            }
            pinc(!!plen);
            sinc();
            break;
         } else if(b && m) {
            return 0;
          }
        }
        continue;
      }
      case '\\': {
        if(!(f & PATH_FNM_NOESCAPE)) {
          pinc();
          if(plen) break;
        } else break;
        continue;
      }
      case '*': {
        if(string[si] == '/' && f & PATH_FNM_PATHNAME) {
          pinc();
          continue;
        }
        for(let i = si + 1; i < slen; i++) {
          const p = pstr(1),
            s = string.substring(i, slen);
          d(`i=`, i, `, p=`, p, `, s=`, s);
          if(p.length && s.length > 0 && s!='' && p!='' && !fnmatch(p, s, f, depth + 1)) return 0;
        }
        break;
      }
      case '?': {
        if(string[si] == '/' && f & PATH_FNM_PATHNAME) break;
        pinc();
        sinc();
        continue;
      }
      default: {
        break;
      }
    }
    if(si >= slen &&pi >= plen) {
      return 0;
    }
    if(pattern[pi] != string[si]) {
      d(` = PATH_FNM_NOMATCH`);
      return PATH_FNM_NOMATCH;
    }
    pinc();
    sinc();
  } while(plen && slen);
  d(` = ${ret}`);
  return ret;
}
