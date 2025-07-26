var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

function assign(obj, props) {
  for(var i in props) {
    obj[i] = props[i];
  }
  return obj;
}

function removeNode(node) {
  var parentNode = node.parentNode;
  if(parentNode) {
    parentNode.removeChild(node);
  }
}

var slice = EMPTY_ARR.slice;

function _catchError(error, vnode) {
  var component, ctor, handled;
  for(; (vnode = vnode.__); ) {
    if((component = vnode.__c) && !component.__) {
      try {
        ctor = component.constructor;
        if(ctor && ctor.getDerivedStateFromError != null) {
          component.setState(ctor.getDerivedStateFromError(error));
          handled = component.__d;
        }
        if(component.componentDidCatch != null) {
          component.componentDidCatch(error);
          handled = component.__d;
        }

        if(handled) {
          return (component.__E = component);
        }
      } catch(e) {
        error = e;
      }
    }
  }
  throw error;
}

var options = {
  __e: _catchError,
};
var vnodeId = 0;

function createElement(type, props, children) {
  var normalizedProps = {},
    key,
    ref,
    i;
  for(i in props) {
    if(i == 'key') {
      key = props[i];
    } else if(i == 'ref') {
      ref = props[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }
  if(arguments.length > 2) {
    normalizedProps.children = arguments.length > 3 ? slice.call(arguments, 2) : children;
  }

  if(typeof type == 'function' && type.defaultProps != null) {
    for(i in type.defaultProps) {
      if(normalizedProps[i] === undefined) {
        normalizedProps[i] = type.defaultProps[i];
      }
    }
  }
  return createVNode(type, normalizedProps, key, ref, null);
}

function createVNode(type, props, key, ref, original) {
  var vnode = {
    type: type,
    props: props,
    key: key,
    ref: ref,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: undefined,
    __c: null,
    __h: null,
    constructor: undefined,
    __v: original == null ? ++vnodeId : original,
  };

  if(original == null && options.vnode != null) {
    options.vnode(vnode);
  }
  return vnode;
}

function createRef() {
  return {
    current: null,
  };
}

function Fragment(props) {
  return props.children;
}

var isValidElement = function isValidElement(vnode) {
  return vnode != null && vnode.constructor === undefined;
};

function Component(props, context) {
  this.props = props;
  this.context = context;
}

Component.prototype.setState = function(update, callback) {
  var s;
  if(this.__s != null && this.__s !== this.state) {
    s = this.__s;
  } else {
    s = this.__s = assign({}, this.state);
  }
  if(typeof update == 'function') {
    update = update(assign({}, s), this.props);
  }
  if(update) {
    assign(s, update);
  }

  if(update == null) {
    return;
  }
  if(this.__v) {
    if(callback) {
      this.__h.push(callback);
    }
    enqueueRender(this);
  }
};

Component.prototype.forceUpdate = function(callback) {
  if(this.__v) {
    this.__e = true;
    if(callback) {
      this.__h.push(callback);
    }
    enqueueRender(this);
  }
};

Component.prototype.render = Fragment;

function getDomSibling(vnode, childIndex) {
  if(childIndex == null) {
    return vnode.__ ? getDomSibling(vnode.__, vnode.__.__k.indexOf(vnode) + 1) : null;
  }
  var sibling;
  for(; childIndex < vnode.__k.length; childIndex++) {
    sibling = vnode.__k[childIndex];
    if(sibling != null && sibling.__e != null) {
      return sibling.__e;
    }
  }

  return typeof vnode.type == 'function' ? getDomSibling(vnode) : null;
}

function renderComponent(component) {
  var vnode = component.__v,
    oldDom = vnode.__e,
    parentDom = component.__P;
  if(parentDom) {
    var commitQueue = [];
    var oldVNode = assign({}, vnode);
    oldVNode.__v = vnode.__v + 1;
    diff(
      parentDom,
      vnode,
      oldVNode,
      component.__n,
      parentDom.ownerSVGElement !== undefined,
      vnode.__h != null ? [oldDom] : null,
      commitQueue,
      oldDom == null ? getDomSibling(vnode) : oldDom,
      vnode.__h,
    );
    commitRoot(commitQueue, vnode);
    if(vnode.__e != oldDom) {
      updateParentDomPointers(vnode);
    }
  }
}

function updateParentDomPointers(vnode) {
  if((vnode = vnode.__) != null && vnode.__c != null) {
    vnode.__e = vnode.__c.base = null;
    for(var i = 0; i < vnode.__k.length; i++) {
      var child = vnode.__k[i];
      if(child != null && child.__e != null) {
        vnode.__e = vnode.__c.base = child.__e;
        break;
      }
    }
    return updateParentDomPointers(vnode);
  }
}

var rerenderQueue = [];
var defer = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
var prevDebounce;

function enqueueRender(c) {
  if((!c.__d && (c.__d = true) && rerenderQueue.push(c) && !process.__r++) || prevDebounce !== options.debounceRendering) {
    prevDebounce = options.debounceRendering;
    (prevDebounce || defer)(process);
  }
}

function process() {
  var queue;
  while((process.__r = rerenderQueue.length)) {
    queue = rerenderQueue.sort(function (a, b) {
      return a.__v.__b - b.__v.__b;
    });
    rerenderQueue = [];
    queue.some(function (c) {
      if(c.__d) {
        renderComponent(c);
      }
    });
  }
}

process.__r = 0;

function diffChildren(parentDom, renderResult, newParentVNode, oldParentVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  var i, j, oldVNode, childVNode, newDom, firstChildDom, refs;

  var oldChildren = (oldParentVNode && oldParentVNode.__k) || EMPTY_ARR;
  var oldChildrenLength = oldChildren.length;
  newParentVNode.__k = [];
  for(i = 0; i < renderResult.length; i++) {
    childVNode = renderResult[i];
    if(childVNode == null || typeof childVNode == 'boolean') {
      childVNode = newParentVNode.__k[i] = null;
    } else if(typeof childVNode == 'string' || typeof childVNode == 'number' || typeof childVNode == 'bigint') {
      childVNode = newParentVNode.__k[i] = createVNode(null, childVNode, null, null, childVNode);
    } else if(Array.isArray(childVNode)) {
      childVNode = newParentVNode.__k[i] = createVNode(
        Fragment,
        {
          children: childVNode,
        },
        null,
        null,
        null,
      );
    } else if(childVNode.__b > 0) {
      childVNode = newParentVNode.__k[i] = createVNode(childVNode.type, childVNode.props, childVNode.key, null, childVNode.__v);
    } else {
      childVNode = newParentVNode.__k[i] = childVNode;
    }

    if(childVNode == null) {
      continue;
    }
    childVNode.__ = newParentVNode;
    childVNode.__b = newParentVNode.__b + 1;

    oldVNode = oldChildren[i];
    if(oldVNode === null || (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type)) {
      oldChildren[i] = undefined;
    } else {
      for(j = 0; j < oldChildrenLength; j++) {
        oldVNode = oldChildren[j];
        if(oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
          oldChildren[j] = undefined;
          break;
        }
        oldVNode = null;
      }
    }
    oldVNode = oldVNode || EMPTY_OBJ;

    diff(parentDom, childVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
    newDom = childVNode.__e;
    if((j = childVNode.ref) && oldVNode.ref != j) {
      if(!refs) {
        refs = [];
      }
      if(oldVNode.ref) {
        refs.push(oldVNode.ref, null, childVNode);
      }
      refs.push(j, childVNode.__c || newDom, childVNode);
    }
    if(newDom != null) {
      if(firstChildDom == null) {
        firstChildDom = newDom;
      }
      if(typeof childVNode.type == 'function' && childVNode.__k === oldVNode.__k) {
        childVNode.__d = oldDom = reorderChildren(childVNode, oldDom, parentDom);
      } else {
        oldDom = placeChild(parentDom, childVNode, oldVNode, oldChildren, newDom, oldDom);
      }
      if(typeof newParentVNode.type == 'function') {
        newParentVNode.__d = oldDom;
      }
    } else if(oldDom && oldVNode.__e == oldDom && oldDom.parentNode != parentDom) {
      oldDom = getDomSibling(oldVNode);
    }
  }
  newParentVNode.__e = firstChildDom;

  for(i = oldChildrenLength; i--; ) {
    if(oldChildren[i] != null) {
      if(typeof newParentVNode.type == 'function' && oldChildren[i].__e != null && oldChildren[i].__e == newParentVNode.__d) {
        newParentVNode.__d = getDomSibling(oldParentVNode, i + 1);
      }
      unmount(oldChildren[i], oldChildren[i]);
    }
  }

  if(refs) {
    for(i = 0; i < refs.length; i++) {
      applyRef(refs[i], refs[++i], refs[++i]);
    }
  }
}

function reorderChildren(childVNode, oldDom, parentDom) {
  var c = childVNode.__k;
  var tmp = 0;
  for(; c && tmp < c.length; tmp++) {
    var vnode = c[tmp];
    if(vnode) {
      vnode.__ = childVNode;
      if(typeof vnode.type == 'function') {
        oldDom = reorderChildren(vnode, oldDom, parentDom);
      } else {
        oldDom = placeChild(parentDom, vnode, vnode, c, vnode.__e, oldDom);
      }
    }
  }
  return oldDom;
}

function toChildArray(children, out) {
  out = out || [];
  if(children == null || typeof children == 'boolean');
  else if(Array.isArray(children)) {
    children.some(function (child) {
      toChildArray(child, out);
    });
  } else {
    out.push(children);
  }
  return out;
}

function placeChild(parentDom, childVNode, oldVNode, oldChildren, newDom, oldDom) {
  var nextDom;
  if(childVNode.__d !== undefined) {
    nextDom = childVNode.__d;

    childVNode.__d = undefined;
  } else if(oldVNode == null || newDom != oldDom || newDom.parentNode == null) {
    outer: if(oldDom == null || oldDom.parentNode !== parentDom) {
      parentDom.appendChild(newDom);
      nextDom = null;
    } else {
      for(var sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildren.length; j += 2) {
        if(sibDom == newDom) {
          break outer;
        }
      }
      parentDom.insertBefore(newDom, oldDom);
      nextDom = oldDom;
    }
  }

  if(nextDom !== undefined) {
    oldDom = nextDom;
  } else {
    oldDom = newDom.nextSibling;
  }
  return oldDom;
}

function diffProps(dom, newProps, oldProps, isSvg, hydrate) {
  var i;
  for(i in oldProps) {
    if(i !== 'children' && i !== 'key' && !(i in newProps)) {
      setProperty(dom, i, null, oldProps[i], isSvg);
    }
  }
  for(i in newProps) {
    if((!hydrate || typeof newProps[i] == 'function') && i !== 'children' && i !== 'key' && i !== 'value' && i !== 'checked' && oldProps[i] !== newProps[i]) {
      setProperty(dom, i, newProps[i], oldProps[i], isSvg);
    }
  }
}

function setStyle(style, key, value) {
  if(key[0] === '-') {
    style.setProperty(key, value);
  } else if(value == null) {
    style[key] = '';
  } else if(typeof value != 'number' || IS_NON_DIMENSIONAL.test(key)) {
    style[key] = value;
  } else {
    style[key] = value + 'px';
  }
}

function setProperty(dom, name, value, oldValue, isSvg) {
  var useCapture;
  o: if(name === 'style') {
    if(typeof value == 'string') {
      dom.style.cssText = value;
    } else {
      if(typeof oldValue == 'string') {
        dom.style.cssText = oldValue = '';
      }
      if(oldValue) {
        for(name in oldValue) {
          if(!(value && name in value)) {
            setStyle(dom.style, name, '');
          }
        }
      }
      if(value) {
        for(name in value) {
          if(!oldValue || value[name] !== oldValue[name]) {
            setStyle(dom.style, name, value[name]);
          }
        }
      }
    }
  } else if(name[0] === 'o' && name[1] === 'n') {
    useCapture = name !== (name = name.replace(/Capture$/, ''));

    if(name.toLowerCase() in dom) {
      name = name.toLowerCase().slice(2);
    } else {
      name = name.slice(2);
    }
    if(!dom._listeners) {
      dom._listeners = {};
    }
    dom._listeners[name + useCapture] = value;
    if(value) {
      if(!oldValue) {
        var handler = useCapture ? eventProxyCapture : eventProxy;
        dom.addEventListener(name, handler, useCapture);
      }
    } else {
      var _handler = useCapture ? eventProxyCapture : eventProxy;
      dom.removeEventListener(name, _handler, useCapture);
    }
  } else if(name !== 'dangerouslySetInnerHTML') {
    if(isSvg) {
      name = name.replace(/xlink[H:h]/, 'h').replace(/sName$/, 's');
    } else if(name !== 'href' && name !== 'list' && name !== 'form' && name !== 'tabIndex' && name !== 'download' && name in dom) {
      try {
        dom[name] = value == null ? '' : value;
        break o;
      } catch(e) {}
    }

    if(typeof value === 'function');
    else if(value != null && (value !== false || (name[0] === 'a' && name[1] === 'r'))) {
      dom.setAttribute(name, value);
    } else {
      dom.removeAttribute(name);
    }
  }
}

function eventProxy(e) {
  this._listeners[e.type + false](options.event ? options.event(e) : e);
}

function eventProxyCapture(e) {
  this._listeners[e.type + true](options.event ? options.event(e) : e);
}

function diff(parentDom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  var tmp,
    newType = newVNode.type;

  if(newVNode.constructor !== undefined) {
    return null;
  }

  if(oldVNode.__h != null) {
    isHydrating = oldVNode.__h;
    oldDom = newVNode.__e = oldVNode.__e;
    newVNode.__h = null;
    excessDomChildren = [oldDom];
  }
  if((tmp = options.__b)) {
    tmp(newVNode);
  }
  try {
    outer: if(typeof newType == 'function') {
      var c, isNew, oldProps, oldState, snapshot, clearProcessingException;
      var newProps = newVNode.props;

      tmp = newType.contextType;
      var provider = tmp && globalContext[tmp.__c];
      var componentContext = tmp ? (provider ? provider.props.value : tmp.__) : globalContext;

      if(oldVNode.__c) {
        c = newVNode.__c = oldVNode.__c;
        clearProcessingException = c.__ = c.__E;
      } else {
        if('prototype' in newType && newType.prototype.render) {
          newVNode.__c = c = new newType(newProps, componentContext);
        } else {
          newVNode.__c = c = new Component(newProps, componentContext);
          c.constructor = newType;
          c.render = doRender;
        }
        if(provider) {
          provider.sub(c);
        }
        c.props = newProps;
        if(!c.state) {
          c.state = {};
        }
        c.context = componentContext;
        c.__n = globalContext;
        isNew = c.__d = true;
        c.__h = [];
      }

      if(c.__s == null) {
        c.__s = c.state;
      }
      if(newType.getDerivedStateFromProps != null) {
        if(c.__s == c.state) {
          c.__s = assign({}, c.__s);
        }
        assign(c.__s, newType.getDerivedStateFromProps(newProps, c.__s));
      }
      oldProps = c.props;
      oldState = c.state;

      if(isNew) {
        if(newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
          c.componentWillMount();
        }
        if(c.componentDidMount != null) {
          c.__h.push(c.componentDidMount);
        }
      } else {
        if(newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
          c.componentWillReceiveProps(newProps, componentContext);
        }
        if((!c.__e && c.shouldComponentUpdate != null && c.shouldComponentUpdate(newProps, c.__s, componentContext) === false) || newVNode.__v === oldVNode.__v) {
          c.props = newProps;
          c.state = c.__s;
          if(newVNode.__v !== oldVNode.__v) {
            c.__d = false;
          }
          c.__v = newVNode;
          newVNode.__e = oldVNode.__e;
          newVNode.__k = oldVNode.__k;
          newVNode.__k.forEach(function (vnode) {
            if(vnode) {
              vnode.__ = newVNode;
            }
          });
          if(c.__h.length) {
            commitQueue.push(c);
          }
          break outer;
        }
        if(c.componentWillUpdate != null) {
          c.componentWillUpdate(newProps, c.__s, componentContext);
        }
        if(c.componentDidUpdate != null) {
          c.__h.push(function () {
            c.componentDidUpdate(oldProps, oldState, snapshot);
          });
        }
      }
      c.context = componentContext;
      c.props = newProps;
      c.state = c.__s;
      if((tmp = options.__r)) {
        tmp(newVNode);
      }
      c.__d = false;
      c.__v = newVNode;
      c.__P = parentDom;
      tmp = c.render(c.props, c.state, c.context);

      c.state = c.__s;
      if(c.getChildContext != null) {
        globalContext = assign(assign({}, globalContext), c.getChildContext());
      }
      if(!isNew && c.getSnapshotBeforeUpdate != null) {
        snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
      }
      var isTopLevelFragment = tmp != null && tmp.type === Fragment && tmp.key == null;
      var renderResult = isTopLevelFragment ? tmp.props.children : tmp;
      diffChildren(parentDom, Array.isArray(renderResult) ? renderResult : [renderResult], newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
      c.base = newVNode.__e;

      newVNode.__h = null;
      if(c.__h.length) {
        commitQueue.push(c);
      }
      if(clearProcessingException) {
        c.__E = c.__ = null;
      }
      c.__e = false;
    } else if(excessDomChildren == null && newVNode.__v === oldVNode.__v) {
      newVNode.__k = oldVNode.__k;
      newVNode.__e = oldVNode.__e;
    } else {
      newVNode.__e = diffElementNodes(oldVNode.__e, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating);
    }
    if((tmp = options.diffed)) {
      tmp(newVNode);
    }
  } catch(e) {
    newVNode.__v = null;
    if(isHydrating || excessDomChildren != null) {
      newVNode.__e = oldDom;
      newVNode.__h = !!isHydrating;
      excessDomChildren[excessDomChildren.indexOf(oldDom)] = null;
    }

    options.__e(e, newVNode, oldVNode);
  }
}

function commitRoot(commitQueue, root) {
  if(options.__c) {
    options.__c(root, commitQueue);
  }
  commitQueue.some(function (c) {
    try {
      commitQueue = c.__h;
      c.__h = [];
      commitQueue.some(function (cb) {
        cb.call(c);
      });
    } catch(e) {
      options.__e(e, c.__v);
    }
  });
}

function diffElementNodes(dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating) {
  var oldProps = oldVNode.props;
  var newProps = newVNode.props;
  var nodeType = newVNode.type;
  var i = 0;

  if(nodeType === 'svg') {
    isSvg = true;
  }
  if(excessDomChildren != null) {
    for(; i < excessDomChildren.length; i++) {
      var child = excessDomChildren[i];

      if(child && 'setAttribute' in child === !!nodeType && (nodeType ? child.localName === nodeType : child.nodeType === 3)) {
        dom = child;
        excessDomChildren[i] = null;
        break;
      }
    }
  }
  if(dom == null) {
    if(nodeType === null) {
      return document.createTextNode(newProps);
    }
    if(isSvg) {
      dom = document.createElementNS('http://www.w3.org/2000/svg', nodeType);
    } else {
      dom = document.createElement(nodeType, newProps.is && newProps);
    }

    excessDomChildren = null;
    isHydrating = false;
  }
  if(nodeType === null) {
    if(oldProps !== newProps && (!isHydrating || dom.data !== newProps)) {
      dom.data = newProps;
    }
  } else {
    excessDomChildren = excessDomChildren && slice.call(dom.childNodes);
    oldProps = oldVNode.props || EMPTY_OBJ;
    var oldHtml = oldProps.dangerouslySetInnerHTML;
    var newHtml = newProps.dangerouslySetInnerHTML;

    if(!isHydrating) {
      if(excessDomChildren != null) {
        oldProps = {};
        for(i = 0; i < dom.attributes.length; i++) {
          oldProps[dom.attributes[i].name] = dom.attributes[i].value;
        }
      }
      if(newHtml || oldHtml) {
        if(!newHtml || ((!oldHtml || newHtml.__html != oldHtml.__html) && newHtml.__html !== dom.innerHTML)) {
          dom.innerHTML = (newHtml && newHtml.__html) || '';
        }
      }
    }
    diffProps(dom, newProps, oldProps, isSvg, isHydrating);

    if(newHtml) {
      newVNode.__k = [];
    } else {
      i = newVNode.props.children;
      diffChildren(
        dom,
        Array.isArray(i) ? i : [i],
        newVNode,
        oldVNode,
        globalContext,
        isSvg && nodeType !== 'foreignObject',
        excessDomChildren,
        commitQueue,
        excessDomChildren ? excessDomChildren[0] : oldVNode.__k && getDomSibling(oldVNode, 0),
        isHydrating,
      );

      if(excessDomChildren != null) {
        for(i = excessDomChildren.length; i--; ) {
          if(excessDomChildren[i] != null) {
            removeNode(excessDomChildren[i]);
          }
        }
      }
    }

    if(!isHydrating) {
      if('value' in newProps && (i = newProps.value) !== undefined && (i !== oldProps.value || i !== dom.value || (nodeType === 'progress' && !i))) {
        setProperty(dom, 'value', i, oldProps.value, false);
      }
      if('checked' in newProps && (i = newProps.checked) !== undefined && i !== dom.checked) {
        setProperty(dom, 'checked', i, oldProps.checked, false);
      }
    }
  }
  return dom;
}

function applyRef(ref, value, vnode) {
  try {
    if(typeof ref == 'function') {
      ref(value);
    } else {
      ref.current = value;
    }
  } catch(e) {
    options.__e(e, vnode);
  }
}

function unmount(vnode, parentVNode, skipRemove) {
  var r;
  if(options.unmount) {
    options.unmount(vnode);
  }
  if((r = vnode.ref)) {
    if(!r.current || r.current === vnode.__e) {
      applyRef(r, null, parentVNode);
    }
  }
  if((r = vnode.__c) != null) {
    if(r.componentWillUnmount) {
      try {
        r.componentWillUnmount();
      } catch(e) {
        options.__e(e, parentVNode);
      }
    }
    r.base = r.__P = null;
  }
  if((r = vnode.__k)) {
    for(var i = 0; i < r.length; i++) {
      if(r[i]) {
        unmount(r[i], parentVNode, typeof vnode.type != 'function');
      }
    }
  }
  if(!skipRemove && vnode.__e != null) {
    removeNode(vnode.__e);
  }

  vnode.__e = vnode.__d = undefined;
}

function doRender(props, state, context) {
  return this.constructor(props, context);
}

function render(vnode, parentDom, replaceNode) {
  if(options.__) {
    options.__(vnode, parentDom);
  }

  var isHydrating = typeof replaceNode === 'function';

  var oldVNode = isHydrating ? null : (replaceNode && replaceNode.__k) || parentDom.__k;
  vnode = ((!isHydrating && replaceNode) || parentDom).__k = createElement(Fragment, null, [vnode]);

  var commitQueue = [];
  diff(
    parentDom,
    vnode,
    oldVNode || EMPTY_OBJ,
    EMPTY_OBJ,
    parentDom.ownerSVGElement !== undefined,
    !isHydrating && replaceNode ? [replaceNode] : oldVNode ? null : parentDom.firstChild ? slice.call(parentDom.childNodes) : null,
    commitQueue,
    !isHydrating && replaceNode ? replaceNode : oldVNode ? oldVNode.__e : parentDom.firstChild,
    isHydrating,
  );

  commitRoot(commitQueue, vnode);
}

function hydrate(vnode, parentDom) {
  render(vnode, parentDom, hydrate);
}

function cloneElement(vnode, props, children) {
  var normalizedProps = assign({}, vnode.props),
    key,
    ref,
    i;
  for(i in props) {
    if(i == 'key') {
      key = props[i];
    } else if(i == 'ref') {
      ref = props[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }
  if(arguments.length > 2) {
    normalizedProps.children = arguments.length > 3 ? slice.call(arguments, 2) : children;
  }
  return createVNode(vnode.type, normalizedProps, key || vnode.key, ref || vnode.ref, null);
}

var i = 0;

function createContext(defaultValue, contextId) {
  contextId = '__cC' + i++;
  var context = {
    __c: contextId,
    __: defaultValue,
    Consumer: function Consumer(props, contextValue) {
      return props.children(contextValue);
    },
    Provider: function Provider(props) {
      if(!this.getChildContext) {
        var subs = [];
        var ctx = {};
        ctx[contextId] = this;
        this.getChildContext = function() {
          return ctx;
        };
        this.shouldComponentUpdate = function(_props) {
          if(this.props.value !== _props.value) {
            subs.some(enqueueRender);
          }
        };
        this.sub = function(c) {
          subs.push(c);
          var old = c.componentWillUnmount;
          c.componentWillUnmount = function() {
            subs.splice(subs.indexOf(c), 1);
            if(old) {
              old.call(c);
            }
          };
        };
      }
      return props.children;
    },
  };

  return (context.Provider.__ = context.Consumer.contextType = context);
}

var currentIndex;
var currentComponent;
var currentHook = 0;
var afterPaintEffects = [];
var oldBeforeDiff = options.__b;
var oldBeforeRender = options.__r;
var oldAfterDiff = options.diffed;
var oldCommit = options.__c;
var oldBeforeUnmount = options.unmount;
var RAF_TIMEOUT = 100;
var prevRaf;

options.__b = function(vnode) {
  currentComponent = null;
  if(oldBeforeDiff) {
    oldBeforeDiff(vnode);
  }
};

options.__r = function(vnode) {
  if(oldBeforeRender) {
    oldBeforeRender(vnode);
  }
  currentComponent = vnode.__c;
  currentIndex = 0;
  var hooks = currentComponent.__H;
  if(hooks) {
    hooks.__h.forEach(invokeCleanup);
    hooks.__h.forEach(invokeEffect);
    hooks.__h = [];
  }
};
options.diffed = function(vnode) {
  if(oldAfterDiff) {
    oldAfterDiff(vnode);
  }
  var c = vnode.__c;
  if(c && c.__H && c.__H.__h.length) {
    afterPaint(afterPaintEffects.push(c));
  }
  currentComponent = null;
};
options.__c = function(vnode, commitQueue) {
  commitQueue.some(function (component) {
    try {
      component.__h.forEach(invokeCleanup);
      component.__h = component.__h.filter(function (cb) {
        return cb.__ ? invokeEffect(cb) : true;
      });
    } catch(e) {
      commitQueue.some(function (c) {
        if(c.__h) {
          c.__h = [];
        }
      });
      commitQueue = [];
      options.__e(e, component.__v);
    }
  });
  if(oldCommit) {
    oldCommit(vnode, commitQueue);
  }
};
options.unmount = function(vnode) {
  if(oldBeforeUnmount) {
    oldBeforeUnmount(vnode);
  }
  var c = vnode.__c;
  if(c && c.__H) {
    try {
      c.__H.__.forEach(invokeCleanup);
    } catch(e) {
      options.__e(e, c.__v);
    }
  }
};

function getHookState(index, type) {
  if(options.__h) {
    options.__h(currentComponent, index, currentHook || type);
  }
  currentHook = 0;

  var hooks =
    currentComponent.__H ||
    (currentComponent.__H = {
      __: [],
      __h: [],
    });
  if(index >= hooks.__.length) {
    hooks.__.push({});
  }
  return hooks.__[index];
}

function useState(initialState) {
  currentHook = 1;
  return useReducer(invokeOrReturn, initialState);
}

function useReducer(reducer, initialState, init) {
  var hookState = getHookState(currentIndex++, 2);
  hookState._reducer = reducer;
  if(!hookState.__c) {
    hookState.__ = [
      !init ? invokeOrReturn(undefined, initialState) : init(initialState),
      function(action) {
        var nextValue = hookState._reducer(hookState.__[0], action);
        if(hookState.__[0] !== nextValue) {
          hookState.__ = [nextValue, hookState.__[1]];
          hookState.__c.setState({});
        }
      },
    ];
    hookState.__c = currentComponent;
  }
  return hookState.__;
}

function useEffect(callback, args) {
  var state = getHookState(currentIndex++, 3);
  if(!options.__s && argsChanged(state.__H, args)) {
    state.__ = callback;
    state.__H = args;
    currentComponent.__H.__h.push(state);
  }
}

function useLayoutEffect(callback, args) {
  var state = getHookState(currentIndex++, 4);
  if(!options.__s && argsChanged(state.__H, args)) {
    state.__ = callback;
    state.__H = args;
    currentComponent.__h.push(state);
  }
}
function useRef(initialValue) {
  currentHook = 5;
  return useMemo(function () {
    return {
      current: initialValue,
    };
  }, []);
}

function useImperativeHandle(ref, createHandle, args) {
  currentHook = 6;
  useLayoutEffect(
    function() {
      if(typeof ref == 'function') {
        ref(createHandle());
      } else if(ref) {
        ref.current = createHandle();
      }
    },
    args == null ? args : args.concat(ref),
  );
}

function useMemo(factory, args) {
  var state = getHookState(currentIndex++, 7);
  if(argsChanged(state.__H, args)) {
    state.__ = factory();
    state.__H = args;
    state.__h = factory;
  }
  return state.__;
}

function useCallback(callback, args) {
  currentHook = 8;
  return useMemo(function () {
    return callback;
  }, args);
}

function useContext(context) {
  var provider = currentComponent.context[context.__c];
  var state = getHookState(currentIndex++, 9);
  state.c = context;
  if(!provider) {
    return context.__;
  }
  if(state.__ == null) {
    state.__ = true;
    provider.sub(currentComponent);
  }
  return provider.props.value;
}

function useDebugValue(value, formatter) {
  if(options.useDebugValue) {
    options.useDebugValue(formatter ? formatter(value) : value);
  }
}

function useErrorBoundary(cb) {
  var state = getHookState(currentIndex++, 10);
  var errState = useState();
  state.__ = cb;
  if(!currentComponent.componentDidCatch) {
    currentComponent.componentDidCatch = function(err) {
      if(state.__) {
        state.__(err);
      }
      errState[1](err);
    };
  }
  return [
    errState[0],
    function() {
      errState[1](undefined);
    },
  ];
}

function flushAfterPaintEffects() {
  afterPaintEffects.forEach(function (component) {
    if(component.__P) {
      try {
        component.__H.__h.forEach(invokeCleanup);
        component.__H.__h.forEach(invokeEffect);
        component.__H.__h = [];
      } catch(e) {
        component.__H.__h = [];
        options.__e(e, component.__v);
      }
    }
  });
  afterPaintEffects = [];
}
var HAS_RAF = typeof requestAnimationFrame == 'function';

function afterNextFrame(callback) {
  var done = function done() {
    clearTimeout(timeout);
    if(HAS_RAF) {
      cancelAnimationFrame(raf);
    }
    setTimeout(callback);
  };
  var timeout = setTimeout(done, RAF_TIMEOUT);
  var raf;
  if(HAS_RAF) {
    raf = requestAnimationFrame(done);
  }
}

function afterPaint(newQueueLength) {
  if(newQueueLength === 1 || prevRaf !== options.requestAnimationFrame) {
    prevRaf = options.requestAnimationFrame;
    (prevRaf || afterNextFrame)(flushAfterPaintEffects);
  }
}

function invokeCleanup(hook) {
  var comp = currentComponent;
  if(typeof hook.__c == 'function') {
    hook.__c();
  }
  currentComponent = comp;
}

function invokeEffect(hook) {
  var comp = currentComponent;
  hook.__c = hook.__();
  currentComponent = comp;
}

function argsChanged(oldArgs, newArgs) {
  return (
    !oldArgs ||
    oldArgs.length !== newArgs.length ||
    newArgs.some(function (arg, index) {
      return arg !== oldArgs[index];
    })
  );
}

function invokeOrReturn(arg, f) {
  return typeof f == 'function' ? f(arg) : f;
}

let oldDiffHook = options._diff;
options._diff = vnode => {
  if(vnode.type && vnode.type._forwarded && vnode.ref) {
    vnode.props.ref = vnode.ref;
    vnode.ref = null;
  }
  if(oldDiffHook) oldDiffHook(vnode);
};

const REACT_FORWARD_SYMBOL = (typeof Symbol != 'undefined' && Symbol.for && Symbol.for('react.forward_ref')) || 0xf47;

function forwardRef(fn) {
  function Forwarded(props, ref) {
    let clone = assign({}, props);
    delete clone.ref;
    ref = props.ref || ref;
    return fn(clone, !ref || (typeof ref === 'object' && !('current' in ref)) ? null : ref);
  }

  Forwarded.$$typeof = REACT_FORWARD_SYMBOL;
  Forwarded.render = Forwarded;
  Forwarded.prototype.isReactComponent = Forwarded._forwarded = true;
  Forwarded.displayName = 'ForwardRef(' + (fn.displayName || fn.name) + ')';
  return Forwarded;
}

const MODE_SLASH = 0;
const MODE_TEXT = 1;
const MODE_WHITESPACE = 2;
const MODE_TAGNAME = 3;
const MODE_COMMENT = 4;
const MODE_PROP_SET = 5;
const MODE_PROP_APPEND = 6;
const CHILD_APPEND = 0;
const CHILD_RECURSE = 2;
const TAG_SET = 3;
const PROPS_ASSIGN = 4;
const PROP_SET = MODE_PROP_SET;
const PROP_APPEND = MODE_PROP_APPEND;
const evaluate = (h, built, fields, args) => {
  let tmp;

  built[0] = 0;
  for(let i = 1; i < built.length; i++) {
    const type = built[i++];

    const value = built[i] ? ((built[0] |= type ? 1 : 2), fields[built[i++]]) : built[++i];
    if(type === TAG_SET) {
      args[0] = value;
    } else if(type === PROPS_ASSIGN) {
      args[1] = Object.assign(args[1] || {}, value);
    } else if(type === PROP_SET) {
      (args[1] = args[1] || {})[built[++i]] = value;
    } else if(type === PROP_APPEND) {
      args[1][built[++i]] += value + '';
    } else if(type) {
      tmp = h.apply(value, evaluate(h, value, fields, ['', null]));
      args.push(tmp);
      if(value[0]) {
        built[0] |= 2;
      } else {
        built[i - 2] = CHILD_APPEND;
        built[i] = tmp;
      }
    } else {
      args.push(value);
    }
  }
  return args;
};

const build = function(statics) {
  let mode = MODE_TEXT;
  let buffer = '';
  let quote = '';
  let current = [0];
  let char, propName;
  const commit = field => {
    if(mode === MODE_TEXT && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
      {
        current.push(CHILD_APPEND, field, buffer);
      }
    } else if(mode === MODE_TAGNAME && (field || buffer)) {
      {
        current.push(TAG_SET, field, buffer);
      }
      mode = MODE_WHITESPACE;
    } else if(mode === MODE_WHITESPACE && buffer === '...' && field) {
      {
        current.push(PROPS_ASSIGN, field, 0);
      }
    } else if(mode === MODE_WHITESPACE && buffer && !field) {
      {
        current.push(PROP_SET, 0, true, buffer);
      }
    } else if(mode >= MODE_PROP_SET) {
      {
        if(buffer || (!field && mode === MODE_PROP_SET)) {
          current.push(mode, 0, buffer, propName);
          mode = MODE_PROP_APPEND;
        }
        if(field) {
          current.push(mode, field, 0, propName);
          mode = MODE_PROP_APPEND;
        }
      }
    }
    buffer = '';
  };
  for(let i = 0; i < statics.length; i++) {
    if(i) {
      if(mode === MODE_TEXT) {
        commit();
      }
      commit(i);
    }
    for(let j = 0; j < statics[i].length; j++) {
      char = statics[i][j];
      if(mode === MODE_TEXT) {
        if(char === '<') {
          commit();
          {
            current = [current];
          }
          mode = MODE_TAGNAME;
        } else {
          buffer += char;
        }
      } else if(mode === MODE_COMMENT) {
        if(buffer === '--' && char === '>') {
          mode = MODE_TEXT;
          buffer = '';
        } else {
          buffer = char + buffer[0];
        }
      } else if(quote) {
        if(char === quote) {
          quote = '';
        } else {
          buffer += char;
        }
      } else if(char === '"' || char === "'") {
        quote = char;
      } else if(char === '>') {
        commit();
        mode = MODE_TEXT;
      } else if(!mode);
      else if(char === '=') {
        mode = MODE_PROP_SET;
        propName = buffer;
        buffer = '';
      } else if(char === '/' && (mode < MODE_PROP_SET || statics[i][j + 1] === '>')) {
        commit();
        if(mode === MODE_TAGNAME) {
          current = current[0];
        }
        mode = current;
        {
          (current = current[0]).push(CHILD_RECURSE, 0, mode);
        }
        mode = MODE_SLASH;
      } else if(char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        commit();
        mode = MODE_WHITESPACE;
      } else {
        buffer += char;
      }
      if(mode === MODE_TAGNAME && buffer === '!--') {
        mode = MODE_COMMENT;
        current = current[0];
      }
    }
  }
  commit();
  return current;
};

const CACHES = new Map();
const regular = function(statics) {
  let tmp = CACHES.get(this);
  if(!tmp) {
    tmp = new Map();
    CACHES.set(this, tmp);
  }
  tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, (tmp = build(statics))), tmp), arguments, []);
  return tmp.length > 1 ? tmp : tmp[0];
};
var htm = regular;

const html = htm.bind(createElement);

export {
  Component,
  Fragment,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  createElement as h,
  html,
  hydrate,
  isValidElement,
  options,
  render,
  toChildArray,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useErrorBoundary,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
};
