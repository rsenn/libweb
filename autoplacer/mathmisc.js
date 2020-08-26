define([], () => {
  let ZERO = 1e-10;

  return {
    ZERO,
    iszero (n) {
      return n === 0 || Math.abs(n) < ZERO;
    }
  };
});
