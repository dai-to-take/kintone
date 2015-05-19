(function () {
    "use strict";
    kintone.events.on('app.record.index.show', function (event) {
	// [目標]ステータスによってセルに着色

		// データ0件時はなにもせず返す
        if (!event.size) {
            return;
        }

		// 取得レコードループ用「年」取得
		var elBizYear = kintone.app.getFieldElements('bizYear');
//		var elBizMonth = kintone.app.getFieldElements('bizMonth');
		// フィールド背景色用勤務表
		var elRoster = kintone.app.getFieldElements('roster');
		// フィールド背景色用週報
		var elWeek1st = kintone.app.getFieldElements('week1st');
		var elWeek2nd = kintone.app.getFieldElements('week2nd');
		var elWeek3rd = kintone.app.getFieldElements('week3rd');
		var elWeek4th = kintone.app.getFieldElements('week4th');
		var elWeek5th = kintone.app.getFieldElements('week5th');
		var elWeek6th = kintone.app.getFieldElements('week6th');
		// フィールド背景色用各種書類
		var elAdjustment = kintone.app.getFieldElements('adjustment');
		var elRoasterSvrChk = kintone.app.getFieldElements('roasterServerCompleted');
		var elWeekRepoSvrChk = kintone.app.getFieldElements('weekReportServerCompleted');
		
		// 取得レコードループ
        for (var i = 0; i < elBizYear.length; i++) {
            var record = event.records[i];
			
			// 週報（各週の各週締切日）格納用
			var dt1stLimit, dt2ndLimit, dt3rdLimit, dt4thLimit, dt5thLimit, dt6thLimit;
			// 勤務表、その他月次書類締切日格納用
			var dtMonthLimit;
			// 取得した年と月に「1日」を付けてYYYY-MM-01がある週を「1週目」とし
			// 月末までの各週ごとの締切日（翌週火曜日）を調べる
			// ※すみません、祝祭日の考慮はできていません
			var monthFirstday = record['bizYear']['value'] + "-" + record['bizMonth']['value'] + "-" + "01";
			var chkFdate  = new Date(monthFirstday);
			// YYYY-MM-01の曜日番号を求める
			var chkFdotw = chkFdate.getDay();
			// YYYY-MM-01の翌週の火曜日の日にちは"10"から曜日番号を引いた数字になる
			var nextTueDay = 10 - chkFdotw;

			// 取得した年と月から月末日付を求める
			var yearMonth = record['bizYear']['value'] + record['bizMonth']['value'];
			var d;
			if(yearMonth.toLowerCase() == "last") {
				d = new Date();
				d.setDate(0);
			} else {
				var wYear = yearMonth.slice(0, 4);
				var wMonth = yearMonth.slice(4, 6);
				d = new Date(wYear, wMonth - 1 + 1, 1);
				d.setDate(0);
			}
			var year = d.getFullYear();
			var month = ("0" + (d.getMonth() + 1)).slice(-2);
			var date = ("0" + (d.getDate())).slice(-2);
			var monthLastDay = year + "-" + month + "-" + date;
			var chkLdate  = new Date(monthLastDay);
			// 月末の曜日番号を求める
			var chkLdotw = chkLdate.getDay();
			// 月末の曜日が土、日、月、火、水曜日のいずれかの場合、月末の2日後の日付を月次書類の締切日とする
			// 月末の曜日が木、金曜日のいずれかの場合、月次書類の締切は翌週月曜日とする
			if (chkLdotw === 4) {
				dtMonthLimit = new Date(chkLdate.getTime()+(4*24)*60*60*1000);
			} else if (chkLdotw === 5) {
				dtMonthLimit = new Date(chkLdate.getTime()+(3*24)*60*60*1000);
			} else {
				dtMonthLimit = new Date(chkLdate.getTime()+(2*24)*60*60*1000);
			}

//alert(dtMonthLimit);

			// YYYY-MM-01の週報の締切日
			dt1stLimit = new Date(record['bizYear']['value'] + "-" + record['bizMonth']['value'] + "-" + nextTueDay.toString());
			// 7日後（1週間後）の設定
			var plusDay = +7;
			// 2週目以降の週報締切日設定
			dt2ndLimit = new Date(dt1stLimit.getTime()+(plusDay*24)*60*60*1000);
			dt3rdLimit = new Date(dt2ndLimit.getTime()+(plusDay*24)*60*60*1000);
			dt4thLimit = new Date(dt3rdLimit.getTime()+(plusDay*24)*60*60*1000);
			dt5thLimit = new Date(dt4thLimit.getTime()+(plusDay*24)*60*60*1000);
			dt6thLimit = new Date(dt5thLimit.getTime()+(plusDay*24)*60*60*1000);

//alert("1週⇒" + dt1stLimit + "　2週⇒" + dt2ndLimit + "　3週⇒" + dt3rdLimit + "　4週⇒" + dt4thLimit + "　5週⇒" + dt5thLimit + "　6週⇒" + dt6thLimit);

			// 比較用の今日取得
			var today = new Date();
			var myDateToday = today.getTime();

			// 勤務表
			if (record['roster']['value'] !== "○") {
				if (myDateToday > dtMonthLimit){ 
					elRoster[i].style.color = 'red';
					elRoster[i].style.backgroundColor = 'yellow';
				}
			}
			// 週報第1週
			if ((record['week1st']['value'] !== "○") && (record['week1st']['value'] !== "")){
				if (myDateToday > dt1stLimit){ 
					elWeek1st[i].style.color = 'red';
					elWeek1st[i].style.backgroundColor = 'yellow';
				} else {
					// 期限日が当日日の2日以内の場合
					var daysDiff = getDayDiff(myDateToday,dt1stLimit);
					if (daysDiff < 3 ) {
						elWeek1st[i].style.backgroundColor = 'cornsilk';
					}
				}
            }
  			// 週報第2週(必須)
			if (record['week2nd']['value'] !== "○") {
				if (myDateToday > dt2ndLimit){ 
					elWeek2nd[i].style.color = 'red';
					elWeek2nd[i].style.backgroundColor = 'yellow';
				} else {
					// 期限日が当日日の2日以内の場合
					var daysDiff = getDayDiff(myDateToday,dt2ndLimit);
					if (daysDiff < 3 ) {
						elWeek2nd[i].style.backgroundColor = 'cornsilk';
					}
				}
            }
			// 週報第3週(必須)
			if (record['week3rd']['value'] !== "○") {
				if (myDateToday > dt3rdLimit){ 
					elWeek3rd[i].style.color = 'red';
					elWeek3rd[i].style.backgroundColor = 'yellow';
				} else {
					// 期限日が当日日の2日以内の場合
					var daysDiff = getDayDiff(myDateToday,dt3rdLimit);
					if (daysDiff < 3 ) {
						elWeek3rd[i].style.backgroundColor = 'cornsilk';
					}
				}
            }
			// 週報第4週(必須)
			if (record['week4th']['value'] !== "○") {
				if (myDateToday > dt4thLimit){ 
					elWeek4th[i].style.color = 'red';
					elWeek4th[i].style.backgroundColor = 'yellow';
				} else {
					// 期限日が当日日の2日以内の場合
					var daysDiff = getDayDiff(myDateToday,dt4thLimit);
					if (daysDiff < 3 ) {
						elWeek4th[i].style.backgroundColor = 'cornsilk';
					}
				}
            }
			// 週報第5週
			if ((record['week5th']['value'] !== "○") && (record['week5th']['value'] !== "")) {
				if (myDateToday > dt5thLimit){ 
					elWeek5th[i].style.color = 'red';
					elWeek5th[i].style.backgroundColor = 'yellow';
				} else {
					// 期限日が当日日の2日以内の場合
					var daysDiff = getDayDiff(myDateToday,dt5thLimit);
					if (daysDiff < 3 ) {
						elWeek5th[i].style.backgroundColor = 'cornsilk';
					}
				}
            }
			// 週報第6週
			if ((record['week6th']['value'] !== "○") && (record['week5th']['value'] !== "")) {
				if (myDateToday > dt6thLimit){ 
					elWeek6th[i].style.color = 'red';
					elWeek6th[i].style.backgroundColor = 'yellow';
				} else {
					// 期限日が当日日の2日以内の場合
					var daysDiff = getDayDiff(myDateToday,dt6thLimit);
					if (daysDiff < 3 ) {
						elWeek6th[i].style.backgroundColor = 'cornsilk';
					}
				}
            }
			// 精算書
			if ((record['adjustment']['value'] !== "○") && (record['adjustment']['value'] !== "")) {
				if (myDateToday > dtMonthLimit){ 
					elAdjustment[i].style.color = 'red';
					elAdjustment[i].style.backgroundColor = 'yellow';
				}
			}
			// 勤務表（サーバ）
			if (record['roasterServerCompleted']['value'] === "サーバ格納済(月末)") {
				record['roasterServerCompleted']['value'] = "○";
			} else {
				if (myDateToday > dtMonthLimit){ 
					elRoasterSvrChk[i].style.color = 'red';
					elRoasterSvrChk[i].style.backgroundColor = 'yellow';
				}
			}

			// 週報（サーバ）
			if (record['weekReportServerCompleted']['value'] === "サーバ格納済(月末)") {
					record['weekReportServerCompleted']['value'] = "○";
			} else {
				if (myDateToday > dtMonthLimit){ 
					elWeekRepoSvrChk[i].style.color = 'red';
					elWeekRepoSvrChk[i].style.backgroundColor = 'yellow';
				}
			}


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
	
    // 日付の差分日数を返却
    function getDayDiff(date1Str, date2Str) {
		// getTimeメソッドで経過ミリ秒を取得し、2つの日付の差を求める
		var msDiff = date2Str - date1Str
		// 求めた差分（ミリ秒）を日付へ変換します（経過ミリ秒÷(1000ミリ秒×60秒×60分×24時間)。端数切り捨て）
		var daysDiff = Math.floor(msDiff / (1000 * 60 * 60 *24));

		// 差分へ1日分加算して返却します
		return ++daysDiff;
	}
	
})();
