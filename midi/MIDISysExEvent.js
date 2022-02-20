function MIDISysExEvent(auth)
{
	this.unknownLength = 0;
	this.unknownBytes = [];
	this.auth = auth;
}

MIDISysExEvent.prototype.toString = function()
{
	return "[MIDISysExEvent length=" + this.unknownLength + " authorization=" + this.auth + "]";
}

MIDISysExEvent.prototype.readBytes = function(stream, status)
{
	this.unknownLength = stream.readVLV();
	
	for(var i = 0; i < this.unknownLength; i++)
		this.unknownBytes[i] = stream.readByte();
}

MIDISysExEvent.prototype.writeBytes = function(stream)
{
	stream.writeVLV(this.unknownLength);
	
	for(var i = 0; i < this.unknownLength; i++)
		stream.writeByte(this.unknownBytes[i]);
}