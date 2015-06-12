/* itemService.js */

ItemService = function(record) {
	this._init(record);
};
ItemService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		
		this.record = record;

		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strLocality = this.record['Locality']['value'];
		this.strShape = this.record['Shape']['value'];
		
		this.strWarehouseCd =  this.record['WarehouseCdLU']['value'];
		this.strWarehouseKbn =  this.record['WarehouseKbnLU']['value'];
		
		this.strItemCd =  this.record['ItemCd']['value'];
	},
	
	/***************************************/
	/* getter                              */
	/***************************************/
	getMessage: function() {
	  return this.message;
	},
	
	/***************************************/
	/* 商品コード用の伝票番号採番            */
	/***************************************/
	getItemCd: function() {
		// クエリー作成
		var wQuery = 'Locality in ("' + this.strLocality + '") and WarehouseKbnLU = "' + this.strWarehouseKbn + '" order by ItemCd limit 1';
		if (this.commonService.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規ItemCdを取得
			if (this.commonService.fncGetMaxNumber(jsonObj,'ItemCd',-4)){
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
	getAutoItemCd: function() {
		return this.commonService.fncGetWarehouseCd(this.strWarehouseCd) + 
			this.commonService.fncGetLocalNm(this.strLocality) + 
				('0000' + this.commonService.getRecNo()).slice(-4);
	},
	
	/***************************************/
	/* 在庫管理のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteStock: function() {
		this.query = 'ItemCd in ("' + this.strItemCd + '") order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.STOCK;
	},
	/***************************************/
	/* 入出庫管理のメンテナンス処理用初期処理 */
	/***************************************/
	initMainteNyusyutu: function() {
		this.query = 'ItemCd = "' + this.strItemCd + '" order by レコード番号 asc limit 100 offset ';
		
		this.otherAppId = _APPID.NYUSYUTU;
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
				this.message = '商品コードのメンテナンスに失敗しました。';
				return false;
			}
		
			//取得したレコードをArrayに格納
			var respdata = JSON.parse(this.commonService.getJsonObj());
			if(respdata.records.length > 0){
				for(var i = 0; respdata.records.length > i; i++){
					records.push(respdata.records[i]);
				}
				offset += respdata.records.length;
			}else{
				loopendflg = true;
			}
		}
		
		//パラメータ作成
		var queryObj = new Object();
		if (this.otherAppId == _APPID.STOCK){
			queryObj = this._getQueryObjStock(records);
		} else {
			queryObj = this._getQueryObjNyusyutu(records);
		}
		
		if(records.length > 0){
			if (! this.commonService.fntPutRecords(queryObj)){
				return false;
			}
		}
		
		return true;
	},
	
	_getQueryObjStock: function(records) {
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

			//商品テーブルパラメータを作成する。
			var ItemTable = new Array();
			ItemTable = record.TABEL.value;
			var tableValueObj = new Object();
			tableValueObj["value"] = new Array();
			//テーブルの要素分回す。
			for (var j = 0; j < ItemTable.length; j++){
				var tableValue = ItemTable[j]
				var tablePartObj = new Object();
				//商品コードを上書きする。
				tablePartObj["value"] = {id:tableValue.id,value:{ItemCd:{value:tableValue.value.ItemCd.value}}};
				tableValueObj["value"].push(tablePartObj["value"]);
			}
	    	partObj["record"] = {TABEL:{value:tableValueObj["value"]}};
			queryObj["records"].push(partObj);
	    }
		return queryObj;
	},
	
	_getQueryObjNyusyutu: function(records) {
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

    		partObj["record"] = {ItemCd:{value:record['ItemCd']['value']}};
	    	
			queryObj["records"].push(partObj);
	    }
		return queryObj;
	}
}

