/* placeApp.js */
(function() {
	'use strict';

// 場所コード…場所区分(1桁) + エリア区分(2桁) + 連番(5桁) ⇒ 8桁
	var events = [
				'app.record.detail.show',
				'app.record.create.show',
				'app.record.create.change.Area',
				'app.record.edit.show',
				'app.record.edit.change.Area'
				];

	kintone.events.on(events, function(event) {
		var record = event.record;
		//場所区分選択時にエリア区分の選択肢を表示する
		var Area = record['Area']['value'];
    });
	
	// レコード追加、編集画面の表示前処理
	// 商品コードのdisabled化
	var eventsShow = [
				'app.record.create.show',
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsShow, function (event) {
		var record = event.record;

		if (('app.record.create.show').indexOf(event.type) >= 0){
			record['ItemCd']['value'] = "";
		}
		record['ItemCd']['disabled'] = true;

		return event;
	});


	// レコード追加、編集画面の表示前処理
	// 場所区分とエリア区分のdisabled化
	var eventsEdit = [
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsEdit, function (event) {
		var record = event.record;
		record['Place']['disabled'] = true;
		record['Area']['disabled'] = true;
		return event;
	});

	// レコード追加画面の保存前処理
	// 商品コードの採番
	var eventAdd = [
//				'app.record.detail.show'
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
		var record = event.record;
		var placeService = new placeService(record['Place']['value'] , record['Area']['value']);

		// 場所区分の1桁取得
		var strPlace = record['Place']['value'];
		var strPlaceNm = placeService.getLocalNm(strPlace);

		// エリア区分の2桁取得
		var strArea = record['Area']['value'];
		var strAreaCd = placeService.getAreaCd(strArea);

		// 連番5桁取得
		var queryWork = '';
		queryWork = 'Place in ("' + strPlace + '") and Area in ("' + strArea + '") order by ItemCd limit 1';
		placeService.setApiUrl(queryWork);

		if (placeService.getRecords()){
			if(placeService.getItemCd('ItemCd')){
				//自動採番を場所コードに設定する
				var autoItemCd = strPlaceNm + strAreaCd + ('00000' + placeService.getRecNo()).slice(-5);
				record['ItemCd']['value'] = autoItemCd;
			} else {
				event.error = placeService.getMessage();
			}
		}else {
			event.error = placeService.getMessage();
		}
		return event;
	});

})();