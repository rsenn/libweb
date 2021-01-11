/**
 * Savage JS
 *
 * Smallest Available Vector Aggregator Graphing Enabler
 *
 * http://strathausen.github.io/savage/
 */
/*
 * TODO support sets / groups
 * TODO remove element
 * TODO support for xlink
 * TODO propper text support
 */
(function (D, W) {
  let xl = 'http://www.w3.org/1999/xlink',
    xm = 'http://www.w3.org/2000/svg',
    each = function (o, f) {
      for (let k in o) if (o.hasOwnProperty(k)) f(o[k], k);
    },
    attr = function (e, a) {
      each(a, (v, k) => {
        e.setAttribute(k, v);
      });
    };

  /**
   * @argument Element string/dom the dom element for the svg canvas
   * @argument height number height of the svg canvas
   * @argument width number width of the svg canvas
   */
  let S = function (E, h, w) {
    if (typeof E === 'string') {
      E = D.querySelector(E);
    }
    let cnv = el('svg', { height: h, width: w, version: 1.1, xmlns: xm });
    E.appendChild(cnv);
    this.E = cnv;
  };

  /**
   * @argument type string svg element to be drawn e.g. circle, rect, ...
   * @argument attributes object attributes of the svg element
   */
  var el = function (t, a) {
    let e = D.createElementNS(xm, t);
    attr(e, a);
    a.hasOwnProperty('content') && (e.textContent = a.content);
    return e;
  };

  let P = S.prototype;

  /**
   * @argument type string svg element to be drawn e.g. circle, rect, ...
   * @argument attributes object attributes of the svg element
   * @public
   */
  P.draw = function (t, a) {
    let e = el(t, a);
    this.E.appendChild(e);
    return new Element(e);
  };

  /**
   * shortcut functions for all the shapes
   */
  [
    'circle',
    'ellipse',
    'image',
    'line',
    'marker',
    'path',
    'polygon',
    'radialGradient',
    'rect',
    'text',
    'tspan'
  ].forEach((t) => {
    P[t] = function (a) {
      return this.draw(t, a);
    };
  });

  var Element = function (e) {
    this.node = e;
  };

  let PE = Element.prototype;
  PE.attr = function (a) {
    attr(this.node, a);
    return this;
  };

  W.Savage = S;
})(document, window);
