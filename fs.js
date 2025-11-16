export function readFileSync(file, options = {}) {
  options = isString(options) ? { encoding: options } : options;
  options ??= {};

  if(options.encoding == 'utf-8') return std.loadFile(file);

  const res = { errno: 0 },
    f = std.open(file, 'r', res);

  if(!res.errno) {
    f.seek(0, std.SEEK_END);
    let size = f.tell();

    if(isNumber(size)) {
      f.seek(0, std.SEEK_SET);
      let data = new ArrayBuffer(size);
      f.read(data, 0, size);
      f.close();
      if(options.encoding != null) data = toString(data);
      return data;
    }
  }

  return syscallerr('open', -res.errno);
}
