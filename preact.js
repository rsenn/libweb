const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */
function assign(obj, props) {
  for(let i in props) obj[i] = props[i];
  return /** @type {O & P} */ (obj);
}

/**
 * Remove a child node from its parent if attached. This is a workaround for
 * IE11 which doesn't support `Element.prototype.remove()`. Using this function
 * is smaller than including a dedicated polyfill.
 * @param {Node} node The node to remove
 */
function removeNode(node) {
  let parentNode = node.parentNode;
  if(parentNode) parentNode.removeChild(node);
}

/**
 * Find the closest error boundary to a thrown error and call it
 * @param {object} error The thrown value
 * @param {import('../internal').VNode} vnode The vnode that threw
 * the error that was caught (except for unmounting when this parameter
 * is the highest parent that was being unmounted)
 */
function _catchError(error, vnode) {
  /** @type {import('../internal').Component} */
  let component, hasCaught;

  for(; (vnode = vnode._parent); ) {
    if((component = vnode._component) && !component._processingException) {
      try {
        if(component.constructor && component.constructor.getDerivedStateFromError != null) {
          hasCaught = true;
          component.setState(component.constructor.getDerivedStateFromError(error));
        }

        if(component.componentDidCatch != null) {
          hasCaught = true;
          component.componentDidCatch(error);
        }

        if(hasCaught) return enqueueRender((component._pendingError = component));
      } catch(e) {
        error = e;
      }
    }
  }

  throw error;
}

/**
 * The `option` object can potentially contain callback functions
 * that are called during various stages of our renderer. This is the
 * foundation on which all our addons like `preact/debug`, `preact/compat`,
 * and `preact/hooks` are based on. See the `Options` type in `internal.d.ts`
 * for a full list of available option hooks (most editors/IDEs allow you to
 * ctrl+click or cmd+click on mac the type definition below).
 * @type {import('./internal').Options}
 */
const options = {
  _catchError
};

/**
 * Create an virtual node (used for JSX)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * constructor for this virtual node
 * @param {object | null | undefined} [props] The properties of the virtual node
 * @param {Array<import('.').ComponentChildren>} [children] The children of the virtual node
 * @returns {import('./internal').VNode}
 */
function createElement(type, props, children) {
  let normalizedProps = {},
    i;
  for(i in props) {
    if(i !== 'key' && i !== 'ref') normalizedProps[i] = props[i];
  }

  if(arguments.length > 3) {
    children = [children];
    // https://github.com/preactjs/preact/issues/1916
    for(i = 3; i < arguments.length; i++) {
      children.push(arguments[i]);
    }
  }
  if(children != null) {
    normalizedProps.children = children;
  }

  // If a Component VNode, check for and apply defaultProps
  // Note: type may be undefined in development, must never error here.
  if(typeof type == 'function' && type.defaultProps != null) {
    for(i in type.defaultProps) {
      if(normalizedProps[i] === undefined) {
        normalizedProps[i] = type.defaultProps[i];
      }
    }
  }

  return createVNode(type, normalizedProps, props && props.key, props && props.ref, null);
}

/**
 * Create a VNode (used internally by Preact)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * Constructor for this virtual node
 * @param {object | string | number | null} props The properties of this virtual node.
 * If this virtual node represents a text node, this is the text of the node (string or number).
 * @param {string | number | null} key The key for this virtual node, used when
 * diffing it against its children
 * @param {import('./internal').VNode["ref"]} ref The ref property that will
 * receive a reference to its created child
 * @returns {import('./internal').VNode}
 */
function createVNode(type, props, key, ref, original) {
  // V8 seems to be better at detecting type shapes if the object is allocated from the same call site
  // Do not inline into createElement and coerceToVNode!
  const vnode = {
    type,
    props,
    key,
    ref,
    _children: null,
    _parent: null,
    _depth: 0,
    _dom: null,
    // _nextDom must be initialized to undefined b/c it will eventually
    // be set to dom.nextSibling which can return `null` and it is important
    // to be able to distinguish between an uninitialized _nextDom and
    // a _nextDom that has been set to `null`
    _nextDom: undefined,
    _component: null,
    constructor: undefined,
    _original: original
  };

  if(original == null) vnode._original = vnode;
  if(options.vnode) options.vnode(vnode);

  return vnode;
}

function Fragment(props) {
  return props.children;
}

/**
 * Base Component class. Provides `setState()` and `forceUpdate()`, which
 * trigger rendering
 * @param {object} props The initial component props
 * @param {object} context The initial context from parent components'
 * getChildContext
 */
function Component(props, context) {
  this.props = props;
  this.context = context;
}

/**
 * Update component state and schedule a re-render.
 * @param {object | ((s: object, p: object) => object)} update A hash of state
 * properties to update with new values or a function that given the current
 * state and props returns a new partial state
 * @param {() => void} [callback] A function to be called once component state is
 * updated
 */
Component.prototype.setState = function(update, callback) {
  // only clone state when copying to nextState the first time.
  let s;
  if(this._nextState !== this.state) {
    s = this._nextState;
  } else {
    s = this._nextState = assign({}, this.state);
  }

  if(typeof update == 'function') {
    update = update(s, this.props);
  }

  if(update) {
    assign(s, update);
  }

  // Skip update if updater function returned null
  if(update == null) return;

  if(this._vnode) {
    if(callback) this._renderCallbacks.push(callback);
    enqueueRender(this);
  }
};

/**
 * Immediately perform a synchronous re-render of the component
 * @param {() => void} [callback] A function to be called after component is
 * re-rendered
 */
Component.prototype.forceUpdate = function(callback) {
  if(this._vnode) {
    // Set render mode so that we can differentiate where the render request
    // is coming from. We need this because forceUpdate should never call
    // shouldComponentUpdate
    this._force = true;
    if(callback) this._renderCallbacks.push(callback);
    enqueueRender(this);
  }
};

/**
 * Accepts `props` and `state`, and returns a new Virtual DOM tree to build.
 * Virtual DOM is generally constructed via [JSX](http://jasonformat.com/wtf-is-jsx).
 * @param {object} props Props (eg: JSX attributes) received from parent
 * element/component
 * @param {object} state The component's current state
 * @param {object} context Context object, as returned by the nearest
 * ancestor's `getChildContext()`
 * @returns {import('./index').ComponentChildren | void}
 */
Component.prototype.render = Fragment;

/**
 * @param {import('./internal').VNode} vnode
 * @param {number | null} [childIndex]
 */
function getDomSibling(vnode, childIndex) {
  if(childIndex == null) {
    // Use childIndex==null as a signal to resume the search from the vnode's sibling
    return vnode._parent ? getDomSibling(vnode._parent, vnode._parent._children.indexOf(vnode) + 1) : null;
  }

  let sibling;
  for(; childIndex < vnode._children.length; childIndex++) {
    sibling = vnode._children[childIndex];

    if(sibling != null && sibling._dom != null) {
      // Since updateParentDomPointers keeps _dom pointer correct,
      // we can rely on _dom to tell us if this subtree contains a
      // rendered DOM node, and what the first rendered DOM node is
      return sibling._dom;
    }
  }

  // If we get here, we have not found a DOM node in this vnode's children.
  // We must resume from this vnode's sibling (in it's parent _children array)
  // Only climb up and search the parent if we aren't searching through a DOM
  // VNode (meaning we reached the DOM parent of the original vnode that began
  // the search)
  return typeof vnode.type == 'function' ? getDomSibling(vnode) : null;
}

/**
 * Trigger in-place re-rendering of a component.
 * @param {import('./internal').Component} component The component to rerender
 */
function renderComponent(component) {
  let vnode = component._vnode,
    oldDom = vnode._dom,
    parentDom = component._parentDom;

  if(parentDom) {
    let commitQueue = [];
    const oldVNode = assign({}, vnode);
    oldVNode._original = oldVNode;

    let newDom = diff(parentDom, vnode, oldVNode, component._globalContext, parentDom.ownerSVGElement !== undefined, null, commitQueue, oldDom == null ? getDomSibling(vnode) : oldDom);
    commitRoot(commitQueue, vnode);

    if(newDom != oldDom) {
      updateParentDomPointers(vnode);
    }
  }
}

/**
 * @param {import('./internal').VNode} vnode
 */
function updateParentDomPointers(vnode) {
  if((vnode = vnode._parent) != null && vnode._component != null) {
    vnode._dom = vnode._component.base = null;
    for(let i = 0; i < vnode._children.length; i++) {
      let child = vnode._children[i];
      if(child != null && child._dom != null) {
        vnode._dom = vnode._component.base = child._dom;
        break;
      }
    }

    return updateParentDomPointers(vnode);
  }
}

/**
 * The render queue
 * @type {Array<import('./internal').Component>}
 */
let rerenderQueue = [];

/**
 * Asynchronously schedule a callback
 * @type {(cb: () => void) => void}
 */
/* istanbul ignore next */
// Note the following line isn't tree-shaken by rollup cuz of rollup/rollup#2566
const defer = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;

/*
 * The value of `Component.debounce` must asynchronously invoke the passed in callback. It is
 * important that contributors to Preact can consistently reason about what calls to `setState`, etc.
 * do, and when their effects will be applied. See the links below for some further reading on designing
 * asynchronous APIs.
 * * [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony)
 * * [Callbacks synchronous and asynchronous](https://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/)
 */

let prevDebounce;

/**
 * Enqueue a rerender of a component
 * @param {import('./internal').Component} c The component to rerender
 */
