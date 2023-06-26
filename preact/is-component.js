export function isComponent(obj) {
  return typeof obj == 'object' && obj != null && ['__', '__v', 'ref', 'props', 'key'].every(prop => obj[prop] !== undefined);
}
