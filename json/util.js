import Util from '../util.js';

export const toXML =  (o, ...opts) => {
  let [depth, quote, indent] =
    typeof opts[0] == 'object' ? [opts.depth, opts.quote, opts.indent] : opts;
  depth ??= 10000;
  quote ??= '"';
  indent = typeof indent == 'string' ? indent : '  ';

  // console.log("toXML", { o,opts,depth,quote,indent});
  if(typeof o == 'object' && o !== null) {
    if('raw' in o) o = o.raw;
    if(Util.isArray(o))
      return o.length === 1
        ? toString(o[0], depth)
        : o.map(it => toString(it, depth)).join('\n');
    return toString(o, depth);
  }

  function toString(o, depth) {
    if(typeof o == 'string') return o;
    else if(typeof o != 'object') return o + '';
    else if(o.tagName === undefined) return o + '';
    let { tagName, attributes, children, ...obj } = o;
    let s = `<${tagName}`;
    let attrs = attributes || obj;
     for(let k in attrs) {
       let v = attrs[k];
      s += ' '+k;
      if(v !== true) s += '='+quote+v+quote;
    }
    const a = children && children.length !== undefined ? children : [];
    if(a && a.length > 0) {
      s += tagName[0] != '?' ? '>' : '?>';
      const textChildren = typeof a[0] == 'string';
      let nl = textChildren
        ? ''
        : tagName == 'text' && a.length == 1
        ? ''
        : tagName[0] != '?'
        ? '\n' + indent
        : '\n';
      if(textChildren) s += a.join('\n') + `</${tagName}>`;
      else if(depth > 0) {
        for(let child of a)
          s +=
            nl +
            toString(child, depth > 0 ? depth - 1 : depth).replace(/>\n/g, '>' + nl);
        if(tagName[0] != '?') s += `${nl.replace(/ /g, '')}</${tagName}>`;
      }
    } else {
      if(tagName[0] != '!') s += ' /';
      s += '>';
    }
    return s;
  }
};

export class Iterator {
  [Symbol.iterator]() {
    if(typeof this.next == 'function') return this;
    if(this.gen !== undefined) return this.gen;
  }
}

export class IteratorAdapter extends Iterator {
  constructor(gen) {
    super();
    if(gen) Util.define(this, { gen });
  }
}
