import { useState as n, useReducer as t, useEffect as e, useLayoutEffect as r, useRef as u, useImperativeHandle as o, useMemo as i, useCallback as l, useContext as f, useDebugValue as c } from 'preact/hooks';
export * from 'preact/hooks';
import { Component as a, createElement as s, options as h, toChildArray as v, Fragment as d, render as p, hydrate as m, cloneElement as y, createRef as b, createContext as _ } from 'preact';
export { createElement, createContext, createRef, Fragment, Component } from 'preact';
function S(n, t) {
  for(var e in t) n[e] = t[e];
  return n;
}
function C(n, t) {
  for(var e in n) if('__source' !== e && !(e in t)) return !0;
  for(var r in t) if('__source' !== r && n[r] !== t[r]) return !0;
  return !1;
}
function E(n) {
  this.props = n;
}
function g(n, t) {
  function e(n) {
    var e = this.props.ref,
      r = e == n.ref;
    return !r && e && (e.call ? e(null) : (e.current = null)), t ? !t(this.props, n) || !r : C(this.props, n);
  }
  function r(t) {
    return (this.shouldComponentUpdate = e), s(n, t);
  }
  return (r.displayName = 'Memo(' + (n.displayName || n.name) + ')'), (r.prototype.isReactComponent = !0), (r.__f = !0), r;
}
((E.prototype = new a()).isPureReactComponent = !0),
  (E.prototype.shouldComponentUpdate = function(n, t) {
    return C(this.props, n) || C(this.state, t);
  });
var w = h.__b;
h.__b = function(n) {
  n.type && n.type.__f && n.ref && ((n.props.ref = n.ref), (n.ref = null)), w && w(n);
};
var R = ('undefined' != typeof Symbol && Symbol.for && Symbol.for('react.forward_ref')) || 3911;
function x(n) {
  function t(t, e) {
    var r = S({}, t);
    return delete r.ref, n(r, (e = t.ref || e) && ('object' != typeof e || 'current' in e) ? e : null);
  }
  return (t.$$typeof = R), (t.render = t), (t.prototype.isReactComponent = t.__f = !0), (t.displayName = 'ForwardRef(' + (n.displayName || n.name) + ')'), t;
}
var N = function(n, t) {
    return null == n ? null : v(v(n).map(t));
  },
  k = {
    map: N,
    forEach: N,
    count: function(n) {
      return n ? v(n).length : 0;
    },
    only: function(n) {
      var t = v(n);
      if(1 !== t.length) throw 'Children.only';
      return t[0];
    },
    toArray: v
  },
  A = h.__e;
h.__e = function(n, t, e) {
  if(n.then) for(var r, u = t; (u = u.__); ) if ((r = u.__c) && r.__c) return null == t.__e && ((t.__e = e.__e), (t.__k = e.__k)), r.__c(n, t);
  A(n, t, e);
};
var O = h.unmount;
function L() {
  (this.__u = 0), (this.t = null), (this.__b = null);
}
function U(n) {
  var t = n.__.__c;
  return t && t.__e && t.__e(n);
}
function F(n) {
  var t, e, r;
  function u(u) {
    if(
      (t ||
        (t = n()).then(
          function(n) {
            e = n.default || n;
          },
          function(n) {
            r = n;
          }
        ),
      r)
    )
      throw r;
    if(!e) throw t;
    return s(e, u);
  }
  return (u.displayName = 'Lazy'), (u.__f = !0), u;
}
function M() {
  (this.u = null), (this.o = null);
}
(h.unmount = function(n) {
  var t = n.__c;
  t && t.__R && t.__R(), t && !0 === n.__h && (n.type = null), O && O(n);
}),
  ((L.prototype = new a()).__c = function(n, t) {
    var e = t.__c,
      r = this;
    null == r.t && (r.t = []), r.t.push(e);
    var u = U(r.__v),
      o = !1,
      i = function() {
        o || ((o = !0), (e.__R = null), u ? u(l) : l());
      };
    e.__R = i;
    var l = function() {
        if(!--r.__u) {
          if(r.state.__e) {
            var n = r.state.__e;
            r.__v.__k[0] = (function n(t, e, r) {
              return (
                t &&
                  ((t.__v = null),
                  (t.__k =
                    t.__k &&
                    t.__k.map(function (t) {
                      return n(t, e, r);
                    })),
                  t.__c && t.__c.__P === e && (t.__e && r.insertBefore(t.__e, t.__d), (t.__c.__e = !0), (t.__c.__P = r))),
                t
              );
            })(n, n.__c.__P, n.__c.__O);
          }
          var t;
          for(r.setState({ __e: (r.__b = null) }); (t = r.t.pop()); ) t.forceUpdate();
        }
      },
      f = !0 === t.__h;
    r.__u++ || f || r.setState({ __e: (r.__b = r.__v.__k[0]) }), n.then(i, i);
  }),
  (L.prototype.componentWillUnmount = function() {
    this.t = [];
  }),
  (L.prototype.render = function(n, t) {
    if(this.__b) {
      if(this.__v.__k) {
        var e = document.createElement('div'),
          r = this.__v.__k[0].__c;
        this.__v.__k[0] = (function n(t, e, r) {
          return (
            t &&
              (t.__c &&
                t.__c.__H &&
                (t.__c.__H.__.forEach(function (n) {
                  'function' == typeof n.__c && n.__c();
                }),
                (t.__c.__H = null)),
              null != (t = S({}, t)).__c && (t.__c.__P === r && (t.__c.__P = e), (t.__c = null)),
              (t.__k =
                t.__k &&
                t.__k.map(function (t) {
                  return n(t, e, r);
                }))),
            t
          );
        })(this.__b, e, (r.__O = r.__P));
      }
      this.__b = null;
    }
    var u = t.__e && s(d, null, n.fallback);
    return u && (u.__h = null), [s(d, null, t.__e ? null : n.children), u];
  });
