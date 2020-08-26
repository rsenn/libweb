(function (global) {
  global.Draw = function (ctx) {
    this.ctx = ctx;
  };
  let Draw = global.Draw;

  Draw.prototype = {
    circle(center, radius) {
      let ctx = this.ctx;
      ctx.beginPath();
      ctx.arc(center.x(), center.y(), radius, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    line(from, to) {
      let ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(from.x(), from.y());
      ctx.lineTo(to.x(), to.y());
      ctx.closePath();
      ctx.stroke();
    },
    rect(topleft, size) {
      let context = this.ctx;
      context.beginPath();
      context.rect(topleft.x(), topleft.y(), size.x(), size.y());
      context.closePath();
      context.stroke();
    },
    crect(center, size) {
      let ctx = this.ctx;
      this.rect(center.minus(size.scale(0.5)), size);
    },
    color(p) {
      this.ctx.strokeStyle = p;
    }
  };
})(this);
