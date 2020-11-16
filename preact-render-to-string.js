/*
 * concatenanted node_modules/preact-render-to-string/src/util.js
 */

export const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

export const objectKeys = Object.keys || ((obj) => {
  let keys = [  ];

  for(let i in obj)
    if(obj.hasOwnProperty(i)) keys.push(i);

  return keys;
});
export let encodeEntities = ((s) => ((((String(s)).replace(/&/g, '&amp;')).replace(/</g, '&lt;')).replace(/>/g, '&gt;')).replace(/"/g, '&quot;'));
export let indent = (s, char) => (String(s)).replace(/(\n+)/g, '$1' + (char || '\t'));
export let isLargeString = (s, length, ignoreLines) => ((String(s)).length > (length || 40) || (!ignoreLines && (String(s)).indexOf('\n') !== -1) || (String(s)).indexOf('<') !== -1);
const JS_TO_CSS = {};

export function styleObjToCss(s) {
  let str = '';

  for(let prop in s)
  {
    let val = s[prop];
  
    if(val != null) {
      if(str) str += ' ';
      str += JS_TO_CSS[prop] || (JS_TO_CSS[prop] = (prop.replace(/([A-Z])/g, '-$1')).toLowerCase());
      str += ': ';
      str += val;
    
      if(typeof val === 'number' && IS_NON_DIMENSIONAL.test(prop) === false) {
        str += 'px';
      }
    
      str += ';';
    }
  }

  return str || undefined;
};

export function assign(obj, props) {
  for(let i in props)
    obj[i] = props[i];

  return obj;
};

export function getNodeProps(vnode) {
  let props = assign({}, vnode.attributes || vnode.props);
  if(!('children' in props)) props.children = vnode.children;
  let defaultProps = ((vnode.nodeName || vnode.type)).defaultProps;

  if(defaultProps !== undefined) {
    for(let i in defaultProps)
    {
      if(props[i] === undefined) {
        props[i] = defaultProps[i];
      }
    }
  }

  return props;
};

/*
 * concatenanted node_modules/preact-render-to-string/src/index.js
 */

const SHALLOW = { shallow: true };
const UNNAMED = [  ];
const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
renderToString.render = renderToString;
let shallowRender = (vnode, context) => renderToString(vnode, context, SHALLOW);

function renderToString(vnode, context, opts, inner, isSvgMode) {
  if(vnode == null || typeof vnode === 'boolean') {
    return '';
  }

  let nodeName = vnode.nodeName || vnode.type;
   console.log("vnode:",vnode);
  console.log("vnode.props:",vnode.props);

  if(vnode instanceof Array && vnode.length == 1) {
    vnode = vnode[0];
    
  }
if(!('attributes' in vnode) && !('props' in vnode) && !('nodeName' in vnode) && !('type' in vnode))
    throw new Error("vnode invalid!");
   let { children = vnode.children, ...attributes } = vnode.attributes || vnode.props;
  let isComponent = false;
  context = context || {}
  opts = opts || {}
  let pretty = opts.pretty, indentChar = typeof pretty === 'string' ? pretty : '\t';

  if(typeof vnode !== 'object' && !nodeName) {
    return encodeEntities(vnode);
  }


  if(typeof nodeName === 'function') {
    isComponent = true;
  
    if(opts.shallow && (inner || opts.renderRootComponent === false)) {
      nodeName = getComponentName(nodeName);
    } else {
      let props = getNodeProps(vnode), rendered;
    
      if(!nodeName.prototype || typeof nodeName.prototype.render !== 'function') {
        rendered = nodeName(props, context);
      console.log("rendered:", { rendered, nodeName: nodeName+'' });
      } else {
        let c = new nodeName(props, context);
        c._disable = c.__x = true;
        c.props = props;
        c.context = context;
        if(c.componentWillMount) c.componentWillMount();
        rendered = c.render(c.props, c.state, c.context);
      
        if(c.getChildContext) {
          context = assign(assign({}, context), c.getChildContext());
        }
      console.log("rendered2:", rendered);
      }

      return renderToString(rendered, context, opts, opts.shallowHighOrder !== false);
    }
  }

  let s = '', html;

  if(attributes) {
    let attrs = objectKeys(attributes);
    if(opts && opts.sortAttributes === true) attrs.sort();
  
    for(let i = 0; i < attrs.length; i++) {
      let name = attrs[i], v = attributes[name];
      if(name === 'children') continue;
      if(name.match(/[\s\n\\/='"\0<>]/)) continue;
      if(!(opts && opts.allAttributes) && (name === 'key' || name === 'ref')) continue;
    
      if(name === 'className') {
        if(attributes.class) continue;
        name = 'class';
      } else if(isSvgMode && name.match(/^xlink:?./)) {
        name = (name.toLowerCase()).replace(/^xlink:?/, 'xlink:');
      }
    
    
      if(name === 'style' && v && typeof v === 'object') {
        v = styleObjToCss(v);
      }
    
      let hooked = opts.attributeHook && opts.attributeHook(name, v, context, opts, isComponent);
    
      if(hooked || hooked === '') {
        s += hooked;
        continue;
      }
    
    
      if(name === 'dangerouslySetInnerHTML') {
        html = v && v.__html;
      } else if((v || v === 0 || v === '') && typeof v !== 'function') {
        if(v === true || v === '') {
          v = name;
        
          if(!opts || !opts.xml) {
            s += ' ' + name;
            continue;
          }
        }
      
        s += ` ${name}="${encodeEntities(v)}"`;
      }
    }
  }

  let sub = s.replace(/^\n\s*/, ' ');
  if(sub !== s && !~sub.indexOf('\n')) s = sub; else if(pretty && ~s.indexOf('\n')) s += '\n';
  s = `<${nodeName}${s}>`;
  if((String(nodeName)).match(/[\s\n\\/='"\0<>]/)) throw s;
  
  let isVoid = (String(nodeName)).match(VOID_ELEMENTS);
  if(isVoid) s = s.replace(/>$/, ' />');
  let pieces = [  ];

  if(html) {
    if(pretty && isLargeString(html)) {
      html = '\n' + indentChar + indent(html, indentChar);
    }
  
    s += html;
  } else if(children) {
    let hasLarge = ~s.indexOf('\n');

    console.log("children:", children);

    for(let i = 0; i < children.length; i++) {
      let child = children[i];
    console.log("child:", child);
    
      if(child != null && child !== false) {
        let childSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode, ret = renderToString(child, context, opts, true, childSvgMode);
        if(!hasLarge && pretty && isLargeString(ret)) hasLarge = true;
        if(ret) pieces.push(ret);
      }
    }
  
  
    if(pretty && hasLarge) {
      for(let i = pieces.length; i--; undefined) {
        pieces[i] = '\n' + indentChar + indent(pieces[i], indentChar);
      }
    }
  }


  if(pieces.length) {
    s += pieces.join('');
  } else if(opts && opts.xml) {
    return s.substring(0, s.length - 1) + ' />';
  }


  if(!isVoid) {
    if(pretty && ~s.indexOf('\n')) s += '\n';
    s += `</${nodeName}>`;
  }

  return s;
};

function getComponentName(component) {
  return component.displayName || component !== Function && component.name || getFallbackComponentName(component);
};

function getFallbackComponentName(component) {
  let str = Function.prototype.toString.call(component), name = ((str.match(/^\s*function\s+([^( ]+)/) || ''))[1];

  if(!name) {
    let index = -1;
  
    for(let i = UNNAMED.length; i--; undefined) {
      if(UNNAMED[i] === component) {
        index = i;
        break;
      }
    }
  
  
    if(index < 0) {
      index = UNNAMED.push(component) - 1;
    }
  
    name = `UnnamedComponent${index}`;
  }

  return name;
};
renderToString.shallowRender = shallowRender;
export default renderToString;
export { renderToString as render, renderToString, shallowRender };

