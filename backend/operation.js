function Operation(name, mustDo)
{
	var $this = this;
	var me = name;
	var op = mustDo||function(){};

	this.getName = function(){ return me; }
	this.run = function()
	{
		//this - OperationPull
		op.apply($this,Array.prototype.slice.call(arguments, 0));
	}
}

var opPull = {};

exports.register = function(name,mustDo)
{
	opPull[name] = new Operation(name,mustDo);
}

exports.unregister = function(name)
{
	if(opPull.hasOwnProperty(name))
	{
		delete opPull[name];
	}
}

exports.run = function(name)
{
	var args = Array.prototype.slice.call(arguments, 0);
	
	if(args.length >= 1 && opPull.hasOwnProperty(name))
	{
		opPull[name].run.apply(this,args.slice(1));
	}		
}