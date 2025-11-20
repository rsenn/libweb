import { declare, properties, define } from './misc.js';
import { Prototypes, Factory, Parser, HTMLCollection, NamedMap, NamedNodeMap, Element, Document, Node, Collection } from './dom.js';
export * from './dom.js';

function FindChild(element, name) {
  return element.children[Node.raw(element).children.findIndex(e => e.tagName == name)];
}

const AttributeProperty = attrName => ({
  [attrName]: {
    get() {
      return this.getAttribute(attrName);
    },
    set(value) {
      this.setAttribute(attrName, value);
    },
    enumerable: true,
  },
});

const AddProperty = (ctors, props) => {
  for(const ctor of ctors) Object.defineProperties(ctor.prototype, props);
};

export class EagleProject {
  #filename;
  #parser;

  constructor(filename) {
    console.log('EagleProject.constructor', filename);

    this.#filename = filename.replace(/\.(brd|sch)$/gi, '');
    this.#parser = new EagleParser();

    define(
      this,
      properties(
        {
          schematic: () => this.#parser.parseFromFile(this.#filename + '.sch'),
          board: () => this.#parser.parseFromFile(this.#filename + '.brd'),
        },
        { memoize: true },
      ),
    );
  }

  closeAll() {
    delete this.schematic;
    delete this.board;
  }
}

export class EagleDocument extends Document {
  constructor(obj, factory) {
    super(obj, null, factory);
  }

  /* prettier-ignore */ get eagle() { return this.querySelector('eagle'); }
  /* prettier-ignore */ get drawing() { return this.eagle.drawing; }
  /* prettier-ignore */ get board() { return this.eagle.drawing.board; }
  /* prettier-ignore */ get schematic() { return this.eagle.drawing.schematic; }
  /* prettier-ignore */ get library() { return this.eagle.drawing.library; }
  /* prettier-ignore */ get layers() { return this.eagle.drawing.layers; }
  /* prettier-ignore */ get type() { return this.eagle.drawing.type; }
}

export class EagleElement extends Element {
  constructor(node, parent) {
    super(node, parent);

    for(let e of Element.hier(this)
      .slice(0, -1)
      .filter(e => e.hasAttribute && (e.hasAttribute('name') || e.tagName == 'sheet'))) {
      const { tagName } = e;

      if(!Reflect.has(this, tagName))
        Reflect.defineProperty(this, tagName, {
          get: () => Element.hier(e).find(e => e.tagName == tagName),
          configurable: true,
        });
    }
  }

  /* prettier-ignore */ get drawing() { return this.ownerDocument.querySelector('drawing'); }
}

/*
 * Common Eagle Elements
 */

export class DrawingElement extends EagleElement {
  /* prettier-ignore */ get settings() { return FindChild(this, 'settings'); }
  /* prettier-ignore */ get grid() { return FindChild(this, 'grid'); }
  /* prettier-ignore */ get layers() { return FindChild(this, 'layers'); }
  /* prettier-ignore */ get schematic() { return FindChild(this, 'schematic'); }
  /* prettier-ignore */ get board() { return FindChild(this, 'board'); }
  /* prettier-ignore */ get library() { return FindChild(this, 'library'); }
  /* prettier-ignore */ get type() { return [...this.children].find(e => ['schematic', 'board', 'library'].includes(e.tagName))?.tagName; }
}

export class SettingsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
}

export class SettingElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.attributes[0].name; }
  /* prettier-ignore */ get value() { return this.attributes[0].value; }
}

export class GridElement extends EagleElement {}

export class LayersElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return NamedMap(
      this,
      n => this.querySelector(`layer[name=${n}]`),
      () => [...this.children].reduce((acc, e) => ((acc[+e.getAttribute('number')] = e.getAttribute('name')), acc), []),
    );
  }
}

export class LayerElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get number() { return +this.getAttribute('number'); }
  /* prettier-ignore */ get color() { return +this.getAttribute('color'); }
  /* prettier-ignore */ get fill() { return +this.getAttribute('fill'); }
  /* prettier-ignore */ get visible() { return this.getAttribute('visible') == 'yes'; }
  /* prettier-ignore */ get active() { return this.getAttribute('active') == 'yes'; }
}

export class DescriptionElement extends EagleElement {}

export class PlainElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }

  wires = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'wire');
  texts = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'text');
  dimensions = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'dimension');
}

