
<h1>Передача данных на сервер</h1>
<div class="well">
	<div class="media">
		<a class="pull-left" href="#">
			<img class="media-object map-preview" ng-src="{{action.sendingData.screen}}">
		</a>
		<div class="media-body">
			<h2 class="media-heading">{{action.sendingData.stage.title_text}}</h2>

			<p ng-if="action.sendingData.stage.draft">Карта не будет доступна пользователям (определена как черновик).</p>
			<br />

			<h3 ng-if="tb.stage_target.data.length != 0">На карте определены следующие объекты:</h3>

			<div class="list-group">
			  <a href="#" class="list-group-item" ng-repeat="(key,data) in tb.stage_target.data" ng-init="target=tb.target.getRowByPrimary(data.target_id)">
			    <h4 class="list-group-item-heading">{{target.title}}</h4>
			    <p class="list-group-item-text">
			    	Позиция: {{data.x}},{{data.y}}; 
			    	Поворот: {{data.rotation}};
			    	Масштаб: {{data.scaling_x}},{{data.scaling_y}};
			    	Комментарий: {{data.comment}}
			    </p>
			  </a>
			</div>
			<br />

			<h3 ng-if="tb.stage_route.data.length != 0">На карте определены следующие маршруты:</h3>

			<div class="list-group">
			  <a href="#" class="list-group-item" ng-repeat="(key,data) in tb.stage_route.data" ng-init="route=tb.route.getRowByPrimary(data.route_id)">
			    <h4 class="list-group-item-heading">{{route.title}}</h4>
			    <p class="list-group-item-text">
			    	Позиция: {{data.endx}},{{data.endy}}; 
			    </p>
			  </a>
			</div>
			<br />

		</div>
	</div>
</div>

<div class="btn-group center-block">
	<button class="btn btn-primary" ng-click="action.saveMap()">Отправить</button>
	<button ng-click="closeWin()" class="btn btn-default">Закрыть</button>
</div>