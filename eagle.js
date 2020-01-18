const Util = require("./util.es5.js");
const dom = require("./dom.es5.js");

class Node {
  constructor() {}

  add(obj) {
    if(!this.objects) this.objects = [];
    this.objects.push(obj);
  }
}

class Circle {
  x = 0;
  y = 0;
  radius = "";
  width = 0;
  layer = -1;

  constructor(x, y, radius, width, layer) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.width = width;
    this.layer = layer;
    Layer.add(layer, this);
  }
  getLayer() {
    return Layer.get(this.layer);
  }
}

class Polygon {
  width = 0;
  layer = -1;
  isolate = "";

  constructor(width, layer, isolate) {
    this.width = width;
    this.layer = layer;
    this.isolate = isolate;
    Layer.add(layer, this);
  }
  getLayer() {
    return Layer.get(this.layer);
  }
}

class Vertex {
  x = 0;
  y = 0;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Via {
  x = 0;
  y = 0;
  extent = "";
  drill = "";
  shape = "";

  constructor(x, y, extent, drill, shape, signal) {
    this.x = x;
    this.y = y;
    this.extent = extent;
    this.drill = drill;
    this.shape = shape;
    Signal.add(signal, this);
  }
}

class Rectangle {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  layer = -1;

  constructor(x1, y1, x2, y2, layer) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.layer = layer;
    Layer.add(layer, this);
  }
  getLayer() {
    return Layer.get(this.layer);
  }
}

class Library extends Node {
  name = "";

  constructor(name) {
    super();
    this.name = name;
  }

  static get(name) {
    return Library.instances[name];
  }
}

class Element extends Node {
  name = "";
  library = "";
  package = "";
  value = "";
  x = 0;
  y = 0;

  constructor(name, library, pkg, value, x, y) {
    super();
    this.name = name;
    this.library = library;
    this.package = pkg;
    this.value = value;
    this.x = x;
    this.y = y;
  }

  static get(name) {
    return Element.instances[name];
  }

  getLibrary() {
    return Library.get(this.library);
  }
  getPackage() {
    return Package.get(this.package);
  }

  getBounds() {
    const pkg = this.getPackage();
    const r = { x1: 0, x2: 0, y1: 0, y2: 0 };
    if(pkg) {
      //console.log("this: ", Object.keys(pkg), Object.keys(this));
      for(let o of pkg.objects) {
        /*if(o instanceof Wire) {
          const l = new dom.Line(o);
          const pts = l.toPoints();

          console.log("pts:", pts);
          for(let o of pts) if(o.x !== undefined && o.y !== undefined) updateRect(r, o);
        } else */ if(
          o instanceof Pad
        ) {
          updateRect(r, o);
        }
      }
    }
    function updateRect(r, pt) {
      if(r.x1 > pt.x - 0.5) r.x1 = pt.x - 0.5;
      if(r.x2 < pt.x + 0.5) r.x2 = pt.x + 0.5;
      if(r.y1 > pt.y - 0.5) r.y1 = pt.y - 0.5;
      if(r.y2 < pt.y + 0.5) r.y2 = pt.y + 0.5;
    }

    return r;
  }
}

class Description {
  language = "";

  constructor(language) {
    this.language = language;
  }
}

class Package extends Node {
  name = "";

  constructor(name) {
    super();
    this.name = name;
  }

  static get(name) {
    return Package.instances[name];
  }

  add(obj) {
    super.add(obj);
    for(let c of [Wire, Circle, Pad, Text, Rectangle, Description]) {
      if(obj instanceof c) {
        const cname = Util.fnName(c);
        const lname = cname.toLowerCase() + "s";
        if(this[lname] == undefined) this[lname] = [];
        this[lname].push(obj);
      }
    }
  }
}

class Signal extends Node {
  name = "";

  constructor(name) {
    super();
    this.name = name;
  }

  static get(name) {
    if(!Signal.instances[name]) Signal.instances[name] = new Signal(name);
    return Signal.instances[name];
  }

  static add(name, obj) {
    if(name != "") {
      let s = Signal.get(name);
      if(s.add(obj)) {
        if(s.name) obj.signal = s.name;
        return s.name;
      }
    }
    return "";
  }

  add(obj) {
    super.add(obj);
    for(let c of [ContactRef, Via, Wire, Polygon]) {
      if(obj instanceof c) {
        const cname = Util.fnName(c);
        const lname = cname.toLowerCase() + "s";
        if(this[lname] == undefined) this[lname] = [];
        this[lname].push(obj);
        return true;
      }
    }
    return false;
  }
}

class Pad {
  name = "";
  x = 0;
  y = 0;
  drill = "";
  // diameter = 0;
  // shape = "";
  // rot = "";

  constructor(name, x, y, drill, diameter, shape, rot) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.drill = drill;
    if(diameter) this.diameter = diameter;
    if(shape) this.shape = shape;
    if(rot) this.rot = parseFloat(rot.replace(/^R/, ""));
  }

  static get(name) {
    return Pad.instances[name];
  }
}

class ContactRef {
  element = "";
  pad = "";

  constructor(element, pad, signal) {
    this.element = element;
    this.pad = pad;
    Signal.add(signal, this);
  }

  getElement() {
    return Element.get(this.element);
  }
  getPad() {
    return Pad.get(this.pad);
  }
}

class Text {
  text = "";

