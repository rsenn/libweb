var n,
  u,
  i,
  t,
  o,
  r,
  f = {},
  e = [],
  c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

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

function createElement(type, props, children) {
  var i,
    t,
    o,
    r = arguments,
    f = {};

  for(o in props) {
    'key' == o ? (i = props[o]) : 'ref' == o ? (t = props[o]) : (f[o] = props[o]);
  }

  if(arguments.length > 3) {
    for(children = [children], o = 3; o < arguments.length; o++) {
      children.push(r[o]);
    }
  }
  if((null != children && (f.children = children), 'function' == typeof type && null != type.defaultProps)) {
    for(o in type.defaultProps) {
      void 0 === f[o] && (f[o] = type.defaultProps[o]);
    }
  }
  return createVNode(type, f, i, t, null);
}

function createVNode(l, u, i, t, o) {
  var r = {
    type: l,
    props: u,
    key: i,
    ref: t,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    __h: null,
    constructor: void 0,
    __v: o
  };
  return null == o && (r.__v = r), null != n.vnode && n.vnode(r), r;
}

function Fragment(props) {
  return props.children;
}

function Component(props, context) {
  this.props = props;
  this.context = context;
}

function getDomSibling(vnode, childIndex) {
  if(null == childIndex) {
    return vnode.__ ? getDomSibling(vnode.__, vnode.__.__k.indexOf(vnode) + 1) : null;
  }

  for(var u; childIndex < vnode.__k.length; childIndex++) {
    if(null != (u = vnode.__k[childIndex]) && null != u.__e) {
      return u.__e;
    }
  }

  return 'function' == typeof vnode.type ? getDomSibling(vnode) : null;
}

function updateParentDomPointers(vnode) {
  var l, u;

  if(null != (vnode = vnode.__) && null != vnode.__c) {
    for(vnode.__e = vnode.__c.base = null, l = 0; l < vnode.__k.length; l++) {
      if(null != (u = vnode.__k[l]) && null != u.__e) {
        vnode.__e = vnode.__c.base = u.__e;
        break;
      }
    }
    return updateParentDomPointers(vnode);
  }
}

function enqueueRender(l) {
  ((!l.__d && (l.__d = !0) && u.push(l) && !process.__r++) || t !== n.debounceRendering) && ((t = n.debounceRendering) || i)(process);
}

function process() {
  for(var queue; (process.__r = u.length); ) {
    (queue = u.sort(function (queue, l) {
      return queue.__v.__b - l.__v.__b;
    })),
      (u = []),
      queue.some(function (queue) {
        var l, u, i, t, o, r, f;
        queue.__d &&
          ((r = (o = (l = queue).__v).__e),
          (f = l.__P) &&
            ((u = []),
            ((i = assign({}, o)).__v = i),
            (t = diff(f, o, i, l.__n, void 0 !== f.ownerSVGElement, null != o.__h ? [r] : null, u, null == r ? getDomSibling(o) : r, o.__h)),
            commitRoot(u, o),
            t != r && updateParentDomPointers(o)));
      });
  }
}

