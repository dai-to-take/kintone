/* returnApp.js */
(function() {
	'use strict';

	kintone.events.on(['app.record.index.show'], function (event) {
		var query= kintone.app.getQuery();
		console.log(query);
	});
	
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
			record['ReturnNumber']['value'] = "";
		}
		record['ReturnNumber']['disabled'] = true;

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
		var autoReturnNumber = ""

		// サービス初期化
		var returnService = new ReturnService(record);
		returnService.initReturn();

		// 伝票番号の採番
		if (returnService.getReturnNumber()){
			// 採番したReturnNumberを設定
			autoReturnNumber  = returnService.getAutoReturnNumber();
			record['ReturnNumber']['value'] = autoReturnNumber;
		} else {
			event.error = returnService.getMessage();
			return event;
		}
		
		// 入出庫履歴の登録
		returnService.initNyuSyutu();
		if (! returnService.postNyusyutu(autoReturnNumber)){
			event.error = returnService.getMessage();
			return event;
		};
		
		// 商品マスタの更新
		if (! returnService.putItem()){
			event.error = returnService.getMessage();
			return event;
		};

		return event;
	});
	
})();
