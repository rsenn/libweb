const X_BIT = 25;

export class SpatialHash2D {
  constructor(cellSizePow2 = 5) {
    this.cellSizePow2 = cellSizePow2 | 0;
    this.cellSize = 1 << this.cellSizePow2;
    this.rect2hashes = new Map();
    this.hash2rects = new Map();
    this.overlaps = new Map();
  }

  clear() {
    this.rect2hashes.clear();
    this.hash2rects.clear();
    this.overlaps.clear();
  }

  has(rect) {
    return this.rect2hashes.has(rect);
  }

  getRectsAt(x, y) {
    const cs = this.cellSize;
    const x0 = Math.floor(x / cs);
    const y0 = Math.floor(y / cs);
    return hash2rects.get((i << X_BIT) | j);
  }

  evalHashes(rect) {
    const [x, y, w, h] = rect;
    const hashes = [];
    const cs = this.cellSize;
    const x0 = Math.floor(x / cs);
    const y0 = Math.floor(y / cs);
    const x1 = Math.floor((x + w) / cs);
    const y1 = Math.floor((y + h) / cs);
    for(let i = x0; i <= x1; i++) {
      for(let j = y0; j <= y1; j++) {
        hashes.push((i << X_BIT) | j);
      }
    }
    return hashes;
  }

  add(rect) {
    if(this.has(rect)) {
      this.delete(rect);
    }
    const hashes = this.evalHashes(rect);
    this.rect2hashes.set(rect, hashes);
    //for ( let hash of hashes ) {
    hashes.forEach(hash => {
      if(!this.hash2rects.has(hash)) {
        this.hash2rects.set(hash, new Set([rect]));
      } else {
        const rects = this.hash2rects.get(hash);
        //for ( let r of rects ) {
        rects.forEach(r => {
          if(this.areRectsOverlap(rect, r)) {
            if(this.overlaps.has(rect)) {
              this.overlaps.get(rect).add(r);
            } else {
              this.overlaps.set(rect, new Set([r]));
            }
            if(this.overlaps.has(r)) {
              this.overlaps.get(r).add(rect);
            } else {
              this.overlaps.set(r, new Set([rect]));
            }
          }
        });
        rects.add(rect);
      }
    });
    return this;
  }

  delete(rect) {
    if(this.has(rect)) {
      //for ( let hash of this.rect2hashes.get( rect ) ) {
      this.rect2hashes.get(rect).forEach(hash => {
        const rectsSet = this.hash2rects.get(hash).delete(rect);
        if(rectsSet.size <= 0) {
          this.hash2rects.delete(hash);
        }
      });
      if(this.overlaps.has(rect)) {
        //for ( let r of this.overlaps.get( rect )) {
        this.overlaps.get(rect).forEach(r => {
          const rs = this.overlaps.get(r);
          if(rs && rs.size > 1) {
            rs.delete(rect);
          } else {
            this.overlaps.delete(r);
          }
        });
      }
    }
    return this;
  }

  areRectsOverlap(rect0, rect1) {
    const [x0, y0, w0, h0] = rect0;
    const [x1, y1, w1, h1] = rect1;
    return x0 < x1 + w1 && x1 < x0 + w0 && y0 < y1 + h1 && y1 < y0 + h0;
  }
}
export default SpatialHash2D;
