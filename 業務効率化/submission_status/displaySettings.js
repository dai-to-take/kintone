(function () {
    "use strict";

	// レコード一覧画面のインライン編集開始時イベント
	kintone.events.on('app.record.index.edit.show', function(event) {
		var record = event['record'];
		// 年・月、社員番号・社員名・役職の編集不可
		record['bizYear']['disabled'] = true;
		record['bizMonth']['disabled'] = true;
		record['memberNum']['disabled'] = true;
		record['memberName']['disabled'] = true;
		record['managePosition']['disabled'] = true;
		record['roasterServerCompleted']['disabled'] = true;
		record['weekReportServerCompleted']['disabled'] = true;

		return event;
	});
	
	// レコード詳細表示イベント
	kintone.events.on('app.record.detail.show', function (event) {
		// 社員名検索グループを非表示に
		kintone.app.record.setFieldShown('shainSearch', false);
		// ぱんくず用名称を非表示に
		kintone.app.record.setFieldShown('pankuzuLink', false);
		// 表示優先順を非表示に
		kintone.app.record.setFieldShown('displayOrder', false);
	});

	// レコード追加イベント
	kintone.events.on('app.record.create.show', function (event) {
		// ぱんくず用名称を非表示に
		kintone.app.record.setFieldShown('pankuzuLink', false);
		// 表示優先順を非表示に
		kintone.app.record.setFieldShown('displayOrder', false);
	});

	// レコード編集イベント（詳細から）
	kintone.events.on('app.record.edit.show', function (event) {
		// 社員名検索グループを非表示に
		kintone.app.record.setFieldShown('shainSearch', false);
		// ぱんくず用名称を非表示に
		kintone.app.record.setFieldShown('pankuzuLink', false);
		// 表示優先順を非表示に
		kintone.app.record.setFieldShown('displayOrder', false);
		var record = event['record'];
		record['bizYear']['disabled'] = true;
		record['bizMonth']['disabled'] = true;
		return event;
	});

})();
