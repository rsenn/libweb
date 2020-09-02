export class SweepLineClass {
  constructor() {
    this.objectNodeMap = new Map();
    this.queueHead = null;
  }

  add(object, loVal, hiVal) {
    let hiNode = new SweepLineClass.NodeClass(this, object, SweepLineClass._HI, hiVal);
    let loNode = new SweepLineClass.NodeClass(this, object, SweepLineClass._LO, loVal);

    this.objectNodeMap.set(object, { loNode, hiNode });
  }

  update(object, loVal, hiVal) {
    let n = this.objectNodeMap.get(object);

    if(n) {
      n.hiNode.x = hiVal || n.hiNode.x;
      this.sortNode(n.hiNode);

      n.loNode.x = loVal || n.loNode.x;
      this.sortNode(n.loNode);
    }
  }

  del(object) {
    n = this.objectNodeMap.get(object);

    if(n) {
      this.deleteNode(n.hiNode);
      this.deleteNode(n.loNode);
      this.objectNodeMap.delete(object);
    }
  }

  sortNode(node) {
    function moveNode() {
      //Remove node from current position in queue.
      this.deleteNode(node);

      //Add node to new position in queue.
      if(newLocation === null) {
        node.prev = null;
        node.next = this.queueHead;
        this.queueHead = node;
      } else {
        node.prev = newLocation;
        node.next = newLocation.next;
        if(newLocation.next) newLocation.next.prev = node;
        newLocation.next = node;
      }
    }

    //Walk the queue, moving node into the
    //proper spot of the queue based on the x
    //value.  First check against the 'prev' queue
    //node...
    let newLocation = node.prev;
    while(newLocation && node.x < newLocation.x) {
      newLocation = newLocation.prev;
    }

    if(newLocation !== node.prev) moveNode.call(this);

    //...then against the 'next' queue node.
    newLocation = node;
    while(newLocation.next && newLocation.next.x < node.x) {
      newLocation = newLocation.next;
    }

    if(newLocation !== node) moveNode.call(this);
  }

  deleteNode(node) {
    if(node.prev === null) this.queueHead = node.next;
    if(node.prev) node.prev.next = node.next;
    if(node.next) node.next.prev = node.prev;
  }

  findCollisions(collisionFunction) {
    let collision = [];
    let activeObjects = new Set();

    let node = this.queueHead;
    while(node) {
      if(node.loHi === SweepLineClass._LO) {
        let object = node.object;
        for(let ao of activeObjects) {
          //const ao = activeObjects[ o ];
          if(collisionFunction(object, ao)) {
            collision.push([object, ao]);
          }
        }
        activeObjects.add(object);
      } else {
        //node.loHi === SweepLineClass._HI
        activeObjects.delete(node.object);
      }

      node = node.next;
    }

    return collision;
  }

  print(printFunction) {
    let n = this.queueHead;
    while(n) {
      printFunction(n.object, n.loHi, n.x);
      n = n.next;
    }
  }
}

SweepLineClass._LO = false;
SweepLineClass._HI = true;

SweepLineClass.NodeClass = class {
  constructor(sweepLine, object, loHi, x) {
    this.object = object;
    this.parent = sweepLine;

    this.loHi = loHi;
    this.x = x;
    this.prev = null;
    this.next = null;

    if(sweepLine.queueHead) sweepLine.queueHead.prev = this;
    this.next = sweepLine.queueHead;
    sweepLine.queueHead = this;
    sweepLine.sortNode(this);
  }
};
