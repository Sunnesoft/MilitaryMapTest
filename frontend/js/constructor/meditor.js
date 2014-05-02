function MEditor(config)
{
	this.layer = new Layer();
	this.target = null;

	config = config||{};

	this.scaling 		= new Point(1,1);
	this.rotation 		= 0;
	this.rotarm 		= config.rotarm || 20;
	this.radius 		= config.radius || 8;
	this.color 			= config.color || new Color(0,0,1,0.5);
	this.strokeColor 	= config.strokeColor || new Color(0,0,0,1);

	this.owner = this;
	this.type = 'MapTargetEditor';
}

MEditor.prototype.draw = function(target)
{
	this.dettach();

	this.target = target;

	var point 	= target.getPosition(),
		size 	= target.getSize();

	var editor 		= new Group();
	
	editor.addChild(new Path.Rectangle({
		center: [0,0],
		size: size,
		strokeColor: this.strokeColor
	}));
	
	editor.addChild(new Path.Rectangle({
		center: [- size.width/2, - size.height/2],
		size: this.radius,
		strokeColor: this.strokeColor,
		fillColor: this.color,
		data: {
			'owner': this,
			'action': 'scale',
			'type': 'MapTargetManip'
		}
	}));
	
	editor.addChild(new Path.Rectangle({
		center: [+ size.width/2, - size.height/2],
		size: this.radius,
		strokeColor: this.strokeColor,
		fillColor: this.color,
		data: {
			'owner': this,
			'action': 'scale',
			'type': 'MapTargetManip'
		}
	}));
	
	editor.addChild(new Path.Rectangle({
		center: [+ size.width/2, + size.height/2],
		size: this.radius,
		strokeColor: this.strokeColor,
		fillColor: this.color,
		data: {
			'owner': this,
			'action': 'scale',
			'type': 'MapTargetManip'
		}
	}));
	
	editor.addChild(new Path.Rectangle({
		center: [- size.width/2, + size.height/2],
		size: this.radius,
		strokeColor: this.strokeColor,
		fillColor: this.color,
		data: {
			'owner': this,
			'action': 'scale',
			'type': 'MapTargetManip'
		}
	}));
	
	editor.addChild(new Path.Circle({
		center: [0, -size.height/2 - this.rotarm],
		radius: this.radius/1.5,
		strokeColor: this.strokeColor,
		fillColor: this.color,
		data: {
			'owner': this,
			'action': 'rotate',
			'type': 'MapTargetManip'
		}
	}));

	this.rotation = target.getRotation();
	this.scaling = new Point(target.getScaling());

	editor.data.type 	= 'MapTargetEditor';
	editor.data.owner 	= this;	
	editor.position 	= point;
	editor.position.y   -= this.rotarm/2;
	editor.scale(this.scaling.x,this.scaling.y,point);
	editor.rotate(this.rotation,point);

	for(var i in editor.children)
	{
		if(i == 0) { continue;}
		
		editor.children[i].rotate(-this.rotation,point);
		editor.children[i].setScaling(1/this.scaling.x,1/this.scaling.y,point);	
		
		if(i == 5)
		{
			editor.children[i].position.y = point.y - this.scaling.y*size.height/2 - this.rotarm;
		}

		editor.children[i].rotate(this.rotation,point);
	}


	this.layer.addChild(editor);
}

MEditor.prototype.dettach = function()
{	
	this.layer.removeChildren();
	this.target = null;
	this.scaling = 1;
	this.rotation = 0;
}

MEditor.prototype.remove = function()
{
	this.layer.remove();
	delete this;
}

MEditor.prototype.transformByDelta = function(delta,manip)
{
	if(!manip || !manip.data || !manip.data.action || manip.data.type != 'MapTargetManip')
	{
		throw "Incorrect minupulator!";
	}

	switch(manip.data.action)
	{
	case 'rotate':
		this._rotate(delta);
		break;
	case 'scale':
		this._scale(delta,manip);
		break;
	}
}

