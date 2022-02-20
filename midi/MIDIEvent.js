import { MIDIControlEvent } from './MIDIControlEvent.js';
import { MIDIMetaEvent } from './MIDIMetaEvent.js';
import { MIDISysExEvent } from './MIDISysExEvent.js';

export const MIDIEvent = {
  TYPE_CONTROL: 0,
  TYPE_SYSEX: 0xf0,
  TYPE_AUTHORIZATION_SYSEX: 0xf7,
  TYPE_META: 0xff,

  read: function(stream, status) {
    console.log('MIDIEvent.read', { status, buffer: stream._dv.buffer });

    var delta = stream.readVLV();
    var b = stream.readByte();
    var hibyte;
    var result;

    b = b & 0xff;
    hibyte = b & 0xf0;
    console.log('MIDIEvent.read', { delta, b });

    switch (b) {
      case MIDIEvent.TYPE_META:
        result = new MIDIMetaEvent();
        break;

      case MIDIEvent.TYPE_SYSEX:
      case MIDIEvent.TYPE_AUTHORIZATION_SYSEX:
        result = new MIDISysExEvent(b == EVENT_AUTHORIZATION_SYSEX);
        break;

      default:
        result = new MIDIControlEvent();
        break;
    }

    result.delta = delta;
    result.type = b;

    console.log('MIDIEvent.read', { result });

    result.readBytes(stream, status);

    return result;
  }
};
/*
export { MIDIControlEvent } from './MIDIControlEvent.js';
export { MIDIMetaEvent } from './MIDIMetaEvent.js';
export { MIDISysExEvent } from './MIDISysExEvent.js';
*/
export default MIDIEvent;
