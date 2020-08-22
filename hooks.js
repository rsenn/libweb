import { options } from './preact.js';

/** @type {number} */

var currentIndex;
/** @type {import('./internal').Component} */

var currentComponent;
/** @type {number} */

var currentHook = 0;
/** @type {Array<import('./internal').Component>} */

var afterPaintEffects = [];
var oldBeforeRender = options.__r;
var oldAfterDiff = options.diffed;
var oldCommit = options.__c;
var oldBeforeUnmount = options.unmount;
var RAF_TIMEOUT = 100;
var prevRaf;

options.__r = function (vnode) {
  if(oldBeforeRender) {
    oldBeforeRender(vnode);
  }
  currentComponent = vnode.__c;
  currentIndex = 0;
  var hooks = currentComponent.__H;

  if(hooks) {
    hooks.__h.forEach(invokeCleanup);

    hooks.__h.forEach(invokeEffect);

    hooks.__h = [];
  }
};

options.diffed = function (vnode) {
  if(oldAfterDiff) {
    oldAfterDiff(vnode);
  }
  var c = vnode.__c;

  if(c && c.__H && c.__H.__h.length) {
    afterPaint(afterPaintEffects.push(c));
  }
};

options.__c = function (vnode, commitQueue) {
  commitQueue.some(function (component) {
    try {
      component.__h.forEach(invokeCleanup);

      component.__h = component.__h.filter(function (cb) {
        return cb.__ ? invokeEffect(cb) : true;
      });
    } catch(e) {
      commitQueue.some(function (c) {
        if(c.__h) {
          c.__h = [];
        }
      });
      commitQueue = [];

      options.__e(e, component.__v);
    }
  });
  if(oldCommit) {
    oldCommit(vnode, commitQueue);
  }
};

options.unmount = function (vnode) {
  if(oldBeforeUnmount) {
    oldBeforeUnmount(vnode);
  }
  var c = vnode.__c;

  if(c && c.__H) {
    try {
      c.__H.__.forEach(invokeCleanup);
    } catch(e) {
      options.__e(e, c.__v);
    }
  }
};
/**
 * Get a hook's state from the currentComponent
 * @param {number} index The index of the hook to get
 * @param {number} type The index of the hook to get
 * @returns {import('./internal').HookState}
 */

function getHookState(index, type) {
  if(options.__h) {
    options.__h(currentComponent, index, currentHook || type);
  }

  currentHook = 0; //Largely inspired by:
  //* https://github.com/michael-klein/funcy.js/blob/f6be73468e6ec46b0ff5aa3cc4c9baf72a29025a/src/hooks/core_hooks.mjs
  //* https://github.com/michael-klein/funcy.js/blob/650beaa58c43c33a74820a3c98b3c7079cf2e333/src/renderer.mjs
  //Other implementations to look at:
  //* https://codesandbox.io/s/mnox05qp8

  var hooks =
    currentComponent.__H ||
    (currentComponent.__H = {
      __: [],
      __h: []
    });

  if(index >= hooks.__.length) {
    hooks.__.push({});
  }

  return hooks.__[index];
}
/**
 * @param {import('./index').StateUpdater<any>} initialState
 */

function useState(initialState) {
  currentHook = 1;
  return useReducer(invokeOrReturn, initialState);
}
/**
 * @param {import('./index').Reducer<any, any>} reducer
 * @param {import('./index').StateUpdater<any>} initialState
 * @param {(initialState: any) => void} [init]
 * @returns {[ any, (state: any) => void ]}
 */

function useReducer(reducer, initialState, init) {
  /** @type {import('./internal').ReducerHookState} */
  var hookState = getHookState(currentIndex++, 2);
  hookState._reducer = reducer;

  if(!hookState.__c) {
    hookState.__c = currentComponent;
    hookState.__ = [
      !init ? invokeOrReturn(undefined, initialState) : init(initialState),
      function (action) {
        var nextValue = hookState._reducer(hookState.__[0], action);

        if(hookState.__[0] !== nextValue) {
          hookState.__ = [nextValue, hookState.__[1]];

          hookState.__c.setState({});
        }
      }
    ];
  }

  return hookState.__;
}
/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */

function useEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  var state = getHookState(currentIndex++, 3);

  if(!options.__s && argsChanged(state.__H, args)) {
    state.__ = callback;
    state.__H = args;

    currentComponent.__H.__h.push(state);
  }
}
/**
 * @param {import('./internal').Effect} callback
 * @param {any[]} args
 */

function useLayoutEffect(callback, args) {
  /** @type {import('./internal').EffectHookState} */
  var state = getHookState(currentIndex++, 4);

  if(!options.__s && argsChanged(state.__H, args)) {
    state.__ = callback;
    state.__H = args;

    currentComponent.__h.push(state);
  }
}
function useRef(initialValue) {
  currentHook = 5;
  return useMemo(function () {
    return {
      current: initialValue
    };
  }, []);
}
/**
 * @param {object} ref
 * @param {() => object} createHandle
 * @param {any[]} args
 */

