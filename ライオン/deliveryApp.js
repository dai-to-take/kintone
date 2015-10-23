/* deliveryApp.js */
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
		record['DeliveryNumber']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['DeliveryNumber']['value'] = "";
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
		var autoDeliveryNumber = ""

		// サービス初期化
		var deliveryService = new DeliveryService(record);
		// 伝票番号の採番
		if (deliveryService.getDeliveryNumber()){
			// 採番したSlipNumberを設定
			autoDeliveryNumber  = deliveryService.getAutoDeliveryNumber();
			record['DeliveryNumber']['value'] = autoDeliveryNumber;
		} else {
			event.error = deliveryService.getMessage();
			return event;
		}
		
		// 関連情報登録（移動履歴、商品マスタ、在庫更新）
		if (! deliveryService.setRelationInfo(autoDeliveryNumber)) {
			event.error = purchaseService.getMessage();
			return event;
		}
		
		return event;
	});
	
	// バーコード処理
	var eventCreate = [
			'app.record.create.show'
			];
    kintone.events.on(eventCreate , function (event) {
		var commonService = new CommonService();

		// スペースにテキストボックスを設置
		kintone.app.record.getSpaceElement('BarcodeSpc').appendChild(commonService.fncGetBarcodeText());

		return event;
	});
	
	// バーコード処理(ルックアップ取得)
	var eventCol = [
				'app.record.create.change.ItemPrice'
				];
				
    kintone.events.on(eventCol , function (event) {
		var record = event.record;
		
		var tableRecords = record['ItemTable']['value'];
		
		for (var i = 0; i < tableRecords.length; i++) {
			if ((tableRecords[i].value['ItemPrice']['value'] == 0) &&
				(tableRecords[i].value['ItemNameLU']['value']  == null)){
				tableRecords[i].value['ItemCdLU']['lookup'] = true;
			}
		}
		
		return event;
	});
})();
