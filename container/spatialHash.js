export function SpatialHash(range, bucketSize) {
  this.bucketSize = bucketSize || 100;
  this.range = range;

  this.init();
}

SpatialHash.prototype.init = function() {
  let b = getBounds(this.range),
    bucketSize = this.bucketSize;

  this.x1 = ~~(b.left / bucketSize);
  this.x2 = ~~(b.right / bucketSize);
  this.y1 = ~~(b.top / bucketSize);
  this.y2 = ~~(b.bottom / bucketSize);

  let z = {};
  let i = this.x1;
  for(; i <= this.x2; i++) {
    let j = this.y1,
      a = {};

    for(; j <= this.y2; j++) a[j] = [];
    z[i] = a;
  }

  this.hashes = z;
  this.itemCount = 0;
  this.horizontalBuckets = this.x2 - this.x1 + 1;
  this.verticalBuckets = this.y2 - this.y1 + 1;
  this.bucketCount = this.horizontalBuckets * this.verticalBuckets;
  this.nId = -9e15;
};

SpatialHash.prototype.insert = function(item) {
  if(!item.range) return;
  let b = getBounds(item.range),
    bucketSize = this.bucketSize;

  let x1 = Math.max(~~(b.left / bucketSize), this.x1);
  let x2 = Math.min(~~(b.right / bucketSize), this.x2);
  let y1 = Math.max(~~(b.top / bucketSize), this.y1);
  let y2 = Math.min(~~(b.bottom / bucketSize), this.y2);
  item.b = {
    x1,
    x2,
    y1,
    y2,
    id: this.nId++
  };

  let i = x1,
    j;
  for(; i <= x2; i++) {
    j = y1;
    for(; j <= y2; j++) this.hashes[i][j].push(item);
  }

  if(this.itemCount++ >= 9e15) throw new Error('SpatialHash: To ensure pure integer stability it must not have more than 9E15 (900 000 000 000 000) objects');
  else if(this.nId > 9e15 - 1) this.nId = -9e15;
};

SpatialHash.prototype.remove = function(item) {
  if(!item.b) return;

  let x1 = item.b.x1;
  let x2 = item.b.x2;
  let y1 = item.b.y1;
  let y2 = item.b.y2;

  let i = x1,
    j,
    k;
  for(; i <= x2; i++) {
    j = y1;
    for(; j <= y2; j++) {
      k = this.hashes[i][j].indexOf(item);
      if(k !== -1) this.hashes[i][j].splice(k, 1);
    }
  }
  if(!delete item.b) item.b = undefined;
  this.itemCount--;
};

SpatialHash.prototype.update = function(item) {
  this.remove(item);
  this.insert(item);
};

SpatialHash.prototype.srch = function(range, selector, callback, returnOnFirst) {
  let b = getBounds(range),
    bucketSize = this.bucketSize;

  //range might be larger than the hash's size itself
  let x1 = Math.max(~~(b.left / bucketSize), this.x1);
  let x2 = Math.min(~~(b.right / bucketSize), this.x2);
  let y1 = Math.max(~~(b.top / bucketSize), this.y1);
  let y2 = Math.min(~~(b.bottom / bucketSize), this.y2);

  let i = x1,
    j,
    k,
    l,
    m,
    o = [],
    p = [];
  for(; i <= x2; i++) {
    j = y1;
    for(; j <= y2; j++) {
      k = this.hashes[i][j];
      l = k.length;
      m = 0;
      for(; m < l; m++)
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
};

SpatialHash.prototype.any = function(range) {
  return this.srch(range, null, null, true);
};

SpatialHash.prototype.query = function(range, selector) {
  return this.srch(range, selector, null, false);
};

SpatialHash.prototype.find = function(range, callback) {
  return this.srch(range, null, callback, false);
};

function intersects(a, b) {
  let xa = a.x - a.w,
    ya = a.y - a.h,
    wa = a.w * 2,
    ha = a.h * 2,
    xb = b.x - b.w,
    yb = b.y - b.h,
    wb = b.w * 2,
    hb = b.h * 2;

  return xa <= xb + wb && xa + wa >= xb && ya <= yb + hb && ya + ha >= yb;
}

function getBounds(a) {
  return {
    left: a.x - a.w,
    right: a.x + a.w,
    top: a.y - a.h,
    bottom: a.y + a.h
  };
}
