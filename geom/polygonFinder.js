import { Graph } from "./graph.js";
import { Intersection } from "./intersection.js";

export class PolygonFinder {
  static buildGraphFromSegments(segments) {
    let graph = new Graph();

    //First we find all of the intersections between all of the segments
    let intersections = PolygonFinder.findAllIntersectionsInSegments(segments);

    //Then we filter for the segments that have more than one intersection
    let connectedSegments = [];
    let connectedIntersections = [];
    segments.forEach(segment => {
      let intersectionsOnSegment = intersections.filter(
        intersection => intersection.line1 === segment || intersection.line2 === segment
      );

      if(intersectionsOnSegment.length > 1) {
        intersectionsOnSegment.forEach(intersection => {
          if(!connectedIntersections.includes(intersection)) {
            connectedIntersections.push(intersection);
          }
        });
        connectedSegments.push(segment);
      }
    });

    connectedSegments.forEach(segment => {
      let intersectionsOnSegment = connectedIntersections.filter(
        intersection => intersection.line1 === segment || intersection.line2 === segment
      );

      //For each intersection on a line, find the nearest neighbor in each direction.
      //TODO:  Investigate if this works/when it fails/if there is a better way.
      let nearestNeighborTrios = intersectionsOnSegment.map(
        (intersection, index, intersections) => {
          let nearestNeighborPair = [null, null];
          let minimumDistancePair = [Infinity, Infinity];
          let possibleNeighbors = intersections.filter(
            possibleNeighborIntersection => intersection != possibleNeighborIntersection
          );

          possibleNeighbors.forEach(possibleNeighbor => {
            let comparisonProperty = "";
            let distanceBetween = dist(
              intersection.point.x,
              intersection.point.y,
              possibleNeighbor.point.x,
              possibleNeighbor.point.y
            );

            if(possibleNeighbor.point.x !== intersection.point.x) {
              comparisonProperty = "x";
            } else if(possibleNeighbor.point.y !== intersection.point.y) {
              comparisonProperty = "y";
            } else {
              return null;
            }

            if(
              possibleNeighbor.point[comparisonProperty] < intersection.point[comparisonProperty]
            ) {
              if(nearestNeighborPair[0] == null || distanceBetween < minimumDistancePair[0]) {
                nearestNeighborPair[0] = possibleNeighbor;
                minimumDistancePair[0] = distanceBetween;
              }
            } else if(
              possibleNeighbor.point[comparisonProperty] > intersection.point[comparisonProperty]
            ) {
              if(nearestNeighborPair[1] == null || distanceBetween < minimumDistancePair[1]) {
                nearestNeighborPair[1] = possibleNeighbor;
                minimumDistancePair[1] = distanceBetween;
              }
            }
          });

          if(nearestNeighborPair[0] === null) {
            nearestNeighborPair[0] = intersection;
          }
          if(nearestNeighborPair[1] === null) {
            nearestNeighborPair[1] = intersection;
          }

          return [intersection, nearestNeighborPair[0], nearestNeighborPair[1]];
        }
      );

      nearestNeighborTrios.forEach(trio => {
        let nodes = [];
        trio.forEach(intersection => {
          let newNode = new Graph.Node(intersection.point);
          nodes.push(newNode);
          graph.addNode(newNode);
        });

        nodes.forEach(node => {
          graph.addNode(node);
        });

        graph.addConnection(nodes[0], nodes[1]);
        graph.addConnection(nodes[0], nodes[2]);
      });
    });
    graph.checkForDuplicateNodes();
    graph.checkForDuplicateConnections();
    return graph;
  }

  static polygonsFromCycles(cycles, graph) {
    let polygons = [];
    cycles.forEach(cycle => {
      let points = cycle.map(node => {
        return graph.nodes[node].point;
      });
      polygons.push(points);
    });
    return polygons;
  }

  static polygonsFromSegments(segments) {
    let graph = PolygonFinder.buildGraphFromSegments(segments);
    let cycles = graph.findMinimumCycles();
    console.log("graph:", graph);
    console.log("cycles:", cycles);
    return PolygonFinder.polygonsFromCycles(cycles, graph);
  }

  static findAllIntersectionsInSegments(segmentSet) {
    let intersections = [];
    for(let i = 0; i < segmentSet.length; i++) {
      for(let j = i + 1; j < segmentSet.length; j++) {
        let intersection = Intersection.findIntersection(segmentSet[i], segmentSet[j]);
        console.log(
          "findIntersection:",
          segmentSet[i].toObject(),
          segmentSet[j].toObject(),
          " = ",
          intersection
        );
        if(intersection !== null) {
          let alreadyInSet = false;
          for(let k = 0; k < intersections.length; k++) {
            if(Intersection.equals(intersections[k], intersection)) {
              alreadyInSet = true;
            }
          }
          if(!alreadyInSet) {
            intersections.push(intersection);
          }
        }
      }
    }
    return intersections;
  }
}
