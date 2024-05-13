export class MIDIControlEvent {
  static NOTE_OFF = 0x80;
  static NOTE_ON = 0x90;
  static AFTERTOUCH = 0xa0;
  static CONTROLLER = 0xb0;
  static PROGRAM_CHANGE = 0xc0;
  static CHANNEL_AFTERTOUCH = 0xd0;
  static PITCH_BEND = 0xe0;

  constructor(type, param1, param2, channel) {
    this.type = type ? type : null;
    this.param1 = param1 ? param1 : 0;
    this.param2 = param2 ? param2 : 0;
    this.channel = channel ? channel : 0;
    this.delta = 0;
  }

  toString() {
    var string = '[MIDIControlEvent type=';

    switch (this.type) {
      case MIDIControlEvent.NOTE_OFF:
        string += 'NOTE_OFF';
        break;

      case MIDIControlEvent.NOTE_ON:
        string += 'NOTE_ON';
        break;

      case MIDIControlEvent.AFTERTOUCH:
        string += 'AFTERTOUCH';
        break;

      case MIDIControlEvent.CONTROLLER:
        string += 'CONTROLLER';
        break;

      case MIDIControlEvent.PROGRAM_CHANGE:
        string += 'PROGRAM_CHANGE';
        break;

      case MIDIControlEvent.CHANNEL_AFTERTOUCH:
        string += 'CHANNEL_AFTERTOUCH';
        break;

      case MIDIControlEvent.PITCH_BEND:
        string += 'PITCH_BEND';
        break;

      default:
        string += 'UNKNOWN';
        break;
    }

    string += ' param1=' + this.param1 + ' param2=' + this.param2 + ' channel=' + this.channel + ']';

    return string;
  }

  readBytes(stream, status) {
    //console.log('MIDIControlEvent.readBytes', { stream, status });
    var running = false;
    var hibyte;
    var paramCount = 0;
    var b = this.type;

    hibyte = this.type = b & 0xf0;
    this.channel = b & 0x0f;

    if(this.channel > 15) throw new Error('Invalid channel number ' + this.channel);

    if(hibyte < 0x80) {
      if(status.length != 2) throw new Error('Invalid running status');

      running = true;
      this.type = hibyte = status[0];
      this.channel = status[1];
    } else {
      status[0] = hibyte;
      status[1] = this.channel;
    }

    switch (hibyte) {
      case MIDIControlEvent.NOTE_ON:
      case MIDIControlEvent.NOTE_OFF:
      case MIDIControlEvent.AFTERTOUCH:
      case MIDIControlEvent.CONTROLLER:
      case MIDIControlEvent.PITCH_BEND:
        paramCount = 2;
        break;

      case MIDIControlEvent.PROGRAM_CHANGE:
      case MIDIControlEvent.CHANNEL_AFTERTOUCH:
        paramCount = 1;
        break;

      default:
        throw new Error('Unknown control event type 0x' + hibyte.toString(16));
        return false;
        break;
    }
    //console.log('MIDIControlEvent.readBytes', { b, hibyte, paramCount }, status.length);

    if(paramCount > 0) {
      if(running) this.param1 = b;
      else this.param1 = stream.readByte();
    }

    if(paramCount > 1) this.param2 = stream.readByte();
  }

  writeBytes(stream) {
    stream.writeVLV(this.delta);
    stream.writeByte(this.type | this.channel);

    switch (this.type) {
      case MIDIControlEvent.NOTE_ON:
      case MIDIControlEvent.NOTE_OFF:
      case MIDIControlEvent.AFTERTOUCH:
      case MIDIControlEvent.CONTROLLER:
      case MIDIControlEvent.PITCH_BEND:
        stream.writeByte(this.param1);
        stream.writeByte(this.param2);
        break;

      case MIDIControlEvent.PROGRAM_CHANGE:
      case MIDIControlEvent.CHANNEL_AFTERTOUCH:
        stream.writeByte(this.param1);
        break;

      default:
        throw new Error("Don't know how to write control event type 0x" + this.type.toString(16));
        break;
    }
  }

  pitch() {
    if(arguments.length > 0) this.param1 = arguments[0];
    else return this.param1;
  }

  velocity() {
    if(arguments.length > 0) this.param2 = arguments[0];
    else return this.param2;
  }
}

Object.defineProperty(MIDIControlEvent.prototype, Symbol.toStringTag, {
  value: 'MIDIControlEvent',
  enumerable: false
});

export default MIDIControlEvent;
