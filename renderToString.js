import { options, Fragment, createElement } from './preact.js';

let IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;
let encodeEntities = function(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
let indent = function(s, char) {
  return String(s).replace(/(\n+)/g, '$1' + (char || '\t'));
};
let isLargeString = function(s, length, ignoreLines) {
  return (
    String(s).length > (length || 40) ||
    (!ignoreLines && String(s).indexOf('\n') !== -1) ||
    String(s).indexOf('<') !== -1
  );
};
let JS_TO_CSS = {};
function styleObjToCss(s) {
  let str = '';
  for(let prop in s) {
    let val = s[prop];
    if(val != null) {
      if(str) {
        str += ' ';
      }
      str +=
        prop[0] == '-' ? prop : JS_TO_CSS[prop] || (JS_TO_CSS[prop] = prop.replace(/([A-Z])/g, '-$1').toLowerCase());
      str += ': ';
      str += val;
      if(typeof val === 'number' && IS_NON_DIMENSIONAL.test(prop) === false) {
        str += 'px';
      }
      str += ';';
    }
  }
  return str || undefined;
}

function assign(obj, props) {
  for(let i in props) {
    obj[i] = props[i];
  }
  return obj;
}

function getChildren(accumulator, children) {
  if(Array.isArray(children)) {
    children.reduce(getChildren, accumulator);
  } else if(children != null && children !== false) {
    accumulator.push(children);
  }
  return accumulator;
}

let SHALLOW = {
  shallow: true
};
let UNNAMED = [];
let VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
let noop = function() {};
renderToString.render = renderToString;
let shallowRender = function(vnode, context) {
  return renderToString(vnode, context, SHALLOW);
};
function renderToString(vnode, context, opts, inner, isSvgMode, selectValue) {
  if(vnode == null || typeof vnode === 'boolean') {
    return '';
  }
  if(Array.isArray(vnode)) {
    vnode = createElement(Fragment, null, vnode);
  }
  let nodeName = vnode.type,
    props = vnode.props,
    isComponent = false;
  context = context || {};
  opts = opts || {};
  let pretty = opts.pretty,
    indentChar = pretty && typeof pretty === 'string' ? pretty : '\t';
  if(typeof vnode !== 'object' && !nodeName) {
    return encodeEntities(vnode);
  }
  if(typeof nodeName === 'function') {
    isComponent = true;
    if(opts.shallow && (inner || opts.renderRootComponent === false)) {
      nodeName = getComponentName(nodeName);
    } else if(nodeName === Fragment) {
      let rendered = '';
      let children$1 = [];
      getChildren(children$1, vnode.props.children);
      for(let i = 0; i < children$1.length; i++) {
        rendered +=
          (i > 0 && pretty ? '\n' : '') +
          renderToString(children$1[i], context, opts, opts.shallowHighOrder !== false, isSvgMode, selectValue);
      }
      return rendered;
    } else {
      let rendered$1;
      let c = (vnode.__c = {
        __v: vnode,
        context,
        props: vnode.props,
        setState: noop,
        forceUpdate: noop,
        __h: []
      });
      if(options.__r) {
        options.__r(vnode);
      }
      if(!nodeName.prototype || typeof nodeName.prototype.render !== 'function') {
        let cxType = nodeName.contextType;
        let provider = cxType && context[cxType.__c];
        let cctx = cxType != null ? (provider ? provider.props.value : cxType.__) : context;
        rendered$1 = nodeName.call(vnode.__c, props, cctx);
      } else {
        let cxType$1 = nodeName.contextType;
        let provider$1 = cxType$1 && context[cxType$1.__c];
        let cctx$1 = cxType$1 != null ? (provider$1 ? provider$1.props.value : cxType$1.__) : context;
        c = vnode.__c = new nodeName(props, cctx$1);
        c.__v = vnode;
        c._dirty = c.__d = true;
        c.props = props;
        if(c.state == null) {
          c.state = {};
        }
        if(c._nextState == null && c.__s == null) {
          c._nextState = c.__s = c.state;
        }
        c.context = cctx$1;
        if(nodeName.getDerivedStateFromProps) {
          c.state = assign(assign({}, c.state), nodeName.getDerivedStateFromProps(c.props, c.state));
        } else if(c.componentWillMount) {
          c.componentWillMount();
          c.state = c._nextState !== c.state ? c._nextState : c.__s !== c.state ? c.__s : c.state;
        }
        rendered$1 = c.render(c.props, c.state, c.context);
      }
      if(c.getChildContext) {
        context = assign(assign({}, context), c.getChildContext());
      }
      return renderToString(rendered$1, context, opts, opts.shallowHighOrder !== false, isSvgMode, selectValue);
    }
  }
  let s = '',
    propChildren,
    html;
  if(props) {
    let attrs = Object.keys(props);
    if(opts && opts.sortAttributes === true) {
      attrs.sort();
    }
    for(let i$1 = 0; i$1 < attrs.length; i$1++) {
      let name = attrs[i$1],
        v = props[name];
      if(name === 'children') {
        propChildren = v;
        continue;
      }
      if(name.match(/[\s\n\\/='"\0<>]/)) {
        continue;
      }
      if(
        !(opts && opts.allAttributes) &&
        (name === 'key' || name === 'ref' || name === '__self' || name === '__source' || name === 'defaultValue')
      ) {
        continue;
      }
      if(name === 'className') {
        if(props.class) {
          continue;
        }
        name = 'class';
      } else if(isSvgMode && name.match(/^xlink:?./)) {
        name = name.toLowerCase().replace(/^xlink:?/, 'xlink:');
      }
      if(name === 'htmlFor') {
        if(props.for) {
          continue;
        }
        name = 'for';
      }
      if(name === 'style' && v && typeof v === 'object') {
        v = styleObjToCss(v);
      }
      if(name[0] === 'a' && name['1'] === 'r' && typeof v === 'boolean') {
        v = String(v);
      }
      let hooked = opts.attributeHook && opts.attributeHook(name, v, context, opts, isComponent);
      if(hooked || hooked === '') {
        s += hooked;
        continue;
      }
      if(name === 'dangerouslySetInnerHTML') {
        html = v && v.__html;
      } else if(nodeName === 'textarea' && name === 'value') {
        propChildren = v;
      } else if((v || v === 0 || v === '') && typeof v !== 'function') {
        if(v === true || v === '') {
          v = name;
          if(!opts || !opts.xml) {
            s += ' ' + name;
            continue;
          }
        }
        if(name === 'value') {
          if(nodeName === 'select') {
            selectValue = v;
            continue;
          } else if(nodeName === 'option' && selectValue == v) {
            s += ' selected';
          }
        }
        s += ' ' + name + '="' + encodeEntities(v) + '"';
      }
    }
  }
  if(pretty) {
    let sub = s.replace(/^\n\s*/, ' ');
    if(sub !== s && !~sub.indexOf('\n')) {
      s = sub;
    } else if(pretty && ~s.indexOf('\n')) {
      s += '\n';
    }
  }
  s = '<' + nodeName + s + '>';
  if(String(nodeName).match(/[\s\n\\/='"\0<>]/)) {
    throw new Error(nodeName + ' is not a valid HTML tag name in ' + s);
  }
  let isVoid =
    String(nodeName).match(VOID_ELEMENTS) || (opts.voidElements && String(nodeName).match(opts.voidElements));
  if(isVoid) {
    s = s.replace(/>$/, ' />');
  }
  let pieces = [];
  let children;
  if(html) {
    if(pretty && isLargeString(html)) {
      html = '\n' + indentChar + indent(html, indentChar);
    }
    s += html;
  } else if(propChildren != null && getChildren((children = []), propChildren).length) {
    let hasLarge = pretty && ~s.indexOf('\n');
    let lastWasText = false;
    for(let i$2 = 0; i$2 < children.length; i$2++) {
      let child = children[i$2];
      if(child != null && child !== false) {
        let childSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode,
          ret = renderToString(child, context, opts, true, childSvgMode, selectValue);
        if(pretty && !hasLarge && isLargeString(ret)) {
          hasLarge = true;
        }
        if(ret) {
          if(pretty) {
            let isText = ret.length > 0 && ret[0] != '<';
            if(lastWasText && isText) {
              pieces[pieces.length - 1] += ret;
            } else {
              pieces.push(ret);
            }
            lastWasText = isText;
          } else {
            pieces.push(ret);
          }
        }
      }
    }
    if(pretty && hasLarge) {
      for(let i$3 = pieces.length; i$3--; ) {
        pieces[i$3] = '\n' + indentChar + indent(pieces[i$3], indentChar);
      }
    }
  }
  if(pieces.length) {
    s += pieces.join('');
  } else if(opts && opts.xml) {
    return s.substring(0, s.length - 1) + ' />';
  }
  if(!isVoid) {
    if(pretty && ~s.indexOf('\n')) {
      s += '\n';
    }
    s += '</' + nodeName + '>';
  }
  return s;
}

function getComponentName(component) {
  return component.displayName || (component !== Function && component.name) || getFallbackComponentName(component);
}

function getFallbackComponentName(component) {
  let str = Function.prototype.toString.call(component),
    name = (str.match(/^\s*function\s+([^( ]+)/) || '')[1];
  if(!name) {
    let index = -1;
    for(let i = UNNAMED.length; i--; ) {
      if(UNNAMED[i] === component) {
        index = i;
        break;
      }
    }
    if(index < 0) {
      index = UNNAMED.push(component) - 1;
    }
    name = 'UnnamedComponent' + index;
  }
  return name;
}

renderToString.shallowRender = shallowRender;

export default renderToString;
export { renderToString as render, renderToString as renderToStaticMarkup, renderToString, shallowRender };
//# sourceMappingURL=index.module.js.map
