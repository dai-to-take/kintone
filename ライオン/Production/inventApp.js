/* inventApp.js */
(function() {
	'use strict';

	kintone.events.on(['app.record.index.show'], function (event) {

		if (document.getElementById ('my_index_button') != null) {
			return;
		}
		
        var record = event.record;

		var myIndexButton = document.createElement('button');
		myIndexButton.id = 'my_index_button';
		myIndexButton.innerHTML = '棚卸ボタン';
		
		// ボタンクリック時の処理
	    myIndexButton.onclick = function() {
			
			alert("棚卸を開始します。")
			
			// サービス初期化
			var inventService = new InventService(record);
			// 棚卸データの作成
			if (! inventService.fncMakeInventData(my_index_select.value)){
				event.error = inventService.getMessage();
				return event;
			}
			alert("棚卸準備が終わりました。")
			
            location.reload();
		}
		
		var myIndexSelect = document.createElement('select');
		var option_WHA  = document.createElement("option");
		var option_LA  = document.createElement("option");
		var option_SL  = document.createElement("option");
		var option_ALL = document.createElement("option");

		option_WHA.setAttribute("value", "wha");
		option_WHA.appendChild( document.createTextNode("倉庫のみ") );
		option_LA.setAttribute("value", "la");
		option_LA.appendChild( document.createTextNode("ライオンラグス") );
		option_SL.setAttribute("value", "sl");
		option_SL.appendChild( document.createTextNode("シルクラアジア") );
		option_ALL.setAttribute("value", "all");
		option_ALL.appendChild( document.createTextNode("(すべて)") );

		myIndexSelect.setAttribute( "name", "対象");
		myIndexSelect.appendChild(option_WHA);
		myIndexSelect.appendChild(option_LA);
		myIndexSelect.appendChild(option_SL);
		myIndexSelect.appendChild(option_ALL);

		myIndexSelect.id = 'my_index_select';

		kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexSelect);
		kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
	});

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
		record['InventNumber']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				break;
			case ('app.record.edit.show').indexOf(event.type) >= 0:
				break;
			case ('app.record.index.edit.show').indexOf(event.type) >= 0:
				break;
			default:
				break;
		}
		
		return event;
	});
	
})();
