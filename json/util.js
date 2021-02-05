import Util from '../util.js';

export const toXML = function(o, ...opts) {
  let [depth, quote, indent] =
    typeof opts[0] == 'object' ? [opts.depth, opts.quote, opts.indent] : opts;
  depth ??= 10000;
  quote ??= '"';
  indent ??= '  ';
  if(typeof o == 'object' && o !== null) {
    if('raw' in o) o = o.raw;
    if(Util.isArray(o)) return o.length === 1 ? toXML(o[0]) : o.map(toXML).join('\n');
  }
  if(typeof o == 'string') return o;
  else if(typeof o != 'object') return o + '';
  else if(o.tagName === undefined) return o + '';
  let { tagName, attributes, children, ...obj } = o;
  let s = `<${tagName}`;
  let attrs = attributes || obj;
  //if(!Util.isEmpty(attrs)) Util.log('attrs:', attributes);
  for(let k in attrs) {
    s += ` ${k}`;

if(attrs[k] !== true)
    s += `=${quote}${attrs[k]}${quote}`;
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
      ? '\n  '
      : '\n';
    if(textChildren) s += a.join('\n') + `</${tagName}>`;
    else if(depth > 0) {
      for(let child of a)
        s += nl + toXML(child, depth > 0 ? depth - 1 : depth).replace(/>\n/g, '>' + nl);
      if(tagName[0] != '?') s += `${nl.replace(/ /g, '')}</${tagName}>`;
    }
  } 
  else {
    if(tagName[0] != '!')
    s += ' /';
    s += '>';
  }
  return s;
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
