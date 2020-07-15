import Util from '../util.js';

export const toXML = function(o, z = 10000, q = '"') {
  if(Util.isArray(o)) return o.length === 1 ? toXML(o[0]) : o.map(toXML).join('\n');
  if(typeof o == 'object' && o !== null && 'raw' in o) o = o.raw;
  else if(typeof o == 'string') return o;
  else if(typeof o != 'object') return o + '';
  else if(o.tagName === undefined) return o + '';
  let { tagName, attributes, children, ...obj } = o;
  let s = `<${tagName}`;
  let attrs = attributes || obj;
  //if(!Util.isEmpty(attrs)) console.log('attrs:', attributes);
  for(let k in attrs) s += ` ${k}=${q}${attrs[k]}${q}`;
  const a = children && children.length !== undefined ? children : [];
  if(a && a.length > 0) {
    s += tagName[0] != '?' ? '>' : '?>';
    const textChildren = typeof a[0] == 'string';
    let nl = textChildren ? '' : tagName == 'text' && a.length == 1 ? '' : tagName[0] != '?' ? '\n  ' : '\n';
    if(textChildren) s += a.join('\n') + `</${tagName}>`;
    else if(z > 0) {
      for(let child of a) s += nl + toXML(child, z > 0 ? z - 1 : z).replace(/>\n/g, '>' + nl);
      if(tagName[0] != '?') s += `${nl.replace(/ /g, '')}</${tagName}>`;
    }
  } else if(Object.keys(attrs).length == 0) s += `></${tagName}>`;
  else s += ' />';
  return s.trim();
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
