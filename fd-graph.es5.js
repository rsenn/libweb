"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Graph = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

require("regenerator-runtime/runtime");

var _dom = require("./dom.es5.js");

var _util = _interopRequireDefault(require("./util.es5.js"));

class Graph {
  constructor({
    origin = new _dom.Point(0, 0),
    prng = Math.random,
    gravitate_to_origin = true,
    spacing = 1,
    timestep = 150,
    kineticenergy = 1,
    damping = 0.000005,
    total_node_velocity = 0,
    onUpdateNode = node => {},
    onUpdateEdge = edge => {},
    onRenderGraph = graph => {}
  }) {
    console.log("Graph(".concat(origin, ",").concat(gravitate_to_origin, ")"));
    this.nodes = [];
    this.edges = [];
    this.config = {
      origin,
      spacing
    };
    this.update = {
      node: onUpdateNode,
      edge: onUpdateEdge
    };
    this.damping = damping;
    this.timestep = timestep;
    this.kineticenergy = kineticenergy;
    this.total_node_velocity = total_node_velocity;
    this.gravitate_to_origin = typeof gravitate_to_origin == "undefined" ? true : gravitate_to_origin;
    this.done_rendering = false;
    this.prng = prng;
    var g = this;
    var seq = 0;
  }

  addNode(n, charge = 60, mass = 100) {
    if (!(n instanceof Node)) n = new Node(n, charge, mass, this.prng);
    n.index = this.nodes.length;
    this.nodes.push(n);
    return this.nodes[this.nodes.length - 1];
  }

  findNode(value, key = "label") {
    return _util.default.find(this.nodes, value, key);
  }

  addEdge(e) {
    let args = [...arguments];
    if (!(e instanceof Edge)) e = new Edge(args[0], args[1]);
    e.index = this.edges.length;
    this.edges.push(e);
    return this.edges[this.edges.length - 1];
  }

  add(o) {
    if (o instanceof Node) this.nodes.push(o);
    if (o instanceof Edge) this.edges.push(o);
  }

  push() {
    return this.add.apply(this, [...arguments]);
  }

  resetNodes() {
    for (var i = 0; i < this.nodes.length; i++) {
      var n = this.nodes[i];
      n.reset();
    }
  }