MEditor.prototype.moveTargetTo = function(point)
{
	if(!this.target || this.layer.children.length==0)
	{
		return;
	}

	var pos = this.target.getPosition();

	this.moveTargetWith(new Point(point.x - pos.x,point.y - pos.y));
}

MEditor.prototype.moveTargetWith = function(delta)
{
	if(!this.target || this.layer.children.length==0)
	{
		return;
	}

	this.target.moveChildsWith(delta);

	this.layer.children[0].position.x += delta.x;
	this.layer.children[0].position.y += delta.y;
}

MEditor.prototype.moveTo = function(point)
{
	if(!this.layer)
	{
		return;
	}

	var pos = this.layer.getPosition();

	this.moveWith(new Point(point.x - pos.x,point.y - pos.y));
}

MEditor.prototype.moveWith = function(delta)
{
	if(!this.layer)
	{
		return;
	}

	this.layer.position.x += delta.x;
	this.layer.position.y += delta.y;
}

/**********************************************/

MEditor.prototype._rotate = function(delta)
{
	var size = this.target.getRealSize();
	var pos = this.target.getPosition();

	var ang = this.rotation*Math.PI/180,
		ca = Math.cos(ang),
		sa = Math.sin(ang);

	var px = ca*delta.x + sa*delta.y;
	var py = -sa*delta.x + ca*delta.y;

	var c = Math.sqrt(px*px+py*py);

	var sign = Math.atan2(py,px);	
	sign = sign>=-Math.PI/2 && sign<=Math.PI/2?1:-1;

	var t = (sign*2*Math.asin(c/(2*(this.rotarm+size.height/2)))*180/Math.PI);
	this.rotation += t;

	this.target.rotate(t,pos);
	this.layer.children[0].rotate(t,pos);
}

MEditor.prototype._scale = function(d,manip,speed)
{
	speed = speed || 5;

	var size = this.target.getRealSize(),
		pos = this.target.getPosition(),
		ang = this.rotation*Math.PI/180,
		ca = Math.cos(ang),
		sa = Math.sin(ang);

	var mcx = manip.position.x - pos.x;
	var mcy = manip.position.y - pos.y;

	var mx = ca*mcx + sa*mcy;
	var my = -sa*mcx + ca*mcy;

	var dx = ca*d.x + sa*d.y;
	var dy = -sa*d.x + ca*d.y;
		
	var scx = 1+(mx>=0?1:-1)*2*dx/size.width/speed;
	var scy = 1+(my>=0?1:-1)*2*dy/size.height/speed;
		
	var csx = scx*this.scaling.x;
	var csy = scy*this.scaling.y;
	
	scx = csx < 0.45?0.5/this.scaling.x:scx;
	scx = csx > 2.05?2/this.scaling.x:scx;
	scy = csy < 0.45?0.5/this.scaling.y:scy;
	scy = csy > 2.05?2/this.scaling.y:scy;
	
	this.scaling.x *= scx;
	this.scaling.y *= scy;
	
	this.target.rotate(-this.rotation,pos);
	this.target.scale(scx,scy,pos);
	this.target.rotate(this.rotation,pos);
	
	this.layer.children[0].rotate(-this.rotation,pos);
	this.layer.children[0].scale(scx,scy,pos);
	this.layer.children[0].rotate(this.rotation,pos);
	
	for(var i in this.layer.children[0].children)
	{
		if(i == 0) { continue;}
		
		this.layer.children[0].children[i].rotate(-this.rotation,pos);
		this.layer.children[0].children[i].setScaling(1/scx,1/scy,pos);		
		
		if(i == 5)
		{
			this.layer.children[0].children[i].position.y = pos.y - size.height/2 - this.rotarm;
		}

		this.layer.children[0].children[i].rotate(this.rotation,pos);
	}
}