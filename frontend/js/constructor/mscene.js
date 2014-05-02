function MScene()
{
	this.bg 		= new Layer();
	this.grid 		= new MGrid(this);	

	this.legend 	= new MText(this);
	this.title		= new MText(this);
	
	this.targets 	= new MTargets();
	this.editor 	= new MEditor();
	this.hint		= new MText(this);

	this.bgImage		= null;
	this.onmousedowm 	= function(){};
	this.onmouseup 		= function(){};
	this.onmousemove 	= function(){};
	this.onmouseleave 	= function(){};
	this.ondblclick 	= function(){};
	this.onresize 		= function(){};
	this.onbeforeunload = function(){};

	paper.project.tool = paper.project.tool || new Tool();

	/**********private**********/

	this._isEventAllow = false;
	this._setHandlers();
}

MScene.prototype.setParams = function(config)
{
	$.extend(true,this,config);
}

MScene.prototype.draw = function(config,onLoad,onError)
{
	this._isEventAllow = false;
	
	config = config || {};

	this.setParams(config.scene||{});

	this._loadImg(this.source,function(event){
		this.bgImage 			= event.target;
		this.bgImage.sourceFile = this.source;

		this.render(config);
		this._isEventAllow = true;
		(onLoad||function(){}).bind(this)(event);

	},function(event){
		(onError||function(){}).bind(this)(event);
	});
}

MScene.prototype.render = function(config)
{
	config = config || {};

	if(!this.bgImage)
	{
		return;
	}

	this.bg.removeChildren();
	this.bg.addChild(new Raster(this.bgImage));
	this.bg.children[0].setSize(
		(this.scaling||1)*paper.view.size.width,
		(this.scaling||1)*paper.view.size.width*this.bg.children[0].height/this.bg.children[0].width
	);	

	this.grid.setParams(config.grid||{});
	this.targets.resize(this.getRealSize());
	this.editor.dettach();
	this.moveTo(paper.view.center);

	this.legend.setParams(config.legend||{});
	this.title.setParams(config.title||{});
	this.hint.setParams(config.hint||{});

	paper.view.update();
}

MScene.prototype.moveTo = function(point)
{
	this.bg.position 		= point;
	this.grid.moveTo(point);
	this.targets.moveTo(point);
}

MScene.prototype.moveWith = function(delta)
{
	this.bg.position.x 		+= delta.x;
	this.bg.position.y 		+= delta.y;

	this.grid.moveWith(delta);
	this.legend.moveWith(delta);
	this.title.moveWith(delta);
	this.targets.moveWith(delta);
	this.editor.moveWith(delta);
}

MScene.prototype.getSize = function()
{
	return new Size(this.bgImage.width,this.bgImage.height);
}

MScene.prototype.getRealSize = function()
{
	if(this.bg.children.length > 0)
	{
		return this.bg.children[0].size;
	}

	return new Size(0,0);
}

MScene.prototype.getPosition = function()
{
	return this.bg.position;
}

MScene.prototype.updateView = function(viewSize)
{
	this.viewSize = viewSize || this.viewSize;

	if(!this.viewSize)
	{
		return;
	}

	var size = new Size(0,0);
	var realSize = this.getRealSize();

	if(!isNaN(parseInt(this.viewSize[0])))
	{
		size.width = parseInt(this.viewSize[0]);
	}
	else
	{
		switch(this.viewSize[0])
		{
			case 'auto':
				size.width = $(window).width() - this.margin.x;
				break;
			case 'scene':
				size.width = realSize.width;
				break;
			default :
				size.width = $(window).width() - this.margin.x;
		}
	}

	if(!isNaN(parseInt(this.viewSize[1])))
	{
		size.height = parseInt(this.viewSize[1]);
	}
	else
	{
		switch(this.viewSize[1])
		{
			case 'auto':
				size.height = $(window).height() - this.margin.y;
				break;
			case 'scene':
				size.height = realSize.height;
				break;
			default :
				size.height = $(window).height() - this.margin.y;
		}
	}

	paper.view.setViewSize(size);

	paper.view.update();
}

MScene.prototype.clear = function()
{
	this.bg.removeChildren();
	this.grid.clear();
	this.targets.dettachAll();
	this.editor.dettach();
	this.legend.clear();
	this.title.clear();

	this.bgImage = null;
	this._isEventAllow = false;
}

