import { RGBA, HSLA } from '../color.js';


export const digit2color = //[ "#000000", "#8b572a", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe", "#999999", "#ffffff" ]
 //  ["#000000", "#905030", "#d00020", "#f0a020", "#ffe020", "#80d020", "#5090e0", "#9010ff", "#a0a0a0", "#ffffff"]
["#000000", "#8b572a", "#d0021b", "#f5a623", "#f8e71c", "#7ed321", "#4a90e2", "#9013fe", "#999999", "#ffffff"].map(c => RGBA.fromHex(c));
;
