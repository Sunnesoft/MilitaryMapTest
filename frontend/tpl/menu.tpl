
<div class="page-header">
	<h1 ng-if="action.role() == 'user'">
		<span ng-if="tb.stage.data.length == 0"> В системе не обнаружено доступных Вам карт.</span>
		<span ng-if="tb.stage.data.length != 0"> Добро пожаловать! Доступные карты:</span>
	</h1>

	<h1 ng-if="action.role() == 'admin'">
		Вы можете <button ng-click="action.createMap()" class="btn btn-lg btn-primary">создать</button> карту
		<span ng-if="tb.stage.data.length != 0"> или работать с уже созданной:</span>
	</h1>
</div>

<div class="row" ng-include="config.tpl.url.menuitem">

</div>

<button ng-click="closeWin()" class="btn btn-default center-block">Закрыть</button>

