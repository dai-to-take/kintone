/* customerService.js */

CustomerService = function(record) {
	this._init(record);
};
CustomerService.prototype = {
	
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		
		this.recNo = 1;
		this.record = record;

		// 変数セット
		this.strCustomerKbn = this.record['CustomerKbn']['value'];

		this.strAreaKbn = this.record['AreaKbn']['value'];

		this.strCustomerCd =  this.record['CustomerCd']['value'];
		
		// クリエリー作成
		this.query = 'CustomerKbn in ("' + this.strCustomerKbn+ '") and AreaKbn in ("' + this.strAreaKbn + '") order by CustomerCd limit 1';
		
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
	},

	getMessage: function() {
	  return this.message;
	},
	
	/***************************************/
	/* 場所コードの採番                    */
	/***************************************/
	getCustomerCd: function(keyVal) {
		if (this._getRecords()){
			// 新規CustomerCdを取得
			if (this._getMaxNumber('CustomerCd')){
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
	
	/***************************************/
	/* 在庫管理のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteStock: function() {
		this.offset = 0;
		
		this.query = 'SpaceCd = "' + this.strSpaceCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.STOCK;
	},
	
	/***************************************/
	/* 入出庫管理のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteNyusyutu: function() {
		this.offset = 0;
		
		this.query = 'SpaceCd = "' + this.strSpaceCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.NYUSYUTU;
	},
	
	/***************************************/
	/* 商品のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteItem: function() {
		this.offset = 0;
		
		this.query = 'SpaceCd = "' + this.strSpaceCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.ITEM;
	},
	_getRecords: function() {
		var xmlHttp = new XMLHttpRequest();
		// 同期リクエストを行う
		xmlHttp.open("GET", this.apiUrl, false);
		xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xmlHttp.send(null);
		
		if (xmlHttp.status == 200){
			if(window.JSON){
				this.status = "00";
				this.jsonObj = xmlHttp.responseText;
				return true;
			} else {
				this.status = "80";
				this.message = xmlHttp.statusText;
				return false;
			}
		} else {
			this.status = "90";
			this.message = 'コードが取得できません。';
			return false;
		}
	},
	
	_getMaxNumber: function(keyVal) {
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

				this.recNo = parseInt(strGetVal.slice(-5),10) +1;
				
			} catch(e){
				this.message = '伝票番号が取得できません。';
				return false;
			}
		}
		return true;
	},
	getAutoCustomerCd: function() {
		return getCustomerKbnCd(this.strCustomerKbn) + getAreaCd(this.strAreaKbn) + ('00000' + this.recNo).slice(-5);
	},
	
	/***************************************/
	/* メンテナンス処理                    */
	/***************************************/
	putMainte: function() {
	
		var records = new Array();
		var loopendflg = false;
		
		while(!loopendflg){
			// クリエリー作成
			var workQuery = this.query  + this.offset;
			// API用URL作成
			this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ this.otherAppId + '&query=' + encodeURI(workQuery);

			// 同期リクエストを行う
			if (!this._getRecords()) {
				this.message = '場所コードのメンテナンスに失敗しました。';
				return false;
			}
		
			//取得したレコードをArrayに格納
			var respdata = JSON.parse(this.jsonObj);
			if(respdata.records.length > 0){
				for(var i = 0; respdata.records.length > i; i++){
					records.push(respdata.records[i]);
				}
				this.offset += respdata.records.length;
			}else{
				loopendflg = true;
			}
		}
		
		//パラメータ作成
		var queryObj = this._getQueryObj(records);
		
		if(records.length > 0){
			if (! this._updateLookup(queryObj)){
				return false;
			}
		}
		
		return true;
	},
	
	_getQueryObj: function(records) {
		var queryObj = new Object();
		queryObj["app"] = this.otherAppId;
		queryObj["records"] = new Array();
		
	    for (var i = 0, l = records.length; i < l; i++) {
			var record = records[i];
			var partObj = new Object();
			//レコードID
	    	partObj["id"] = record['$id'].value;
	    	//レコードの各フィールド
	    	partObj["record"] = new Array();

    		partObj["record"] = {CustomerCd:{value:record['CustomerCd']['value']}};
	    	
			queryObj["records"].push(partObj);
	    }
		return queryObj;
	},
	
	_updateLookup: function(queryObj) {
		var putparams = queryObj;

		// CSRFトークンの取得
		var token = kintone.getRequestToken();
		putparams["__REQUEST_TOKEN__"] = token; 
		
		// 同期リクエストを行う
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('PUT', kintone.api.url('/k/v1/records'), false);
		xmlHttp.setRequestHeader('Content-Type', 'application/json');
		xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');

		xmlHttp.send(JSON.stringify(putparams));
		if (xmlHttp.status == 200){
			var obj = JSON.parse(xmlHttp.responseText);
			this.message = xmlHttp.status + '：更新に成功しました。';
			return true;
		} else {
			this.message = xmlHttp.status + '：更新エラー';
			return false;
		}
	}
	
}