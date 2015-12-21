/* bulkApp.js */
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
		record['BulkNumber']['disabled'] = true;
		record['ItemCdStart']['disabled'] = true;
		record['ItemCdEnd']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['BulkNumber']['value'] = "";
				record['ItemCdStart']['value'] = "";
				record['ItemCdEnd']['value'] = "";

				record['Office']['value'] = commonService.fncGetTantoOffice();
				record['WarehouseCdLU']['value'] = commonService.fncGetTantoSouko();
				record['WarehouseCdLU']['lookup'] = true;
				record['ZaikoTenkai']['value'] = [];
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
		var autoBulkNumber = ""

		// サービス初期化
		var bulkService = new BulkService(record);
		// 伝票番号の採番
		if (bulkService.getBulkNumber()){
			// 採番したBulkNumberを設定
			autoBulkNumber  = bulkService.getAutoBulkNumber();
			record['BulkNumber']['value'] = autoBulkNumber;
		} else {
			event.error = bulkService.getMessage();
			return event;
		}
		
		// 商品マスタの一括登録
		if (! bulkService.putBulkItemInfo()) {
			event.error = bulkService.getMessage();
			return event;
		}
		
		return event;
		
	});
	
    // 詳細画面が開いた時のイベント
    kintone.events.on('app.record.detail.show', detailShow);
    // 詳細画面を開いた時に実行します
    function detailShow(event){
		var record = event.record;
        
		if (record['ZaikoTenkai']['value'] == ''){
//			var bulkService = new BulkService(record);
//			
//			// 関連情報登録（移動履歴、商品マスタ、在庫更新）
//			if (! bulkService.setRelationInfo()) {
//				event.error = bulkService.getMessage();
//				return event;
//			}
//			
//			location.reload(true);
		}
    };
    
})();	
