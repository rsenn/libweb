import { Path } from './path.js';

export const toXML = function(o, z = 10000, q = '"') {
  if(typeof o == 'object' && o !== null && 'raw' in o) o = o.raw;
  if(o instanceof Array) return o.map(toXML).join('\n');
  else if(typeof o == 'string') return o;
  else if(typeof o != 'object' || o.tagName === undefined) return '';
  let { tagName, attributes, children, ...obj } = o;
  let s = `<${tagName}`;
  let attrs = attributes || obj;
  for(let k in attrs) s += ` ${k}=${q}${attrs[k]}${q}`;
  const a = children && children.length !== undefined ? children : [];
  if(a && a.length > 0) {
    s += tagName[0] != '?' ? '>' : '?>';
    const textChildren = typeof a[0] == 'string';
    let nl = textChildren ? '' : tagName == 'text' && a.length == 1 ? '' : tagName[0] != '?' ? '\n  ' : '\n';
    if(textChildren) s += a.join('\n') + `</${tagName}>`;
    else {
      for(let child of a) s += nl + toXML(child, z === true || z > 0 ? z : z - 1).replace(/>\n/g, '>' + nl);
      if(tagName[0] != '?') s += `${ntl.replace(/ /g, '')}</${tagName}>`;
    }
  } else if(Object.keys(attrs).length == 0) s += `></${tagName}>`;
  else s += ' />';
  return s.trim();
};

export const findXPath = (xpath, flat, { root, recursive = true, entries = false }) => {
  let r = [];
  let s = (xpath + '').substring(0, xpath.length) + (recursive ? '([[/].*|)' : '[^/]*');
  s = s.replace(/[_:'%]/g, '[^/]');
  if(s[s.length - 1] != '$') s += '$';
  s = s.replace(/^\/\//, '/(|.*/)');

  if(s[0] != '^' && xpath.substring(0, 2) != '//') s = '^' + s;
  console.log('', { s });
  let re = new RegExp(s);
  let m = other => re.test(other);

  for(let [path, obj] of flat) {
    let tmp = new Path(path == '' ? [] : path, true);
    obj = tmp.apply(root);
    let xpath = tmp.xpath(root); //(obj2path(obj));
    if(m(xpath)) r.push([xpath, obj]);
  }
  return entries ? r : new Map(r);
};
