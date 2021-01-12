export const TinyTest = {
  run(tests) {
    let failures = 0;
    for(let testName in tests) {
      let testAction = tests[testName];
      try {
        testAction();
        console.log('Test:', testName, '\x1b[1;32mOK\x1b[0m');
      } catch(e) {
        failures++;
        console.log('Test:', testName, '\x1b[1;31mFAILED\x1b[0m', e);
        console.log(e.stack);
      }
    }
    /* setTimeout(function () {
      // Give document a chance to complete
      if(window.document && document.body) {
        document.body.style.backgroundColor = failures == 0 ? '#99ff99' : '#ff9999';
      }
    }, 0);*/
  },

  fail(msg) {
    throw new Error('fail(): ' + msg);
  },

  assert(value, msg) {
    if(msg === undefined) {
      switch (typeof value) {
        case 'boolean':
          msg = `${value} != false`;
          break;
        case 'number':
          msg = `${value} != 0`;
          break;
        case 'object':
          msg = `${value} != null`;
          break;
        case 'string':
          msg = `${value} != ""`;
          break;
      }
    }

    if(!value) {
      throw new Error('assert(): ' + msg);
    }
  },

  assertEquals(expected, actual) {
    if(expected != actual) {
      throw new Error('assertEquals() "' + expected + '" != "' + actual + '"');
    }
  },

  assertStrictEquals(expected, actual) {
    if(expected !== actual) {
      throw new Error('assertStrictEquals() "' + expected + '" !== "' + actual + '"');
    }
  }
};

const { run, fail, assert, assertEquals, assertStrictEquals } = TinyTest;

export { run, fail, assert, assertEquals, assertStrictEquals };

export default TinyTest;
