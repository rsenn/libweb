import ReactDOM from "react-dom";
import { Element, HSLA, Point, Rect, Renderer, Select, SVG } from "../utils/dom.js";
import axios from "../utils/axios.js";
import Util from "./util.js";
import { Polygon } from "./polygon.js";
import devtools, { storage, select } from "./devtools.js";
import { TouchListener } from "./touchHandler.js";
import { lazyInitializer } from "./lazyInitializer.js";

var SvgPath = require("./svg-path.js");
/*
if (global.window) {
  window.addEventListener('load', () => {
    console.log('New cookie: ', document.cookie);
  });
}*/

export default class devpane {
  config = storage("devpane");
  svg = null;
  open = false;
  active = false;
  rectList = [];
  serial = 0;
  elements = [];
  translations = null;
  path = null;
  touch = null;
  bbrect = lazyInitializer(() => Element.rect(this.parent));
  entitySources = {};

  pane = lazyInitializer(() => {
    let pos = {
      right: "2em",
      bottom: "1em"
    };
    if(this.config.has("position")) {
      let p = this.config.get("position");
      pos = {
        left: `${p.x}px`,
        top: `${p.y}px`
      };
    }
    let layer = this.createLayer(
      { id: "devpane-pane" },
      {
        zIndex: 18,
        minWidth: "300px",
        maxWidth: "80vw",

        minHeight: "30vh",
        maxHeight: "60vh",
        overflowY: "auto",
        /*   overflowX: 'auto',*/
        display: "block",
        position: "absolute",
        ...pos,
        backgroundColor: "#fffab3ff",
        WebkitBoxShadow: "2px 2px 6px 2px rgba(0,0,0,0.5)",
        BoxShadow: "2px 2px 6px 2px rgba(0,0,0,1)",
        border: "4px solid #ff0000ff",
        borderRadius: "0.5em",
        padding: "0px",
        opacity: 1,
        textAlign: "left",
        fontFamily: 'MiscFixedSC613,MiscFixed,Monospace,fixed-width,fixed,"Courier New"',
        fontSize: "11px"
      }
    );
    let p = this.renderPaneLayer(layer);
    //    layer.appendChild(p);
    return layer;
  });

  root = lazyInitializer(
    () => {
      let e = this.createRectLayer(this.bbrect(), { width: "", height: "", top: "", bottom: "10px", right: "10px", left: "" });
      e.id = "devpane-root";
      return e;
    } /*,
    () => {
      const handleTouch = event => {
        this.touch.listener(event);
        //document.dispatchEvent(event);
      };
      window.addEventListener('touchstart', handleTouch);
      window.addEventListener('touchend', handleTouch);
      window.addEventListener('touchmove', handleTouch);
      window.addEventListener('touchcancel', handleTouch);
    }*/
  );

  svg = lazyInitializer(() => {
    var rect = Element.rect(document.body);

    var svg = this.createSVGElement("svg", { width: rect.width, height: rect.height, viewBox: `0 0 ${rect.width} ${rect.height}` }, this.root());
    this.createSVGElement("defs", {}, svg);
    this.createSVGElement("rect", { x: 100, y: 100, w: 100, h: 100, fill: "#f0f" }, svg);

    return svg;
  });

  log = lazyInitializer(() =>
    this.createLayer(
      { tag: "pre", id: "devpane-log" },
      {
        position: "relative",
        /*height: '20px',*/
        maxHeight: "100px",
        overflowY: "scroll",
        overflowX: "auto",
        display: "block",
        border: "1px solid #000000ff",
        padding: "2px",
        textAlign: "left",
        fontFamily: "MiscFixedSC613,Fixed,MiscFixed,Monospace,fixed-width",
        fontSize: "12px" /*,
        minHeight: '4em'*/
      }
    )
  );

  getTranslations(done = () => {}) {
    const filename = "static/locales/fa-IR/common.json";
    const nl = "\r\n";
    ws({
      recv: filename,
      data: x => {
        this.translations = x;
        done(x);
      }
    });
  }

