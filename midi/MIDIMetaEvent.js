function MIDIMetaEvent(type, param1, param2, text)
{
	this.type = (type ? type : null);

	this.text = (text ? text : null);
	this.unknownLength = null;
	this.unknownBytes = null;
	
	this.param1 = (param1 ? param1 : 0);
	this.param2 = (param2 ? param2 : 0);
}

MIDIMetaEvent.prototype.setTempo = function(bpm)
{
	this.type = MIDIMetaEvent.SET_TEMPO;
	this.param1 = Math.round(60000000.0 / bpm);
}

MIDIMetaEvent.prototype.readBytes = function(stream, status)
{
	var i, len;
	
	this.type = stream.readByte();
	
	switch(this.type)
	{
		case MIDIMetaEvent.TEXT:
		case MIDIMetaEvent.COPYRIGHT:
		case MIDIMetaEvent.TRACK_NAME:
		case MIDIMetaEvent.INSTRUMENT_NAME:
		case MIDIMetaEvent.LYRIC:
		case MIDIMetaEvent.MARKER:
		case MIDIMetaEvent.CUE_POINT:
			len = stream.readByte();
			this.text = "";
			for(i = 0; i < len; i++)
				this.text += String.fromCharCode(stream.readByte());
			break;
			
		case MIDIMetaEvent.SET_TEMPO:
			len = stream.readByte();
			var a, b, c;
			
			a = stream.readByte() & 0xFF;
			b = stream.readByte() & 0xFF;
			c = stream.readByte() & 0xFF;
			
			this.param1 = (a << 16) | (b << 8) | c;
			break;
			
		case MIDIMetaEvent.SMPTE_OFFSET:
			len = stream.readByte();
			_param1 = stream.readByte();
			_param2 = stream.readUint();
			break;
			
		case MIDIMetaEvent.TIME_SIGNATURE:
			len = stream.readByte();
			this.param1 = stream.readShort();
			this.param2 = stream.readShort();
			break;
			
		case MIDIMetaEvent.KEY_SIGNATURE:
		case MIDIMetaEvent.SEQUENCE_NUMBER:
			len = stream.readByte();
			this.param1 = stream.readByte();
			this.param2 = stream.readByte();
			break;
			
		case MIDIMetaEvent.END_OF_TRACK:
			len = stream.readByte();
			break;
			
		case MIDIMetaEvent.CHANNEL_PREFIX:
		case MIDIMetaEvent.PORT_PREFIX:
			len = stream.readByte();
			this.param1 = stream.readByte();
			break;
			
		case MIDIMetaEvent.SEQUENCER_SPECIFIC:
			len = this.unknownLength = stream.readVLV();
			this.unknownBytes = [];
			
			for(i = 0; i < len; i++)
				this.unknownBytes[i] = stream.readByte();
			
			break;
			
		default:
			throw new Error("Unknown meta event type 0x" + type.toString(16));
			break;
	}
}

MIDIMetaEvent.prototype.writeBytes = function(stream)
{
	stream.writeVLV(this.delta);
	stream.writeByte(MIDIEvent.TYPE_META);
	stream.writeByte(this.type);
	
	switch(this.type)
	{
		case MIDIMetaEvent.TEXT:
		case MIDIMetaEvent.COPYRIGHT:
		case MIDIMetaEvent.TRACK_NAME:
		case MIDIMetaEvent.INSTRUMENT_NAME:
		case MIDIMetaEvent.LYRIC:
		case MIDIMetaEvent.MARKER:
		case MIDIMetaEvent.CUE_POINT:
			if(this.text == null)
				this.text = "";
				
			if(this.text.length > 255)
			{
				if(console)
					console.log("WARNING: Trimming meta event text to 255 characters");
				this.text = this.text.substr(0, 255);
			}
			
			stream.writeByte(Math.min(this.text.length, 255));
			for(var i = 0; i < this.text.length; i++)
				stream.writeByte(this.text.charCodeAt(i));
				
			break;
			
		case MIDIMetaEvent.SEQUENCE_NUMBER:
			stream.writeByte(2);
			stream.writeByte(this.param1);
			stream.writeByte(this.param2);
			break;
			
		case MIDIMetaEvent.END_OF_TRACK:
			stream.writeByte(0);
			break;
			
		case MIDIMetaEvent.SET_TEMPO:
			stream.writeByte(3);
			stream.writeByte((this.param1 & 0xFF0000) >> 16);
			stream.writeByte((this.param1 & 0xFF00) >> 8);
			stream.writeByte(this.param1 & 0xFF);
			break;
			
		case MIDIMetaEvent.SMPTE_OFFSET:
			stream.writeByte(5);
			stream.writeByte(this.param1);
			stream.writeUint(this.param2);
			break;
			
		case MIDIMetaEvent.TIME_SIGNATURE:
			stream.writeByte(4);
			stream.writeShort(this.param1);
			stream.writeShort(this.param2);
			break;
			
		case MIDIMetaEvent.KEY_SIGNATURE:
			stream.writeByte(2);
			stream.writeByte(this.param1);
			stream.writeByte(this.param2);
			break;
			
		case MIDIMetaEvent.CHANNEL_PREFIX:
		case MIDIMetaEvent.PORT_PREFIX:
			stream.writeByte(1);
			stream.writeByte(this.param1);
			break;
			
		case MIDIMetaEvent.SEQUENCER_SPECIFIC:
			stream.writeVLV(this.unknownLength);
			for(var i = 0; i < this.unknownLength; i++)
				stream.writeByte(this.unknownBytes[i]);
			break;
			
		default:
			throw new Error("Don't know how to write meta event type 0x" + this.type.toString(16));
			break;
	}
}

