
class Via {
  x = '';
  y = '';
  extent = '';
  drill = '';
  shape = '';

  constructor(x, y, extent, drill, shape) {
  }
};

class Rectangle {
  x1 = '';
  y1 = '';
  x2 = '';
  y2 = '';
  layer = '';

  constructor(x1, y1, x2, y2, layer) {
  }
};

class Library {
  name = '';

  constructor(name) {
  }
};

class Element {
  name = '';
  library = '';
  package = '';
  value = '';
  x = '';
  y = '';

  constructor(name, library, pkg, value, x, y) {
  }
};

class Description {
  language = '';

  constructor(language) {
  }
};

class Package {
  name = '';

  constructor(name) {
  }
};

class Signal {

  constructor() {
  }
};

class Pad {
  name = '';
  x = '';
  y = '';
  drill = '';
  diameter = '';
  shape = '';
  rot = '';

  constructor(name, x, y, drill, diameter, shape, rot) {
  }
};

class Contactref {
  element = '';
  pad = '';

  constructor(element, pad) {
  }
};

class Text {
  text = '';

  constructor(text) {
  }
};

class Layer {
  number = '';
  name = '';
  color = '';
  fill = '';
  visible = '';
  active = '';

  constructor(number, name, color, fill, visible, active) {
  }
};

class Param {
  name = '';
  value = '';

  constructor(name, value) {
  }
};

class Wire {
  x1 = '';
  y1 = '';
  x2 = '';
  y2 = '';
  width = '';
  layer = '';

  constructor(x1, y1, x2, y2, width, layer) {
  }
};




if (module) {
  var classes =  {
    Via, Rectangle, Library, Element, Description, Package, Signal, Pad, Contactref, Text, Layer, Param, Wire
  };
  module.exports = classes;
  module.exports.default = classes;
}

