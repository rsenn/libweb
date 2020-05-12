// Example usage:
//
// void async function() {
//   let [clicks, onclick] = iterator()
//   document.querySelector('button').addEventListener('click', onclick)
//   for await (let click of clicks) console.log(click)
// }()

export default function iterator() {
  let done = false;
  let events = [];
  let resolve;
  let promise;

  defer();

  return [read(), write, end];

  function defer() {
    promise = new Promise(r => (resolve = r));
  }

  async function* read() {
    await promise;
    yield* events.splice(0);
    if(!done) yield* read();
  }

  function write(event) {
    events.push(event);
    resolve();
    defer();
  }

  function end() {
    done = true;
    resolve();
  }
}
