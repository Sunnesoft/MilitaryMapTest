function MGrid(scene,config,layer)
{
	if(!scene)
	{
		throw 'Please set scene param to MText()!';
	}

	this.scene = scene;
	this.layer = layer || new Layer();
	this.xstep = 0;
	this.ystep = 0;

	$.extend(true,this,{
		'color'			: new Color(0,0,0,0.05),
		'section'		: [10,10],
		'fontFamily' 	: 'Arial',
		'fontWeight' 	: 'bold',
		'fontSize' 		: '8pt',
		'fontColor'		: new Color(0,0,0,0.3)
	},config);
}

MGrid.prototype.setParams = function(s)
{
	$.extend(true,this,s);

	this.update();
}

MGrid.prototype.clear = function()
{
	this.layer.removeChildren();
}

MGrid.prototype.update = function()
{
	var realSize = this.scene.getRealSize();

    this.xstep = realSize.width/this.section[0];
    this.ystep = realSize.height/this.section[1];

    if(!realSize || !this.xstep || !this.ystep)
    {
    	return;
    }

    this.clear();	

    for(var i = 0;i<=realSize.width;i+=this.xstep)
    {
        this.layer.addChild(Path.Line({
            from: [i, 0],
            to: [i, realSize.height],
            strokeColor: this.color
        }));
    }

    for(var j = 0;j<=realSize.height;j+=this.ystep)
    {
        this.layer.addChild(Path.Line({
            from: [0, j],
            to: [realSize.width, j],
            strokeColor: this.color
        }));
    }	

    for(var j = 0,g=0;j<=realSize.height-this.ystep+1;j+=this.ystep,g++)
    {
        for(var i = 0,v=0;i<=realSize.width-this.xstep+1;i+=this.xstep,v++)
        {
			this.layer.addChild(new PointText({
				content: "В"+v+"Г"+g,
				point: [i+this.xstep/2, j+this.ystep/2],
				justification: 'center',
				fontFamily: this.fontFamily,
				fontWeight: this.fontWeight,
				fontSize: this.fontSize,
				fillColor: this.fontColor
			}));	
		}
	}	
}

MGrid.prototype.moveTo = function(point)
{
	this.layer.position = point;
}

MGrid.prototype.moveWith = function(delta)
{
	this.layer.position.x += delta.x;
	this.layer.position.y += delta.y;
}

MGrid.prototype.getCellAlias = function(point)
{
	if(!point)
	{
		return "";
	}

	var pos = this.scene.getPosition(),
		size = this.scene.getRealSize();

	var x = -(pos.x - point.x - size.width/2) ,
		y = -(pos.y - point.y - size.height/2);

	return 	"В" + Math.floor(x/this.xstep)+
			"Г" + Math.floor(y/this.ystep);		
}