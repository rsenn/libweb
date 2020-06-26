import ObservableMembrane from '../proxy/observableMembrane.js';
import Util from '../util.js';
import { PathMapper } from './pathMapper.js';

export class TreeObserver extends ObservableMembrane {
  constructor(pathMapper) {
    if(!(pathMapper instanceof PathMapper)) pathMapper = new PathMapper();

    super({
      valueObserved: function(target, key) {
        let p = pathMapper.get(this.unwrapProxy(target) || target);
        let v;
        if(Util.isObject(p)) {
          v = p[key] || target[key];
          if(Util.isObject(v)) {
            for(let prop in v)
              if(Util.isObject(v[prop])) {
                pathMapper.set(v[prop], Util.isNumeric(prop) ? [...p, 'children', +prop] : [...p, prop]);
              }
          }
          p = [...p, key];
        }
      },
      valueMutated: function(target, key) {},
      valueDistortion: function(value) {
        if(!Util.isObject(value)) return value;
        let q = typeof value == 'object' ? Object.getPrototypeOf(value) : Object.prototype;
        let p = pathMapper.get(value);
        const a = [...arguments];
        if(q === Proxy.prototype) value = this.getReadOnlyProxy(value);
        return value;
      }
    });
    let treeObserver = this;
    ['valueDistortion', 'valueMutated', 'valueObserved'].forEach(name => (treeObserver[name] = treeObserver[name].bind(treeObserver)));

    this.mapper = pathMapper;
  }
}
