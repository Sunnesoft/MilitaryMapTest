(function(mmodule){

	mmodule.service('action',[

	'$log',
	'convertor',
	'config',
	'tb',
	'scene',
	'API',

	function($log,convertor,config,tb,scene,API){
		var stage_id 		= null;
		var isStageRender 	= false;
		var scope 	 		= null;

		var role 			= 'admin';

		this.sendingData 	= {};

		this.role = function()
		{
			return role;
		}

		this.setup = function(sc)
		{
			this.setScope(sc);
			scene.setParams(config.scene);
			scene.updateView();
		}

		this.setScope = function(s)
		{
			scope = s;
		}

		this.isStageRender = function()
		{
			return isStageRender;
		}

		this.stageId = function()
		{
			return stage_id;
		}

		this.createMap = function()
		{	
			this.clearMap();

			scope.activeMenuItem = 0;
		}

		this.loadMap = function(stid)
		{
			$log.info(stid,'loading...');	

			if(stage_id !== null)
			{
				if(!scope.ask('Несохраненные данные будут утеряны. Загрузить выбранную карту?'))
				{
					return;
				}				
			}

			this.clearMap();

			var stage = tb.stage.getRowByPrimary(stid);

			if(!stage)
			{
				scope.error(
					'В системе не обнаружены данные'
					+' по выбранной карте.'
				);
				return;
			}

			stage_id = stid;	

			convertor.stageToConfig(stage,config);
			this.renderMap();

			$log.info(stid,'loaded');
		}

		this.createSendingData = function()
		{
			this.sendingData = {'stage':{}};
			convertor.configToStage(
				this.sendingData.stage,config
			);

			this.sendingData.screen = scene.writeElementsTo(tb.stage_target,tb.stage_route);
		}

		this.saveMap = function()
		{
			//XXX  - server side
			this.sendingData.stage.stage_id = stage_id || (tb.stage.getLastRowId()+1).toString();
			tb.stage.update(tb.stage.getRowId(this.sendingData.stage.stage_id),this.sendingData.stage);

			//XXX -success response from server
			stage_id = this.sendingData.stage.stage_id;

			scope.closeWin();
		}

		this.renderMap = function()
		{
			$log.info('rendering...');

			isStageRender = false;

			var bg = tb.bg.getRowByPrimary(
				config.scene.source_id.toString()
			);

			if(!bg)
			{
				scope.error(
					'В системе не обнаружен '+
					'файл фонового изображения'
				);
				return;
			}

			config.scene.source = bg.path;	
			API.renderScene(scope,scene,config,function(){
				isStageRender = true;
			});		

			scope.closeWin();

			$log.info('rendered');	
		}

		this.removeMap = function(stid)
		{
			$log.info(stid,'removing...');
			var rowid = tb.stage.getRowId(stid);

			if(rowid === null)
			{
				scope.error(
					'В системе не обнаружены данные'
					+' по выбранной карте.'
				);
				return;
			}

			if(stage_id == stid)
			{
				if(!scope.ask('Эта карта сейчас используется. Все несохраненные объекты будут удалены. Удалить карту?'))
				{
					return;
				}				
			}

			this.clearMap();
			tb.stage.remove(rowid);

			$log.info(stid,"::rowid:",rowid,'removed');		
		}

		this.clearMap = function()
		{
			API.setDefaults(config);
			API.clearScene(scene);

			stage_id = null;
			isStageRender = false;
		}

		this.createTarget = function(row)
		{
			API.createTarget(scope,scene,row);
			scope.closeWin();
		}

		this.createRoute = function(row)
		{
			API.createRoute(scope,scene,row);
			scope.closeWin();
		}

		this.removeActiveElement = function()
		{
			API.removeActiveElement(scope,scene);
			scope.closeWin();
		}

		this.removeElements = function()
		{
			if(scope.ask('Вы действительно хотите удалить все объекты с карты?'))
			{
				API.clearTargets(scene);
			}		
		}

		this.getPositionString = function(target)
		{
			if(!target)
			{
				return '';
			}

			return convertor.posToString(target.getPosition(),scene);
		}
	}]);
})(window.MMODULE);