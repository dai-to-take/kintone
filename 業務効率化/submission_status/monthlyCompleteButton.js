(function () {
    "use strict";
	
	// 当月書類提出完了前に 勤務表,週報(2～4週)の入力値をチェックします
	function checkValue(event){

		var roster, week1st, week2nd, week3rd, week4th, week5th, week6th;
		// event よりレコード情報を取得します
		var rec = event['record'];

		// 勤務表提出状況確認します
		var roster = rec['roster']['value'];
		if (roster !== '○'){
			rec['roster']['error'] = '勤務表の提出状況を○にしてください';
		}

		// 週報(1週)提出状況確認します
		var week1st = rec['week1st']['value'];
		if (week1st !== undefined){
			if (week1st.length > 0){
				if (week1st !== '○'){
					rec['week1st']['error'] = '週報(1週)の提出状況を○にしてください';
				}
			}
		}

		// [必須]週報(2週)提出状況確認します
		var week2nd = rec['week2nd']['value'];
		if (week2nd !== '○'){
			rec['week2nd']['error'] = '週報(2週)の提出状況を○にしてください';
		}

		// [必須]週報(3週)提出状況確認します
		var week3rd = rec['week3rd']['value'];
		if (week3rd !== '○'){
			rec['week3rd']['error'] = '週報(3週)の提出状況を○にしてください';
		}

		// [必須]週報(4週)提出状況確認します
		var week4th = rec['week4th']['value'];
		if (week4th !== '○'){
			rec['week4th']['error'] = '週報(4週)の提出状況を○にしてください';
		}

		// 週報(5週)提出状況確認します
		var week5th = rec['week5th']['value'];
		if (week5th !== undefined){
			if (week5th.length > 0){
				if (week5th !== '○'){
					rec['week5th']['error'] = '週報(5週)の提出状況を○にしてください';
				}
			}
		}

		// 週報(6週)提出状況確認します
		var week6th = rec['week6th']['value'];
		if (week6th !== undefined){
			if (week6th.length > 0){
				if (week6th !== '○'){
					rec['week6th']['error'] = '週報(6週)の提出状況を○にしてください';
				}
			}
		}

		// event を return します。
		// エラーが有る場合は、保存はキャンセルされ、詳細画面にエラーが表示されます。
		// エラーがない場合は、保存が実行されます。
		return event;
	}

    kintone.events.on('app.record.detail.show', function (event) {
        if (document.getElementById ('monthly_complete') != null) {
            return;
        }

        var myCompleteButton = document.createElement('button');
        myCompleteButton.id = 'monthly_complete';
        myCompleteButton.innerHTML = '当月書類提出完了';

        // ボタンクリック時の処理
        myCompleteButton.onclick = function() {
            	window.confirm('当月の入力を完了しますか？');
        }

        kintone.app.record.getHeaderMenuSpaceElement().appendChild(myCompleteButton);
    });
})();