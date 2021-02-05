export function parse(s) {
  let i = 0;
  let n = s.length;
  let r = [];
  let st = [r];
  let e;

  const startElem = tagName => {
    e = { tagName, attributes: {}, children: [] };
    st[0].push(e);
    st.unshift(e.children);
  };
  const endElem = tagName => {
    //assert_equal(tagName, e.tagName);
    st.shift();
    e = null;
  };
  const skip = pred => {
    let k;
    for(k = i; pred(s[k]); ) k++;
    return k;
  };
  const skipSpace = () => {
    /*     i += skip(c => c == ' ' || c == '\n' || c == '\r' || c == '\t');*/
    while(s[i] == ' ' || s[i] == '\n' || s[i] == '\r' || s[i] == '\t') i++;
  };

  function assert_equal(a, b) {
    if(a != b) throw new Error(`${a} != ${b}`);
  }

  while(i < n) {
    let j;

    for(j = i; s[j] != '<'; ) j++;
    // = skip(c => c != '<');

    if(j > i) st[0].push(s.substring(i, j));

    i = j;
    //console.log('#1', { i, n }, `'${s[i]}'`, `c=${s.charCodeAt(i)}`);

    if(s[i] == '<') {
      let closing = false;
      i++;
      if(s[i] == '/') {
        closing = true;
        i++;
      }
      j = skip(c => c != ' ' && c != '\n' && c != '\r' && c != '\t' && c != '>' && c != '/');
      //    Math.min(...[s.indexOf(' '), s.indexOf('\t'), s.indexOf('>'), s.indexOf('/')].filter(x => x != -1) );
      let name = s.substring(i, j);
      i = j;
      if(!closing) {
        startElem(name);
        for(;;) {
          skipSpace();
          //console.log('#2', { i, name }, `'${s[i]}'`, `"${s.substring(i, i + 10)}..."`);
          if(s[i] == '>' || s[i] == '/') break;
          j = skip(c =>
              c != '=' &&
              c != ' ' &&
              c != '\t' &&
              c != '\r' &&
              c != '\n' &&
              c != '?' &&
              c != '!' &&
              c != '>'
          );
          //          for(j = i; s[j] != '='; j++);

          if(j == i) break;

          let attr = s.substring(i, j);
          let value = true;

          i = j;
          if(s[i] == '=' && s[i + 1] == '"') {
            i += 2;
            for(j = i; s[j] != '"'; j++) if(s[j] == '\\') j++;
            value = s.substring(i, j);
            if(s[j] == '"') j++;
            i = j;
          }
          e.attributes[attr] = value;
          //console.log('#4', { attr, value });
        }
      } else {
        endElem(name);
      }

      if(name[0] == '!') {
        //console.log('!', { i, j }, `'${s[i]}'`, `"${s.substring(i, i + 10)}..."`);

        endElem(name);
      }
      if(name[0] == '?' && s[i] == '?') {
        i++;
      } else if(s[i] == '/') {
        i++;
        endElem(name);
      }
      skipSpace();

      if(s[i] == '>') {
        i++;
      }
      skipSpace();

      //console.log('#3', { i,  n }, `'${s[i]}'`, `"${s.substring(i, i + 10)}..."`);
    }
  }
  //console.log('#5', { i,  n } , r);
  return r;
}

export default parse;