function diffChildren(parentDom, l, u, i, t, o, r, c, s, h) {
  var y,
    d,
    w,
    k,
    g,
    m,
    b,
    A = (i && i.__k) || e,
    P = A.length;

  for(s == f && (s = null != r ? r[0] : P ? getDomSibling(i, 0) : null), u.__k = [], y = 0; y < l.length; y++) {
    if(
      null !=
      (k = u.__k[y] =
        null == (k = l[y]) || 'boolean' == typeof k
          ? null
          : 'string' == typeof k || 'number' == typeof k
          ? createVNode(null, k, null, null, k)
          : Array.isArray(k)
          ? createVNode(
              Fragment,
              {
                children: k
              },
              null,
              null,
              null
            )
          : null != k.__e || null != k.__c
          ? createVNode(k.type, k.props, k.key, null, k.__v)
          : k)
    ) {
      if(((k.__ = u), (k.__b = u.__b + 1), null === (w = A[y]) || (w && k.key == w.key && k.type === w.type))) {
        A[y] = void 0;
      } else {
        for(d = 0; d < P; d++) {
          if((w = A[d]) && k.key == w.key && k.type === w.type) {
            A[d] = void 0;
            break;
          }

          w = null;
        }
      }
      (g = diff(parentDom, k, (w = w || f), t, o, r, c, s, h)),
        (d = k.ref) && w.ref != d && (b || (b = []), w.ref && b.push(w.ref, null, k), b.push(d, k.__c || g, k)),
        null != g
          ? (null == m && (m = g), (s = placeChild(parentDom, k, w, A, r, g, s)), h || 'option' != u.type ? 'function' == typeof u.type && (u.__d = s) : (parentDom.value = ''))
          : s && w.__e == s && s.parentNode != parentDom && (s = getDomSibling(w));
    }
  }

  if(((u.__e = m), null != r && 'function' != typeof u.type)) {
    for(y = r.length; y--; ) {
      null != r[y] && removeNode(r[y]);
    }
  }

  for(y = P; y--; ) {
    null != A[y] && unmount(A[y], A[y]);
  }

  if(b) {
    for(y = 0; y < b.length; y++) {
      applyRef(b[y], b[++y], b[++y]);
    }
  }
}

function placeChild(parentDom, l, u, i, t, o, r) {
  var f, e, c;
  if(void 0 !== l.__d) {
    (f = l.__d), (l.__d = void 0);
  } else if(t == u || o != r || null == o.parentNode) {
    parentDom: if(null == r || r.parentNode !== parentDom) {
      parentDom.appendChild(o), (f = null);
    } else {
      for(e = r, c = 0; (e = e.nextSibling) && c < i.length; c += 2) {
        if(e == o) {
          break parentDom;
        }
      }

      parentDom.insertBefore(o, r), (f = r);
    }
  }
  return void 0 !== f ? f : o.nextSibling;
}

function diffProps(dom, l, u, i, t) {
  var o;

  for(o in u) {
    'children' === o || 'key' === o || o in l || setProperty(dom, o, null, u[o], i);
  }

  for(o in l) {
    (t && 'function' != typeof l[o]) || 'children' === o || 'key' === o || 'value' === o || 'checked' === o || u[o] === l[o] || setProperty(dom, o, l[o], u[o], i);
  }
}

function setStyle(style, l, u) {
  '-' === l[0] ? style.setProperty(l, u) : (style[l] = null == u ? '' : 'number' != typeof u || c.test(l) ? u : u + 'px');
}

function setProperty(dom, l, u, i, t) {
  var o, r, f;
  if((t && 'className' == l && (l = 'class'), 'style' === l)) {
    if('string' == typeof u) {
      dom.style.cssText = u;
    } else {
      if(('string' == typeof i && (dom.style.cssText = i = ''), i)) {
        for(l in i) {
          (u && l in u) || setStyle(dom.style, l, '');
        }
      }
      if(u) {
        for(l in u) {
          (i && u[l] === i[l]) || setStyle(dom.style, l, u[l]);
        }
      }
    }
  } else {
    'o' === l[0] && 'n' === l[1]
      ? ((o = l !== (l = l.replace(/Capture$/, ''))),
        (r = l.toLowerCase()) in dom && (l = r),
        (l = l.slice(2)),
        dom.l || (dom.l = {}),
        (dom.l[l + o] = u),
        (f = o ? eventProxyCapture : eventProxy),
        u ? i || dom.addEventListener(l, f, o) : dom.removeEventListener(l, f, o))
      : 'list' !== l && 'tagName' !== l && 'form' !== l && 'type' !== l && 'size' !== l && 'download' !== l && 'href' !== l && !t && l in dom
      ? (dom[l] = null == u ? '' : u)
      : 'function' != typeof u &&
        'dangerouslySetInnerHTML' !== l &&
        (l !== (l = l.replace(/xlink:?/, ''))
          ? null == u || !1 === u
            ? dom.removeAttributeNS('http://www.w3.org/1999/xlink', l.toLowerCase())
            : dom.setAttributeNS('http://www.w3.org/1999/xlink', l.toLowerCase(), u)
          : null == u || (!1 === u && !/^ar/.test(l))
          ? dom.removeAttribute(l)
          : dom.setAttribute(l, u));
  }
}