  constructor(node = "body", observe = ".page") {
    this.parent = Element.find(node);
    this.observe = Element.find(observe);
    this.factory = Element.factory(this.parent);
    this.rect = Rect(0, 0, 0, 0);
    //console.log('devpane.constructor: ', { factory: Object.keys(this.factory) });
    window.addEventListener("keydown", this.handleKeypress.bind(this));
    this.mouseEvent = this.mouseEvent.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.selectElement = this.selectElement.bind(this);
    this.path = new SvgPath();
    this.touch = TouchListener(this.handleTouch.bind(this));
    this.svg.factory = lazyInitializer(() => SVG.factory(this.svg()));
    var cfg = this.config();
    //    console.log("devpane cfg=", cfg);
    this.open = !cfg.open;

    /* if(this.open === true) */ this.toggleOpenClose();
  }

  toggleOpenClose() {
    this.open = !this.open;
    // console.log("devpane.toggleOpenClose open=" + this.open);
    this.config.assign({ open: this.open });

    if(this.pane()) {
      this.pane().style.display = this.open ? "inline-block" : "none";
    }
    if(this.open) {
      //this.pane.style.display = 'inline-block';
      //if(global.window)  this.rectList = this.buildRectList(document.body);
      this.root();
      this.pane();
    }
  }

  setPosition(x, y) {
    this.config.set("position", { x, y });
  }

  setEntitySources(sources) {
    this.entitySources = { ...this.entitySources, ...sources };

    let rows = [];

    for(let name in this.entitySources) {
      const source = this.entitySources[name];
      if(source !== null) {
        if(source && source.count > 1) name += `(${source.count})`;
        rows.push([name, source.toString()]);
      }
    }

    if(this.open) {
      var table = this.renderTable(["entity", "source"], rows, {
        cellspacing: 0,
        style: {
          /*  width: '100%'*/
        }
      });

      let pane = this.pane();

      while(pane.lastElementChild && pane.lastElementChild.tagName.toLowerCase() == "table") {
        pane.removeChild(pane.lastElementChild);
      }

      pane.appendChild(table);
    }
  }

  logEntry(str) {
    if(this.log) {
      let log = this.log();
      /*  let pane = this.pane();
       */

      if(log) {
        if(log.parentNode !== this.pane()) this.pane().insertBefore(log, this.pane().firstElementChild);

        log.insertAdjacentText("beforeend", str.trim() + "\n");
        log.scrollTop = log.scrollHeight;
        log.style.height = "4em";
      }
    }
  }

  handleTouch(event) {
    var move;

    if(event.num == 0) {
      this.path.commands = [];
      this.path.abs();
      this.path.to(event.x, event.y);
      move = { x: event.x, y: event.y };
      this.prevTouch = event;
    } else {
      this.path.abs();
      console.log("touch event: ", event);
      move = { x: event.start.x + event.x, y: event.start.y + event.y };
      this.path.line(move.x, move.y);
      //this.path.line(move.x - this.prevTouch.x, move.y - this.prevTouch.y);
      this.prevTouch = move;
    }

    var polygon = Polygon.approxCircle(25, 7);

    var svg = this.svg();

    var svgpath = svg && svg.querySelector("#touch-path");
    var svgcircle = svg && svg.querySelector("#touch-pos");

    if(!(svgpath && svgpath.tagName == "path")) {
      svgpath = SVG.create(
        "path",
        {
          id: "touch-path",
          stroke: "#ffee00",
          fill: "none",
          strokeWidth: 3,
          strokeDasharray: "16 16"
        },
        this.svg()
      );
    }

    if(!(svgcircle && svgpath.tagName == "path")) {
      svgcircle = SVG.create("path", { id: "touch-pos", stroke: "#80ff00", fill: "none", strokeWidth: 2 }, this.svg());
    }

    if(svgcircle) {
      let str = Polygon.toPath(polygon);
      Element.attr(svgcircle, { d: `M${move.x},${move.y} ` + str });
    }
    if(svgpath) {
      let str = this.path.str();

      if(/L/.test(str)) Element.attr(svgpath, { d: str });
      console.log("Touch event: ", { svgpath, str });
    }
  }

