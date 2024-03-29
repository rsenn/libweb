/**
 * Copyright (c) 2016 YOPEY YOPEY LLC
 * @author David Figatner
 * @license MIT
 */

/**
 * 2D Box Hash
 * example:
 *
 *  //the trick is to pick the right size for your hash based on your usage (i.e., the expected size of your objects)
 * var hash = new BoxHash(100);
 *
 *  //use your own 2D graphics libraries--I like PIXI.js
 * var circle = new Circle(10, 10, 5);
 *
 *  //each object must have an AABB bounding box {top-left x, top-left y, width, height}
 * circle.AABB = {5, 5, 10, 10};
 * hash.insert(circle);
 *
 *  //returns the circle
 * var results = hash.query({x: 0, y: 0, width: 10, height: 10});
 *
 *  //or iterate over the results to avoid creating new arrays
 * hash.query({x: 0, y: 0, width: 10, height: 10},
 *  function(object)
 *  {
 *      object.draw();
 *  }
 * );
 */
export class BoxHash {
  /**
   * @param {number} cellSize used to create hash
   */
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.list = {};
  }

  /**
   * inserts an object into the hash tree (also removes any existing spatialHashes)
   * side effect: adds object.spatialHashes to track existing hashes
   * @param {object} object
   * @param {object} object.AABB bounding box
   * @param {number} object.AABB.x
   * @param {number} object.AABB.y
   * @param {number} object.AABB.width
   * @param {number} object.AABB.height
   */
  insert(object) {
    if(!object.spatial) {
      object.spatial = { hashes: [] };
    }
    let AABB = object.AABB;
    let x1 = Math.floor(AABB.x / this.cellSize);
    x1 = x1 < 0 ? 0 : x1;
    let y1 = Math.floor(AABB.y / this.cellSize);
    y1 = y1 < 0 ? 0 : y1;
    let x2 = Math.floor((AABB.x + AABB.width) / this.cellSize);
    x2 = x2 >= this.width ? this.width - 1 : x2;
    let y2 = Math.floor((AABB.y + AABB.height) / this.cellSize);
    y2 = y2 >= this.height ? this.height - 1 : y2;
    //only remove and insert if mapping has changed
    if(object.spatial.x1 !== x1 || object.spatial.y1 !== y1 || object.spatial.x2 !== x2 || object.spatial.y2 !== y2) {
      if(object.spatial.maps.length) {
        this.remove(object);
      }
      for(let y = y1; y <= y2; y++) {
        for(let x = x1; x <= x2; x++) {
          let key = x + ' ' + y;
          if(!this.list[key]) {
            this.list[key] = [object];
          } else {
            this.list[key].push(object);
          }
          object.spatial.hashes.push({ list, key });
        }
      }
      object.spatial.x1 = x1;
      object.spatial.y1 = y1;
      object.spatial.x2 = x2;
      object.spatial.y2 = y2;
    }
  }

  /**
   * removes existing object from the hash table
   * @param {object} object
   */
  remove(object) {
    while(object.spatial.hashes.length) {
      let entry = object.spatial.hashes.pop();
      if(entry.list.length === 1) {
        this.list[entry.key] = null;
      } else {
        let index = entry.list.indexOf(object);
        entry.list.splice(index, 1);
      }
    }
  }

  /**
   * returns an array of objects contained within bounding box
   * @param {object} AABB bounding box to search
   * @param {number} object.AABB.x
   * @param {number} object.AABB.y
   * @param {number} object.AABB.width
   * @param {number} object.AABB.height
   * @return {object[]} search results
   */
  query(AABB) {
    let results = [];
    let x1 = Math.floor(AABB.x / this.cellSize);
    x1 = x1 < 0 ? 0 : x1;
    let y1 = Math.floor(AABB.y / this.cellSize);
    y1 = y1 < 0 ? 0 : y1;
    let x2 = Math.floor((AABB.x + AABB.width) / this.cellSize);
    x2 = x2 >= this.width ? this.width - 1 : x2;
    let y2 = Math.floor((AABB.y + AABB.height) / this.cellSize);
    y2 = y2 >= this.height ? this.height - 1 : y2;
    for(let y = y1; y <= y2; y++) {
      for(let x = x1; x <= x2; x++) {
        let entry = this.list[x + ' ' + y];
        if(entry) {
          results = results.concat(entry.list);
        }
      }
    }
    return results;
  }

  /**
   * iterates through objects contained within bounding box
   * stops iterating if the callback returns true
   * @param {object} AABB bounding box to search
   * @param {number} object.AABB.x
   * @param {number} object.AABB.y
   * @param {number} object.AABB.width
   * @param {number} object.AABB.height
   * @param {function} callback
   * @return {boolean} true if callback returned early
   */
  queryCallback(AABB, callback) {
    let x1 = Math.floor(AABB.x / this.cellSize);
    x1 = x1 < 0 ? 0 : x1;
    let y1 = Math.floor(AABB.y / this.cellSize);
    y1 = y1 < 0 ? 0 : y1;
    let x2 = Math.floor((AABB.x + AABB.width) / this.cellSize);
    x2 = x2 >= this.width ? this.width - 1 : x2;
    let y2 = Math.floor((AABB.y + AABB.height) / this.cellSize);
    y2 = y2 >= this.height ? this.height - 1 : y2;
    for(let y = y1; y <= y2; y++) {
      for(let x = x1; x <= x2; x++) {
        let entry = this.list[x + ' ' + y];
        if(entry) {
          for(let i = 0; i < entry.list.length; i++) {
            if(callback(entry.list[i])) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * helper function to evaluate hash table
   * @return {number} the number of buckets in the hash table
   * */
  getBuckets() {
    let count = 0;
    for(let key in this.list) {
      count++;
    }
    return count;
  }

  /**
   * helper function to evaluate hash table
   * @return {number} the average number of entries in each bucket
   */
  getAverageSize() {
    let total = 0;
    for(let key in this.list) {
      total += this.list[key].length;
    }
    return total / this.getBuckets();
  }

  /**
   * helper function to evaluate the hash table
   * @return {number} the largest sized bucket
   */
  getLargest() {
    let largest = 0,
      object;
    for(let key in this.list) {
      if(this.list[key].length > largest) {
        largest = this.list[key].length;
        object = this.list[key];
      }
    }
    return largest;
  }

  /** helper function to evalute the hash table
   * @param {object} AABB bounding box to search
   * @param {number} object.AABB.x
   * @param {number} object.AABB.y
   * @param {number} object.AABB.width
   * @param {number} object.AABB.height
   * @return {number} sparseness percentage
   */
  getSparseness(AABB) {
    let count = 0,
      total = 0;
    let x1 = Math.floor(AABB.x / this.cellSize);
    let y1 = Math.floor(AABB.y / this.cellSize);
    let x2 = Math.ceil((AABB.x + AABB.width) / this.cellSize);
    let y2 = Math.ceil((AABB.y + AABB.height) / this.cellSize);
    for(let y = y1; y < y2; y++) {
      for(let x = x1; x < x2; x++) {
        count += this.list[x + ' ' + y] ? 1 : 0;
        total++;
      }
    }
    return count;
  }
}
