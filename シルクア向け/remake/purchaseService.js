/* purchaseService.js */

var PurchaseService = function(record) {
	this._init(record);
};

PurchaseService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		this.keyVal = "";

		this.record = record;
		
		// 変数セット
		this.strPurchaseDate = record['PurchaseDate']['value'];
		
		// クリエリー作成
		this.purchaseDate = moment(this.strPurchaseDate);
		// 開始終了年を生成
		this.startDate = moment(new Date(this.purchaseDate.year() , this.purchaseDate.month(), '1'));
		this.endDate = moment(new Date(this.purchaseDate.year() , this.purchaseDate.month() + 1 , '1'));
	},
	
	/***************************************/
	/* getter                              */
	/***************************************/
	getMessage: function() {
	  return this.message;
	},
	getStatus: function() {
	  return this.status;
	},
	
	/***************************************/
	/* 仕入管理-伝票番号 の 採番用初期処理 */
	/***************************************/
	initPurchase: function() {
		// 初期化
		this.recNo = 1;
		// クリエリー作成
		this.query = 'PurchaseDate >= "' + this.startDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" and PurchaseDate <"' + this.endDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by PurchaseNumber limit 1';
		// API用URL作成

		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
	},
	
	/***************************************/
	/* 入出庫履歴 の 登録用初期処理        */
	/***************************************/
	_initNyuSyutu: function() {
		// 初期化
		this.recNo = 1;
		// クリエリー作成
		this.query = 'IdoDate >= "' + this.startDate.format("YYYY-MM-DD") + '" and IdoDate <"' + this.endDate.format("YYYY-MM-DD") + '" order by IdoNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.IDO + '&query=' + encodeURI(this.query);
	},
	
	/***************************************/
	/* 更新チェック用初期処理                  */
	/***************************************/
	_initNyusyutuCheck: function(postSlipNumber) {
		// 初期化
		// クリエリー作成
		this.query = 'SlipNumber = "' + postSlipNumber + '"';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.IDO + '&query=' + encodeURI(this.query);
	},
	
	/***************************************/
	/* 仕入管理用の伝票番号採番            */
	/***************************************/
	getPurchaseNumber: function() {
		
		if (this._getRecords()){
			// 新規PurchaseNumberを取得
			if (this._getMaxNumber('PurchaseNumber',-3)){
				this.message = '伝票番号が取得できました';
				return true;
			} else {
				this.message = '伝票番号が取得できません。';
				return false;
			}
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoPurchaseNumber: function() {
		return _SILPNUM.PURCH + getYmd(this.strPurchaseDate) + ('000' + this.recNo).slice(-3);
	},
	_isExistence: function() {
		var obj = JSON.parse(this.jsonObj);
		if (obj.records[0] != null){
			return true;
		} else {
			return false;
		}
	},
	/***************************************/
	/* 入出庫履歴の登録                    */
	/***************************************/
	postNyusyutu: function() {
		// 変数初期化
		var cntNyusyutu = 0;
		
		//存在チェック
		this._initNyusyutuCheck(this.record['PurchaseNumber']['value']);
		// すでに登録済みか？
		if (this._getRecords()){
			if (this._isExistence()){
				this.message = 'すでに移動履歴に展開済みです。';
				return false;
			}
		} else {
			this.message = '商品チェックが失敗しました。';
			return false;
		}
		
		// 移動履歴登録用で初期化
		this._initNyuSyutu();
		// 取得
		if (this._getRecords()){
			// IdoNumberから初期値を取得
			if (this._getMaxNumber('IdoNumber' , -5)){
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
		queryObj["app"] = _APPID.IDO;

		var partObj = new Object();
		queryObj["record"] = partObj;

		partObj["IdoNumber"] = {value: this._getAutoIdoNumber(cntNyusyutu)};	// 入出庫番号
		partObj["IdoDate"] = {value: this.purchaseDate.format("YYYY-MM-DD")};	// 入出庫日
		
		partObj["IdoKbn"] = {value: _IDOKBN.NYUKO};	// 移動区分
		partObj["IdoReason"] = {value: _IDORSN.PURCH};	// 移動理由
		
		partObj["SlipNumber"] = {value: this.record['PurchaseNumber']['value']};	// 伝票番号
		partObj["PurchaseNumberLU"] = {value: this.record['PurchaseNumber']['value']};	// 伝票番号
		
		partObj["CustomerCdLU"] = {value: this.record['PurchaseCodeLU']['value']};	// 顧客コード
		partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
		partObj["ItemCdLU"] = {value: this.record['ItemCdLU']['value']};	//商品コード
		partObj["Price"] = {value: this.record['PurchasePrice']['value']};	//価格
		
		if (this._postRecord(queryObj)){
			this.message = '入出庫履歴が登録されました';
			return true;
		} else {
			this.message = '入出庫履歴の登録が失敗しました';
			return false;
		}
	},
	_getAutoIdoNumber: function(nyusyutuNo) {
		return _SILPNUM.NST + getYmd(this.strPurchaseDate) + ('00000' + nyusyutuNo).slice(-5);
	},
	
	_getRecords: function() {
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
	},
	_getMaxNumber: function(keyVal , cutNum) {
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
	_postRecord: function(param) {
		// CSRFトークンの取得
		var token = kintone.getRequestToken();
		param["__REQUEST_TOKEN__"] = token; 
		
		var xmlHttp = new XMLHttpRequest();
		// 同期リクエストを行う
		xmlHttp.open("POST", kintone.api.url('/k/v1/record'), false);
		xmlHttp.setRequestHeader('Content-Type', 'application/json');
		xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xmlHttp.send(JSON.stringify(param));
		
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
			this.message = '登録に失敗しました。';
			return false;
		}
	}
}
