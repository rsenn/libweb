import Util from '../util.js';

function Node(path, context) {
  let value = context.ptr(path);
  //console.log("Node:",{path,value});

  let proxy = context.nodes.get(value);

  if(!proxy) {
    proxy = new Proxy(value, {
      get(target, key) {
        let prop = value[key];

        if(Util.isObject(prop) || Util.isArray(prop)) return new Node([...path, key], context);

        return context.handler && context.handler.get ? context.handler.get(prop, key) : prop;
      }
    });
    context.nodes.set(value, proxy);
  }
  return proxy;
}
/*
function NodeList(path, context) {
  let value = context.ptr(path);
  //console.log("NodeList:",{path,value});

  let proxy = context.nodes.get(value);

  if(!proxy) {
    proxy = new Proxy(value, {
      get(target, key) {
        let prop = value[key];

        if(Util.isObject(prop) || Util.isArray(prop)) return new Node([...path, key], context);

        return context.handler && context.handler.get ? context.handler.get(prop, key) : prop;
      }
    });
    context.nodes.set(value, proxy);
  }
  return proxy;
}*/

export const Document = (root, handler) => {
  const context = {
    root,
    ptr(path) {
      return path.reduce((a, i) => a[i], root);
    },
    proxy(value) {
      return this.nodes.get();
    },
    nodes: new WeakMap(),
    handler
  };
  return new Node([], context);
};