  buildRectList(element = null, pred = null) {
    element = Element.find(element ? element : this.observe);

    return Element.walk(
      element,
      (elem, list) => {
        //if(!pred(elem)) return;
        let rect = Element.getRect(elem);

        if(rect.x == 0 && rect.y == 0) {
          const { offsetParent } = elem;
          const offsetRect = offsetParent ? Element.getRect(offsetParent) : null;
          console.log("Zero ", { elem, rect, offsetParent, offsetRect });
        }

        const ns = elem.namespaceURI.replace(/.*\//, "");
        const tag = elem.tagName;
        const text = elem.innerText || elem.textContent;

        //rect.ns = ns;
        rect.tag = tag;
        rect.text = text;
        rect.toString = function() {
          return `${this.ns}:${this.tag}`;
        };
        if(pred ? pred(elem) : Rect.area(rect) > 0) {
          console.log("buildRectList ", { ns, tag, rect });

          rect.e = elem;
          rect.box = null;
          rect.test = function(point, serial) {
            const inside = Point.inside(point, this);
            if(inside) this.serial = serial;
            return inside;
          };
          rect.bounds = Rect.uniq(
            ["boundary", "margin", "border", "padding"].reduce((a, name) => {
              let o = Element.getTRBL(rect.e, name);
              if(name == "margin") o.add(Element.getTRBL(rect.e, "border"));
              const offset = o.isNaN() ? Rect : o.outset;
              let r = offset(rect);
              r.name = name;
              const idx = Rect.indexOf(r, a);
              //console.log('Rect.indexOf(', r, ',accu) = ', idx);
              if(idx == -1) a.push(r);
              return a;
            }, []),
            r => r.name == "boundary"
          );
          rect.bounds.sort((a, b) => Rect.area(a) - Rect.area(b));
          list.push(rect);
        }
        return list;
      },
      []
    );
  }

  getRectAt(x, y, multi = false) {
    const p = Point(x, y);
    let ret = [];
    for(let i = 0; i < this.rectList.length; i++) {
      if(Point.inside(p, this.rectList[i])) {
        if(multi == false) return this.rectList[i];
        ret.push(this.rectList[i]);
      }
    }
    return multi ? ret : null;
  }

  getTextParts(elem) {
    let ret = [];
    if(!elem.innerHTML.match(/<.*>/)) {
      ret.push(elem.innerHTML);
    } else {
      Element.walk(elem.firstElementChild, (e, accu) => {
        let text = "";
        if(!e.innerHTML.match(/<.*>/)) {
          text = e.innerHTML.replace(/&nbsp;/g, "");
        } else {
          text = e.textContent || e.innerText || "";
        }
        if(text.length > 0) ret.push(text);
      });
    }
    return ret;
  }

  handleKeypress(e) {
    const { key, keyCode, charCode } = e;
    const modifiers = ["alt", "shift", "ctrl", "meta"].reduce((mod, key) => (e[key + "Key"] === true ? [...mod, key] : mod), []).toString();
    //console.log('keypress: ', { key, keyCode, charCode, modifiers });

    if(e.key == "D" && (e.metaKey || e.ctrlKey || e.altKey) && e.shiftKey) {
      this.toggleOpenClose();
    } else if(e.key == "s" && e.ctrlKey) {
      select().then(e => console.log("select() = ", e));
    } /* if(e.key == 'g') {
      gettext().then(r => console.log("gettext() = ", r));
    } else*/ else if(e.key == "t" && e.ctrlKey) {
      console.log("devpane ", this);
      this.renderTranslateLayer();

      let boxes = [];
      let opts = {};
      Util.foreach(window.translations, (far, eng) => {
        if(far == "") {
          /*  let box = this.renderTranslateBox(eng,far);
            boxes.push(box);*/
          opts[Object.keys(opts).length.toString()] = eng;
        }
      });

      let box = this.renderTranslateBox(opts);

      /*      window.translations((translations) => {
        elementPicker.init({ onClick: e => {
          const text = this.getTextParts(e); //gettext(e); // e.innerText || e.textContent;
          console.log("translate(", translations, ", ",text, ")")
          text.forEach(t => {
          });
        }});
      });
*/
    } else if(e.keyCode == 27) {
    }
  }

  createRectLayer = (rect, css = {}, fn = Element.create) =>
    fn("div", {
      parent: Element.find("body"),
      style: {
        display: "inline-block",
        zIndex: 18,
        position: "absolute",
        //pointerEvents: "none",
        ...(rect ? Rect.toCSS(rect) : {}),
        ...css
      }
    });

  createLayer = (props = {}, css = {}, fn = Element.create) =>
    fn(props.tag || "div", {
      parent: props.parent || this.root(),
      lang: "en",
      dir: "ltr",
      ...props,
      style: {
        /*    minWidth: 100,
        minHeight: 100,
        padding: '1em',
        textAlign: 'center',
        position: 'fixed',
        left: '2em',
        bottom: '1em',
        backgroundColor: '#fff66fff',
        border: '1px solid black',
        borderRadius: '0.5em',*/
        opacity: 1.0,
        //   pointerEvents: "none",
        ...css
      }
    });

  createSVGElement = (tag, attr, parent) => SVG.create(tag, attr, parent);

  /* Element.setCSS(
        this.svg,
        { ...Rect.toCSS(rect), position: 'fixed', zIndex: 10000, pointerEvents: 'none' }
      );
      var elm = (this.svgpath = SVG.create(
        'path',
        {
          d: 'M0,0',
          opacity: '1.0',
          stroke: '#f00',
          strokeWidth: 3,
          strokeDasharray: '4 4',
          fill: 'none'
        },
        this.svg
      ));

      this.svg = elm.parentNode || this.svgfactory.root;

      console.log('createSVGLayer: ', elm, this.svg);
    }
    return this.svg;
  }*/

  handleToggle(event) {
    console.log("devpane.handleToggle");
    const { currentTarget } = event;
    const { checked } = currentTarget;
    const what = checked ? "add" : "remove";
    const mouseEvents = elem => ["mouseenter", "mouseleave"].forEach(listener => elem[what + "EventListener"](listener, this.mouseEvent));
    window[what + "EventListener"]("mousemove", this.mouseMove);
    this.active = checked;
    if(this.active) {
      this.svg();
      this.rectList = this.buildRectList(document.body);
    }
  }

  renderTranslateLayer() {
    if(!this.translateLayer) {
      this.translateLayer = this.createLayer();
    }
    return this.translateLayer;
  }

  setLayer(inner) {
    let layer = this.pane();

    layer.innerHTML = typeof inner == "string" ? inner : "";
    if(inner && inner.nodeType) {
      layer.appendChild(inner);
    }
  }

  renderTable(header, rows, attrs) {
    let table = Element.create("table", {
      cellspacing: 0,
      cellpadding: 0,
      border: 0,
      style: { border: "0.5px solid #000" },
      ...attrs
    });
    const createRow = (parent, tag = "td", cells, style = {}) => {
      parent = Element.create("tr", { parent });
      cells.forEach(innerHTML =>
        Element.create(tag, {
          parent,
          innerHTML,
          style: { border: "0.5px solid #000", padding: "2px", ...style }
        })
      );
      return parent;
    };
    createRow(table, "th", header, { backgroundColor: "#000000", color: "#ffffff" });
    rows.forEach((columns, i) => createRow(table, "td", columns, { backgroundColor: i % 2 == 0 ? "#ffffff" : "#c0c0c0" }));
    return table;
  }

  renderTranslateBox(options) {
    let t = { options };
    t.callback = null;

    t.set = (lang, str) => {
      const e = t.inputs[lang];
      console.log("t.set ", { e });
      e.value = str;
    };
    t.handleChange = e => {
      const key = e.currentTarget.value || e.target.value;
      const value = t.options[key];
      if(t.inputs.en) t.inputs.en.value = value;
    };
    t.chooser = <Select name="en_translations" options={options} onChange={t.handleChange} />;
    t.layer = this.createLayer({ id: "devpane-layer" });
    t.factory = Element.factory({ append_to: e => t.layer.appendChild(e) });
    t.renderer = new Renderer(t.chooser, t.factory("div"));
    t.form = t.factory("form", {}, { display: "flex", flexFlow: "row nowrap", alignItems: "flex-end", padding: "4px" });
    t.form.addEventListener("submit", e => false);
    t.select = t.renderer.refresh();

    t.select.addEventListener("change", e => {
      const text = t.options[e.target.value];
      t.set("en", text);
    });

    t.fields = Element.create("div", {
      parent: t.form,
      style: { minWidth: "100px" }
    });

    const createLabel = text =>
      Element.create("label", {
        innerHTML: text,
        parent: t.fields,
        style: {
          display: "inline-block",
          fontFamily: "DejaVu Sans",
          fontSize: "12px",
          width: "72px",
          padding: "6px"
        }
      });

    const createEditBox = (label, value, onChange) => {
      return (
        createLabel(label),
        Element.create("input", {
          type: "text",
          size: "40",
          parent: t.fields,
          name: label,
          defaultValue: value,
          onchange: onChange,
          style: {
            border: "1px inset #848484",
            backgroundColor: "#fff"
          }
        })
      );
    };

    this.getTranslations(res => {
      console.log("language store: ", res);
    });

    const createTable = ({ rows, spacing = 0, padding = 0, border = 0, ...props }) => {
      let tbl = Element.create("table", {
        cellpadding: padding,
        cellspacing: spacing,
        border,
        ...props
      });
      rows.forEach(row => {
        let r = Element.create("tr", { parent: tbl });
        tbl.appendChild(r);
        row.forEach(col => {
          let lang = col.charCodeAt(0) > 255 ? (lang = "fa") : "en";
          let c = Element.create("td", {
            parent: r,
            lang,
            style: {
              textAlign: lang == "fa" ? "right" : "left",
              verticalAlign: "middle",
              backgroundColor: "white"
            }
          });
          r.appendChild(c);
          c.innerHTML = col;
        });
      });
      return tbl;
    };

    const createButton = (caption, handler) =>
      Element.create("div", {
        innerHTML: caption,
        parent: t.form,
        className: "bp3-button bp3-small",
        onclick: handler,
        style: { margin: "1em auto 0 auto" }
      });

    t.save = function(event) {
      let en = this.inputs["en"].value;
      let fa = this.inputs["fa"].value;
      if(fa != "") {
        console.log(`Saving EN: ${en} FA: ${fa} `);
        settext({ [en]: fa });
        this.form.parentNode.removeChild(this.form);
      }
    }.bind(t);

    t.inputs = {};
    t.labels = {};

    ["en", "fa"].forEach(lang => {
      t.inputs[lang] = createEditBox(
        lang,
        "",
        function(e) {
          this[lang] = e.currentTarget.value;
        }.bind(t)
      );
      Element.create("br", { parent: t.fields });
    });

    t.buttons = {
      save: createButton("Save", e => t.save(e)),
      new: createButton("New", () => this.renderTranslateBox()),
      load: createButton("Load", () => {
        axios.get("/api/read/static/locales/fa-IR/common.json").then(res => {
          const elem = t.factory("textarea", {
            cols: 80,
            rows: 25,
            style: {
              fontFamily: "monospace,fixed,'Courier New'",
              fontSize: "12px"
            }
          });

          const json = Util.base64.decode(res.data.data);
          const obj = JSON.parse(json);
          //const data = atob(cmd.data);

          let rows = [];
          Util.foreach(obj, (v, k) => rows.push([k, v]));
          let tbl = createTable({ rows, spacing: 3, padding: 2 });
          Element.setCSS(tbl, { fontFamily: "Arial", fontSize: "13px" });

          t.layer.insertBefore(tbl, t.layer.firstElementChild);

          console.log("Load ", { json, obj });
          elem.innerHTML = json;

          t.trans = json;
        });
      })
    };
    t.set = t.set.bind(t);

    return t;
  }

  writeLayer(str) {
    const pane = this.pane();
    pane.innerHTML = str;
    return pane;
  }

  renderPaneLayer(parent) {
    /* const pane = this.pane();
    const { factory } = this;*/
    let elm = ReactDOM.render(this.render(), parent);
    if(true) {
      Element.create("input", {
        type: "button",
        parent: elm,
        value: "Select an Element",
        style: { border: "2px outset #ddd" },
        onclick: event => {
          console.error("selectElement");
          event.preventDefault();
          const e = select();
          e.then(res => {
            if(res) {
              let bbText = Element.find("#bbox");
              let bbox = Element.rect(res);
              let css = Element.getCSS(res);

              bbText.innerHTML = Rect.toSource(bbox) + "\nfont-size: " + css.fontSize; // `x: ${bbox.x}\ny: ${bbox.y}\nw: ${bbox.width}\nh: ${bbox.height}`;
            }
            console.log("selectElement (resolved) = ", res);

            if(res && res.length) {
              this.elements = this.elements.concat(res);
              //this.elements.push(res);
              p.innerHTML =
                `${this.elements.length} Elements: ` +
                this.elements
                  .map(e => e.toString())
                  .sort()
                  .join(", ");
              //console.log("selectElement (resolved) = ", res);
              /*     const css = Element.getCSS(res);
              //console.log("selectElement (fontSize) = ", css.fontSize);*/
            }
          });
        }
      });
      Element.create("input", {
        type: "button",
        id: "clear-button",
        parent: elm,
        value: "Clear",
        style: { border: "2px outset #ddd" },
        onclick: event => {
          this.elements.splice(0, this.elements.length);
          p.innerHTML = "";
        }
      });
      Element.create("br", { parent: elm });
      Element.create("input", {
        type: "button",
        id: "clearance",
        parent: elm,
        value: "Clearance",
        style: { border: "2px outset #ddd" },
        onclick: event => {
          if(this.elements.length >= 2) {
            var elem1 = this.elements[0].e;
            var elem2 = this.elements[1].e;

            //console.log(elem1);

            var rect1 = Element.rect(elem1);
            var rect2 = Element.rect(elem2);

            var border1 = Element.border(elem1)
              .outset(rect1)
              .round();
            var border2 = Element.border(elem2)
              .outset(rect2)
              .round();

            console.log("Clearance: ", { rect1, border1, rect2, border2 });
          }
        }
      });
      let p = Element.create("p", {
        parent: elm,
        id: "selected-list",
        style: { maxWidth: "250px" }
      });
    }

    //   this.writeLayer(`date: ${new Date().toJSON()}<br />cookie: ${document.cookie}`);

    return elm;
  }

  render() {
    const { rect, fontSize } = this;
    return (
      <form action="none" onSubmit={e => e.preventDefault()}>
        <input type="checkbox" onChange={this.handleToggle} />
        Bounding boxes
        <br />
        <pre id={"bbox"}>{[`x: ${rect.x || 0}`, `y: ${rect.y || 0}`, `width: ${rect.w || 0}`, `height: ${rect.h || 0}`, `font-size: ${fontSize || 0}`].join(",\n")}</pre>
      </form>
    );
  }

  selectElement() {
    console.log("devpane.selectElement()");
    //if(!this.rectList
    if(!this.rectList || !this.rectList.length) {
      let page = Element.find(".page");
      console.log("page ", page);

      this.rectList = this.buildRectList(page, e => {
        let text = e.innerText || e.textContent || "";
        return text.length > 0;
      }); //e.textContent && e.textContent.length > 0);
      console.log("this.rectList ", this.rectList);
    }

    Element.remove("#select-rect");
    //console.log('selectElement');
    this.rectList.sort((a, b) => Rect.area(a) - Rect.area(b));
    console.log(this.rectList);
    this.active = true;
    let selected = new Promise((resolve, reject) => {
      window.onmousemove = event => {
        const { target, clientX, clientY } = event;
        const r = this.getRectAt(clientX, clientY);

        if(r) {
          let elm = Element.find("#select-rect");
          if(!elm) {
            elm = Element.create("div", {
              id: "select-rect",
              parent: Element.find("body"),
              style: { position: "absolute", border: "2px solid green" },
              zIndex: 999999
            });
          }
          Element.setRect(elm, r);
          //Rect.set(r, elm);
          this.selected = this.getRectAt(clientX, clientY, true);
          if(this.selected.length) {
            console.log("selectElement selected: ", this.selected);
            elm.innerHTML = this.selected.map(s => `#${s.e.id}`).join(",");
            this.fontSize = Element.getCSS(this.selected[0].e, "font-size");
            console.log(Element.xpath(this.selected[0].e) + " font-size: ", this.fontSize);
          } else {
            elm.innerHTML = "";
          }
        }
      };
      window.onmousedown = () => {
        resolve(this.selected);
        window.onmousemove = null;
        window.onclick = null;
      };
    });
    return selected;
  }

  mouseMove(event) {
    const { rectList } = this;
    const { target, clientX, clientY } = event;

    //console.log('this.rectList.length: ', this.rectList.length);
    const pos = Point(clientX, clientY);
    let serial = this.serial + 1;
    this.serial = serial;
    let gparent = rect.boxes ? rect.boxes.parentNode : null;
    if(gparent) {
      gparent.removeChild(rect.boxes);
      rect.boxes = null;
    }
    let rects = this.rectList.reduce((accu, rect, idx, arr) => {
      const inside = rect.test(pos, serial);
      const hue = (360 * idx) / arr.length;
      if(inside && !rect.box) {
        if(!rect.boxes) rect.boxes = this.svg.factory("g");
        rect.bounds.forEach((r, i, a) => this.svg.factory("rect", { ...Rect(rect), stroke: HSLA(hue, 100, 25 + (50 * i) / a.length).toString(), fill: "none" }, rect.boxes));
      } else if(!inside && rect.boxes) {
        //console.log('parent: ', rect.boxes.parentNode, ' boxes: ', rect.boxes);
        while(rect.boxes.firstChild) rect.boxes.removeChild(rect.boxes.firstChild);
        rect.boxes.parentNode.removeChild(rect.boxes);
        rect.boxes = null;
        rect.serial = serial;
      }
      if(inside) accu.push(rect);
      return accu;
    }, []);
    // rects = rects.filter(item => rect.boxes != null && rect.serial == serial);
    rects.sort((a, b) => Rect.area(b) - Rect.area(a));
    rects = rects.filter(item => Rect.area(item) > 0);
    console.log("devp.mouseMove", { target, clientX, clientY, rects });
    if(rects.length) console.log("rects: ", rects);
    let svg = this.svg();
    [...svg.querySelectorAll("rect")].forEach(e => e.parentElement.removeChild(e));
    let f = SVG.factory(svg);
    /*
    const g = f('g');
    f = SVG.factory(g);
    */
    console.log("devp.mouseMove", f);
    //  f('rect', { x: 10, y: 10, width:  100, height: 100 });
    //rects = rects.reverse();
    this.svgRects = rects;
    rects = rects.map((rect, index) => ({
      color: new HSLA((60 + (index * 360) / 10) % 360, 100, 50, 1),
      ...rect
    }));
    let svgRects = rects.map(({ x, y, width, height, color }, index) => {
      return f("rect", { x, y, width, height, stroke: color.toString(), strokeWidth: 3, fill: "none" });
    });
    console.log("devp.mouseMove", svgRects);
    var selectedList = Element.find("#selected-list");
    Element.setCSS(selectedList, { display: "block", backgroundColor: "black", padding: "2px", overflow: "scroll" });
    selectedList.innerHTML =
      "<pre>" +
      rects
        .map(rect => `<span style="color: ${rect.color.toString()};">` + Element.xpath(rect.e, document.body) + `</span>`)
        .reverse()
        .join("\n") +
      `</pre>`;
    if(rects[0]) {
      this.rect = rects[0];
      //  this.renderPaneLayer();
    }
  }

  mouseEvent(event) {
    console.log("devp.mouseEvent", event);
    const { target, type, clientX, clientY } = event;
    if(type == "mouseenter") {
      const r = Rect.round(Element.rect(target));
      if(this.svg() == null) this.svg();
      let e = this.svg.factory("rect", { ...r, style: { stroke: "#f00" } });
    }
  }
}
