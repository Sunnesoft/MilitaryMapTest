<div class="thumbnail col-sm-4 col-md-3" ng-repeat="obj in tb.stage.data track by $index">
	<div class="map-row-300 text-center">
		<img ng-src="{{tb.bg.getRowByPrimary(obj.bg_id).path}}" alt="obj.title_text" height="200" width="300"/>
	</div>
	<div class="caption">
		<h3 class="map-thumbnail-header">{{obj.title_text.slice(0,70)}}</h3>
		<a ng-if="action.role() == 'admin'" href="#" class="btn btn-default" role="button" ng-click="action.removeMap(obj.stage_id);">Удалить</a>
		<a href="#" class="btn btn-primary" role="button" ng-click="action.loadMap(obj.stage_id);">Загрузить</a>
	</div>
</div>	