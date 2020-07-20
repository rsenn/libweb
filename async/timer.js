//Create a Promise that resolves after ms time
var timer = function(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

//Repeatedly generate a number starting
//from 0 after a random amount of time
var source = async function*() {
  var i = 0;
  while(true) {
    await timer(Math.random() * 1000);
    yield i++;
  }
};

//Return a new async iterator that applies a
//transform to the values from another async generator
var map = async function*(stream, transform) {
  for await (let n of stream) {
    yield transform(n);
  }
};

//Tie everything together
var run = async function() {
  var stream = source();
  //Square values generated by source() as they arrive
  stream = map(stream, n => n * n);
  for await (let n of stream) {
    console.log(n);
  }
};

run();
//=> 0
//=> 1
//=> 4
//=> 9
//...
