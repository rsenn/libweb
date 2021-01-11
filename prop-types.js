let ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

function emptyFunction() {}
function emptyFunctionWithReset() {}
emptyFunctionWithReset.resetWarningCache = emptyFunction;

function shim(props, propName, componentName, location, propFullName, secret) {
  if (secret === ReactPropTypesSecret) {
    return;
  }
  let err = new Error(
    'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
  );
  err.name = 'Invariant Violation';
  throw err;
}
shim.isRequired = shim;
function getShim() {
  return shim;
}

export const ReactPropTypes = {
  array: shim,
  bool: shim,
  func: shim,
  number: shim,
  object: shim,
  string: shim,
  symbol: shim,

  any: shim,
  arrayOf: getShim,
  element: shim,
  elementType: shim,
  instanceOf: getShim,
  node: shim,
  objectOf: getShim,
  oneOf: getShim,
  oneOfType: getShim,
  shape: getShim,
  exact: getShim,

  checkPropTypes: emptyFunctionWithReset,
  resetWarningCache: emptyFunction
};

ReactPropTypes.PropTypes = ReactPropTypes;

let printWarning = function () {};

export function checkPropTypes(
  typeSpecs,
  values,
  location,
  componentName,
  getStack
) {
  if (process.env.NODE_ENV !== 'production') {
    for (let typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;

        try {
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            let err = Error(
              (componentName || 'React class') +
                ': ' +
                location +
                ' type `' +
                typeSpecName +
                '` is invalid; ' +
                'it must be a function, usually from the `prop-types` package, but received `' +
                typeof typeSpecs[typeSpecName] +
                '`.' +
                'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](
            values,
            typeSpecName,
            componentName,
            location,
            null,
            ReactPropTypesSecret
          );
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') +
              ': type specification of ' +
              location +
              ' `' +
              typeSpecName +
              '` is invalid; the type checker ' +
              'function must return `null` or an `Error` but returned a ' +
              typeof error +
              '. ' +
              'You may have forgotten to pass an argument to the type checker ' +
              'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
              'shape all require an argument).'
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          loggedTypeFailures[error.message] = true;

          let stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' +
              location +
              ' type: ' +
              error.message +
              (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

checkPropTypes.resetWarningCache = function () {
  if (process.env.NODE_ENV !== 'production') {
    loggedTypeFailures = {};
  }
};

export default ReactPropTypes;
