import { Point, Size, PointList, Line, BBox } from './geom.js';
import Util from './util.js';

/* From https://github.com/ehayon/FDGraph */

/**
 * { function_description }
 *
 * @class      Graph (name)
 * @param      {Object}   options
 * @param      {Point}    [options.origin=new Point(0,0)]     origin
 * @param      {boolean}  [options.gravitate_to_origin=true]  gravitate to origin
 * @param      {number}   [options.spacing=1]                 spacing
 * @param      {number}   [options.timestep=150]              time step
 * @param      {number}   [options.kineticenergy=1]           kinetic energy
 * @param      {number}   [options.damping=0.000005]          damping
 * @param      {number}   [options.total_node_velocity=0]     The total node velocity
 * @param      {function} [options.onUpdateNode=node=>{}]     update node callback
 * @param      {function} [options.onUpdateEdge=edge=>{}]     update edge callback
 */

export class Graph {
  constructor(options = {}) {
    let {
      origin = new Point(0, 0),
      size = new Size(1000, 1000),
      prng = Math.random,
      gravitate_to_origin = true,
      charge = 100,
      mass = 240,
      spacing = 3,
      timestep = 150,
      damping = 0.000005,
      onUpdateNode = node => true,
      onUpdateEdge = edge => true,
      onRenderGraph = graph => true
    } = options;

    console.log(`Graph(${origin},${gravitate_to_origin})`);
    this.nodes = [];
    this.edges = [];
    this.config = { origin, spacing, size };
    this.update = { node: onUpdateNode, edge: onUpdateEdge };

    this.damping = damping;
    this.timestep = timestep;

    this.gravitate_to_origin =
      typeof gravitate_to_origin == 'undefined' ? false : gravitate_to_origin;
    this.done_rendering = false;
    this.prng = prng;

    let g = this;
    let seq = 0;
  }

  animate(update = () => {}) {
    const g = this;
    let i = 0;
    g.done_rendering = false;

    this.timer = Timer.interval(5, () => {
      if(!g.done_rendering) {
        g.checkRedraw();
      }
      if(g.done_rendering) {
        g.updateAll();
        g.timer.stop();
      }
      update(g, i++);
    });
  }

  addNode(n, charge = this.config.charge, mass = this.config.mass) {
    if(!(n instanceof Node)) n = new Node(n, charge, mass, this.config.size ? () => 0 : this.prng);
    n.index = this.nodes.length;
    this.nodes.push(n);

    if(this.config.size) {
      const { width, height } = this.config.size;
      n.x = this.prng() * width - width / 2;
      n.y = this.prng() * height - height / 2;
    }

    return this.nodes[this.nodes.length - 1];
  }

  findNode(value, key = 'label') {
    return Util.find(this.nodes, value, key);
  }

  randomize() {
    const { width = 1000, height = 1000 } = this.config.size;

    for(let node of this.nodes) {
      node.x = this.prng() * width - width / 2;
      node.y = this.prng() * height - height / 2;
    }
  }

  addEdge(e) {
    let args = [...arguments];
    let ids = [];
    if(!(e instanceof Edge)) {
      console.log('addEdge', args);
      e = new Edge(args[0], args[1]);
      ids = [this.nodes.indexOf(args[0]), this.nodes.indexOf(args[1])];
    }
    e.index = this.edges.length;
    e.ids = ids;
    this.edges.push(e);
    return this.edges[this.edges.length - 1];
  }

  add(o) {
    if(o instanceof Node) this.nodes.push(o);
    if(o instanceof Edge) this.edges.push(o);
  }

  push() {
    return this.add.apply(this, [...arguments]);
  }

  resetNodes() {
    for(let i = 0; i < this.nodes.length; i++) {
      let n = this.nodes[i];
      n.reset();
    }
  }

  *getConnections(node, exclude = null) {
    for(let i = 0; i < this.edges.length; i++) {
      let edge = this.edges[i];
      let r = null;

      if(edge.a && Point.equals(edge.a, node)) r = edge.b;
      if(edge.b && Point.equals(edge.b, node)) r = edge.a;

      if(r !== null) {
        if(exclude !== null && Point.equals(exclude, r)) continue;
        yield r;
      }
    }
  }

