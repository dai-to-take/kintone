/* itemApp.js */
(function() {
	'use strict';

	/*
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
	*/

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

	/*
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
	*/
	
    kintone.events.on('app.record.detail.show', function (event) {
        // メニュ右側の空白部分にボタンを設置
        var myIndexButton = document.createElement('button');
        myIndexButton.id = 'my_index_button';
        myIndexButton.innerHTML = 'ルックアップ値更新';
        myIndexButton.onclick = function () {
		 	//アプリID
		 	var appId_nyusyutu = 47;
		 	var appId_zaiko = 45;

        	var rec = kintone.app.record.get();
        	var record = rec.record;
        	alert(record['ItemCd']['value']);
			var itemService = new ItemService(record);
			
			//itemService.putRecords(appId_nyusyutu);
			itemService.putRecords(appId_zaiko);
        }
        kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButton);
    });	
	
	
	/*
	// 保存ボタン押下、保存実行前イベント
	// 商品名変更時に自動反映
	var eventsPushButton = [
				'app.record.index.edit.submit',
				'app.record.edit.submit',
				];
				
	kintone.events.on(eventsPushButton, function(event) {
		
	 	//アプリID
	 	var appId_nyusyutu = 47;
	 	var appId_zaiko = 45;
		
        var record = event.record;
		var itemService = new ItemService(record);
		
		itemService.putRecords(appId_nyusyutu);
		//itemService.putRecords(appId_zaiko);
		
		return event;
	});
	*/
})();
