//import React from "react";
//import ReactDOM from "react-dom";
//prettier-ignore
import dom, { CSS, CSSTransformSetters, Element, ElementRectProxy, ElementSizeProps, ElementTransformation, ElementXYProps, Line, Matrix, Point, PointList, Rect, Size, SVG, Timer, Node, isElement } from './dom.js';
//import { SvgOverlay, SvgPathTracer } from "./svg/overlay.js";
//import { SvgPath } from "./svg/path.js";
import Util from './util.js';
//import { toJS } from "mobx";
import { trkl } from './trkl.js';
import HashList from './container/hashList.js';
import { makeLocalStorage } from './autoStore.js';

//var root = global.window ? window : global;

const env = 'development';

if(0 && ['development', 'test', 'local'].indexOf(env) != -1 && 'window' in global) {
  window.accumulateClasses = () => {
    let st = storage('dev');
    let classes = st.get('classes') || [];
    let newClasses = dom.Element.walk(
      document.body,
      (e, acc) => {
        acc.push(e.getAttribute('class'));
        return acc;
      },
      []
    )
      .join(' ')
      .split(/\s+/g)
      .unique()
      .match(/bp3/);
    dom.Element.findAll('*[class~=bp3]').forEach(e => newClasses.concat(String(e.class).split(/ /g)));
    newClasses = newClasses.filter(i => classes.indexOf(i) == -1);
    if(newClasses.length) {
      st.set('classes', (classes = Util.unique(classes.concat(newClasses))));
      Util.log('dev.classes ', newClasses);
    }
    return newClasses;
  };

  /*
  window.addEventListener('load', () => {
    Timer.once(3000, () => {
      Util.log('running accumulateClasses');
      accumulateClasses();
    });
  });*/
}

if(!Array.prototype.back) {
  try {
    Util.defineGetterSetter(
      Array.prototype,
      'back',
      function() {
        return this.length > 0 ? this[this.length - 1] : undefined;
      },
      function(value) {
        if(this.length > 0) this[this.length - 1] = value;
        else this.push(value);
        return this;
      },
      false
    );
  } catch(error) {}
}

if(!Array.prototype.front) {
  try {
    Util.defineGetterSetter(
      Array.prototype,
      'front',
      function() {
        return this.length > 0 ? this[0] : undefined;
      },
      function(value) {
        if(this.length > 0) this[this.length - 1] = value;
        else this.push(value);
        return this;
      },
      false
    );
  } catch(error) {}
}

export function stylesheets() {
  let r = Util.map(document.styleSheets, (s, i) => {
    Util.log('i: ', i, ' s: ', s);

    [...s.cssRules].map(r => r.cssText);
  });
  Util.log('Util.stylesheets() ', r);
  return r;
}

export const colors = (() => {
  let stepX = 20;
  let elements = [];
  return function colors(map, opts) {
    let args = Util.map(map);
    args = args.map(arg => new RGBA(arg));

    opts = opts || { height: 322, width: 80 };

    let count = args.length;
    Util.log('colors map(', args, ')');
    const left = elements.length ? Element.rect(elements[0]).x2 + stepX : stepX;

    let dim = Element.rect('.item-box-size') || new Rect(opts);
    let e = Element.create('div', {
      parent: Element.find('body'),
      class: 'colors-palette',
      style: {
        position: 'absolute',
        left: left + 'px',
        top: '134px',
        width: `${opts.width}px`,
        height: `${dim.height || opts.height}px`,
        zIndex: 100000
      }
    });
    let f = Element.factory({}, e);
    let prev = 0;
    let entries = args.entries();
    let i = 0,
      len = entries.length;
    for(let [key, color] of entries) {
      let diff = key - prev;
      prev = key;
      const c = new RGBA(color.r, color.g, color.b, color.a);

      //Util.log("%c colors ", `background-color: ${c.toString()}`, { key, c });

      f('div', {
        innerHTML: `<div class="colors-text" style="opacity:0;">${((typeof key == 'number' ? key.toFixed(2) : key) + ': ' + c.toString()).replace(/ /g, '&nbsp;')}</div>`,
        class: 'colors-item',
        style: {
          margin: 'auto',
          //opacity: c.a / 255,
          height: `${opts.height / 16}px`,
          overflow: 'hidden',
          fontFamily: 'Arial',
          fontSize: '0.4em',
          fontWeight: 'bold',
          color: c.toHSLA().l > 50 ? 'black' : 'white',
          backgroundColor: c.toString(),
          display: 'flex',
          padding: '2px',
          justifyContent: 'flex-start',
          alignItems: 'center',
          transition: 'opacity 1s linear'
        }
      });
    }
    elements.unshift(e);
    return e;
  };
})();