  isLeafNode(node) {
    let c = [...this.getConnections(node)];
    return c.length <= 1;
  }

  *branchNodes() {
    for(let i = 0; i < this.nodes.length; i++) {
      if(!this.isLeafNode(this.nodes[i])) yield this.nodes[i];
    }
  }

  get bbox() {
    return BBox.from(this.nodes);
  }

  checkRedraw() {
    this.kineticenergy = 0;
    this.total_node_velocity = 0;

    for(let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];

      let isLeaf = this.isLeafNode(node);

      node.netforce = new Point(0, 0);
      node.velocity = new Point(0, 0);

      if(1 /*!isLeaf*/) {
        if(this.gravitate_to_origin) {
          const { origin } = this.config;

          let d = node.distance(origin);
          let af = 0.02 * Math.max(d, 1);
          let od = Point.diff(origin, node);

          node.netforce.move(af * Math.sin(od.x / d), af * Math.sin(od.y / d));

          let rf = -1 * (node.charge / (d * d));
          node.netforce.move(rf * Math.sin(od.x / d), rf * Math.sin(od.y / d));
        }
        for(let j = 0; j < this.edges.length; j++) {
          let con = this.edges[j];
          if(con.a == node || con.b == node) {
            let other_node = con.a == node ? con.b : con.a;
            node.applyAttractiveForce(other_node);
          }
        }

        for(let k = 0; k < this.nodes.length; k++) {
          let rep_node = this.nodes[k];
          node.applyRepulsiveForce(rep_node, this.config.spacing || 1);
        }

        node.netforce.x = Math.abs(node.netforce.x) < 1 ? 0 : node.netforce.x;
        node.netforce.y = Math.abs(node.netforce.y) < 1 ? 0 : node.netforce.y;

        let newVel = node.netforce.prod(this.timestep).sum(node.velocity).prod(this.damping);

        node.velocity.x = node.netforce.x == 0 ? 0 : newVel.x;
        node.velocity.y = node.netforce.y == 0 ? 0 : newVel.y;
      }

      Point.add(node, node.velocity.prod(this.timestep));

      let velocity = node.velocity.distance();

      this.total_node_velocity += velocity;
      this.kineticenergy += node.mass * (velocity * velocity);
    }

    function findBiggestGap(angles) {
      let ret = [];
      let bdiff = 0;
      for(let i = 0; i < angles.length; i++) {
        let a = angles[i];
        let b = angles[(i + 1) % angles.length];

        let diff = Math.abs(b - a);

        if(diff > bdiff) {
          bdiff = diff;
          ret = [a, b];
        }
      }
      return ret;
    }
    let newPositions = [];

