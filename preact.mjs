var n,
  u,
  i,
  t,
  o,
  r,
  f = {},
  e = [],
  c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

function s(n, l) {
  for(var u in l) {
    n[u] = l[u];
  }

  return n;
}

function a(n) {
  var l = n.parentNode;
  l && l.removeChild(n);
}

function h(n, l, u) {
  var i,
    t,
    o,
    r = arguments,
    f = {};

  for(o in l) {
    'key' == o ? (i = l[o]) : 'ref' == o ? (t = l[o]) : (f[o] = l[o]);
  }

  if(arguments.length > 3) {
    for(u = [u], o = 3; o < arguments.length; o++) {
      u.push(r[o]);
    }
  }
  if((null != u && (f.children = u), 'function' == typeof n && null != n.defaultProps)) {
    for(o in n.defaultProps) {
      void 0 === f[o] && (f[o] = n.defaultProps[o]);
    }
  }
  return v(n, f, i, t, null);
}

function v(l, u, i, t, o) {
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

function p(n) {
  return n.children;
}

function Component(n, l) {
  (this.props = n), (this.context = l);
}

function _(n, l) {
  if(null == l) {
    return n.__ ? _(n.__, n.__.__k.indexOf(n) + 1) : null;
  }

  for(var u; l < n.__k.length; l++) {
    if(null != (u = n.__k[l]) && null != u.__e) {
      return u.__e;
    }
  }

  return 'function' == typeof n.type ? _(n) : null;
}

function w(n) {
  var l, u;

  if(null != (n = n.__) && null != n.__c) {
    for(n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) {
      if(null != (u = n.__k[l]) && null != u.__e) {
        n.__e = n.__c.base = u.__e;
        break;
      }
    }

    return w(n);
  }
}

function k(l) {
  ((!l.__d && (l.__d = !0) && u.push(l) && !g.__r++) || t !== n.debounceRendering) &&
    ((t = n.debounceRendering) || i)(g);
}

function g() {
  for(var n; (g.__r = u.length); ) {
    (n = u.sort(function (n, l) {
      return n.__v.__b - l.__v.__b;
    })),
      (u = []),
      n.some(function (n) {
        var l, u, i, t, o, r, f;
        n.__d &&
          ((r = (o = (l = n).__v).__e),
          (f = l.__P) &&
            ((u = []),
            ((i = s({}, o)).__v = i),
            (t = $(
              f,
              o,
              i,
              l.__n,
              void 0 !== f.ownerSVGElement,
              null != o.__h ? [r] : null,
              u,
              null == r ? _(o) : r,
              o.__h
            )),
            j(u, o),
            t != r && w(o)));
      });
  }
}

function m(n, l, u, i, t, o, r, c, s, h) {
  var y,
    d,
    w,
    k,
    g,
    m,
    b,
    A = (i && i.__k) || e,
    P = A.length;

  for(s == f && (s = null != r ? r[0] : P ? _(i, 0) : null), u.__k = [], y = 0; y < l.length; y++) {
    if(
      null !=
      (k = u.__k[y] =
        null == (k = l[y]) || 'boolean' == typeof k
          ? null
          : 'string' == typeof k || 'number' == typeof k
          ? v(null, k, null, null, k)
          : Array.isArray(k)
          ? v(
              p,
              {
                children: k
              },
              null,
              null,
              null
            )
          : null != k.__e || null != k.__c
          ? v(k.type, k.props, k.key, null, k.__v)
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
      (g = $(n, k, (w = w || f), t, o, r, c, s, h)),
        (d = k.ref) && w.ref != d && (b || (b = []), w.ref && b.push(w.ref, null, k), b.push(d, k.__c || g, k)),
        null != g
          ? (null == m && (m = g),
            (s = x(n, k, w, A, r, g, s)),
            h || 'option' != u.type ? 'function' == typeof u.type && (u.__d = s) : (n.value = ''))
          : s && w.__e == s && s.parentNode != n && (s = _(w));
    }
  }

  if(((u.__e = m), null != r && 'function' != typeof u.type)) {
    for(y = r.length; y--; ) {
      null != r[y] && a(r[y]);
    }
  }

  for(y = P; y--; ) {
    null != A[y] && L(A[y], A[y]);
  }

  if(b) {
    for(y = 0; y < b.length; y++) {
      I(b[y], b[++y], b[++y]);
    }
  }
}

function x(n, l, u, i, t, o, r) {
  var f, e, c;
  if(void 0 !== l.__d) {
    (f = l.__d), (l.__d = void 0);
  } else if(t == u || o != r || null == o.parentNode) {
    n: if(null == r || r.parentNode !== n) {
      n.appendChild(o), (f = null);
    } else {
      for(e = r, c = 0; (e = e.nextSibling) && c < i.length; c += 2) {
        if(e == o) {
          break n;
        }
      }

      n.insertBefore(o, r), (f = r);
    }
  }
  return void 0 !== f ? f : o.nextSibling;
}

function A(n, l, u, i, t) {
  var o;

  for(o in u) {
    'children' === o || 'key' === o || o in l || C(n, o, null, u[o], i);
  }

  for(o in l) {
    (t && 'function' != typeof l[o]) ||
      'children' === o ||
      'key' === o ||
      'value' === o ||
      'checked' === o ||
      u[o] === l[o] ||
      C(n, o, l[o], u[o], i);
  }
}

function P(n, l, u) {
  '-' === l[0] ? n.setProperty(l, u) : (n[l] = null == u ? '' : 'number' != typeof u || c.test(l) ? u : u + 'px');
}

function C(n, l, u, i, t) {
  var o, r, f;
  if((t && 'className' == l && (l = 'class'), 'style' === l)) {
    if('string' == typeof u) {
      n.style.cssText = u;
    } else {
      if(('string' == typeof i && (n.style.cssText = i = ''), i)) {
        for(l in i) {
          (u && l in u) || P(n.style, l, '');
        }
      }
      if(u) {
        for(l in u) {
          (i && u[l] === i[l]) || P(n.style, l, u[l]);
        }
      }
    }
  } else {
    'o' === l[0] && 'n' === l[1]
      ? ((o = l !== (l = l.replace(/Capture$/, ''))),
        (r = l.toLowerCase()) in n && (l = r),
        (l = l.slice(2)),
        n.l || (n.l = {}),
        (n.l[l + o] = u),
        (f = o ? N : z),
        u ? i || n.addEventListener(l, f, o) : n.removeEventListener(l, f, o))
      : 'list' !== l &&
        'tagName' !== l &&
        'form' !== l &&
        'type' !== l &&
        'size' !== l &&
        'download' !== l &&
        'href' !== l &&
        !t &&
        l in n
      ? (n[l] = null == u ? '' : u)
      : 'function' != typeof u &&
        'dangerouslySetInnerHTML' !== l &&
        (l !== (l = l.replace(/xlink:?/, ''))
          ? null == u || !1 === u
            ? n.removeAttributeNS('http://www.w3.org/1999/xlink', l.toLowerCase())
            : n.setAttributeNS('http://www.w3.org/1999/xlink', l.toLowerCase(), u)
          : null == u || (!1 === u && !/^ar/.test(l))
          ? n.removeAttribute(l)
          : n.setAttribute(l, u));
  }
}

function z(l) {
  this.l[l.type + !1](n.event ? n.event(l) : l);
}

function N(l) {
  this.l[l.type + !0](n.event ? n.event(l) : l);
}

function T(n, l, u) {
  var i, t;

  for(i = 0; i < n.__k.length; i++) {
    (t = n.__k[i]) &&
      ((t.__ = n),
      t.__e &&
        ('function' == typeof t.type && t.__k.length > 1 && T(t, l, u),
        (l = x(u, t, t, n.__k, null, t.__e, l)),
        'function' == typeof n.type && (n.__d = l)));
  }
}

function $(l, u, i, t, o, r, f, e, c) {
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
    n: if('function' == typeof P) {
      if(
        ((g = u.props),
        (b = (a = P.contextType) && t[a.__c]),
        (x = a ? (b ? b.props.value : a.__) : t),
        i.__c
          ? (k = (h = u.__c = i.__c).__ = h.__E)
          : ('prototype' in P && P.prototype.render
              ? (u.__c = h = new P(g, x))
              : ((u.__c = h = new Component(g, x)), (h.constructor = P), (h.render = M)),
            b && b.sub(h),
            (h.props = g),
            h.state || (h.state = {}),
            (h.context = x),
            (h.__n = t),
            (v = h.__d = !0),
            (h.__h = [])),
        null == h.__s && (h.__s = h.state),
        null != P.getDerivedStateFromProps &&
          (h.__s == h.state && (h.__s = s({}, h.__s)), s(h.__s, P.getDerivedStateFromProps(g, h.__s))),
        (y = h.props),
        (_ = h.state),
        v)
      ) {
        null == P.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(),
          null != h.componentDidMount && h.__h.push(h.componentDidMount);
      } else {
        if(
          (null == P.getDerivedStateFromProps &&
            g !== y &&
            null != h.componentWillReceiveProps &&
            h.componentWillReceiveProps(g, x),
          (!h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(g, h.__s, x)) || u.__v === i.__v)
        ) {
          (h.props = g),
            (h.state = h.__s),
            u.__v !== i.__v && (h.__d = !1),
            (h.__v = u),
            (u.__e = i.__e),
            (u.__k = i.__k),
            h.__h.length && f.push(h),
            T(u, e, l);
          break n;
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
        null != h.getChildContext && (t = s(s({}, t), h.getChildContext())),
        v || null == h.getSnapshotBeforeUpdate || (w = h.getSnapshotBeforeUpdate(y, _)),
        (A = null != a && a.type == p && null == a.key ? a.props.children : a),
        m(l, Array.isArray(A) ? A : [A], u, i, t, o, r, f, e, c),
        (h.base = u.__e),
        (u.__h = null),
        h.__h.length && f.push(h),
        k && (h.__E = h.__ = null),
        (h.__e = !1);
    } else {
      null == r && u.__v === i.__v ? ((u.__k = i.__k), (u.__e = i.__e)) : (u.__e = H(i.__e, u, i, t, o, r, f, c));
    }

    (a = n.diffed) && a(u);
  } catch(l) {
    (u.__v = null), (c || null != r) && ((u.__e = e), (u.__h = !!c), (r[r.indexOf(e)] = null)), n.__e(l, u, i);
  }

  return u.__e;
}

function j(l, u) {
  n.__c && n.__c(u, l),
    l.some(function (u) {
      try {
        (l = u.__h),
          (u.__h = []),
          l.some(function (n) {
            n.call(u);
          });
      } catch(l) {
        n.__e(l, u.__v);
      }
    });
}

function H(n, l, u, i, t, o, r, c) {
  var s,
    a,
    h,
    v,
    y,
    p = u.props,
    d = l.props;
  if(((t = 'svg' === l.type || t), null != o)) {
    for(s = 0; s < o.length; s++) {
      if(null != (a = o[s]) && ((null === l.type ? 3 === a.nodeType : a.localName === l.type) || n == a)) {
        (n = a), (o[s] = null);
        break;
      }
    }
  }

  if(null == n) {
    if(null === l.type) {
      return document.createTextNode(d);
    }
    (n = t
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
    p === d || (c && n.data === d) || (n.data = d);
  } else {
    if(
      (null != o && (o = e.slice.call(n.childNodes)),
      (h = (p = u.props || f).dangerouslySetInnerHTML),
      (v = d.dangerouslySetInnerHTML),
      !c)
    ) {
      if(null != o) {
        for(p = {}, y = 0; y < n.attributes.length; y++) {
          p[n.attributes[y].name] = n.attributes[y].value;
        }
      }
      (v || h) &&
        ((v && ((h && v.__html == h.__html) || v.__html === n.innerHTML)) || (n.innerHTML = (v && v.__html) || ''));
    }

    A(n, d, p, t, c),
      v
        ? (l.__k = [])
        : ((s = l.props.children),
          m(n, Array.isArray(s) ? s : [s], l, u, i, 'foreignObject' !== l.type && t, o, r, f, c)),
      c ||
        ('value' in d &&
          void 0 !== (s = d.value) &&
          (s !== n.value || ('progress' === l.type && !s)) &&
          C(n, 'value', s, p.value, !1),
        'checked' in d && void 0 !== (s = d.checked) && s !== n.checked && C(n, 'checked', s, p.checked, !1));
  }
  return n;
}

function I(l, u, i) {
  try {
    'function' == typeof l ? l(u) : (l.current = u);
  } catch(l) {
    n.__e(l, i);
  }
}

function L(l, u, i) {
  var t, o, r;

  if(
    (n.unmount && n.unmount(l),
    (t = l.ref) && ((t.current && t.current !== l.__e) || I(t, null, u)),
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
      t[r] && L(t[r], u, i);
    }
  }
  null != o && a(o);
}

function M(n, l, u) {
  return this.constructor(n, u);
}

function render(l, u, i) {
  var t, r, c;
  n.__ && n.__(l, u),
    (r = (t = i === o) ? null : (i && i.__k) || u.__k),
    (l = h(p, null, [l])),
    (c = []),
    $(
      u,
      ((t ? u : i || u).__k = l),
      r || f,
      f,
      void 0 !== u.ownerSVGElement,
      i && !t ? [i] : r ? null : u.childNodes.length ? e.slice.call(u.childNodes) : null,
      c,
      i || f,
      t
    ),
    j(c, l);
}

export function cloneElement(vnode, props, children) {
  var arguments$1 = arguments;
  var normalizedProps = s({}, vnode.props),
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

  return v(vnode.type, normalizedProps, key || vnode.key, ref || vnode.ref, null);
}

function createContext(n, l) {
  var u = {
    __c: (l = '__cC' + r++),
    __: n,
    Consumer: function(n, l) {
      return n.children(l);
    },
    Provider: function(n, u, i) {
      return (
        this.getChildContext ||
          ((u = []),
          ((i = {})[l] = this),
          (this.getChildContext = function() {
            return i;
          }),
          (this.shouldComponentUpdate = function(n) {
            this.props.value !== n.value && u.some(k);
          }),
          (this.sub = function(n) {
            u.push(n);
            var l = n.componentWillUnmount;

            n.componentWillUnmount = function() {
              u.splice(u.indexOf(n), 1), l && l.call(n);
            };
          })),
        n.children
      );
    }
  };
  return (u.Provider.__ = u.Consumer.contextType = u);
}

n = {
  __e: function(n, l) {
    for(var u, i, t, o = l.__h; (l = l.__); ) {
      if((u = l.__c) && !u.__) {
        try {
          if(
            ((i = u.constructor) &&
              null != i.getDerivedStateFromError &&
              (u.setState(i.getDerivedStateFromError(n)), (t = u.__d)),
            null != u.componentDidCatch && (u.componentDidCatch(n), (t = u.__d)),
            t)
          ) {
            return (l.__h = o), (u.__E = u);
          }
        } catch(l) {
          n = l;
        }
      }
    }

    throw n;
  }
};

(Component.prototype.setState = function(n, l) {
  var u;
  (u = null != this.__s && this.__s !== this.state ? this.__s : (this.__s = s({}, this.state))),
    'function' == typeof n && (n = n(s({}, u), this.props)),
    n && s(u, n),
    null != n && this.__v && (l && this.__h.push(l), k(this));
}),
  (Component.prototype.forceUpdate = function(n) {
    this.__v && ((this.__e = !0), n && this.__h.push(n), k(this));
  }),
  (Component.prototype.render = p),
  (u = []),
  (i = 'function' == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
  (g.__r = 0),
  (o = f),
  (r = 0);

var t$1,
  u$1,
  r$1,
  o$1 = 0,
  i$1 = [],
  c$1 = n.__r,
  f$1 = n.diffed,
  e$1 = n.__c,
  a$1 = n.unmount;

function v$1(t, r) {
  n.__h && n.__h(u$1, t, o$1 || r), (o$1 = 0);
  var i =
    u$1.__H ||
    (u$1.__H = {
      __: [],
      __h: []
    });
  return t >= i.__.length && i.__.push({}), i.__[t];
}

function useState(n$$1) {
  return (o$1 = 1), useReducer(k$1, n$$1);
}

function useReducer(n$$1, r, o) {
  var i = v$1(t$1++, 2);
  return (
    (i.t = n$$1),
    i.__c ||
      ((i.__ = [
        o ? o(r) : k$1(void 0, r),
        function(n$$1) {
          var t = i.t(i.__[0], n$$1);
          i.__[0] !== t && ((i.__ = [t, i.__[1]]), i.__c.setState({}));
        }
      ]),
      (i.__c = u$1)),
    i.__
  );
}

function useEffect(r, o) {
  var i = v$1(t$1++, 3);
  !n.__s && j$1(i.__H, o) && ((i.__ = r), (i.__H = o), u$1.__H.__h.push(i));
}

function useLayoutEffect(r, o) {
  var i = v$1(t$1++, 4);
  !n.__s && j$1(i.__H, o) && ((i.__ = r), (i.__H = o), u$1.__h.push(i));
}

function useRef(n$$1) {
  return (
    (o$1 = 5),
    useMemo(function () {
      return {
        current: n$$1
      };
    }, [])
  );
}

function useImperativeHandle(n$$1, t, u) {
  (o$1 = 6),
    l$1(
      function() {
        'function' == typeof n$$1 ? n$$1(t()) : n$$1 && (n$$1.current = t());
        console.log('Ruler ref:', n$$1);
      },
      null == u ? u : u.concat(n$$1)
    );
}

function useMemo(n$$1, u) {
  var r = v$1(t$1++, 7);
  return j$1(r.__H, u) && ((r.__ = n$$1()), (r.__H = u), (r.__h = n$$1)), r.__;
}

function useCallback(n$$1, t) {
  return (
    (o$1 = 8),
    useMemo(function () {
      return n$$1;
    }, t)
  );
}

function useContext(n$$1) {
  var r = u$1.context[n$$1.__c],
    o = v$1(t$1++, 9);
  return (o.__c = n$$1), r ? (null == o.__ && ((o.__ = !0), r.sub(u$1)), r.props.value) : n$$1.__;
}

function useDebugValue(t, u) {
  n.useDebugValue && n.useDebugValue(u ? u(t) : t);
}

function q$1() {
  i$1.forEach(function (t) {
    if(t.__P) {
      try {
        t.__H.__h.forEach(b$1), t.__H.__h.forEach(g$1), (t.__H.__h = []);
      } catch(u) {
        (t.__H.__h = []), n.__e(u, t.__v);
      }
    }
  }),
    (i$1 = []);
}

(n.__r = function(n$$1) {
  c$1 && c$1(n$$1), (t$1 = 0);
  var r = (u$1 = n$$1.__c).__H;
  r && (r.__h.forEach(b$1), r.__h.forEach(g$1), (r.__h = []));
}),
  (n.diffed = function(t) {
    f$1 && f$1(t);
    var u = t.__c;
    u &&
      u.__H &&
      u.__H.__h.length &&
      ((1 !== i$1.push(u) && r$1 === n.requestAnimationFrame) ||
        (
          (r$1 = n.requestAnimationFrame) ||
          function(n$$1) {
            var t,
              u = function() {
                clearTimeout(r), x$1 && cancelAnimationFrame(t), setTimeout(n$$1);
              },
              r = setTimeout(u, 100);

            x$1 && (t = requestAnimationFrame(u));
          }
        )(q$1));
  }),
  (n.__c = function(t, u) {
    u.some(function (t) {
      try {
        t.__h.forEach(b$1),
          (t.__h = t.__h.filter(function (n$$1) {
            return !n$$1.__ || g$1(n$$1);
          }));
      } catch(r) {
        u.some(function (n$$1) {
          n$$1.__h && (n$$1.__h = []);
        }),
          (u = []),
          n.__e(r, t.__v);
      }
    }),
      e$1 && e$1(t, u);
  }),
  (n.unmount = function(t) {
    a$1 && a$1(t);
    var u = t.__c;
    if(u && u.__H) {
      try {
        u.__H.__.forEach(b$1);
      } catch(t) {
        n.__e(t, u.__v);
      }
    }
  });
var x$1 = 'function' == typeof requestAnimationFrame;

function b$1(n$$1) {
  'function' == typeof n$$1.__c && n$$1.__c();
}

function g$1(n$$1) {
  n$$1.__c = n$$1.__();
}

function j$1(n$$1, t) {
  return (
    !n$$1 ||
    n$$1.length !== t.length ||
    t.some(function (t, u) {
      return t !== n$$1[u];
    })
  );
}

function k$1(n$$1, t) {
  return 'function' == typeof t ? t(n$$1) : t;
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
var evaluate = function(h, built, fields, args) {
  var tmp; // `build()` used the first element of the operation list as
  // temporary workspace. Now that `build()` is done we can use
  // that space to track whether the current element is "dynamic"
  // (i.e. it or any of its descendants depend on dynamic values).

  built[0] = 0;

  for(var i = 1; i < built.length; i++) {
    var type = built[i++]; // Set `built[0]`'s appropriate bits if this element depends on a dynamic value.

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
var build = function(statics) {
  var mode = MODE_TEXT;
  var buffer = '';
  var quote = '';
  var current = [0];
  var char, propName;

  var commit = function(field) {
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

  for(var i = 0; i < statics.length; i++) {
    if(i) {
      if(mode === MODE_TEXT) {
        commit();
      }

      commit(i);
    }

    for(var j = 0; j < statics[i].length; j++) {
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
var html = htm.bind(h);

export const Fragment = props => props.children;

export function createRef() {
  return { current: null };
}


export {
  h,
  html,
  render,
  n as options,
  Component,
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


/**
 * Flatten and loop through the children of a virtual node
 * @param {import('../index').ComponentChildren} children The unflattened
 * children of a virtual node
 * @returns {import('../internal').VNode[]}
 */
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
