/* stockApp.js */
(function() {
	'use strict';

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
			record['SlipNumber']['value'] = "";
		}
		record['SlipNumber']['disabled'] = true;

		return event;
	});

	// レコード追加画面の保存前処理
	// 伝票番号の採番
	var eventAdd = [
				'app.record.detail.show'
//				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		var autoSlipNumber = ""

		// サービス初期化
		var stockService = new StockService(record);
		
		// 伝票番号の採番
		// API実行
//		stockService.getRecords();
//		if(stockService.getStatus() == _CONST.OK){
		if (stockService.getRecords()){
			// 新規SlipNumberを取得
			if (stockService.getSlipNumber('SlipNumber')){
				// 採番したSlipNumberを設定
				autoSlipNumber  = stockService.getAutoSlipNumber();
				record['SlipNumber']['value'] = autoSlipNumber;
			} else {
				event.error = stockService.getMessage();
			}
		}else {
			event.error = stockService.getMessage();
		}
		
		stockService.putNyusyutu(autoSlipNumber);
	
		return event;
	});
	
})();
