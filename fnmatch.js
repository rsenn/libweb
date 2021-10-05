export const PATH_FNM_NOMATCH = 1;
export const PATH_FNM_PATHNAME = 1 << 0;
export const PATH_FNM_NOESCAPE = 1 << 1;
export const PATH_FNM_PERIOD = 1 << 2;
export const PATH_FNM_MULTI = 1 << 3;
export const PATH_NOTFIRST = 1 << 8;

export function fnmatch(p, s, f = 0, depth = 0) {
  let pi = 0,
    si = 0,
    pj = p.length,
    sj = s.length;
  let ret = PATH_FNM_NOMATCH;
  let c = 0;

  if(f & PATH_FNM_MULTI) {
    if(p.split(/;|\n|\|/g).some(pattern => fnmatch(pattern, s, f & ~PATH_FNM_MULTI, depth) == 0))
      return 0;
  }

  const pinc = (n = 1) => (pi += n),
    sinc = (n = 1) => (si += n);
  const pstr = (i = 0) => p.substring(pi + i, pj),
    sstr = (j = 0) => s.substring(si + j, sj);

  let d = (...args) => {}; //console.debug(depth, c, 'fnmatch(', inspect(pstr()), ',', inspect(sstr()), ',', f, ')', ...args);

  do {
    again: ++c;
    d();
    if(ret === 0) break;
    if(sj == 0) {
      while(pj && p[pi] == '*') {
        pinc();
      }
      return pj ? PATH_FNM_NOMATCH : 0;
    }
    if(pj == 0) break;
    if(s[si] == '.' && p[pi] != '.' && f & PATH_FNM_PERIOD) {
      if(!(f & PATH_NOTFIRST)) return PATH_FNM_NOMATCH;
      if(f & PATH_FNM_PATHNAME && s[si - 1] == '/') return PATH_FNM_NOMATCH;
    }
    //f |= PATH_NOTFIRST;
    switch (p[pi]) {
      case '[': {
        let start,
          m = 0;
        pinc();
        if(s[si] == '/' && f & PATH_FNM_PATHNAME) return PATH_FNM_NOMATCH;
        m = p[pi] == '!';
        pinc(m);
        start = pi;
        while(pj) {
          let b = 0;
          if(p[pi] == ']' && pi != start) break;
          if(p[pi] == '[' && p[pi + 1] == ':') {
          } else {
            if(pi + 2 < pj && p[pi + 1] == '-' && p[pi + 2] != ']') {
              b = s[si] >= p[pi] && s[si] <= p[pi + 2];
              pinc();
            } else {
              b = p[pi] == s[si];
              pinc();
            }
          }
          if((b && !m) || (!b && m && p[pi] == ']')) {
            while(pi < pj && p[pi] != ']') {
              pi++;
            }
            pinc(!!pj);
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
          if(pj) break;
        } else break;
        continue;
      }
      case '*': {
        let i, q, t;
        if(s[si] == '/' && f & PATH_FNM_PATHNAME) {
          pinc();
          continue;
        }
        i = si + 1;
        q = p.substring(pi + 1);
        if(pi + 1 == pj) return 0;
        for(; i < sj; i++) {
          t = s.substring(i);
          d(`i=`, i, `, p=`, q, `, s=`, t);
          if(/*t != '' && q != '' &&*/ !fnmatch(q, t, f, depth + 1)) {
            return 0;
          }
        }
        continue;
      }
      case '?': {
        if(s[si] == '/' && f & PATH_FNM_PATHNAME) break;
        pinc();
        sinc();
        continue;
      }
      default: {
        break;
      }
    }
    if(si >= sj && pi >= pj) {
      return 0;
    }
    if(p[pi] != s[si]) {
      d(` = PATH_FNM_NOMATCH`);
      return PATH_FNM_NOMATCH;
    }
    pinc();
    sinc();
  } while(pj && sj);
  d(` = ${ret}`);
  return ret;
}
