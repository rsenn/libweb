const Util = require("./util.es5.js");

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

  constructor(x, y, extent, drill, shape) {
    this.x = x;
    this.y = y;
    this.extent = extent;
    this.drill = drill;
    this.shape = shape;
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
  }
  getLayer() {
    return Layer.get(this.layer);
  }
}

class Library {
  name = "";

  constructor(name) {
    this.name = name;
  }
}

class Element {
  name = "";
  library = 0;
  package = "";
  value = "";
  x = 0;
  y = 0;

  constructor(name, library, pkg, value, x, y) {
    this.name = name;
    this.library = library;
    this.package = pkg;
    this.value = value;
    this.x = x;
    this.y = y;
  }
}

class Description {
  language = "";

  constructor(language) {
    this.language = language;
  }
}

class Package {
  name = "";

  constructor(name) {
    this.name = name;
  }

  static get(name) {
    return Package.instances[name];
  }
}

class Signal {
  constructor() {}
}

class Pad {
  name = "";
  x = 0;
  y = 0;
  drill = "";
  diameter = 0;
  shape = "";
  rot = "";

  constructor(name, x, y, drill, diameter, shape, rot) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.drill = drill;
    this.diameter = diameter;
    this.shape = shape;
    this.rot = rot;
  }
}

class Contactref {
  element = "";
  pad = "";

  constructor(element, pad) {
    this.element = element;
    this.pad = pad;
  }
}

class Text {
  text = "";

  constructor(text) {
    this.text = text;
  }
}

class Layer {
  number = 0;
  name = "";
  color = "";
  fill = "";
  visible = "";
  active = "";

  static get(number_or_name) {
    const layers = Object.values(Layer.instances);
    for(let i = 0; i < layers.length; i++) {
      if(layers[i].name === number_or_name || layers[i].number == number_or_name) return layers[i];
    }
    return null;
  }

  constructor(number, name, color, fill, visible, active) {
    this.number = number;
    this.name = name;
    this.color = color;
    this.fill = fill;
    this.visible = visible;
    this.active = active;
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

  constructor(x1, y1, x2, y2, width, layer) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = width;
    this.layer = layer;
  }
  getLayer() {
    return Layer.get(this.layer);
  }
}

const classes = {Circle, Polygon, Vertex, Via, Rectangle, Library, Element, Description, Package, Signal, Pad, Contactref, Text, Layer, Param, Wire };
const classesWithName = ["Class", "Designrules", "Element", "Layer", "Library", "Package", "Pad", "Param", "Pass", "Signal"]; let elementMap = {};

function eagle(obj) {
  let ret = null,
    ctor = null;
  let args = [...arguments];
  //  console.log("obj: ",obj);
  if(typeof obj == "object") {
    const t = obj.tagName || obj.tag;
    if(t && elementMap[t] !== undefined) {
      const { tagName, tag, ...o } = obj;
      ctor = elementMap[tag];
      ret = new ctor();
      ret = Object.assign(ret, o);
    }
  } else if(typeof obj == "string") {
    const t = args.shift().toLowerCase();
    obj = args.shift();
    if(t && elementMap[t] !== undefined) {
      ctor = elementMap[tag];
      ret = new ctor();
      ret = Object.assign(ret, obj);
    }
  }
  if(ret !== null && ctor !== null) {
    if(ctor.instances instanceof Array) ctor.instances.push(ret);
    else ctor.instances[ret.name] = ret;
  }
  return ret;
}

if (module) {
  Object.assign(module.exports, classes, { eagle });
  module.exports.instances = {};
  for(let c in classes) {
    const name = c;
    const ctor = classes[c];
    const proto = ctor.prototype;
    elementMap[name.toLowerCase()] = classes[c];
    const withName = classesWithName.indexOf(c) != -1;
    module.exports[name + "s"] = module.exports.instances[name] = module.exports[name].instances = withName ? {} : [];
  }
  module.exports.elementMap = elementMap;
  module.exports.default = eagle;
}
