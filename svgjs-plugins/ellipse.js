export const ellipse = {
  NAME: 'ellipse',

  init() {
    // We start with a circle with radius 1 at the position of the cursor
    var p = this.startPoint;

    this.el.attr({ cx: p.x, cy: p.y, rx: 1, ry: 1 });
  },

  calc(e) {
    var p = this.transformPoint(e.clientX, e.clientY);

    var ellipse = {
      cx: this.startPoint.x,
      cy: this.startPoint.y,
      rx: Math.abs(p.x - this.startPoint.x),
      ry: Math.abs(p.y - this.startPoint.y),
    };

    this.snapToGrid(ellipse);
    this.el.attr(ellipse);
  },
};
