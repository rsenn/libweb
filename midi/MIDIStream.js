export class MIDIStream {
  constructor(buffer) {
    //console.log('MIDIStream.constructor', { size: buffer.byteLength });
    this.write = null;

    if(!buffer) {
      this.write = [];
    } else if(buffer instanceof ArrayBuffer) {
      this._dv = new DataView(buffer);
    } else throw new Error('Input must be an instance of ArrayBuffer or omitted for write stream');

    this.position = 0;
  }

  readByte() {
    const { byteLength } = this._dv.buffer;

    if(this.position >= byteLength) throw new Error('buffer overrun');

    var result = this._dv.getUint8(this.position);
    this.position++;
    //console.log('readByte', result, this.position, byteLength);
    return result;
  }

  readShort() {
    var result = this._dv.getUint16(this.position);
    this.position += 2;
    return result;
  }

  readUint() {
    var result = this._dv.getUint32(this.position);
    this.position += 4;
    return result;
  }

  readVLV() {
    var value;
    var c;

    if((value = this.readByte()) & 0x80) {
      value &= 0x7f;
      do {
        value = (value << 7) + ((c = this.readByte()) & 0x7f);
      } while(c & 0x80);
    }

    return value;
  }

  writeByte(value) {
    this.write[this.position] = value;
    this.position++;
  }

  writeShort(value) {
    this.write[this.position] = (value & 0xff00) >> 8;
    this.write[this.position + 1] = value & 0xff;

    this.position += 2;
  }

  writeUint(value) {
    this.write[this.position] = (value & 0xff000000) >> 24;
    this.write[this.position + 1] = (value & 0xff0000) >> 16;
    this.write[this.position + 2] = (value & 0xff00) >> 8;
    this.write[this.position + 3] = value & 0xff;

    this.position += 4;
  }

  writeVLV(value) {
    var buffer = value & 0x7f;
    while((value >>= 7) > 0) {
      buffer <<= 8;
      buffer |= 0x80;
      buffer += value & 0x7f;
    }

    while(1) {
      this.writeByte(buffer);
      if(buffer & 0x80) buffer >>= 8;
      else break;
    }
  }

  toArrayBuffer() {
    if(!this.write) throw new Error('This is not a write stream');

    var buffer = new ArrayBuffer(this.write.length);
    var dv = new DataView(buffer);

    var len = this.write.length;
    for(var i = 0; i < len; i++) dv.setUint8(i, this.write[i]);

    return buffer;
  }

  toDataURL() {
    if(!this.write) throw new Error('This is not a write stream');

    var arrayBuffer = this.toArrayBuffer();

    function _arrayBufferToBase64(buffer) {
      var binary = '';
      var bytes = new Uint8Array(buffer);
      var len = bytes.byteLength;
      for(var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }

    var b64 = _arrayBufferToBase64(arrayBuffer);
    return 'data:audio/midi;base64,' + b64;
  }
}

Object.defineProperty(MIDIStream.prototype, Symbol.toStringTag, {
  value: 'MIDIStream',
  enumerable: false,
});

export default MIDIStream;
