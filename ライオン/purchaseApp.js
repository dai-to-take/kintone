/* purchaseApp.js */
(function() {
	'use strict';

	// 検索条件調査
	//kintone.events.on(['app.record.index.show'], function (event) {
	//	var query= kintone.app.getQuery();
	//	console.log(query);
	//});
	
	// レコード追加、編集画面の表示前処理
	// 仕入伝票のdisabled化
	var eventsShow = [
				'app.record.create.show',
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsShow, function (event) {
		var record = event.record;

		if (('app.record.create.show').indexOf(event.type) >= 0){
			record['PurchaseNumber']['value'] = "";
		}
		record['PurchaseNumber']['disabled'] = true;

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
		
		// 移動履歴の登録
		if (! purchaseService.postMovement(autoPurchaseNumber)){
			event.error = purchaseService.getMessage();
			return event;
		};
		
		// 商品マスタの更新
		if (! purchaseService.putItem()){
			event.error = purchaseService.getMessage();
			return event;
		};
		
		return event;
	});
	
})();
