(function() {
	'use strict';
	
	// レコード追加、編集画面の表示前処理
	// 伝票番号のdisabled化
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
				'app.record.create.submit'
				];
	
	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		
		//処理年取得
		var strProcessYear = (record['ProcessDate']['value']).slice(0,4);
		//処理月取得
		var strProcessMonth = (record['ProcessDate']['value']).slice(5,7);
		
		//処理月の最終日取得
		var date = new Date();
		date.setDate(1);
		date.setMonth(strProcessMonth);
		date.setDate(0);
		var dd = date.getDate();
		
		//d形式なので、一桁の場合0を付加する。
		if(dd < 10){
			dd = "0" + dd;
		}
		
		var strStartDate = (record['ProcessDate']['value']).slice(0,7) + "-01T00:00:00Z";
		var strEndDate = (record['ProcessDate']['value']).slice(0,7) + "-" + dd + "T23:59:59Z";
		
		var slipService = new SlipService();
		
		// API初期化
		slipService.setApiUrl(slipService.makeQuery(strStartDate,strEndDate));
		
		// API実行
		if (slipService.getRecords()){
			// 新規SlipNumberを取得
			if (slipService.getSlipNumber('SlipNumber')){
				// 採番したSlipNumberを設定
				record['SlipNumber']['value'] = "Z" + strProcessYear + strProcessMonth + ('000' + slipService.getRecNo()).slice(-3);
			} else {
				event.error = slipService.getMessage();
			}
		}else {
			//event.error = slipService.getMessage();
		}
		
		slipService.postRecords(event);

		return event;
	});
	
})();
