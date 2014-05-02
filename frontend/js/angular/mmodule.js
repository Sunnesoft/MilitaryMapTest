var MMODULE = (function(){
	var mmodule = angular.module('MapConstructor',[]);

	mmodule.config(function(){
		paper.install(window);
		paper.setup('map');
	});

	mmodule.service('scene',MScene);

	mmodule.value('config',{
		scene:{
			source 			: '',
			scaling 		: 1,
			viewSize 		: ['auto','auto'],
			margin 			: null,
			source_id 		: null
		},

		title:{
			fontFamily 	: 'Arial',
			fontWeight 	: 'bold',
			fontSize 	: '18pt',
			fontColor 	: new paper.Color(0, 0, 0, 1),
			strokeColor : new paper.Color(0,0,0,1),
			bgColor 	: new paper.Color(1, 1, 1, 1),
			content 	: "",
			bgSize 		: ['scene',80],
			position 	: ['center','top']		
		},

		grid:{
			color 		: new paper.Color(0,0,0,0.05),
			section 	: [10,10],

			fontFamily 	: 'Arial',
			fontWeight 	: 'bold',
			fontSize 	: '8pt',
			fontColor 	: new paper.Color(0, 0, 0, 0.3)	
		},

		legend:{
			fontFamily 	: 'Arial',
			fontWeight 	: '',
			fontSize 	: '8pt',
			fontColor 	: new paper.Color(0, 0, 0, 1),
			strokeColor : new paper.Color(0,0,0,1),
			bgColor 	: new paper.Color(1, 1, 1, 1),
			content 	: "Легенда карты\n\n",
			bgSize 		: ['auto',200],
			position 	: ['right','bottom'],
			padding 	: new paper.Point(10,0)				
		},

		hint: {
			fontFamily 	: 'Arial',
			fontWeight 	: 'bold',
			fontSize 	: '8pt',
			fontColor 	: new paper.Color(1, 1, 1, 1),
			strokeColor : new paper.Color(0,0,0,1),
			bgColor 	: new paper.Color(0, 0, 0, 0.6),
			bgSize 		: ['auto','auto'],
			padding 	: new paper.Point(10,5)	
		},

		connection:{
			timeout : 5000,
			interval: 500
		},

		tpl:{
			url:{
				error: './tpl/error.tpl',
				editmap: './tpl/editmap.tpl',
				editelem: './tpl/editelem.tpl',
				send: './tpl/send.tpl',
				menu: './tpl/menu.tpl',
				help: './tpl/help.tpl',
				menuitem: './tpl/menuitem.tpl'
			},

			item:{		
				error: -2,
				editmap: 0,
				editelem: 1,
				send: 2,
				menu: 3,
				help: 4
			}
		},

		draft: false
	});

	mmodule.value('tb',{
	    bg : new Table({
	        'scheme':['bg_id','title','path'],
	        'primary':'bg_id',
	    }),

		target : new Table({
	        'scheme':['target_id','title','path','iCanHaveRoute'],
	        'primary':'target_id',
	    }),

	    route : new Table({
	        'scheme':['route_id','title','strokeColor','strokeWidth'],
	        'primary':'route_id', 	
	    }),

	    stage : new Table({
	    	'scheme': ['stage_id','bg_id','bg_scale',
	    				'legend_text','legend_height',
	    				'title_text','title_height',
	    				'grid_sec_w','grid_sec_h','grid_color',
	    				'grid_opacity','grid_text_opacity','draft'],
	    	'primary': 'stage_id'
	    }),

		stage_target : new Table({
	        'scheme':['stage_id','x','y','rotation','scaling_x','scaling_y','target_id','comment','hash']
	    }),

	    stage_route : new Table({
	        'scheme':['stage_id','endx','endy','comment','route_id','target_hash']	
	    }),
	});

	mmodule.value('convertor',{
		stageToConfig: function(stage,config)
		{
			if(!stage || !config)
			{
				return;
			}

			config.scene.source_id 	= stage.bg_id;
			config.scene.scaling 	= stage.bg_scale;
			config.title.content 	= stage.title_text;
			config.title.bgSize[1] 	= stage.title_height;
			config.legend.content 	= stage.legend_text;
			config.legend.bgSize[1] = stage.legend_height;
			config.grid.color 		= this.cssToColor(stage.grid_color,stage.grid_opacity);
			config.grid.section 	= [stage.grid_sec_w,stage.grid_sec_h];
			config.grid.fontColor 	= this.cssToColor(stage.grid_color,stage.grid_text_opacity);
			config.draft 			= stage.draft;	
		},

		configToStage: function(stage,config)
		{
			if(!stage || !config)
			{
				return;
			}

			stage.bg_id 			= config.scene.source_id;
			stage.bg_scale 			= config.scene.scaling;
			stage.title_text 		= config.title.content;
			stage.title_height 		= config.title.bgSize[1];
			stage.legend_text 		= config.legend.content;
			stage.legend_height 	= config.legend.bgSize[1];
			stage.grid_color 		= config.grid.color.toCSS(1);
			stage.grid_opacity 		= config.grid.color.alpha;
			stage.grid_sec_w 		= config.grid.section[0];
			stage.grid_sec_h 		= config.grid.section[1];
			stage.grid_text_opacity = config.grid.fontColor.alpha;
			stage.draft 			= config.draft;
		},

		cssToColor: function(css,opacity)
		{
			var c = new Color(css);
			c.alpha = opacity;
			return c;
		},

		posToString: function(pos,scene)
		{
			if(pos instanceof Point)
			{
				return scene.grid.getCellAlias(pos);
			}

			if(pos instanceof Array)
			{
				return scene.grid.getCellAlias(pos[0]) + '-->' + scene.grid.getCellAlias(pos[1]);
			}

			return '';
		}
	});

	mmodule.service('API',function(){
		var $this = this;

		this.setDefaults = function(config)
		{
			config.scene.scaling = 1;
			config.grid.section = [10,10];
			config.title.content = '';
			config.scene.source = '';
			config.scene.source_id = null;
		};

		this.clearScene = function(scene)
		{
			scene.clear();
		};

		this.clearTargets = function(scene)
		{
			scene.targets.dettachAll();
			scene.editor.dettach();
		};

		this.renderScene = function(scope,scene,config,onLoad)
		{
			scope.enabledLoadingIcon = true;

			scene.draw(config,function(){
				scope.loaded();
				onLoad();
			},function(){
				$this.setDefaults(config);
				scope.error('Ошибка при загрузке карты: '
						+'файла карты не существует или '
						+'соединение с сервером потеряно!');
			});			
		};

		this.createTarget = function(scope,scene,row)
		{
			scope.enabledLoadingIcon = true;

			scene.targets.attachTarget({
				position: scope.cursorPoint,
				initwidth: 80,
				rotation: 0,
				scaling: new Point(1,1),
				onError: function(){
					scope.error('Ошибка при загрузке: '
						+'такого файла не существует или '
						+'соединение с сервером потеряно!');
				},
				onLoad: function(){
					scene.editor.draw(this);
					scope.loaded();
				},
				id: row.target_id,
				name: row.title,
				iCanBeMoved: 1,
				iCanBeDrag: 1,
				iCanBeChanged: 1,
				iCanHaveRoute: row.iCanHaveRoute,
				iCanHaveMenu: 1,
				source: row.path
			});
		};

		this.createRoute = function(scope,scene,row)
		{
			scope.cursorRoute = scene.targets.attachRoute({
				strokeWidth : row.strokeWidth,
				strokeColor : new Color(row.strokeColor),	
				target 		: scope.cursorTarget,
				id 			: row.route_id,
				name 		: row.title,
				iCanBeResized 	: true,
				iCanHaveMenu 	: true	
			});			
		};

		this.removeActiveElement = function(scope,scene)
		{
			scene.dettachObject(scope.cursorTarget);
		};	
	});

	return mmodule;
})();

