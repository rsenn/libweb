const process = {
  get env() {
    return {};
  },
  get argv() {
    return [];
  },
  get argv0() {
    return '';
  },
  cwd: '.',
  hrtime() {
    const ms = performance.now();

    return [Math.floor(ms * 1e-3), (ms % 1000) * 1e6];
  },
};

export default process;
