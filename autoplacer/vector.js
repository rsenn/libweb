(function () {
  Array.prototype.plus = function (other) {
    let result = [];
    let len = this.length;
    for (let i = 0; i < len; i++) {
      result[i] = this[i] + other[i];
    }
    return result;
  };

  Array.prototype.minus = function (other) {
    let len = this.length;
    let result = [];
    for (let i = 0; i < len; i++) {
      result[i] = this[i] - other[i];
    }
    return result;
  };

  Array.prototype.scale = function (num) {
    let len = this.length;
    let result = [];
    for (let i = 0; i < len; i++) {
      result[i] = this[i] * num;
    }
    return result;
  };

  Array.prototype.scaleto = function (newlength) {
    let len = this.veclength();
    if (len == 0) {
      return [0, 0];
    }
    return this.scale(newlength / len);
  };

  Array.prototype.veclength = function () {
    let len = this.length;
    let sum = 0;
    let element;
    for (let i = 0; i < len; i++) {
      element = this[i];
      sum += element * element;
    }
    return Math.sqrt(sum);
  };

  Array.prototype.x = function () {
    return this[0];
  };

  Array.prototype.y = function () {
    return this[1];
  };
})();
