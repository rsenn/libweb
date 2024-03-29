import { map } from './helpers.js';
//Create a Promise that resolves after ms time
let timer = function(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

//Repeatedly generate a number starting
//from 0 after a random amount of time
let source = async function* () {
  let i = 0;
  while(true) {
    await timer(Math.random() * 1000);
    yield i++;
  }
};

//Return a new async iterator that applies a
//transform to the values from another async generator
/*let map = async function* (stream, transform) {
  for await(let n of stream) {
    yield transform(n);
  }
};*/

//Tie everything together
let run = async function() {
  let stream = source();
  //Square values generated by source() as they arrive
  stream = map(stream, n => n * n);
  for await(let n of stream) {
    console.log(n);
  }
};

run();
//=> 0
//=> 1
//=> 4
//=> 9
//...