(function(global) {
  global.Draw = function(ctx) {
    this.ctx = ctx;
  };
  var Draw = global.Draw;

  Draw.prototype = {
    circle: function(center, radius) {
      var ctx = this.ctx;
      ctx.beginPath();
      ctx.arc(center.x(), center.y(), radius, 0, 2 * Math.PI, false);
      ctx.lineWidth = 1;
      ctx.stroke();
    }, line: function(from, to) {
      var ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(from.x(), from.y());
      ctx.lineTo(to.x(), to.y());
      ctx.closePath();
      ctx.stroke();
    }, rect: function(topleft, size) {
      var context = this.ctx;
      context.beginPath();
      context.rect(topleft.x(), topleft.y(), size.x(), size.y());
      context.closePath();
      context.stroke();
    }, crect: function(center, size) {
      var ctx = this.ctx;
      this.rect(center.minus(size.scale(0.5)), size);
    }, color: function(p) {
      this.ctx.strokeStyle = p;
    }
  };
})(this);