function eventProxy(l) {
  this.l[l.type + !1](n.event ? n.event(l) : l);
}

function eventProxyCapture(l) {
  this.l[l.type + !0](n.event ? n.event(l) : l);
}

function reorderChildren(childVNode, l, u) {
  var i, t;

  for(i = 0; i < childVNode.__k.length; i++) {
    (t = childVNode.__k[i]) &&
      ((t.__ = childVNode),
      t.__e &&
        ('function' == typeof t.type && t.__k.length > 1 && reorderChildren(t, l, u),
        (l = placeChild(u, t, t, childVNode.__k, null, t.__e, l)),
        'function' == typeof childVNode.type && (childVNode.__d = l)));
  }
}

function diff(l, u, i, t, o, r, f, e, c) {
  var a,
    h,
    v,
    y,
    _,
    w,
    k,
    g,
    b,
    x,
    A,
    P = u.type;

  if(void 0 !== u.constructor) {
    return null;
  }
  null != i.__h && ((c = i.__h), (e = u.__e = i.__e), (u.__h = null), (r = [e])), (a = n.__b) && a(u);

  try {
    outer: if('function' == typeof P) {
      if(
        ((g = u.props),
        (b = (a = P.contextType) && t[a.__c]),
        (x = a ? (b ? b.props.value : a.__) : t),
        i.__c
          ? (k = (h = u.__c = i.__c).__ = h.__E)
          : ('prototype' in P && P.prototype.render ? (u.__c = h = new P(g, x)) : ((u.__c = h = new Component(g, x)), (h.constructor = P), (h.render = doRender)),
            b && b.sub(h),
            (h.props = g),
            h.state || (h.state = {}),
            (h.context = x),
            (h.__n = t),
            (v = h.__d = !0),
            (h.__h = [])),
        null == h.__s && (h.__s = h.state),
        null != P.getDerivedStateFromProps && (h.__s == h.state && (h.__s = assign({}, h.__s)), assign(h.__s, P.getDerivedStateFromProps(g, h.__s))),
        (y = h.props),
        (_ = h.state),
        v)
      ) {
        null == P.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), null != h.componentDidMount && h.__h.push(h.componentDidMount);
      } else {
        if(
          (null == P.getDerivedStateFromProps && g !== y && null != h.componentWillReceiveProps && h.componentWillReceiveProps(g, x),
          (!h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(g, h.__s, x)) || u.__v === i.__v)
        ) {
          (h.props = g), (h.state = h.__s), u.__v !== i.__v && (h.__d = !1), (h.__v = u), (u.__e = i.__e), (u.__k = i.__k), h.__h.length && f.push(h), reorderChildren(u, e, l);
          break outer;
        }

        null != h.componentWillUpdate && h.componentWillUpdate(g, h.__s, x),
          null != h.componentDidUpdate &&
            h.__h.push(function () {
              h.componentDidUpdate(y, _, w);
            });
      }
      (h.context = x),
        (h.props = g),
        (h.state = h.__s),
        (a = n.__r) && a(u),
        (h.__d = !1),
        (h.__v = u),
        (h.__P = l),
        (a = h.render(h.props, h.state, h.context)),
        (h.state = h.__s),
        null != h.getChildContext && (t = assign(assign({}, t), h.getChildContext())),
        v || null == h.getSnapshotBeforeUpdate || (w = h.getSnapshotBeforeUpdate(y, _)),
        (A = null != a && a.type == Fragment && null == a.key ? a.props.children : a),
        diffChildren(l, Array.isArray(A) ? A : [A], u, i, t, o, r, f, e, c),
        (h.base = u.__e),
        (u.__h = null),
        h.__h.length && f.push(h),
        k && (h.__E = h.__ = null),
        (h.__e = !1);
    } else {
      null == r && u.__v === i.__v ? ((u.__k = i.__k), (u.__e = i.__e)) : (u.__e = diffElementNodes(i.__e, u, i, t, o, r, f, c));
    }

    (a = n.diffed) && a(u);
  } catch(l) {
    (u.__v = null), (c || null != r) && ((u.__e = e), (u.__h = !!c), (r[r.indexOf(e)] = null)), n.__e(l, u, i);
  }

  return u.__e;
}

