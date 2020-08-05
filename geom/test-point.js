import wru from '../wru.js';
import { Point } from '../geom/point.js';

wru.test([
  {
    name: 'Point.prototype.move',
    test: () => {
      let point = new Point(50, 50);
      point.move(10, 20);
      wru.assert('point.x == 60', point.x == 60);
      wru.assert('point.y == 70', point.y == 70);
    }
  },
  {
    name: 'Point.prototype.move_to',
    test: () => {
      let point = new Point(50, 50);
      point.move_to(60, 70);
      wru.assert('point.x == 60', point.x == 60);
      wru.assert('point.y == 70', point.y == 70);
    }
  },
  {
    name: 'Point.prototype.clear',
    test: () => {
      let point = new Point(50, 50);
      point.clear();
      wru.assert('point.x == 0', point.x == 0);
      wru.assert('point.y == 0', point.y == 0);
    }
  },
  {
    name: 'Point.prototype.set',
    test: () => {
      let point = new Point(50, 50);
      point.set(10, 5);
      wru.assert('point.x == 10', point.x == 10);
      wru.assert('point.y == 5', point.y == 5);
    }
  },
  {
    name: 'Point.prototype.clone',
    test: () => {
      let point = new Point(50, 50);
      let c = point.clone();
      wru.assert('point != c', point != c);
      wru.assert('point.equals(c)', point.equals(c));
    }
  },
  {
    name: 'Point.prototype.sum',
    test: () => {
      let point = new Point(10, 10);
      let sum = point.sum(5, 2);
      wru.assert('sum.x == 15', sum.x == 15);
      wru.assert('sum.y == 12', sum.y == 12);
    }
  },
  {
    name: 'Point.prototype.add',
    test: () => {
      let point = new Point(50, 50);
      point.add(5, 10);
      wru.assert('point.x == 55', point.x == 55);
      wru.assert('point.y == 60', point.y == 60);
      point.add(45, 40);
      wru.assert('point.x == 100', point.x == 100);
      wru.assert('point.y == 100', point.y == 100);
    }
  },
  {
    name: 'Point.prototype.diff',
    test: () => {
      let point = new Point(50, 50);
      let d = point.diff(10, 20);
      wru.assert('d.x == 40', d.x == 40);
      wru.assert('d.y == 30', d.y == 30);
    }
  },
  {
    name: 'Point.prototype.sub',
    test: () => {
      let point = new Point(50, 50);
      point.sub(5, 10);
      wru.assert('point.x == 45', point.x == 45);
      wru.assert('point.y == 40', point.y == 40);
      point.sub(45, 40);
      wru.assert('point.x == 0', point.x == 0);
      wru.assert('point.y == 0', point.y == 0);
    }
  },
  {
    name: 'Point.prototype.prod',
    test: () => {
      let point = new Point(50, 50);
      let prod = point.prod(4);
      wru.assert('prod.equals(new Point(200,200))', prod.equals(new Point(200, 200)));
    }
  },
  {
    name: 'Point.prototype.mul',
    test: () => {
      let point = new Point(50, 50);
      point.mul(0.2);
      wru.assert('point.equals(new Point(10,10))', point.equals(new Point(10, 10)));
    }
  },
  {
    name: 'Point.prototype.quot',
    test: () => {
      let point = new Point(84, 56);
      let quot = point.quot(7);
      wru.assert('quot.equals(new Point(12,8))', quot.equals(new Point(12, 8)));
    }
  },
  {
    name: 'Point.prototype.div',
    test: () => {
      let point = new Point(84, 56);
      point.div(7);
      wru.assert('point.equals(new Point(12,8))', point.equals(new Point(12, 8)));
    }
  },
  {
    name: 'Point.prototype.comp',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('point.comp().equals(new Point(-50,-50))', point.comp().equals(new Point(-50, -50)));
    }
  },
  {
    name: 'Point.prototype.neg',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('point.neg().equals(new Point(-50,-50))', point.neg().equals(new Point(-50, -50)));
    }
  },
  {
    name: 'Point.prototype.distanceSquared',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('point.distanceSquared()==5000', point.distanceSquared() == 5000);
    }
  },
  {
    name: 'Point.prototype.distance',
    test: () => {
      let point = new Point(Math.sqrt(50), Math.sqrt(50));
      wru.assert('point.distance() == 10', point.distance() == 10);
    }
  },
  {
    name: 'Point.prototype.equals',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('equals', point.equals({ x: 50, y: 50 }));
    }
  },
  {
    name: 'Point.prototype.round',
    test: () => {
      let point = new Point(5.0025, 5.0025);
      let rounded = point.round(0.001);
      //console.log("rounded:",rounded);
      wru.assert('rounded', rounded.equals({ x: 5.003, y: 5.003 }));
    }
  },
  {
    name: 'Point.prototype.sides',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('sides', !(point.sides() instanceof Point));
    }
  },
  {
    name: 'Point.prototype.dot',
    test: () => {
      let point = new Point(1, 2);
      let scalar = point.dot({ x: 2, y: 1 });
      wru.assert('dot', scalar === 4);
    }
  },
  {
    name: 'Point.prototype.fromAngle',
    test: () => {
      let point = Point.fromAngle((45 * Math.PI) / 180);
      wru.assert('fromAngle', point.round(0.00001).equals({ x: 0.70711, y: 0.70711 }));
    }
  },
  {
    name: 'Point.prototype.toAngle',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('toAngle', (point.toAngle() * 180) / Math.PI == 45);
    }
  },
  {
    name: 'Point.prototype.angle',
    test: () => {
      let point = new Point(50, 50);
      let angle = point.angle({ x: 100, y: 50 });
      wru.assert('angle', (angle * 180) / Math.PI == -90);
    }
  },
  {
    name: 'Point.prototype.rotate',
    test: () => {
      let point = new Point(50, 50);
      let rotated = point.rotate((45 * Math.PI) / 180);
      //console.log("rotated:",rotated.round(0.001));
      wru.assert('rotate', rotated.round(0.001).equals({ x: 0, y: 70.711 }));
    }
  },
  {
    name: 'Point.prototype.dimension',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('dimension', !(point.dimension() instanceof Point));
    }
  },
  {
    name: 'Point.prototype.toString',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('toString', !(point.toString() instanceof Point));
    }
  },
  {
    name: 'Point.prototype.toSource',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('toSource', !(point.toSource() instanceof Point));
    }
  },
  {
    name: 'Point.prototype.toObject',
    test: () => {
      let point = new Point(50, 50);
      let obj = point.toObject();

      wru.assert('Object.getPrototypeOf(obj) == Point.prototype', Object.getPrototypeOf(obj) == Point.prototype);
    }
  },
  {
    name: 'Point.prototype.toCSS',
    test: () => {
      let point = new Point(50, 50);
      let css = point.toCSS();
      wru.assert('css.left == "50px"', css.left == '50px');
      wru.assert('css.top== "50px"', css.top == '50px');
    }
  },
  {
    name: 'Point.prototype.toFixed',
    test: () => {
      let point = new Point(7.0711, 7.0711);
      let fixed = point.toFixed();
      wru.assert('toFixed', fixed.equals({ x: 7, y: 7 }));
    }
  },
  {
    name: 'Point.prototype.isNull',
    test: () => {
      let point = new Point(0, 0);
      wru.assert('isNull', !(point.isNull() instanceof Point));
    }
  },
  {
    name: 'Point.prototype.inside',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('inside', point.inside({ x: 0, y: 0, width: 100, height: 100 }));
    }
  },
  {
    name: 'Point.prototype.transform',
    test: () => {
      let point = new Point(50, 50);
      let matrix = [1.4142135623730951, -1.414213562373095, 10, 1.414213562373095, 1.4142135623730951, 10, 0, 0, 1];
      point.transform(matrix);
      wru.assert('transform', point.round(0.1).equals({ x: 10, y: 151.4 }));
    }
  },
  {
    name: 'Point.prototype.normalize',
    test: () => {
      let point = new Point(50, 50);
      wru.assert('normalize', point.normalize({ x1: 0, x2: 100, y1: 0, y2: 100 }));
    }
  }
]);
