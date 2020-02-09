import { Point, Line, Timer, Element, BBox } from "./dom.js";
import Util from "./util.js";

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

export function Graph({ origin = new Point(0, 0), gravitate_to_origin = true, spacing = 1, timestep = 150, kineticenergy = 1, damping = 0.000005, total_node_velocity = 0, onUpdateNode = node => {}, onUpdateEdge = edge => {}, onRenderGraph = graph => {} }) {
  console.log(`Graph(${origin},${gravitate_to_origin})`);
  this.nodes = [];
  this.edges = [];
  this.config = { origin, spacing };
  this.update = { node: onUpdateNode, edge: onUpdateEdge };

  this.damping = damping;
  this.timestep = timestep;
  this.kineticenergy = kineticenergy;
  this.total_node_velocity = total_node_velocity;
  this.gravitate_to_origin = typeof gravitate_to_origin == "undefined" ? true : gravitate_to_origin;
  this.done_rendering = false;

  var g = this;
  var seq = 0;

  this.timer = Timer.interval(5, function() {
    // console.log("Graph timer", seq);
    if(!g.done_rendering) {
      g.checkRedraw();
    }
    if(g.done_rendering) {
      g.updateAll();

      g.timer.stop();

      onRenderGraph(g);
    }

    seq++;
    /*if(g.config.canvas.dragging) {
      g.resetNodes();
      g.done_rendering = false;
    }*/
  });
}

Graph.prototype.addNode = function(n) {
  n.index = this.nodes.length;
  this.nodes.push(n);
  this.checkRedraw();
};

Graph.prototype.addEdge = function(e) {
  e.index = this.edges.length;
  this.edges.push(e);
};

Graph.prototype.add = function(o) {
  if(o instanceof Node) this.nodes.push(o);
  if(o instanceof Edge) this.edges.push(o);
};
Graph.prototype.push = Graph.prototype.add;

Graph.prototype.resetNodes = function() {
  for(var i = 0; i < this.nodes.length; i++) {
    var n = this.nodes[i];
    n.reset();
  }
};

Graph.prototype.getConnections = function*(node, exclude = null) {
  for(var i = 0; i < this.edges.length; i++) {
    let edge = this.edges[i];
    let r = null;

    if(edge.a.equal(node)) r = edge.b;
    if(edge.b.equal(node)) r = edge.a;

    if(r !== null) {
      if(exclude !== null && Point.equal(exclude, r)) continue;
      yield r;
    }
  }
};

Graph.prototype.isLeafNode = function(node) {
  let c = [...this.getConnections(node)];
  return c.length <= 1;
};

Graph.prototype.branchNodes = function*() {
  for(var i = 0; i < this.nodes.length; i++) {
    if(!this.isLeafNode(this.nodes[i])) yield this.nodes[i];
  }
};

Graph.prototype.getBBox = function() {
  return BBox.from(this.nodes);
};

Graph.prototype.checkRedraw = function() {
  // compute the force on each connection
  // only update if net force is greater than threshold
  this.kineticenergy = 0;
  this.total_node_velocity = 0;

  for(var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];

    var isLeaf = this.isLeafNode(node);
    //    console.log("node: ", { isLeaf });

    node.netforce = new Point(0, 0);
    node.velocity = new Point(0, 0);
    if(1 /*!isLeaf*/) {
      //this.config.canvas.selection == null || this.config.canvas.selection != node) {
      if(this.gravitate_to_origin) {
        // gravitate to, and repel from origin
        var d = node.distance(this.config.origin);
        var af = 0.02 * Math.max(d, 1);
        node.netforce.x += af * Math.sin((this.config.origin.x - node.x) / d);
        node.netforce.y += af * Math.sin((this.config.origin.y - node.y) / d);
        var rf = -1 * (node.charge / (d * d));
        node.netforce.x += rf * Math.sin((this.config.origin.x - node.x) / d);
        node.netforce.y += rf * Math.sin((this.config.origin.y - node.y) / d);
      }
      for(var j = 0; j < this.edges.length; j++) {
        var con = this.edges[j];
        if(con.a == node || con.b == node) {
          // calculate the attractive force between nodes
          var other_node = con.a == node ? con.b : con.a;
          node.applyAttractiveForce(other_node);
        }
      }
      // calculate the repulsive force between nodes
      for(var k = 0; k < this.nodes.length; k++) {
        var rep_node = this.nodes[k];
        node.applyRepulsiveForce(rep_node, this.config.spacing || 1);
      }
      // we eventually want to stop the nodes from moving
      node.netforce.x = Math.abs(node.netforce.x) < 1 ? 0 : node.netforce.x;
      node.netforce.y = Math.abs(node.netforce.y) < 1 ? 0 : node.netforce.y;
      // set the velocity of the nodes based on their net force
      node.velocity.x = node.netforce.x == 0 ? 0 : (node.velocity.x + this.timestep * node.netforce.x) * this.damping;
      node.velocity.y = node.netforce.y == 0 ? 0 : (node.velocity.y + this.timestep * node.netforce.y) * this.damping;
    }
    // move the nodes scaled by constant timestep
    node.x += node.velocity.x * this.timestep;
    node.y += node.velocity.y * this.timestep;

    // magnitude of the velocity vector
    var velocity = Math.abs(Math.sqrt(node.velocity.x * node.velocity.x + node.velocity.y * node.velocity.y));
    // keep track of the net velocity of the entire system
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
          //  console.log("middleAngle: ", middleAngle);

          let gapStep = gapLen / leafNodes.length;
          let gapPos = middleAngle - gapLen / 2;

          for(let j = 0; j < leafNodes.length; j++) {
            let leaf = leafNodes[j];
            let index = leaf.index;
            let l = new Line(node, leaf);
            let len = l.length();

            let rel = Point.diff(leaf, node);

            // prettier-ignore
            newPositions.push({index, old: rel, x: node.x + Math.cos(gapPos) * 50, y: node.y + Math.sin(gapPos) * 50 });
            gapPos += gapStep;
          }
        }
      }

      //let indexes = Object.keys(lines).sort((a, b) => lines[a].angle() - lines[b].angle());
    }
  };

  if(this.total_node_velocity < 0.0001) {
    this.done_rendering = true;

    distributeLeafNodes();

    for(let i = 0; i < newPositions.length; i++) {
      let newPos = newPositions[i];

      /*  this.nodes[newPos.index].x = newPos.x;
      this.nodes[newPos.index].y = newPos.y;*/
    }
    console.log("newPositions: ", newPositions);
  } else {
    this.done_rendering = false;
  }

  const { kineticenergy, total_node_velocity } = this;

  //if(this.done_rendering)    this.timer.stop();
  // console.log("checkRedraw", { kineticenergy, total_node_velocity });
};