  getConnections(node, exclude = null) {
    var _this = this;

    return _regenerator.default.mark(function _callee() {
      var i, edge, r;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < _this.edges.length)) {
              _context.next = 14;
              break;
            }

            edge = _this.edges[i];
            r = null;
            if (edge.a && _dom.Point.equal(edge.a, node)) r = edge.b;
            if (edge.b && _dom.Point.equal(edge.b, node)) r = edge.a;

            if (!(r !== null)) {
              _context.next = 11;
              break;
            }

            if (!(exclude !== null && _dom.Point.equal(exclude, r))) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("continue", 11);

          case 9:
            _context.next = 11;
            return r;

          case 11:
            i++;
            _context.next = 1;
            break;

          case 14:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })();
  }

  isLeafNode(node) {
    let c = [...this.getConnections(node)];
    return c.length <= 1;
  }

  branchNodes() {
    var _this2 = this;

    return _regenerator.default.mark(function _callee2() {
      var i;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < _this2.nodes.length)) {
              _context2.next = 8;
              break;
            }

            if (_this2.isLeafNode(_this2.nodes[i])) {
              _context2.next = 5;
              break;
            }

            _context2.next = 5;
            return _this2.nodes[i];

          case 5:
            i++;
            _context2.next = 1;
            break;

          case 8:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    })();
  }

  getBBox() {
    return _dom.BBox.from(this.nodes);
  }

  checkRedraw() {
    this.kineticenergy = 0;
    this.total_node_velocity = 0;

    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      var isLeaf = this.isLeafNode(node);
      node.netforce = new _dom.Point(0, 0);
      node.velocity = new _dom.Point(0, 0);

      if (1) {
          if (this.gravitate_to_origin) {
            var d = node.distance(this.config.origin);
            var af = 0.02 * Math.max(d, 1);

            _dom.Point.move(node.netforce, af * Math.sin((this.config.origin.x - node.x) / d), af * Math.sin((this.config.origin.y - node.y) / d));

            var rf = -1 * (node.charge / (d * d));

            _dom.Point.move(node.netforce, rf * Math.sin((this.config.origin.x - node.x) / d), rf * Math.sin((this.config.origin.y - node.y) / d));
          }

          for (var j = 0; j < this.edges.length; j++) {
            var con = this.edges[j];

            if (con.a == node || con.b == node) {
              var other_node = con.a == node ? con.b : con.a;
              node.applyAttractiveForce(other_node);
            }
          }

          for (var k = 0; k < this.nodes.length; k++) {
            var rep_node = this.nodes[k];
            node.applyRepulsiveForce(rep_node, this.config.spacing || 1);
          }

          node.netforce.x = Math.abs(node.netforce.x) < 1 ? 0 : node.netforce.x;
          node.netforce.y = Math.abs(node.netforce.y) < 1 ? 0 : node.netforce.y;
          node.velocity.x = node.netforce.x == 0 ? 0 : (node.velocity.x + this.timestep * node.netforce.x) * this.damping;
          node.velocity.y = node.netforce.y == 0 ? 0 : (node.velocity.y + this.timestep * node.netforce.y) * this.damping;
        }

      node.move(node.velocity.x * this.timestep, node.velocity.y * this.timestep);
      var velocity = node.velocity.distance();
      this.total_node_velocity += velocity;
      this.kineticenergy += node.mass * (velocity * velocity);
    }

    function findBiggestGap(angles) {
      let ret = [];
      let bdiff = 0;

      for (let i = 0; i < angles.length; i++) {
        let a = angles[i];
        let b = angles[(i + 1) % angles.length];
        let diff = Math.abs(b - a);

        if (diff > bdiff) {
          bdiff = diff;
          ret = [a, b];
        }
      }

      return ret;
    }

    let newPositions = [];

    const distributeLeafNodes = () => {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.branchNodes()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let node = _step.value;
          let connections = [...this.getConnections(node)];
          let nonLeafNodes = connections.filter(c => !this.isLeafNode(c));
          let leafNodes = connections.filter(c => this.isLeafNode(c));
          let lines = nonLeafNodes.map(c => new _dom.Line(node, c));
          let angles = lines.map(l => l.angle());
          let middleAngle;
          let gapLen;

          if (leafNodes.length) {
            if (angles.length >= 2) {
              let gap = findBiggestGap(angles);
              middleAngle = (gap[1] + gap[0]) / 2;
              gapLen = gap[1] - gap[0];
            } else if (angles.length == 1) {
              middleAngle = angles[0] + Math.PI;
              if (middleAngle > Math.PI) middleAngle -= Math.PI;
              gapLen = Math.PI;
            }

            if (Math.abs(middleAngle) > 0) {
              let gapStep = gapLen / leafNodes.length;
              let gapPos = middleAngle - gapLen / 2;

              for (let j = 0; j < leafNodes.length; j++) {
                let leaf = leafNodes[j];
                let index = leaf.index;
                let l = new _dom.Line(node, leaf);
                let len = l.length();

                let rel = _dom.Point.diff(leaf, node);

                newPositions.push({
                  index,
                  old: rel,
                  x: node.x + Math.cos(gapPos) * 50,
                  y: node.y + Math.sin(gapPos) * 50
                });
                gapPos += gapStep;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };

    if (this.total_node_velocity < 0.0001) {
      this.done_rendering = true;
    } else {
      this.done_rendering = false;
    }

    const kineticenergy = this.kineticenergy,
          total_node_velocity = this.total_node_velocity;
  }

  updateAll() {
    for (var j = 0; j < this.edges.length; j++) this.update.edge(this.edges[j], j);

    for (var j = 0; j < this.nodes.length; j++) this.update.node(this.nodes[j], j);
  }

  roundAll(prec) {
    for (var j = 0; j < this.nodes.length; j++) {
      _dom.Point.round(this.nodes[j], prec);

      _dom.Point.round(this.nodes[j].velocity, prec);

      _dom.Point.round(this.nodes[j].netforce, prec);
    }
  }

  serialize() {
    return {
      nodes: this.nodes.map(node => Node.prototype.toJS.call(node)),
      edges: this.edges.map(edge => Edge.prototype.toIdx.call(edge, this)),
      bbox: this.getBBox()
    };
  }

  get rect() {
    let ret = new _dom.PointList(this.nodes);
    return ret.rect();
  }

  get center() {
    return this.rect.center;
  }

  translate(x, y) {
    let p = typeof y == "number" ? new _dom.Point(x, y) : x;

    for (let i = 0; i < this.nodes.length; i++) {
      _dom.Point.move(this.nodes[i], p.x, p.y);
    }
  }

}

exports.Graph = Graph;

class Node extends _dom.Point {
  static clone(other) {
    let node = new Node(other.label, other.charge, other.mass, () => 0);
    node.velocity = other.velocity;
    node.netforce = other.netforce;
    node.x = other.x;
    node.y = other.y;
    return node;
  }

  constructor(label, charge = 60, mass = 100, prng) {
    super(prng() * 1000, prng() * 1000);
    this.charge = 0;
    this.mass = 0;
    this.velocity = null;
    this.netforce = null;
    this.label = null;
    this.charge = charge;
    this.mass = mass;
    this.velocity = new _dom.Point(0, 0);
    this.netforce = new _dom.Point(0, 0);
    this.label = label;
    console.log("Node(".concat(label, ",").concat(charge, ")"), _util.default.inspect(this, {
      newline: "",
      indent: "",
      spacing: " "
    }));
  }

  reset() {
    this.velocity.clear();
    this.netforce.clear();
  }

  applyAttractiveForce(n, scale = 0.1) {
    var distance = this.distance(n);
    var force = scale * Math.max(distance + 200, 1);
    this.netforce.move(force * Math.sin((n.x - this.x) / distance), force * Math.sin((n.y - this.y) / distance));
  }

  applyRepulsiveForce(n, scale = 1) {
    var d = Math.max(this.distance(n), 1);
    var f = -1 * scale * (this.charge * n.charge / (d * d));
    this.netforce.move(f * Math.sin((n.x - this.x) / d), f * Math.sin((n.y - this.y) / d));
  }

  toJS() {
    let ret = _util.default.filterKeys(this, key => ["charge", "mass", "velocity", "netforce", "label", "x", "y", "id"].indexOf(key) != -1);

    if (this.node && this.node.id !== undefined) ret.id = this.node.id;

    _dom.Point.round(ret, 0.001);

    return ret;
  }

}

class Edge extends _dom.Line {
  constructor(node_a, node_b) {
    super();
    this.a = null;
    this.b = null;
    if (node_a) this.a = node_a instanceof Node ? node_a : Node.clone(node_a);
    if (node_b) this.b = node_b instanceof Node ? node_b : Node.clone(node_b);

    if (!(node_a && node_b)) {
      throw new Error("Edge requires 2 nodes");
    }

    this.draggable = false;
  }

  get x1() {
    return this.a ? this.a.x : 0;
  }

  get y1() {
    return this.a ? this.a.y : 0;
  }

  get x2() {
    return this.b ? this.b.x : 0;
  }

  get y2() {
    return this.b ? this.b.y : 0;
  }

  set x1(v) {
    if (this.a) this.a.x = v;
  }

  set y1(v) {
    if (this.a) this.a.y = v;
  }

  set x2(v) {
    if (this.b) this.b.x = v;
  }

  set y2(v) {
    if (this.b) this.b.y = v;
  }

  toJS() {
    return {
      a: Node.prototype.toJS.call(this.a),
      b: Node.prototype.toJS.call(this.b)
    };
  }

  toIdx(graph) {
    return [graph.nodes.indexOf(this.a), graph.nodes.indexOf(this.b)];
  }

  draw(ctx) {}

}

if (module.exports) {
  module.exports.Node = Node;
  module.exports.Edge = Edge;
  module.exports.Graph = Graph;
}
