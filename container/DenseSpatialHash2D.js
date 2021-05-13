export class DenseSpatialHash2D {
  constructor(width, height, bucketSizePow2 = 6) {
    this.bucketSize = 1 << bucketSizePow2;
    this.bucketSizePow2 = bucketSizePow2;
    this.bucketsInRow = width >> bucketSizePow2;
    this.bucketsInColumn = height >> bucketSizePow2;
    this.buckets = [];
    for(let i = 0; i < this.bucketsInColumn; i++) {
      for(let j = 0; j < this.bucketsInRow; j++) {
        this.buckets.push([]);
      }
    }
    this.width = width;
    this.height = height;
    this.rects = [];
    this.changedBuckets = new Set();
  }

  clear() {
    let k = 0;
    for(let i = 0; i < this.bucketsInColumn; i++) {
      for(let j = 0; j < this.bucketsInRow; j++) {
        this.buckets[k++].length = 0;
      }
    }
    this.rects.length = 0;
    this.changedBuckets.clear();
  }

  commitChanges() {
    this.changedBuckets.clear();
  }

  add(x, y, w, h) {
    const id = this.rects.length;
    const bucketSizePow2 = this.bucketSizePow2;
    const minX = x >> bucketSizePow2;
    const minY = y >> bucketSizePow2;
    const maxX = (x + w) >> bucketSizePow2;
    const maxY = (y + h) >> bucketSizePow2;
    this.rects.push([x, y, w, h, minX, minY, maxX, maxY]);
    this.addToBuckets(id, minX, minY, maxX, maxY);
    return id;
  }

  addToBuckets(id, minX, minY, maxX, maxY) {
    const hashY = this.bucketsInRow;
    const buckets = this.buckets;
    const changedBuckets = this.changedBuckets;
    for(let i = minY; i <= maxY; i++) {
      for(let j = minX; j <= maxX; j++) {
        const bucket = buckets[i * hashY + j];
        bucket.push(id);
        changedBuckets.add(bucket);
      }
    }
  }

  addRect(id, dx, dy, dw, dh) {
    if(id >= 0 && id < this.rects.length) {
      const bucketSizePow2 = this.bucketSizePow2;
      const rect = this.rects[id];
      const x = rect[0] + dx;
      const y = rect[1] + dy;
      const w = rect[2] + dw;
      const h = rect[3] + dh;
      const minX = x >> bucketSizePow2;
      const minY = y >> bucketSizePow2;
      const maxX = (x + w) >> bucketSizePow2;
      const maxY = (y + h) >> bucketSizePow2;
      const changed =
        minX !== rect[4] ||
        minY !== rect[5] ||
        maxX !== rect[6] ||
        maxY !== rect[7];
      if(changed) {
        this.deleteFromBuckets(id);
      }
      rect[0] = x;
      rect[1] = y;
      rect[2] = w;
      rect[3] = h;
      rect[4] = minX;
      rect[5] = minY;
      rect[6] = maxX;
      rect[7] = maxY;
      if(changed) {
        this.addToBuckets(id, minX, maxX, maxY);
      }
      return true;
    }
    return false;
  }

  setRect(id, x, y, w, h) {
    if(id >= 0 && id < this.rects.length) {
      const rect = this.rects[id];
      return this.addRect(id,
        x - rect[0],
        y - rect[1],
        w - rect[2],
        h - rect[3]
      );
    }
    return false;
  }

  addPos(id, dx, dy) {
    if(id >= 0 && id < this.rects.length) {
      const rect = this.rects[id];
      return this.addRect(id, dx, dy, 0, 0);
    }
    return false;
  }

  setPos(id, x, y) {
    if(id >= 0 && id < this.rects.length) {
      const rect = this.rects[id];
      return this.setRect(id, x - rect[0], y - rect[1], 0, 0);
    }
    return false;
  }

  has(id) {
    return id >= 0 && id < this.rects.length;
  }

  get(id) {
    return this.rects[id];
  }

  get size() {
    return this.rects.length;
  }

  deleteFromBuckets(id) {
    const rect = this.rects[id];
    const minX = rect[4];
    const minY = rect[5];
    const maxX = rect[6];
    const maxY = rect[7];
    const hashY = this.bucketsInRow;
    const buckets = this.buckets;
    const changedBuckets = this.changedBuckets;
    for(let i = minY; i <= maxY; i++) {
      for(let j = minX; j <= maxX; j++) {
        const bucket = buckets[i * hashY + j];
        //TODO: benchmark
        const index = bucket.indexOf(id);
        if(index === bucket.length - 1) {
          bucket.pop();
        } else {
          bucket[index] = bucket.pop();
        }
        changedBuckets.add(bucket);
        //bucket.splice( index )
      }
    }
  }

  delete(id) {
    const rects = this.rects;
    if(id >= 0 && id < rects.length) {
      if(id === rects.length - 1) {
        rects.pop();
      } else {
        rects[id] = rects.pop();
      }
      this.deleteFromBuckets(id);
      return true;
    }
    return false;
  }
}
export default DenseSpatialHash2D;