function commitRoot(l, u) {
  n.__c && n.__c(u, l),
    l.some(function (u) {
      try {
        (l = u.__h),
          (u.__h = []),
          l.some(function (cb) {
            cb.call(u);
          });
      } catch(l) {
        n.__e(l, u.__v);
      }
    });
}

function diffElementNodes(dom, l, u, i, t, o, r, c) {
  var s,
    a,
    h,
    v,
    y,
    p = u.props,
    d = l.props;
  if(((t = 'svg' === l.type || t), null != o)) {
    for(s = 0; s < o.length; s++) {
      if(null != (a = o[s]) && ((null === l.type ? 3 === a.nodeType : a.localName === l.type) || dom == a)) {
        (dom = a), (o[s] = null);
        break;
      }
    }
  }

  if(null == dom) {
    if(null === l.type) {
      return document.createTextNode(d);
    }
    (dom = t
      ? document.createElementNS('http://www.w3.org/2000/svg', l.type)
      : document.createElement(
          l.type,
          d.is && {
            is: d.is
          }
        )),
      (o = null),
      (c = !1);
  }

  if(null === l.type) {
    p === d || (c && dom.data === d) || (dom.data = d);
  } else {
    if((null != o && (o = e.slice.call(dom.childNodes)), (h = (p = u.props || f).dangerouslySetInnerHTML), (v = d.dangerouslySetInnerHTML), !c)) {
      if(null != o) {
        for(p = {}, y = 0; y < dom.attributes.length; y++) {
          p[dom.attributes[y].name] = dom.attributes[y].value;
        }
      }
      (v || h) && ((v && ((h && v.__html == h.__html) || v.__html === dom.innerHTML)) || (dom.innerHTML = (v && v.__html) || ''));
    }

    diffProps(dom, d, p, t, c),
      v ? (l.__k = []) : ((s = l.props.children), diffChildren(dom, Array.isArray(s) ? s : [s], l, u, i, 'foreignObject' !== l.type && t, o, r, f, c)),
      c ||
        ('value' in d && void 0 !== (s = d.value) && (s !== dom.value || ('progress' === l.type && !s)) && setProperty(dom, 'value', s, p.value, !1),
        'checked' in d && void 0 !== (s = d.checked) && s !== dom.checked && setProperty(dom, 'checked', s, p.checked, !1));
  }
  return dom;
}

function applyRef(l, u, i) {
  try {
    'function' == typeof l ? l(u) : (l.current = u);
  } catch(l) {
    n.__e(l, i);
  }
}

function unmount(l, u, i) {
  var t, o, r;

  if(
    (n.unmount && n.unmount(l),
    (t = l.ref) && ((t.current && t.current !== l.__e) || applyRef(t, null, u)),
    i || 'function' == typeof l.type || (i = null != (o = l.__e)),
    (l.__e = l.__d = void 0),
    null != (t = l.__c))
  ) {
    if(t.componentWillUnmount) {
      try {
        t.componentWillUnmount();
      } catch(l) {
        n.__e(l, u);
      }
    }
    t.base = t.__P = null;
  }

  if((t = l.__k)) {
    for(r = 0; r < t.length; r++) {
      t[r] && unmount(t[r], u, i);
    }
  }
  null != o && removeNode(o);
}

