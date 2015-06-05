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
	// 産地と倉庫のdisabled化
	var eventsEdit = [
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsEdit, function (event) {
		var record = event.record;
		record['Locality']['disabled'] = true;
		record['WarehouseCdLU']['disabled'] = true;
		
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
		itemService.initItem();
		
		// API実行
		if (itemService.getItemCd()){
			// 採番したItemCdを設定
			record['ItemCd']['value'] = itemService.getAutoItemCd();
		}else {
			event.error = itemService.getMessage();
		}

		return event;
	});
	
	// メンテナンス用の機能
    kintone.events.on('app.record.detail.show', function (event) {
		// メニュ右側の空白部分にボタンを設置
		var myIndexButton = document.createElement('button');
		myIndexButton.id = 'my_index_button';
		myIndexButton.innerHTML = 'メンテナンス';
		myIndexButton.onclick = function () {

			var rec = kintone.app.record.get();
			var record = rec.record;
			var itemService = new ItemService(record);
			// 在庫管理更新
			itemService.initMainteStock();
			if (! itemService.putMainte()) {
				event.error = itemService.getMessage();
				return event;
			}
			// 入出庫履歴更新
			itemService.initMainteNyusyutu();
			if (! itemService.putMainte()) {
				event.error = itemService.getMessage();
				return event;
			}
			
			alert('メンテナンス完了');
		}
		kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButton);
	});
	
	kintone.events.on('app.record.index.show', function (event) {
		if (document.getElementById ('my_list_button') != null) {
			return;
		}

		var myListText = document.createElement('input');
		myListText.id = 'my_list_text';
		myListText.size = '10';
		
		var myListButton = document.createElement('button');
		myListButton.id = 'my_list_button';
		myListButton.innerHTML = '一覧のボタン';

		// ボタンクリック時の処理
		myListButton.onclick = function() {
			var makeUrl = location.protocol + "//" + location.host + location.pathname + '?view=' + event.viewId;
			var workQuery = 'ItemCd = "' + myListText.value + '"' + kintone.app.getQuery();
			var qeury = '&query=' + encodeURIComponent(workQuery);

			location.href = makeUrl + qeury;
			return true;
		}
        
		kintone.app.getHeaderMenuSpaceElement().appendChild(myListText);
		kintone.app.getHeaderMenuSpaceElement().appendChild(myListButton);
    });
})();	