function useImperativeHandle(ref, createHandle, args) {
  currentHook = 6;
  useLayoutEffect(
    function () {
      if(typeof ref == 'function') {
        ref(createHandle());
      } else if(ref) {
        ref.current = createHandle();
      }
    },
    args == null ? args : args.concat(ref)
  );
}
/**
 * @param {() => any} factory
 * @param {any[]} args
 */

function useMemo(factory, args) {
  /** @type {import('./internal').MemoHookState} */
  var state = getHookState(currentIndex++, 7);

  if(argsChanged(state.__H, args)) {
    state.__H = args;
    state.__h = factory;
    return (state.__ = factory());
  }

  return state.__;
}
/**
 * @param {() => void} callback
 * @param {any[]} args
 */

function useCallback(callback, args) {
  currentHook = 8;
  return useMemo(function () {
    return callback;
  }, args);
}
/**
 * @param {import('./internal').PreactContext} context
 */

function useContext(context) {
  var provider = currentComponent.context[context.__c]; //We could skip this call here, but than we'd not call
  //`options._hook`. We need to do that in order to make
  //the devtools aware of this hook.

  var state = getHookState(currentIndex++, 9); //The devtools needs access to the context object to
  //be able to pull of the default value when no provider
  //is present in the tree.

  state.__c = context;
  if(!provider) {
    return context.__;
  } //This is probably not safe to convert to "!"

  if(state.__ == null) {
    state.__ = true;
    provider.sub(currentComponent);
  }

  return provider.props.value;
}
/**
 * Display a custom label for a custom hook for the devtools panel
 * @type {<T>(value: T, cb?: (value: T) => string | number) => void}
 */

function useDebugValue(value, formatter) {
  if(options.useDebugValue) {
    options.useDebugValue(formatter ? formatter(value) : value);
  }
}
function useErrorBoundary(cb) {
  var state = getHookState(currentIndex++, 10);
  var errState = useState();
  state.__ = cb;

  if(!currentComponent.componentDidCatch) {
    currentComponent.componentDidCatch = function (err) {
      if(state.__) {
        state.__(err);
      }
      errState[1](err);
    };
  }

  return [
    errState[0],
    function () {
      errState[1](undefined);
    }
  ];
}
/**
 * After paint effects consumer.
 */

function flushAfterPaintEffects() {
  afterPaintEffects.some(function (component) {
    if(component.__P) {
      try {
        component.__H.__h.forEach(invokeCleanup);

        component.__H.__h.forEach(invokeEffect);

        component.__H.__h = [];
      } catch(e) {
        component.__H.__h = [];

        options.__e(e, component.__v);

        return true;
      }
    }
  });
  afterPaintEffects = [];
}

var HAS_RAF = typeof requestAnimationFrame == 'function';
/**
 * Schedule a callback to be invoked after the browser has a chance to paint a new frame.
 * Do this by combining requestAnimationFrame (rAF) + setTimeout to invoke a callback after
 * the next browser frame.
 *
 * Also, schedule a timeout in parallel to the the rAF to ensure the callback is invoked
 * even if RAF doesn't fire (for example if the browser tab is not visible)
 *
 * @param {() => void} callback
 */

function afterNextFrame(callback) {
  var done = function done() {
    clearTimeout(timeout);
    if(HAS_RAF) {
      cancelAnimationFrame(raf);
    }
    setTimeout(callback);
  };

  var timeout = setTimeout(done, RAF_TIMEOUT);
  var raf;

  if(HAS_RAF) {
    raf = requestAnimationFrame(done);
  }
} //Note: if someone used options.debounceRendering = requestAnimationFrame,
//then effects will ALWAYS run on the NEXT frame instead of the current one, incurring a ~16ms delay.
//Perhaps this is not such a big deal.

/**
 * Schedule afterPaintEffects flush after the browser paints
 * @param {number} newQueueLength
 */

function afterPaint(newQueueLength) {
  if(newQueueLength === 1 || prevRaf !== options.requestAnimationFrame) {
    prevRaf = options.requestAnimationFrame;
    (prevRaf || afterNextFrame)(flushAfterPaintEffects);
  }
}
/**
 * @param {import('./internal').EffectHookState} hook
 */

function invokeCleanup(hook) {
  if(typeof hook._cleanup == 'function') {
    hook._cleanup();
  }
}
/**
 * Invoke a Hook's effect
 * @param {import('./internal').EffectHookState} hook
 */

function invokeEffect(hook) {
  hook._cleanup = hook.__();
}
/**
 * @param {any[]} oldArgs
 * @param {any[]} newArgs
 */

function argsChanged(oldArgs, newArgs) {
  return (
    !oldArgs ||
    newArgs.some(function (arg, index) {
      return arg !== oldArgs[index];
    })
  );
}

function invokeOrReturn(arg, f) {
  return typeof f == 'function' ? f(arg) : f;
}

export { useState, useReducer, useEffect, useLayoutEffect, useRef, useImperativeHandle, useMemo, useCallback, useContext, useDebugValue, useErrorBoundary };
//# sourceMappingURL=hooks.module.js.map
