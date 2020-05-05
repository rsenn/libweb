export class Graph {
  constructor() {
    this.nodes = [];
    this.connections = [];
  }

  checkForDuplicateNodes() {
    for(let i = 0; i < this.nodes.length; i++) {
      for(let j = i + 1; j < this.nodes.length; j++) {
        if(this.nodes[i].equals(this.nodes[j])) {
          console.log("DUPLICATE NODES, " + i + " and " + j);
        }
      }
    }
  }

  checkForDuplicateConnections() {
    for(let i = 0; i < this.connections.length; i++) {
      for(let j = i + 1; j < this.connections.length; j++) {
        if(this.connections[i].equals(this.connections[j])) {
          console.log("DUPLICATE CONNECTIONS, " + i + " and " + j);
        }
      }
    }
  }

  getAdjacencyList() {
    let adjacencyList = [];
    for(let i = 0; i < this.nodes.length; i++) {
      adjacencyList[i] = [];
      let node = this.nodes[i];
      node.id = i;
      let connectedNodes = this.getConnectedNodes(node);
      connectedNodes.forEach(node => {
        adjacencyList[i].push(this.nodes.indexOf(node));
      });
    }

    return adjacencyList;
  }

  getConnectedNodes(node) {
    let myConnections = this.connections.filter(
      connection => connection.node1 === node || connection.node2 === node
    );
    let connectedNodes = new Set();
    myConnections.forEach(connection => {
      connectedNodes.add(connection.node1).add(connection.node2);
    });
    connectedNodes.delete(node);
    return connectedNodes;
  }

  getConnectionsFromNode(node) {
    return this.connections.filter(
      connection => connection.node1 === node || connection.node2 === node
    );
  }

  getNeighboringNodes(node) {
    let nodeConnections = this.getConnectionsFromNode(node);
    let neighboringNodes = [];
    nodeConnections.forEach(nodeConnection => {
      if(nodeConnection.node1 !== node) {
        neighboringNodes.push(nodeConnection.node1);
      } else if(nodeConnection.node2 !== node) {
        neighboringNodes.push(nodeConnection.node2);
      }
    });
    return neighboringNodes;
  }

  isConnected(node1, node2) {
    return this.connections.some(connection => {
      return (
        (connection.node1 === node1 && connection.node2 === node2) ||
        (connection.node2 === node1 && connection.node1 === node2)
      );
    });
  }

  addConnection(node1, node2) {
    if(!node1 || !node2) {
      return false;
    }

    if(node1.equals(node2)) {
      return false;
    }

    let node1Matches = this.nodes.filter(node => Point.equals(node.point, node1.point));
    let node2Matches = this.nodes.filter(node => Point.equals(node.point, node2.point));

    if(node1Matches.length > 1) {
      console.log("Too many maches for node 1.  length = " + node1Matches.length);
      return false;
    }

    if(node2Matches.length > 1) {
      console.log("Too many maches for node 1.  length = " + node2Matches.length);
      return false;
    }

    if(node1Matches.length === 0) {
      console.log("No matches for node 1, doing nothing");
      return;
    }

    if(node2Matches.length === 0) {
      console.log("No matches for node 2, doing nothing");
      return;
    }

    let newConnection = new Graph.Connection(node1Matches[0], node2Matches[0]);

    let duplicateConnections = this.connections.filter(connection =>
      connection.equals(newConnection)
    );

    if(duplicateConnections.length > 1) {
      console.log("TODO:  HANDLE THIS.  THIS SHOULD NOT BE HAPPENING");
    } else if(duplicateConnections.length === 1) {
      return;
    } else {
      this.connections.push(newConnection);
    }
  }

  addNode(newNode) {
    let duplicateNodes = this.nodes.filter(node => Point.equals(newNode.point, node.point));

    if(duplicateNodes.length > 1) {
      console.log("TODO:  HANDLE THIS.  THIS SHOULD NOT BE HAPPENING");
    }

    if(duplicateNodes.length === 0) {
      this.nodes.push(newNode);
    }
  }

  findMinimumCyclesFromSource(adjacencyListSourceIndex) {
    const adjacencyList = this.getAdjacencyList();
    var neighbors = adjacencyList[adjacencyListSourceIndex];
    let paths = [];
    for(let i = 0; i < neighbors.length; i++) {
      let path = [adjacencyListSourceIndex];
      let startingNeighborIndex = neighbors[i];
      let tmpAdjacencyList = { ...adjacencyList };
      tmpAdjacencyList[startingNeighborIndex] = tmpAdjacencyList[startingNeighborIndex].filter(
        nodeIndex => nodeIndex !== adjacencyListSourceIndex
      );
      path = path.concat(
        Graph.findShortestPath(tmpAdjacencyList, startingNeighborIndex, adjacencyListSourceIndex)
      );
      paths.push(path);
    }
    return paths;
  }

  findMinimumCycles() {
    const adjacencyList = this.getAdjacencyList();
    let cycles = [];
    for(let i = 0; i < adjacencyList.length; i++) {
      let paths = this.findMinimumCyclesFromSource(i);
      cycles = cycles.concat(paths);
    }

    let cyclesToRemove = [];
    let uniqueCycles = [];
    for(let i = 0; i < cycles.length; i++) {
      if(
        uniqueCycles.filter(cycle => Graph.doArraysContainSameElements(cycle, cycles[i])).length ===
        0
      ) {
        uniqueCycles.push(cycles[i]);
      }
    }

    //Everything below this is a failed attempt to fix a problem where we miss certain kinds of polygons.
    //It can happen where a polygon isn't the shortest cycle from any of its points -- all of the points in the
    //polygon have clockwise-and-counter-clockwise cycles that are shorter through other polygons.  If that happens
    //we will end up missing that polygon.

    //One of the properties of this polygon is that all of its edges will have only been used once.  All edges should
    //be used in two polygons unless they are exterior edges.

    //This was an attempt to find all edges used only once and constrcut them missing polygons by repeating the
    //process using _just_ these missing edges.  It goes awry because without the other edges making up shorter paths
    //we end up constructing polygons that are too big and are combinations of our minimal paths.  The worst version
    //of this is that we construct a polygon out of all of the exterior lines, covering all of the others, but this
    //is not (I don't think) the only case that occurs.

    //It would be relatively easy to take the geometric representation of the polygons and check if they contain any
    //of the other points in the set, and discard them if they do.  This would solve the problem but I am trying to keep
    //the graph-theory representation separate from the geometric representation and holding out for a different solution.

    //The other option is to do something up above where we find the shortest cycle to a path, remove parts of it
    //from the adjacency list, and repeat the process until we don't find anymore paths.  This is probably the right
    //thing to do.

    let edgePairs = [];
    let edgePairCount = {};
    for(let i = 0; i < uniqueCycles.length; i++) {
      let cycle = uniqueCycles[i];
      for(let j = 1; j < cycle.length; j++) {
        let edgePair = [];
        if(cycle[j - 1] < cycle[j]) {
          edgePair = [cycle[j - 1], cycle[j]];
        } else {
          edgePair = [cycle[j], cycle[j - 1]];
        }

        if(edgePairCount[edgePair[0] + "," + edgePair[1]]) {
          edgePairCount[edgePair.join(",")]++;
        } else {
          edgePairCount[edgePair.join(",")] = 1;
        }
        edgePairs.push(edgePair);
      }
    }

    let edgesOnlyUsedOnce = [];
    edgePairs.forEach(edgePair => {
      if(edgePairCount[edgePair.join(",")] == 1) {
        edgesOnlyUsedOnce.push(edgePair);
      }
    });

    let leftoverAdjacencyList = [];
    edgesOnlyUsedOnce.forEach(edge => {
      if(leftoverAdjacencyList[edge[0]]) {
        leftoverAdjacencyList[edge[0]].push(edge[1]);
      } else {
        leftoverAdjacencyList[edge[0]] = [edge[1]];
      }
      if(leftoverAdjacencyList[edge[1]]) {
        leftoverAdjacencyList[edge[1]].push(edge[0]);
      } else {
        leftoverAdjacencyList[edge[1]] = [edge[0]];
      }
    });

    let extraPaths = [];
    for(let i = 0; i < leftoverAdjacencyList.length; i++) {
      let neighbors = leftoverAdjacencyList[i];
      if(neighbors) {
        for(let j = 0; j < neighbors.length; j++) {
          let path = [i];
          let startingNeighborIndex = neighbors[j];
          let tmpAdjacencyList = { ...leftoverAdjacencyList };
          tmpAdjacencyList[startingNeighborIndex] = tmpAdjacencyList[startingNeighborIndex].filter(
            nodeIndex => nodeIndex !== i
          );
          path = path.concat(Graph.findShortestPath(tmpAdjacencyList, startingNeighborIndex, i));
          extraPaths.push(path);
        }
      }
    }
    let leftoverCycles = [];
    for(let i = 0; i < extraPaths.length; i++) {
      if(
        leftoverCycles.filter(cycle => Graph.doArraysContainSameElements(cycle, extraPaths[i]))
          .length === 0
      ) {
        leftoverCycles.push(extraPaths[i]);
      }
    }

    let longestCycleLength = -1;
    let longestCycleIndex = -1;
    for(let i = 0; i < leftoverCycles.length; i++) {
      if(leftoverCycles[i].length > longestCycleLength) {
        longestCycleIndex = i;
        longestCycleLength = leftoverCycles[i].length;
      }
    }

    leftoverCycles.splice(longestCycleIndex, 1);
    uniqueCycles = leftoverCycles.concat(uniqueCycles);

    return uniqueCycles;
  }

  static doArraysContainSameElements(array1, array2) {
    if(array1.length !== array2.length) {
      return false;
    } else {
      for(let i = 0; i < array1.length; i++) {
        if(array2.includes(array1[i]) === false) {
          return false;
        }
      }
    }
    return true;
  }

  static findShortestPath(adjacencyList, source, target) {
    if(source == target) {
      print("SOURCE AND PATH ARE SAME");
      return [target];
    }
    let visitQueue = [source];
    let visitedStatusList = { source: true };
    let predecessorList = {};
    let nextInQueue = 0;
    while(nextInQueue < visitQueue.length) {
      let node = visitQueue[nextInQueue++];
      let neighbors = adjacencyList[node];

      for(let i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        if(!visitedStatusList[neighbor]) {
          visitedStatusList[neighbor] = true;
          if(neighbor === target) {
            // Check if the path is complete.
            let path = [target]; // If so, backtrack through the path.
            while(node !== source) {
              path.push(node);
              node = predecessorList[node];
            }
            path.push(node);
            path.reverse();
            return path;
          }
          predecessorList[neighbor] = node;
          visitQueue.push(neighbor);
        }
      }
    }
    print("there is no path from " + source + " to " + target);
  }
}

Graph.Node = class {
  constructor(point, connections) {
    this.point = point;
  }

  equals(node) {
    return Point.equals(node.point, this.point);
  }
};

Graph.Connection = class {
  constructor(node1, node2) {
    this.node1 = node1;
    this.node2 = node2;
  }

  equals(connection) {
    return (
      (this.node1.equals(connection.node1) && this.node2.equals(connection.node2)) ||
      (this.node2.equals(connection.node1) && this.node1.equals(connection.node2))
    );
  }
};
