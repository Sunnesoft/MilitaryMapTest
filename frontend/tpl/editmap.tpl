<form name="muform" role="form">
	<div class="row" ng-if="action.role() == 'admin' || config.currentStageId !== null">
		<h3 class="col-xs-4 col-md-4 col-lg-5 text-right">Пользовательские настройки</h3>

		<div class="col-xs-10 col-md-8 col-lg-7 map-delimiter-left">
			<br />
			<div class="input-group"  ng-class="{'has-error':muform.maptitle.$valid == 0}">
				<span class="input-group-addon">Заголовок</span>
				<input ng-model="config.title.content" name="maptitle" type="text" class="form-control" placeholder="отображается вверху карты" required ng-maxlength="150"/>
				<span ng-show="muform.maptitle.$error.required" class="input-group-addon">Обязательно для заполнения</span>
				<span ng-show="muform.maptitle.$error.maxlength" class="input-group-addon">Длина строки не более 150 символов</span>
			</div>
			<br />
			<div class="input-group" ng-class="{'has-error':muform.maplegend.$valid == 0}">
				<span class="input-group-addon">Легенда</span>
				<textarea ng-model="config.legend.content" name="maplegend" class="form-control" rows="3" placeholder="отображается внизу карты" ng-maxlength="500"></textarea>
				<span ng-show="muform.maplegend.$error.maxlength" class="input-group-addon">Длина текста не более 500 символов</span>
			</div>
			<br />
		</div>
	</div>

	<div class="row" ng-if="action.role() == 'admin'">
		<h3 class="col-xs-4 col-md-4 col-lg-5 text-right">Системные настройки</h3>

		<div class="col-xs-10 col-md-8 col-lg-7 map-delimiter-left">
			<br />
			<div class="input-group"  ng-class="{'has-error':muform.bgsource.$error.required == 1}">
				<span class="input-group-addon">Файл фонового изображения</span>
		        <select name="bgsource" ng-model="config.scene.source_id" required class="form-control">
		            <option ng-repeat="obj in tb.bg.data" value="{{obj.bg_id}}">{{obj.title}}</option>
		        </select>
		        <span ng-show="muform.bgsource.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />
			<div class="input-group"  ng-class="{'has-error':muform.bgscale.$valid == 0}">
				<span class="input-group-addon">Масштаб</span>
				<input ng-model="config.scene.scaling" name="bgscale" type="number" min="0.5" max="3" step="0.1" class="form-control"required/>
				<span ng-show="muform.bgscale.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />

			<h6 class="text-center">Координатная сетка</h6>

			<div class="input-group"  ng-class="{'has-error':muform.gridn.$valid == 0}">
				<span class="input-group-addon">Число ячеек по горизонтали</span>
				<input ng-model="config.grid.section[0]" name="gridn" type="number" min="5" max="100" step="1" class="form-control"required/>
				<span ng-show="muform.gridn.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />
			<div class="input-group"  ng-class="{'has-error':muform.gridm.$valid == 0}">
				<span class="input-group-addon">Число ячеек по вертикали</span>
				<input ng-model="config.grid.section[1]" name="gridm" type="number" min="5" max="100" step="1" class="form-control" required/>
				<span ng-show="muform.gridm.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />

			<div class="input-group"  ng-class="{'has-error':muform.gridcolor.$valid == 0}">
				<span class="input-group-addon">Цвет</span>
				<input class="form-control" type="color" name="gridcolor" value="#eee" ng-model="gridcolor" ng-change="setGridColor(gridcolor)"/>
			</div>
			<br />

			<div class="input-group"  ng-class="{'has-error':muform.gridalpha.$valid == 0}">
				<span class="input-group-addon">Прозрачность</span>
				<input type="number" name="gridalpha" ng-model="config.grid.color.alpha" min="0" max="1" step="0.05" class="form-control" required/>
				<span ng-show="muform.gridalpha.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />

			<div class="input-group"  ng-class="{'has-error':muform.gridfontalpha.$valid == 0}">
				<span class="input-group-addon">Прозрачность текста</span>
				<input type="number" name="gridfontalpha" ng-model="config.grid.fontColor.alpha" min="0" max="1" step="0.05" class="form-control" required/>
				<span ng-show="muform.gridfontalpha.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />

			<h6 class="text-center">Заголовок</h6>

			<div class="input-group"  ng-class="{'has-error':muform.titleh.$valid == 0}">
				<span class="input-group-addon">Высота</span>
				<input type="number" name="titleh" ng-model="config.title.bgSize[1]" min="20" max="150" step="10" class="form-control" required/>
				<span ng-show="muform.titleh.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />

			<h6 class="text-center">Легенда</h6>

			<div class="input-group"  ng-class="{'has-error':muform.legendh.$valid == 0}">
				<span class="input-group-addon">Высота</span>
				<input type="number" name="legendh" ng-model="config.legend.bgSize[1]" min="20" max="200" step="10" class="form-control" required/>
				<span ng-show="muform.legendh.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br />

<!-- 						<div class="input-group"  ng-class="{'has-error':muform.legendw.$valid == 0}">
				<span class="input-group-addon">Ширина</span>
				<input type="number" name="legendw" ng-model="config.legend.bgSize.width" min="20" max="400" step="10" class="form-control" required/>
				<span ng-show="muform.legendw.$error.required" class="input-group-addon">Обязательно для заполнения</span>
			</div>
			<br /> -->
			<br />

			<h6 class="text-center">Права доступа</h6>

			<div class="input-group">
				<span class="input-group-addon">
        			<input type="checkbox" name="draft" ng-model="config.draft">
      			</span>
				<span class="form-control">Черновик (пользователь не имеет доступа к карте)</span>
			</div>
			<br />
		</div>
	</div>

	<div class="btn-group pull-right">
		<button ng-click="closeWin()" class="btn btn-default">Закрыть</button>
		<button ng-click="action.renderMap()" class="btn btn-primary" ng-disabled="muform.$invalid">Принять</button>
	</div>
</form>