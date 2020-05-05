/**
 * Spatial Hash for 2-dimensional points optimization
 *
 * Bigger cell_size -> more object retrieved (less precise)
 *
 * Make sure that cell_size is equal or bigger than retrieving box
 */
'use strict';

/**
 *
 * @params {Object} config {
 *      cell_size: <int> size of cells
 * }
 * @constructor
 */
export function SpatialHash(config) {
  config = config || {};
  this.cell_size = config.cell_size || 50;
  // optimization to replace division by multiplication
  this.reverse_cell_size = 1 / this.cell_size;
  this.buckets = {};
}

/**
 * Point object must have "id" option if object removing is implied
 * @param point {x, y}
 */
SpatialHash.prototype.insert = function(point) {
  var hash = this.hash(point);
  var buckets = this.buckets;
  if(!buckets[hash]) {
    buckets[hash] = [];
  }
  buckets[hash].push(point);
};

/** @param {Object} point {
 *    x <int> - coord
 *    y <int> - coord
 *    w <int> - width of the box
 *    h <int> - height of the box
 *  }
 *  Retrieves buckets for the given point or for all 4 points of bounding box if width/heights are set
 */
SpatialHash.prototype.retrieve = function(point) {
  var x = point.x,
    y = point.y,
    w = point.w || 0,
    h = point.h || 0,
    objects = [],
    box,
    hash,
    foundBucket,
    doubleCmp = [],
    halfWidth,
    halfHeight,
    len = 0,
    fLen = 0;
  if(w || h) {
    halfWidth = w / 2;
    halfHeight = h / 2;
    box = [
      { x: x, y: y },
      // BOX POINTS
      { x: x - halfWidth, y: y - halfHeight }, //TOP LEFT
      { x: x - halfWidth, y: y + halfHeight }, //BOTTOM LEFT
      { x: x + halfWidth, y: y - halfHeight }, //TOP RIGHT
      { x: x + halfWidth, y: y + halfHeight } // BOTTOM RIGHT
    ];
  } else {
    box = [{ x: x, y: y }];
  }
  len = box.length;
  while(len--) {
    hash = this.hash(box[len]);
    // make sure there's no doubles
    if(doubleCmp.indexOf(hash) == -1) {
      doubleCmp.push(hash);
      foundBucket = this.buckets[hash];
      fLen = foundBucket && foundBucket.length;
      if(fLen) {
        while(fLen--) {
          objects = objects.concat(foundBucket[fLen]);
        }
      }
    }
  }
  return objects;
};

/** @param point {x, y} */
SpatialHash.prototype.hash = function(point) {
  var cell = this.reverse_cell_size;
  var hash = '' + parseInt(point.x * cell, 10);
  hash += parseInt(point.y * cell, 10);
  return hash;
};

SpatialHash.prototype.clear = function() {
  this.buckets = {};
};

SpatialHash.prototype.remove = function(id) {
  var list = [];
  for(var bucket in this.buckets) {
    if(this.buckets.hasOwnProperty(bucket)) {
      list = this.buckets[bucket];
      var len = list.length;
      while(len--) {
        if(list[len].id == id) {
          list.splice(len, 1);
        }
      }
    }
  }
};

function int(value) {
  return parseInt(value, 10);
}
w.SpatialHash = SpatialHash;
