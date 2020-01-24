import { Point, Line, Timer } from "./dom.js";

/* From https://github.com/ehayon/FDGraph */

export function Graph(origin = new Point(0, 0), gravitate_to_origin = true) {
  console.log(`Graph(${origin},${gravitate_to_origin})`);
  this.nodes = [];
  this.edges = [];
  this.config = { origin };
  console.log("origin: ", this.config.origin);
  //this.config.canvas = c;
  //this.config.origin = new Point(this.config.canvas.canvas.width / 2, this.config.canvas.canvas.height / 2);
  //this.config.canvas.add(new Circle(this.config.origin.x, this.config.origin.y, 2));
  this.damping = 0.000005;
  this.timestep = 150;
  this.kineticenergy = 1;
  this.total_node_velocity = 0;
  this.gravitate_to_origin = typeof gravitate_to_origin == "undefined" ? true : gravitate_to_origin;
  this.done_rendering = false;
  var g = this;
  var seq = 0;
  // set up a hover event for the nodes
  /*this.config.canvas.hoverFunction = function(e) {
    //var x = e.x + document.body.scrollLeft - $(g.config.canvas.canvas).offset().left;
    //var y = e.y + document.body.scrollTop - $(g.config.canvas.canvas).offset().top;
    for(var i = 0; i < g.nodes.length; i++) {
      if(g.nodes[i].contains(x, y)) {
        // the node g.nodes[i] is currently being hovered
      }
    }
  };*/
  this.timer = Timer.interval(3000, function() {
    // console.log("Graph timer", seq);
    if(!g.done_rendering) {
      g.checkRedraw();
    } else {
      g.resetNodes();
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
        node.applyRepulsiveForce(rep_node);
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
  if(this.total_node_velocity == 0) {
    this.done_rendering = true;
  } else {
    this.done_rendering = false;
  }
};

/*
 * Node
 */
export function Node(label, charge) {
  console.log(`Edge(${label},${charge})`);
  var pos = new Point(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000));
  // Circle.call(this, this.x, this.y, 10);
  Point.call(this, pos.x, pos.y);
  //  this.x = this.position.x; // makes it easier to access the point
  // this.y = this.position.y; // makes it easier to access the point
  this.charge = charge || 60;
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

Node.prototype.applyAttractiveForce = function(n) {
  var distance = this.distance(n);
  var force = 0.1 * Math.max(distance + 200, 1);
  this.netforce.x += force * Math.sin((n.x - this.x) / distance);
  this.netforce.y += force * Math.sin((n.y - this.y) / distance);
};

Node.prototype.applyRepulsiveForce = function(n) {
  var d = Math.max(this.distance(n), 1);
  // calculate repulsion force between nodes
  var f = -1 * ((this.charge * n.charge) / (d * d));
  this.netforce.x += f * Math.sin((n.x - this.x) / d);
  this.netforce.y += f * Math.sin((n.y - this.y) / d);
};

export function Edge(a, b) {
  console.log(`Edge(${a},${b})`);
  Line.call(this, a.x, a.y, b.x, b.y);
  //  Line.call(this, a, b);
  this.draggable = false;
}

Edge.prototype = Object.create(new Line());

// we need to override the draw method so it updates on a redraw
Edge.prototype.draw = function(ctx) {
  /* ctx.strokeStyle = "#B2B2B2";
  ctx.beginPath();
  ctx.moveTo(this.a.x, this.a.y);
  ctx.lineTo(this.b.x, this.b.y);
  ctx.stroke();*/
};
