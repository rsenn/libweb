export class MIDISysExEvent {
  constructor(auth) {
    this.unknownLength = 0;
    this.unknownBytes = [];
    this.auth = auth;
  }

  toString() {
    return '[MIDISysExEvent length=' + this.unknownLength + ' authorization=' + this.auth + ']';
  }

  readBytes(stream, status) {
    this.unknownLength = stream.readVLV();

    for(var i = 0; i < this.unknownLength; i++) this.unknownBytes[i] = stream.readByte();
  }

  writeBytes(stream) {
    stream.writeVLV(this.unknownLength);

    for(var i = 0; i < this.unknownLength; i++) stream.writeByte(this.unknownBytes[i]);
  }
}

Object.defineProperty(MIDISysExEvent.prototype, Symbol.toStringTag, {
  value: 'MIDISysExEvent',
  enumerable: false,
});

export default MIDISysExEvent;