var T = function(n, t, e) {
  if((++e[1] === e[0] && n.o.delete(t), n.props.revealOrder && ('t' !== n.props.revealOrder[0] || !n.o.size)))
    for(e = n.u; e; ) {
      for(; e.length > 3; ) e.pop()();
      if(e[1] < e[0]) break;
      n.u = e = e[2];
    }
};
function D(n) {
  return (
    (this.getChildContext = function() {
      return n.context;
    }),
    n.children
  );
}
function I(n) {
  var t = this,
    e = n.i;
  (t.componentWillUnmount = function() {
    p(null, t.l), (t.l = null), (t.i = null);
  }),
    t.i && t.i !== e && t.componentWillUnmount(),
    n.__v
      ? (t.l ||
          ((t.i = e),
          (t.l = {
            nodeType: 1,
            parentNode: e,
            childNodes: [],
            appendChild: function(n) {
              this.childNodes.push(n), t.i.appendChild(n);
            },
            insertBefore: function(n, e) {
              this.childNodes.push(n), t.i.appendChild(n);
            },
            removeChild: function(n) {
              this.childNodes.splice(this.childNodes.indexOf(n) >>> 1, 1), t.i.removeChild(n);
            }
          })),
        p(s(D, { context: t.context }, n.__v), t.l))
      : t.l && t.componentWillUnmount();
}
function W(n, t) {
  return s(I, { __v: n, i: t });
}
((M.prototype = new a()).__e = function(n) {
  var t = this,
    e = U(t.__v),
    r = t.o.get(n);
  return (
    r[0]++,
    function(u) {
      var o = function() {
        t.props.revealOrder ? (r.push(u), T(t, n, r)) : u();
      };
      e ? e(o) : o();
    }
  );
}),
  (M.prototype.render = function(n) {
    (this.u = null), (this.o = new Map());
    var t = v(n.children);
    n.revealOrder && 'b' === n.revealOrder[0] && t.reverse();
    for(var e = t.length; e--; ) this.o.set(t[e], (this.u = [1, 0, this.u]));
    return n.children;
  }),
  (M.prototype.componentDidUpdate = M.prototype.componentDidMount =
    function() {
      var n = this;
      this.o.forEach(function (t, e) {
        T(n, e, t);
      });
    });
