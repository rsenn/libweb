import { TransformStream } from '../stream/transformStream.js';

export class TextDecodeTransformer {
  constructor(options = {}) {
    const { encoding = 'utf-8', fatal, ignoreBOM } = options;
    this._decoder = new TextDecoder(encoding, {
      fatal: fatal,
      ignoreBOM: ignoreBOM
    });
  }

  transform(chunk, controller) {
    const decoded = this._decoder.decode(chunk, { stream: true });
    if(decoded != '') {
      controller.enqueue(decoded);
    }
  }

  flush(controller) {
    // If {fatal: false} is in options (the default), then the final call to
    // decode() can produce extra output (usually the unicode replacement
    // character 0xFFFD). When fatal is true, this call is just used for its
    // side-effect of throwing a TypeError exception if the input is
    // incomplete.
    var output = this._decoder.decode();
    if(output !== '') {
      controller.enqueue(output);
    }
  }
}

export class TextDecoderStream {
  constructor(options = {}) {
    return new TransformStream(new TextDecodeTransformer(options));
  }
}

export default TextDecoderStream;