Graph.prototype.updateAll = function() {
  for(var j = 0; j < this.edges.length; j++) this.update.edge(this.edges[j], j);
  for(var j = 0; j < this.nodes.length; j++) this.update.node(this.nodes[j], j);
};

/**
 * Node
 *
 * @class      Node (name)
 * @param      {String}  label        A label
 * @param      {number}  [charge=60]  The charge
 */
export function Node(label, charge = 60, mass = 100) {
  //console.log(`Node(${label},${charge})`);

  this.x = Math.floor(Math.random() * 1000);
  this.y = Math.floor(Math.random() * 1000);

  this.charge = charge;
  this.mass = mass;
  this.velocity = new Point(0, 0);
  this.netforce = new Point(0, 0);
  this.label = label;
}
Node.prototype = Object.create(new Point());

Node.prototype.reset = function() {
  this.velocity.x = 0;
  this.velocity.y = 0;
  this.netforce.x = 0;
  this.netforce.y = 0;
};

Node.prototype.applyAttractiveForce = function(n, scale = 0.1) {
  var distance = this.distance(n);
  var force = scale * Math.max(distance + 200, 1);
  this.netforce.x += force * Math.sin((n.x - this.x) / distance);
  this.netforce.y += force * Math.sin((n.y - this.y) / distance);
};

Node.prototype.applyRepulsiveForce = function(n, scale = 1) {
  var d = Math.max(this.distance(n), 1);
  // calculate repulsion force between nodes
  var f = -1 * scale * ((this.charge * n.charge) / (d * d));
  this.netforce.x += f * Math.sin((n.x - this.x) / d);
  this.netforce.y += f * Math.sin((n.y - this.y) / d);
};

/**
 * { function_description }
 *
 * @class      Edge (name)
 * @param      {Point}  a
 * @param      {Point}  b
 */
export function Edge(a, b) {
  this.a = a;
  this.b = b;

  this.draggable = false;
}

Edge.prototype = Object.create(new Line());

// prettier-ignore
if(Util.defineGetterSetter) {
  Util.defineGetterSetter(Edge.prototype, "x1", function() {return this.a.x; }, function(v) {this.a.x = v; }, true );
  Util.defineGetterSetter(Edge.prototype, "y1", function() {return this.a.y; }, function(v) {this.a.y = v; }, true );
  Util.defineGetterSetter(Edge.prototype, "x2", function() {return this.b.x; }, function(v) {this.b.x = v; }, true );
  Util.defineGetterSetter(Edge.prototype, "y2", function() {return this.b.y; }, function(v) {this.b.y = v; }, true );
}

// we need to override the draw method so it updates on a redraw
Edge.prototype.draw = function(ctx) {
  /* ctx.strokeStyle = "#B2B2B2";
  ctx.beginPath();
  ctx.moveTo(this.a.x, this.a.y);
  ctx.lineTo(this.b.x, this.b.y);
  ctx.stroke();*/
};