function doRender(props, l, u) {
  globalThis.doRenderObj = this;
  let ctor = this.constructor;

  try {
    return this.constructor(props, u);
  } catch(error) {
    const obj = this;
    console.log('doRender', { error: error.message, ctor: ctor + '' });
    throw error;
  }
}

function render(l, u, i) {
  var t, r, c;
  n.__ && n.__(l, u),
    (r = (t = i === o) ? null : (i && i.__k) || u.__k),
    (l = createElement(Fragment, null, [l])),
    (c = []),
    diff(u, ((t ? u : i || u).__k = l), r || f, f, void 0 !== u.ownerSVGElement, i && !t ? [i] : r ? null : u.childNodes.length ? e.slice.call(u.childNodes) : null, c, i || f, t),
    commitRoot(c, l);
}

export function cloneElement(vnode, props, children) {
  var arguments$1 = arguments;
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

  if(arguments.length > 3) {
    children = [children];

    for(i = 3; i < arguments.length; i++) {
      children.push(arguments$1[i]);
    }
  }

  if(children != null) {
    normalizedProps.children = children;
  }

  return createVNode(vnode.type, normalizedProps, key || vnode.key, ref || vnode.ref, null);
}

function createContext(defaultValue, l) {
  var u = {
    __c: (l = '__cC' + r++),
    __: defaultValue,
    Consumer: function(defaultValue, l) {
      return defaultValue.children(l);
    },
    Provider: function(defaultValue, u, i) {
      return (
        this.getChildContext ||
          ((u = []),
          ((i = {})[l] = this),
          (this.getChildContext = function() {
            return i;
          }),
          (this.shouldComponentUpdate = function(defaultValue) {
            this.props.value !== defaultValue.value && u.some(enqueueRender);
          }),
          (this.sub = function(defaultValue) {
            u.push(defaultValue);
            var l = defaultValue.componentWillUnmount;

            defaultValue.componentWillUnmount = function() {
              u.splice(u.indexOf(defaultValue), 1), l && l.call(defaultValue);
            };
          })),
        defaultValue.children
      );
    }
  };
  return (u.Provider.__ = u.Consumer.contextType = u);
}

n = {
  __e: function _catchError(error, l) {
    for(var u, i, t, o = l.__h; (l = l.__); ) {
      if((u = l.__c) && !u.__) {
        try {
          if(
            ((i = u.constructor) && null != i.getDerivedStateFromError && (u.setState(i.getDerivedStateFromError(error)), (t = u.__d)),
            null != u.componentDidCatch && (u.componentDidCatch(error), (t = u.__d)),
            t)
          ) {
            return (l.__h = o), (u.__E = u);
          }
        } catch(l) {
          error = l;
        }
      }
    }

    throw error;
  }
};

