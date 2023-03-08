import { EagleRef } from './ref.js';
import { EagleElement } from './element.js';
import { Matrix, Point } from '../geom.js';

export class EagleElementProxy {
  constructor(element, matrix) {
    this.element = element;
    this.matrix = matrix ? new Matrix(typeof matrix.toMatrix == 'function' ? matrix.toMatrix() : matrix) : null;
    this.invmatrix = matrix ? this.matrix.invert() : null;
  }

  getPoint(name = '') {
    const { element, matrix } = this;
    const p = new Point(+element['x' + name], +element['y' + name]);
    matrix.transform_point(p);
    return p;
  }

  setPoint(name = '', point) {
    const { element, invmatrix } = this;
    const p = new Point(point);
    invmatrix.transform_point(p);

    for(let coord of ['x', 'y']) element[coord + name] = p[coord];
    return p;
  }

  static create(element, matrix) {
    let instance = new EagleElementProxy(element, matrix);
    return new Proxy(instance, {
      set(target, prop, value) {
        if(typeof prop == 'string' && /^[xy][0-9]*$/.test(prop)) {
          let coord = prop[0];
          let name = prop.substring(1);
          let point = instance.getPoint(name);

          point[coord] = +value;
          instance.setPoint(name, point);
          return;
        }
        return Reflect.set(element, prop, value);
      },
      get(target, prop, receiver) {
        if(typeof prop == 'string' && /^[xy][0-9]*$/.test(prop)) {
          let coord = prop[0];
          let name = prop.substring(1);
          return instance.getPoint(name)[coord];
        }

        return Reflect.get(element, prop, receiver);
      },
      getPrototypeOf(target) {
        return EagleElementProxy.prototype;
      }
    });
  }
}