    const distributeLeafNodes = () => {
      for(let node of this.branchNodes()) {
        let connections = [...this.getConnections(node)];
        let nonLeafNodes = connections.filter(c => !this.isLeafNode(c));
        let leafNodes = connections.filter(c => this.isLeafNode(c));

        let lines = nonLeafNodes.map(c => new Line(node, c));
        let angles = lines.map(l => l.angle());
        let middleAngle;
        let gapLen;

        if(leafNodes.length) {
          if(angles.length >= 2) {
            let gap = findBiggestGap(angles);
            middleAngle = (gap[1] + gap[0]) / 2;
            gapLen = gap[1] - gap[0];
          } else if(angles.length == 1) {
            middleAngle = angles[0] + Math.PI;
            if(middleAngle > Math.PI) middleAngle -= Math.PI;
            gapLen = Math.PI;
          }

          if(Math.abs(middleAngle) > 0) {
            let gapStep = gapLen / leafNodes.length;
            let gapPos = middleAngle - gapLen / 2;

            for(let j = 0; j < leafNodes.length; j++) {
              let leaf = leafNodes[j];
              let index = leaf.index;
              let l = new Line(node, leaf);
              let len = l.length();

              let rel = Point.diff(leaf, node);

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
    };

    if(this.total_node_velocity < 0.0001) {
      this.done_rendering = true;
    } else {
      this.done_rendering = false;
    }
    const { kineticenergy, total_node_velocity } = this;
  }

  updateAll() {
    for(var j = 0; j < this.edges.length; j++) this.update.edge(this.edges[j], j);
    for(var j = 0; j < this.nodes.length; j++) this.update.node(this.nodes[j], j);
  }

  roundAll(prec) {
    for(let j = 0; j < this.nodes.length; j++) {
      Point.round(this.nodes[j], prec);
      Point.round(this.nodes[j].velocity, prec);
      Point.round(this.nodes[j].netforce, prec);
    }
  }

  serialize() {
    return {
      nodes: this.nodes.map(node => Node.prototype.toJS.call(node)),
      edges: this.edges.map(edge => Edge.prototype.toIdx.call(edge, this)),
      bbox: this.bbox,
      config: this.config
    };
  }

  deserialize(nodes, edges, config) {
    this.nodes = [];
    this.edges = [];
    for(let n of nodes) {
      let node = this.addNode(n.label, n.charge, n.mass);
      node.x = n.x;
      node.y = n.y;
      node.label = n.label;
      node.id = n.id;
      if(n.color !== undefined) node.color = n.color;
      //console.log("node:", node);
    }
    for(let e of edges) {
      let edge = this.addEdge(this.nodes[e[0]], this.nodes[e[1]]);
    }
    this.config = config;
  }

  get rect() {
    let ret = new PointList(this.nodes);
    return ret.rect();
  }

  get center() {
    return this.rect.center;
  }

  translate(x, y) {
    let p = typeof y == 'number' ? new Point(x, y) : x;
    for(let i = 0; i < this.nodes.length; i++) {
      Point.move(this.nodes[i], p.x, p.y);
    }
  }
}

export class Node extends Point {
  charge = 0;
  mass = 0;
  velocity = null;
  netforce = null;
  label = null;

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

    this.charge = charge;
    this.mass = mass;
    this.velocity = new Point(0, 0);
    this.netforce = new Point(0, 0);
    this.label = label;

    /*
    console.log(`Node(${label},${charge})`,
      Util.inspect(this, { newline: "", indent: "", spacing: " " })
    );*/
  }

  reset() {
    this.velocity.clear();
    this.netforce.clear();
  }

  applyAttractiveForce(n, scale = 0.1) {
    let distance = this.distance(n);
    let force = scale * Math.max(distance + 200, 1);

    this.netforce.move(
      force * Math.sin((n.x - this.x) / distance),
      force * Math.sin((n.y - this.y) / distance)
    );
  }

  applyRepulsiveForce(n, scale = 1) {
    let d = Math.max(this.distance(n), 1);

    let f = -1 * scale * ((this.charge * n.charge) / (d * d));

    this.netforce.move(f * Math.sin((n.x - this.x) / d), f * Math.sin((n.y - this.y) / d));
  }

  toJS() {
    let ret = Util.filterKeys(
      this,
      key => ['charge', 'mass', 'label', 'x', 'y', 'id', 'color'].indexOf(key) != -1
    );
    if(this.node && this.node.id !== undefined) ret.id = this.node.id;
    Point.round(ret, 0.001);
    return ret;
  }
}

export class Edge {
  a = null;
  b = null;

  constructor(node_a, node_b) {
    // super();
    if(node_a) this.a = node_a instanceof Node ? node_a : Node.clone(node_a);
    if(node_b) this.b = node_b instanceof Node ? node_b : Node.clone(node_b);

    if(!(node_a && node_b)) {
      throw new Error('Edge requires 2 nodes\n' + new Error().stack);
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
    if(this.a) this.a.x = v;
  }
  set y1(v) {
    if(this.a) this.a.y = v;
  }
  set x2(v) {
    if(this.b) this.b.x = v;
  }
  set y2(v) {
    if(this.b) this.b.y = v;
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

  get [Symbol.toStringTag]() {
    return 'Edge';
  }

  [Symbol.for('nodejs.util.inspect.custom')](options = {}) {}
}

const fdgraph = { Graph, GraphEdge: Edge, GraphNode: Node };

export default fdgraph;
