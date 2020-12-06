import { RGBA, HSLA } from '../color.js';


export function GetMultipliers() {
  return [10, 100, 1e3, 1e4, 1e5, 1e6, 1e7];
}
 
export function GetFactor(num) {
   let i = -1;
  for(let max of GetMultipliers()) {
     if(num >= max) i++;
    else break;
  }
  return i;
 }
     
    export function GetColorBands(value, precision = 2) {
      let f = GetFactor(value);
      let fx =  f + (2 - precision);
      let multiplier = GetMultipliers()[f];
      let x = value / multiplier;
      let r = [];

      for(let i = 0; i < precision; i++) {
let digit = Math.floor(x);
x = x % 1;
x *= 10;
x= Math.ceil(x);
r.push(digit);
}
      return r.concat([fx]);
    }


export const digit2color = //[ "#000000", "#8b572a", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe", "#999999", "#ffffff" ]
 //  ["#000000", "#905030", "#d00020", "#f0a020", "#ffe020", "#80d020", "#5090e0", "#9010ff", "#a0a0a0", "#ffffff"]
["#000000", "#8b572a", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe", "#999999", "#ffffff"].map(c => RGBA.fromHex(c));
;