export class WireElement extends EagleElement {
  /* prettier-ignore */ get x1() { return +this.getAttribute('x1'); }
  /* prettier-ignore */ get y1() { return +this.getAttribute('y1'); }
  /* prettier-ignore */ get x2() { return +this.getAttribute('x2'); }
  /* prettier-ignore */ get y2() { return +this.getAttribute('y2'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
  /* prettier-ignore */ get width() { return +this.getAttribute('width'); }
}

export class LibrariesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class LibraryElement extends EagleElement {
  /* prettier-ignore */ get description() { return FindChild(this, 'description'); }
  /* prettier-ignore */ get packages() { return FindChild(this, 'packages'); }
  /* prettier-ignore */ get symbols() { return FindChild(this, 'symbols'); }
  /* prettier-ignore */ get devicesets() { return FindChild(this, 'devicesets'); }
}

export class PackagesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class PackageElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }

  /* prettier-ignore */ get description() { return FindChild(this, 'description'); }
  pads = new NamedNodeMap(
    {
      get: name => [...this.children].find(e => e.tagName == 'pad' && e.getAttribute('name') == name),
      keys: () =>
        [...this.children]
          .filter(e => e.tagName == 'pad')
          .map(e => e.getAttribute('name'))
          .reduce((acc, e) => ((acc[e] = e), acc), []),
    },
    this,
  );
  wires = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'wire');
  texts = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'text');
}

export class PadElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get drill() { return +this.getAttribute('drill'); }
  /* prettier-ignore */ get shape() { return this.getAttribute('shape'); }
}

export class TextElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get size() { return +this.getAttribute('size'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
  /* prettier-ignore */ get ratio() { return +this.getAttribute('ratio'); }
}

export class RectangleElement extends EagleElement {
  /* prettier-ignore */ get x1() { return +this.getAttribute('x1'); }
  /* prettier-ignore */ get y1() { return +this.getAttribute('y1'); }
  /* prettier-ignore */ get x2() { return +this.getAttribute('x2'); }
  /* prettier-ignore */ get y2() { return +this.getAttribute('y2'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
  /* prettier-ignore */ get rot() { return this.getAttribute('rot'); }
}

export class CircleElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get radius() { return +this.getAttribute('radius'); }
  /* prettier-ignore */ get width() { return +this.getAttribute('width'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
}

export class AttributesElement extends EagleElement {}

export class VariantdefsElement extends EagleElement {}

export class ClassesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'number');
  }
}

export class ClassElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
  /* prettier-ignore */ get number() { return +this.getAttribute('number'); }
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get width() { return +this.getAttribute('width'); }
  /* prettier-ignore */ get drill() { return +this.getAttribute('drill'); }

  clearances = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'clearance');
}

/*
 * Eagle Schematic Elements
 */
export class SchematicElement extends EagleElement {
  /* prettier-ignore */ get description() { return FindChild(this, 'description'); }
  /* prettier-ignore */ get libraries() { return FindChild(this, 'libraries'); }
  /* prettier-ignore */ get attributes() { return FindChild(this, 'attributes'); }
  /* prettier-ignore */ get variantdefs() { return FindChild(this, 'variantdefs'); }
  /* prettier-ignore */ get classes() { return FindChild(this, 'classes'); }
  /* prettier-ignore */ get parts() { return FindChild(this, 'parts'); }
  /* prettier-ignore */ get sheets() { return FindChild(this, 'sheets'); }
  /* prettier-ignore */ get modules() { return FindChild(this, 'modules'); }
}

export class SymbolsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class SymbolElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }

  pins = new NamedNodeMap(
    {
      get: name => [...this.children].find(e => e.tagName == 'pin' && e.getAttribute('name') == name),
      keys: () => [...this.children].filter(e => e.tagName == 'pin').map(e => e.getAttribute('name')),
    },
    this,
  );
  wires = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'wire');
  texts = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'text');
}

export class PinElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get visible() { return this.getAttribute('visible'); }
}

export class DevicesetsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class DevicesetElement extends EagleElement {
  /* prettier-ignore */ get description() { return FindChild(this, 'description'); }
  /* prettier-ignore */ get gates() { return FindChild(this, 'gates'); }
  /* prettier-ignore */ get devices() { return FindChild(this, 'devices'); }
}

export class GatesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name', () => []);
  }
}