export async function getStars() {
  let r = {};
  r.bg_stars = dom.Element.find('#background-stars') || (await img('background-stars'));
  r.elements = dom.Element.findAll('defs > radialGradient > stop', r.bg_stars)
    .map(s => s.parentElement)
    .unique();
  r.gradients = r.elements.map(gr => gradient(gr));

  r.svg = r.elements[0].parentNode.parentNode;

  function getRect(e) {
    //return dom.Element.rect(e);
    let matrix = new dom.Matrix(e.getAttribute('transform'));
    let rect = dom.SVG.bbox(e);
    rect = matrix.transform_rect(rect);
    Util.log('getRect: ', { matrix, rect });
    return rect;
  }
  r.paths = dom.Element.findAll('path', r.svg).filter(e => getRect(e).isSquare());
  r.circles = r.paths.map(e => ({
    position: getRect(e).center,
    radius: getRect(e).width / 2
  }));
  r.points = new PointList(r.paths.map(e => getRect(e).center));
  r.radii = r.paths.map(e => getRect(e).width / 2);
  r.putStars = function() {
    let gr = this.gradients[0].element;
    gr.getAttributeNames()
      .filter(name => name != 'id')
      .forEach(name => gr.removeAttribute(name));
    this.paths.forEach(e => e.parentElement.removeChild(e));

    return (this.stars = this.circles.map(c =>
      dom.SVG.create(
        'circle',
        {
          cx: c.position.x.toFixed(3),
          cy: c.position.y.toFixed(3),
          r: c.radius.toFixed(3),
          fill: 'url(#' + gr.getAttribute('id') + ')',
          style: 'mix-blend-mode: screen'
        },
        this.svg
      )
    ));
  };
  return r;
}

/*

  black = new dom.RGBA(0,0,0,255);
  to_a = function *() { for(let s of rg.steps) yield [s.offset, s.color.toAlpha(black)]; }
  steps = new Map(to_a());
  [...elements[2].children].forEach((e,i) => {
    let offset = parseFloat(e.getAttribute('offset'));
    let step = rg.steps[i];
    let color = step.color.toAlpha(black);

    e.setAttribute('stop-color', color.toString(255));
    e.setAttribute('stop-opacity', (color.a/255).toFixed(3));

    Util.log('offset:',step.offset, ' color:',color, ' element: ', e);
  });


  palette = colors(steps);
*/

export function gradient(element) {
  let e = Element.find(element);
  let arr = gradient.list || (gradient.list = []);
  let line = new Line(Element.attr(e, ['x1', 'y1', 'x2', 'y2']));
  let nodes = [...e.querySelectorAll('stop')];
  let obj = {
    line,
    element,
    steps: nodes.map(e => {
      const offset = Element.attr(e, 'offset');
      const color = RGBA.fromHex(e.getAttribute('stopColor') || e.getAttribute('stop-color') || '#00000000');
      return {
        color,
        offset,
        toString() {
          return RGBA.toHex(this.color) + ' ' + this.offset * 100 + '%';
        }
      };
    }),
    toString() {
      return Util.decamelize(e.tagName) + '(0deg, ' + this.steps.map(s => s.toString()).join(', ') + ');';
    },
    [Symbol.iterator]: () =>
      new (class GradientIterator {
        index = 0;
        next() {
          const { offset, color } = obj.steps[this.index] || {};
          return {
            value: [offset, color],
            done: this.index++ >= obj.steps.length
          };
        }
      })(),
    getColors() {
      return Util.reduce(this.steps, (acc, step) => ({
        ...acc,
        [step.offset]: step.color
      }));
    }
  };
  Util.log('obj: ', obj);
  arr.push(obj);
  return obj;
  //linear-gradient(0deg, #d70518 0%, #be071b 100%);
}

