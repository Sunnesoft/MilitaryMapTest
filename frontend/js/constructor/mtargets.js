function MTargets()
{
	this._t 	= new Layer();
	this._r 	= new Layer();

	/*
	 *	Need for fix layers size.
	 */ 

	this._r.addChild(new Path.Rectangle());
	this._t.addChild(new Path.Rectangle());

	this._size = new Size(0,0);
}

MTargets.prototype.attachTarget = function(config)
{
	config.layer = this._t;
	var t = new MTarget(config);

	return t;
}

MTargets.prototype.attachRoute = function(config)
{
	var r;

	try
	{
		r = new MRoute(config);
		r.attachToLayer(this._r);
	}
	catch(e)
	{
		r = null;
		console.log(e);
	}

	return r;
}

MTargets.prototype.dettach = function(object)
{
	if(!object)
	{
		return;
	}

	object.remove();
}

MTargets.prototype.dettachAll = function()
{
	if(this._t.children.length < 2){ return; }

	var last = this._t.children.pop();

	while(last)
	{
		last.data.owner.remove();

		if(this._t.children.length<=1)
		{
			break;
		}

		last = this._t.children.pop();
	}
}

MTargets.prototype.moveWith = function(delta)
{
	this._t.position.x += delta.x;
	this._t.position.y += delta.y;		

	this._r.position.x += delta.x;
	this._r.position.y += delta.y;		
}

MTargets.prototype.moveTo = function(point)
{
	this._t.position = point;		

	this._r.position = point;	
}

MTargets.prototype.getRoutesPosition = function()
{
	return this._r.position;
}

MTargets.prototype.getTargetsPosition = function()
{
	return this._t.position;
}

MTargets.prototype.getRoutesCount = function()
{
	return this._r.children.length - 1;
}

MTargets.prototype.getTargetsCount = function()
{
	return this._t.children.length - 1;
}

MTargets.prototype.getTargets = function()
{
	return this._t.children.slice(1);
}

MTargets.prototype.getRoutes = function()
{
	return this._r.children.slice(1);
}

MTargets.prototype.resize = function(size)
{
	var sx = size.width/this._size.width,
		sy = size.height/this._size.height;	

	var tpos = this.getTargetsPosition(),
		rpos = this.getRoutesPosition();

	/*
	 * Create rectangles in current layers positions.
	 */

	this._t.insertChild(1,new Path.Rectangle({'center': tpos, 'size':size}));
	this._r.insertChild(1,new Path.Rectangle({'center': rpos, 'size':size}));

	this._t.removeChildren(0,1);
	this._r.removeChildren(0,1);

	var targets = this.getTargets();

	for(var i in targets)
	{
		/*
		 * x = (x - center)*scaleFactor + x;
		 */

		var target = targets[i].data.owner;

		var lpos = target.getPosition();

		lpos.x = (lpos.x - tpos.x)*sx + tpos.x;
		lpos.y = (lpos.y - tpos.y)*sy + tpos.y;

		target.moveTo(lpos);
	}

	var routes = this.getRoutes();

	for(var i in routes)
	{
		var route = routes[i].data.owner;

		var lpos = route.getPosition();

		lpos[0].x = (lpos[0].x - rpos.x)*sx + rpos.x;
		lpos[0].y = (lpos[0].y - rpos.y)*sy + rpos.y;
		lpos[1].x = (lpos[1].x - rpos.x)*sx + rpos.x;
		lpos[1].y = (lpos[1].y - rpos.y)*sy + rpos.y;

		route.moveTo(lpos[0],lpos[1]);
	}

	this._size = size;

	paper.view.update();
}