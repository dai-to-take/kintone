/* sellingService.js */

var SellingService = function(record) {
	this._init(record);
};

SellingService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		this.keyVal = "";

		this.record = record;
		this.tableRecords = record['TABEL']['value'];
		
		// 変数セット
		this.strSellingDate = record['SellingDate']['value'];
		
		// クリエリー作成
		this.sellingDate = moment(this.strSellingDate);
		// 開始終了年を生成
		this.startDate = moment(new Date(this.sellingDate.year() , this.sellingDate.month(), '1'));
		this.endDate = moment(new Date(this.sellingDate.year() , this.sellingDate.month() + 1 , '1'));
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
	/* 売上管理-伝票番号 の 採番用初期処理 */
	/***************************************/
	initSelling: function() {
		// 初期化
		this.recNo = 1;
		// クリエリー作成
		this.query = 'SellingDate >= "' + this.startDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" and SellingDate <"' + this.endDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by SellingNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
	},
	
	/***************************************/
	/* 入出庫履歴 の 登録用初期処理        */
	/***************************************/
	initNyuSyutu: function() {
		// 初期化
		this.recNo = 1;
		// クリエリー作成
		this.query = 'NyusyutuDate >= "' + this.startDate.format("YYYY-MM-DD") + '" and NyusyutuDate <"' + this.endDate.format("YYYY-MM-DD") + '" order by NyusyutuNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.IDO + '&query=' + encodeURI(this.query);
	},
	/***************************************/
	/* 商品ID取得用初期処理                  */
	/***************************************/
	_initItemUpdate: function(updateItemCd) {
		// 初期化
		// クリエリー作成
		this.query = 'ItemCd = "' + updateItemCd + '" limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.ITEM + '&query=' + encodeURI(this.query);
	},
	/***************************************/
	/* 更新チェック用初期処理                  */
	/***************************************/
	_initItemCheck: function(updateItemCd) {
		// 初期化
		// クリエリー作成
		this.query = 'ItemCdLU = "' + updateItemCd + '" and NyusyutuDate > "' + this.sellingDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]")  + '"';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.IDO + '&query=' + encodeURI(this.query);
	},
	
	/***************************************/
	/* 在庫管理用の伝票番号採番            */
	/***************************************/
	getSellingNumber: function() {
		
		if (this._getRecords()){
			// 新規SellingNumberを取得
			if (this._getMaxNumber('SellingNumber',-3)){
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
	getAutoSellingNumber: function() {
		return _SILPNUM.SELL + getYmd(this.strSellingDate) + ('000' + this.recNo).slice(-3);
	},

	/***************************************/
	/* 入出庫履歴の登録                    */
	/***************************************/
	postNyusyutu: function(autoSellingNumber) {
		// 変数初期化
		var cntNyusyutu = 0;
		
		// 取得
		if (this._getRecords()){
			// NyusyutuNumberから初期値を取得
			if (this._getMaxNumber('NyusyutuNumber' , -5)){
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
		queryObj["records"] = new Array();

		for (var i = 0; i < this.tableRecords.length; i++) {
			var partObj = new Object();
			partObj["NyusyutuNumber"] = {value: this._getAutoNyusyutuNumber(cntNyusyutu)};	// 入出庫番号
			partObj["NyusyutuDate"] = {value: this.sellingDate.format("YYYY-MM-DD")};	// 入出庫日
			
			partObj["NyusyutuKbn"] = {value: _NSTKBN.DEL};	// 入出庫区分
			
			partObj["SlipNumber"] = {value: autoSellingNumber};						// 伝票番号
//			partObj["DeliveryNumberLU"] = {value: autoDeliveryNumber};	// 伝票番号
			
			partObj["CustomerCdLU"] = {value: this.record['DeliveryCodeLU']['value']};	// 顧客コード
//			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
			partObj["ItemCdLU"] = {value: this.tableRecords[i].value['ItemCdLU'].value};	//商品コード
			partObj["Price"] = {value: this.tableRecords[i].value['SellingPrice'].value};	//価格

			queryObj["records"].push(partObj);
			
			cntNyusyutu++;
		}
		
		if (this._postRecords(queryObj)){
			this.message = '入出庫履歴が登録されました';
			return true;
		} else {
			this.message = '入出庫履歴の登録が失敗しました';
			return false;
		}
	},
	_getAutoNyusyutuNumber: function(nyusyutuNo) {
		return _SILPNUM.NST + getYmd(this.strSellingDate) + ('00000' + nyusyutuNo).slice(-5);
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
	_getKeyVal: function(keyVal) {
		var obj = JSON.parse(this.jsonObj);
		if (obj.records[0] != null){
			try{
				for ( var keyA in obj.records ) {
					for ( var keyB in obj.records[keyA] ) {
						if (keyB == keyVal){
							this.keyVal = obj.records[keyA][keyB].value;
						}
					}
				}
			} catch(e){
				this.message = '情報が取得できません。';
				return false;
			}
		} else {
			this.keyVal = ''
		}
		return true;
	},
	_postRecords: function(param) {
		// CSRFトークンの取得
		var token = kintone.getRequestToken();
		param["__REQUEST_TOKEN__"] = token; 
		
		var xmlHttp = new XMLHttpRequest();
		// 同期リクエストを行う
		xmlHttp.open("POST", kintone.api.url('/k/v1/records'), false);
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
	/* 商品の更新                          */
	/***************************************/
	putItem: function() {
		// 変数初期化
		for (var i = 0; i < this.tableRecords.length; i++) {
			var updateItemCd = this.tableRecords[i].value['ItemCdLU'].value;
			var itemCdId = null;
			
			// 商品チェック
			this._initItemCheck(updateItemCd);
			// 今回の処理日より未来での変更があるか？
			if (this._getRecords()){
				if (this._isExistence()){
					// 存在する場合は次の商品へ
					continue;
				}
			} else {
				this.message = '商品チェックが失敗しました。';
				return false;
			}

			// 商品ID取得用で初期化
			this._initItemUpdate(updateItemCd);
			// 対象商品の$idを取得
			if (this._getRecords()){
				if (this._getKeyVal('$id')){
					itemCdId = this.keyVal
				} else {
					this.message = '対象商品がが得できません。';
					return false;
				}
			} else {
				this.message = '対象商品がが得できません。';
				return false;
			}
			
			// 更新用パラメータを作成
			var queryObj = new Object();
			queryObj["app"] = _APPID.ITEM;
			queryObj["id"] = itemCdId;
			
			var partObj = new Object();
			queryObj["record"] = partObj;

			partObj["SellingPrice"] = {value: this.tableRecords[i].value['SellingPrice'].value};	// 価格

			partObj["ConditionKbn"] = {value: _CONDKBN.SELL};	// 状態区分
			
			// 更新実行
			if (this._putRecords(queryObj)){
				this.message = '商品マスタが更新されました';
			} else {
				this.message = '商品マスタの更新が失敗しました';
				return false;
			}
		}
		return true;
	},
	_putRecords: function(param) {
		// CSRFトークンの取得
		var token = kintone.getRequestToken();
		param["__REQUEST_TOKEN__"] = token; 

		var xmlHttp = new XMLHttpRequest();
		// 同期リクエストを行う
		xmlHttp.open("PUT", kintone.api.url('/k/v1/record'), false);
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
