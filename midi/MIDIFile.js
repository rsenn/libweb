var MIDIFile = (function() {
	var MThd = 0x4D546864;
	
	function MIDIFile()
	{
		this.tracks = [];
		this.type = 0;
		this.timeDivision = 480;
	}
	
	MIDIFile.prototype.toString = function()
	{
		var stream = new MIDIStream();
		this.writeBytes(stream);
		
		var string = "[MIDI File - Type " + this.type + ", " + this.tracks.length + " tracks, " + this.timeDivision + " delta ticks per quarter note]\r\n";
		for(var i = 0; i < this.tracks.length; i++)
			string += this.tracks[i].toString();
	
		return string;
	}
	
	function readHeader(stream)
	{
		var header = stream.readUint();
		
		if(header != MThd)
			throw new Error("Invalid MIDI header - MThd not found");
			
		var size = stream.readUint();
		var trackCount;
		
		this.type			= stream.readShort();
		trackCount 			= stream.readShort();
		this.timeDivision 	= stream.readShort();
		
		if(size > 6)
			for(var i = 0; i < size - 6; i++)
				stream.readByte();
				
		return trackCount;
	}
	
	function writeHeader(stream)
	{
		if(this.tracks.length > 1 && this.type != 1)
		{
			if(console)
				console.log("WARNING: MIDIFile has more than one track - forcing MIDI type 1");
			this.type = 1;
		}
	
		stream.writeUint(MThd);
		stream.writeUint(0x6);
		stream.writeShort(this.type);
		stream.writeShort(this.tracks.length);
		stream.writeShort(this.timeDivision);
	}
	
	MIDIFile.prototype.readBytes = function(stream)
	{
		this.tracks = [];
	
		var trackCount = readHeader.call(this, stream);
		
		for(var i = 0; i < trackCount; i++)
		{
			this.tracks[i] = new MIDITrack();
			this.tracks[i].readBytes(stream);
		}
	}
	
	MIDIFile.prototype.writeBytes = function(stream)
	{
		writeHeader.call(this, stream);
		
		for(var i = 0; i < this.tracks.length; i++)
			this.tracks[i].writeBytes(stream);
	}
	
	return MIDIFile;
})();