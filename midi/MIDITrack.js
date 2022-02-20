var MIDITrack = (function() {
	
	var MTrk		= 0x4D54726B;
	var trackEnd	= 0x00FF2F00;

	function MIDITrack()
	{
		this._writeSize;
		
		this.events = [];
		this.name = "";
	}

	MIDITrack.prototype.readBytes = function(stream)
	{
		var header = stream.readUint();
		if(header != MTrk)
			throw new Error("Invalid track - Expected MTrk");
			
		var chunkSize = stream.readUint();
		
		var bytes = 0;
		var cursor = 0;
		var eot = false;
		var status = [];
		status[0] = 0;
		
		while(bytes < chunkSize)
		{
			cursor = stream.position;
			
			try
			{
				event = MIDIEvent.read(stream, status);
				this.events.push(event);
			}
			catch(e)
			{
				throw new Error("Failed to read event at 0x" + cursor.toString(16) + ": " + e);
			}
			
			if(event instanceof MIDIMetaEvent)
			{
				if(event.type == MIDIMetaEvent.END_OF_TRACK)
					eot = true;
				else if(event.type == MIDIMetaEvent.TRACK_NAME)
					this.name = event.text;
			}
		
			bytes += stream.position - cursor;
		}
		
		if(!eot)
			throw new Error("Expected end of track event");
			
		if(bytes < chunkSize)
			throw new Error("Read less bytes than track chunk size");
	}
		
	MIDITrack.prototype.writeBytes = function(stream)
	{
		var sizePosition;
		var cursor;
		var size;

		stream.writeUint(MTrk);
		
		sizePosition = stream.position;
		stream.writeUint(0);		// Temporary size
		
		for(var i = 0; i < this.events.length; i++)
		{
			if(this.events[i].type != MIDIMetaEvent.END_OF_TRACK)
				this.events[i].writeBytes(stream);
		}
			
		var eot = new MIDIMetaEvent(MIDIMetaEvent.END_OF_TRACK);
		eot.writeBytes(stream);
			
		cursor = stream.position;
		this._writeSize = size = cursor - sizePosition - 4;	// Minus the size of the size uint itself
		stream.position = sizePosition;
		stream.writeUint(size);
		stream.position = cursor;
	}

	MIDITrack.prototype.toString = function()
	{
		var string = "[MIDI Track - " + this._writeSize + " bytes]\r\n";
		
		for(var i = 0; i < this.events.length; i++)
			string += this.events[i].toString() + "\r\n";
		
		return string;
	}

	return MIDITrack;

})();