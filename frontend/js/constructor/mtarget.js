
function MTarget( config )
{
	this._raster = null;
	this._rotation = 0;
	this._scaling = new Point(1,1);

	config 			= config||{};
	config.manip 	= config.manip||{};

	this.settings 		= {};
	this.settings.manip = {};

	this.settings.position = config.position || new Point(0,0);
	this.settings.initwidth = config.initwidth || 80;
	this.settings.rotation = config.rotation || 0;
	this.settings.scaling = config.scaling || new Point(1,1);
	this.settings.onError = config.onError || function(){};
	this.settings.onLoad = config.onLoad || function(){};

	this.id = config.id || -9999;
	this.name = config.name || "Unnamed";
	this.source = config.source || '';
	this.routes = [];
	this.layer = config.layer||null;
	this.type = 'MapTarget';
	this.owner = this;

	this.iCanBeDrag = config.iCanBeDrag || 1;
	this.iCanBeChanged = config.iCanBeChanged || 1;
	this.iCanHaveRoute = config.iCanHaveRoute || 1;

	this.addChildren(config.routes);

	this._drawTarget();
}


MTarget.prototype.rotate = function(a,pos)
{
	if(!this._raster)
	{
		throw 'MTarget object isn\'t load';
	}

	a = a||0;

	this._rotation += a;
	this._raster.rotate(a,pos);
}

MTarget.prototype.scale = function(sx,sy,pos)
{
	if(!this._raster)
	{
		throw 'MTarget object isn\'t load';
	}

	sx = sx || 1;
	sy = sy || 1;

	this._scaling.x *= sx;
	this._scaling.y *= sy;

	this._raster.scale(sx,sy,pos);
}


MTarget.prototype.moveTo = function(point)
{
	if(!this._raster)
	{
		throw 'MTarget object isn\'t load';
	}

	if(!this.iCanBeDrag)
	{
		return;
	}

	this.moveWith(new Point(
		point.x - this._raster.position.x,
		point.y - this._raster.position.y  
	));		
}

MTarget.prototype.moveWith = function(delta)
{
	if(!this._raster)
	{
		throw 'MTarget object isn\'t load';
	}

	if(!this.iCanBeDrag)
	{
		return;
	}

	this._raster.position.x += delta.x;
	this._raster.position.y += delta.y;
}

MTarget.prototype.moveChildsTo = function(point)
{
	if(!this._raster)
	{
		throw 'MTarget object isn\'t load';
	}

	if(!this.iCanBeDrag)
	{
		return;
	}

	this.moveChildsWith(new Point(
		this._raster.position.x - point.x,
		this._raster.position.y - point.y 
	));		
}

MTarget.prototype.moveChildsWith = function(delta)
{
	if(!this._raster)
	{
		throw 'MTarget object isn\'t load';
	}

	if(!this.iCanBeDrag)
	{
		return;
	}

	this._raster.position.x += delta.x;
	this._raster.position.y += delta.y;

	for(var i in this.routes||[])
	{
		this.routes[i].moveWith(delta,0);
	}
}

MTarget.prototype.attachToLayer = function(parent)
{
	if(!this._raster)
	{
		throw 'attachToLayer:MTarget object isn\'t load';
	}

	parent && (parent instanceof Layer)? parent.addChild(this._raster):1;
}

MTarget.prototype.remove = function()
{
	if(!this._raster)
	{
		throw 'remove:MTarget object isn\'t load';
	}

	this.removeChildren();
	this._raster.remove();
	
	delete this;
}

MTarget.prototype.removeChildren = function()
{
	var last = (this.routes||[]).pop();

	while(last)
	{
		last.remove();
		last = this.routes.pop();
	}
}

MTarget.prototype.addChild = function(object)
{
	if(!this.iCanHaveRoute)
	{
		throw 'addChild:MTarget object doesn\'t want to have child. Go out!';
	}

	this.routes = this.routes || [];

	this.routes.push(object);
}

MTarget.prototype.addChildren = function(routes)
{
	if(!this.iCanHaveRoute)
	{
		throw 'addChild:MTarget object doesn\'t want to have child. Go out!';
	}

	for(var i in routes||[])
	{
		this.addChild(routes[i]);
	}
}

MTarget.prototype.removeChild = function(object)
{
	for(var i in this.routes||[])
	{
		if(this.routes[i] == object)
		{
			this.routes[i].remove();
		}
	}	
}

MTarget.prototype.dettachChild = function(object)
{
	for(var i in this.routes||[])
	{
		if(this.routes[i] == object)
		{
			this.routes.splice(i,1);
		}
	}	
}

MTarget.prototype.getPosition = function()
{
	return this._raster.position;
}

MTarget.prototype.getScaling = function()
{
	return this._scaling;
}

MTarget.prototype.getRotation = function()
{
	return this._rotation;
}

MTarget.prototype.getSize = function()
{
	return new Size(this._raster.size);
}

MTarget.prototype.getRealSize = function()
{
	var sc = this.getScaling();
	var size = this.getSize();

	size.width *=sc.x;
	size.height *=sc.y;

	return size;
}

/*****************private*****************/



MTarget.prototype._drawTarget = function()
{
	var $this = this;

	$('<img>',{'src':$this.source}).error(function(event){
		$this.settings.onError.bind($this)(event);  
    }).load(function(event){
    	$this._raster = new Raster(event.target);	
    	$this._raster.data.owner = $this;
    	$this._raster.data.type = $this.type;

		var h = $this._raster.height/$this._raster.width;
		$this._raster.setSize($this.settings.initwidth,$this.settings.initwidth*h);
		$this.scale($this.settings.scaling.x,$this.settings.scaling.y);
		$this.rotate($this.settings.rotation);
		$this.moveTo($this.settings.position);

		$this.attachToLayer($this.layer);		
		$this.settings.onLoad.bind($this)(event);   

		paper.view.update();	
    });		
}

