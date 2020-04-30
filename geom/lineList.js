import { Line, isLine } from './line.js';
import Util from '../util.js';

export class LineList extends BigUint64Array {
  constructor(lines) {
    if(Util.isArray(lines) || lines) for(let line of lines) this.push(line);
  }
}
