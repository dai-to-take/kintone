/* purchaseApp.js */
(function() {
	'use strict';

	// 検索条件調査
	//kintone.events.on(['app.record.index.show'], function (event) {
	//	var query= kintone.app.getQuery();
	//	console.log(query);
	//});
	//kintone.events.on(['app.record.create.show'], function (event) {
	//	var record = event.record;
	//	var commonServiceA = new CommonService();
	//	console.log(commonServiceA.funGetNendo(record['PurchaseNumber']['value'] , 'ライオンラグス'));
	//	
	//	console.log(commonServiceA.fncGetStartNen(record['PurchaseNumber']['value'] , 'ライオンラグス'));
	//	console.log(commonServiceA.fncGetEndNen(record['PurchaseNumber']['value'] , 'ライオンラグス'));
	//	
	//	console.log(commonServiceA.fncGetFormatDate(record['PurchaseNumber']['value'],'YYMM'));
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
		record['PurchaseNumber']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['PurchaseNumber']['value'] = "";
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
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		var autoPurchaseNumber = ""

		// サービス初期化
		var purchaseService = new PurchaseService(record);

		// 伝票番号の採番
		if (purchaseService.getPurchaseNumber()){
			// 採番したSlipNumberを設定
			autoPurchaseNumber  = purchaseService.getAutoPurchaseNumber();
			record['PurchaseNumber']['value'] = autoPurchaseNumber;
		} else {
			event.error = purchaseService.getMessage();
			return event;
		}
		
		// 関連情報登録（移動履歴、商品マスタ、在庫更新）
		if (! purchaseService.setRelationInfo(autoPurchaseNumber)) {
			event.error = purchaseService.getMessage();
			return event;
		}
		
		return event;
	});
	
})();
