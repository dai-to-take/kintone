/* sellingApp.js */
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
		record['SellingNumber']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['SellingNumber']['value'] = "";
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
	// 伝票番号の採番
	var eventAdd = [
//				'app.record.detail.show'
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		var autoSellingNumber = ""

		// サービス初期化
		var sellingService = new SellingService(record);
		// 伝票番号の採番
		if (sellingService.getSellingNumber()){
			// 採番したSellingNumberを設定
			autoSellingNumber  = sellingService.getAutoSellingNumber();
			record['SellingNumber']['value'] = autoSellingNumber;
		} else {
			event.error = sellingService.getMessage();
			return event;
		}
		
		// 関連情報登録（移動履歴、商品マスタ、在庫更新）
		if (! sellingService.setRelationInfo(autoSellingNumber)) {
			event.error = purchaseService.getMessage();
			return event;
		}

		return event;
	});
	
})();