export class GateElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get symbol() { return this.library.symbols[this.getAttribute('symbol')]; }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
}

export class DevicesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class DeviceElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get package() { return this.library.packages[this.getAttribute('package')]; }
  /* prettier-ignore */ get connects() { return FindChild(this, 'connects'); }
  /* prettier-ignore */ get technologies() { return FindChild(this, 'technologies'); }
}

export class ConnectsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
}

export class ConnectElement extends EagleElement {
  /* prettier-ignore */ get gate() { return this.deviceset.gates[this.getAttribute('gate')]; }
  /* prettier-ignore */ get pin() { return this.gate.symbol.pins[this.getAttribute('pin')]; }
  /* prettier-ignore */ get pad() { return this.device.package.pads[this.getAttribute('pad')]; }
}

export class TechnologiesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class TechnologyElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
}

export class PartsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class PartElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get library() { return this.ownerDocument.schematic.libraries[this.getAttribute('library')]; }
  /* prettier-ignore */ get deviceset() { return this.library.devicesets[this.getAttribute('deviceset')]; }
  /* prettier-ignore */ get device() { return this.deviceset.devices[this.getAttribute('device')]; }
  /* prettier-ignore */ get value() { return this.getAttribute('value'); }
}

export class SheetsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return Collection(this);
  }
}

export class SheetElement extends EagleElement {
  /* prettier-ignore */ get plain() { return FindChild(this, 'plain'); }
  /* prettier-ignore */ get instances() { return FindChild(this, 'instances'); }
  /* prettier-ignore */ get busses() { return FindChild(this, 'busses'); }
  /* prettier-ignore */ get nets() { return FindChild(this, 'nets'); }
  /* prettier-ignore */ get moduleinsts() { return FindChild(this, 'moduleinsts'); }
}

export class InstancesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return Collection(this);
  }
}

export class InstanceElement extends EagleElement {
  /* prettier-ignore */ get part() { return (this.module ?? this.ownerDocument.schematic).parts[this.getAttribute('part')]; }
  /* prettier-ignore */ get gate() { return this.part.deviceset.gates[this.getAttribute('gate')]; }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get smashed() { return this.getAttribute('smashed') == 'yes'; }
}

export class BussesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class BusElement extends EagleElement {
  segments = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'segment');
}

export class NetsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class NetElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get class() { return this.ownerDocument.schematic.classes[this.getAttribute('class')]; }

  segments = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'segment');
}

export class SegmentElement extends EagleElement {
  pinrefs = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'pinref');
  wires = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'wire');
  labels = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'label');
  junctions = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'junction');
}

export class LabelElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get size() { return +this.getAttribute('size'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
}

export class PinrefElement extends EagleElement {
  /* prettier-ignore */ get part() { return this.ownerDocument.schematic.parts[this.getAttribute('part')]; }
  /* prettier-ignore */ get gate() { return this.part.deviceset.gates[this.getAttribute('gate')]; }
  /* prettier-ignore */ get pin() { return this.gate.symbol.pins[this.getAttribute('pin')]; }
}

export class JunctionElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
}

/* board */
export class BoardElement extends EagleElement {
  /* prettier-ignore */ get description() { return FindChild(this, 'description'); }
  /* prettier-ignore */ get plain() { return FindChild(this, 'plain'); }
  /* prettier-ignore */ get libraries() { return FindChild(this, 'libraries'); }
  /* prettier-ignore */ get attributes() { return FindChild(this, 'attributes'); }
  /* prettier-ignore */ get variantdefs() { return FindChild(this, 'variantdefs'); }
  /* prettier-ignore */ get classes() { return FindChild(this, 'classes'); }
  /* prettier-ignore */ get designrules() { return FindChild(this, 'designrules'); }
  /* prettier-ignore */ get autorouter() { return FindChild(this, 'autorouter'); }
  /* prettier-ignore */ get elements() { return FindChild(this, 'elements'); }
  /* prettier-ignore */ get signals() { return FindChild(this, 'signals'); }
}

export class DesignrulesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  params = new NamedNodeMap(
    {
      get: name => [...this.children].find(e => e.tagName == 'param' && e.getAttribute('name') == name),
      keys: () => [...this.children].filter(e => e.tagName == 'param').map(e => e.getAttribute('name')),
    },
    this,
  );
}

export class ParamElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get value() { return this.getAttribute('value'); }
}

