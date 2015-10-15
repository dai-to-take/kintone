/* itemApp.js */
(function() {
	'use strict';

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
		record['ItemCd']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['ItemCd']['value'] = "";
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
	
	// レコード追加画面の保存前処理
	// 商品コードの採番
	var eventAdd = [
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		
		// サービス初期化
		var itemService = new ItemService(record);
		// API実行
		if (itemService.getItemCd()){
			// 採番したItemCdを設定
			record['ItemCd']['value'] = itemService.getAutoItemCd();
		}else {
			event.error = itemService.getMessage();
		}

		return event;
	});
	
})();	