MScene.prototype.writeElementsTo = function(stage_target,stage_route)
{
	var viewSize = this.viewSize;
	var bgScaling = this.scaling;

	this.setParams({'scaling':1});
	this.updateView(['scene','scene']);
	this.render();

	var realSize = this.getRealSize(),
		size = this.getSize();

	var scalex = size.width/realSize.width,
		scaley = size.height/realSize.height;

	var targets = this.targets.getTargets();

	stage_target.clear();
	stage_route.clear();

	for(var i in targets)
	{
		var target = targets[i].data.owner;
		var pos = target.getPosition();
		var scaling = target.getScaling();

		var data = {
			'x': pos.x*scalex,
			'y': pos.y*scaley,
			'rotation': target.getRotation(),
			'scaling_x': scaling.x,
			'scaling_y': scaling.y,
			'target_id': target.id,
			'comment': target.comment
		};

		var hash = data.x.toString() 
				 + data.y.toString() 
				 + data.target_id.toString();

		data.hash = hash;

		stage_target.insert(data);
		
		for(var j in target.routes)
		{
			var route = target.routes[j];
			var pos = route.getPosition();

			data = {
				'endx': pos[1].x*scalex,
				'endy': pos[1].y*scaley,
				'comment': route.comment,
				'route_id': route.id,
				'target_hash': hash
			};

			stage_route.insert(data);
		}
	}

	var img = paper.view.element.toDataURL("image/jpeg",0.2);
	//.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

	this.setParams({'scaling':bgScaling});
	this.updateView(viewSize);
    this.render();

    return img;
}

/**********private**********/

MScene.prototype._loadImg = function(source,onLoad,onError)
{
	var $this = this;

	if(!source)
	{
		onError.bind($this)(); 
	}

	if(source && this.bgImage && this.bgImage.sourceFile == source)
	{
		onLoad.bind($this)({'target':this.bgImage});
		return;
	}

	this.bgImage = null;

	$('<img>',{'src':source})
	.error(function(event){
		onError.bind($this)(event);   
    })
    .load(function(event){
		onLoad.bind($this)(event);   
    });	
}

MScene.prototype._setHandlers = function()
{
	paper.project.tool.onMouseDown = function(tool)
	{
		if(!this._isEventAllow) { return; }

		var point 	= new Point(tool.event.offsetX,tool.event.offsetY);
		var target 	= this._getHit(point);

		if(!this._detectObject(target)[1])
		{
			this._isBgDrag = true;
		}
		
		this.onmousedowm(point,target);
	}.bind(this);

	paper.project.tool.onMouseUp = function(tool)
	{
		if(!this._isEventAllow) { return; }

		var point 	= new Point(tool.event.offsetX,tool.event.offsetY);
		var target 	= this._getHit(point);

		this._isBgDrag = false;
		this.onmouseup(point,target);
	}.bind(this);

	paper.project.tool.onMouseMove = function(tool)
	{
		if(!this._isEventAllow) { return; }

		var delta 	= new Point(tool.event.webkitMovementX,tool.event.webkitMovementY);
		var point 	= new Point(tool.event.offsetX,tool.event.offsetY);
		var target 	= this._getHit(point);

		/*
		 * Moving layers with restriction on the edges
		 */

		if(this._isBgDrag)
		{
			var size  	= this.getRealSize();
			var pos 	= this.getPosition();

            if(pos.x + delta.x > size.width/2 || pos.x + delta.x < 2*paper.view.center.x-size.width/2){delta.x = 0;}
            if(pos.y + delta.y > size.height/2 || pos.y + delta.y < 2*paper.view.center.y-size.height/2){delta.y = 0;}

			this.moveWith(delta);	
		}

		this.hint.setContent(this._formHint(point,target));
		var hintSize = this.hint.getBgSize();
		this.hint.moveTo([point.x + hintSize.width/2 + 15,point.y + hintSize.height/2]);

		this.onmousemove(point,delta,target);

	}.bind(this);

	paper.project.tool.onMouseLeave = function(tool)
	{
		if(!this._isEventAllow) { return; }

		this._isBgDrag = false;
		this.onmouseleave();
	}.bind(this);

	$(paper.view.element).on('dblclick',function(event)
	{
		if(!this._isEventAllow) { return; }

		var point 	= new Point(event.offsetX,event.offsetY);
		var target 	= this._getHit(point);

		this.ondblclick(point,target);
	}.bind(this));

	$(window).on('resize',function(event)
	{
		this.onresize(event);

		this.updateView();
		if(!this._isEventAllow) { return; }
		this.render();
	
	}.bind(this));

	$(window).on('beforeunload',function(e) { 
		return this.onbeforeunload(e);
	}.bind(this));
}

MScene.prototype._formHint = function(point,item)
{
	var h = this.grid.getCellAlias(point);

	if(item && item.data && item.data.owner.name)
	{
		h 	+= "\n"+item.data.owner.name
			+ "\nМеню: двойной клик"
	}

	if(item && item.data && item.data.type == 'MapRouteManip')
	{
		h 	+= "\nЭтот край можно переместить";
	}

	return h;
}

MScene.prototype._getHit = function(point)
{
	var hitResult = project.hitTest(point, {
		segments: true,
		stroke: true,
		fill: true,
		tolerance: 5
	});
	
	if(hitResult && this._detectObject(hitResult.item)[1])
	{
		return hitResult.item;
	}
	
	return null;
}

MScene.prototype._detectObject = function(object)
{
	if(object && object.data && object.data.owner)
	{
		return [object.data.type||'undefined',object];
	}

	return ['undefined',null];
}

