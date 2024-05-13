import { className, isNumeric, isObject, weakMapper } from '../misc.js';
import ObservableMembrane from '../proxy/observableMembrane.js';
import { ImmutableXPath } from '../xml/xpath.js';
import { ImmutablePath } from './path.js';
import { PathMapper } from './pathMapper.js';

export class TreeObserver extends ObservableMembrane {
  static readOnly = false;
  handlers = [];

  getType(value, path) {
    let type = null;
    path = path || this.mapper.get(value);
    if(!isObject(value)) return null;
    //else if(Array.isArray(value) || ImmutablePath.isChildren([...path][path.length - 1])) type = 'NodeList';
    else if('tagName' in value) type = 'Element';
    else if(isObject(path) && [...path].reverse()[0] == 'attributes') type = 'AttributeMap';
    else if(isObject(path) && [...path].reverse()[0] == 'children') type = 'NodeList';
    else type = /attributes/.test(path + '') ? 'AttributeMap' : 'Node';
    //console.log('getType', type);
    return type;
  }

  constructor(pathMapper, readOnly = true) {
    if(!(pathMapper instanceof PathMapper)) pathMapper = new PathMapper();

    super({
      valueObserved(target, key) {
        let basePath = getPath.call(this, target);
        let path = basePath.concat([key]);

        const value = target[key];
        if(isObject(value)) {
          pathMapper.set(value, path.concat([]));
          for(let handler of this.handlers) handler('access', target, path.concat([key]), value);
        }
        this.last = { target, key, path };
      },
      valueMutated(target, key) {
        let path = getPath.call(this, target, key);
        let obj = target;
        const idx = ['attributes', 'tagName', 'children'].indexOf(key);
        if(!(path instanceof ImmutablePath)) path = new ImmutablePath(path || [], true);
        let value = path.apply(obj);
        if(isObject(obj) && !Array.isArray(obj) && key != 'tagName') {
        }
        for(let handler of this.handlers) {
          handler('change', target, path, value);
        }
      },
      valueDistortion(value) {
        let { target, key, path } = this.last || {};
        let valueType = typeof value;
        let valueClass = className(value);
        let valueKeys = isObject(value) ? Object.keys(value) : [];
        if(key || path) {
          //console.log('valueDistortion', { key, path, valueType, valueClass, valueKeys });
          if(!isObject(target)) return value;
          let q = isObject(value) ? Object.getPrototypeOf(value) : Object.prototype;
          if(typeof value == 'string' && !isNaN(+value)) value = +value;
          if(isObject(value)) {
            this.types(value, key);
          }
        }
        return value;
      }
    });

    function getPath(target, key) {
      target = this.unwrapProxy(target);
      let path = pathMapper.get(target);

      path = new ImmutablePath(path, true);
      //path = path.concat(key ? [key] : []);
      //console.log('getPath', { key, path, target });
      let value;
      if(path !== null && isObject(target) && key) {
        let obj = target[key] ? null : pathMapper.at(path);
        value = obj ? obj[key] : target[key];
        if(isObject(value)) {
          for(let prop in value)
            if(isObject(value[prop]))
              pathMapper.set(
                value[prop],
                isNumeric(prop) && !ImmutablePath.isChildren(path.last)
                  ? path.concat(['children', +prop])
                  : path.concat([prop])
              );
        }

        //path = path.concat(key ? [key] : []);
      }
      return path;
    }

    let treeObserver = this;
    ['valueDistortion', 'valueMutated', 'valueObserved'].forEach(
      name => (treeObserver[name] = treeObserver[name].bind(treeObserver))
    );

    this.mapper = pathMapper;
    this.readOnly = !!readOnly;
  }

  types = weakMapper((obj, key) =>
    //console.log('types:', key, obj);
    this.getType(obj, key)
  );

  /*
  get = weakMapper((arg, p) => {
    let ret = this[this.readOnly ? 'getReadOnlyProxy' : 'getProxy'](arg);
    if(this.root === undefined) this.root = arg;
    else if(this.mapper.root && this.mapper.root != this.root) this.root = this.mapper.root;
    return ret;
  });*/

  entry = weakMapper((arg, path, type) => {
    const { readOnly } = this;
    let proxy = this[readOnly ? 'getReadOnlyProxy' : 'getProxy'](arg);
    path = path || this.getPath(arg) || [];
    type = type || this.getType(arg, path);
    return { proxy, path, type };
  });

  getField = field => {
    let ret = this.entry(field);
    console.log('getField', { field, ret });
    if(ret && isObject(ret) && field in ret) return ret[field];
    return ret;
  };

  proxy = this.getField('proxy');
  type = this.getField('type');
  path = this.getField('path');

  getPath(node) {
    if(this.mapper) return this.mapper.get(node) || this.mapper.get(this.unwrap(node));
  }

  getXPath(node) {
    let path = this.getPath(node);
    return this.root ? ImmutableXPath.from(path, this.root) : path;
  }

  unwrap(arg) {
    return this.unwrapProxy(arg);
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }
}
