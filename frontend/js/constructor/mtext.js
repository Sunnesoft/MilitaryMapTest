function MText(scene,config,layer)
{
	if(!scene)
	{
		throw 'Please set scene param to MText()!';
	}

	this.layer = layer || new Layer();
	this.scene = scene;

	$.extend(true,this,{
		'bgSize'  		: ['auto','auto'],
		'bgColor'		: new Color(1,1,1,1),
		'strokeColor'	: new Color(0,0,0,1),
		'fontFamily' 	: 'Arial',
		'fontWeight' 	: 'bold',
		'fontSize' 		: '8pt',
		'fontColor'		: new Color(0,0,0,0.3),
		'position' 		: ['center','center'],
		'padding'		: new Point(3,6),
		'content' 		: ''
	},config);	

	this.layer.addChild(new Layer(new Path.Rectangle()));
	this.layer.addChild(new PointText({
		justification 	: 'center'
	}));
}

MText.prototype.clear = function()
{
	this.setContent('');
	this.setBgSize(0,0);
}

MText.prototype.setParams = function(params)
{
	$.extend(true,this,params);
	this.update();
}

MText.prototype.update = function()
{
	this.setContent();
}

MText.prototype.setContent = function(content)
{
	this.content = content || this.content;

	this.layer.children[1].set({		
		fontFamily 		: this.fontFamily,
		fontWeight 		: this.fontWeight,
		fontSize 		: this.fontSize,
		fillColor 		: this.fontColor
	});

	this.layer.children[1].content = this.content;
	
	this.setBgSize();
	this.moveTo();
}

MText.prototype.getCenter = function()
{
	return this.layer.children[1].position;
}

MText.prototype.getBgSize = function()
{
	return this.layer.children[0].children[0].bounds.size;
}

MText.prototype.setBgSize = function(s)
{
	this.bgSize = s || this.bgSize;

	var size = new Size(0,0);
	var realSize = this.scene.getRealSize();

	if(!isNaN(parseInt(this.bgSize[0])))
	{
		size.width = parseInt(this.bgSize[0]);
	}
	else
	{
		switch(this.bgSize[0])
		{
			case 'auto':
				size.width = this.layer.children[1].bounds.width + this.padding.x;
				break;
			case 'scene':
				size.width = realSize.width;
				break;
			default :
				size.width = realSize.width;
		}
	}

	if(!isNaN(parseInt(this.bgSize[1])))
	{
		size.height = parseInt(this.bgSize[1]);
	}
	else
	{
		switch(this.bgSize[1])
		{
			case 'auto':
				size.height = this.layer.children[1].bounds.height + this.padding.y;
				break;
			case 'scene':
				size.height = realSize.height;
				break;
			default :
				size.height = realSize.height;
		}
	}

	/* Background rectangle
	 */

	this.layer.children[0].removeChildren();
	this.layer.children[0].addChild(new Path.Rectangle({
		'fillColor': 	this.bgColor,
		'strokeColor': 	this.strokeColor,
		'size': 		size,
		'center': 		this.getCenter()
	}));	
}

MText.prototype.moveTo = function(p)
{
	this.position = p || this.position;

	var point = new Point(0,0);
	var pos = this.scene.getPosition();
	var realSize = this.scene.getRealSize();
	var size = this.getBgSize();

	if(!isNaN(parseInt(this.position[0])))
	{
		point.x = parseInt(this.position[0]);
	}
	else
	{
		switch(this.position[0])
		{
			case 'left':
				point.x = pos.x + size.width/2;
				break;
			case 'right':
				point.x = pos.x + realSize.width/2 - size.width/2;
				break;
			case 'center':
				point.x = pos.x + realSize.width/2 - size.width/2;
				break;
			default:
				point.x = pos.x + realSize.width/2 - size.width/2;			
		}
	}


	if(!isNaN(parseInt(this.position[1])))
	{
		point.y = parseInt(this.position[1]);
	}
	else
	{
		switch(this.position[1])
		{
			case 'top':
				point.y = pos.y - realSize.height/2 + size.height/2;
				break;
			case 'bottom':
				point.y = pos.y + realSize.height/2 - size.height/2;
				break;
			case 'center':
				point.y = pos.y - size.height/2;
				break;
			default :
				point.y = pos.y - size.height/2;
		}
	}

	this.layer.setPosition(point);
}

MText.prototype.moveWith = function(delta)
{
	this.layer.position.x += delta.x;
	this.layer.position.y += delta.y;
}