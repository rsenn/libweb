import { Point, Line, Timer } from "./dom.js";
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

export function Graph({
  origin = new Point(0, 0),
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
  this.nodes.push(n);
  this.checkRedraw();
};

Graph.prototype.addEdge = function(e) {
  this.edges.push(e);
};

Graph.prototype.resetNodes = function() {
  for(var i = 0; i < this.nodes.length; i++) {
    var n = this.nodes[i];
    n.reset();
  }
};

Graph.prototype.checkRedraw = function() {
  // compute the force on each connection
  // only update if net force is greater than threshold
  this.kineticenergy = 0;
  this.total_node_velocity = 0;

  for(var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];
    node.netforce = new Point(0, 0);
    node.velocity = new Point(0, 0);
    if(1) {
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
  if(this.total_node_velocity < 0.0001) {
    this.done_rendering = true;
  } else {
    this.done_rendering = false;
  }

  const { kineticenergy, total_node_velocity } = this;

  //if(this.done_rendering)    this.timer.stop();
  // console.log("checkRedraw", { kineticenergy, total_node_velocity });
};

Graph.prototype.updateAll = function() {
  for(var j = 0; j < this.edges.length; j++) this.update.edge(this.edges[j]);
  for(var j = 0; j < this.nodes.length; j++) this.update.node(this.nodes[j]);
};

/**
 * Node
 *
 * @class      Node (name)
 * @param      {String}  label        A label
 * @param      {number}  [charge=60]  The charge
 */
export function Node(label, charge = 60) {
  //console.log(`Node(${label},${charge})`);
  var pos = new Point(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000));

  Point.call(this, pos.x, pos.y);

  this.charge = charge;
  this.mass = 100;
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
