export class CircuitJS {
  static parse(text) {
    let lines = text.split(/\n/g);

    //console.log('lines', lines);
    return lines.map(line => line.split(/\s+/g).map(s => (isNaN(+s) ? s : +s)));
  }
}

export default CircuitJS;