function enqueueRender(c) {
  if((!c._dirty && (c._dirty = true) && rerenderQueue.push(c) && !process._rerenderCount++) || prevDebounce !== options.debounceRendering) {
    prevDebounce = options.debounceRendering;
    (prevDebounce || defer)(process);
  }
}

/** Flush the render queue by rerendering all queued components */
function process() {
  let queue;
  while((process._rerenderCount = rerenderQueue.length)) {
    queue = rerenderQueue.sort((a, b) => a._vnode._depth - b._vnode._depth);
    rerenderQueue = [];
    // Don't update `renderCount` yet. Keep its value non-zero to prevent unnecessary
    // process() calls from getting scheduled while `queue` is still being consumed.
    queue.some(c => {
      if(c._dirty) renderComponent(c);
    });
  }
}
process._rerenderCount = 0;

/**
 * Diff the children of a virtual node
 * @param {import('../internal').PreactElement} parentDom The DOM element whose
 * children are being diffed
 * @param {import('../index').ComponentChildren[]} renderResult
 * @param {import('../internal').VNode} newParentVNode The new virtual
 * node whose children should be diff'ed against oldParentVNode
 * @param {import('../internal').VNode} oldParentVNode The old virtual
 * node whose children should be diff'ed against newParentVNode
 * @param {object} globalContext The current context object - modified by getChildContext
 * @param {boolean} isSvg Whether or not this DOM node is an SVG node
 * @param {Array<import('../internal').PreactElement>} excessDomChildren
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {Node | Text} oldDom The current attached DOM
 * element any new dom elements should be placed around. Likely `null` on first
 * render (except when hydrating). Can be a sibling DOM element when diffing
 * Fragments that have siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} isHydrating Whether or not we are in hydration
 */
function diffChildren(parentDom, renderResult, newParentVNode, oldParentVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  let i, j, oldVNode, childVNode, newDom, firstChildDom, refs;

  // This is a compression of oldParentVNode!=null && oldParentVNode != EMPTY_OBJ && oldParentVNode._children || EMPTY_ARR
  // as EMPTY_OBJ._children should be `undefined`.
  let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR;

  let oldChildrenLength = oldChildren.length;

  // Only in very specific places should this logic be invoked (top level `render` and `diffElementNodes`).
  // I'm using `EMPTY_OBJ` to signal when `diffChildren` is invoked in these situations. I can't use `null`
  // for this purpose, because `null` is a valid value for `oldDom` which can mean to skip to this logic
  // (e.g. if mounting a new tree in which the old DOM should be ignored (usually for Fragments).
  if(oldDom == EMPTY_OBJ) {
    if(excessDomChildren != null) {
      oldDom = excessDomChildren[0];
    } else if(oldChildrenLength) {
      oldDom = getDomSibling(oldParentVNode, 0);
    } else {
      oldDom = null;
    }
  }

  newParentVNode._children = [];
  for(i = 0; i < renderResult.length; i++) {
    childVNode = renderResult[i];

    if(childVNode == null || typeof childVNode == 'boolean') {
      childVNode = newParentVNode._children[i] = null;
    }
    // If this newVNode is being reused (e.g. <div>{reuse}{reuse}</div>) in the same diff,
    // or we are rendering a component (e.g. setState) copy the oldVNodes so it can have
    // it's own DOM & etc. pointers
    else if(typeof childVNode == 'string' || typeof childVNode == 'number') {
      childVNode = newParentVNode._children[i] = createVNode(null, childVNode, null, null, childVNode);
    } else if(Array.isArray(childVNode)) {
      childVNode = newParentVNode._children[i] = createVNode(Fragment, { children: childVNode }, null, null, null);
    } else if(childVNode._dom != null || childVNode._component != null) {
      childVNode = newParentVNode._children[i] = createVNode(childVNode.type, childVNode.props, childVNode.key, null, childVNode._original);
    } else {
      childVNode = newParentVNode._children[i] = childVNode;
    }

    // Terser removes the `continue` here and wraps the loop body
    // in a `if (childVNode) { ... } condition
    if(childVNode == null) {
      continue;
    }

    childVNode._parent = newParentVNode;
    childVNode._depth = newParentVNode._depth + 1;

    // Check if we find a corresponding element in oldChildren.
    // If found, delete the array item by setting to `undefined`.
    // We use `undefined`, as `null` is reserved for empty placeholders
    // (holes).
    oldVNode = oldChildren[i];

    if(oldVNode === null || (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type)) {
      oldChildren[i] = undefined;
    } else {
      // Either oldVNode === undefined or oldChildrenLength > 0,
      // so after this loop oldVNode == null or oldVNode is a valid value.
      for(j = 0; j < oldChildrenLength; j++) {
        oldVNode = oldChildren[j];
        // If childVNode is unkeyed, we only match similarly unkeyed nodes, otherwise we match by key.
        // We always match by type (in either case).
        if(oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
          oldChildren[j] = undefined;
          break;
        }
        oldVNode = null;
      }
    }

    oldVNode = oldVNode || EMPTY_OBJ;

    // Morph the old element into the new one, but don't append it to the dom yet
    newDom = diff(parentDom, childVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);

    if((j = childVNode.ref) && oldVNode.ref != j) {
      if(!refs) refs = [];
      if(oldVNode.ref) refs.push(oldVNode.ref, null, childVNode);
      refs.push(j, childVNode._component || newDom, childVNode);
    }

    if(newDom != null) {
      if(firstChildDom == null) {
        firstChildDom = newDom;
      }

      oldDom = placeChild(parentDom, childVNode, oldVNode, oldChildren, excessDomChildren, newDom, oldDom);

      // Browsers will infer an option's `value` from `textContent` when
      // no value is present. This essentially bypasses our code to set it
      // later in `diff()`. It works fine in all browsers except for IE11
      // where it breaks setting `select.value`. There it will be always set
      // to an empty string. Re-applying an options value will fix that, so
      // there are probably some internal data structures that aren't
      // updated properly.
      //
      // To fix it we make sure to reset the inferred value, so that our own
      // value check in `diff()` won't be skipped.
      if(newParentVNode.type == 'option') {
        parentDom.value = '';
      } else if(typeof newParentVNode.type == 'function') {
        // Because the newParentVNode is Fragment-like, we need to set it's
        // _nextDom property to the nextSibling of its last child DOM node.
        //
        // `oldDom` contains the correct value here because if the last child
        // is a Fragment-like, then oldDom has already been set to that child's _nextDom.
        // If the last child is a DOM VNode, then oldDom will be set to that DOM
        // node's nextSibling.
        newParentVNode._nextDom = oldDom;
      }
    } else if(oldDom && oldVNode._dom == oldDom && oldDom.parentNode != parentDom) {
      // The above condition is to handle null placeholders. See test in placeholder.test.js:
      // `efficiently replace null placeholders in parent rerenders`
      oldDom = getDomSibling(oldVNode);
    }
  }

  newParentVNode._dom = firstChildDom;

  // Remove children that are not part of any vnode.
  if(excessDomChildren != null && typeof newParentVNode.type != 'function') {
    for(i = excessDomChildren.length; i--; ) {
      if(excessDomChildren[i] != null) removeNode(excessDomChildren[i]);
    }
  }

  // Remove remaining oldChildren if there are any.
  for(i = oldChildrenLength; i--; ) {
    if(oldChildren[i] != null) unmount(oldChildren[i], oldChildren[i]);
  }

  // Set refs only after unmount
  if(refs) {
    for(i = 0; i < refs.length; i++) {
      applyRef(refs[i], refs[++i], refs[++i]);
    }
  }
}

