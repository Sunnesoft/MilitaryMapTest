(function(mmodule){
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

})(MMODULE);

