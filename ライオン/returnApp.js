/* returnApp.js */
(function() {
	'use strict';

	//kintone.events.on(['app.record.index.show'], function (event) {
	//	var query= kintone.app.getQuery();
	//	console.log(query);
	//});
	
	// レコード追加、編集画面の表示前処理
	var eventsShow = [
				'app.record.create.show',
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsShow, function (event) {
		var record = event.record;
		var commonService = new CommonService();
		
		// 共通
		record['ReturnNumber']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['ReturnNumber']['value'] = "";
				record['Office']['value'] = commonService.fncGetTantoOffice();
				break;
			case ('app.record.edit.show').indexOf(event.type) >= 0:
			case ('app.record.index.edit.show').indexOf(event.type) >= 0:
				record['Office']['disabled'] = true;
				break;
			default:
				break;
		}

		return event;
	});

	// レコード追加、編集画面の表示前処理
	// 事業所のdisabled化
	var eventsEdit = [
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsEdit, function (event) {
		var record = event.record;
		record['Office']['disabled'] = true;
		
		return event;
	});
	
	// レコード追加画面の保存前処理
	// 伝票番号の採番
	var eventAdd = [
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		var autoReturnNumber = ""

		// サービス初期化
		var returnService = new ReturnService(record);

		// 伝票番号の採番
		if (returnService.getReturnNumber()){
			// 採番したReturnNumberを設定
			autoReturnNumber  = returnService.getAutoReturnNumber();
			record['ReturnNumber']['value'] = autoReturnNumber;
		} else {
			event.error = returnService.getMessage();
			return event;
		}
		
		// 関連情報登録（移動履歴、商品マスタ、在庫更新）
		if (! returnService.setRelationInfo(autoReturnNumber)) {
			event.error = purchaseService.getMessage();
			return event;
		}

		return event;
	});
	
})();
