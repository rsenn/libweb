export class SpatialHash {
  constructor(range, cellSize) {
    //var getBounds = getBounds(range);
    this.cellSize = cellSize;
    if(range.width % cellSize !== 0 || range.height % cellSize !== 0)
      throw 'Exception: width and height must both be divisible by cell size';

    this.horizontalCells = range.width / cellSize;
    this.verticalCells = range.height / cellSize;
    this.hash = [];
    this.range = range;

    var i, j, a;
    for(i = 0; i <= this.verticalCells - 1; i++) {
      a = [];
      for(j = 0; j <= this.horizontalCells - 1; j++) a.push([]);
      this.hash.push(a);
    }

    this.itemCount = 0;
    this.cellCount = this.horizontalCells * this.verticalCells;
    this.id = -9e15; //max number of items
  }

  insert(item) {
    if(!item.range) throw 'Exception: item has no range object';
    var bounds = getBounds(item.range);
    var x1 = Math.max(~~((bounds.left - this.range.x) / this.cellSize), 0);
    var x2 = Math.min(~~((bounds.right - this.range.x) / this.cellSize), this.horizontalCells - 1);
    var y1 = Math.max(~~((bounds.top - this.range.y) / this.cellSize), 0);
    var y2 = Math.min(~~((bounds.bottom - this.range.y) / this.cellSize), this.verticalCells - 1);

    item.b = {
      x1: x1,
      x2: x2,
      y1: y1,
      y2: y2,
      id: this.id++
    };

    var i, j;
    for(i = y1; i <= y2; i++) {
      for(j = x1; j <= x2; j++) this.hash[i][j].push(item);
    }

    if(this.itemCount++ >= 9e15) throw 'Exception: more than 9E15 (900 000 000 000 000) items';
    else if(this.id > 9e15 - 1) this.id = -9e15;
  }

  remove(item) {
    if(!item.b) return;
    var x1 = item.b.x1;
    var x2 = item.b.x2;
    var y1 = item.b.y1;
    var y2 = item.b.y2;

    var i, j, k;
    for(i = y1; i <= y2; i++) {
      for(j = x1; j <= x2; j++) {
        k = this.hash[i][j].indexOf(item);
        if(k !== -1) this.hash[i][j].splice(k, 1);
      }
    }
    if(!delete item.b) item.b = undefined;
    this.itemCount--;
  }

  removeAll() {
    this.hash = [];
    var i, j, a;
    for(i = 0; i <= this.verticalCells - 1; i++) {
      a = [];
      for(j = 0; j <= this.horizontalCells - 1; j++) a.push([]);
      this.hash.push(a);
    }
    this.itemCount = 0;
  }

  update(item) {
    this.remove(item);
    this.insert(item);
  }

  srch(range, selector, callback, returnOnFirst) {
    var bounds = getBounds(range),
      cellSize = this.cellSize;

    // range might be larger than the hash's size itself
    var x1 = Math.max(~~((bounds.left - this.range.x) / this.cellSize), 0);
    var x2 = Math.min(~~((bounds.right - this.range.x) / this.cellSize), this.horizontalCells - 1);
    var y1 = Math.max(~~((bounds.top - this.range.y) / this.cellSize), 0);
    var y2 = Math.min(~~((bounds.bottom - this.range.y) / this.cellSize), this.verticalCells - 1);

    var i,
      j,
      k,
      l,
      m,
      o = [],
      p = [];
    for(i = y1; i <= y2; i++) {
      for(j = x1; j <= x2; j++) {
        k = this.hash[i][j];
        l = k.length;
        for(m = 0; m < l; m++)
          if(intersects(k[m].range, range) && p.indexOf(k[m].b.id) === -1) {
            p.push(k[m].b.id);
            if(selector) if (!selector(k[m])) continue;
            if(callback) callback(k[m]);
            if(returnOnFirst) return true;
            o.push(k[m]);
          }
      }
    }
    if(returnOnFirst) return false;
    return o;
  }

  any(range) {
    return this.srch(range, null, null, true);
  }

  query(range, selector) {
    return this.srch(range, selector, null, false);
  }

  find(range, callback) {
    return this.srch(range, null, callback, false);
  }
}

export function intersects(a, b) {
  return (
    a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y
  );
}

export function getBounds(range) {
  return {
    left: range.x,
    right: range.x + range.width,
    top: range.y,
    bottom: range.y + range.height
  };
}
