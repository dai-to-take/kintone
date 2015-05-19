(function () {
    "use strict";
    kintone.events.on('app.record.index.show', function (event) {
		// [目標]ステータスによってセルに着色

		// 「年」と「月」を取得
		var elBizYear = kintone.app.getFieldElements('bizYear');
		var elBizStatus = kintone.app.getFieldElements('bizMonth');
		// 週報（各週の各週締切日）格納用
		var dtWeek1st, dtWeek2nd, dtWeek3rd, dtWeek4th, dtWeek5th, dtWeek6th;
		// フィールド背景色用週報
		var elWeek1st = kintone.app.getFieldElements('week1st');
		var elWeek2nd = kintone.app.getFieldElements('week2nd');
		var elWeek3rd = kintone.app.getFieldElements('week3rd');
		var elWeek4th = kintone.app.getFieldElements('week4th');
		var elWeek5th = kintone.app.getFieldElements('week5th');
		var elWeek6th = kintone.app.getFieldElements('week6th');

		// 取得した年と月に「1日」を付けてYYYY-MM-01がある週を「1週目」とし
		// 月末までの各週ごとの締切日（翌週火曜日）を調べる
		// ※すみません、祝祭日の考慮はできていません
		var monthFirstday = elBizYear + "-" + elBizStatus + "-" + "01";
		monthFirstday = "2015-05-01"
		var chkFdate  = new Date(monthFirstday);
		// YYYY-MM-01の曜日番号を求める
		int chkdotw = chkFdate.getDay();
		// YYYY-MM-01の翌週の火曜日の日にちは"10"から曜日番号を引いた数字になる
		int nextTueDay = 10 - chkdotw;
alert("28ぎょうめ！？");
		// 1週目の週報の締切日
		dtWeek1st = new Date(elBizYear + "-" + elBizStatus + "-" + nextTueDay.toString());
		// 7日後（1週間後）の設定
		var plusDay = +7;
		dtWeek2nd = new Date(dtWeek1st.getTime()+(plusDay*24)*60*60*1000);
		dtWeek3rd = new Date(dtWeek2nd.getTime()+(plusDay*24)*60*60*1000);
		dtWeek4th = new Date(dtWeek3rd.getTime()+(plusDay*24)*60*60*1000);
		dtWeek5th = new Date(dtWeek4th.getTime()+(plusDay*24)*60*60*1000);
		dtWeek6th = new Date(dtWeek5th.getTime()+(plusDay*24)*60*60*1000);

alert("1週⇒" + dtWeek1st + "　2週⇒" + dtWeek2nd + "　3週⇒" + dtWeek3rd + "　4週⇒" + dtWeek4th + "　5週⇒" + dtWeek5th + "　6週⇒" + dtWeek6th);
		
	
	
// var weekdays = [ "日", "月", "火", "水", "木", "金", "土" ];
// monthFirstday = "2015-05-01"
// var chkFdate  = new Date(monthFirstday);
// var msg      = "今日は"+ (chkFdate.getMonth() + 1) + "月の\n";
// msg          += "第" + Math.floor((chkFdate.getDate() + 6 ) / 7) + weekdays[chkFdate.getDay()] + "曜日\n";
// msg          += "第" + Math.floor((chkFdate.getDate() - chkFdate.getDay() + 12 ) / 7) + "週目\n";
// alert (msg);
	
	

        for (var i = 0; i < elBizYear.length; i++) {
            var record = event.records[i];


        }

    });

	// レコード表示イベント
	kintone.events.on('app.record.detail.show', function (event) {
		// 表示優先順を非表示に
		kintone.app.record.setFieldShown('displayOrder', false);
	});

	// レコード追加イベント
	kintone.events.on('app.record.create.show', function (event) {
		// 表示優先順を非表示に
		kintone.app.record.setFieldShown('displayOrder', false);
	});

	// レコード編集イベント
	kintone.events.on('app.record.edit.show', function (event) {
		// 表示優先順を非表示に
		kintone.app.record.setFieldShown('displayOrder', false);
	});
	
	
})();