  constructor(text) {
    this.text = text;
  }
}

class Layer extends Node {
  number = 0;
  name = "";
  color = -1;
  fill = -1;
  visible = false;
  active = false;
  objects = [];

  static find(number_or_name) {
    for(let name in Layer.instances) {
      if(Layer.instances[name].number === number_or_name || name === number_or_name) return Layer.instances[name];
    }
    return null;
  }

  static get(number_or_name) {
    let layer = Layer.find(number_or_name);
    if(layer === null && typeof number_or_name == "string")
      layer = Layer.instances[number_or_name] = new Layer(number_or_name);
    return layer;
  }

  constructor(number, name, color, fill, visible, active) {
    super();
    this.number = number;
    this.name = name;
    this.color = color;
    this.fill = fill;
    this.visible = Util.toBoolean(visible);
    this.active = Util.toBoolean(active);
  }

  static add(name, obj) {
    if(name != "") {
      let l = Layer.get(name);
      if(l !== null) {
        l.add(obj);
        if(l.name && obj.layer === undefined) obj.layer = l.number;
        return l.name;
      }
    }
    return "";
  }

  getColor() {
    return eagleProps.colors[this.color];
  }
  getFill() {
    return eagleProps.colors[this.fill];
  }
}

class Param {
  name = "";
  value = "";

  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

class Wire {
  x1 = 0;
  y1 = 0;
  x2 = 0;
  y2 = 0;
  width = 0;
  layer = -1;

  constructor(x1, y1, x2, y2, width, layer, signal) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = width;
    Layer.add(layer, this);
    this.layer = layer;
    Signal.add(signal, this);
  }
  getLayer() {
    return Layer.get(this.layer);
  }
}

var eagleProps = {
  classes: {
    Circle,
    Polygon,
    Vertex,
    Via,
    Rectangle,
    Library,
    Element,
    Description,
    Package,
    Signal,
    Pad,
    ContactRef,
    Text,
    Layer,
    Param,
    Wire
  },
  classesWithName: ["Class", "Designrules", "Element", "Layer", "Library", "Package", "Param", "Pass", "Signal"],
  coordProperties: ["x", "y", "x1", "y1", "x2", "y2", "width", "diameter", "radius", "extent", "size", "drill"],
  elementMap: {},
  allElements: [],
  scaleCoords: 1,
  tCoords: coord => coord,
  colors: [
    "#000000", // 0
    "#000080", // 1
    "#008000", // 2
    "#008080", // 3
    "#800000", // 4
    "#800080", // 5
    "#808000", // 6
    "#808080", // 7
    "#000000", // 8
    "#0000ff", // 9
    "#00ff00", // 10
    "#00ffff", // 11
    "#ff0000", // 12
    "#ff00ff", // 13
    "#ffff00", // 14
    "#ffffff", // 15
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0",
    "#c0c0c0"
  ]
};

function eagle(obj, parentObj) {
  let ret = null,
    ctor = null;
  let args = [...arguments];
  //  console.log("eagle: ", { parentObj, obj });
  if(typeof obj == "object") {
    const t = obj.tagName || obj.tag;
    if(t && eagleProps.elementMap[t] !== undefined) {
      const { tagName, tag, ...o } = obj;
      ctor = eagleProps.elementMap[tag];
      if(ctor === Layer) {
        const { number, name, color, fill, visible, active } = o;
        ret = new Layer(number, name, color, fill, visible, active);
      } else if(ctor === Pad) {
        const { name, x, y, drill, diameter, shape, rot } = o;
        ret = new Pad(name, x, y, drill, diameter, shape, rot);
      } else {
        ret = new ctor();
        ret = Object.assign(ret, o);
      }
    }
  } else if(typeof obj == "string") {
    const t = args.shift().toLowerCase();
    obj = args.shift();
    if(t && eagleProps.elementMap[t] !== undefined) {
      ctor = eagleProps.elementMap[tag];
      ret = new ctor();
      ret = Object.assign(ret, obj);
    }
  }
  if(ret !== null && ctor !== null) {
    for(let prop in ret) {
      if(eagleProps.coordProperties.indexOf(prop) != -1) ret[prop] = eagleProps.tCoords(ret[prop]);
    }
    if(ctor.instances instanceof Array) ctor.instances.push(ret);
    else ctor.instances[ret.name] = ret;
    if(parentObj instanceof Signal || parentObj instanceof Package) parentObj.add(ret);
    if(ret.layer !== undefined && (typeof ret.layer == "number" || typeof ret.layer == "string")) {
      Layer.add(ret.layer, ret);
    }
    eagleProps.allElements.push(ret);
  }
  return ret;
}

if (module) {
  Object.assign(module.exports, { eagle }, { eagleProps }, { allElements: eagleProps.allElements }, eagleProps.classes);
  module.exports.instances = {};
  for(let c in eagleProps.classes) {
    const name = c;
    console.log("name: ", c);
    const ctor = eagleProps.classes[c];
    const proto = ctor.prototype;
    eagleProps.elementMap[name.toLowerCase()] = eagleProps.classes[c];
    const withName = eagleProps.classesWithName.indexOf(c) != -1;
    module.exports[name + "s"] = module.exports.instances[name] = module.exports[name].instances = withName ? {} : [];
  }
  /*
  module.exports.elementMap = elementMap;
  module.exports.allElements = allElements;*/
  module.exports.default = eagle;
}