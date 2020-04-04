(function() {
  Array.prototype.plus = function(other) {
    var result = [];
    var len = this.length;
    for(var i = 0; i < len; i++) {
      result[i] = this[i] + other[i];
    }
    return result;
  };

  Array.prototype.minus = function(other) {
    var len = this.length;
    var result = [];
    for(var i = 0; i < len; i++) {
      result[i] = this[i] - other[i];
    }
    return result;
  };

  Array.prototype.scale = function(num) {
    var len = this.length;
    var result = [];
    for(var i = 0; i < len; i++) {
      result[i] = this[i] * num;
    }
    return result;
  };

  Array.prototype.scaleto = function(newlength) {
    var len = this.veclength();
    if(len == 0) {
      return [0, 0];
    }
    return this.scale(newlength / len);
  };

  Array.prototype.veclength = function() {
    var len = this.length;
    var sum = 0;
    var element;
    for(var i = 0; i < len; i++) {
      element = this[i];
      sum += element * element;
    }
    return Math.sqrt(sum);
  };

  Array.prototype.x = function() {
    return this[0];
  };

  Array.prototype.y = function() {
    return this[1];
  };
})();
