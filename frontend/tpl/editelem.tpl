<div class="row">
    <div class="col-xs-6 col-md-6 col-lg-6 map-delimiter">
	    <h2>Добавить объект</h2>
	    <div class="map-row-400">
			<table class="table table-striped table-hover">
		    <tbody>				    	
		        <tr ng-repeat="row in tb.target.data"
		        	ng-click="action.createTarget(row)">
		          	<td>{{row.title}}</td>
		          	<td>
		          		<img ng-src="{{row.path}}" title="{{row.title}}" width="30" height="30"/>
		          	</td>
		        </tr>
		    </tbody>
		    </table>
		</div>

	    <div ng-if="cursorTarget && cursorTarget.type=='MapTarget' && cursorTarget.iCanHaveRoute">
		    <h2>Добавить маршрут</h2>
		    <div class="map-row-400">
				<table class="table table-striped table-hover">
			    <tbody  class="map-row-100">
			        <tr ng-repeat="row in tb.route.data"
			        	ng-click="action.createRoute(row)">
			          	<td>{{row.title}}</td>
			          	<td>
			          		<div style="background:{{row.strokeColor}};width:50px;height:{{row.strokeWidth}}px;" title="row.title"> </div>
			          	</td>
			        </tr>
			    </tbody>
			    </table>
			</div>
		</div>
	</div>

	<div class="col-xs-6 col-md-6 col-lg-6" ng-if="cursorTarget">				
		<table class="table">
	    <thead>
	        <tr>
	          	<th>
	          		<h1 >{{cursorTarget.name}}</h1>
				</th>
	          	<th>
	          		<img ng-show="cursorTarget.data.source" ng-src="{{cursorTarget.source}}" title="{{cursorTarget.name}}" width="100" height="100"/>
	          	</th>
	        </tr>
	    </thead>
	    <tbody>
	        <tr>
	          	<td>Позиция на карте</td>
	          	<td>{{action.getPositionString(cursorTarget);}}</td>
	        </tr>

	        <tr ng-if="cursorTarget.type=='MapTarget'">
	          	<td>Масштаб</td>
	          	<td>{{showScaling(cursorTarget);}}</td>
	        </tr>

	        <tr ng-if="cursorTarget.type=='MapTarget'">
	          	<td>Поворот</td>
	          	<td>{{showRotation(cursorTarget);}} град.</td>
	        </tr>
	    </tbody>
	    </table>

	    <form name="cursorTargetInfo">
			<div class="input-group"  ng-class="{'has-error':cursorTargetInfo.ctcomment.$invalid}">
				<span class="input-group-addon">Комментарий</span>
				<textarea ng-model="cursorTarget.comment" name="ctcomment" class="form-control" rows="3" placeholder="" ng-maxlength="500"></textarea>
				<span ng-if="cursorTargetInfo.ctcomment.$error.maxlength" class="input-group-addon">Длина текста не более 500 символов</span>
			</div>
		</form>

		<br />

	    <button ng-click="closeWin()" class="btn btn-default pull-right">Закрыть</button>
	    <button type="button" class="btn btn-primary pull-right" ng-click="action.removeActiveElement()">Удалить</button>
	</div>
</div>

<br />
<button ng-click="closeWin()" class="btn btn-default center-block">Закрыть</button>