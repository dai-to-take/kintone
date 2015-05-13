/* spaceApp.js */
(function () {

    "use strict";

    // 登録・更新イベント(新規レコード、編集レコード、一覧上の編集レコード)
    kintone.events.on(['app.record.create.submit',
                       'app.record.edit.submit',
                       'app.record.index.edit.submit'], emptyLatLng);
    // 緯度、経度を空にします
    function emptyLatLng(event){

        // event よりレコード情報を取得します
        var rec = event['record'];

        // 保存の際に緯度、経度を空にします
        rec['lat']['value'] = '';
        rec['lng']['value'] = '';
        return event;

    }

    // 詳細画面が開いた時のイベント
    kintone.events.on('app.record.detail.show', detailShow);
    // 詳細画面を開いた時に実行します
    function detailShow(event){
        loadGMap();
        waitLoaded(event, 'detail', 10000, 100);     
    }

    // 一覧画面が開いた時のイベント
    kintone.events.on('app.record.index.show', indexShow);
    // 一覧画面を開いた時に実行します
    function indexShow(event){
        loadGMap();
        waitLoaded(event, 'index', 10000, 100);     
    }

    // 一覧画面で編集モードにした時のイベント
    kintone.events.on('app.record.index.edit.show', indexEditShow);
    // 一覧画面で編集モードになった時に実行されます
    function indexEditShow(event){
        var record = event.record;    
        // 住所フィールドを使用不可にします
        record['Address']['disabled'] = true;
        return event;
    }

	
	
	// レコード追加、編集画面の表示前処理
	// 場所コードのdisabled化
	var eventsShow = [
				'app.record.create.show',
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsShow, function (event) {
		var record = event.record;

		if (('app.record.create.show').indexOf(event.type) >= 0){
			record['SpaceCd']['value'] = "";
		}
		record['SpaceCd']['disabled'] = true;

		return event;
	});
	
	// レコード追加、編集画面の表示前処理
	// 場所区分とエリア区分のdisabled化
	var eventsEdit = [
				'app.record.edit.show',
				'app.record.index.edit.show'
				];

	kintone.events.on(eventsEdit, function (event) {
		var record = event.record;
		record['SpaceKbn']['disabled'] = true;
		record['AreaKbn']['disabled'] = true;
		
		return event;
	});
	
	// レコード追加画面の保存前処理
	// 場所コードの採番
	var eventAdd = [
				'app.record.create.submit'
				];
	
	kintone.events.on(eventAdd, function(event) {
		var record = event.record;
		
		// サービス初期化
		var spaceService = new SpaceService(record);
		spaceService.initialize();
		// API実行
		if (spaceService.getRecords()){
			// 新規ItemCdを取得
			if (spaceService.getSpaceCd('SpaceCd')){
				// 採番したSpaceCdを設定
				record['SpaceCd']['value'] = spaceService.getAutoSpaceCd();
			} else {
				event.error = spaceService.getMessage();
			}
		}else {
			event.error = spaceService.getMessage();
		}

		return event;
	});
	
})();