var j = ('undefined' != typeof Symbol && Symbol.for && Symbol.for('react.element')) || 60103,
  P =
    /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,
  V = function(n) {
    return ('undefined' != typeof Symbol && 'symbol' == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(n);
  };
function z(n, t, e) {
  return null == t.__k && (t.textContent = ''), p(n, t), 'function' == typeof e && e(), n ? n.__c : null;
}
function B(n, t, e) {
  return m(n, t), 'function' == typeof e && e(), n ? n.__c : null;
}
(a.prototype.isReactComponent = {}),
  ['componentWillMount', 'componentWillReceiveProps', 'componentWillUpdate'].forEach(function (n) {
    Object.defineProperty(a.prototype, n, {
      configurable: !0,
      get: function() {
        return this['UNSAFE_' + n];
      },
      set: function(t) {
        Object.defineProperty(this, n, { configurable: !0, writable: !0, value: t });
      }
    });
  });
var H = h.event;
function Z() {}
function Y() {
  return this.cancelBubble;
}
function $() {
  return this.defaultPrevented;
}
h.event = function(n) {
  return H && (n = H(n)), (n.persist = Z), (n.isPropagationStopped = Y), (n.isDefaultPrevented = $), (n.nativeEvent = n);
};
var q,
  G = {
    configurable: !0,
    get: function() {
      return this.class;
    }
  },
  J = h.vnode;
h.vnode = function(n) {
  var t = n.type,
    e = n.props,
    r = e;
  if('string' == typeof t) {
    for(var u in ((r = {}), e)) {
      var o = e[u];
      ('value' === u && 'defaultValue' in e && null == o) ||
        ('defaultValue' === u && 'value' in e && null == e.value
          ? (u = 'value')
          : 'download' === u && !0 === o
          ? (o = '')
          : /ondoubleclick/i.test(u)
          ? (u = 'ondblclick')
          : /^onchange(textarea|input)/i.test(u + t) && !V(e.type)
          ? (u = 'oninput')
          : /^on(Ani|Tra|Tou|BeforeInp)/.test(u)
          ? (u = u.toLowerCase())
          : P.test(u)
          ? (u = u.replace(/[A-Z0-9]/, '-$&').toLowerCase())
          : null === o && (o = void 0),
        (r[u] = o));
    }
    'select' == t &&
      r.multiple &&
      Array.isArray(r.value) &&
      (r.value = v(e.children).forEach(function (n) {
        n.props.selected = -1 != r.value.indexOf(n.props.value);
      })),
      'select' == t &&
        null != r.defaultValue &&
        (r.value = v(e.children).forEach(function (n) {
          n.props.selected = r.multiple ? -1 != r.defaultValue.indexOf(n.props.value) : r.defaultValue == n.props.value;
        })),
      (n.props = r);
  }
  t && e.class != e.className && ((G.enumerable = 'className' in e), null != e.className && (r.class = e.className), Object.defineProperty(r, 'className', G)), (n.$$typeof = j), J && J(n);
};
var K = h.__r;
h.__r = function(n) {
  K && K(n), (q = n.__c);
};
var Q = {
    ReactCurrentDispatcher: {
      current: {
        readContext: function(n) {
          return q.__n[n.__c].props.value;
        }
      }
    }
  },
  X = '17.0.2';
function nn(n) {
  return s.bind(null, n);
}
function tn(n) {
  return !!n && n.$$typeof === j;
}
function en(n) {
  return tn(n) ? y.apply(null, arguments) : n;
}
function rn(n) {
  return !!n.__k && (p(null, n), !0);
}
function un(n) {
  return (n && (n.base || (1 === n.nodeType && n))) || null;
}
var on = function(n, t) {
    return n(t);
  },
  ln = function(n, t) {
    return n(t);
  },
  fn = d;
export default {
  useState: n,
  useReducer: t,
  useEffect: e,
  useLayoutEffect: r,
  useRef: u,
  useImperativeHandle: o,
  useMemo: i,
  useCallback: l,
  useContext: f,
  useDebugValue: c,
  version: '17.0.2',
  Children: k,
  render: z,
  hydrate: B,
  unmountComponentAtNode: rn,
  createPortal: W,
  createElement: s,
  createContext: _,
  createFactory: nn,
  cloneElement: en,
  createRef: b,
  Fragment: d,
  isValidElement: tn,
  findDOMNode: un,
  Component: a,
  PureComponent: E,
  memo: g,
  forwardRef: x,
  flushSync: ln,
  unstable_batchedUpdates: on,
  StrictMode: d,
  Suspense: L,
  SuspenseList: M,
  lazy: F,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: Q
};
export {
  X as version,
  k as Children,
  z as render,
  B as hydrate,
  rn as unmountComponentAtNode,
  W as createPortal,
  nn as createFactory,
  en as cloneElement,
  tn as isValidElement,
  un as findDOMNode,
  E as PureComponent,
  g as memo,
  x as forwardRef,
  ln as flushSync,
  on as unstable_batchedUpdates,
  fn as StrictMode,
  L as Suspense,
  M as SuspenseList,
  F as lazy,
  Q as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
};
//# sourceMappingURL=compat.module.js.map