export class AutorouterElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
  passes = new NamedNodeMap(
    {
      get: name => [...this.children].find(e => e.tagName == 'pass' && e.getAttribute('name') == name),
      keys: () => [...this.children].filter(e => e.tagName == 'pass').map(e => e.getAttribute('name')),
    },
    this,
  );
}

export class PassElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }

  /* prettier-ignore */ get name() { return this.getAttribute('name'); }

  params = new NamedNodeMap(
    {
      get: name => [...this.children].find(e => e.tagName == 'param' && e.getAttribute('name') == name),
      keys: () => [...this.children].filter(e => e.tagName == 'param').map(e => e.getAttribute('name')),
    },
    this,
  );
}

export class ElementsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class ElementElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get value() { return this.getAttribute('value'); }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get library() { return this.ownerDocument.board.libraries[this.getAttribute('library')]; }
  /* prettier-ignore */ get package() { return this.library.packages[this.getAttribute('package')]; }
}

export class SignalsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class SignalElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }

  contactrefs = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'contactref');
  wires = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'wire');
  vias = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'via');
}

export class ContactrefElement extends EagleElement {
  /* prettier-ignore */ get element() { return this.ownerDocument.board.elements[this.getAttribute('element')]; }
  /* prettier-ignore */ get pad() { return this.element.package.pads[this.getAttribute('pad')]; }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
}

export class ViaElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get extent() { return this.getAttribute('extent'); }
  /* prettier-ignore */ get drill() { return +this.getAttribute('drill'); }
  /* prettier-ignore */ get shape() { return this.getAttribute('shape'); }
}

export class ApprovedElement extends EagleElement {
  /* prettier-ignore */ get hash() { return this.getAttribute('hash'); }
}

export class AttributeElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get size() { return +this.getAttribute('size'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
}

export class ClearanceElement extends EagleElement {
  /* prettier-ignore */ get class() { return this.classes[this.getAttribute('class')]; }
  /* prettier-ignore */ get value() { return this.getAttribute('value'); }
}

export class CompatibilityElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
  notes = new HTMLCollection(Node.raw(this).children, this, e => e.tagName == 'note');
}

export class NoteElement extends EagleElement {}

export class ErrorsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
}

export class ModuleElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get prefix() { return this.getAttribute('prefix'); }
  /* prettier-ignore */ get dx() { return +this.getAttribute('dx'); }
  /* prettier-ignore */ get dy() { return +this.getAttribute('dy'); }

  /* prettier-ignore */ get ports() { return FindChild(this, 'ports'); }
  /* prettier-ignore */ get variantdefs() { return FindChild(this, 'variantdefs'); }
  /* prettier-ignore */ get parts() { return FindChild(this, 'parts'); }
  /* prettier-ignore */ get sheets() { return FindChild(this, 'sheets'); }
}

export class ModuleinstElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get module() { return this.ownerDocument.schematic.modules[this.getAttribute('module')]; }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
}

export class ModuleinstsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class ModulesElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class DimensionElement extends EagleElement {
  /* prettier-ignore */ get x1() { return +this.getAttribute('x1'); }
  /* prettier-ignore */ get y1() { return +this.getAttribute('y1'); }
  /* prettier-ignore */ get x2() { return +this.getAttribute('x2'); }
  /* prettier-ignore */ get y2() { return +this.getAttribute('y2'); }
  /* prettier-ignore */ get x3() { return +this.getAttribute('x3'); }
  /* prettier-ignore */ get y3() { return +this.getAttribute('y3'); }
  /* prettier-ignore */ get textsize() { return +this.getAttribute('textsize'); }
  /* prettier-ignore */ get visible() { return this.getAttribute('visible') == 'yes'; }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
}

export class FrameElement extends EagleElement {
  /* prettier-ignore */ get x1() { return +this.getAttribute('x1'); }
  /* prettier-ignore */ get y1() { return +this.getAttribute('y1'); }
  /* prettier-ignore */ get x2() { return +this.getAttribute('x2'); }
  /* prettier-ignore */ get y2() { return +this.getAttribute('y2'); }
  /* prettier-ignore */ get columns() { return +this.getAttribute('columns'); }
  /* prettier-ignore */ get rows() { return +this.getAttribute('rows'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
}

export class HoleElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get drill() { return +this.getAttribute('drill'); }
}

export class PolygonElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);

    return Collection(this);
  }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
  /* prettier-ignore */ get width() { return +this.getAttribute('width'); }
}

