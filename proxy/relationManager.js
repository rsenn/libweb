//relation-manager
//
//Copyright (c) 2016 Simon Y. Blackwell, AnyWhichWay
//MIT License - http://opensource.org/licenses/mit-license.php

//uppercases first letter in a string
function uFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

//returns an Array specialized for managing Relations
function RelationManager(instance, subjectSpec, spec) {
  this.instance = instance;
  this.subjectSpec = subjectSpec;
  this.spec = spec;
  for(let key in Array.prototype) {
    if(['copyWithin', 'fill', 'pop', 'push', 'shift', 'splice', 'unshift'].indexOf(key) >= 0) {
      delete this[key];
    }
  }
}
RelationManager.prototype = [];
RelationManager.prototype.constructor = RelationManager;
if(!RelationManager.prototype.includes) {
  RelationManager.prototype.includes = function(subject) {
    return this.indexOf(subject) >= 0;
  };
}
RelationManager.prototype.add = function(subject, recursing) {
  let instance = this.instance,
    subjectSpec = this.subjectSpec,
    spec = this.spec;
  if(!(subject instanceof subjectSpec.class)) {
    throw new TypeError(subjectSpec.property + '.add(object) ... object is not instanceof ' + subjectSpec.class.name);
  }
  if(instance[subjectSpec.property].length === subjectSpec.cardinality) {
    throw new RangeError(subjectSpec.property + '.add(object) ... exceeds maximum of ' + subjectSpec.cardinality);
  }
  let i = [].indexOf.call(instance[subjectSpec.property], subject);
  if(!subjectSpec.unique || i === -1) {
    [].push.call(instance[subjectSpec.property], subject);
    if(!recursing) {
      if(spec.cardinality > 1) {
        subject[spec.property].add(instance, true);
      } else {
        subject[spec.property] = instance;
      }
    }
    return true;
  }
  return false;
};
RelationManager.prototype.delete = function(subject, recursing) {
  let instance = this.instance,
    spec = this.spec;
  let i = [].indexOf.call(this, subject);
  if(i >= 0) {
    [].splice.call(this, i, 1);
    if(!recursing) {
      if(spec.cardinality > 1) {
        subject[spec.property].delete(instance, true);
      } else {
        subject[spec.property] = null;
      }
    }
    return true;
  }
  return false;
};

