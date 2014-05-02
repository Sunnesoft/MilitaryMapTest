(function(mmodule){
	mmodule.controller('Main',[

	'$scope',
	'$timeout',
	'config',
	'tb',
	'action',

	function($scope,$timeout,config,tb,action){
		$scope.activeMenuItem 	= 3;
		$scope.config 			= config;
		$scope.tb 				= tb;
		$scope.action 			= action;
		$scope.what  			= '';

		$scope.cursorTarget 	= null;
		$scope.cursorRoute 		= null;
		$scope.cursorPoint 		= null;
		$scope.hitTarget 		= null;
		$scope.isDragging 		= false;
		$scope.isStageLoaded 		= false;

		$scope.enabledLoadingIcon 	= false;

		config.scene.margin 	= new paper.Point(0,angular.element('#map-menu').outerHeight() + 5);
		action.setup($scope);

		config.scene.ondblclick = function(point,target)
		{
			$scope.cursorTarget 	= null;
			$scope.cursorPoint 		= point;

			var ct = this._detectObject(target);

			if(ct[0] == 'MapTarget' || 
				ct[0] == 'MapRoute' || 
				ct[0] == 'MapRouteManip' ||
				ct[0] == 'MapTargetManip')
			{
				$scope.cursorTarget = ct[1].data.owner;				
			}

			$scope.activeMenuItem 	= 1;
			$scope.$apply();
		}

		config.scene.onmousedowm = function(point,target)
		{
			/*Clearing block*/
			if($scope.hitTarget && !(target &&  (target.data.owner.type=='MapTarget' || target.data.owner.type=='MapTargetEditor')))
			{
				this.editor.dettach();
				$scope.hitTarget = null;
			}

			/*detecting block*/
			var ct = this._detectObject(target);

			if(ct[0] == 'MapTarget' || 
				ct[0] == 'MapRoute' || 
				ct[0] == 'MapRouteManip' ||
				ct[0] == 'MapTargetManip')
			{
				$scope.hitTarget = ct[1];	
				$scope.isDragging = true;					
			}		

			if($scope.hitTarget)
			{
				switch($scope.hitTarget.data.type)
				{
					case 'MapTarget':
						this.editor.draw($scope.hitTarget.data.owner);
						break;
					case 'MapRouteManip':
						$scope.cursorRoute = $scope.hitTarget.data.owner;
						$scope.cursorRoute.manip().selected = true;						
						break;
				}
			}
		}

		config.scene.onmouseup = function(point,target)
		{
			$scope.isDragging = false;

			if($scope.cursorRoute)
			{
				$scope.cursorRoute.manip().selected = false;
				$scope.cursorRoute = null;
			}
		}

		config.scene.onmousemove = function(point,delta,target)
		{
			if($scope.hitTarget && $scope.isDragging)
			{
				switch($scope.hitTarget.data.type)
				{
					case 'MapTargetManip':
						this.editor.transformByDelta(delta,$scope.hitTarget);
						break;
				}

				if($scope.isDragging && $scope.hitTarget.data.owner.type == 'MapTarget')
				{
					this.editor.moveTargetWith(delta);
				}
			}

			if($scope.cursorRoute)
			{
				$scope.cursorRoute.moveTo(0,point);
				$scope.cursorRoute.manip().selected = true;	
			}		
		}

		config.scene.onbeforeunload = function(e)
		{
			return "Совершая выход из данного раздела, "+
				"Вы рискуете потерять несохраненные данные. "+
				"Если вы завершили работу и сохранили свой результат - "+
				"проигнорируйте это предупреждение.";
		}

		config.scene.onresize = function(e)
		{
			config.scene.margin 	= new paper.Point(0,angular.element('#map-menu').outerHeight() + 5);
		}	

		$scope.closeWin = function()
		{
			this.activeMenuItem = -1;
		}.bind($scope);

		$scope.openSaveWin = function()
		{
			this.activeMenuItem = 2;
			action.createSendingData();
		}.bind($scope);

		$scope.setGridColor = function(color)
		{
			var c = new Color(color);
			config.grid.color.red = c.red;
			config.grid.color.green = c.green;
			config.grid.color.blue = c.blue;
		}

		$scope.showScaling = function(target)
		{
			if(!target)
			{
				return '';
			}

			var sc = target.getScaling();
			return 'по оси X: '+sc.x.toPrecision(3)+', по оси Y: '+sc.y.toPrecision(3);
		}

		$scope.showRotation = function(target)
		{
			if(!target)
			{
				return '';
			}

			var a = target.getRotation();
			return a.toPrecision(3);
		}

		$scope.error = function(what)
		{
			$scope.activeMenuItem = -2;
			$scope.enabledLoadingIcon = false;
			$scope.what = what;

			$timeout(function(){$scope.$apply()},1);
		}

		$scope.loaded = function()
		{
			$scope.enabledLoadingIcon = false;

			$timeout(function(){$scope.$apply()},1);			
		}

		$scope.ask = function(what)
		{
			return confirm(what);
		}

		tb.bg.insert({'bg_id':'0','title':'Автобус с заложниками','path':'./bg/map.jpg'});
		tb.bg.insert({'bg_id':'1','title':'Этой карты нет и система даст ошибку','path':'./bg/map1.jpg'});
		tb.bg.insert({'bg_id':'2','title':'Аэропорт Владивостока','path':'./bg/map2.jpg'});

		tb.target.insert({'target_id':'0','title':'Самолет','path':'items/1.png','iCanHaveRoute':'1'});
		tb.target.insert({'target_id':'1','title':'Дом','path':'items/2.png','iCanHaveRoute':'0'});
		tb.target.insert({'target_id':'2','title':'Несуществующий объект','path':'items/100.png','iCanHaveRoute':'0'});
		tb.target.insert({'target_id':'3','title':'Оцепление','path':'items/3.png','iCanHaveRoute':'1'});
		tb.target.insert({'target_id':'4','title':'Бомба','path':'items/4.png','iCanHaveRoute':'0'});
		tb.target.insert({'target_id':'5','title':'Заложник','path':'items/5.png','iCanHaveRoute':'1'});

		tb.route.insert({'route_id':'0','title':'Марш','strokeColor':'#ff0000','strokeWidth':'6'});
		tb.route.insert({'route_id':'1','title':'Отступление','strokeColor':'#0000ff','strokeWidth':'10'});
	}]);
})(window.MMODULE);