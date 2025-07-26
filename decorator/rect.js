export const RectDecorator = {
  get x1() {
    return this.x;
  },
  get y1() {
    return this.y;
  },
  get x2() {
    return this.x + this.width;
  },
  get y2() {
    return this.y + this.height;
  },
};

export default RectDecorator;