export function starAnim() {
  //let s = svg([ 300, 300 ]);
  let page = Element.find('body');
  let rect = Element.rect(page);
  starAnim.f = Element.factory({}, page);
  let s = starAnim.f;
  let c = s('div', {
    style: {
      zIndex: 99999,
      ...Rect.toCSS(rect),
      top: 0,
      position: 'fixed',
      backgroundColor: '#ff000000'
    }
  });
  let f = SVG.factory(c, Size(rect));
  /* Element.attr(c.root, { width: '100%', height: '100%' });
Element.setCSS(c.root, { width: '100%', height: '100%' });
*/ let r = 100;
  const edges = 5 * 2;
  const MakePointList = r => {
    let ret = new PointList();
    for(let i = 0; i < edges; i++) {
      let angle = (Math.PI * 2 * i) / edges;
      const rad = r[i & 1];
      let pt = new Point(Math.cos(angle) * rad, Math.sin(angle) * rad);
      ret.push(pt.round());
    }
    return ret;
  };
  let path = SVG.path();
  let points = MakePointList([r, r / 2.5]);
  let d = points.toPath({ close: true });
  points.draw(path, true);
  points = MakePointList([r / 2.5, r / 2.5 / 1.8]);
  points.reverse();
  points.draw(path, true);
  d += points.toPath({ close: true });
  let g = SVG.gradient(f, {
    type: 'radial',
    id: 'page1-halo',
    stops: [
      [0, '#d8d8f4'],
      [1, '#edd455']
    ]
  });
  Util.log('PointList: ', { d, g });
  //f.root.parentElement.removeChild(f.root);
  Util.log('path: ', path.str());
  let p = f('path', {
    d: path.str(),
    stroke: '#000',
    strokeWidth: '3',
    fill: '#ff0',
    transform: 'translate(150,150)'
  });
  //Util.log('c: ', c);

  c.appendChild(f.root);
  Util.log(p);

  return points;
}

export function stores(stores) {
  let args = [...arguments];
  stores = args.shift();
  if(typeof stores === 'string') stores = [stores];
  if(!stores) stores = ['RootStore', 'UserStore'];
  for(let i = 0; i < stores.length; i++) {
    const st = stores[i];
    Util.log('store: ', { st, AllStores });
    const store = AllStores[st];
    while(args.length) {
      const prop = args.shift();
      if(prop !== undefined && store[prop] !== undefined) store = store[prop];
      else break;
    }
    return store;
  }
}

