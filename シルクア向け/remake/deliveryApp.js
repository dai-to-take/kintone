/* deliveryApp.js */
(function() {
	'use strict';

	//kintone.events.on(['app.record.index.show'], function (event) {
	//	var query= kintone.app.getQuery();
	//	console.log(query);
	//});
	
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
			record['DeliveryNumber']['value'] = "";
		}
		record['DeliveryNumber']['disabled'] = true;

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
		var autoDeliveryNumber = ""

		// サービス初期化
		var deliveryService = new DeliveryService(record);
		deliveryService.initDelivery();

		// 伝票番号の採番
		if (deliveryService.getDeliveryNumber()){
			// 採番したSlipNumberを設定
			autoDeliveryNumber  = deliveryService.getAutoDeliveryNumber();
			record['DeliveryNumber']['value'] = autoDeliveryNumber;
		} else {
			event.error = deliveryService.getMessage();
			return event;
		}
		
		// 入出庫履歴の登録
		deliveryService.initNyuSyutu();
		if (! deliveryService.postNyusyutu(autoDeliveryNumber)){
			event.error = deliveryService.getMessage();
			return event;
		};
		
		// 商品マスタの更新
		if (! deliveryService.putItem()){
			event.error = deliveryService.getMessage();
			return event;
		};

		return event;
	});
	
})();