function Relation() {
  let me = this,
    objects = [].slice.call(arguments, 1),
    subject = arguments[0],
    subjectSpec = me.specs[0],
    added = false,
    key = subjectSpec.relation ? subjectSpec.relation : subjectSpec.property;
  //if there is only one spec it must be symmetric
  if(me.specs.length === 1) {
    if(!(subject instanceof subjectSpec.class)) {
      throw new TypeError(key + ' is not instanceof ' + subjectSpec.class.name);
    }
    //we must store values in an array
    me[key] = [subject];
    objects.forEach(object => {
      me[key].push(object);
    });
  } else {
    if(!(subject instanceof subjectSpec.class)) {
      throw new TypeError(key + ' is not instanceof ' + subjectSpec.class.name);
    }
    //store each part of the relation in a different key
    me[key] = subject;
    me.specs.slice(1).forEach((spec, i) => {
      let key = spec.relation ? spec.relation : spec.property;
      if(!(objects[i] instanceof spec.class)) {
        throw new TypeError(key + ' is not instanceof ' + spec.class.name);
      }
      me[key] = objects[i];
    });
  }
  //add the other side of the relations to the object
  if(subjectSpec.cardinality > 1) {
    objects.forEach(object => {
      added = object[subjectSpec.property].add(subject);
    });
  } else {
    objects.forEach(object => {
      if(object[subjectSpec.property] !== subject) {
        added = true;
        object[subjectSpec.property] = subject;
      }
    });
  }
  //only save the relation instance if we actually had to add data, avoids duplicating symmetric relations
  if(added) {
    this.instances.push(this);
  }
}
function addRelations(instance, specs) {
  function enhance(instance, subjectSpec, spec) {
    //does class checking and sets reflecting relation for cardinality=1, used as second part of if ... else below
    function set(subject) {
      //stopping set when value already in place prevents infinite recursion
      if(set.value !== subject) {
        if(subject && !(subject instanceof subjectSpec.class)) {
          throw new TypeError(subjectSpec.property + '.add(object) ... object is not instanceof ' + subjectSpec.class.name
          );
        }
        let oldvalue = set.value;
        set.value = subject;
        //special handling if setting to null, i.e. subject = null
        if(!subject && oldvalue && oldvalue[spec.property] === instance) {
          //set the reflecting property in oldvalue to null
          oldvalue[spec.property] = null;
        } else if(subject && spec.cardinality === 1 && subject[spec.property] !== instance) {
          subject[spec.property] = instance;
        } else if(subject && spec.cardinality > 1) {
          subject[spec.property].add(instance);
        }
      }
    }
    set.value = null;
    //does class checking and sets reflecting relation for cardinality>1
    if(subjectSpec.cardinality > 1 && !Array.isArray(instance[subjectSpec.property])) {
      Object.defineProperty(instance, subjectSpec.property, {
        enumerable: subjectSpec.enumerable,
        configurable: true,
        writable: false,
        value: new RelationManager(instance, subjectSpec, spec)
      });
    } else if(!instance[subjectSpec.property]) {
      Object.defineProperty(instance, subjectSpec.property, {
        enumerable: subjectSpec.enumerable,
        configurable: true,
        get() {
          return set.value;
        },
        set
      });
    }
  }
  if(specs) {
    specs.forEach(spec => {
      if(instance instanceof spec.object.class) {
        enhance(instance, spec.subject, spec.object);
        enhance(instance, spec.object, spec.subject);
      }
    });
  }
}
function defineRelation(scope, name, sname, head, specs) {
  let cons = new Function('return function ' + name + '(' + head + ') { return Relation.apply(this,arguments); }')();
  cons.prototype = Object.create(Relation.prototype);
  cons.prototype.constructor = cons;
  cons.prototype.specs = specs;
  cons.specs = cons.prototype.specs;
  cons.prototype.instances = [];
  cons.instances = cons.prototype.instances;
  scope[name] = cons;
  if(specs.length === 2) {
    scope[sname] = function() {
      let args = [].slice.call(arguments).reverse();
      return new cons(...args);
    };
    scope[sname].prototype = Object.create(Relation.prototype);
    scope[sname].prototype.constructor = scope[sname];
    scope[sname].prototype.specs = specs.slice().reverse();
    scope[sname].specs = scope[sname].prototype.specs;
    scope[sname].prototype.instances = cons.prototype.instances;
    scope[sname].instances = scope[sname].prototype.instances;
  }
  return cons;
}
Relation.define = function(scope) {
  let specs = [].slice.call(arguments, 1),
    subjectSpec = specs[0],
    name = '',
    head,
    sname = uFirst(subjectSpec.relation ? subjectSpec.relation : subjectSpec.property);
  (subjectSpec.class = subjectSpec.class ? subjectSpec.class : Object), head;
  specs.forEach((spec, i) => {
    let s = spec.relation ? spec.relation : spec.property;
    name += uFirst(s);
    if(i > 0) {
      sname = uFirst(s) + sname;
    }
    head = head ? (head += ',' + s) : s;
    //make sure we are pointing to most current definition since they get updated as we go through loop
    spec.class = spec.class && scope[spec.class.name] ? scope[spec.class.name] : spec.class;
    //default to Object if no class specified
    spec.class = spec.class ? spec.class : Object;
    if(!spec.class.prototype.relations) {
      //create a Proxy for the class participating in the relation so that it adds the relations
      let cons = new Proxy(spec.class, {
        construct(target, argumentList) {
          let object = Object.create(target.prototype);
          target.prototype.constructor.call(object, ...argumentList);
          //walk up the ptototype chaing to add relations defined at a higher level
          let proto = object;
          while(proto) {
            addRelations(object, proto.relations);
            proto = Object.getPrototypeOf(proto);
          }
          return object;
        }
      });
      //save a version of the spec class in this closure scope
      let cls = spec.class;
      //add ability to restore from one side of relations using from JSON
      cons.fromJSON = function(object) {
        let instance = Object.create(cls);
        let proto = object;
        while(proto) {
          addRelations(object, proto.relations);
          proto = Object.getPrototypeOf(proto);
        }
        Object.keys(object).forEach(key => {
          //if the property key is part of a relation spec and is an Array
          if(subjectSpec.property[key] && subjectSpec.class && Array.isArray(object[key])) {
            //loop through the items and restore them
            object[key].forEach(item => {
              instance[key].add(subjectSpec.class.prototype.fromJSON(item));
            });
          } else {
            instance[key] = object[key];
          }
        });
        return instance;
      };
      //update the spec to refer to the Proxy
      spec.class = cons;
      //make the Proxy be the object exposed to the scope
      scope[spec.class.name] = cons;
    }
    spec.class.prototype.relations = spec.class.prototype.relations ? spec.class.prototype.relations : [];
    if(i > 0) {
      spec.class.prototype.relations.push({ subject: subjectSpec, object: spec });
    }
  });
  if(specs.length === 1) {
    subjectSpec.class.prototype.relations.push({ subject: subjectSpec, object: subjectSpec });
  }
  //define the actual Relation class
  return defineRelation(scope, name, sname, head, specs);
};
