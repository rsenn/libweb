require("core-js/modules/es6.array.from");

module.exports = {
  Fields: function Fields(arr) {
    if(arr.length == undefined) arr = Array.from(arguments);
    return Object.assign([], arr, {
      names: () => this.map(f => f.name),
      copy: function(from, to) {
        for(let i = 0; i < this.length; i++) {
          var k = this[i].name;
          if(from[k] !== undefined) to[k] = from[k];
        }
      }.bind(arr),
      needed: function(data, mapfn) {
        const obj = data || {};
        const needed = this.filter(v => v.needed === true);
        return needed.map(function(field, i) {
          let value = obj[field.name];
          return mapfn(value, field, i);
        });
      }.bind(arr)
    });
  },
  RecordTitle: function RecordTitle(name, obj, index) {
    let title = name;
    if(obj && obj.id !== undefined) name += " #".concat(obj.id);
    else if(index !== undefined) name += " @".concat(index);
    return title;
  }
};