export class PortElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get side() { return this.getAttribute('side'); }
  /* prettier-ignore */ get coord() { return +this.getAttribute('coord'); }
  /* prettier-ignore */ get direction() { return this.getAttribute('direction'); }
}

export class PortrefElement extends EagleElement {
  /* prettier-ignore */ get moduleinst() { return this.sheet.moduleinsts[this.getAttribute('moduleinst')]; }
  /* prettier-ignore */ get port() { return this.moduleinst.module.ports[this.getAttribute('port')]; }
}

export class PortsElement extends EagleElement {
  constructor(node, parent) {
    super(node, parent);
    return NamedMap(this, 'name');
  }
}

export class SmdElement extends EagleElement {
  /* prettier-ignore */ get name() { return this.getAttribute('name'); }
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
  /* prettier-ignore */ get dx() { return +this.getAttribute('dx'); }
  /* prettier-ignore */ get dy() { return +this.getAttribute('dy'); }
  /* prettier-ignore */ get layer() { return this.ownerDocument.layers[this.getAttribute('layer')]; }
}

export class VertexElement extends EagleElement {
  /* prettier-ignore */ get x() { return +this.getAttribute('x'); }
  /* prettier-ignore */ get y() { return +this.getAttribute('y'); }
}

declare(EagleElement, {
  elements: Prototypes({
    eagle: EagleElement,
    drawing: DrawingElement,
    settings: SettingsElement,
    setting: SettingElement,
    grid: GridElement,
    layers: LayersElement,
    layer: LayerElement,
    description: DescriptionElement,
    plain: PlainElement,
    wire: WireElement,
    libraries: LibrariesElement,
    library: LibraryElement,
    packages: PackagesElement,
    package: PackageElement,
    pad: PadElement,
    text: TextElement,
    rectangle: RectangleElement,
    circle: CircleElement,
    attributes: AttributesElement,
    variantdefs: VariantdefsElement,
    classes: ClassesElement,
    class: ClassElement,
    schematic: SchematicElement,
    symbols: SymbolsElement,
    symbol: SymbolElement,
    pin: PinElement,
    devicesets: DevicesetsElement,
    deviceset: DevicesetElement,
    gates: GatesElement,
    gate: GateElement,
    devices: DevicesElement,
    device: DeviceElement,
    connects: ConnectsElement,
    connect: ConnectElement,
    technologies: TechnologiesElement,
    technology: TechnologyElement,
    parts: PartsElement,
    part: PartElement,
    sheets: SheetsElement,
    sheet: SheetElement,
    instances: InstancesElement,
    instance: InstanceElement,
    busses: BussesElement,
    bus: BusElement,
    nets: NetsElement,
    net: NetElement,
    segment: SegmentElement,
    label: LabelElement,
    pinref: PinrefElement,
    junction: JunctionElement,
    board: BoardElement,
    designrules: DesignrulesElement,
    param: ParamElement,
    autorouter: AutorouterElement,
    pass: PassElement,
    elements: ElementsElement,
    element: ElementElement,
    signals: SignalsElement,
    signal: SignalElement,
    contactref: ContactrefElement,
    via: ViaElement,
    approved: ApprovedElement,
    attribute: AttributeElement,
    clearance: ClearanceElement,
    compatibility: CompatibilityElement,
    note: NoteElement,
    errors: ErrorsElement,
    module: ModuleElement,
    moduleinst: ModuleinstElement,
    moduleinsts: ModuleinstsElement,
    modules: ModulesElement,
    dimension: DimensionElement,
    frame: FrameElement,
    hole: HoleElement,
    polygon: PolygonElement,
    port: PortElement,
    portref: PortrefElement,
    ports: PortsElement,
    smd: SmdElement,
    vertex: VertexElement,
  }),
});

export class EagleFactory extends Factory {
  constructor() {
    super(
      Prototypes({
        Document: EagleDocument,
        Element: EagleElement,
      }),
    );
  }
}

declare(EagleFactory.prototype, { [Symbol.toStringTag]: 'EagleFactory' });

export class EagleParser extends Parser {
  constructor() {
    super(new EagleFactory());
  }
}

declare(EagleParser.prototype, { [Symbol.toStringTag]: 'EagleParser' });
