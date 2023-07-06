var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

function assign(obj, props) {
  // @ts-ignore We change the type of `obj` to be `O & P`
  for (var i in props) {
    obj[i] = props[i];
  }
  return (/** @type {O & P} */obj
  );
}

function removeNode(node) {
  var parentNode = node.parentNode;
  if (parentNode) {
    parentNode.removeChild(node);
  }
}
var slice = EMPTY_ARR.slice;

function _catchError(error, vnode) {
  var component, ctor, handled;
  for (; vnode = vnode.__;) {
    if ((component = vnode.__c) && !component.__) {
      try {
        ctor = component.constructor;
        if (ctor && ctor.getDerivedStateFromError != null) {
          component.setState(ctor.getDerivedStateFromError(error));
          handled = component.__d;
        }
        if (component.componentDidCatch != null) {
          component.componentDidCatch(error);
          handled = component.__d;
        }

        // This is an error boundary. Mark it as having bailed out, and whether it was mid-hydration.
        if (handled) {
          return component.__E = component;
        }
      } catch (e) {
        error = e;
      }
    }
  }
  throw error;
}

var options = {
  __e: _catchError
};
var vnodeId = 0;

function createElement(type, props, children) {
  var normalizedProps = {},
    key,
    ref,
    i;
  for (i in props) {
    if (i == 'key') {
      key = props[i];
    } else if (i == 'ref') {
      ref = props[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }
  if (arguments.length > 2) {
    normalizedProps.children = arguments.length > 3 ? slice.call(arguments, 2) : children;
  }

  // If a Component VNode, check for and apply defaultProps
  // Note: type may be undefined in development, must never error here.
  if (typeof type == 'function' && type.defaultProps != null) {
    for (i in type.defaultProps) {
      if (normalizedProps[i] === undefined) {
        normalizedProps[i] = type.defaultProps[i];
      }
    }
  }
  return createVNode(type, normalizedProps, key, ref, null);
}

function createVNode(type, props, key, ref, original) {
  // V8 seems to be better at detecting type shapes if the object is allocated from the same call site
  // Do not inline into createElement and coerceToVNode!
  var vnode = {
    type: type,
    props: props,
    key: key,
    ref: ref,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    // _nextDom must be initialized to undefined b/c it will eventually
    // be set to dom.nextSibling which can return `null` and it is important
    // to be able to distinguish between an uninitialized _nextDom and
    // a _nextDom that has been set to `null`
    __d: undefined,
    __c: null,
    __h: null,
    constructor: undefined,
    __v: original == null ? ++vnodeId : original
  };

  // Only invoke the vnode hook if this was *not* a direct copy:
  if (original == null && options.vnode != null) {
    options.vnode(vnode);
  }
  return vnode;
}
function createRef() {
  return {
    current: null
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

Component.prototype.setState = function (update, callback) {
  // only clone state when copying to nextState the first time.
  var s;
  if (this.__s != null && this.__s !== this.state) {
    s = this.__s;
  } else {
    s = this.__s = assign({}, this.state);
  }
  if (typeof update == 'function') {
    // Some libraries like `immer` mark the current state as readonly,
    // preventing us from mutating it, so we need to clone it. See #2716
    update = update(assign({}, s), this.props);
  }
  if (update) {
    assign(s, update);
  }

  // Skip update if updater function returned null
  if (update == null) {
    return;
  }
  if (this.__v) {
    if (callback) {
      this.__h.push(callback);
    }
    enqueueRender(this);
  }
};

Component.prototype.forceUpdate = function (callback) {
  if (this.__v) {
    // Set render mode so that we can differentiate where the render request
    // is coming from. We need this because forceUpdate should never call
    // shouldComponentUpdate
    this.__e = true;
    if (callback) {
      this.__h.push(callback);
    }
    enqueueRender(this);
  }
};

Component.prototype.render = Fragment;

function getDomSibling(vnode, childIndex) {
  if (childIndex == null) {
    // Use childIndex==null as a signal to resume the search from the vnode's sibling
    return vnode.__ ? getDomSibling(vnode.__, vnode.__.__k.indexOf(vnode) + 1) : null;
  }
  var sibling;
  for (; childIndex < vnode.__k.length; childIndex++) {
    sibling = vnode.__k[childIndex];
    if (sibling != null && sibling.__e != null) {
      // Since updateParentDomPointers keeps _dom pointer correct,
      // we can rely on _dom to tell us if this subtree contains a
      // rendered DOM node, and what the first rendered DOM node is
      return sibling.__e;
    }
  }

  // If we get here, we have not found a DOM node in this vnode's children.
  // We must resume from this vnode's sibling (in it's parent _children array)
  // Only climb up and search the parent if we aren't searching through a DOM
  // VNode (meaning we reached the DOM parent of the original vnode that began
  // the search)
  return typeof vnode.type == 'function' ? getDomSibling(vnode) : null;
}

function renderComponent(component) {
  var vnode = component.__v,
    oldDom = vnode.__e,
    parentDom = component.__P;
  if (parentDom) {
    var commitQueue = [];
    var oldVNode = assign({}, vnode);
    oldVNode.__v = vnode.__v + 1;
    diff(parentDom, vnode, oldVNode, component.__n, parentDom.ownerSVGElement !== undefined, vnode.__h != null ? [oldDom] : null, commitQueue, oldDom == null ? getDomSibling(vnode) : oldDom, vnode.__h);
    commitRoot(commitQueue, vnode);
    if (vnode.__e != oldDom) {
      updateParentDomPointers(vnode);
    }
  }
}

function updateParentDomPointers(vnode) {
  if ((vnode = vnode.__) != null && vnode.__c != null) {
    vnode.__e = vnode.__c.base = null;
    for (var i = 0; i < vnode.__k.length; i++) {
      var child = vnode.__k[i];
      if (child != null && child.__e != null) {
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
  if (!c.__d && (c.__d = true) && rerenderQueue.push(c) && !process.__r++ || prevDebounce !== options.debounceRendering) {
    prevDebounce = options.debounceRendering;
    (prevDebounce || defer)(process);
  }
}

function process() {
  var queue;
  while (process.__r = rerenderQueue.length) {
    queue = rerenderQueue.sort(function (a, b) {
      return a.__v.__b - b.__v.__b;
    });
    rerenderQueue = [];
    // Don't update `renderCount` yet. Keep its value non-zero to prevent unnecessary
    // process() calls from getting scheduled while `queue` is still being consumed.
    queue.some(function (c) {
      if (c.__d) {
        renderComponent(c);
      }
    });
  }
}
process.__r = 0;

function diffChildren(parentDom, renderResult, newParentVNode, oldParentVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  var i, j, oldVNode, childVNode, newDom, firstChildDom, refs;

  // This is a compression of oldParentVNode!=null && oldParentVNode != EMPTY_OBJ && oldParentVNode._children || EMPTY_ARR
  // as EMPTY_OBJ._children should be `undefined`.
  var oldChildren = oldParentVNode && oldParentVNode.__k || EMPTY_ARR;
  var oldChildrenLength = oldChildren.length;
  newParentVNode.__k = [];
  for (i = 0; i < renderResult.length; i++) {
    childVNode = renderResult[i];
    if (childVNode == null || typeof childVNode == 'boolean') {
      childVNode = newParentVNode.__k[i] = null;
    }
    // If this newVNode is being reused (e.g. <div>{reuse}{reuse}</div>) in the same diff,
    // or we are rendering a component (e.g. setState) copy the oldVNodes so it can have
    // it's own DOM & etc. pointers
    else if (typeof childVNode == 'string' || typeof childVNode == 'number' ||
    // eslint-disable-next-line valid-typeof
    typeof childVNode == 'bigint') {
      childVNode = newParentVNode.__k[i] = createVNode(null, childVNode, null, null, childVNode);
    } else if (Array.isArray(childVNode)) {
      childVNode = newParentVNode.__k[i] = createVNode(Fragment, {
        children: childVNode
      }, null, null, null);
    } else if (childVNode.__b > 0) {
      // VNode is already in use, clone it. This can happen in the following
      // scenario:
      //   const reuse = <div />
      //   <div>{reuse}<span />{reuse}</div>
      childVNode = newParentVNode.__k[i] = createVNode(childVNode.type, childVNode.props, childVNode.key, null, childVNode.__v);
    } else {
      childVNode = newParentVNode.__k[i] = childVNode;
    }

    // Terser removes the `continue` here and wraps the loop body
    // in a `if (childVNode) { ... } condition
    if (childVNode == null) {
      continue;
    }
    childVNode.__ = newParentVNode;
    childVNode.__b = newParentVNode.__b + 1;

    // Check if we find a corresponding element in oldChildren.
    // If found, delete the array item by setting to `undefined`.
    // We use `undefined`, as `null` is reserved for empty placeholders
    // (holes).
    oldVNode = oldChildren[i];
    if (oldVNode === null || oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
      oldChildren[i] = undefined;
    } else {
      // Either oldVNode === undefined or oldChildrenLength > 0,
      // so after this loop oldVNode == null or oldVNode is a valid value.
      for (j = 0; j < oldChildrenLength; j++) {
        oldVNode = oldChildren[j];
        // If childVNode is unkeyed, we only match similarly unkeyed nodes, otherwise we match by key.
        // We always match by type (in either case).
        if (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
          oldChildren[j] = undefined;
          break;
        }
        oldVNode = null;
      }
    }
    oldVNode = oldVNode || EMPTY_OBJ;

    // Morph the old element into the new one, but don't append it to the dom yet
    diff(parentDom, childVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
    newDom = childVNode.__e;
    if ((j = childVNode.ref) && oldVNode.ref != j) {
      if (!refs) {
        refs = [];
      }
      if (oldVNode.ref) {
        refs.push(oldVNode.ref, null, childVNode);
      }
      refs.push(j, childVNode.__c || newDom, childVNode);
    }
    if (newDom != null) {
      if (firstChildDom == null) {
        firstChildDom = newDom;
      }
      if (typeof childVNode.type == 'function' && childVNode.__k === oldVNode.__k) {
        childVNode.__d = oldDom = reorderChildren(childVNode, oldDom, parentDom);
      } else {
        oldDom = placeChild(parentDom, childVNode, oldVNode, oldChildren, newDom, oldDom);
      }
      if (typeof newParentVNode.type == 'function') {
        // Because the newParentVNode is Fragment-like, we need to set it's
        // _nextDom property to the nextSibling of its last child DOM node.
        //
        // `oldDom` contains the correct value here because if the last child
        // is a Fragment-like, then oldDom has already been set to that child's _nextDom.
        // If the last child is a DOM VNode, then oldDom will be set to that DOM
        // node's nextSibling.
        newParentVNode.__d = oldDom;
      }
    } else if (oldDom && oldVNode.__e == oldDom && oldDom.parentNode != parentDom) {
      // The above condition is to handle null placeholders. See test in placeholder.test.js:
      // `efficiently replace null placeholders in parent rerenders`
      oldDom = getDomSibling(oldVNode);
    }
  }
  newParentVNode.__e = firstChildDom;

  // Remove remaining oldChildren if there are any.
  for (i = oldChildrenLength; i--;) {
    if (oldChildren[i] != null) {
      if (typeof newParentVNode.type == 'function' && oldChildren[i].__e != null && oldChildren[i].__e == newParentVNode.__d) {
        // If the newParentVNode.__nextDom points to a dom node that is about to
        // be unmounted, then get the next sibling of that vnode and set
        // _nextDom to it
        newParentVNode.__d = getDomSibling(oldParentVNode, i + 1);
      }
      unmount(oldChildren[i], oldChildren[i]);
    }
  }

  // Set refs only after unmount
  if (refs) {
    for (i = 0; i < refs.length; i++) {
      applyRef(refs[i], refs[++i], refs[++i]);
    }
  }
}
function reorderChildren(childVNode, oldDom, parentDom) {
  // Note: VNodes in nested suspended trees may be missing _children.
  var c = childVNode.__k;
  var tmp = 0;
  for (; c && tmp < c.length; tmp++) {
    var vnode = c[tmp];
    if (vnode) {
      // We typically enter this code path on sCU bailout, where we copy
      // oldVNode._children to newVNode._children. If that is the case, we need
      // to update the old children's _parent pointer to point to the newVNode
      // (childVNode here).
      vnode.__ = childVNode;
      if (typeof vnode.type == 'function') {
        oldDom = reorderChildren(vnode, oldDom, parentDom);
      } else {
        oldDom = placeChild(parentDom, vnode, vnode, c, vnode.__e, oldDom);
      }
    }
  }
  return oldDom;
}

/**
 * Flatten and loop through the children of a virtual node
 * @param {import('../index').ComponentChildren} children The unflattened
 * children of a virtual node
 * @returns {import('../internal').VNode[]}
 */
function toChildArray(children, out) {
  out = out || [];
  if (children == null || typeof children == 'boolean') ;else if (Array.isArray(children)) {
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
  if (childVNode.__d !== undefined) {
    // Only Fragments or components that return Fragment like VNodes will
    // have a non-undefined _nextDom. Continue the diff from the sibling
    // of last DOM child of this child VNode
    nextDom = childVNode.__d;

    // Eagerly cleanup _nextDom. We don't need to persist the value because
    // it is only used by `diffChildren` to determine where to resume the diff after
    // diffing Components and Fragments. Once we store it the nextDOM local var, we
    // can clean up the property
    childVNode.__d = undefined;
  } else if (oldVNode == null || newDom != oldDom || newDom.parentNode == null) {
    outer: if (oldDom == null || oldDom.parentNode !== parentDom) {
      parentDom.appendChild(newDom);
      nextDom = null;
    } else {
      // `j<oldChildrenLength; j+=2` is an alternative to `j++<oldChildrenLength/2`
      for (var sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildren.length; j += 2) {
        if (sibDom == newDom) {
          break outer;
        }
      }
      parentDom.insertBefore(newDom, oldDom);
      nextDom = oldDom;
    }
  }

  // If we have pre-calculated the nextDOM node, use it. Else calculate it now
  // Strictly check for `undefined` here cuz `null` is a valid value of `nextDom`.
  // See more detail in create-element.js:createVNode
  if (nextDom !== undefined) {
    oldDom = nextDom;
  } else {
    oldDom = newDom.nextSibling;
  }
  return oldDom;
}

/**
 * Diff the old and new properties of a VNode and apply changes to the DOM node
 * @param {import('../internal').PreactElement} dom The DOM node to apply
 * changes to
 * @param {object} newProps The new props
 * @param {object} oldProps The old props
 * @param {boolean} isSvg Whether or not this node is an SVG node
 * @param {boolean} hydrate Whether or not we are in hydration mode
 */
function diffProps(dom, newProps, oldProps, isSvg, hydrate) {
  var i;
  for (i in oldProps) {
    if (i !== 'children' && i !== 'key' && !(i in newProps)) {
      setProperty(dom, i, null, oldProps[i], isSvg);
    }
  }
  for (i in newProps) {
    if ((!hydrate || typeof newProps[i] == 'function') && i !== 'children' && i !== 'key' && i !== 'value' && i !== 'checked' && oldProps[i] !== newProps[i]) {
      setProperty(dom, i, newProps[i], oldProps[i], isSvg);
    }
  }
}
function setStyle(style, key, value) {
  if (key[0] === '-') {
    style.setProperty(key, value);
  } else if (value == null) {
    style[key] = '';
  } else if (typeof value != 'number' || IS_NON_DIMENSIONAL.test(key)) {
    style[key] = value;
  } else {
    style[key] = value + 'px';
  }
}

/**
 * Set a property value on a DOM node
 * @param {import('../internal').PreactElement} dom The DOM node to modify
 * @param {string} name The name of the property to set
 * @param {*} value The value to set the property to
 * @param {*} oldValue The old value the property had
 * @param {boolean} isSvg Whether or not this DOM node is an SVG node or not
 */
function setProperty(dom, name, value, oldValue, isSvg) {
  var useCapture;
  o: if (name === 'style') {
    if (typeof value == 'string') {
      dom.style.cssText = value;
    } else {
      if (typeof oldValue == 'string') {
        dom.style.cssText = oldValue = '';
      }
      if (oldValue) {
        for (name in oldValue) {
          if (!(value && name in value)) {
            setStyle(dom.style, name, '');
          }
        }
      }
      if (value) {
        for (name in value) {
          if (!oldValue || value[name] !== oldValue[name]) {
            setStyle(dom.style, name, value[name]);
          }
        }
      }
    }
  }
  // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
  else if (name[0] === 'o' && name[1] === 'n') {
    useCapture = name !== (name = name.replace(/Capture$/, ''));

    // Infer correct casing for DOM built-in events:
    if (name.toLowerCase() in dom) {
      name = name.toLowerCase().slice(2);
    } else {
      name = name.slice(2);
    }
    if (!dom._listeners) {
      dom._listeners = {};
    }
    dom._listeners[name + useCapture] = value;
    if (value) {
      if (!oldValue) {
        var handler = useCapture ? eventProxyCapture : eventProxy;
        dom.addEventListener(name, handler, useCapture);
      }
    } else {
      var _handler = useCapture ? eventProxyCapture : eventProxy;
      dom.removeEventListener(name, _handler, useCapture);
    }
  } else if (name !== 'dangerouslySetInnerHTML') {
    if (isSvg) {
      // Normalize incorrect prop usage for SVG:
      // - xlink:href / xlinkHref --> href (xlink:href was removed from SVG and isn't needed)
      // - className --> class
      name = name.replace(/xlink[H:h]/, 'h').replace(/sName$/, 's');
    } else if (name !== 'href' && name !== 'list' && name !== 'form' &&
    // Default value in browsers is `-1` and an empty string is
    // cast to `0` instead
    name !== 'tabIndex' && name !== 'download' && name in dom) {
      try {
        dom[name] = value == null ? '' : value;
        // labelled break is 1b smaller here than a return statement (sorry)
        break o;
      } catch (e) {}
    }

    // ARIA-attributes have a different notion of boolean values.
    // The value `false` is different from the attribute not
    // existing on the DOM, so we can't remove it. For non-boolean
    // ARIA-attributes we could treat false as a removal, but the
    // amount of exceptions would cost us too many bytes. On top of
    // that other VDOM frameworks also always stringify `false`.

    if (typeof value === 'function') ;else if (value != null && (value !== false || name[0] === 'a' && name[1] === 'r')) {
      dom.setAttribute(name, value);
    } else {
      dom.removeAttribute(name);
    }
  }
}

/**
 * Proxy an event to hooked event handlers
 * @param {Event} e The event object from the browser
 * @private
 */
function eventProxy(e) {
  this._listeners[e.type + false](options.event ? options.event(e) : e);
}
function eventProxyCapture(e) {
  this._listeners[e.type + true](options.event ? options.event(e) : e);
}

/**
 * Diff two virtual nodes and apply proper changes to the DOM
 * @param {import('../internal').PreactElement} parentDom The parent of the DOM element
 * @param {import('../internal').VNode} newVNode The new virtual node
 * @param {import('../internal').VNode} oldVNode The old virtual node
 * @param {object} globalContext The current context object. Modified by getChildContext
 * @param {boolean} isSvg Whether or not this element is an SVG node
 * @param {Array<import('../internal').PreactElement>} excessDomChildren
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {import('../internal').PreactElement} oldDom The current attached DOM
 * element any new dom elements should be placed around. Likely `null` on first
 * render (except when hydrating). Can be a sibling DOM element when diffing
 * Fragments that have siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} [isHydrating] Whether or not we are in hydration
 */
function diff(parentDom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  var tmp,
    newType = newVNode.type;

  // When passing through createElement it assigns the object
  // constructor as undefined. This to prevent JSON-injection.
  if (newVNode.constructor !== undefined) {
    return null;
  }

  // If the previous diff bailed out, resume creating/hydrating.
  if (oldVNode.__h != null) {
    isHydrating = oldVNode.__h;
    oldDom = newVNode.__e = oldVNode.__e;
    // if we resume, we want the tree to be "unlocked"
    newVNode.__h = null;
    excessDomChildren = [oldDom];
  }
  if (tmp = options.__b) {
    tmp(newVNode);
  }
  try {
    outer: if (typeof newType == 'function') {
      var c, isNew, oldProps, oldState, snapshot, clearProcessingException;
      var newProps = newVNode.props;

      // Necessary for createContext api. Setting this property will pass
      // the context value as `this.context` just for this component.
      tmp = newType.contextType;
      var provider = tmp && globalContext[tmp.__c];
      var componentContext = tmp ? provider ? provider.props.value : tmp.__ : globalContext;

      // Get component and set it to `c`
      if (oldVNode.__c) {
        c = newVNode.__c = oldVNode.__c;
        clearProcessingException = c.__ = c.__E;
      } else {
        // Instantiate the new component
        if ('prototype' in newType && newType.prototype.render) {
          // @ts-ignore The check above verifies that newType is suppose to be constructed
          newVNode.__c = c = new newType(newProps, componentContext); // eslint-disable-line new-cap
        } else {
          // @ts-ignore Trust me, Component implements the interface we want
          newVNode.__c = c = new Component(newProps, componentContext);
          c.constructor = newType;
          c.render = doRender;
        }
        if (provider) {
          provider.sub(c);
        }
        c.props = newProps;
        if (!c.state) {
          c.state = {};
        }
        c.context = componentContext;
        c.__n = globalContext;
        isNew = c.__d = true;
        c.__h = [];
      }

      // Invoke getDerivedStateFromProps
      if (c.__s == null) {
        c.__s = c.state;
      }
      if (newType.getDerivedStateFromProps != null) {
        if (c.__s == c.state) {
          c.__s = assign({}, c.__s);
        }
        assign(c.__s, newType.getDerivedStateFromProps(newProps, c.__s));
      }
      oldProps = c.props;
      oldState = c.state;

      // Invoke pre-render lifecycle methods
      if (isNew) {
        if (newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
          c.componentWillMount();
        }
        if (c.componentDidMount != null) {
          c.__h.push(c.componentDidMount);
        }
      } else {
        if (newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
          c.componentWillReceiveProps(newProps, componentContext);
        }
        if (!c.__e && c.shouldComponentUpdate != null && c.shouldComponentUpdate(newProps, c.__s, componentContext) === false || newVNode.__v === oldVNode.__v) {
          c.props = newProps;
          c.state = c.__s;
          // More info about this here: https://gist.github.com/JoviDeCroock/bec5f2ce93544d2e6070ef8e0036e4e8
          if (newVNode.__v !== oldVNode.__v) {
            c.__d = false;
          }
          c.__v = newVNode;
          newVNode.__e = oldVNode.__e;
          newVNode.__k = oldVNode.__k;
          newVNode.__k.forEach(function (vnode) {
            if (vnode) {
              vnode.__ = newVNode;
            }
          });
          if (c.__h.length) {
            commitQueue.push(c);
          }
          break outer;
        }
        if (c.componentWillUpdate != null) {
          c.componentWillUpdate(newProps, c.__s, componentContext);
        }
        if (c.componentDidUpdate != null) {
          c.__h.push(function () {
            c.componentDidUpdate(oldProps, oldState, snapshot);
          });
        }
      }
      c.context = componentContext;
      c.props = newProps;
      c.state = c.__s;
      if (tmp = options.__r) {
        tmp(newVNode);
      }
      c.__d = false;
      c.__v = newVNode;
      c.__P = parentDom;
      tmp = c.render(c.props, c.state, c.context);

      // Handle setState called in render, see #2553
      c.state = c.__s;
      if (c.getChildContext != null) {
        globalContext = assign(assign({}, globalContext), c.getChildContext());
      }
      if (!isNew && c.getSnapshotBeforeUpdate != null) {
        snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
      }
      var isTopLevelFragment = tmp != null && tmp.type === Fragment && tmp.key == null;
      var renderResult = isTopLevelFragment ? tmp.props.children : tmp;
      diffChildren(parentDom, Array.isArray(renderResult) ? renderResult : [renderResult], newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
      c.base = newVNode.__e;

      // We successfully rendered this VNode, unset any stored hydration/bailout state:
      newVNode.__h = null;
      if (c.__h.length) {
        commitQueue.push(c);
      }
      if (clearProcessingException) {
        c.__E = c.__ = null;
      }
      c.__e = false;
    } else if (excessDomChildren == null && newVNode.__v === oldVNode.__v) {
      newVNode.__k = oldVNode.__k;
      newVNode.__e = oldVNode.__e;
    } else {
      newVNode.__e = diffElementNodes(oldVNode.__e, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating);
    }
    if (tmp = options.diffed) {
      tmp(newVNode);
    }
  } catch (e) {
    newVNode.__v = null;
    // if hydrating or creating initial tree, bailout preserves DOM:
    if (isHydrating || excessDomChildren != null) {
      newVNode.__e = oldDom;
      newVNode.__h = !!isHydrating;
      excessDomChildren[excessDomChildren.indexOf(oldDom)] = null;
      // ^ could possibly be simplified to:
      // excessDomChildren.length = 0;
    }

    options.__e(e, newVNode, oldVNode);
  }
}

/**
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {import('../internal').VNode} root
 */
function commitRoot(commitQueue, root) {
  if (options.__c) {
    options.__c(root, commitQueue);
  }
  commitQueue.some(function (c) {
    try {
      // @ts-ignore Reuse the commitQueue variable here so the type changes
      commitQueue = c.__h;
      c.__h = [];
      commitQueue.some(function (cb) {
        // @ts-ignore See above ts-ignore on commitQueue
        cb.call(c);
      });
    } catch (e) {
      options.__e(e, c.__v);
    }
  });
}

/**
 * Diff two virtual nodes representing DOM element
 * @param {import('../internal').PreactElement} dom The DOM element representing
 * the virtual nodes being diffed
 * @param {import('../internal').VNode} newVNode The new virtual node
 * @param {import('../internal').VNode} oldVNode The old virtual node
 * @param {object} globalContext The current context object
 * @param {boolean} isSvg Whether or not this DOM node is an SVG node
 * @param {*} excessDomChildren
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {boolean} isHydrating Whether or not we are in hydration
 * @returns {import('../internal').PreactElement}
 */
function diffElementNodes(dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating) {
  var oldProps = oldVNode.props;
  var newProps = newVNode.props;
  var nodeType = newVNode.type;
  var i = 0;

  // Tracks entering and exiting SVG namespace when descending through the tree.
  if (nodeType === 'svg') {
    isSvg = true;
  }
  if (excessDomChildren != null) {
    for (; i < excessDomChildren.length; i++) {
      var child = excessDomChildren[i];

      // if newVNode matches an element in excessDomChildren or the `dom`
      // argument matches an element in excessDomChildren, remove it from
      // excessDomChildren so it isn't later removed in diffChildren
      if (child && 'setAttribute' in child === !!nodeType && (nodeType ? child.localName === nodeType : child.nodeType === 3)) {
        dom = child;
        excessDomChildren[i] = null;
        break;
      }
    }
  }
  if (dom == null) {
    if (nodeType === null) {
      // @ts-ignore createTextNode returns Text, we expect PreactElement
      return document.createTextNode(newProps);
    }
    if (isSvg) {
      dom = document.createElementNS('http://www.w3.org/2000/svg',
      // @ts-ignore We know `newVNode.type` is a string
      nodeType);
    } else {
      dom = document.createElement(
      // @ts-ignore We know `newVNode.type` is a string
      nodeType, newProps.is && newProps);
    }

    // we created a new parent, so none of the previously attached children can be reused:
    excessDomChildren = null;
    // we are creating a new node, so we can assume this is a new subtree (in case we are hydrating), this deopts the hydrate
    isHydrating = false;
  }
  if (nodeType === null) {
    // During hydration, we still have to split merged text from SSR'd HTML.
    if (oldProps !== newProps && (!isHydrating || dom.data !== newProps)) {
      dom.data = newProps;
    }
  } else {
    // If excessDomChildren was not null, repopulate it with the current element's children:
    excessDomChildren = excessDomChildren && slice.call(dom.childNodes);
    oldProps = oldVNode.props || EMPTY_OBJ;
    var oldHtml = oldProps.dangerouslySetInnerHTML;
    var newHtml = newProps.dangerouslySetInnerHTML;

    // During hydration, props are not diffed at all (including dangerouslySetInnerHTML)
    // @TODO we should warn in debug mode when props don't match here.
    if (!isHydrating) {
      // But, if we are in a situation where we are using existing DOM (e.g. replaceNode)
      // we should read the existing DOM attributes to diff them
      if (excessDomChildren != null) {
        oldProps = {};
        for (i = 0; i < dom.attributes.length; i++) {
          oldProps[dom.attributes[i].name] = dom.attributes[i].value;
        }
      }
      if (newHtml || oldHtml) {
        // Avoid re-applying the same '__html' if it did not changed between re-render
        if (!newHtml || (!oldHtml || newHtml.__html != oldHtml.__html) && newHtml.__html !== dom.innerHTML) {
          dom.innerHTML = newHtml && newHtml.__html || '';
        }
      }
    }
    diffProps(dom, newProps, oldProps, isSvg, isHydrating);

    // If the new vnode didn't have dangerouslySetInnerHTML, diff its children
    if (newHtml) {
      newVNode.__k = [];
    } else {
      i = newVNode.props.children;
      diffChildren(dom, Array.isArray(i) ? i : [i], newVNode, oldVNode, globalContext, isSvg && nodeType !== 'foreignObject', excessDomChildren, commitQueue, excessDomChildren ? excessDomChildren[0] : oldVNode.__k && getDomSibling(oldVNode, 0), isHydrating);

      // Remove children that are not part of any vnode.
      if (excessDomChildren != null) {
        for (i = excessDomChildren.length; i--;) {
          if (excessDomChildren[i] != null) {
            removeNode(excessDomChildren[i]);
          }
        }
      }
    }

    // (as above, don't diff props during hydration)
    if (!isHydrating) {
      if ('value' in newProps && (i = newProps.value) !== undefined && (
      // #2756 For the <progress>-element the initial value is 0,
      // despite the attribute not being present. When the attribute
      // is missing the progress bar is treated as indeterminate.
      // To fix that we'll always update it when it is 0 for progress elements
      i !== oldProps.value || i !== dom.value || nodeType === 'progress' && !i)) {
        setProperty(dom, 'value', i, oldProps.value, false);
      }
      if ('checked' in newProps && (i = newProps.checked) !== undefined && i !== dom.checked) {
        setProperty(dom, 'checked', i, oldProps.checked, false);
      }
    }
  }
  return dom;
}

/**
 * Invoke or update a ref, depending on whether it is a function or object ref.
 * @param {object|function} ref
 * @param {any} value
 * @param {import('../internal').VNode} vnode
 */
function applyRef(ref, value, vnode) {
  try {
    if (typeof ref == 'function') {
      ref(value);
    } else {
      ref.current = value;
    }
  } catch (e) {
    options.__e(e, vnode);
  }
}

/**
 * Unmount a virtual node from the tree and apply DOM changes
 * @param {import('../internal').VNode} vnode The virtual node to unmount
 * @param {import('../internal').VNode} parentVNode The parent of the VNode that
 * initiated the unmount
 * @param {boolean} [skipRemove] Flag that indicates that a parent node of the
 * current element is already detached from the DOM.
 */
function unmount(vnode, parentVNode, skipRemove) {
  var r;
  if (options.unmount) {
    options.unmount(vnode);
  }
  if (r = vnode.ref) {
    if (!r.current || r.current === vnode.__e) {
      applyRef(r, null, parentVNode);
    }
  }
  if ((r = vnode.__c) != null) {
    if (r.componentWillUnmount) {
      try {
        r.componentWillUnmount();
      } catch (e) {
        options.__e(e, parentVNode);
      }
    }
    r.base = r.__P = null;
  }
  if (r = vnode.__k) {
    for (var i = 0; i < r.length; i++) {
      if (r[i]) {
        unmount(r[i], parentVNode, typeof vnode.type != 'function');
      }
    }
  }
  if (!skipRemove && vnode.__e != null) {
    removeNode(vnode.__e);
  }

  // Must be set to `undefined` to properly clean up `_nextDom`
  // for which `null` is a valid value. See comment in `create-element.js`
  vnode.__e = vnode.__d = undefined;
}

/** The `.render()` method for a PFC backing instance. */
function doRender(props, state, context) {
  return this.constructor(props, context);
}

/**
 * Render a Preact virtual node into a DOM element
 * @param {import('./internal').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to
 * render into
 * @param {import('./internal').PreactElement | object} [replaceNode] Optional: Attempt to re-use an
 * existing DOM tree rooted at `replaceNode`
 */
function render(vnode, parentDom, replaceNode) {
  if (options.__) {
    options.__(vnode, parentDom);
  }

  // We abuse the `replaceNode` parameter in `hydrate()` to signal if we are in
  // hydration mode or not by passing the `hydrate` function instead of a DOM
  // element..
  var isHydrating = typeof replaceNode === 'function';

  // To be able to support calling `render()` multiple times on the same
  // DOM node, we need to obtain a reference to the previous tree. We do
  // this by assigning a new `_children` property to DOM nodes which points
  // to the last rendered tree. By default this property is not present, which
  // means that we are mounting a new tree for the first time.
  var oldVNode = isHydrating ? null : replaceNode && replaceNode.__k || parentDom.__k;
  vnode = (!isHydrating && replaceNode || parentDom).__k = createElement(Fragment, null, [vnode]);

  // List of effects that need to be called after diffing.
  var commitQueue = [];
  diff(parentDom,
  // Determine the new vnode tree and store it on the DOM element on
  // our custom `_children` property.
  vnode, oldVNode || EMPTY_OBJ, EMPTY_OBJ, parentDom.ownerSVGElement !== undefined, !isHydrating && replaceNode ? [replaceNode] : oldVNode ? null : parentDom.firstChild ? slice.call(parentDom.childNodes) : null, commitQueue, !isHydrating && replaceNode ? replaceNode : oldVNode ? oldVNode.__e : parentDom.firstChild, isHydrating);

  // Flush all queued effects
  commitRoot(commitQueue, vnode);
}

/**
 * Update an existing DOM element with data from a Preact virtual node
 * @param {import('./internal').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to
 * update
 */
function hydrate(vnode, parentDom) {
  render(vnode, parentDom, hydrate);
}

/**
 * Clones the given VNode, optionally adding attributes/props and replacing its children.
 * @param {import('./internal').VNode} vnode The virtual DOM element to clone
 * @param {object} props Attributes/props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} rest Any additional arguments will be used as replacement children.
 * @returns {import('./internal').VNode}
 */
function cloneElement(vnode, props, children) {
  var normalizedProps = assign({}, vnode.props),
    key,
    ref,
    i;
  for (i in props) {
    if (i == 'key') {
      key = props[i];
    } else if (i == 'ref') {
      ref = props[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }
  if (arguments.length > 2) {
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
    /** @type {import('./internal').FunctionComponent} */Consumer: function Consumer(props, contextValue) {
      // return props.children(
      // 	context[contextId] ? context[contextId].props.value : defaultValue
      // );
      return props.children(contextValue);
    },
    /** @type {import('./internal').FunctionComponent} */Provider: function Provider(props) {
      if (!this.getChildContext) {
        var subs = [];
        var ctx = {};
        ctx[contextId] = this;
        this.getChildContext = function () {
          return ctx;
        };
        this.shouldComponentUpdate = function (_props) {
          if (this.props.value !== _props.value) {
            // I think the forced value propagation here was only needed when `options.debounceRendering` was being bypassed:
            // https://github.com/preactjs/preact/commit/4d339fb803bea09e9f198abf38ca1bf8ea4b7771#diff-54682ce380935a717e41b8bfc54737f6R358
            // In those cases though, even with the value corrected, we're double-rendering all nodes.
            // It might be better to just tell folks not to use force-sync mode.
            // Currently, using `useContext()` in a class component will overwrite its `this.context` value.
            // subs.some(c => {
            // 	c.context = _props.value;
            // 	enqueueRender(c);
            // });

            // subs.some(c => {
            // 	c.context[contextId] = _props.value;
            // 	enqueueRender(c);
            // });
            subs.some(enqueueRender);
          }
        };
        this.sub = function (c) {
          subs.push(c);
          var old = c.componentWillUnmount;
          c.componentWillUnmount = function () {
            subs.splice(subs.indexOf(c), 1);
            if (old) {
              old.call(c);
            }
          };
        };
      }
      return props.children;
    }
  };

  // Devtools needs access to the context object when it
  // encounters a Provider. This is necessary to support
  // setting `displayName` on the context object instead
  // of on the component itself. See:
  // https://reactjs.org/docs/context.html#contextdisplayname

  return context.Provider.__ = context.Consumer.contextType = context;
}

/** @type {number} */
var currentIndex;

/** @type {import('./internal').Component} */
var currentComponent;

/** @type {number} */
var currentHook = 0;

/** @type {Array<import('./internal').Component>} */
var afterPaintEffects = [];
var oldBeforeDiff = options.__b;
var oldBeforeRender = options.__r;
var oldAfterDiff = options.diffed;
var oldCommit = options.__c;
var oldBeforeUnmount = options.unmount;
var RAF_TIMEOUT = 100;
var prevRaf;
options.__b = function (vnode) {
  currentComponent = null;
  if (oldBeforeDiff) {
    oldBeforeDiff(vnode);
  }
};
options.__r = function (vnode) {
  if (oldBeforeRender) {
    oldBeforeRender(vnode);
  }
  currentComponent = vnode.__c;
  currentIndex = 0;
  var hooks = currentComponent.__H;
  if (hooks) {
    hooks.__h.forEach(invokeCleanup);
    hooks.__h.forEach(invokeEffect);
    hooks.__h = [];
  }
};
options.diffed = function (vnode) {
  if (oldAfterDiff) {
    oldAfterDiff(vnode);
  }
  var c = vnode.__c;
  if (c && c.__H && c.__H.__h.length) {
    afterPaint(afterPaintEffects.push(c));
  }
  currentComponent = null;
};
options.__c = function (vnode, commitQueue) {
  commitQueue.some(function (component) {
    try {
      component.__h.forEach(invokeCleanup);
      component.__h = component.__h.filter(function (cb) {
        return cb.__ ? invokeEffect(cb) : true;
      });
    } catch (e) {
      commitQueue.some(function (c) {
        if (c.__h) {
          c.__h = [];
        }
      });
      commitQueue = [];
      options.__e(e, component.__v);
    }
  });
  if (oldCommit) {
    oldCommit(vnode, commitQueue);
  }
};
options.unmount = function (vnode) {
  if (oldBeforeUnmount) {
    oldBeforeUnmount(vnode);
  }
  var c = vnode.__c;
  if (c && c.__H) {
    try {
      c.__H.__.forEach(invokeCleanup);
    } catch (e) {
      options.__e(e, c.__v);
    }
  }
};

/**
 * Get a hook's state from the currentComponent
 * @param {number} index The index of the hook to get
 * @param {number} type The index of the hook to get
 * @returns {any}
 */
function getHookState(index, type) {
  if (options.__h) {
    options.__h(currentComponent, index, currentHook || type);
  }
  currentHook = 0;

  // Largely inspired by:
  // * https://github.com/michael-klein/funcy.js/blob/f6be73468e6ec46b0ff5aa3cc4c9baf72a29025a/src/hooks/core_hooks.mjs
  // * https://github.com/michael-klein/funcy.js/blob/650beaa58c43c33a74820a3c98b3c7079cf2e333/src/renderer.mjs
  // Other implementations to look at:
  // * https://codesandbox.io/s/mnox05qp8
  var hooks = currentComponent.__H || (currentComponent.__H = {
    __: [],
    __h: []
  });
  if (index >= hooks.__.length) {
    hooks.__.push({});
  }
  return hooks.__[index];
}

/**
 * @param {import('./index').StateUpdater<any>} [initialState]
 */
function useState(initialState) {
  currentHook = 1;
  return useReducer(invokeOrReturn, initialState);
}

/**
 * @param {import('./index').Reducer<any, any>} reducer
 * @param {import('./index').StateUpdater<any>} initialState
 * @param {(initialState: any) => void} [init]
 * @returns {[ any, (state: any) => void ]}
 */
function useReducer(reducer, initialState, init) {
  /** @type {import('./internal').ReducerHookState} */
  var hookState = getHookState(currentIndex++, 2);
  hookState._reducer = reducer;
  if (!hookState.__c) {
    hookState.__ = [!init ? invokeOrReturn(undefined, initialState) : init(initialState), function (action) {
      var nextValue = hookState._reducer(hookState.__[0], action);
      if (hookState.__[0] !== nextValue) {
        hookState.__ = [nextValue, hookState.__[1]];
        hookState.__c.setState({});
      }
    }];
    hookState.__c = currentComponent;
  }
  return hookState.__;
}

/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */
function useEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  var state = getHookState(currentIndex++, 3);
  if (!options.__s && argsChanged(state.__H, args)) {
    state.__ = callback;
    state.__H = args;
    currentComponent.__H.__h.push(state);
  }
}

/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */
function useLayoutEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  var state = getHookState(currentIndex++, 4);
  if (!options.__s && argsChanged(state.__H, args)) {
    state.__ = callback;
    state.__H = args;
    currentComponent.__h.push(state);
  }
}
function useRef(initialValue) {
  currentHook = 5;
  return useMemo(function () {
    return {
      current: initialValue
    };
  }, []);
}

/**
 * @param {object} ref
 * @param {() => object} createHandle
 * @param {any[]} args
 */
function useImperativeHandle(ref, createHandle, args) {
  currentHook = 6;
  useLayoutEffect(function () {
    if (typeof ref == 'function') {
      ref(createHandle());
    } else if (ref) {
      ref.current = createHandle();
    }
  }, args == null ? args : args.concat(ref));
}

/**
 * @param {() => any} factory
 * @param {any[]} args
 */
function useMemo(factory, args) {
  /** @type {import('./internal').MemoHookState} */
  var state = getHookState(currentIndex++, 7);
  if (argsChanged(state.__H, args)) {
    state.__ = factory();
    state.__H = args;
    state.__h = factory;
  }
  return state.__;
}

/**
 * @param {() => void} callback
 * @param {any[]} args
 */
function useCallback(callback, args) {
  currentHook = 8;
  return useMemo(function () {
    return callback;
  }, args);
}

/**
 * @param {import('./internal').PreactContext} context
 */
function useContext(context) {
  var provider = currentComponent.context[context.__c];
  // We could skip this call here, but than we'd not call
  // `options._hook`. We need to do that in order to make
  // the devtools aware of this hook.
  /** @type {import('./internal').ContextHookState} */
  var state = getHookState(currentIndex++, 9);
  // The devtools needs access to the context object to
  // be able to pull of the default value when no provider
  // is present in the tree.
  state.c = context;
  if (!provider) {
    return context.__;
  }
  // This is probably not safe to convert to "!"
  if (state.__ == null) {
    state.__ = true;
    provider.sub(currentComponent);
  }
  return provider.props.value;
}

/**
 * Display a custom label for a custom hook for the devtools panel
 * @type {<T>(value: T, cb?: (value: T) => string | number) => void}
 */
function useDebugValue(value, formatter) {
  if (options.useDebugValue) {
    options.useDebugValue(formatter ? formatter(value) : value);
  }
}

/**
 * @param {(error: any) => void} cb
 */
function useErrorBoundary(cb) {
  /** @type {import('./internal').ErrorBoundaryHookState} */
  var state = getHookState(currentIndex++, 10);
  var errState = useState();
  state.__ = cb;
  if (!currentComponent.componentDidCatch) {
    currentComponent.componentDidCatch = function (err) {
      if (state.__) {
        state.__(err);
      }
      errState[1](err);
    };
  }
  return [errState[0], function () {
    errState[1](undefined);
  }];
}

/**
 * After paint effects consumer.
 */
function flushAfterPaintEffects() {
  afterPaintEffects.forEach(function (component) {
    if (component.__P) {
      try {
        component.__H.__h.forEach(invokeCleanup);
        component.__H.__h.forEach(invokeEffect);
        component.__H.__h = [];
      } catch (e) {
        component.__H.__h = [];
        options.__e(e, component.__v);
      }
    }
  });
  afterPaintEffects = [];
}
var HAS_RAF = typeof requestAnimationFrame == 'function';

/**
 * Schedule a callback to be invoked after the browser has a chance to paint a new frame.
 * Do this by combining requestAnimationFrame (rAF) + setTimeout to invoke a callback after
 * the next browser frame.
 *
 * Also, schedule a timeout in parallel to the the rAF to ensure the callback is invoked
 * even if RAF doesn't fire (for example if the browser tab is not visible)
 *
 * @param {() => void} callback
 */
function afterNextFrame(callback) {
  var done = function done() {
    clearTimeout(timeout);
    if (HAS_RAF) {
      cancelAnimationFrame(raf);
    }
    setTimeout(callback);
  };
  var timeout = setTimeout(done, RAF_TIMEOUT);
  var raf;
  if (HAS_RAF) {
    raf = requestAnimationFrame(done);
  }
}

// Note: if someone used options.debounceRendering = requestAnimationFrame,
// then effects will ALWAYS run on the NEXT frame instead of the current one, incurring a ~16ms delay.
// Perhaps this is not such a big deal.
/**
 * Schedule afterPaintEffects flush after the browser paints
 * @param {number} newQueueLength
 */
function afterPaint(newQueueLength) {
  if (newQueueLength === 1 || prevRaf !== options.requestAnimationFrame) {
    prevRaf = options.requestAnimationFrame;
    (prevRaf || afterNextFrame)(flushAfterPaintEffects);
  }
}

/**
 * @param {import('./internal').EffectHookState} hook
 */
function invokeCleanup(hook) {
  // A hook cleanup can introduce a call to render which creates a new root, this will call options.vnode
  // and move the currentComponent away.
  var comp = currentComponent;
  if (typeof hook.__c == 'function') {
    hook.__c();
  }
  currentComponent = comp;
}

/**
 * Invoke a Hook's effect
 * @param {import('./internal').EffectHookState} hook
 */
function invokeEffect(hook) {
  // A hook call can introduce a call to render which creates a new root, this will call options.vnode
  // and move the currentComponent away.
  var comp = currentComponent;
  hook.__c = hook.__();
  currentComponent = comp;
}

/**
 * @param {any[]} oldArgs
 * @param {any[]} newArgs
 */
function argsChanged(oldArgs, newArgs) {
  return !oldArgs || oldArgs.length !== newArgs.length || newArgs.some(function (arg, index) {
    return arg !== oldArgs[index];
  });
}
function invokeOrReturn(arg, f) {
  return typeof f == 'function' ? f(arg) : f;
}

let oldDiffHook = options._diff;
options._diff = vnode => {
  if (vnode.type && vnode.type._forwarded && vnode.ref) {
    vnode.props.ref = vnode.ref;
    vnode.ref = null;
  }
  if (oldDiffHook) oldDiffHook(vnode);
};
const REACT_FORWARD_SYMBOL = typeof Symbol != 'undefined' && Symbol.for && Symbol.for('react.forward_ref') || 0xf47;

/**
 * Pass ref down to a child. This is mainly used in libraries with HOCs that
 * wrap components. Using `forwardRef` there is an easy way to get a reference
 * of the wrapped component instead of one of the wrapper itself.
 * @param {import('./index').ForwardFn} fn
 * @returns {import('./internal').FunctionComponent}
 */
function forwardRef(fn) {
  // We always have ref in props.ref, except for
  // mobx-react. It will call this function directly
  // and always pass ref as the second argument.
  function Forwarded(props, ref) {
    let clone = assign({}, props);
    delete clone.ref;
    ref = props.ref || ref;
    return fn(clone, !ref || typeof ref === 'object' && !('current' in ref) ? null : ref);
  }

  // mobx-react checks for this being present
  Forwarded.$$typeof = REACT_FORWARD_SYMBOL;
  // mobx-react heavily relies on implementation details.
  // It expects an object here with a `render` property,
  // and prototype.render will fail. Without this
  // mobx-react throws.
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

  // `build()` used the first element of the operation list as
  // temporary workspace. Now that `build()` is done we can use
  // that space to track whether the current element is "dynamic"
  // (i.e. it or any of its descendants depend on dynamic values).
  built[0] = 0;
  for (let i = 1; i < built.length; i++) {
    const type = built[i++];

    // Set `built[0]`'s appropriate bits if this element depends on a dynamic value.
    const value = built[i] ? (built[0] |= type ? 1 : 2, fields[built[i++]]) : built[++i];
    if (type === TAG_SET) {
      args[0] = value;
    } else if (type === PROPS_ASSIGN) {
      args[1] = Object.assign(args[1] || {}, value);
    } else if (type === PROP_SET) {
      (args[1] = args[1] || {})[built[++i]] = value;
    } else if (type === PROP_APPEND) {
      args[1][built[++i]] += value + '';
    } else if (type) {
      // type === CHILD_RECURSE
      // Set the operation list (including the staticness bits) as
      // `this` for the `h` call.
      tmp = h.apply(value, evaluate(h, value, fields, ['', null]));
      args.push(tmp);
      if (value[0]) {
        // Set the 2nd lowest bit it the child element is dynamic.
        built[0] |= 2;
      } else {
        // Rewrite the operation list in-place if the child element is static.
        // The currently evaluated piece `CHILD_RECURSE, 0, [...]` becomes
        // `CHILD_APPEND, 0, tmp`.
        // Essentially the operation list gets optimized for potential future
        // re-evaluations.
        built[i - 2] = CHILD_APPEND;
        built[i] = tmp;
      }
    } else {
      // type === CHILD_APPEND
      args.push(value);
    }
  }
  return args;
};
const build = function (statics) {
  let mode = MODE_TEXT;
  let buffer = '';
  let quote = '';
  let current = [0];
  let char, propName;
  const commit = field => {
    if (mode === MODE_TEXT && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
      {
        current.push(CHILD_APPEND, field, buffer);
      }
    } else if (mode === MODE_TAGNAME && (field || buffer)) {
      {
        current.push(TAG_SET, field, buffer);
      }
      mode = MODE_WHITESPACE;
    } else if (mode === MODE_WHITESPACE && buffer === '...' && field) {
      {
        current.push(PROPS_ASSIGN, field, 0);
      }
    } else if (mode === MODE_WHITESPACE && buffer && !field) {
      {
        current.push(PROP_SET, 0, true, buffer);
      }
    } else if (mode >= MODE_PROP_SET) {
      {
        if (buffer || !field && mode === MODE_PROP_SET) {
          current.push(mode, 0, buffer, propName);
          mode = MODE_PROP_APPEND;
        }
        if (field) {
          current.push(mode, field, 0, propName);
          mode = MODE_PROP_APPEND;
        }
      }
    }
    buffer = '';
  };
  for (let i = 0; i < statics.length; i++) {
    if (i) {
      if (mode === MODE_TEXT) {
        commit();
      }
      commit(i);
    }
    for (let j = 0; j < statics[i].length; j++) {
      char = statics[i][j];
      if (mode === MODE_TEXT) {
        if (char === '<') {
          // commit buffer
          commit();
          {
            current = [current];
          }
          mode = MODE_TAGNAME;
        } else {
          buffer += char;
        }
      } else if (mode === MODE_COMMENT) {
        // Ignore everything until the last three characters are '-', '-' and '>'
        if (buffer === '--' && char === '>') {
          mode = MODE_TEXT;
          buffer = '';
        } else {
          buffer = char + buffer[0];
        }
      } else if (quote) {
        if (char === quote) {
          quote = '';
        } else {
          buffer += char;
        }
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        commit();
        mode = MODE_TEXT;
      } else if (!mode) ; else if (char === '=') {
        mode = MODE_PROP_SET;
        propName = buffer;
        buffer = '';
      } else if (char === '/' && (mode < MODE_PROP_SET || statics[i][j + 1] === '>')) {
        commit();
        if (mode === MODE_TAGNAME) {
          current = current[0];
        }
        mode = current;
        {
          (current = current[0]).push(CHILD_RECURSE, 0, mode);
        }
        mode = MODE_SLASH;
      } else if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        // <a disabled>
        commit();
        mode = MODE_WHITESPACE;
      } else {
        buffer += char;
      }
      if (mode === MODE_TAGNAME && buffer === '!--') {
        mode = MODE_COMMENT;
        current = current[0];
      }
    }
  }
  commit();
  return current;
};

const CACHES = new Map();
const regular = function (statics) {
  let tmp = CACHES.get(this);
  if (!tmp) {
    tmp = new Map();
    CACHES.set(this, tmp);
  }
  tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, tmp = build(statics)), tmp), arguments, []);
  return tmp.length > 1 ? tmp : tmp[0];
};
var htm = regular;

const html = htm.bind(createElement);

export { Component, Fragment, cloneElement, createContext, createElement, createRef, forwardRef, createElement as h, html, hydrate, isValidElement, options, render, toChildArray, useCallback, useContext, useDebugValue, useEffect, useErrorBoundary, useImperativeHandle, useLayoutEffect, useMemo, useReducer, useRef, useState };