function placeChild(parentDom, childVNode, oldVNode, oldChildren, excessDomChildren, newDom, oldDom) {
  let nextDom;
  if(childVNode._nextDom !== undefined) {
    // Only Fragments or components that return Fragment like VNodes will
    // have a non-undefined _nextDom. Continue the diff from the sibling
    // of last DOM child of this child VNode
    nextDom = childVNode._nextDom;

    // Eagerly cleanup _nextDom. We don't need to persist the value because
    // it is only used by `diffChildren` to determine where to resume the diff after
    // diffing Components and Fragments. Once we store it the nextDOM local var, we
    // can clean up the property
    childVNode._nextDom = undefined;
  } else if(excessDomChildren == oldVNode || newDom != oldDom || newDom.parentNode == null) {
    // NOTE: excessDomChildren==oldVNode above:
    // This is a compression of excessDomChildren==null && oldVNode==null!
    // The values only have the same type when `null`.

    outer: if(oldDom == null || oldDom.parentNode !== parentDom) {
      parentDom.appendChild(newDom);
      nextDom = null;
    } else {
      // `j<oldChildrenLength; j+=2` is an alternative to `j++<oldChildrenLength/2`
      for(let sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildren.length; j += 2) {
        if(sibDom == newDom) {
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
  if(nextDom !== undefined) {
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
  let i;

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
  } else if(typeof value == 'number' && IS_NON_DIMENSIONAL.test(key) === false) {
    style[key] = value + 'px';
  } else if(value == null) {
    style[key] = '';
  } else {
    style[key] = value;
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
  let s, useCapture, nameLower;

  if(isSvg) {
    if(name === 'className') {
      name = 'class';
    }
  } else if(name === 'class') {
    name = 'className';
  }

  if(name === 'style') {
    s = dom.style;

    if(typeof value == 'string') {
      s.cssText = value;
    } else {
      if(typeof oldValue == 'string') {
        s.cssText = '';
        oldValue = null;
      }

      if(oldValue) {
        for(let i in oldValue) {
          if(!(value && i in value)) {
            setStyle(s, i, '');
          }
        }
      }

      if(value) {
        for(let i in value) {
          if(!oldValue || value[i] !== oldValue[i]) {
            setStyle(s, i, value[i]);
          }
        }
      }
    }
  }
  // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
  else if(name[0] === 'o' && name[1] === 'n') {
    useCapture = name !== (name = name.replace(/Capture$/, ''));
    nameLower = name.toLowerCase();
    name = (nameLower in dom ? nameLower : name).slice(2);

    if(value) {
      if(!oldValue) dom.addEventListener(name, eventProxy, useCapture);
      (dom._listeners || (dom._listeners = {}))[name] = value;
    } else {
      dom.removeEventListener(name, eventProxy, useCapture);
    }
  } else if(
    name !== 'list' &&
    name !== 'tagName' &&
    // HTMLButtonElement.form and HTMLInputElement.form are read-only but can be set using
    // setAttribute
    name !== 'form' &&
    name !== 'type' &&
    name !== 'size' &&
    !isSvg &&
    name in dom
  ) {
    dom[name] = value == null ? '' : value;
  } else if(typeof value != 'function' && name !== 'dangerouslySetInnerHTML') {
    if(name !== (name = name.replace(/^xlink:?/, ''))) {
      if(value == null || value === false) {
        dom.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());
      } else {
        dom.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);
      }
    } else if(
      value == null ||
      (value === false &&
        // ARIA-attributes have a different notion of boolean values.
        // The value `false` is different from the attribute not
        // existing on the DOM, so we can't remove it. For non-boolean
        // ARIA-attributes we could treat false as a removal, but the
        // amount of exceptions would cost us too many bytes. On top of
        // that other VDOM frameworks also always stringify `false`.
        !/^ar/.test(name))
    ) {
      dom.removeAttribute(name);
    } else {
      dom.setAttribute(name, value);
    }
  }
}

/**
 * Proxy an event to hooked event handlers
 * @param {Event} e The event object from the browser
 * @private
 */
function eventProxy(e) {
  this._listeners[e.type](options.event ? options.event(e) : e);
}

function reorderChildren(newVNode, oldDom, parentDom) {
  for(let tmp = 0; tmp < newVNode._children.length; tmp++) {
    const vnode = newVNode._children[tmp];
    if(vnode) {
      vnode._parent = newVNode;

      if(vnode._dom) {
        if(typeof vnode.type == 'function' && vnode._children.length > 1) {
          reorderChildren(vnode, oldDom, parentDom);
        }

        oldDom = placeChild(parentDom, vnode, vnode, newVNode._children, null, vnode._dom, oldDom);

        if(typeof newVNode.type == 'function') {
          newVNode._nextDom = oldDom;
        }
      }
    }
  }
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
 * @param {Element | Text} oldDom The current attached DOM
 * element any new dom elements should be placed around. Likely `null` on first
 * render (except when hydrating). Can be a sibling DOM element when diffing
 * Fragments that have siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} [isHydrating] Whether or not we are in hydration
 */
function diff(parentDom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  let tmp,
    newType = newVNode.type;

  // When passing through createElement it assigns the object
  // constructor as undefined. This to prevent JSON-injection.
  if(newVNode.constructor !== undefined) return null;

  if((tmp = options._diff)) tmp(newVNode);

  try {
    outer: if(typeof newType == 'function') {
      let c, isNew, oldProps, oldState, snapshot, clearProcessingException;
      let newProps = newVNode.props;

      // Necessary for createContext api. Setting this property will pass
      // the context value as `this.context` just for this component.
      tmp = newType.contextType;
      let provider = tmp && globalContext[tmp._id];
      let componentContext = tmp ? (provider ? provider.props.value : tmp._defaultValue) : globalContext;

      // Get component and set it to `c`
      if(oldVNode._component) {
        c = newVNode._component = oldVNode._component;
        clearProcessingException = c._processingException = c._pendingError;
      } else {
        // Instantiate the new component
        if('prototype' in newType && newType.prototype.render) {
          newVNode._component = c = new newType(newProps, componentContext); // eslint-disable-line new-cap
        } else {
          newVNode._component = c = new Component(newProps, componentContext);
          c.constructor = newType;
          c.render = doRender;
        }
        if(provider) provider.sub(c);

        c.props = newProps;
        if(!c.state) c.state = {};
        c.context = componentContext;
        c._globalContext = globalContext;
        isNew = c._dirty = true;
        c._renderCallbacks = [];
      }

      // Invoke getDerivedStateFromProps
      if(c._nextState == null) {
        c._nextState = c.state;
      }
      if(newType.getDerivedStateFromProps != null) {
        if(c._nextState == c.state) {
          c._nextState = assign({}, c._nextState);
        }

        assign(c._nextState, newType.getDerivedStateFromProps(newProps, c._nextState));
      }

      oldProps = c.props;
      oldState = c.state;

      // Invoke pre-render lifecycle methods
      if(isNew) {
        if(newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
          c.componentWillMount();
        }

        if(c.componentDidMount != null) {
          c._renderCallbacks.push(c.componentDidMount);
        }
      } else {
        if(newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
          c.componentWillReceiveProps(newProps, componentContext);
        }

        if((!c._force && c.shouldComponentUpdate != null && c.shouldComponentUpdate(newProps, c._nextState, componentContext) === false) || newVNode._original === oldVNode._original) {
          c.props = newProps;
          c.state = c._nextState;
          // More info about this here: https://gist.github.com/JoviDeCroock/bec5f2ce93544d2e6070ef8e0036e4e8
          if(newVNode._original !== oldVNode._original) c._dirty = false;
          c._vnode = newVNode;
          newVNode._dom = oldVNode._dom;
          newVNode._children = oldVNode._children;
          if(c._renderCallbacks.length) {
            commitQueue.push(c);
          }

          reorderChildren(newVNode, oldDom, parentDom);
          break outer;
        }

        if(c.componentWillUpdate != null) {
          c.componentWillUpdate(newProps, c._nextState, componentContext);
        }

        if(c.componentDidUpdate != null) {
          c._renderCallbacks.push(() => {
            c.componentDidUpdate(oldProps, oldState, snapshot);
          });
        }
      }

      c.context = componentContext;
      c.props = newProps;
      c.state = c._nextState;

      if((tmp = options._render)) tmp(newVNode);

      c._dirty = false;
      c._vnode = newVNode;
      c._parentDom = parentDom;

      tmp = c.render(c.props, c.state, c.context);

      // Handle setState called in render, see #2553
      c.state = c._nextState;

      if(c.getChildContext != null) {
        globalContext = assign(assign({}, globalContext), c.getChildContext());
      }

      if(!isNew && c.getSnapshotBeforeUpdate != null) {
        snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
      }

      let isTopLevelFragment = tmp != null && tmp.type == Fragment && tmp.key == null;
      let renderResult = isTopLevelFragment ? tmp.props.children : tmp;

      diffChildren(parentDom, Array.isArray(renderResult) ? renderResult : [renderResult], newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);

      c.base = newVNode._dom;

      if(c._renderCallbacks.length) {
        commitQueue.push(c);
      }

      if(clearProcessingException) {
        c._pendingError = c._processingException = null;
      }

      c._force = false;
    } else if(excessDomChildren == null && newVNode._original === oldVNode._original) {
      newVNode._children = oldVNode._children;
      newVNode._dom = oldVNode._dom;
    } else {
      newVNode._dom = diffElementNodes(oldVNode._dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating);
    }

    if((tmp = options.diffed)) tmp(newVNode);
  } catch(e) {
    newVNode._original = null;
    options._catchError(e, newVNode, oldVNode);
  }

  return newVNode._dom;
}

/**
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {import('../internal').VNode} root
 */
function commitRoot(commitQueue, root) {
  if(options._commit) options._commit(root, commitQueue);

  commitQueue.some(c => {
    try {
      commitQueue = c._renderCallbacks;
      c._renderCallbacks = [];
      commitQueue.some(cb => {
        cb.call(c);
      });
    } catch(e) {
      options._catchError(e, c._vnode);
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
  let i;
  let oldProps = oldVNode.props;
  let newProps = newVNode.props;

  // Tracks entering and exiting SVG namespace when descending through the tree.
  isSvg = newVNode.type === 'svg' || isSvg;

  if(excessDomChildren != null) {
    for(i = 0; i < excessDomChildren.length; i++) {
      const child = excessDomChildren[i];

      // if newVNode matches an element in excessDomChildren or the `dom`
      // argument matches an element in excessDomChildren, remove it from
      // excessDomChildren so it isn't later removed in diffChildren
      if(child != null && ((newVNode.type === null ? child.nodeType === 3 : child.localName === newVNode.type) || dom == child)) {
        dom = child;
        excessDomChildren[i] = null;
        break;
      }
    }
  }

  if(dom == null) {
    if(newVNode.type === null) {
      return document.createTextNode(newProps);
    }

    dom = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', newVNode.type) : document.createElement(newVNode.type, newProps.is && { is: newProps.is });
    // we created a new parent, so none of the previously attached children can be reused:
    excessDomChildren = null;
    // we are creating a new node, so we can assume this is a new subtree (in case we are hydrating), this deopts the hydrate
    isHydrating = false;
  }

  if(newVNode.type === null) {
    if(oldProps !== newProps && dom.data != newProps) {
      dom.data = newProps;
    }
  } else {
    if(excessDomChildren != null) {
      excessDomChildren = EMPTY_ARR.slice.call(dom.childNodes);
    }

    oldProps = oldVNode.props || EMPTY_OBJ;

    let oldHtml = oldProps.dangerouslySetInnerHTML;
    let newHtml = newProps.dangerouslySetInnerHTML;

    // During hydration, props are not diffed at all (including dangerouslySetInnerHTML)
    // @TODO we should warn in debug mode when props don't match here.
    if(!isHydrating) {
      // But, if we are in a situation where we are using existing DOM (e.g. replaceNode)
      // we should read the existing DOM attributes to diff them
      if(excessDomChildren != null) {
        oldProps = {};
        for(let i = 0; i < dom.attributes.length; i++) {
          oldProps[dom.attributes[i].name] = dom.attributes[i].value;
        }
      }

      if(newHtml || oldHtml) {
        // Avoid re-applying the same '__html' if it did not changed between re-render
        if(!newHtml || !oldHtml || newHtml.__html != oldHtml.__html) {
          dom.innerHTML = (newHtml && newHtml.__html) || '';
        }
      }
    }

    diffProps(dom, newProps, oldProps, isSvg, isHydrating);

    // If the new vnode didn't have dangerouslySetInnerHTML, diff its children
    if(newHtml) {
      newVNode._children = [];
    } else {
      i = newVNode.props.children;
      diffChildren(dom, Array.isArray(i) ? i : [i], newVNode, oldVNode, globalContext, newVNode.type === 'foreignObject' ? false : isSvg, excessDomChildren, commitQueue, EMPTY_OBJ, isHydrating);
    }

    // (as above, don't diff props during hydration)
    if(!isHydrating) {
      if('value' in newProps && (i = newProps.value) !== undefined && i !== dom.value) {
        setProperty(dom, 'value', i, oldProps.value, false);
      }
      if('checked' in newProps && (i = newProps.checked) !== undefined && i !== dom.checked) {
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
    if(typeof ref == 'function') ref(value);
    else ref.current = value;
  } catch(e) {
    options._catchError(e, vnode);
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
  let r;
  if(options.unmount) options.unmount(vnode);

  if((r = vnode.ref)) {
    if(!r.current || r.current === vnode._dom) applyRef(r, null, parentVNode);
  }

  let dom;
  if(!skipRemove && typeof vnode.type != 'function') {
    skipRemove = (dom = vnode._dom) != null;
  }

  // Must be set to `undefined` to properly clean up `_nextDom`
  // for which `null` is a valid value. See comment in `create-element.js`
  vnode._dom = vnode._nextDom = undefined;

  if((r = vnode._component) != null) {
    if(r.componentWillUnmount) {
      try {
        r.componentWillUnmount();
      } catch(e) {
        options._catchError(e, parentVNode);
      }
    }

    r.base = r._parentDom = null;
  }

  if((r = vnode._children)) {
    for(let i = 0; i < r.length; i++) {
      if(r[i]) unmount(r[i], parentVNode, skipRemove);
    }
  }

  if(dom != null) removeNode(dom);
}

/** The `.render()` method for a PFC backing instance. */
function doRender(props, state, context) {
  return this.constructor(props, context);
}

const IS_HYDRATE = EMPTY_OBJ;

/**
 * Render a Preact virtual node into a DOM element
 * @param {import('./index').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to
 * render into
 * @param {Element | Text} [replaceNode] Optional: Attempt to re-use an
 * existing DOM tree rooted at `replaceNode`
 */
function render(vnode, parentDom, replaceNode) {
  if(options._root) options._root(vnode, parentDom);

  // We abuse the `replaceNode` parameter in `hydrate()` to signal if we
  // are in hydration mode or not by passing `IS_HYDRATE` instead of a
  // DOM element.
  let isHydrating = replaceNode === IS_HYDRATE;

  // To be able to support calling `render()` multiple times on the same
  // DOM node, we need to obtain a reference to the previous tree. We do
  // this by assigning a new `_children` property to DOM nodes which points
  // to the last rendered tree. By default this property is not present, which
  // means that we are mounting a new tree for the first time.
  let oldVNode = isHydrating ? null : (replaceNode && replaceNode._children) || parentDom._children;
  vnode = createElement(Fragment, null, [vnode]);

  // List of effects that need to be called after diffing.
  let commitQueue = [];
  diff(
    parentDom,
    // Determine the new vnode tree and store it on the DOM element on
    // our custom `_children` property.
    ((isHydrating ? parentDom : replaceNode || parentDom)._children = vnode),
    oldVNode || EMPTY_OBJ,
    EMPTY_OBJ,
    parentDom.ownerSVGElement !== undefined,
    replaceNode && !isHydrating ? [replaceNode] : oldVNode ? null : parentDom.childNodes.length ? EMPTY_ARR.slice.call(parentDom.childNodes) : null,
    commitQueue,
    replaceNode || EMPTY_OBJ,
    isHydrating
  );

  // Flush all queued effects
  commitRoot(commitQueue, vnode);
}

let i = 0;

function createContext(defaultValue) {
  const ctx = {};

  const context = {
    _id: '__cC' + i++,
    _defaultValue: defaultValue,
    Consumer(props, context) {
      return props.children(context);
    },
    Provider(props) {
      if(!this.getChildContext) {
        const subs = [];
        this.getChildContext = () => {
          ctx[context._id] = this;
          return ctx;
        };

        this.shouldComponentUpdate = _props => {
          if(this.props.value !== _props.value) {
            subs.some(c => {
              c.context = _props.value;
              enqueueRender(c);
            });
          }
        };

        this.sub = c => {
          subs.push(c);
          let old = c.componentWillUnmount;
          c.componentWillUnmount = () => {
            subs.splice(subs.indexOf(c), 1);
            old && old.call(c);
          };
        };
      }

      return props.children;
    }
  };

  context.Consumer.contextType = context;

  // Devtools needs access to the context object when it
  // encounters a Provider. This is necessary to support
  // setting `displayName` on the context object instead
  // of on the component itself. See:
  // https://reactjs.org/docs/context.html#contextdisplayname
  context.Provider._contextRef = context;

  return context;
}

const EMPTY_OBJ$1 = {};
const EMPTY_ARR$1 = [];
const IS_NON_DIMENSIONAL$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */
function assign$1(obj, props) {
  for(let i in props) obj[i] = props[i];
  return /** @type {O & P} */ (obj);
}

/**
 * Remove a child node from its parent if attached. This is a workaround for
 * IE11 which doesn't support `Element.prototype.remove()`. Using this function
 * is smaller than including a dedicated polyfill.
 * @param {Node} node The node to remove
 */
function removeNode$1(node) {
  let parentNode = node.parentNode;
  if(parentNode) parentNode.removeChild(node);
}

/**
 * Find the closest error boundary to a thrown error and call it
 * @param {object} error The thrown value
 * @param {import('../internal').VNode} vnode The vnode that threw
 * the error that was caught (except for unmounting when this parameter
 * is the highest parent that was being unmounted)
 */
function _catchError$1(error, vnode) {
  /** @type {import('../internal').Component} */
  let component, hasCaught;

  for(; (vnode = vnode._parent); ) {
    if((component = vnode._component) && !component._processingException) {
      try {
        if(component.constructor && component.constructor.getDerivedStateFromError != null) {
          hasCaught = true;
          component.setState(component.constructor.getDerivedStateFromError(error));
        }

        if(component.componentDidCatch != null) {
          hasCaught = true;
          component.componentDidCatch(error);
        }

        if(hasCaught) return enqueueRender$1((component._pendingError = component));
      } catch(e) {
        error = e;
      }
    }
  }

  throw error;
}

/**
 * The `option` object can potentially contain callback functions
 * that are called during various stages of our renderer. This is the
 * foundation on which all our addons like `preact/debug`, `preact/compat`,
 * and `preact/hooks` are based on. See the `Options` type in `internal.d.ts`
 * for a full list of available option hooks (most editors/IDEs allow you to
 * ctrl+click or cmd+click on mac the type definition below).
 * @type {import('./internal').Options}
 */
const options$1 = {
  _catchError: _catchError$1
};

/**
 * Create a VNode (used internally by Preact)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * Constructor for this virtual node
 * @param {object | string | number | null} props The properties of this virtual node.
 * If this virtual node represents a text node, this is the text of the node (string or number).
 * @param {string | number | null} key The key for this virtual node, used when
 * diffing it against its children
 * @param {import('./internal').VNode["ref"]} ref The ref property that will
 * receive a reference to its created child
 * @returns {import('./internal').VNode}
 */
function createVNode$1(type, props, key, ref, original) {
  // V8 seems to be better at detecting type shapes if the object is allocated from the same call site
  // Do not inline into createElement and coerceToVNode!
  const vnode = {
    type,
    props,
    key,
    ref,
    _children: null,
    _parent: null,
    _depth: 0,
    _dom: null,
    // _nextDom must be initialized to undefined b/c it will eventually
    // be set to dom.nextSibling which can return `null` and it is important
    // to be able to distinguish between an uninitialized _nextDom and
    // a _nextDom that has been set to `null`
    _nextDom: undefined,
    _component: null,
    constructor: undefined,
    _original: original
  };

  if(original == null) vnode._original = vnode;
  if(options$1.vnode) options$1.vnode(vnode);

  return vnode;
}

function Fragment$1(props) {
  return props.children;
}

/**
 * Base Component class. Provides `setState()` and `forceUpdate()`, which
 * trigger rendering
 * @param {object} props The initial component props
 * @param {object} context The initial context from parent components'
 * getChildContext
 */
function Component$1(props, context) {
  this.props = props;
  this.context = context;
}

/**
 * Update component state and schedule a re-render.
 * @param {object | ((s: object, p: object) => object)} update A hash of state
 * properties to update with new values or a function that given the current
 * state and props returns a new partial state
 * @param {() => void} [callback] A function to be called once component state is
 * updated
 */
Component$1.prototype.setState = function(update, callback) {
  // only clone state when copying to nextState the first time.
  let s;
  if(this._nextState !== this.state) {
    s = this._nextState;
  } else {
    s = this._nextState = assign$1({}, this.state);
  }

  if(typeof update == 'function') {
    update = update(s, this.props);
  }

  if(update) {
    assign$1(s, update);
  }

  // Skip update if updater function returned null
  if(update == null) return;

  if(this._vnode) {
    if(callback) this._renderCallbacks.push(callback);
    enqueueRender$1(this);
  }
};

/**
 * Immediately perform a synchronous re-render of the component
 * @param {() => void} [callback] A function to be called after component is
 * re-rendered
 */
Component$1.prototype.forceUpdate = function(callback) {
  if(this._vnode) {
    // Set render mode so that we can differentiate where the render request
    // is coming from. We need this because forceUpdate should never call
    // shouldComponentUpdate
    this._force = true;
    if(callback) this._renderCallbacks.push(callback);
    enqueueRender$1(this);
  }
};

/**
 * Accepts `props` and `state`, and returns a new Virtual DOM tree to build.
 * Virtual DOM is generally constructed via [JSX](http://jasonformat.com/wtf-is-jsx).
 * @param {object} props Props (eg: JSX attributes) received from parent
 * element/component
 * @param {object} state The component's current state
 * @param {object} context Context object, as returned by the nearest
 * ancestor's `getChildContext()`
 * @returns {import('./index').ComponentChildren | void}
 */
Component$1.prototype.render = Fragment$1;

/**
 * @param {import('./internal').VNode} vnode
 * @param {number | null} [childIndex]
 */
function getDomSibling$1(vnode, childIndex) {
  if(childIndex == null) {
    // Use childIndex==null as a signal to resume the search from the vnode's sibling
    return vnode._parent ? getDomSibling$1(vnode._parent, vnode._parent._children.indexOf(vnode) + 1) : null;
  }

  let sibling;
  for(; childIndex < vnode._children.length; childIndex++) {
    sibling = vnode._children[childIndex];

    if(sibling != null && sibling._dom != null) {
      // Since updateParentDomPointers keeps _dom pointer correct,
      // we can rely on _dom to tell us if this subtree contains a
      // rendered DOM node, and what the first rendered DOM node is
      return sibling._dom;
    }
  }

  // If we get here, we have not found a DOM node in this vnode's children.
  // We must resume from this vnode's sibling (in it's parent _children array)
  // Only climb up and search the parent if we aren't searching through a DOM
  // VNode (meaning we reached the DOM parent of the original vnode that began
  // the search)
  return typeof vnode.type == 'function' ? getDomSibling$1(vnode) : null;
}

/**
 * Trigger in-place re-rendering of a component.
 * @param {import('./internal').Component} component The component to rerender
 */
function renderComponent$1(component) {
  let vnode = component._vnode,
    oldDom = vnode._dom,
    parentDom = component._parentDom;

  if(parentDom) {
    let commitQueue = [];
    const oldVNode = assign$1({}, vnode);
    oldVNode._original = oldVNode;

    let newDom = diff$1(parentDom, vnode, oldVNode, component._globalContext, parentDom.ownerSVGElement !== undefined, null, commitQueue, oldDom == null ? getDomSibling$1(vnode) : oldDom);
    commitRoot$1(commitQueue, vnode);

    if(newDom != oldDom) {
      updateParentDomPointers$1(vnode);
    }
  }
}

/**
 * @param {import('./internal').VNode} vnode
 */
function updateParentDomPointers$1(vnode) {
  if((vnode = vnode._parent) != null && vnode._component != null) {
    vnode._dom = vnode._component.base = null;
    for(let i = 0; i < vnode._children.length; i++) {
      let child = vnode._children[i];
      if(child != null && child._dom != null) {
        vnode._dom = vnode._component.base = child._dom;
        break;
      }
    }

    return updateParentDomPointers$1(vnode);
  }
}

/**
 * The render queue
 * @type {Array<import('./internal').Component>}
 */
let rerenderQueue$1 = [];

/**
 * Asynchronously schedule a callback
 * @type {(cb: () => void) => void}
 */
/* istanbul ignore next */
// Note the following line isn't tree-shaken by rollup cuz of rollup/rollup#2566
const defer$1 = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;

/*
 * The value of `Component.debounce` must asynchronously invoke the passed in callback. It is
 * important that contributors to Preact can consistently reason about what calls to `setState`, etc.
 * do, and when their effects will be applied. See the links below for some further reading on designing
 * asynchronous APIs.
 * * [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony)
 * * [Callbacks synchronous and asynchronous](https://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/)
 */

let prevDebounce$1;

/**
 * Enqueue a rerender of a component
 * @param {import('./internal').Component} c The component to rerender
 */
function enqueueRender$1(c) {
  if((!c._dirty && (c._dirty = true) && rerenderQueue$1.push(c) && !process$1._rerenderCount++) || prevDebounce$1 !== options$1.debounceRendering) {
    prevDebounce$1 = options$1.debounceRendering;
    (prevDebounce$1 || defer$1)(process$1);
  }
}

/** Flush the render queue by rerendering all queued components */
function process$1() {
  let queue;
  while((process$1._rerenderCount = rerenderQueue$1.length)) {
    queue = rerenderQueue$1.sort((a, b) => a._vnode._depth - b._vnode._depth);
    rerenderQueue$1 = [];
    // Don't update `renderCount` yet. Keep its value non-zero to prevent unnecessary
    // process() calls from getting scheduled while `queue` is still being consumed.
    queue.some(c => {
      if(c._dirty) renderComponent$1(c);
    });
  }
}
process$1._rerenderCount = 0;

/**
 * Diff the children of a virtual node
 * @param {import('../internal').PreactElement} parentDom The DOM element whose
 * children are being diffed
 * @param {import('../index').ComponentChildren[]} renderResult
 * @param {import('../internal').VNode} newParentVNode The new virtual
 * node whose children should be diff'ed against oldParentVNode
 * @param {import('../internal').VNode} oldParentVNode The old virtual
 * node whose children should be diff'ed against newParentVNode
 * @param {object} globalContext The current context object - modified by getChildContext
 * @param {boolean} isSvg Whether or not this DOM node is an SVG node
 * @param {Array<import('../internal').PreactElement>} excessDomChildren
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {Node | Text} oldDom The current attached DOM
 * element any new dom elements should be placed around. Likely `null` on first
 * render (except when hydrating). Can be a sibling DOM element when diffing
 * Fragments that have siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} isHydrating Whether or not we are in hydration
 */
function diffChildren$1(parentDom, renderResult, newParentVNode, oldParentVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  let i, j, oldVNode, childVNode, newDom, firstChildDom, refs;

  // This is a compression of oldParentVNode!=null && oldParentVNode != EMPTY_OBJ && oldParentVNode._children || EMPTY_ARR
  // as EMPTY_OBJ._children should be `undefined`.
  let oldChildren = (oldParentVNode && oldParentVNode._children) || EMPTY_ARR$1;

  let oldChildrenLength = oldChildren.length;

  // Only in very specific places should this logic be invoked (top level `render` and `diffElementNodes`).
  // I'm using `EMPTY_OBJ` to signal when `diffChildren` is invoked in these situations. I can't use `null`
  // for this purpose, because `null` is a valid value for `oldDom` which can mean to skip to this logic
  // (e.g. if mounting a new tree in which the old DOM should be ignored (usually for Fragments).
  if(oldDom == EMPTY_OBJ$1) {
    if(excessDomChildren != null) {
      oldDom = excessDomChildren[0];
    } else if(oldChildrenLength) {
      oldDom = getDomSibling$1(oldParentVNode, 0);
    } else {
      oldDom = null;
    }
  }

  newParentVNode._children = [];
  for(i = 0; i < renderResult.length; i++) {
    childVNode = renderResult[i];

    if(childVNode == null || typeof childVNode == 'boolean') {
      childVNode = newParentVNode._children[i] = null;
    }
    // If this newVNode is being reused (e.g. <div>{reuse}{reuse}</div>) in the same diff,
    // or we are rendering a component (e.g. setState) copy the oldVNodes so it can have
    // it's own DOM & etc. pointers
    else if(typeof childVNode == 'string' || typeof childVNode == 'number') {
      childVNode = newParentVNode._children[i] = createVNode$1(null, childVNode, null, null, childVNode);
    } else if(Array.isArray(childVNode)) {
      childVNode = newParentVNode._children[i] = createVNode$1(Fragment$1, { children: childVNode }, null, null, null);
    } else if(childVNode._dom != null || childVNode._component != null) {
      childVNode = newParentVNode._children[i] = createVNode$1(childVNode.type, childVNode.props, childVNode.key, null, childVNode._original);
    } else {
      childVNode = newParentVNode._children[i] = childVNode;
    }

    // Terser removes the `continue` here and wraps the loop body
    // in a `if (childVNode) { ... } condition
    if(childVNode == null) {
      continue;
    }

    childVNode._parent = newParentVNode;
    childVNode._depth = newParentVNode._depth + 1;

    // Check if we find a corresponding element in oldChildren.
    // If found, delete the array item by setting to `undefined`.
    // We use `undefined`, as `null` is reserved for empty placeholders
    // (holes).
    oldVNode = oldChildren[i];

    if(oldVNode === null || (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type)) {
      oldChildren[i] = undefined;
    } else {
      // Either oldVNode === undefined or oldChildrenLength > 0,
      // so after this loop oldVNode == null or oldVNode is a valid value.
      for(j = 0; j < oldChildrenLength; j++) {
        oldVNode = oldChildren[j];
        // If childVNode is unkeyed, we only match similarly unkeyed nodes, otherwise we match by key.
        // We always match by type (in either case).
        if(oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
          oldChildren[j] = undefined;
          break;
        }
        oldVNode = null;
      }
    }

    oldVNode = oldVNode || EMPTY_OBJ$1;

    // Morph the old element into the new one, but don't append it to the dom yet
    newDom = diff$1(parentDom, childVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);

    if((j = childVNode.ref) && oldVNode.ref != j) {
      if(!refs) refs = [];
      if(oldVNode.ref) refs.push(oldVNode.ref, null, childVNode);
      refs.push(j, childVNode._component || newDom, childVNode);
    }

    if(newDom != null) {
      if(firstChildDom == null) {
        firstChildDom = newDom;
      }

      oldDom = placeChild$1(parentDom, childVNode, oldVNode, oldChildren, excessDomChildren, newDom, oldDom);

      // Browsers will infer an option's `value` from `textContent` when
      // no value is present. This essentially bypasses our code to set it
      // later in `diff()`. It works fine in all browsers except for IE11
      // where it breaks setting `select.value`. There it will be always set
      // to an empty string. Re-applying an options value will fix that, so
      // there are probably some internal data structures that aren't
      // updated properly.
      //
      // To fix it we make sure to reset the inferred value, so that our own
      // value check in `diff()` won't be skipped.
      if(newParentVNode.type == 'option') {
        parentDom.value = '';
      } else if(typeof newParentVNode.type == 'function') {
        // Because the newParentVNode is Fragment-like, we need to set it's
        // _nextDom property to the nextSibling of its last child DOM node.
        //
        // `oldDom` contains the correct value here because if the last child
        // is a Fragment-like, then oldDom has already been set to that child's _nextDom.
        // If the last child is a DOM VNode, then oldDom will be set to that DOM
        // node's nextSibling.
        newParentVNode._nextDom = oldDom;
      }
    } else if(oldDom && oldVNode._dom == oldDom && oldDom.parentNode != parentDom) {
      // The above condition is to handle null placeholders. See test in placeholder.test.js:
      // `efficiently replace null placeholders in parent rerenders`
      oldDom = getDomSibling$1(oldVNode);
    }
  }

  newParentVNode._dom = firstChildDom;

  // Remove children that are not part of any vnode.
  if(excessDomChildren != null && typeof newParentVNode.type != 'function') {
    for(i = excessDomChildren.length; i--; ) {
      if(excessDomChildren[i] != null) removeNode$1(excessDomChildren[i]);
    }
  }

  // Remove remaining oldChildren if there are any.
  for(i = oldChildrenLength; i--; ) {
    if(oldChildren[i] != null) unmount$1(oldChildren[i], oldChildren[i]);
  }

  // Set refs only after unmount
  if(refs) {
    for(i = 0; i < refs.length; i++) {
      applyRef$1(refs[i], refs[++i], refs[++i]);
    }
  }
}

function placeChild$1(parentDom, childVNode, oldVNode, oldChildren, excessDomChildren, newDom, oldDom) {
  let nextDom;
  if(childVNode._nextDom !== undefined) {
    // Only Fragments or components that return Fragment like VNodes will
    // have a non-undefined _nextDom. Continue the diff from the sibling
    // of last DOM child of this child VNode
    nextDom = childVNode._nextDom;

    // Eagerly cleanup _nextDom. We don't need to persist the value because
    // it is only used by `diffChildren` to determine where to resume the diff after
    // diffing Components and Fragments. Once we store it the nextDOM local var, we
    // can clean up the property
    childVNode._nextDom = undefined;
  } else if(excessDomChildren == oldVNode || newDom != oldDom || newDom.parentNode == null) {
    // NOTE: excessDomChildren==oldVNode above:
    // This is a compression of excessDomChildren==null && oldVNode==null!
    // The values only have the same type when `null`.

    outer: if(oldDom == null || oldDom.parentNode !== parentDom) {
      parentDom.appendChild(newDom);
      nextDom = null;
    } else {
      // `j<oldChildrenLength; j+=2` is an alternative to `j++<oldChildrenLength/2`
      for(let sibDom = oldDom, j = 0; (sibDom = sibDom.nextSibling) && j < oldChildren.length; j += 2) {
        if(sibDom == newDom) {
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
  if(nextDom !== undefined) {
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
function diffProps$1(dom, newProps, oldProps, isSvg, hydrate) {
  let i;

  for(i in oldProps) {
    if(i !== 'children' && i !== 'key' && !(i in newProps)) {
      setProperty$1(dom, i, null, oldProps[i], isSvg);
    }
  }

  for(i in newProps) {
    if((!hydrate || typeof newProps[i] == 'function') && i !== 'children' && i !== 'key' && i !== 'value' && i !== 'checked' && oldProps[i] !== newProps[i]) {
      setProperty$1(dom, i, newProps[i], oldProps[i], isSvg);
    }
  }
}

function setStyle$1(style, key, value) {
  if(key[0] === '-') {
    style.setProperty(key, value);
  } else if(typeof value == 'number' && IS_NON_DIMENSIONAL$1.test(key) === false) {
    style[key] = value + 'px';
  } else if(value == null) {
    style[key] = '';
  } else {
    style[key] = value;
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
function setProperty$1(dom, name, value, oldValue, isSvg) {
  let s, useCapture, nameLower;

  if(isSvg) {
    if(name === 'className') {
      name = 'class';
    }
  } else if(name === 'class') {
    name = 'className';
  }

  if(name === 'style') {
    s = dom.style;

    if(typeof value == 'string') {
      s.cssText = value;
    } else {
      if(typeof oldValue == 'string') {
        s.cssText = '';
        oldValue = null;
      }

      if(oldValue) {
        for(let i in oldValue) {
          if(!(value && i in value)) {
            setStyle$1(s, i, '');
          }
        }
      }

      if(value) {
        for(let i in value) {
          if(!oldValue || value[i] !== oldValue[i]) {
            setStyle$1(s, i, value[i]);
          }
        }
      }
    }
  }
  // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
  else if(name[0] === 'o' && name[1] === 'n') {
    useCapture = name !== (name = name.replace(/Capture$/, ''));
    nameLower = name.toLowerCase();
    name = (nameLower in dom ? nameLower : name).slice(2);

    if(value) {
      if(!oldValue) dom.addEventListener(name, eventProxy$1, useCapture);
      (dom._listeners || (dom._listeners = {}))[name] = value;
    } else {
      dom.removeEventListener(name, eventProxy$1, useCapture);
    }
  } else if(
    name !== 'list' &&
    name !== 'tagName' &&
    // HTMLButtonElement.form and HTMLInputElement.form are read-only but can be set using
    // setAttribute
    name !== 'form' &&
    name !== 'type' &&
    name !== 'size' &&
    !isSvg &&
    name in dom
  ) {
    dom[name] = value == null ? '' : value;
  } else if(typeof value != 'function' && name !== 'dangerouslySetInnerHTML') {
    if(name !== (name = name.replace(/^xlink:?/, ''))) {
      if(value == null || value === false) {
        dom.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());
      } else {
        dom.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);
      }
    } else if(
      value == null ||
      (value === false &&
        // ARIA-attributes have a different notion of boolean values.
        // The value `false` is different from the attribute not
        // existing on the DOM, so we can't remove it. For non-boolean
        // ARIA-attributes we could treat false as a removal, but the
        // amount of exceptions would cost us too many bytes. On top of
        // that other VDOM frameworks also always stringify `false`.
        !/^ar/.test(name))
    ) {
      dom.removeAttribute(name);
    } else {
      dom.setAttribute(name, value);
    }
  }
}

/**
 * Proxy an event to hooked event handlers
 * @param {Event} e The event object from the browser
 * @private
 */
function eventProxy$1(e) {
  this._listeners[e.type](options$1.event ? options$1.event(e) : e);
}

function reorderChildren$1(newVNode, oldDom, parentDom) {
  for(let tmp = 0; tmp < newVNode._children.length; tmp++) {
    const vnode = newVNode._children[tmp];
    if(vnode) {
      vnode._parent = newVNode;

      if(vnode._dom) {
        if(typeof vnode.type == 'function' && vnode._children.length > 1) {
          reorderChildren$1(vnode, oldDom, parentDom);
        }

        oldDom = placeChild$1(parentDom, vnode, vnode, newVNode._children, null, vnode._dom, oldDom);

        if(typeof newVNode.type == 'function') {
          newVNode._nextDom = oldDom;
        }
      }
    }
  }
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
 * @param {Element | Text} oldDom The current attached DOM
 * element any new dom elements should be placed around. Likely `null` on first
 * render (except when hydrating). Can be a sibling DOM element when diffing
 * Fragments that have siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} [isHydrating] Whether or not we are in hydration
 */
function diff$1(parentDom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating) {
  let tmp,
    newType = newVNode.type;

  // When passing through createElement it assigns the object
  // constructor as undefined. This to prevent JSON-injection.
  if(newVNode.constructor !== undefined) return null;

  if((tmp = options$1._diff)) tmp(newVNode);

  try {
    outer: if(typeof newType == 'function') {
      let c, isNew, oldProps, oldState, snapshot, clearProcessingException;
      let newProps = newVNode.props;

      // Necessary for createContext api. Setting this property will pass
      // the context value as `this.context` just for this component.
      tmp = newType.contextType;
      let provider = tmp && globalContext[tmp._id];
      let componentContext = tmp ? (provider ? provider.props.value : tmp._defaultValue) : globalContext;

      // Get component and set it to `c`
      if(oldVNode._component) {
        c = newVNode._component = oldVNode._component;
        clearProcessingException = c._processingException = c._pendingError;
      } else {
        // Instantiate the new component
        if('prototype' in newType && newType.prototype.render) {
          newVNode._component = c = new newType(newProps, componentContext); // eslint-disable-line new-cap
        } else {
          newVNode._component = c = new Component$1(newProps, componentContext);
          c.constructor = newType;
          c.render = doRender$1;
        }
        if(provider) provider.sub(c);

        c.props = newProps;
        if(!c.state) c.state = {};
        c.context = componentContext;
        c._globalContext = globalContext;
        isNew = c._dirty = true;
        c._renderCallbacks = [];
      }

      // Invoke getDerivedStateFromProps
      if(c._nextState == null) {
        c._nextState = c.state;
      }
      if(newType.getDerivedStateFromProps != null) {
        if(c._nextState == c.state) {
          c._nextState = assign$1({}, c._nextState);
        }

        assign$1(c._nextState, newType.getDerivedStateFromProps(newProps, c._nextState));
      }

      oldProps = c.props;
      oldState = c.state;

      // Invoke pre-render lifecycle methods
      if(isNew) {
        if(newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
          c.componentWillMount();
        }

        if(c.componentDidMount != null) {
          c._renderCallbacks.push(c.componentDidMount);
        }
      } else {
        if(newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
          c.componentWillReceiveProps(newProps, componentContext);
        }

        if((!c._force && c.shouldComponentUpdate != null && c.shouldComponentUpdate(newProps, c._nextState, componentContext) === false) || newVNode._original === oldVNode._original) {
          c.props = newProps;
          c.state = c._nextState;
          // More info about this here: https://gist.github.com/JoviDeCroock/bec5f2ce93544d2e6070ef8e0036e4e8
          if(newVNode._original !== oldVNode._original) c._dirty = false;
          c._vnode = newVNode;
          newVNode._dom = oldVNode._dom;
          newVNode._children = oldVNode._children;
          if(c._renderCallbacks.length) {
            commitQueue.push(c);
          }

          reorderChildren$1(newVNode, oldDom, parentDom);
          break outer;
        }

        if(c.componentWillUpdate != null) {
          c.componentWillUpdate(newProps, c._nextState, componentContext);
        }

        if(c.componentDidUpdate != null) {
          c._renderCallbacks.push(() => {
            c.componentDidUpdate(oldProps, oldState, snapshot);
          });
        }
      }

      c.context = componentContext;
      c.props = newProps;
      c.state = c._nextState;

      if((tmp = options$1._render)) tmp(newVNode);

      c._dirty = false;
      c._vnode = newVNode;
      c._parentDom = parentDom;

      tmp = c.render(c.props, c.state, c.context);

      // Handle setState called in render, see #2553
      c.state = c._nextState;

      if(c.getChildContext != null) {
        globalContext = assign$1(assign$1({}, globalContext), c.getChildContext());
      }

      if(!isNew && c.getSnapshotBeforeUpdate != null) {
        snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
      }

      let isTopLevelFragment = tmp != null && tmp.type == Fragment$1 && tmp.key == null;
      let renderResult = isTopLevelFragment ? tmp.props.children : tmp;

      diffChildren$1(parentDom, Array.isArray(renderResult) ? renderResult : [renderResult], newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);

      c.base = newVNode._dom;

      if(c._renderCallbacks.length) {
        commitQueue.push(c);
      }

      if(clearProcessingException) {
        c._pendingError = c._processingException = null;
      }

      c._force = false;
    } else if(excessDomChildren == null && newVNode._original === oldVNode._original) {
      newVNode._children = oldVNode._children;
      newVNode._dom = oldVNode._dom;
    } else {
      newVNode._dom = diffElementNodes$1(oldVNode._dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating);
    }

    if((tmp = options$1.diffed)) tmp(newVNode);
  } catch(e) {
    newVNode._original = null;
    options$1._catchError(e, newVNode, oldVNode);
  }

  return newVNode._dom;
}

/**
 * @param {Array<import('../internal').Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {import('../internal').VNode} root
 */
function commitRoot$1(commitQueue, root) {
  if(options$1._commit) options$1._commit(root, commitQueue);

  commitQueue.some(c => {
    try {
      commitQueue = c._renderCallbacks;
      c._renderCallbacks = [];
      commitQueue.some(cb => {
        cb.call(c);
      });
    } catch(e) {
      options$1._catchError(e, c._vnode);
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
function diffElementNodes$1(dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating) {
  let i;
  let oldProps = oldVNode.props;
  let newProps = newVNode.props;

  // Tracks entering and exiting SVG namespace when descending through the tree.
  isSvg = newVNode.type === 'svg' || isSvg;

  if(excessDomChildren != null) {
    for(i = 0; i < excessDomChildren.length; i++) {
      const child = excessDomChildren[i];

      // if newVNode matches an element in excessDomChildren or the `dom`
      // argument matches an element in excessDomChildren, remove it from
      // excessDomChildren so it isn't later removed in diffChildren
      if(child != null && ((newVNode.type === null ? child.nodeType === 3 : child.localName === newVNode.type) || dom == child)) {
        dom = child;
        excessDomChildren[i] = null;
        break;
      }
    }
  }

  if(dom == null) {
    if(newVNode.type === null) {
      return document.createTextNode(newProps);
    }

    dom = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', newVNode.type) : document.createElement(newVNode.type, newProps.is && { is: newProps.is });
    // we created a new parent, so none of the previously attached children can be reused:
    excessDomChildren = null;
    // we are creating a new node, so we can assume this is a new subtree (in case we are hydrating), this deopts the hydrate
    isHydrating = false;
  }

  if(newVNode.type === null) {
    if(oldProps !== newProps && dom.data != newProps) {
      dom.data = newProps;
    }
  } else {
    if(excessDomChildren != null) {
      excessDomChildren = EMPTY_ARR$1.slice.call(dom.childNodes);
    }

    oldProps = oldVNode.props || EMPTY_OBJ$1;

    let oldHtml = oldProps.dangerouslySetInnerHTML;
    let newHtml = newProps.dangerouslySetInnerHTML;

    // During hydration, props are not diffed at all (including dangerouslySetInnerHTML)
    // @TODO we should warn in debug mode when props don't match here.
    if(!isHydrating) {
      // But, if we are in a situation where we are using existing DOM (e.g. replaceNode)
      // we should read the existing DOM attributes to diff them
      if(excessDomChildren != null) {
        oldProps = {};
        for(let i = 0; i < dom.attributes.length; i++) {
          oldProps[dom.attributes[i].name] = dom.attributes[i].value;
        }
      }

      if(newHtml || oldHtml) {
        // Avoid re-applying the same '__html' if it did not changed between re-render
        if(!newHtml || !oldHtml || newHtml.__html != oldHtml.__html) {
          dom.innerHTML = (newHtml && newHtml.__html) || '';
        }
      }
    }

    diffProps$1(dom, newProps, oldProps, isSvg, isHydrating);

    // If the new vnode didn't have dangerouslySetInnerHTML, diff its children
    if(newHtml) {
      newVNode._children = [];
    } else {
      i = newVNode.props.children;
      diffChildren$1(dom, Array.isArray(i) ? i : [i], newVNode, oldVNode, globalContext, newVNode.type === 'foreignObject' ? false : isSvg, excessDomChildren, commitQueue, EMPTY_OBJ$1, isHydrating);
    }

    // (as above, don't diff props during hydration)
    if(!isHydrating) {
      if('value' in newProps && (i = newProps.value) !== undefined && i !== dom.value) {
        setProperty$1(dom, 'value', i, oldProps.value, false);
      }
      if('checked' in newProps && (i = newProps.checked) !== undefined && i !== dom.checked) {
        setProperty$1(dom, 'checked', i, oldProps.checked, false);
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
function applyRef$1(ref, value, vnode) {
  try {
    if(typeof ref == 'function') ref(value);
    else ref.current = value;
  } catch(e) {
    options$1._catchError(e, vnode);
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
function unmount$1(vnode, parentVNode, skipRemove) {
  let r;
  if(options$1.unmount) options$1.unmount(vnode);

  if((r = vnode.ref)) {
    if(!r.current || r.current === vnode._dom) applyRef$1(r, null, parentVNode);
  }

  let dom;
  if(!skipRemove && typeof vnode.type != 'function') {
    skipRemove = (dom = vnode._dom) != null;
  }

  // Must be set to `undefined` to properly clean up `_nextDom`
  // for which `null` is a valid value. See comment in `create-element.js`
  vnode._dom = vnode._nextDom = undefined;

  if((r = vnode._component) != null) {
    if(r.componentWillUnmount) {
      try {
        r.componentWillUnmount();
      } catch(e) {
        options$1._catchError(e, parentVNode);
      }
    }

    r.base = r._parentDom = null;
  }

  if((r = vnode._children)) {
    for(let i = 0; i < r.length; i++) {
      if(r[i]) unmount$1(r[i], parentVNode, skipRemove);
    }
  }

  if(dom != null) removeNode$1(dom);
}

/** The `.render()` method for a PFC backing instance. */
function doRender$1(props, state, context) {
  return this.constructor(props, context);
}

/** @type {number} */
let currentIndex;

/** @type {import('./internal').Component} */
let currentComponent;

/** @type {number} */
let currentHook = 0;

/** @type {Array<import('./internal').Component>} */
let afterPaintEffects = [];

let oldBeforeRender = options$1._render;
let oldAfterDiff = options$1.diffed;
let oldCommit = options$1._commit;
let oldBeforeUnmount = options$1.unmount;

const RAF_TIMEOUT = 100;
let prevRaf;

options$1._render = vnode => {
  if(oldBeforeRender) oldBeforeRender(vnode);

  currentComponent = vnode._component;
  currentIndex = 0;

  const hooks = currentComponent.__hooks;
  if(hooks) {
    hooks._pendingEffects.forEach(invokeCleanup);
    hooks._pendingEffects.forEach(invokeEffect);
    hooks._pendingEffects = [];
  }
};

options$1.diffed = vnode => {
  if(oldAfterDiff) oldAfterDiff(vnode);

  const c = vnode._component;
  if(c && c.__hooks && c.__hooks._pendingEffects.length) {
    afterPaint(afterPaintEffects.push(c));
  }
};

options$1._commit = (vnode, commitQueue) => {
  commitQueue.some(component => {
    try {
      component._renderCallbacks.forEach(invokeCleanup);
      component._renderCallbacks = component._renderCallbacks.filter(cb => (cb._value ? invokeEffect(cb) : true));
    } catch(e) {
      commitQueue.some(c => {
        if(c._renderCallbacks) c._renderCallbacks = [];
      });
      commitQueue = [];
      options$1._catchError(e, component._vnode);
    }
  });

  if(oldCommit) oldCommit(vnode, commitQueue);
};

options$1.unmount = vnode => {
  if(oldBeforeUnmount) oldBeforeUnmount(vnode);

  const c = vnode._component;
  if(c && c.__hooks) {
    try {
      c.__hooks._list.forEach(invokeCleanup);
    } catch(e) {
      options$1._catchError(e, c._vnode);
    }
  }
};

/**
 * Get a hook's state from the currentComponent
 * @param {number} index The index of the hook to get
 * @param {number} type The index of the hook to get
 * @returns {import('./internal').HookState}
 */
function getHookState(index, type) {
  if(options$1._hook) {
    options$1._hook(currentComponent, index, currentHook || type);
  }
  currentHook = 0;

  // Largely inspired by:
  // * https://github.com/michael-klein/funcy.js/blob/f6be73468e6ec46b0ff5aa3cc4c9baf72a29025a/src/hooks/core_hooks.mjs
  // * https://github.com/michael-klein/funcy.js/blob/650beaa58c43c33a74820a3c98b3c7079cf2e333/src/renderer.mjs
  // Other implementations to look at:
  // * https://codesandbox.io/s/mnox05qp8
  const hooks =
    currentComponent.__hooks ||
    (currentComponent.__hooks = {
      _list: [],
      _pendingEffects: []
    });

  if(index >= hooks._list.length) {
    hooks._list.push({});
  }
  return hooks._list[index];
}

/**
 * @param {import('./index').StateUpdater<any>} initialState
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
  const hookState = getHookState(currentIndex++, 2);
  hookState._reducer = reducer;
  if(!hookState._component) {
    hookState._component = currentComponent;

    hookState._value = [
      !init ? invokeOrReturn(undefined, initialState) : init(initialState),

      action => {
        const nextValue = hookState._reducer(hookState._value[0], action);
        if(hookState._value[0] !== nextValue) {
          hookState._value = [nextValue, hookState._value[1]];
          hookState._component.setState({});
        }
      }
    ];
  }

  return hookState._value;
}

/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */
function useEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  const state = getHookState(currentIndex++, 3);
  if(!options$1._skipEffects && argsChanged(state._args, args)) {
    state._value = callback;
    state._args = args;

    currentComponent.__hooks._pendingEffects.push(state);
  }
}

/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */
function useLayoutEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  const state = getHookState(currentIndex++, 4);
  if(!options$1._skipEffects && argsChanged(state._args, args)) {
    state._value = callback;
    state._args = args;

    currentComponent._renderCallbacks.push(state);
  }
}

function useRef(initialValue) {
  currentHook = 5;
  return useMemo(() => ({ current: initialValue }), []);
}

/**
 * @param {object} ref
 * @param {() => object} createHandle
 * @param {any[]} args
 */
function useImperativeHandle(ref, createHandle, args) {
  currentHook = 6;
  useLayoutEffect(
    () => {
      if(typeof ref == 'function') ref(createHandle());
      else if(ref) ref.current = createHandle();
    },
    args == null ? args : args.concat(ref)
  );
}

/**
 * @param {() => any} factory
 * @param {any[]} args
 */
function useMemo(factory, args) {
  /** @type {import('./internal').MemoHookState} */
  const state = getHookState(currentIndex++, 7);
  if(argsChanged(state._args, args)) {
    state._args = args;
    state._factory = factory;
    return (state._value = factory());
  }

  return state._value;
}

/**
 * @param {() => void} callback
 * @param {any[]} args
 */
function useCallback(callback, args) {
  currentHook = 8;
  return useMemo(() => callback, args);
}

/**
 * @param {import('./internal').PreactContext} context
 */
function useContext(context) {
  const provider = currentComponent.context[context._id];
  // We could skip this call here, but than we'd not call
  // `options._hook`. We need to do that in order to make
  // the devtools aware of this hook.
  const state = getHookState(currentIndex++, 9);
  // The devtools needs access to the context object to
  // be able to pull of the default value when no provider
  // is present in the tree.
  state._context = context;
  if(!provider) return context._defaultValue;
  // This is probably not safe to convert to "!"
  if(state._value == null) {
    state._value = true;
    provider.sub(currentComponent);
  }
  return provider.props.value;
}

/**
 * Display a custom label for a custom hook for the devtools panel
 * @type {<T>(value: T, cb?: (value: T) => string | number) => void}
 */
function useDebugValue(value, formatter) {
  if(options$1.useDebugValue) {
    options$1.useDebugValue(formatter ? formatter(value) : value);
  }
}

/**
 * After paint effects consumer.
 */
function flushAfterPaintEffects() {
  afterPaintEffects.some(component => {
    if(component._parentDom) {
      try {
        component.__hooks._pendingEffects.forEach(invokeCleanup);
        component.__hooks._pendingEffects.forEach(invokeEffect);
        component.__hooks._pendingEffects = [];
      } catch(e) {
        component.__hooks._pendingEffects = [];
        options$1._catchError(e, component._vnode);
        return true;
      }
    }
  });
  afterPaintEffects = [];
}

let HAS_RAF = typeof requestAnimationFrame == 'function';

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
  const done = () => {
    clearTimeout(timeout);
    if(HAS_RAF) cancelAnimationFrame(raf);
    setTimeout(callback);
  };
  const timeout = setTimeout(done, RAF_TIMEOUT);

  let raf;
  if(HAS_RAF) {
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
  if(newQueueLength === 1 || prevRaf !== options$1.requestAnimationFrame) {
    prevRaf = options$1.requestAnimationFrame;
    (prevRaf || afterNextFrame)(flushAfterPaintEffects);
  }
}

/**
 * @param {import('./internal').EffectHookState} hook
 */
function invokeCleanup(hook) {
  if(typeof hook._cleanup == 'function') hook._cleanup();
}

/**
 * Invoke a Hook's effect
 * @param {import('./internal').EffectHookState} hook
 */
function invokeEffect(hook) {
  hook._cleanup = hook._value();
}

/**
 * @param {any[]} oldArgs
 * @param {any[]} newArgs
 */
function argsChanged(oldArgs, newArgs) {
  return !oldArgs || newArgs.some((arg, index) => arg !== oldArgs[index]);
}

function invokeOrReturn(arg, f) {
  return typeof f == 'function' ? f(arg) : f;
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

  for(let i = 1; i < built.length; i++) {
    const type = built[i++];

    // Set `built[0]`'s appropriate bits if this element depends on a dynamic value.
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
      // type === CHILD_RECURSE
      // Set the operation list (including the staticness bits) as
      // `this` for the `h` call.
      tmp = h.apply(value, evaluate(h, value, fields, ['', null]));
      args.push(tmp);

      if(value[0]) {
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
          // commit buffer
          commit();
          {
            current = [current];
          }
          mode = MODE_TAGNAME;
        } else {
          buffer += char;
        }
      } else if(mode === MODE_COMMENT) {
        // Ignore everything until the last three characters are '-', '-' and '>'
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
        // <a disabled>
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

/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const html = htm.bind(createElement);

export { Component, createContext, createElement as h, html, render, useCallback, useContext, useDebugValue, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useReducer, useRef, useState };
//# sourceMappingURL=preact.js.map
