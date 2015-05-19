/* itemApp.js */
(function() {
	'use strict';

	// レコード追加、編集画面の表示前処理
	// 申請番号のdisabled化
	var eventsShow = [
				'app.record.create.show',
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsShow, function (event) {
		var record = event.record;

		if (('app.record.create.show').indexOf(event.type) >= 0){
			record['applyNo']['value'] = "";
		}
		record['applyNo']['disabled'] = true;

		return event;
	});

	// レコード追加画面の保存前処理
	// 商品コードの採番
	var eventAdd = [
//				'app.record.detail.show'
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		
		
		// サービス初期化
		var applyTakePcService = new ApplyTakePcService(record);
		applyTakePcService.initNumbering();
		// API実行
		if (applyTakePcService.getRecords()){
			// 新規applyNoを取得
			if (applyTakePcService.getApplyNo('applyNo')){
				// 採番したItemCdを設定
				record['applyNo']['value'] = applyTakePcService.getAutoApplyNo();
			} else {
				event.error = applyTakePcService.getMessage();
			}
		}else {
			event.error = applyTakePcService.getMessage();
		}

		return event;
	});
	
	// 保存ボタン押下、保存実行前イベント
	// 商品名変更時に自動反映
	var eventsPushButton = [
				'app.record.index.edit.submit',
				'app.record.edit.submit',
				];
				
	kintone.events.on(eventsPushButton, function(event) {
		
	 	//アプリID
	 	var appId_pc = 68;
		
        var record = event.record;
		var applyTakePcService = new ApplyTakePcService(record);
        applyTakePcService.putRecords(appId_pc);
		
		return event;
	});
	
})();
