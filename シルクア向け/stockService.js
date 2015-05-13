/* stockService.js */

var StockService = function(record) {
	this._init(record);
};

StockService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;
		this.tableRecords = record['TABEL']['value'];
		
		// 変数セット
		this.strProcessDate = record['ProcessDate']['value'];
		
		// クリエリー作成
		this.processDate = moment(this.strProcessDate);
		// 開始終了年を生成
		this.startDate = moment(new Date(this.processDate.year() , this.processDate.month(), '1'));
		this.endDate = moment(new Date(this.processDate.year() , this.processDate.month() + 1 , '1'));
	},
	
	// 在庫管理-伝票番号 の 採番用
	initStock: function() {
		// 初期化
		this.recNo = 1;
		// クリエリー作成
		this.query = 'ProcessDate >= "' + this.startDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" and ProcessDate <"' + this.endDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by SlipNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
	},
	
	// 入出庫履歴 の 登録用
	initNyuSyutu: function() {
		// 初期化
		this.recNo = 1;
		// クリエリー作成
		this.query = 'NyusyutuDate >= "' + this.startDate.format("YYYY-MM-DD") + '" and NyusyutuDate <"' + this.endDate.format("YYYY-MM-DD") + '" order by NyusyutuNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.NYUSYUTU + '&query=' + encodeURI(this.query);
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
	getMaxNumber: function(keyVal , cutNum) {
		var obj = JSON.parse(this.jsonObj);
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

				this.recNo = parseInt(strGetVal.slice(cutNum),10) +1;
				
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
		// 変数初期化
		var cntNyusyutu = 0;
		
		// 取得
		if (this.getRecords()){
			// NyusyutuNumberから初期値を取得
			if (this.getMaxNumber('NyusyutuNumber' , -5)){
				// 初期値を取得
				cntNyusyutu  = this.recNo;
			} else {
				this.message = '伝票番号が取得できません。';
				return false;
			}
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
		
		// JSONパラメータ作成
		var queryObj = new Object();
		queryObj["app"] = _APPID.NYUSYUTU;
		queryObj["records"] = new Array();

		for (var i = 0; i < this.tableRecords.length; i++) {
			var partObj = new Object();
			partObj["NyusyutuNumber"] = {value: this.getAutoNyusyutuNumber(cntNyusyutu)};	// 入出庫番号
			partObj["NyusyutuDate"] = {value: this.processDate.format("YYYY-MM-DD")};	// 入出庫日
			partObj["NyusyutuKbn"] = {value: this.record['ProcessKbn']['value']};	// 入出庫区分
			partObj["SlipNumber"] = {value: autoSlipNumber};						// 伝票番号
			partObj["SpaceCodeSaki"] = {value: this.record['SpaceCode']['value']};	// 場所コード(先）
			partObj["ItemCd"] = {value: this.tableRecords[i].value['ItemCd'].value};		// 商品コード

			queryObj["records"].push(partObj);
			
			cntNyusyutu++;
		}

		localStorage.setItem('queryObj', JSON.stringify(queryObj));
		var addparams = JSON.parse(localStorage.getItem('queryObj'));
		
		// API実行
		kintone.api(
			kintone.api.url('/k/v1/records',true),
			'POST' ,
			addparams , 
			function(resp) {
				this.message = '入出庫履歴が登録されました';
				return true;
			}, 
			function(resp) {
				this.message = '入出庫履歴の登録が失敗しました';
				return false;
			}
		); 
		
	},
	getAutoNyusyutuNumber: function(nyusyutuNo) {
		return 'N' + getYmd(this.strProcessDate) + ('00000' + nyusyutuNo).slice(-5);
	}
}
