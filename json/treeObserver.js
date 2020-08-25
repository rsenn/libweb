import ObservableMembrane from '../proxy/observableMembrane.js';
import Util from '../util.js';
import { PathMapper } from './pathMapper.js';
import { ImmutablePath } from './path.js';
import { ImmutableXPath } from '../xml/xpath.js';

export class TreeObserver extends ObservableMembrane {
  static readOnly = false;
  handlers = [];

  getType(value, path) {
    let type = null;
    path = path || this.mapper.get(value);
    if(!Util.isObject(value)) return null;
    //else if(Util.isArray(value) || ImmutablePath.isChildren([...path][path.length - 1])) type = 'NodeList';
    else if('tagName' in value) type = 'Element';
    else if(Util.isObject(path) && [...path].reverse()[0] == 'attributes') type = 'AttributeMap';
    else if(Util.isObject(path) && [...path].reverse()[0] == 'children') type = 'NodeList';
    else type = /attributes/.test(path + '') ? 'AttributeMap' : 'Node';
    //Util.log('getType', type);
    return type;
  }

  constructor(pathMapper, readOnly = true) {
    if(!(pathMapper instanceof PathMapper)) pathMapper = new PathMapper();

    super({
      valueObserved(target, key) {
        let basePath = getPath.call(this, target);
        let path = basePath.concat([key]);

        const value = target[key];
        if(Util.isObject(value)) {
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
        if(Util.isObject(obj) && !Util.isArray(obj) && key != 'tagName') {
        }
        for(let handler of this.handlers) {
          handler('change', target, path, value);
        }
      },
      valueDistortion(value) {
        let { target, key, path } = this.last || {};
        let valueType = typeof value;
        let valueClass = Util.className(value);
        let valueKeys = Util.isObject(value) ? Object.keys(value) : [];
        if(key || path) {
          //Util.log('valueDistortion', { key, path, valueType, valueClass, valueKeys });
          if(!Util.isObject(target)) return value;
          let q = Util.isObject(value) ? Object.getPrototypeOf(value) : Object.prototype;
          if(typeof value == 'string' && !isNaN(+value)) value = +value;
          if(Util.isObject(value)) {
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
      //Util.log('getPath', { key, path, target });
      let value;
      if(path !== null && Util.isObject(target) && key) {
        let obj = target[key] ? null : pathMapper.at(path);
        value = obj ? obj[key] : target[key];
        if(Util.isObject(value)) {
          for(let prop in value) if(Util.isObject(value[prop])) pathMapper.set(value[prop], Util.isNumeric(prop) && !ImmutablePath.isChildren(path.last) ? path.concat(['children', +prop]) : path.concat([prop]));
        }

        //path = path.concat(key ? [key] : []);
      }
      return path;
    }

    let treeObserver = this;
    ['valueDistortion', 'valueMutated', 'valueObserved'].forEach((name) => (treeObserver[name] = treeObserver[name].bind(treeObserver)));

    this.mapper = pathMapper;
    this.readOnly = !!readOnly;
  }

  types = Util.weakMapper((obj, key) => {
    //Util.log('types:', key, obj);
    return this.getType(obj, key);
  });

  /*
  get = Util.weakMapper((arg, p) => {
    let ret = this[this.readOnly ? 'getReadOnlyProxy' : 'getProxy'](arg);
    if(this.root === undefined) this.root = arg;
    else if(this.mapper.root && this.mapper.root != this.root) this.root = this.mapper.root;
    return ret;
  });*/

  entry = Util.weakMapper((arg, path, type) => {
    const { readOnly } = this;
    let proxy = this[readOnly ? 'getReadOnlyProxy' : 'getProxy'](arg);
    path = path || this.getPath(arg) || [];
    type = type || this.getType(arg, path);
    return { proxy, path, type };
  });

  getField = (field) => Util.transformer(this.entry, (ret) => (Util.isObject(ret) && field in ret ? ret[field] : ret));

  proxy = this.getField('proxy');
  type = this.getField('type');
  path = this.getField('path');

  getPath(node) {
    return this.mapper.get(node) || this.mapper.get(this.unwrap(node));
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
