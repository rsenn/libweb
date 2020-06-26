export const toXML = function(o, z = 10000) {
  if(typeof o == 'object' && o !== null && 'raw' in o) o = o.raw;
  if(o instanceof Array) return o.map(toXML).join('\n');
  else if(typeof o == 'string') return o;
  else if(typeof o != 'object' || o.tagName === undefined) return '';
  let { tagName, attributes, children, ...obj } = o;
  let s = `<${tagName}`;
  let attrs = attributes || obj;
  for(let k in attrs) s += ` ${k}="${attrs[k]}"`;
  const a = children && children.length !== undefined ? children : [];
  if(a && a.length > 0) {
    s += tagName[0] != '?' ? '>' : '?>';
    const textChildren = typeof a[0] == 'string';
    let nl = textChildren ? '' : tagName == 'text' && a.length == 1 ? '' : tagName[0] != '?' ? '\n  ' : '\n';
    if(textChildren) s += a.join('\n') + `</${tagName}>`;
    else {
      for(let child of a) s += nl + toXML(child, z === true || z > 0 ? z : z - 1).replace(/>\n/g, '>' + nl);
      if(tagName[0] != '?') s += `${nl.replace(/ /g, '')}</${tagName}>`;
    }
  } else if(Object.keys(attrs).length == 0) s += `></${tagName}>`;
  else s += ' />';
  return s.trim();
};
