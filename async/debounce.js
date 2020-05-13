const destreamify = async (stream, callback) => {
  for await (let event of stream) {
    callback(event);
  }
};

const debounce = function*(stream, interval) {
  let first; // is this first event?  will pass
  let lastEvent; // the last event raised
  let deferred; // deferred promise instance
  let resolve; // resolve method for deferred promise

  // reset internal state - create new deferred/resolve
  const reset = isFirst => {
    first = isFirst;
    lastEvent = undefined;
    deferred = new Promise(r => (resolve = r));
  };

  // handle event resolution
  const passEvent = () => {
    // if no event to pass
    if(lastEvent === undefined) {
      first = true; // reset first state
      return;
    }

    const event = lastEvent; // handle to event to pass
    const res = resolve; // handle to resolve for current deferred
    reset(false); // reset and create next deferred
    setTimeout(passEvent, interval); // debounce timer
    res(event); // resolve current deferred
  };

  reset(true); // set initial state & deferred
  destreamify(stream, event => {
    lastEvent = event; // reference event
    if(first) passEvent(); // if first run, pass it through
  });

  // yield deferred results
  while(true) {
    yield deferred;
  }
};
