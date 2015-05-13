/* stockService.js */

var StockService = function(record) {
	this._init(record);
};

StockService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.recNo = 1;
		this.record = record;
		
		// 変数セット
		this.strProcessDate = record['ProcessDate']['value'];
		
		// クリエリー作成
		var v1 = new Date(this.strProcessDate);
		// 開始終了年を生成
		var startDate = moment(new Date(v1.getFullYear() , v1.getMonth(), '1'));
		var endDate = moment(new Date(v1.getFullYear() , v1.getMonth() + 1 , '1'));

		this.query = 'ProcessDate >= "' + startDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" and ProcessDate <"' + endDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by SlipNumber limit 1';

		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
	},
	
	// getter
	getMessage: function() {
	  return this.message;
	},
	getStatus: function() {
	  return this.status;
	},

	// 採番
	getRecords: function() {
		var xmlHttp = new XMLHttpRequest();
		// 同期リクエストを行う
		xmlHttp.open("GET", this.apiUrl, false);
		xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xmlHttp.send(null);
		
		if (xmlHttp.status == 200){
			if(window.JSON){
				this.status = _CONST.OK;
				this.jsonObj = xmlHttp.responseText;
				return true;
			} else {
				this.status = _CONST.WARNING;
				this.message = xmlHttp.statusText;
				return false;
			}
		} else {
			this.status = _CONST.ERROR;
			this.message = 'コードが取得できません。';
			return false;
		}
		// この記載方法だと同期が取れない・・・
//		kintone.api(
//			kintone.api.url('/k/v1/records', true),
//			'GET', {
//				app: kintone.app.getId(),
//				query: this.query
//			},
//			function(resp) {
//					this.status = _CONST.OK;
//					this.jsonObj = resp;
//			},
//			function(resp) {
//				this.status = _CONST.ERROR;
//				this.message = 'コードが取得できません。';
//			}
//		)		
	},
	getSlipNumber: function(keyVal) {
		var obj = JSON.parse(this.jsonObj);
//		var obj = this.jsonObj;
		if (obj.records[0] != null){
			try{
				var strGetVal = '';
				for ( var keyA in obj.records ) {
					for ( var keyB in obj.records[keyA] ) {
						if (keyB == keyVal){
							strGetVal = obj.records[keyA][keyB].value;
						}
					}
				}

				this.recNo = parseInt(strGetVal.slice(-3),10) +1;
				
			} catch(e){
				this.message = '伝票番号が取得できません。';
				return false;
			}
		}
		return true;
	},
	getAutoSlipNumber: function() {
		return 'Z' + getYmd(this.strProcessDate) + ('000' + this.recNo).slice(-3);
	},

	// データ登録
	putNyusyutu: function(autoSlipNumber) {
		
		var tableRecords = this.record['TABEL']['value'];
		
		var processDate = moment(new Date(this.record['ProcessDate']['value']));
		
		var queryObj = new Object();
		queryObj["app"] = _APPID.NYUSYUTU;
		queryObj["records"] = new Array();
		// ここからループ
		for (var i = 0; i < tableRecords.length; i++) {
			var partObj = new Object();
			partObj["NyusyutuNumber"] = {value: "0001"};							// 入出庫番号
			partObj["NyusyutuDate"] = {value: processDate.format("YYYY-MM-DD")};	// 入出庫日
			partObj["NyusyutuKbn"] = {value: this.record['ProcessKbn']['value']};	// 入出庫区分
			partObj["SlipNumber"] = {value: autoSlipNumber};						// 伝票番号
			partObj["SpaceCodeSaki"] = {value: this.record['SpaceCode']['value']};	// 場所コード(先）
			partObj["ItemCd"] = {value: tableRecords[i].value['ItemCd'].value};		// 商品コード

			queryObj["records"].push(partObj);
		}
		// ここまでループ
		localStorage.setItem('queryObj', JSON.stringify(queryObj));
		var addparams = JSON.parse(localStorage.getItem('queryObj'));
		
		kintone.api(
			kintone.api.url('/k/v1/records',true),
			'POST' ,
			addparams , 
			function(resp) {
				alert('入出庫実績が登録されました')
			}, 
			function(resp) {
				alert('入出庫実績の登録が失敗しました')
			}
		); 
		
	}
}