(Component.prototype.setState = function(update, l) {
  var u;
  (u = null != this.__s && this.__s !== this.state ? this.__s : (this.__s = assign({}, this.state))),
    'function' == typeof update && (update = update(assign({}, u), this.props)),
    update && assign(u, update),
    null != update && this.__v && (l && this.__h.push(l), enqueueRender(this));
}),
  (Component.prototype.forceUpdate = function(callback) {
    this.__v && ((this.__e = !0), callback && this.__h.push(callback), enqueueRender(this));
  }),
  (Component.prototype.render = Fragment),
  (u = []),
  (i = 'function' == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
  (process.__r = 0),
  (o = f),
  (r = 0);

var currentIndex,
  currentComponent,
  r$1,
  currentHook = 0,
  afterPaintEffects = [],
  oldBeforeRender = n.__r,
  oldAfterDiff = n.diffed,
  oldCommit = n.__c,
  oldBeforeUnmount = n.unmount;

function getHookState(t, r) {
  n.__h && n.__h(currentComponent, t, currentHook || r), (currentHook = 0);
  var i =
    currentComponent.__H ||
    (currentComponent.__H = {
      __: [],
      __h: []
    });
  return t >= i.__.length && i.__.push({}), i.__[t];
}

function useState(initialState) {
  return (currentHook = 1), useReducer(invokeOrReturn, initialState);
}

function useReducer(reducer, r, o) {
  var i = getHookState(currentIndex++, 2);
  return (
    (i.t = reducer),
    i.__c ||
      ((i.__ = [
        o ? o(r) : invokeOrReturn(void 0, r),
        function(reducer) {
          var t = i.t(i.__[0], reducer);
          i.__[0] !== t && ((i.__ = [t, i.__[1]]), i.__c.setState({}));
        }
      ]),
      (i.__c = currentComponent)),
    i.__
  );
}

function useEffect(r, o) {
  var i = getHookState(currentIndex++, 3);
  !n.__s && argsChanged(i.__H, o) && ((i.__ = r), (i.__H = o), currentComponent.__H.__h.push(i));
}

function useLayoutEffect(r, o) {
  var i = getHookState(currentIndex++, 4);
  !n.__s && argsChanged(i.__H, o) && ((i.__ = r), (i.__H = o), currentComponent.__h.push(i));
}

function useRef(initialValue) {
  return (
    (currentHook = 5),
    useMemo(function () {
      return {
        current: initialValue
      };
    }, [])
  );
}

function useImperativeHandle(ref, t, u) {
  (currentHook = 6),
    useLayoutEffect(
      function() {
        'function' == typeof ref ? ref(t()) : ref && (ref.current = t());
        console.log('Ruler ref:', ref);
      },
      null == u ? u : u.concat(ref)
    );
}

function useMemo(factory, u) {
  var r = getHookState(currentIndex++, 7);
  return argsChanged(r.__H, u) && ((r.__ = factory()), (r.__H = u), (r.__h = factory)), r.__;
}

function useCallback(callback, t) {
  return (
    (currentHook = 8),
    useMemo(function () {
      return callback;
    }, t)
  );
}

function useContext(context) {
  var r = currentComponent.context[context.__c],
    o = getHookState(currentIndex++, 9);
  return (o.__c = context), r ? (null == o.__ && ((o.__ = !0), r.sub(currentComponent)), r.props.value) : context.__;
}

function useDebugValue(t, u) {
  n.useDebugValue && n.useDebugValue(u ? u(t) : t);
}

function flushAfterPaintEffects() {
  afterPaintEffects.forEach(function (t) {
    if(t.__P) {
      try {
        t.__H.__h.forEach(invokeCleanup), t.__H.__h.forEach(invokeEffect), (t.__H.__h = []);
      } catch(u) {
        (t.__H.__h = []), n.__e(u, t.__v);
      }
    }
  }),
    (afterPaintEffects = []);
}

(n.__r = function(vnode) {
  oldBeforeRender && oldBeforeRender(vnode), (currentIndex = 0);
  var r = (currentComponent = vnode.__c).__H;
  r && (r.__h.forEach(invokeCleanup), r.__h.forEach(invokeEffect), (r.__h = []));
}),
  (n.diffed = function(t) {
    oldAfterDiff && oldAfterDiff(t);
    var u = t.__c;
    u &&
      u.__H &&
      u.__H.__h.length &&
      ((1 !== afterPaintEffects.push(u) && r$1 === n.requestAnimationFrame) ||
        (
          (r$1 = n.requestAnimationFrame) ||
          function(timeout) {
            var t,
              u = function() {
                clearTimeout(r), HAS_RAF && cancelAnimationFrame(t), setTimeout(timeout);
              },
              r = setTimeout(u, 100);

            HAS_RAF && (t = requestAnimationFrame(u));
          }
        )(flushAfterPaintEffects));
  }),
  (n.__c = function(t, u) {
    u.some(function (t) {
      try {
        t.__h.forEach(invokeCleanup),
          (t.__h = t.__h.filter(function (cb) {
            return !cb.__ || invokeEffect(cb);
          }));
      } catch(r) {
        u.some(function (c) {
          c.__h && (c.__h = []);
        }),
          (u = []),
          n.__e(r, t.__v);
      }
    }),
      oldCommit && oldCommit(t, u);
  }),
  (n.unmount = function(t) {
    oldBeforeUnmount && oldBeforeUnmount(t);
    var u = t.__c;
    if(u && u.__H) {
      try {
        u.__H.__.forEach(invokeCleanup);
      } catch(t) {
        n.__e(t, u.__v);
      }
    }
  });

var HAS_RAF = 'function' == typeof requestAnimationFrame;

function invokeCleanup(hook) {
  'function' == typeof hook.__c && hook.__c();
}

function invokeEffect(hook) {
  hook.__c = hook.__();
}

function argsChanged(oldArgs, t) {
  return (
    !oldArgs ||
    oldArgs.length !== t.length ||
    t.some(function (t, u) {
      return t !== oldArgs[u];
    })
  );
}

function invokeOrReturn(arg, t) {
  return 'function' == typeof t ? t(arg) : t;
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
var PROP_APPEND = MODE_PROP_APPEND;

var evaluate = function(h, built, fields, args) {
  var tmp;

  built[0] = 0;

  for(var i = 1; i < built.length; i++) {
    var type = built[i++];
    var value = built[i] ? ((built[0] |= type ? 1 : 2), fields[built[i++]]) : built[++i];

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

var build = function(statics) {
  var mode = MODE_TEXT;
  var buffer = '';
  var quote = '';
  var current = [0];
  var char, propName;

  var commit = function(field) {
    if(mode === MODE_TEXT && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
      current.push(CHILD_APPEND, field, buffer);
    } else if(mode === MODE_TAGNAME && (field || buffer)) {
      current.push(TAG_SET, field, buffer);
      mode = MODE_WHITESPACE;
    } else if(mode === MODE_WHITESPACE && buffer === '...' && field) {
      current.push(PROPS_ASSIGN, field, 0);
    } else if(mode === MODE_WHITESPACE && buffer && !field) {
      current.push(PROP_SET, 0, true, buffer);
    } else if(mode >= MODE_PROP_SET) {
      if(buffer || (!field && mode === MODE_PROP_SET)) {
        current.push(mode, 0, buffer, propName);
        mode = MODE_PROP_APPEND;
      }
      if(field) {
        current.push(mode, field, 0, propName);
        mode = MODE_PROP_APPEND;
      }
    }
    buffer = '';
  };

  for(var i = 0; i < statics.length; i++) {
    if(i) {
      if(mode === MODE_TEXT) commit();

      commit(i);
    }

    for(var j = 0; j < statics[i].length; j++) {
      char = statics[i][j];

      if(mode === MODE_TEXT) {
        if(char === '<') {
          commit();
          current = [current];
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
        if(char === quote) quote = '';
        else buffer += char;
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
        if(mode === MODE_TAGNAME) current = current[0];
        mode = current;
        (current = current[0]).push(CHILD_RECURSE, 0, mode);
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

var CACHES = new Map();

var regular = function(statics) {
  var tmp = CACHES.get(this);

  if(!tmp) {
    tmp = new Map();
    CACHES.set(this, tmp);
  }

  tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, (tmp = build(statics))), tmp), arguments, []);
  return tmp.length > 1 ? tmp : tmp[0];
};

var htm = MINI ? build : regular;
var html = htm.bind(createElement);

export function createRef() {
  return { current: null };
}

export {
  createElement,
  createElement as h,
  html,
  render,
  n as options,
  Component,
  Fragment,
  createContext,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useContext,
  useDebugValue
};

export function toChildArray(children, out) {
  out = out || [];
  if(children == null || typeof children == 'boolean') {
  } else if(Array.isArray(children)) {
    children.some(child => {
      toChildArray(child, out);
    });
  } else {
    out.push(children);
  }
  return out;
}
