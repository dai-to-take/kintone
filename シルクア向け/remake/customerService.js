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

		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strCustomerKbn = this.record['CustomerKbn']['value'];
		this.strAreaKbn = this.record['AreaKbn']['value'];
	},

	getMessage: function() {
	  return this.message;
	},
	
	/***************************************/
	/* 顧客コードの採番                    */
	/***************************************/
	getCustomerCd: function(keyVal) {
		// クエリー作成
		var wQuery = 'CustomerKbn in ("' + this.strCustomerKbn+ '") and AreaKbn in ("' + this.strAreaKbn + '") order by CustomerCd limit 1';
		// API実行
		if (this.commonService.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規CustomerCdを取得
			if (this.commonService.fncGetMaxNumber(jsonObj,'CustomerCd',-5)){
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
	getAutoCustomerCd: function() {
		return this.commonService.fncGetCustomerKbnCd(this.strCustomerKbn) + 
					this.commonService.fncGetAreaCd(this.strAreaKbn) + 
						('00000' + this.commonService.getRecNo()).slice(-5);
	},
	
	/***************************************/
	/* 在庫管理のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteStock: function() {
		this.query = 'SpaceCd = "' + this.strSpaceCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.STOCK;
	},
	
	/***************************************/
	/* 入出庫管理のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteNyusyutu: function() {
		this.query = 'SpaceCd = "' + this.strSpaceCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.NYUSYUTU;
	},
	
	/***************************************/
	/* 商品のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteItem: function() {
		this.query = 'SpaceCd = "' + this.strSpaceCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.ITEM;
	},
	
	/***************************************/
	/* メンテナンス処理                    */
	/***************************************/
	putMainte: function() {
	
		var records = new Array();
		var loopendflg = false;
		var offset = 0;
		
		while(!loopendflg){
			// クエリー作成
			var workQuery = this.query  + offset;
			// 同期リクエストを行う
			if (this.commonService.fncGetRecords(this.otherAppId , workQuery)){
				this.message = '場所コードのメンテナンスに失敗しました。';
				return false;
			}
		
			//取得したレコードをArrayに格納
			var respdata = JSON.parse(this.commonService.getJsonObj());
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
			if (! this.commonService.fntPutRecords(queryObj)){
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
	}
	
}