export function gettext(elem, done) {
  if(!elem) {
    return select().then(elem => (elem ? gettext(elem) : null));
  }
  const getNodeText = node => {
    let txt = '';
    if(node.innerHTML && !node.innerHTML.match(/<.*>/)) txt = '"' + node.innerHTML + '": ""';
    else if(node.placeholder) txt = node.placeholder;
    else if(node.nodeType == Node.TEXT_NODE && node.textContent) txt = node.textContent;
    else txt = '';
    return txt;
  };
  return new Promise((resolve, reject) => {
    let e = elem;
    Util.log('gettext ', { e });
    let text = [];
    let prevParent;
    Element.walk(e, (node, root) => {
      if(node) {
        let parent = node && node.parentNode !== undefined ? node.parentNode : null;
        let path = Element.xpath(node, e);
        let txt = node.innerText || node.textContent;
        if(txt && !['option', 'script', 'style', '#SL_'].some(tag => path.indexOf(tag) != -1)) {
          if(parent != prevParent) {
            //text.push("Parent: "+Element.xpath(parent));
          }
          path = path.replace(/\/[a-z]*\[[^/]*\//g, '/');
          path = path.replace(/\/[a-z]*#SL_[^/]*/g, '');
          path = path.replace(/\/[^/]*\.bp3[^/]*/g, '');
          //path = path.replace(/.*\//g, "");
          //txt = (path ? path + " " : "") + txt;
          text.push('  ' + txt);
        }
      }
      prevParent = parent;
    });
    const res = text.join('\n');
    Util.log('gettext\n', res);
    resolve(res);
  });
}

export function select() {
  if(!select.promise)
    select.promise = new Promise((resolve, reject) => {
      const e = Element.find('body');
      e.style.cursor = 'crosshair';
      select.element = null;
      const abortsel = () => {
        select.promise = undefined;
        e.style.cursor = 'default';
        e.removeEventListener('click', click);
        e.removeEventListener('keypress', onkey);
      };
      const click = event => {
        event.preventDefault();
        Util.log('selected element ', event.target);
        select.element = event.target;
        resolve(event.target);
        abortsel();
      };
      const onkey = event => {
        if(event.keyCode == 27) abortsel();
      };
      e.addEventListener('click', click);
      e.addEventListener('keypress', onkey);
    });
  return select.promise;
}

export function maxZindex(root = 'body') {
  return Element.findAll('*[style*=z-index]', root).reduce((accu, e) => {
    const z = +e.style.zIndex;
    //Util.log(Element.xpath(elem, body));
    return !isNaN(z) && z > accu ? z : accu;
  }, 0);
}

export function boxes(state) {
  let boxes = Element.find('.boxes');
  let body = Element.find('body');
  let container = Element.find('#main');
  let page = Element.find('.page');
  if(!boxes) {
    boxes = Element.create('div', {
      className: 'boxes',
      id: 'boxes',
      parent: body
    });
    let cr = Element.rect(page);
    //Util.log('container Rect: ', cr);
    Element.setCSS(boxes, {
      backgroundImage: 'url(/static/img/boxes-480.svg)',
      backgroundPosition: 'upperLeft',
      backgroundRepeat: 'none',
      backgroundSize: '100% auto',
      zIndex: 200,
      position: 'fixed'
    });
    cr.w = 480;
    cr.h = 800;
    Element.setCSS(boxes, Rect.toCSS(cr));
    let rect = Element.rect(boxes);
    //Util.log('boxes Rect: ', rect);
    //Util.log('boxes CSS: ', Element.getCSS(boxes));
  }
}

/**
 * Change page resolution
 * @param  {Integer} width  New width of the page
 */
export function res(width, height) {
  let page = Element.find('.page');
  let rect = Element.rect(page);
  let a = Size.aspect(rect);
  //Util.log('a: ', a);
  rect.left = rect.top = '0px';
  rect.height = height || width / a;
  rect.width = width;
  Element.setCSS(page, { ...Rect.toCSS(rect), position: 'absolute' });
}

const b64toText = async (b64Data, contentType = 'application/octet-stream') => {
  const url = `data:${contentType};base64,${b64Data}`;
  const response = await fetch(url);
  const buf = await response.arrayBuffer();
  return arrayBuffer2String(buf);
};

export function arrayBuffer2String(b) {
  const arr = new Uint8Array(b);
  let r = '';
  /* for(let i = 0; i < b.length; i++) r += String​.from​Char​Code(arr[i]);
   */
  return r;
}

export function ws(cmd = 'send', filename, data) {
  return new Promise((resolve, reject) => {
    let args = [...arguments];
    let url = Util.parseURL();
    url.location = '/ws';
    url.protocol = 'ws';
    if(typeof args[0] === 'object') {
      if(args[0].recv) {
        cmd = 'recv';
        filename = args[0].recv;
      } else if(args[0].send) {
        cmd = 'send';
        filename = args[0].send;
      } else {
        cmd = args[0].cmd;
        filename = args[0].filename;
      }
      data = args[0].data;
    }
    let ws = new WebSocket(url.href());
    function decodeBase64(b) {
      return decodeURIComponent(escape(window.atob(b)));
    }
    ws.onclose = function(event) {
      ws.close();
      Util.log('ws: onclose ', { event });
    };
    ws.onerror = function(event) {
      reject(event);
      Util.log('ws: onerror');
    };

    /*ws.onmessage = function(msg) {
    if(!(typeof(msg.data) == 'object' && msg.data.cmd))
      Util.log(`ws.ondata '`, msg.data, "'");
  }ch*/
    ws.onopen = function(event) {
      Util.log('ws.onopen ', { event });
      if(cmd == 'send' || cmd == 'recv') {
        let json = {
          cmd,
          filename,
          data: data ? window.btoa(encodeURIComponent(data)) : null
        };
        ws.send(JSON.toString(json) + '\r\n');
        Util.log('ws.send ', json);
        if(cmd == 'recv') {
          ws.onmessage = msg => {
            Util.log('ws.msg ', msg);
            if(msg.data == '') return;
            let x = msg.data.charAt(0) != '{' ? decodeBase64(msg.data) : msg.data;
            if(x.charAt(0) == '{') {
              x = JSON.parse(x);
              if(x.cmd == 'recv') return;
            }
            Util.log('ws.data ', x);
            if(typeof data === 'function') data(x);
            ws.close();
            resolve(x);
          };
        }
      }
    };
  });
}

export function settext(en, fa) {
  let obj = {};
  const args = [...arguments];
  if(typeof args[0] === 'object' && args[0].en !== undefined) {
    obj = args[0];
  } else {
    obj = { [en]: fa };
  }
  const filename = 'static/locales/fa-IR/common.json';
  const nl = '\r\n';
  ws({ recv: filename }).then(x => {
    const d = x.data;
    Util.log('settext: ', obj);
    ws({
      send: filename,
      data: JSON.toString({ ...x, ...obj })
        .replace(/\",\"/g, '",' + nl + '"')
        .replace(/{\"/g, '{' + nl + '"')
        .replace(/\"}/g, '"' + nl + '}' + nl)
    });
  });
}

export async function img(name, arg = {}) {
  const { style, ...props } = arg;
  //const args = [...arguments];
  let ret = null;

  let list = root.images
    ? root.images
    : (root.images = new HashList(
        obj => (obj.firstElementChild.id || obj.xpath).replace(/(^|[^A-Za-z0-9])[FfEe][NnAa]([^A-Za-z0-9]|$)/, '$1XX$2'),
        function(arg) {
          let e = Element.find(arg);
          let svg = Element.find('svg', e);

          /*let xpath = arg.xpath || Element.xpath(svg);
      if(xpath && xpath.replace) xpath = xpath.replace(/.*\//, '');*/
          Element.attr(svg, { 'data-name': svg.id });
          let r = new Rect(0, 0, svg.getAttribute('width'), svg.getAttribute('height'));
          r = Rect.round(r);
          let width = this.width + r.width;

          /*  r.x += width;
        this.width = width;*/
          Element.setRect(e, r);
          //Util.log("HashList ctor ", { width, r, id });
          return e;
          //return { e, r, id, xpath, svg };
        }
      ));

  return new Promise(async (resolve, reject) => {
    let path = name.indexOf('.') == -1 ? name + '.svg' : name;
    if(path.indexOf('/') == -1) path = '/static/img/' + path;

    const page = Element.find('.page');
    const body = Element.find('body');
    const getID = () => (window.img_id = window.img_id > 0 ? window.img_id + 1 : 1);
    const img_id = getID();
    const img_name = path.replace(/.*\/(.*)\.[^.]*$/g, '$1');
    const res = await axios.get(path);

    if(await res) {
      /*      .then(res => {
       */ Util.log('Loading image: ', { path, res });
      let e = Element.create('div', {
        path,
        parent: body,
        className: 'image',
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: -1,
          'z-index': -1,
          opacity: 0.5,
          border: '1px dotted black',
          ...style
        },
        ...props
      });
      e.innerHTML = await res.data;
      const av = e && e.firstChild && e.firstChild.viewBox && e.firstChild.viewBox.animVal;
      let svg = e.firstChild;
      Element.attr(svg, { id: img_name });
      while(svg.viewBox === undefined) svg = svg.nextElementSibling;
      const bbox = new Rect(0, 0, svg.getAttribute('width'), svg.getAttribute('height'));
      let r = Rect(av ? av : bbox);
      Util.log('r = ', r, ' bbox = ', bbox);
      let pr = Element.rect('.page');
      let pos = Point.sum(Rect.corners(pr)[1], Point(0, 0));

      /*      e.style.width = r.width + 2 + 'px';
    e.style.height = r.height + 2 + 'px';
    Element.rect(e, r);
*/

      e.svg = svg;
      const arr = list.add(e);
      if(arr.length == 2) {
        Timer.once(1333, () => {
          Util.log('walk(', arr[0].e, ', ', arr[1].e, ')');
          walk(arr[0].e, arr[1].e);
        });
      }
      Timer.once(50, () => {
        e = document.querySelector('#' + img_name);
        if(!e) reject();

        resolve(e);
      });
    }
  });
}

/*
img('background-stars').then(im => {
svg = im;
gr = dom.Element.find('#bg-a', im);
l = new dom.Line(dom.Element.toObject(gr));
matrix = new dom.Matrix(gr.getAttribute('gradientTransform'));
rg = dom.Element.find('radialGradient', svg);
obj = dom.Element.toObject(rg);
Util.log(dom.Element.toObject(rg));
layer = createsvg(['100vw','100vh'], true);
createsvg(obj, layer);
});
*/
export function createsvg(wh, fixed = false) {
  let args = [...arguments];
  if(createsvg.element) {
    if(typeof args[0] == 'object') {
      let tagName = args[0].tagName;
      delete args[0].tagName;
      args.unshift(tagName);
    }
    Util.log('createsvg ', ...args);
    let e = createsvg.factory(...args);
    createsvg.last_element = e;
    return e;
  }
  let body = Element.find('body');
  let rect = fixed ? Size(window.innerWidth, window.innerHeight) : Element.rect(body);
  const size = Size(args) || new Size(rect);
  Util.log('svg size: ', size);
  createsvg.factory = SVG.factory(body, Size.convertUnits(size));
  let e = createsvg.factory('polygon', {
    points: '0,100 100,0 0,0 100,100',
    fill: 'none',
    stroke: 'green'
  });
  let pl = PointList(e.getAttribute('points'));
  let svg = e.parentElement;
  //Util.log('pl: ', pl);
  //Util.log('parentNode: ', svg);
  Element.setCSS(svg, { zIndex: 500, ...Size.toCSS(size) });
  Element.move(svg, [0, 0], fixed ? 'fixed' : 'absolute');
  let svgrect = Element.rect(svg);
  //Util.log('svgrect: ', svgrect);
  //Util.log('svg: ', Element.dump(svg));
  return (createsvg.element = svg);
}

export function setpos(element) {
  let e = Element.find(element);
  //Util.log('e: ', Element.dump(e));
  if(e) {
    window.onmousemove = function(event) {
      let rect = Element.rect(e);
      let pos = Point(event.clientX, event.clientY);
      //Util.log('mouse pos: ', pos);
      //Util.log('rect: ', rect);
      //Util.log('rect corners: ', Rect.corners(rect));
      Element.move(e, pos);
    };
    window.onclick = function(event) {
      window.onmousemove(event);
      window.onmousemove = null;
    };
  }
  return e;
}

export function dump(element) {
  let e = Element.find(element);
  console.error(Element.dump(e));
}

export function walk(element) {
  const args = [...arguments];
  let elements = args.map(e => {
    if(e && e.charAt && e.charAt(0) != '#') {
      e = img(`designs/${e.replace(/^#/, '')}`);
    } else {
      e = Element.find(e);
    }
    return e;
  });

  let texts = new HashList(
    obj => {
      const xpath = Element.xpath(obj.e, obj.e.parentNode);
      //if(obj.name.indexOf("#") != -1) return obj.name;

      const x = Math.round(obj.x / 50);
      const y = Math.round(obj.y / 50);

      let key = xpath
        .replace(/([^A-Za-z])[EeFf][NnAa]([^A-Za-z])/, '$1XX$2')
        .replace(/\[[^]]*\]$/, `-${y}`)
        .replace(/\[[^]]*\]/g, '');

      return key.replace(/\//g, ' > ');
    },
    obj => {
      if(obj.id === undefined) Object.assign(obj, { id: Element.attr(obj.e, 'id') });
      if(obj.e) {
        let prev;
        obj.div = obj.e.parentNode;
        while(obj.div.tagName.toLowerCase() != 'div') {
          prev = obj.div;
          obj.div = obj.div.parentNode;
        }
        obj.svg = prev;
      }
      const svgr = SVG.bbox(obj.svg);
      obj.r = Element.rect(obj.e);
      obj.y = Rect.y2(svgr) - Rect.y2(obj.r);
      obj.x = obj.r.x - svgr.x;
      if(obj.name === undefined) obj.name = Element.xpath(obj.e).replace(/.*\//, '');
      return obj;
    }
  );
  elements.forEach(element =>
    Element.walk(element, e => {
      const text = (e.innerHTML || '').trim();
      if(text != '' && !text.match(/<.*>/)) {
        const xpath = Element.xpath(e).replace(/.*#img-[^/]*\//, '');
        const rect = Element.rect(e);
        const key = xpath.replace(/.*\//g, '');
        const { fontFamily } = Element.getCSS(e);
        const area = Rect.area(rect);

        let lang = 'en';
        let id = Element.attr(e, 'id');

        /*   if(fontFamily.match(/B.*Yekan/i))
      lang = "fa-IR";*/
        //id.match(/_fa/i)
        if(text.charCodeAt(0) > 255) lang = 'fa-IR';

        if(text.length > 0 && !(key.startsWith('style') || key.startsWith('script'))) {
          const ch = text.charCodeAt(0);
          let line = texts.add({ e, id, lang, key, text, rect });
          Util.log('Text ', line[line.length - 1]);
        }
      }
    })
  );
  if(global.lines == undefined) global.lines = [[], []];

  texts
    .toArray()
    .filter(txt => txt.lang && txt.lang.startsWith('fa'))
    .map(txt => `${txt.id} ${txt.xpath}`)
    .join('\n');

  texts.keys.forEach(key => {
    let line = texts[key];
    line.sort((a, b) => a.lang.localeCompare(b.lang));
    if(line.length > 0) {
      let str;
      line = line.filter(text => text.text != '\n');
      let strs = line.map(text => `"${text.text}"`);
      if(strs.length == 2) str = strs.join(': ');
      else str = strs.join('\n  ');
      let rect = texts.at(key).reduce((acc, it) => Rect.union(acc, Element.rect(it.e)), this[name][0].r);
      let rstr = Rect.toString(rect);

      if(strs.length != 2 && strs.length > 0 && str.length) {
        global.lines[1].push('  ' + str + ' '.repeat(Math.max(0, 80 - str.length)) + `/* ${key} */`);
      }
      //str = (line.length != 2 ? `/* ${key} */\n/* ${rstr} */\n` : "") + str;
      else if(Rect.area(rect)) global.lines[0].push(str);
    }
  });
  let out = '\n' + Util.distinct(lines[0]).join('\n') + '\n\n' + Util.distinct(lines[1]).join('\n');

  ws({ send: 'extract.txt', data: out });

  window.output_accu = out;
  Util.log('walk output:\n' + window.output_accu);
  //reduceTexts((acc,text) => Util.log("text " + text.index));
}

export async function measure(element) {
  element = element || (await select());
  let e = Element.find(element);
  let r = Element.rect(e);

  Util.log('Element ', Element.xpath(e));
  Util.log('    rect: ', r);
  Util.log('     css: ', Element.getCSS(e));
}

export function trackElements() {
  const elements = Element.findAll.apply(this, arguments);
  const rects = elements.map(e => rect(e, 'none', '#' + Util.hex(Math.round(Math.random() * 0xfff)), e));

  window.trackingRects = rects;

  return Timer.interval(500, () => {
    let i = 0;
    for(let e of elements) {
      const r = Element.rect(e);
      Element.rect(rects[i], r);
      i++;
    }
  });
}

export function polyline(points, closed = false) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if(typeof points == 'object' && points.toPoints) points = points.toPoints();

  if(!window.svg)
    window.svg = SVG.create(
      'svg',
      {
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        style: `position: fixed; left: 0; top: 0; z-index: 999999;`
      },
      document.body
    );
  SVG.create(
    closed ? 'polygon' : 'polyline',
    {
      points: points.toString(3),
      fill: 'none',
      stroke: 'red',
      strokeWidth: 1.5
    },
    window.svg
  );
}

export function circle(point, radius = 10) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if(!window.svg)
    window.svg = SVG.create(
      'svg',
      {
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        style: `position: fixed; left: 0; top: 0; z-index: 999999;`
      },
      document.body
    );
  SVG.create(
    'circle',
    {
      cx: point.x,
      cy: point.y,
      r: radius,
      fill: 'none',
      stroke: 'red',
      strokeWidth: 1.5
    },
    window.svg
  );
}

export function rect(...args) {
  let self = rect;
  let arg = args[0];
  let e, r;
  let a = (rect.list = rect.list || []);
  let zIndex = maxZindex() + 1;

  while(args.length > 0) {
    if(args[0] instanceof Rect) r = args.shift();
    else if(isElement(args[0]) || (typeof args[0] == 'string' && (e = Element.find(args[0])))) r = Element.rect(args.shift());
    else r = new Rect(args);

    // console.log('r:', r);

    a.push(__rect({ r, args }));
  }

  let ret = [...a];
  rect.list = [];

  return ret.length == 1 ? ret[0] : ret;

  function __rect({ r, args }) {
    const rect = r;
    let body = Element.find('body');
    let parent = null;

    /*   let args = [...arguments];
    let rect = args.shift();*/
    if(typeof rect == 'string' || rect.tagName !== undefined) {
      parent = rect;
      rect = Element.rect(rect);
      //console.log('rect:', rect);
    }

    let color = args.shift() || RGBA.random([0, 255], [0, 255], [0, 255], [64, 64]);
    //  color.a = 64;
    let borderColor = args.shift() || null;
    parent = parent || args.shift() || body;
    if(typeof parent == 'string') parent = Element.find(parent);

    if(parent != body && parent.style && !parent.style.position) parent.style.setProperty('position', 'relative');

    let e = Element.create('div', { class: 'devtools rectangle', parent });
    //console.log('backgroundColor', color, color.toString());
    Object.assign(e.style, {
      position: 'absolute',
      border: `${self.border || 1}px dashed ${borderColor || '#0f0'}`,
      borderRadius: '0px',
      backgroundColor: color,
      zIndex,
      pointerEvents: 'none'
    });

    //Util.log("__rect ", rect, color);

    Element.setRect(e, rect.round(1), 'absolute');

    let computed = Element.getRect(e);
    //Util.log("rect: ", rect, " computed: ", computed);
    const proxy = new ElementRectProxy(e);
    ElementXYProps(e, proxy);
    ElementSizeProps(e, proxy);

    e.transformation = ElementTransformation();
    Object.assign(e, CSSTransformSetters(e));
    return e;
  }
}

export function borders(element) {
  let e = Element.find(element);
  let body = Element.find('body');
  let b = ['margin', 'border', 'padding'].reduce((o, name) => {
    o[name] = Element.getTRBL(e, name);
    return o;
  }, {});
  let r = Element.rect(e);
  let rects = {};

  rects.border = b.border.null() ? Rect.clone(r) : b.border.outset(r);
  rects.margin = b.margin.null() ? Rect.clone(rects.border) : b.margin.outset(rects.border);
  rects.padding = b.padding.null() ? Rect.clone(r) : b.padding.inset(r);

  if(!b.border.null()) rect(rects.border, 'rgba(255,0,0,0.5)', 'red');

  if(!b.margin.null()) rect(rects.margin, 'rgba(0,255,0,0.5)', 'green');

  rect(r, 'rgba(255,255,0,0.5)', 'yellow');

  if(!b.padding.null()) rect(rects.border, 'rgba(0,80,255,0.5)', 'blue');

  Util.log('e: ', e, ' b: ', b);
}

export function storage(name) {
  let store = makeLocalStorage();
  let value = store.get(name) || '{}';
  try {
    value = JSON.parse(value);
  } catch(err) {}
  let self = trkl(value);

  self.subscribe(newValue => {
    //alert("store "+name+": ",newValue);
    store.set(name, newValue);
  });

  Util.defineGetterSetter(self, 'name', () => name);
  Util.defineGetterSetter(
    self,
    'value',
    () => self(),
    value => self(value)
  );
  self.get = function(key) {
    return key ? this.value[key] : this.value;
  };
  self.set = function() {
    let args = [...arguments];
    let v = this.value;
    if(args.length >= 2) self.assign({ [args[0]]: args[1] });
    else v = args[0];
    self(v);
    return this;
  };
  self.has = function(key) {
    return this.value[key] !== undefined;
  };

  self.assign = function(props) {
    let v = this.value;
    for(let key in props) v[key] = props[key];
    self(v);
    return this;
  };

  return self;
}
//prettier-ignore
export function assign_to(obj) {
  //prettier-ignore
  Object.assign(obj, { devtools });
  Object.assign(obj,  devtools);
}

export const devtools = {
  arrayBuffer2String,
  assign_to,
  borders,
  boxes,
  circle,
  colors,
  createsvg,
  dump,
  getStars,
  gettext,
  gradient,
  img,
  measure,
  polyline,
  rect,
  res,
  select,
  setpos,
  settext,
  starAnim,
  storage,
  stores,
  stylesheets,
  //toJS,
  trackElements,
  Util,
  walk,
  trkl,
  ws,
  maxZindex

  /*  React,
  ReactDOM,*/
  //mobx: { toJS }
};

export default devtools;
