export const busywait = (checkFn, _options) => {
  const options = Object.assign({}, _options);
  return checkArgs(checkFn, options).then(() => {
    return eventLoop(wrapSyncMethod(checkFn), options);
  });
};

const checkArgs = (checkFn, options) => {
  if(isNaN(options.maxChecks) || options.maxChecks < 1) {
    return Promise.reject('maxChecks must be a valid integer greater than 0');
  }
  if(isNaN(options.sleepTime) || options.sleepTime < 1) {
    return Promise.reject('sleepTime must be a valid integer greater than 0');
  }
  if(!checkFn || !isFunction(checkFn)) {
    return Promise.reject('checkFn must be a function');
  }
  return Promise.resolve();
};

const wrapSyncMethod = (checkFn) => {
  return (iteration) => {
    return new Promise((resolve, reject) => {
      try {
        resolve(checkFn(iteration));
      } catch(err) {
        reject(err);
      }
    });
  };
};

const eventLoop = (checkFn, options) => {
  return new Promise((resolve, reject) => {
    let iteration = 0;
    const iterationCheck = () => {
      iteration++;
      checkFn(iteration)
        .then((result) => {
          return resolve({
            iterations: iteration,
            result
          });
        })
        .catch(() => {
          if(iteration === options.maxChecks) {
            return reject(options.failMsg || 'Exceeded number of iterations to wait');
          }
          setTimeout(iterationCheck, options.sleepTime);
        });
    };
    setTimeout(iterationCheck, options.waitFirst ? options.sleepTime : 0);
  });
};

const isFunction = (obj) => toString.call(obj) === '[object Function]';

export default busywait;