MIDIMetaEvent.prototype.toString = function()
	{
		var result = "[MIDIMetaEvent type="
		
		switch(this.type)
		{
			case MIDIMetaEvent.SEQUENCE_NUMBER:
				result += "SEQUENCE_NUMBER";
				break;
			case MIDIMetaEvent.TEXT:
				result += "TEXT";
				break;
			case MIDIMetaEvent.COPYRIGHT:
				result += "COPYRIGHT";
				break;
			case MIDIMetaEvent.TRACK_NAME:
				result += "TRACK_NAME";
				break;
			case MIDIMetaEvent.INSTRUMENT_NAME:
				result += "INSTRUMENT_NAME";
				break;
			case MIDIMetaEvent.LYRIC:
				result += "LYRIC";
				break;
			case MIDIMetaEvent.MARKER:
				result += "MARKER";
				break;
			case MIDIMetaEvent.CUE_POINT:
				result += "CUE_POINT";
				break;
			case MIDIMetaEvent.CHANNEL_PREFIX:
				result += "CHANNEL_PREFIX";
				break;
			case MIDIMetaEvent.PORT_PREFIX:
				result += "PORT_PREFIX";
				break;
			case MIDIMetaEvent.END_OF_TRACK:
				result += "END_OF_TRACK";
				break;
			case MIDIMetaEvent.SET_TEMPO:
				result += "SET_TEMPO";
				break;
			case MIDIMetaEvent.SMPTE_OFFSET:
				result += "SMPTE_OFFSET";
				break;
			case MIDIMetaEvent.TIME_SIGNATURE:
				result += "TIME_SIGNATURE";
				break;
			case MIDIMetaEvent.KEY_SIGNATURE:
				result += "KEY_SIGNATURE";
				break;
			case MIDIMetaEvent.SEQUENCER_SPECIFIC:
				result += "SEQUENCER_SPECIFIC";
				break;
			default:
				result += "UNKNOWN";
				break;
		}
		
		result += " param1: 0x" + this.param1.toString(16) + ", param2: 0x" + this.param2.toString(16);
		
		if(this.text)
			result += " text='"+this.text+"'";
		
		result += "]";
		return result;
	}

MIDIMetaEvent.SEQUENCE_NUMBER		= 0x00;
MIDIMetaEvent.TEXT					= 0x01;
MIDIMetaEvent.COPYRIGHT				= 0x02;
MIDIMetaEvent.TRACK_NAME			= 0x03;
MIDIMetaEvent.INSTRUMENT_NAME		= 0x04;
MIDIMetaEvent.LYRIC					= 0x05;
MIDIMetaEvent.MARKER				= 0x06;
MIDIMetaEvent.CUE_POINT				= 0x07;

MIDIMetaEvent.CHANNEL_PREFIX		= 0x20;
MIDIMetaEvent.PORT_PREFIX			= 0x21;

MIDIMetaEvent.END_OF_TRACK			= 0x2F;
MIDIMetaEvent.SET_TEMPO				= 0x51;
MIDIMetaEvent.SMPTE_OFFSET			= 0x54;
MIDIMetaEvent.TIME_SIGNATURE		= 0x58;
MIDIMetaEvent.KEY_SIGNATURE			= 0x59;

MIDIMetaEvent.SEQUENCER_SPECIFIC	= 0x7F;