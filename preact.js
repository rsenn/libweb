var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */

function assign(obj, props) {
  for (var i in props) { obj[i] = props[i]; }

  return (
    /** @type {O & P} */
    obj
  );
}
/**
 * Remove a child node from its parent if attached. This is a workaround for
 * IE11 which doesn't support `Element.prototype.remove()`. Using this function
 * is smaller than including a dedicated polyfill.
 * @param {Node} node The node to remove
 */


function removeNode(node) {
  var parentNode = node.parentNode;
  if (parentNode) { parentNode.removeChild(node); }
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
  var component, hasCaught;

  for (; vnode = vnode._parent;) {
    if ((component = vnode._component) && !component._processingException) {
      try {
        if (component.constructor && component.constructor.getDerivedStateFromError != null) {
          hasCaught = true;
          component.setState(component.constructor.getDerivedStateFromError(error));
        }

        if (component.componentDidCatch != null) {
          hasCaught = true;
          component.componentDidCatch(error);
        }

        if (hasCaught) { return enqueueRender(component._pendingError = component); }
      } catch (e) {
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


export var options = {
  _catchError: _catchError
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
  var arguments$1 = arguments;

  var normalizedProps = {},
      i;

  for (i in props) {
    if (i !== 'key' && i !== 'ref') { normalizedProps[i] = props[i]; }
  }

  if (arguments.length > 3) {
    children = [children]; // https://github.com/preactjs/preact/issues/1916

    for (i = 3; i < arguments.length; i++) {
      children.push(arguments$1[i]);
    }
  }

  if (children != null) {
    normalizedProps.children = children;
  } // If a Component VNode, check for and apply defaultProps
  // Note: type may be undefined in development, must never error here.


  if (typeof type == 'function' && type.defaultProps != null) {
    for (i in type.defaultProps) {
      if (normalizedProps[i] === undefined) {
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
  var vnode = {
    type: type,
    props: props,
    key: key,
    ref: ref,
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
  if (original == null) { vnode._original = vnode; }
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


Component.prototype.setState = function (update, callback) {
  // only clone state when copying to nextState the first time.
  var s;

  if (this._nextState !== this.state) {
    s = this._nextState;
  } else {
    s = this._nextState = assign({}, this.state);
  }

  if (typeof update == 'function') {
    update = update(s, this.props);
  }

  if (update) {
    assign(s, update);
  } // Skip update if updater function returned null


  if (update == null) { return; }

  if (this._vnode) {
    if (callback) { this._renderCallbacks.push(callback); }
    enqueueRender(this);
  }
};
/**
 * Immediately perform a synchronous re-render of the component
 * @param {() => void} [callback] A function to be called after component is
 * re-rendered
 */


Component.prototype.forceUpdate = function (callback) {
  if (this._vnode) {
    // Set render mode so that we can differentiate where the render request
    // is coming from. We need this because forceUpdate should never call
    // shouldComponentUpdate
    this._force = true;
    if (callback) { this._renderCallbacks.push(callback); }
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
  if (childIndex == null) {
    // Use childIndex==null as a signal to resume the search from the vnode's sibling
    return vnode._parent ? getDomSibling(vnode._parent, vnode._parent._children.indexOf(vnode) + 1) : null;
  }

  var sibling;

  for (; childIndex < vnode._children.length; childIndex++) {
    sibling = vnode._children[childIndex];

    if (sibling != null && sibling._dom != null) {
      // Since updateParentDomPointers keeps _dom pointer correct,
      // we can rely on _dom to tell us if this subtree contains a
      // rendered DOM node, and what the first rendered DOM node is
      return sibling._dom;
    }
  } // If we get here, we have not found a DOM node in this vnode's children.
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
  var vnode = component._vnode,
      oldDom = vnode._dom,
      parentDom = component._parentDom;

  if (parentDom) {
    var commitQueue = [];
    var oldVNode = assign({}, vnode);
    oldVNode._original = oldVNode;
    var newDom = diff(parentDom, vnode, oldVNode, component._globalContext, parentDom.ownerSVGElement !== undefined, null, commitQueue, oldDom == null ? getDomSibling(vnode) : oldDom);
    commitRoot(commitQueue, vnode);

    if (newDom != oldDom) {
      updateParentDomPointers(vnode);
    }
  }
}
/**
 * @param {import('./internal').VNode} vnode
 */


function updateParentDomPointers(vnode) {
  if ((vnode = vnode._parent) != null && vnode._component != null) {
    vnode._dom = vnode._component.base = null;

    for (var i = 0; i < vnode._children.length; i++) {
      var child = vnode._children[i];

      if (child != null && child._dom != null) {
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


var rerenderQueue = [];
/**
 * Asynchronously schedule a callback
 * @type {(cb: () => void) => void}
 */

/* istanbul ignore next */
// Note the following line isn't tree-shaken by rollup cuz of rollup/rollup#2566

var defer = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
/*
 * The value of `Component.debounce` must asynchronously invoke the passed in callback. It is
 * important that contributors to Preact can consistently reason about what calls to `setState`, etc.
 * do, and when their effects will be applied. See the links below for some further reading on designing
 * asynchronous APIs.
 * * [Designing APIs for Asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony)
 * * [Callbacks synchronous and asynchronous](https://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/)
 */

var prevDebounce;
/**
 * Enqueue a rerender of a component
 * @param {import('./internal').Component} c The component to rerender
 */

function enqueueRender(c) {
  if (!c._dirty && (c._dirty = true) && rerenderQueue.push(c) && !process._rerenderCount++ || prevDebounce !== options.debounceRendering) {
    prevDebounce = options.debounceRendering;
    (prevDebounce || defer)(process);
  }
}
/** Flush the render queue by rerendering all queued components */


function process() {
  var queue;

  while (process._rerenderCount = rerenderQueue.length) {
    queue = rerenderQueue.sort(function (a, b) { return a._vnode._depth - b._vnode._depth; });
    rerenderQueue = []; // Don't update `renderCount` yet. Keep its value non-zero to prevent unnecessary
    // process() calls from getting scheduled while `queue` is still being consumed.

    queue.some(function (c) {
      if (c._dirty) { renderComponent(c); }
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
  var i, j, oldVNode, childVNode, newDom, firstChildDom, refs; // This is a compression of oldParentVNode!=null && oldParentVNode != EMPTY_OBJ && oldParentVNode._children || EMPTY_ARR
  // as EMPTY_OBJ._children should be `undefined`.

  var oldChildren = oldParentVNode && oldParentVNode._children || EMPTY_ARR;
  var oldChildrenLength = oldChildren.length; // Only in very specific places should this logic be invoked (top level `render` and `diffElementNodes`).
  // I'm using `EMPTY_OBJ` to signal when `diffChildren` is invoked in these situations. I can't use `null`
  // for this purpose, because `null` is a valid value for `oldDom` which can mean to skip to this logic
  // (e.g. if mounting a new tree in which the old DOM should be ignored (usually for Fragments).

  if (oldDom == EMPTY_OBJ) {
    if (excessDomChildren != null) {
      oldDom = excessDomChildren[0];
    } else if (oldChildrenLength) {
      oldDom = getDomSibling(oldParentVNode, 0);
    } else {
      oldDom = null;
    }
  }

  newParentVNode._children = [];

  for (i = 0; i < renderResult.length; i++) {
    childVNode = renderResult[i];

    if (childVNode == null || typeof childVNode == 'boolean') {
      childVNode = newParentVNode._children[i] = null;
    } // If this newVNode is being reused (e.g. <div>{reuse}{reuse}</div>) in the same diff,
    // or we are rendering a component (e.g. setState) copy the oldVNodes so it can have
    // it's own DOM & etc. pointers
    else if (typeof childVNode == 'string' || typeof childVNode == 'number') {
        childVNode = newParentVNode._children[i] = createVNode(null, childVNode, null, null, childVNode);
      } else if (Array.isArray(childVNode)) {
        childVNode = newParentVNode._children[i] = createVNode(Fragment, {
          children: childVNode
        }, null, null, null);
      } else if (childVNode._dom != null || childVNode._component != null) {
        childVNode = newParentVNode._children[i] = createVNode(childVNode.type, childVNode.props, childVNode.key, null, childVNode._original);
      } else {
        childVNode = newParentVNode._children[i] = childVNode;
      } // Terser removes the `continue` here and wraps the loop body
    // in a `if (childVNode) { ... } condition


    if (childVNode == null) {
      continue;
    }

    childVNode._parent = newParentVNode;
    childVNode._depth = newParentVNode._depth + 1; // Check if we find a corresponding element in oldChildren.
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
        oldVNode = oldChildren[j]; // If childVNode is unkeyed, we only match similarly unkeyed nodes, otherwise we match by key.
        // We always match by type (in either case).

        if (oldVNode && childVNode.key == oldVNode.key && childVNode.type === oldVNode.type) {
          oldChildren[j] = undefined;
          break;
        }

        oldVNode = null;
      }
    }

    oldVNode = oldVNode || EMPTY_OBJ; // Morph the old element into the new one, but don't append it to the dom yet

    newDom = diff(parentDom, childVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);

    if ((j = childVNode.ref) && oldVNode.ref != j) {
      if (!refs) { refs = []; }
      if (oldVNode.ref) { refs.push(oldVNode.ref, null, childVNode); }
      refs.push(j, childVNode._component || newDom, childVNode);
    }

    if (newDom != null) {
      if (firstChildDom == null) {
        firstChildDom = newDom;
      }

      oldDom = placeChild(parentDom, childVNode, oldVNode, oldChildren, excessDomChildren, newDom, oldDom); // Browsers will infer an option's `value` from `textContent` when
      // no value is present. This essentially bypasses our code to set it
      // later in `diff()`. It works fine in all browsers except for IE11
      // where it breaks setting `select.value`. There it will be always set
      // to an empty string. Re-applying an options value will fix that, so
      // there are probably some internal data structures that aren't
      // updated properly.
      //
      // To fix it we make sure to reset the inferred value, so that our own
      // value check in `diff()` won't be skipped.

      if (newParentVNode.type == 'option') {
        parentDom.value = '';
      } else if (typeof newParentVNode.type == 'function') {
        // Because the newParentVNode is Fragment-like, we need to set it's
        // _nextDom property to the nextSibling of its last child DOM node.
        //
        // `oldDom` contains the correct value here because if the last child
        // is a Fragment-like, then oldDom has already been set to that child's _nextDom.
        // If the last child is a DOM VNode, then oldDom will be set to that DOM
        // node's nextSibling.
        newParentVNode._nextDom = oldDom;
      }
    } else if (oldDom && oldVNode._dom == oldDom && oldDom.parentNode != parentDom) {
      // The above condition is to handle null placeholders. See test in placeholder.test.js:
      // `efficiently replace null placeholders in parent rerenders`
      oldDom = getDomSibling(oldVNode);
    }
  }

  newParentVNode._dom = firstChildDom; // Remove children that are not part of any vnode.

  if (excessDomChildren != null && typeof newParentVNode.type != 'function') {
    for (i = excessDomChildren.length; i--;) {
      if (excessDomChildren[i] != null) { removeNode(excessDomChildren[i]); }
    }
  } // Remove remaining oldChildren if there are any.


  for (i = oldChildrenLength; i--;) {
    if (oldChildren[i] != null) { unmount(oldChildren[i], oldChildren[i]); }
  } // Set refs only after unmount


  if (refs) {
    for (i = 0; i < refs.length; i++) {
      applyRef(refs[i], refs[++i], refs[++i]);
    }
  }
}

function placeChild(parentDom, childVNode, oldVNode, oldChildren, excessDomChildren, newDom, oldDom) {
  var nextDom;

  if (childVNode._nextDom !== undefined) {
    // Only Fragments or components that return Fragment like VNodes will
    // have a non-undefined _nextDom. Continue the diff from the sibling
    // of last DOM child of this child VNode
    nextDom = childVNode._nextDom; // Eagerly cleanup _nextDom. We don't need to persist the value because
    // it is only used by `diffChildren` to determine where to resume the diff after
    // diffing Components and Fragments. Once we store it the nextDOM local var, we
    // can clean up the property

    childVNode._nextDom = undefined;
  } else if (excessDomChildren == oldVNode || newDom != oldDom || newDom.parentNode == null) {
    // NOTE: excessDomChildren==oldVNode above:
    // This is a compression of excessDomChildren==null && oldVNode==null!
    // The values only have the same type when `null`.
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
  } // If we have pre-calculated the nextDOM node, use it. Else calculate it now
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
  } else if (typeof value == 'number' && IS_NON_DIMENSIONAL.test(key) === false) {
    style[key] = value + 'px';
  } else if (value == null) {
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
  var s, useCapture, nameLower;

  if (isSvg) {
    if (name === 'className') {
      name = 'class';
    }
  } else if (name === 'class') {
    name = 'className';
  }

  if (name === 'style') {
    s = dom.style;

    if (typeof value == 'string') {
      s.cssText = value;
    } else {
      if (typeof oldValue == 'string') {
        s.cssText = '';
        oldValue = null;
      }

      if (oldValue) {
        for (var i in oldValue) {
          if (!(value && i in value)) {
            setStyle(s, i, '');
          }
        }
      }

      if (value) {
        for (var i$1 in value) {
          if (!oldValue || value[i$1] !== oldValue[i$1]) {
            setStyle(s, i$1, value[i$1]);
          }
        }
      }
    }
  } // Benchmark for comparison: https://esbench.com/bench/574c954bdb965b9a00965ac6
  else if (name[0] === 'o' && name[1] === 'n') {
      useCapture = name !== (name = name.replace(/Capture$/, ''));
      nameLower = name.toLowerCase();
      name = (nameLower in dom ? nameLower : name).slice(2);

      if (value) {
        if (!oldValue) { dom.addEventListener(name, eventProxy, useCapture); }
        (dom._listeners || (dom._listeners = {}))[name] = value;
      } else {
        dom.removeEventListener(name, eventProxy, useCapture);
      }
    } else if (name !== 'list' && name !== 'tagName' && // HTMLButtonElement.form and HTMLInputElement.form are read-only but can be set using
    // setAttribute
    name !== 'form' && name !== 'type' && name !== 'size' && !isSvg && name in dom) {
      dom[name] = value == null ? '' : value;
    } else if (typeof value != 'function' && name !== 'dangerouslySetInnerHTML') {
      if (name !== (name = name.replace(/^xlink:?/, ''))) {
        if (value == null || value === false) {
          dom.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());
        } else {
          dom.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);
        }
      } else if (value == null || value === false && // ARIA-attributes have a different notion of boolean values.
      // The value `false` is different from the attribute not
      // existing on the DOM, so we can't remove it. For non-boolean
      // ARIA-attributes we could treat false as a removal, but the
      // amount of exceptions would cost us too many bytes. On top of
      // that other VDOM frameworks also always stringify `false`.
      !/^ar/.test(name)) {
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
  this._listeners[e.type](e);
}

function reorderChildren(newVNode, oldDom, parentDom) {
  for (var tmp = 0; tmp < newVNode._children.length; tmp++) {
    var vnode = newVNode._children[tmp];

    if (vnode) {
      vnode._parent = newVNode;

      if (vnode._dom) {
        if (typeof vnode.type == 'function' && vnode._children.length > 1) {
          reorderChildren(vnode, oldDom, parentDom);
        }

        oldDom = placeChild(parentDom, vnode, vnode, newVNode._children, null, vnode._dom, oldDom);

        if (typeof newVNode.type == 'function') {
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
  var tmp,
      newType = newVNode.type; // When passing through createElement it assigns the object
  // constructor as undefined. This to prevent JSON-injection.

  if (newVNode.constructor !== undefined) { return null; }
  if (tmp = options._diff) { tmp(newVNode); }

  try {
    outer: if (typeof newType == 'function') {
      var c, isNew, oldProps, oldState, snapshot, clearProcessingException;
      var newProps = newVNode.props; // Necessary for createContext api. Setting this property will pass
      // the context value as `this.context` just for this component.

      tmp = newType.contextType;
      var provider = tmp && globalContext[tmp._id];
      var componentContext = tmp ? provider ? provider.props.value : tmp._defaultValue : globalContext; // Get component and set it to `c`

      if (oldVNode._component) {
        c = newVNode._component = oldVNode._component;
        clearProcessingException = c._processingException = c._pendingError;
      } else {
        // Instantiate the new component
        if ('prototype' in newType && newType.prototype.render) {
          newVNode._component = c = new newType(newProps, componentContext); // eslint-disable-line new-cap
        } else {
          newVNode._component = c = new Component(newProps, componentContext);
          c.constructor = newType;
          c.render = doRender;
        }

        if (provider) { provider.sub(c); }
        c.props = newProps;
        if (!c.state) { c.state = {}; }
        c.context = componentContext;
        c._globalContext = globalContext;
        isNew = c._dirty = true;
        c._renderCallbacks = [];
      } // Invoke getDerivedStateFromProps


      if (c._nextState == null) {
        c._nextState = c.state;
      }

      if (newType.getDerivedStateFromProps != null) {
        if (c._nextState == c.state) {
          c._nextState = assign({}, c._nextState);
        }

        assign(c._nextState, newType.getDerivedStateFromProps(newProps, c._nextState));
      }

      oldProps = c.props;
      oldState = c.state; // Invoke pre-render lifecycle methods

      if (isNew) {
        if (newType.getDerivedStateFromProps == null && c.componentWillMount != null) {
          c.componentWillMount();
        }

        if (c.componentDidMount != null) {
          c._renderCallbacks.push(c.componentDidMount);
        }
      } else {
        if (newType.getDerivedStateFromProps == null && newProps !== oldProps && c.componentWillReceiveProps != null) {
          c.componentWillReceiveProps(newProps, componentContext);
        }

        if (!c._force && c.shouldComponentUpdate != null && c.shouldComponentUpdate(newProps, c._nextState, componentContext) === false || newVNode._original === oldVNode._original) {
          c.props = newProps;
          c.state = c._nextState; // More info about this here: https://gist.github.com/JoviDeCroock/bec5f2ce93544d2e6070ef8e0036e4e8

          if (newVNode._original !== oldVNode._original) { c._dirty = false; }
          c._vnode = newVNode;
          newVNode._dom = oldVNode._dom;
          newVNode._children = oldVNode._children;

          if (c._renderCallbacks.length) {
            commitQueue.push(c);
          }

          reorderChildren(newVNode, oldDom, parentDom);
          break outer;
        }

        if (c.componentWillUpdate != null) {
          c.componentWillUpdate(newProps, c._nextState, componentContext);
        }

        if (c.componentDidUpdate != null) {
          c._renderCallbacks.push(function () {
            c.componentDidUpdate(oldProps, oldState, snapshot);
          });
        }
      }

      c.context = componentContext;
      c.props = newProps;
      c.state = c._nextState;
      if (tmp = options._render) { tmp(newVNode); }
      c._dirty = false;
      c._vnode = newVNode;
      c._parentDom = parentDom;
      tmp = c.render(c.props, c.state, c.context); // Handle setState called in render, see #2553

      c.state = c._nextState;

      if (c.getChildContext != null) {
        globalContext = assign(assign({}, globalContext), c.getChildContext());
      }

      if (!isNew && c.getSnapshotBeforeUpdate != null) {
        snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
      }

      var isTopLevelFragment = tmp != null && tmp.type == Fragment && tmp.key == null;
      var renderResult = isTopLevelFragment ? tmp.props.children : tmp;
      diffChildren(parentDom, Array.isArray(renderResult) ? renderResult : [renderResult], newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, oldDom, isHydrating);
      c.base = newVNode._dom;

      if (c._renderCallbacks.length) {
        commitQueue.push(c);
      }

      if (clearProcessingException) {
        c._pendingError = c._processingException = null;
      }

      c._force = false;
    } else if (excessDomChildren == null && newVNode._original === oldVNode._original) {
      newVNode._children = oldVNode._children;
      newVNode._dom = oldVNode._dom;
    } else {
      newVNode._dom = diffElementNodes(oldVNode._dom, newVNode, oldVNode, globalContext, isSvg, excessDomChildren, commitQueue, isHydrating);
    }

    if (tmp = options.diffed) { tmp(newVNode); }
  } catch (e) {
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
  commitQueue.some(function (c) {
    try {
      commitQueue = c._renderCallbacks;
      c._renderCallbacks = [];
      commitQueue.some(function (cb) {
        cb.call(c);
      });
    } catch (e) {
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
  var i;
  var oldProps = oldVNode.props;
  var newProps = newVNode.props; // Tracks entering and exiting SVG namespace when descending through the tree.

  isSvg = newVNode.type === 'svg' || isSvg;

  if (excessDomChildren != null) {
    for (i = 0; i < excessDomChildren.length; i++) {
      var child = excessDomChildren[i]; // if newVNode matches an element in excessDomChildren or the `dom`
      // argument matches an element in excessDomChildren, remove it from
      // excessDomChildren so it isn't later removed in diffChildren

      if (child != null && ((newVNode.type === null ? child.nodeType === 3 : child.localName === newVNode.type) || dom == child)) {
        dom = child;
        excessDomChildren[i] = null;
        break;
      }
    }
  }

  if (dom == null) {
    if (newVNode.type === null) {
      return document.createTextNode(newProps);
    }

    dom = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', newVNode.type) : document.createElement(newVNode.type, newProps.is && {
      is: newProps.is
    }); // we created a new parent, so none of the previously attached children can be reused:

    excessDomChildren = null; // we are creating a new node, so we can assume this is a new subtree (in case we are hydrating), this deopts the hydrate

    isHydrating = false;
  }

  if (newVNode.type === null) {
    if (oldProps !== newProps && dom.data != newProps) {
      dom.data = newProps;
    }
  } else {
    if (excessDomChildren != null) {
      excessDomChildren = EMPTY_ARR.slice.call(dom.childNodes);
    }

    oldProps = oldVNode.props || EMPTY_OBJ;
    var oldHtml = oldProps.dangerouslySetInnerHTML;
    var newHtml = newProps.dangerouslySetInnerHTML; // During hydration, props are not diffed at all (including dangerouslySetInnerHTML)
    // @TODO we should warn in debug mode when props don't match here.

    if (!isHydrating) {
      // But, if we are in a situation where we are using existing DOM (e.g. replaceNode)
      // we should read the existing DOM attributes to diff them
      if (excessDomChildren != null) {
        oldProps = {};

        for (var i$1 = 0; i$1 < dom.attributes.length; i$1++) {
          oldProps[dom.attributes[i$1].name] = dom.attributes[i$1].value;
        }
      }

      if (newHtml || oldHtml) {
        // Avoid re-applying the same '__html' if it did not changed between re-render
        if (!newHtml || !oldHtml || newHtml.__html != oldHtml.__html) {
          dom.innerHTML = newHtml && newHtml.__html || '';
        }
      }
    }

    diffProps(dom, newProps, oldProps, isSvg, isHydrating); // If the new vnode didn't have dangerouslySetInnerHTML, diff its children

    if (newHtml) {
      newVNode._children = [];
    } else {
      i = newVNode.props.children;
      diffChildren(dom, Array.isArray(i) ? i : [i], newVNode, oldVNode, globalContext, newVNode.type === 'foreignObject' ? false : isSvg, excessDomChildren, commitQueue, EMPTY_OBJ, isHydrating);
    } // (as above, don't diff props during hydration)


    if (!isHydrating) {
      if ('value' in newProps && (i = newProps.value) !== undefined && i !== dom.value) {
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
    if (typeof ref == 'function') { ref(value); }else { ref.current = value; }
  } catch (e) {
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
  var r;

  if (r = vnode.ref) {
    if (!r.current || r.current === vnode._dom) { applyRef(r, null, parentVNode); }
  }

  var dom;

  if (!skipRemove && typeof vnode.type != 'function') {
    skipRemove = (dom = vnode._dom) != null;
  } // Must be set to `undefined` to properly clean up `_nextDom`
  // for which `null` is a valid value. See comment in `create-element.js`


  vnode._dom = vnode._nextDom = undefined;

  if ((r = vnode._component) != null) {
    if (r.componentWillUnmount) {
      try {
        r.componentWillUnmount();
      } catch (e) {
        options._catchError(e, parentVNode);
      }
    }

    r.base = r._parentDom = null;
  }

  if (r = vnode._children) {
    for (var i = 0; i < r.length; i++) {
      if (r[i]) { unmount(r[i], parentVNode, skipRemove); }
    }
  }

  if (dom != null) { removeNode(dom); }
}
/** The `.render()` method for a PFC backing instance. */


function doRender(props, state, context) {
  return this.constructor(props, context);
}

var IS_HYDRATE = EMPTY_OBJ;
/**
 * Render a Preact virtual node into a DOM element
 * @param {import('./index').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to
 * render into
 * @param {Element | Text} [replaceNode] Optional: Attempt to re-use an
 * existing DOM tree rooted at `replaceNode`
 */

function render(vnode, parentDom, replaceNode) {
  // are in hydration mode or not by passing `IS_HYDRATE` instead of a
  // DOM element.

  var isHydrating = replaceNode === IS_HYDRATE; // To be able to support calling `render()` multiple times on the same
  // DOM node, we need to obtain a reference to the previous tree. We do
  // this by assigning a new `_children` property to DOM nodes which points
  // to the last rendered tree. By default this property is not present, which
  // means that we are mounting a new tree for the first time.

  var oldVNode = isHydrating ? null : replaceNode && replaceNode._children || parentDom._children;
  vnode = createElement(Fragment, null, [vnode]); // List of effects that need to be called after diffing.

  var commitQueue = [];
  diff(parentDom, // Determine the new vnode tree and store it on the DOM element on
  // our custom `_children` property.
  (isHydrating ? parentDom : replaceNode || parentDom)._children = vnode, oldVNode || EMPTY_OBJ, EMPTY_OBJ, parentDom.ownerSVGElement !== undefined, replaceNode && !isHydrating ? [replaceNode] : oldVNode ? null : parentDom.childNodes.length ? EMPTY_ARR.slice.call(parentDom.childNodes) : null, commitQueue, replaceNode || EMPTY_OBJ, isHydrating); // Flush all queued effects

  commitRoot(commitQueue, vnode);
}

var i = 0;

function createContext(defaultValue) {
  var ctx = {};
  var context = {
    _id: '__cC' + i++,
    _defaultValue: defaultValue,

    Consumer: function Consumer(props, context) {
      return props.children(context);
    },

    Provider: function Provider(props) {
      var this$1 = this;

      if (!this.getChildContext) {
        var subs = [];

        this.getChildContext = function () {
          ctx[context._id] = this$1;
          return ctx;
        };

        this.shouldComponentUpdate = function (_props) {
          if (this$1.props.value !== _props.value) {
            subs.some(function (c) {
              c.context = _props.value;
              enqueueRender(c);
            });
          }
        };

        this.sub = function (c) {
          subs.push(c);
          var old = c.componentWillUnmount;

          c.componentWillUnmount = function () {
            subs.splice(subs.indexOf(c), 1);
            old && old.call(c);
          };
        };
      }

      return props.children;
    }

  };
  context.Consumer.contextType = context; // Devtools needs access to the context object when it
  // encounters a Provider. This is necessary to support
  // setting `displayName` on the context object instead
  // of on the component itself. See:
  // https://reactjs.org/docs/context.html#contextdisplayname

  context.Provider._contextRef = context;
  return context;
}

/**
 * Asynchronously schedule a callback
 * @type {(cb: () => void) => void}
 */

/* istanbul ignore next */
// Note the following line isn't tree-shaken by rollup cuz of rollup/rollup#2566

var defer$1 = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
/** @type {number} */


var currentIndex;
/** @type {import('./internal').Component} */

var currentComponent;
/**
 * Get a hook's state from the currentComponent
 * @param {number} index The index of the hook to get
 * @param {number} type The index of the hook to get
 * @returns {import('./internal').HookState}
 */


function getHookState(index, type) {
  // * https://github.com/michael-klein/funcy.js/blob/f6be73468e6ec46b0ff5aa3cc4c9baf72a29025a/src/hooks/core_hooks.mjs
  // * https://github.com/michael-klein/funcy.js/blob/650beaa58c43c33a74820a3c98b3c7079cf2e333/src/renderer.mjs
  // Other implementations to look at:
  // * https://codesandbox.io/s/mnox05qp8

  var hooks = currentComponent.__hooks || (currentComponent.__hooks = {
    _list: [],
    _pendingEffects: []
  });

  if (index >= hooks._list.length) {
    hooks._list.push({});
  }

  return hooks._list[index];
}
/**
 * @param {import('./index').StateUpdater<any>} initialState
 */


function useState(initialState) {
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

  if (!hookState._component) {
    hookState._component = currentComponent;
    hookState._value = [!init ? invokeOrReturn(undefined, initialState) : init(initialState), function (action) {
      var nextValue = hookState._reducer(hookState._value[0], action);

      if (hookState._value[0] !== nextValue) {
        hookState._value = [nextValue, hookState._value[1]];

        hookState._component.setState({});
      }
    }];
  }

  return hookState._value;
}
/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */


function useEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  var state = getHookState(currentIndex++, 3);

  if (argsChanged(state._args, args)) {
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
  var state = getHookState(currentIndex++, 4);

  if (argsChanged(state._args, args)) {
    state._value = callback;
    state._args = args;

    currentComponent._renderCallbacks.push(state);
  }
}

function useRef(initialValue) {
  return useMemo(function () { return ({
    current: initialValue
  }); }, []);
}
/**
 * @param {object} ref
 * @param {() => object} createHandle
 * @param {any[]} args
 */


function useImperativeHandle(ref, createHandle, args) {
  useLayoutEffect(function () {
    if (typeof ref == 'function') { ref(createHandle()); }else if (ref) { ref.current = createHandle(); }
  }, args == null ? args : args.concat(ref));
}
/**
 * @param {() => any} factory
 * @param {any[]} args
 */


function useMemo(factory, args) {
  /** @type {import('./internal').MemoHookState} */
  var state = getHookState(currentIndex++, 7);

  if (argsChanged(state._args, args)) {
    state._args = args;
    state._factory = factory;
    return state._value = factory();
  }

  return state._value;
}
/**
 * @param {() => void} callback
 * @param {any[]} args
 */


function useCallback(callback, args) {
  return useMemo(function () { return callback; }, args);
}
/**
 * @param {import('./internal').PreactContext} context
 */


function useContext(context) {
  var provider = currentComponent.context[context._id]; // We could skip this call here, but than we'd not call
  // `options._hook`. We need to do that in order to make
  // the devtools aware of this hook.

  var state = getHookState(currentIndex++, 9); // The devtools needs access to the context object to
  // be able to pull of the default value when no provider
  // is present in the tree.

  state._context = context;
  if (!provider) { return context._defaultValue; } // This is probably not safe to convert to "!"

  if (state._value == null) {
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
}
/**
 * @param {any[]} oldArgs
 * @param {any[]} newArgs
 */


function argsChanged(oldArgs, newArgs) {
  return !oldArgs || newArgs.some(function (arg, index) { return arg !== oldArgs[index]; });
}

function invokeOrReturn(arg, f) {
  return typeof f == 'function' ? f(arg) : f;
}

var MINI = false;

var MODE_SLASH = 0;
var MODE_TEXT = 1;
var MODE_WHITESPACE = 2;
var MODE_TAGNAME = 3;
var MODE_COMMENT = 4;
var MODE_PROP_SET = 5;
var MODE_PROP_APPEND = 6;
var CHILD_APPEND = 0;
var CHILD_RECURSE = 2;
var TAG_SET = 3;
var PROPS_ASSIGN = 4;
var PROP_SET = MODE_PROP_SET;
var PROP_APPEND = MODE_PROP_APPEND; // Turn a result of a build(...) call into a tree that is more
var evaluate = function (h, built, fields, args) {
  var tmp; // `build()` used the first element of the operation list as
  // temporary workspace. Now that `build()` is done we can use
  // that space to track whether the current element is "dynamic"
  // (i.e. it or any of its descendants depend on dynamic values).

  built[0] = 0;

  for (var i = 1; i < built.length; i++) {
    var type = built[i++]; // Set `built[0]`'s appropriate bits if this element depends on a dynamic value.

    var value = built[i] ? (built[0] |= type ? 1 : 2, fields[built[i++]]) : built[++i];

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
var build = function (statics) {
  var mode = MODE_TEXT;
  var buffer = '';
  var quote = '';
  var current = [0];
  var char, propName;

  var commit = function (field) {
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

  for (var i = 0; i < statics.length; i++) {
    if (i) {
      if (mode === MODE_TEXT) {
        commit();
      }

      commit(i);
    }

    for (var j = 0; j < statics[i].length; j++) {
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
var CACHES = new Map();

var regular = function (statics) {
  var tmp = CACHES.get(this);

  if (!tmp) {
    tmp = new Map();
    CACHES.set(this, tmp);
  }

  tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, tmp = build(statics)), tmp), arguments, []);
  return tmp.length > 1 ? tmp : tmp[0];
};

var htm = MINI ? build : regular;

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
var html = htm.bind(createElement);

export { createElement as h, html, render, Component, createContext, useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue };
