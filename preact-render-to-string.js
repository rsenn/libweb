import { options, h as createElement, Fragment } from './dom/preactComponent.js';

// DOM properties that should NOT have "px" added when numeric
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;
function encodeEntities(s) {
  if(typeof s !== 'string') s = String(s);
  var out = '';

  for(var i = 0; i < s.length; i++) {
    var ch = s[i]; // prettier-ignore

    switch (ch) {
      case '<':
        out += '&lt;';
        break;

      case '>':
        out += '&gt;';
        break;

      case '"':
        out += '&quot;';
        break;

      case '&':
        out += '&amp;';
        break;

      default:
        out += ch;
    }
  }

  return out;
}

var indent = function indent(s, _char) {
  return String(s).replace(/(\n+)/g, '$1' + (_char || '\t'));
};
var isLargeString = function isLargeString(s, length, ignoreLines) {
  return String(s).length > (length || 40) || (!ignoreLines && String(s).indexOf('\n') !== -1) || String(s).indexOf('<') !== -1;
};
var JS_TO_CSS = {}; // Convert an Object style to a CSSText string

function styleObjToCss(s) {
  var str = '';

  for(var prop in s) {
    var val = s[prop];

    if(val != null) {
      if(str) str += ' '; // str += jsToCss(prop);

      str += prop[0] == '-' ? prop : JS_TO_CSS[prop] || (JS_TO_CSS[prop] = prop.replace(/([A-Z])/g, '-$1').toLowerCase());
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

/**
 * Copy all properties from `props` onto `obj`.
 * @param {object} obj Object onto which properties should be copied.
 * @param {object} props Object from which to copy properties.
 * @returns {object}
 * @private
 */

function assign(obj, props) {
  for(var i in props) {
    obj[i] = props[i];
  }

  return obj;
}

/**
 * Get flattened children from the children prop
 * @param {Array} accumulator
 * @param {any} children A `props.children` opaque object.
 * @returns {Array} accumulator
 * @private
 */

function getChildren(accumulator, children) {
  if(Array.isArray(children)) {
    children.reduce(getChildren, accumulator);
  } else if(children != null && children !== false) {
    accumulator.push(children);
  }

  return accumulator;
}

var SHALLOW = {
  shallow: true
}; // components without names, kept as a hash for later comparison to return consistent UnnamedComponentXX names.

var UNNAMED = [];
var VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;

var noop = function noop() {};
/** Render Preact JSX + Components to an HTML string.
 *	@name render
 *	@function
 *	@param {VNode} vnode	JSX VNode to render.
 *	@param {Object} [context={}]	Optionally pass an initial context object through the render path.
 *	@param {Object} [options={}]	Rendering options
 *	@param {Boolean} [options.shallow=false]	If `true`, renders nested Components as HTML elements (`<Foo a="b" />`).
 *	@param {Boolean} [options.xml=false]		If `true`, uses self-closing tags for elements without children.
 *	@param {Boolean} [options.pretty=false]		If `true`, adds whitespace for readability
 *	@param {RegEx|undefined} [options.voidElements]       RegeEx that matches elements that are considered void (self-closing)
 */

renderToString.render = renderToString;
/** Only render elements, leaving Components inline as `<ComponentName ... />`.
 *	This method is just a convenience alias for `render(vnode, context, { shallow:true })`
 *	@name shallow
 *	@function
 *	@param {VNode} vnode	JSX VNode to render.
 *	@param {Object} [context={}]	Optionally pass an initial context object through the render path.
 */

var shallowRender = function shallowRender(vnode, context) {
  return renderToString(vnode, context, SHALLOW);
};

var EMPTY_ARR = [];

function renderToString(vnode, context, opts) {
  var res = _renderToString(vnode, context, opts); // options._commit, we don't schedule any effects in this library right now,
  // so we can pass an empty queue to this hook.

  if(options.__c) options.__c(vnode, EMPTY_ARR);
  return res;
}

/** The default export is an alias of `render()`. */

function _renderToString(vnode, context, opts, inner, isSvgMode, selectValue) {
  if(vnode == null || typeof vnode === 'boolean') {
    return '';
  } // wrap array nodes in Fragment

  if(Array.isArray(vnode)) {
    vnode = createElement(Fragment, null, vnode);
  }

  var nodeName = vnode.type,
    props = vnode.props,
    isComponent = false;
  context = context || {};
  opts = opts || {};
  var pretty = opts.pretty,
    indentChar = pretty && typeof pretty === 'string' ? pretty : '\t'; // #text nodes

  if(typeof vnode !== 'object' && !nodeName) {
    return encodeEntities(vnode);
  } // components

  if(typeof nodeName === 'function') {
    isComponent = true;

    if(opts.shallow && (inner || opts.renderRootComponent === false)) {
      nodeName = getComponentName(nodeName);
    } else if(nodeName === Fragment) {
      var rendered = '';
      var _children = [];
      getChildren(_children, vnode.props.children);

      for(var i = 0; i < _children.length; i++) {
        rendered += (i > 0 && pretty ? '\n' : '') + _renderToString(_children[i], context, opts, opts.shallowHighOrder !== false, isSvgMode, selectValue);
      }

      return rendered;
    } else {
      var _rendered;

      var c = (vnode.__c = {
        __v: vnode,
        context: context,
        props: vnode.props,
        // silently drop state updates
        setState: noop,
        forceUpdate: noop,
        // hooks
        __h: []
      }); // options._diff

      if(options.__b) options.__b(vnode); // options._render

      if(options.__r) options.__r(vnode);

      if(!nodeName.prototype || typeof nodeName.prototype.render !== 'function') {
        // Necessary for createContext api. Setting this property will pass
        // the context value as `this.context` just for this component.
        var cxType = nodeName.contextType;
        var provider = cxType && context[cxType.__c];
        var cctx = cxType != null ? (provider ? provider.props.value : cxType.__) : context; // stateless functional components

        _rendered = nodeName.call(vnode.__c, props, cctx);
      } else {
        // class-based components
        var _cxType = nodeName.contextType;

        var _provider = _cxType && context[_cxType.__c];

        var _cctx = _cxType != null ? (_provider ? _provider.props.value : _cxType.__) : context; // c = new nodeName(props, context);

        c = vnode.__c = new nodeName(props, _cctx);
        c.__v = vnode; // turn off stateful re-rendering:

        c._dirty = c.__d = true;
        c.props = props;
        if(c.state == null) c.state = {};

        if(c._nextState == null && c.__s == null) {
          c._nextState = c.__s = c.state;
        }

        c.context = _cctx;
        if(nodeName.getDerivedStateFromProps) c.state = assign(assign({}, c.state), nodeName.getDerivedStateFromProps(c.props, c.state));
        else if(c.componentWillMount) {
          c.componentWillMount(); // If the user called setState in cWM we need to flush pending,
          // state updates. This is the same behaviour in React.

          c.state = c._nextState !== c.state ? c._nextState : c.__s !== c.state ? c.__s : c.state;
        }
        _rendered = c.render(c.props, c.state, c.context);
      }

      if(c.getChildContext) {
        context = assign(assign({}, context), c.getChildContext());
      }

      if(options.diffed) options.diffed(vnode);
      return _renderToString(_rendered, context, opts, opts.shallowHighOrder !== false, isSvgMode, selectValue);
    }
  } // render JSX to HTML

  var s = '',
    propChildren,
    html;

  if(props) {
    var attrs = Object.keys(props); // allow sorting lexicographically for more determinism (useful for tests, such as via preact-jsx-chai)

    if(opts && opts.sortAttributes === true) attrs.sort();

    for(var _i = 0; _i < attrs.length; _i++) {
      var name = attrs[_i],
        v = props[name];

      if(name === 'children') {
        propChildren = v;
        continue;
      }

      if(name.match(/[\s\n\\\/='"\0<>]/)) continue;
      if(!(opts && opts.allAttributes) && (name === 'key' || name === 'ref' || name === '__self' || name === '__source' || name === 'defaultValue')) continue;

      if(name === 'className') {
        if(props['class']) continue;
        name = 'class';
      } else if(isSvgMode && name.match(/^xlink:?./)) {
        name = name.toLowerCase().replace(/^xlink:?/, 'xlink:');
      }

      if(name === 'htmlFor') {
        if(props['for']) continue;
        name = 'for';
      }

      if(name === 'style' && v && typeof v === 'object') {
        v = styleObjToCss(v);
      } // always use string values instead of booleans for aria attributes
      // also see https://github.com/preactjs/preact/pull/2347/files

      if(name[0] === 'a' && name['1'] === 'r' && typeof v === 'boolean') {
        v = String(v);
      }

      var hooked = opts.attributeHook && opts.attributeHook(name, v, context, opts, isComponent);

      if(hooked || hooked === '') {
        s += hooked;
        continue;
      }

      if(name === 'dangerouslySetInnerHTML') {
        html = v && v.__html;
      } else if(nodeName === 'textarea' && name === 'value') {
        // <textarea value="a&b"> --> <textarea>a&amp;b</textarea>
        propChildren = v;
      } else if((v || v === 0 || v === '') && typeof v !== 'function') {
        if(v === true || v === '') {
          v = name; // in non-xml mode, allow boolean attributes

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
  } // account for >1 multiline attribute

  if(pretty) {
    var sub = s.replace(/^\n\s*/, ' ');
    if(sub !== s && !~sub.indexOf('\n')) s = sub;
    else if(pretty && ~s.indexOf('\n')) s += '\n';
  }

  s = '<' + nodeName + s + '>';
  if(String(nodeName).match(/[\s\n\\\/='"\0<>]/)) throw new Error(nodeName + ' is not a valid HTML tag name in ' + s);
  var isVoid = String(nodeName).match(VOID_ELEMENTS) || (opts.voidElements && String(nodeName).match(opts.voidElements));
  var pieces = [];
  var children;

  if(html) {
    // if multiline, indent.
    if(pretty && isLargeString(html)) {
      html = '\n' + indentChar + indent(html, indentChar);
    }

    s += html;
  } else if(propChildren != null && getChildren((children = []), propChildren).length) {
    var hasLarge = pretty && ~s.indexOf('\n');
    var lastWasText = false;

    for(var _i2 = 0; _i2 < children.length; _i2++) {
      var child = children[_i2];

      if(child != null && child !== false) {
        var childSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode,
          ret = _renderToString(child, context, opts, true, childSvgMode, selectValue);

        if(pretty && !hasLarge && isLargeString(ret)) hasLarge = true; // Skip if we received an empty string

        if(ret) {
          if(pretty) {
            var isText = ret.length > 0 && ret[0] != '<'; // We merge adjacent text nodes, otherwise each piece would be printed
            // on a new line.

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
      for(var _i3 = pieces.length; _i3--; ) {
        pieces[_i3] = '\n' + indentChar + indent(pieces[_i3], indentChar);
      }
    }
  }

  if(pieces.length || html) {
    s += pieces.join('');
  } else if(opts && opts.xml) {
    return s.substring(0, s.length - 1) + ' />';
  }

  if(isVoid && !children && !html) {
    s = s.replace(/>$/, ' />');
  } else {
    if(pretty && ~s.indexOf('\n')) s += '\n';
    s += '</' + nodeName + '>';
  }

  return s;
}

function getComponentName(component) {
  return component.displayName || (component !== Function && component.name) || getFallbackComponentName(component);
}

function getFallbackComponentName(component) {
  var str = Function.prototype.toString.call(component),
    name = (str.match(/^\s*function\s+([^( ]+)/) || '')[1];

  if(!name) {
    // search for an existing indexed name for the given component:
    var index = -1;

    for(var i = UNNAMED.length; i--; ) {
      if(UNNAMED[i] === component) {
        index = i;
        break;
      }
    } // not found, create a new indexed name:

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
