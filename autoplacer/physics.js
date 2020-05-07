(function(global) {
  // { constants

  // }

  var physics = (global.physics = {});

  physics.layout = function(opts, bodies, drawscene) {
    drawscene = drawscene || function() {};
    opts = opts || {};
    var attractForce = function(b) {
      var koef = opts.attractForce || 0.001;
      var dist = b.fix.minus(b.move);
      return dist.scaleto(koef * dist.veclength());
    };

    var overlapArea = function(b1, b2) {
      var x11 = b1.move.x() - b1.size.x() / 2,
        y11 = b1.move.y() - b1.size.y() / 2,
        x12 = b1.move.x() + b1.size.x() / 2;
      (y12 = b1.move.y() + b1.size.y() / 2),
        (x21 = b2.move.x() - b2.size.x() / 2),
        (y21 = b2.move.y() - b2.size.y() / 2),
        (x22 = b2.move.x() + b2.size.x() / 2),
        (y22 = b2.move.y() + b2.size.y() / 2);
      var x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
      var y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
      return x_overlap * y_overlap;
    };

    var overlapPoint = function(b1, p) {
      var x11 = b1.move.x() - b1.size.x() / 2,
        y11 = b1.move.y() - b1.size.y() / 2,
        x12 = b1.move.x() + b1.size.x() / 2,
        y12 = b1.move.y() + b1.size.y() / 2,
        x = p.x(),
        y = p.y();
      return x >= x11 && x <= x12 && y >= y11 && y <= y12;
    };

    var pushForce = function(b) {
      if(!opts.pushCenter) {
        return [0, 0];
      }
      var dist = b.move.minus(opts.pushCenter);
      var koef = opts.pushForce || 0.0001;
      return dist.scaleto(koef * Math.pow(dist.veclength(), -1));
    };

    var repulseForce = function(b, other) {
      if(!opts.pushCenter) {
        return [0, 0];
      }
      var dist = b.move.minus(other.move);
      var pdist;
      var koef = opts.repulseForce || 500;

      var f = [0, 0];
      if(overlapPoint(b, other.fix)) {
        pdist = b.move.minus(other.fix);
        f = pdist.scaleto(2);
      }

      return f.plus(
        dist.scaleto(0.1 * Math.min(300, Math.pow(Math.max(overlapArea(b, other)), 0.5)))
      );
    };

    var i, j, k, b, f;
    var total = bodies.length;
    var step = 3;
    var damp = 0.87;
    for(i = 0; i < total; i++) {
      b = bodies[i];
      b.vel = [0, 0];
      b.mass = b.size.x() * b.size.y() * 0.001;
      b.move = b.fix;
    }

    var kin;
    var loop = 0;
    var recur;
    recur = function() {
      kin = 0;
      loop += 1;
      for(i = 0; i < total; i++) {
        b = bodies[i];
        f = attractForce(b);
        f = f.plus(pushForce(b));
        for(j = 0; j < total; j++) {
          if(i != j) {
            f = f.plus(repulseForce(b, bodies[j]));
          }
        }
        b.vel = b.vel.plus(f.scale(step)).scale(damp);
        b.tomove = b.move.plus(b.vel.scale(step));
        kin += b.mass * Math.pow(b.vel.veclength(), 2);
      }
      for(i = 0; i < total; i++) {
        b = bodies[i];
        b.move = b.tomove;
      }
      drawscene(bodies);
      if(kin > 10 || loop < 100) {
        setTimeout(recur, 20);
      }
    };
    recur();
  };
})(this);
