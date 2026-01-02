import { TransformStream } from '../stream/transformStream.js';

export class TextEncodeTransformer {
  constructor() {
    this._encoder = new TextEncoder();
  }

  transform(chunk, controller) {
    controller.enqueue(this._encoder.encode(chunk));
  }
}

export class TextEncoderStream {
  constructor() {
    return new TransformStream(new TextEncodeTransformer());
  }
}

export default TextEncoderStream;