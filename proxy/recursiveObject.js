

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

//TODO: '.' failures with custom obj props
function computePath(p1, p2, delimiter) {
  if (!delimiter || delimiter === '.') {
    if (!p1) {
      return p2;
    }

    return p1 + '.' + p2;
  }
  if (!p1) {
    return p2;
  }

  //array
  return p1 + '[' + p2 + ']';
  
}

function subProxyObj(obj, update, dotPath) {
  let path = dotPath || '';
  let newPath = '';
  let isArray = Array.isArray(obj);

  Object.keys(obj).forEach((property) => {
    if (isArray) {
      newPath = computePath(path, property, '[]');
    }
    else {
      newPath = computePath(path, property);
    }

    if (Array.isArray(obj[property])) {
      obj[property] = emulateArray(obj[property], update, newPath);
    }
    else if (isObject(obj[property])) {
      obj[property] = proxyObject(obj[property], update, newPath);
    }
  });
}

function updateValue(target, property, value, newPath, update) {
  if (Array.isArray(value)) {
    target[property] = emulateArray(value, update, newPath);
  }
  else if (isObject(value)) {
    target[property] = proxyObject(value, update, newPath);
  }
  else {
    target[property] = value;
  }

  update(newPath, value);
}

function emulateArray(obj, update, dotPath) {
  let length = obj.length || 0;

  subProxyObj(obj, update, dotPath);

  let path = dotPath || '';
  let newPath = '';

  return new Proxy(obj, {
    get (target, property) {
      if (property === 'length') {
        return length;
      }

      if (property in target) {
        return target[property];
      }

      if (property in Array.prototype) {
        //TODO: what about non-fns?
        return function () {
          return Array.prototype[property].apply(obj, arguments);
        };
      }
    },
    set (target, property, value) {
      if (property === 'length') {
        for (let i = value; i < length; i++) {
          delete target[i];
        }

        if (length !== value) {
          length = value;
          //needed when deleting stuff (splice, shift, pop)
          newPath = computePath(path, property);
          update(newPath, value);
        }

        return true;
      }
      newPath = computePath(path, property, '[]');
      

      //when updating a value check if it's an obj / array, might need to
      //proxy that set value
      updateValue(target, property, value, newPath, update);

      if (Number(property) >= length) {
        length = Number(property) + 1;
        update(computePath(path, 'length', '.'), length);
      }

      return true;
    },
    deleteProperty(target, property) {
      if (property in target) {
        newPath = computePath(path, property, '[]');
        target[property] = undefined;
        update(newPath, undefined, true);
      }

      return true;
    }
  });
}

//TODO: proxy array root?
//TODO: implement __isProxy property?
//https://github.com/ElliotNB/observable-slim/blob/master/observable-slim.js#L110
function proxyObject(obj, update, dotPath) {
  subProxyObj(obj, update, dotPath);

  let path = dotPath || '';
  let newPath = '';

  return new Proxy(obj, {
    get (target, property) {
      return target[property];
    },
    set (target, property, value) {
      newPath = computePath(path, property);

      updateValue(target, property, value, newPath, update);

      return true;
    },
    deleteProperty(target, property) {
      if (property in target) {
        newPath = computePath(path, property);
        delete target[property];
        update(newPath, undefined, true);
      }

      return true;
    }
  });
}

export default proxyObject;
