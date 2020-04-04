define([], function() {
  var ZERO = 1e-10;

  return {
    ZERO: ZERO,
    iszero: function(n) {
      return n === 0 || Math.abs(n) < ZERO;
    }
  };
});
