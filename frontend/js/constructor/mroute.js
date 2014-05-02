
function MRoute(config)
{
	config 			= config||{};

	if(!config.target || !(config.target instanceof MTarget))
	{
		throw 'Please set route\'s target';
	}

	config.target.addChild(this);	

	this.settings 		= {};

	this.settings.strokeWidth  	= config.strokeWidth||4;
	this.settings.strokeColor  	= config.strokeColor||new Color(0,0,0,1);

	this.id 		= config.id||-9999;
	this.name 		= config.name||"Route";
	this.type 		= 'MapRoute';
	this.owner 		= this;

	this.iCanBeDrag 	= config.iCanBeDrag || 1;
	this.iCanBeChanged 	= config.iCanBeChanged || 1;

	this.target 	 	= config.target;
	this.layer 			= config.layer||null;

	this._route = new Group(this.settings);
	this._route.data.type = 'MapRoute';
	this._route.data.owner = this;

    var vstart 	= this.target.getPosition();
    var vend 	= config.end||vstart;

    this.moveTo(vstart,vend);
    this.attachToLayer(this.layer);
}

MRoute.prototype.manip = function()
{
	return this._route.children[1];
}

MRoute.prototype.moveTo = function(start,end)
{
	if(!this._route)
	{
		throw "Route element isn't drawn."
	}

	if(!this.iCanBeDrag)
	{
		return;
	}

	/*
 	 * Automatic alignment for bg offsets.
 	 */

 	var cpos = this.getPosition();

    var vstart 	= start || cpos[0];
    var vend 	= end || cpos[1];

    // if(this.isSamePosition(vstart,vend,cpos[0],cpos[1]))
    // {
    // 	return;
    // }

    var arrowVector = new Point(vend.x-vstart.x,vend.y-vstart.y).normalize(10);
    var left 		= arrowVector.rotate(160),
        right 		= arrowVector.rotate(-160);

    this._route.removeChildren();
    this._route.addChild(new Path.Line(vstart, vend));
    this._route.addChild(new Path(
	    new Point(vend.x + left.x,vend.y+left.y),
	    vend,
	    new Point(vend.x + right.x,vend.y+right.y)
	));

    this._route.children[1].data.type 			= 'MapRouteManip';
	this._route.children[1].data.owner 			= this;

	this._route.strokeWidth  		= this.settings.strokeWidth;
	this._route.strokeColor  		= this.settings.strokeColor;
}

MRoute.prototype.moveWith = function(dstart,dend)
{
	if(!this._route)
	{
		throw "Route element isn't drawn."
	}

	if(!this.iCanBeDrag)
	{
		return;
	}

	var start 	= new Point(dstart||new Point(0,0));
	var end 	= new Point(dend||new Point(0,0));

	var cpos = this.getPosition();

	start.x += cpos[0].x;
	start.y += cpos[0].y;

	end.x += cpos[1].x;
	end.y += cpos[1].y;

	this.moveTo(start,end);
}

MRoute.prototype.remove = function()
{
	this.target.dettachChild(this);
	this._route.remove();

	delete this;
}

MRoute.prototype.getPosition = function()
{
	if(!this._route || !this._route.children || !this._route.children.length)
	{
		return [new Point(0,0), new Point(0,0)];
	}

	return [this._route.children[0].segments[0].point,this._route.children[0].segments[1].point];
}

MRoute.prototype.attachToLayer = function(parent)
{
	if(!this._route)
	{
		throw "Route element isn't drawn."
	}

	parent && (parent instanceof Layer)? parent.addChild(this._route):1;
}

MRoute.prototype.isSamePosition = function(s1,e1,s2,e2)
{
	if(!s1 || !e1 || !s2 || !e2)
	{
		return false;
	}

	if(s1.x == s2.x && s1.y == s2.y && e1.x == e2.x && e1.y == e2.y)
	{
		return true;
	}

	return false;
}

