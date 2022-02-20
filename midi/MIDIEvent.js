var MIDIEvent = {
	TYPE_CONTROL: 0,
	TYPE_SYSEX: 0xF0,
	TYPE_AUTHORIZATION_SYSEX: 0xF7,
	TYPE_META: 0xFF,

	read: function(stream, status)
	{
		var delta = stream.readVLV();
		var b = stream.readByte();
		var hibyte;
		var result;
		
		b = b & 0xFF;
		hibyte = b & 0xF0;
		
		switch(b)
		{
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
		result.readBytes(stream, status);
		
		return result;
	}
};