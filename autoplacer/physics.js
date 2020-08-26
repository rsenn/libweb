(function (global) {
  //{ constants

  //}

  let physics = (global.physics = {});

  physics.layout = function (opts, bodies, drawscene) {
    drawscene = drawscene || function () {};
    opts = opts || {};
    let attractForce = function (b) {
      let koef = opts.attractForce || 0.001;
      let dist = b.fix.minus(b.move);
      return dist.scaleto(koef * dist.veclength());
    };

    let overlapArea = function (b1, b2) {
      let x11 = b1.move.x() - b1.size.x() / 2,
        y11 = b1.move.y() - b1.size.y() / 2,
        x12 = b1.move.x() + b1.size.x() / 2;
      (y12 = b1.move.y() + b1.size.y() / 2), (x21 = b2.move.x() - b2.size.x() / 2), (y21 = b2.move.y() - b2.size.y() / 2), (x22 = b2.move.x() + b2.size.x() / 2), (y22 = b2.move.y() + b2.size.y() / 2);
      let x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
      let y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
      return x_overlap * y_overlap;
    };

    let overlapPoint = function (b1, p) {
      let x11 = b1.move.x() - b1.size.x() / 2,
        y11 = b1.move.y() - b1.size.y() / 2,
        x12 = b1.move.x() + b1.size.x() / 2,
        y12 = b1.move.y() + b1.size.y() / 2,
        x = p.x(),
        y = p.y();
      return x >= x11 && x <= x12 && y >= y11 && y <= y12;
    };

    let pushForce = function (b) {
      if (!opts.pushCenter) {
        return [0, 0];
      }
      let dist = b.move.minus(opts.pushCenter);
      let koef = opts.pushForce || 0.0001;
      return dist.scaleto(koef * Math.pow(dist.veclength(), -1));
    };

    let repulseForce = function (b, other) {
      if (!opts.pushCenter) {
        return [0, 0];
      }
      let dist = b.move.minus(other.move);
      let pdist;
      let koef = opts.repulseForce || 500;

      let f = [0, 0];
      if (overlapPoint(b, other.fix)) {
        pdist = b.move.minus(other.fix);
        f = pdist.scaleto(2);
      }

      return f.plus(dist.scaleto(0.1 * Math.min(300, Math.pow(Math.max(overlapArea(b, other)), 0.5))));
    };

    let i, j, k, b, f;
    let total = bodies.length;
    let step = 3;
    let damp = 0.87;
    for (i = 0; i < total; i++) {
      b = bodies[i];
      b.vel = [0, 0];
      b.mass = b.size.x() * b.size.y() * 0.001;
      b.move = b.fix;
    }

    let kin;
    let loop = 0;
    let recur;
    recur = function () {
      kin = 0;
      loop += 1;
      for (i = 0; i < total; i++) {
        b = bodies[i];
        f = attractForce(b);
        f = f.plus(pushForce(b));
        for (j = 0; j < total; j++) {
          if (i != j) {
            f = f.plus(repulseForce(b, bodies[j]));
          }
        }
        b.vel = b.vel.plus(f.scale(step)).scale(damp);
        b.tomove = b.move.plus(b.vel.scale(step));
        kin += b.mass * Math.pow(b.vel.veclength(), 2);
      }
      for (i = 0; i < total; i++) {
        b = bodies[i];
        b.move = b.tomove;
      }
      drawscene(bodies);
      if (kin > 10 || loop < 100) {
        setTimeout(recur, 20);
      }
    };
    recur();
  };
})(this);
