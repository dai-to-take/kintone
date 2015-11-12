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
		record['ItemName']['disabled'] = true;
		//record['ZaikoTenkai']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['ItemCd']['value'] = "";
				record['ItemName']['value'] = "";
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
		
		// サービス初期化
		var itemService = new ItemService(record);
		// API実行
		if (itemService.getItemCd()){
			// 採番したItemCdを設定
			record['ItemCd']['value'] = itemService.getAutoItemCd();
		}else {
			event.error = itemService.getMessage();
		}
		
		// 商品名を設定
		record['ItemName']['value'] = itemService.getItemName();
		

		return event;
	});
	
    // 詳細画面が開いた時のイベント
    kintone.events.on('app.record.detail.show', detailShow);
    // 詳細画面を開いた時に実行します
    function detailShow(event){
		var record = event.record;
        
		if (record['ZaikoTenkai']['value'] == ''){
			var itemService = new ItemService(record);
			
			// 関連情報登録（移動履歴、商品マスタ、在庫更新）
			if (! itemService.setRelationInfo()) {
				event.error = itemService.getMessage();
				return event;
			}
			
			location.reload(true);
		}
    };
    
	// メンテナンス用の機能
//    kintone.events.on('app.record.detail.show', function (event) {
//		// メニュ右側の空白部分にボタンを設置
//		var myIndexButton = document.createElement('button');
//		myIndexButton.id = 'my_index_button';
//		myIndexButton.innerHTML = '在庫展開';
//		myIndexButton.onclick = function () {
//			var rec = kintone.app.record.get();
//			var record = rec.record;
//			
//			var itemService = new ItemService(record);
//			
//			// 関連情報登録（移動履歴、商品マスタ、在庫更新）
//			if (! itemService.setRelationInfo()) {
//				event.error = itemService.getMessage();
//				return event;
//			}
//
//			alert('在庫展開完了');
//		}
//		kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButton);
//	});
})();	
