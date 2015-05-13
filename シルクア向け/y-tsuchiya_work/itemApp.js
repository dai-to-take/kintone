/* itemApp.js */
(function() {
	'use strict';

	var events = [
				'app.record.detail.show',
				'app.record.create.show',
				'app.record.create.change.Shape',
				'app.record.edit.show',
				'app.record.edit.change.Shape'
				];

	kintone.events.on(events, function(event) {
		var record = event.record;
		
		//形状選択時にサイズの選択肢を表示する
		var shape = record['Shape']['value'];
		
		//形状で「円形」「楕円形」が選択された場合は「サイズ(円形)」フィールドを表示する
		if(shape == '円形' || shape == '楕円形'){
			kintone.app.record.setFieldShown('SizeSquare',false);
			kintone.app.record.setFieldShown('SizeCircle',true);
		} else {
			kintone.app.record.setFieldShown('SizeSquare',true);
			kintone.app.record.setFieldShown('SizeCircle',false);
		}
		
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
			record['ItemCd']['value'] = "";
		}
		record['ItemCd']['disabled'] = true;

		return event;
	});

	// レコード追加、編集画面の表示前処理
	// 産地と形状のdisabled化
	var eventsEdit = [
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsEdit, function (event) {
		var record = event.record;
		record['Locality']['disabled'] = true;
		record['Shape']['disabled'] = true;
		
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
		var itemService = new ItemService(record);
		itemService.initialize();
		
		// API実行
		if (itemService.getRecords()){
			// 新規ItemCdを取得
			if (itemService.getItemCd('ItemCd')){
				// 採番したItemCdを設定
				record['ItemCd']['value'] = itemService.getAutoItemCd();
			} else {
				event.error = itemService.getMessage();
			}
		}else {
			event.error = itemService.getMessage();
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
	
        var record = event.record;
		//アプリID
		var appId_nyusyutu = 47;
		var appId_zaiko = 45;
		
		//商品コード(画面)
		var strItemCd = record['ItemCd']['value'];
		var itemService = new ItemService(record);
		
		//入出庫管理の商品コードが一致する全てのレコードを更新する。
		var offset = 0;
		var records = new Array();
		var loopendflg = false;
		
		while(!loopendflg){
		  var query = encodeURIComponent('ItemCd = "' + strItemCd + '" order by レコード番号 asc limit 100 offset ' + offset);
		  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId_nyusyutu + '&query=' + query;
		 
		  // 同期リクエストを行う
		  var xmlHttp = new XMLHttpRequest();
		  xmlHttp.open("GET", appUrl, false);
		  xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
		  xmlHttp.send(null);
		 
		  //取得したレコードをArrayに格納
		  var respdata = JSON.parse(xmlHttp.responseText);
		  if(respdata.records.length > 0){
		    for(var i = 0; respdata.records.length > i; i++){
		      records.push(respdata.records[i]);
		    }
		    offset += respdata.records.length;
		  }else{
		    loopendflg = true;
		  }
		}
		
		itemService.updateLookup(appId_nyusyutu, itemService.createPutRecords(records));
		//入出庫管理ここまで
		
		//在庫管理 テーブルの更新がまだできていない。
		/*
        // レコードの一括取得(100件まで)
        kintone.api(
            kintone.api.url('/k/v1/records', true),
            'GET', {
                app: appId_nyusyutu,
                query: 'ItemCd = "' + strItemCd + '"'
            },
            function(resp) {
                var records = resp.records;
                // ルックアップの更新
                itemService.updateLookup(appId_nyusyutu, itemService.createPutRecords(records));
            }
        );
		*/
		
		return event;
	});
	
})();
