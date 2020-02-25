import config from '../config.js';

const useAmplitude = config.env == 'production' || config.env == 'test';
const Amplitude = global.window || process.browser ? require('amplitude-js').default : null;
const instance =
  useAmplitude && Amplitude && typeof Amplitude.getInstance === 'function'
    ? Amplitude.getInstance()
    : {
        init: () => {},
        logEvent: () => {},
        setUserId: () => {},
        setUserProperties: () => {}
      };

console.log('amplitude  ', { useAmplitude, instance, Amplitude });

export default instance;
