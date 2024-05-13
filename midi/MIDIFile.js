export { MIDIStream } from './MIDIStream.js';
export { MIDITrack } from './MIDITrack.js';
var MThd = 0x4d546864;

export class MIDIFile {
  constructor() {
    this.tracks = [];
    this.type = 0;
    this.timeDivision = 480;
  }

  toString() {
    var stream = new MIDIStream();
    this.writeBytes(stream);

    var string =
      '[MIDI File - Type ' +
      this.type +
      ', ' +
      this.tracks.length +
      ' tracks, ' +
      this.timeDivision +
      ' delta ticks per quarter note]\r\n';
    for(var i = 0; i < this.tracks.length; i++) string += this.tracks[i].toString();

    return string;
  }

  readBytes(stream) {
    this.tracks = [];

    var trackCount = readHeader.call(this, stream);

    for(var i = 0; i < trackCount; i++) {
      this.tracks[i] = new MIDITrack();
      this.tracks[i].readBytes(stream);
    }
  }

  writeBytes(stream) {
    writeHeader.call(this, stream);

    for(var i = 0; i < this.tracks.length; i++) this.tracks[i].writeBytes(stream);
  }
}

function readHeader(stream) {
  var header = stream.readUint();

  if(header != MThd) throw new Error('Invalid MIDI header - MThd not found');

  var size = stream.readUint();
  var trackCount;

  this.type = stream.readShort();
  trackCount = stream.readShort();
  this.timeDivision = stream.readShort();

  if(size > 6) for(var i = 0; i < size - 6; i++) stream.readByte();

  return trackCount;
}

function writeHeader(stream) {
  if(this.tracks.length > 1 && this.type != 1) {
    if(console) console.log('WARNING: MIDIFile has more than one track - forcing MIDI type 1');
    this.type = 1;
  }

  stream.writeUint(MThd);
  stream.writeUint(0x6);
  stream.writeShort(this.type);
  stream.writeShort(this.tracks.length);
  stream.writeShort(this.timeDivision);
}

Object.defineProperty(MIDIFile.prototype, Symbol.toStringTag, {
  value: 'MIDIFile',
  enumerable: false
});

export default MIDIFile;
