/* sellingApp.js */
(function() {
	'use strict';

	//kintone.events.on(['app.record.index.show'], function (event) {
	//	var query= kintone.app.getQuery();
	//	console.log(query);
	//});
	
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
		record['SellingNumber']['disabled'] = true;
		
		// アクション別
		switch (true) {
			case ('app.record.create.show').indexOf(event.type) >= 0:
				record['SellingNumber']['value'] = "";
				record['Office']['value'] = commonService.fncGetTantoOffice();
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
	// 伝票番号の採番
	var eventAdd = [
//				'app.record.detail.show'
				'app.record.create.submit'
				];

	kintone.events.on(eventAdd, function(event) {
        var record = event.record;
		var autoSellingNumber = ""

		// サービス初期化
		var sellingService = new SellingService(record);
		// 伝票番号の採番
		if (sellingService.getSellingNumber()){
			// 採番したSellingNumberを設定
			autoSellingNumber  = sellingService.getAutoSellingNumber();
			record['SellingNumber']['value'] = autoSellingNumber;
		} else {
			event.error = sellingService.getMessage();
			return event;
		}
		
		// 関連情報登録（移動履歴、商品マスタ、在庫更新）
		if (! sellingService.setRelationInfo(autoSellingNumber)) {
			event.error = sellingService.getMessage();
			return event;
		}

		return event;
	});

	// バーコード処理
	var eventCreate = [
			'app.record.create.show'
			];
    kintone.events.on(eventCreate , function (event) {
		var commonService = new CommonService();

		// スペースにテキストボックスを設置
		kintone.app.record.getSpaceElement('BarcodeSpc').appendChild(commonService.fncGetBarcodeText());

		return event;
	});

	// バーコード処理(ルックアップ取得)
	var eventCol = [
				'app.record.create.change.ItemPrice'
				];

    kintone.events.on(eventCol , function (event) {
		var record = event.record;
		
		var tableRecords = record['ItemTable']['value'];
		for (var i = 0; i < tableRecords.length; i++) {
			if ((tableRecords[i].value['ItemPrice']['value'] == 0) &&
				(tableRecords[i].value['Locality']['value'] == null)){
				tableRecords[i].value['ItemCdLU']['lookup'] = true;
			}
		}
		
		return event;
	});
	
	
	///////////////////////////////////////////////////////////////////////
	kintone.events.on(['app.record.index.show'], function(event) {
        var appId = event.appId;

        //ダイアログでファイルが選択された時の処理
        $('#selfile').bind('change', function(evt) {
            //読み込んだファイルをテキストエリアに表示
            var reader = new FileReader();
            reader.readAsText(evt.target.files[0]);
            reader.onload = function(ev) {
                $('textarea[name=\"txt\"]').val(reader.result);
            };
        });
        //「post」ボタンが押された時の処理
        $('#post_btn').bind('click', function() {
            var text_val = $('textarea[name=\"txt\"]').val();
            text_val = text_val.replace(/"/g, "");
            var jsonArray = csv2json(text_val.split('\n'));
            var obj = [];
            var newRow = {};
            var j = 0;
			var commonService = new CommonService();
			
		    if (window.confirm('データを登録します。よろしいでしょうか？')) {
		           // ログアプリへの登録処理
		    }else {
		          window.alert('キャンセルされました'); // 警告ダイアログを表示
		          return;
		    }
		            
            for (var i = 0; i < jsonArray.length; i++) {
                if (jsonArray[i]['レコードの開始行']) {
                    j++;
                    obj[j - 1] = {'Office': {value: jsonArray[i]['事業所']},
                    				'SellingNumber': {value: jsonArray[i]['売上伝票']},
                    				'SellingDate': {value: commonService.fncGetFormatDate(jsonArray[i]['売上日時'] , "YYYY-MM-DD[T]HH:mm:ss[Z]")},
                    				'ShipmentCdLU': {value: jsonArray[i]['販売元コード']},
                    				 'ItemTable': {'value': []}};
                    newRow = {
                        value: {
                            ItemCdLU: {
                                type: 'SINGLE_LINE_TEXT',
                                value: jsonArray[i]['商品コード']
                            },
                            ItemPrice: {
                                type: 'NUMBER',
                                value: jsonArray[i]['販売価格']
                            }
                        }
                    };
                    obj[j - 1]['ItemTable']['value'].push(newRow);
                }else {
                    newRow = {
                        value: {
                            ItemCdLU: {
                                type: 'SINGLE_LINE_TEXT',
                                value: jsonArray[i]['商品コード']
                            },
                            ItemPrice: {
                                type: 'NUMBER',
                                value: jsonArray[i]['販売価格']
                            }
                        }
                    };
                    obj[j - 1]['ItemTable']['value'].push(newRow);
                }
                
                if(i == jsonArray.length - 1 || (i+1) % 100 == 0){
	                // ログアプリへの登録処理
	                kintone.api('/k/v1/records', 'POST', {app: appId, records: obj}, function(resp) {

	                });
					// 
					obj = new Array();
					j = 0;
                
                }
                
            }
            location.reload();
        });
        //パース処理
        function csv2json(csvArray) {
            var jsonArray = [];
            var items = csvArray[0].split(',');
            for (var i = 1; i < csvArray.length; i++) {
                var a_line = {};
                var csvArrayD = csvArray[i].split(',');
                // 各データをループ処理する
                for (var j = 0; j < items.length; j++) {
                    //要素名：items[j]
                    //データ：csvArrayD[j]
                    a_line[items[j]] = csvArrayD[j];
                }
                jsonArray.push(a_line);
            }
            return jsonArray;
        }
    });
})();
