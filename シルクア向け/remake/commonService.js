/* commonService.js */

var CommonService = function() {
	this._init();
};

CommonService.prototype = {
	_init: function() {
		// 初期化
		
		// 変数セット
		
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
	getJsonObj: function() {
	  return this.jsonObj;
	},
	getRecNo: function() {
	  return this.recNo;
	},
	getKeyVal: function() {
	  return this.keyVal;
	},
	
	/***************************************/
	/* API関連                             */
	/***************************************/
	/**
	 * データ取得用ＡＰＩ実行
	 * @param apiUrl API実行URLを設定
	 * @return {boolean} 
	 */
	fncGetRecords: function(apiUrl) {
		return this._fncExecutApi("GET", apiUrl , null);
	},
	/**
	 * データ登録ＡＰＩ実行（単行)
	 * @param param パラメーターを設定
	 * @return {boolean} 
	 */
	fncPostRecord: function(param) {
		return this._fncExecutApi("POST", kintone.api.url('/k/v1/record') ,param);
	},
	/**
	 * データ登録ＡＰＩ実行（複数行)
	 * @param param パラメーターを設定
	 * @return {boolean} 
	 */
	fncPostRecords: function(param) {
		return this._fncExecutApi("POST", kintone.api.url('/k/v1/records') ,param);
	},
	/**
	 * データ更新用ＡＰＩ実行（単行)
	 * @param param パラメーターを設定
	 * @return {boolean} 
	 */
	fntPutRecord: function(param) {
		return this._fncExecutApi("PUT", kintone.api.url('/k/v1/record') ,param);
	},
	_fncExecutApi: function(name , url , param) {

		var xmlHttp = new XMLHttpRequest();
		// 同期リクエストを行う
		xmlHttp.open(name, url, false);
		if (name != "GET"){
			xmlHttp.setRequestHeader('Content-Type', 'application/json');
		}
		xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
		if (param != null) {
			// CSRFトークンの取得
			var token = kintone.getRequestToken();
			param["__REQUEST_TOKEN__"] = token; 
			
			xmlHttp.send(JSON.stringify(param));
		} else {
			xmlHttp.send(null);
		}
		

		if (xmlHttp.status == 200){
		    if(window.JSON){
		        this.status = _STATUS.OK;
		        this.jsonObj = xmlHttp.responseText;
		        return true;
		    } else {
		        this.status = _STATUS.WARNING;
		        this.message = xmlHttp.statusText;
		        return false;
		    }
		} else {
		    this.status = _STATUS.ERROR;
		    this.message = '登録に失敗しました。';
		    return false;
		}
	},

	/***************************************/
	/* 共通系関連                          */
	/***************************************/
	fncGetMaxNumber: function(jsonObj , keyVal , cutNum) {
		var obj = JSON.parse(jsonObj);
		this.recNo = 1;
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
	fncGetKeyVal: function(jsonObj , keyVal) {
		var obj = JSON.parse(jsonObj);
		this.keyVal = '';
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
	fncIsExistence: function(jsonObj) {
		var obj = JSON.parse(jsonObj);
		if (obj.records[0] != null){
			return true;
		} else {
			return false;
		}
	},
	/***************************************/
	/* 文字変換                            */
	/***************************************/
	// 産地名称（略称）変換関数
	fncGetLocalNm: function(strLocality) {
		return strLocality.slice(strLocality.lastIndexOf("(") + 1 , strLocality.lastIndexOf("(") + 4);
	},
	// 形状変換（名称⇒コード）関数
	fncGetShapeCd: function(strShape) {
		switch (strShape) {
			case '長方形':
				var strShapeCd = "1";break;
			case '正方形':
				var strShapeCd = "2";break;
			case '円形':
				var strShapeCd = "3";break;
			case '楕円形':
				var strShapeCd = "4";break;
			case '八角形':
				var strShapeCd = "5";break;
			case 'その他':
				var strShapeCd = "6";break;
			default:
				var strShapeCd = "E";break;
		};
		
		return strShapeCd;
	},
	// 倉庫コード変換（コード⇒略コード）関数
	fncGetWarehouseCd: function(strWarehouseCd) {
		switch (strWarehouseCd.slice(0, 2)) {
			case 'WH':
				var strGetWarehouseCd = "M";break;
			case 'WS':
				var strGetWarehouseCd = "A";break;
			default:
				var strGetWarehouseCd = "O";break;
		};
		
		return strGetWarehouseCd;
	},
	// 倉庫区分（名称⇒コード）変換関数
	fncGetWarehouseKbnCd: function(strWarehouseKbn) {
		switch (strWarehouseKbn) {
			case '自社倉庫':
				var strWarehouseCd = "WH";break;
			case 'ショールーム':
				var strWarehouseCd = "WS";break;
			default:
				var strWarehouseCd = "WZ";break;
		};
		
		return strWarehouseCd;
	},
	// 場所区分（名称⇒コード）変換関数
	fncGetSpaceKbnCd: function(strSpaceKbn) {
		switch (strSpaceKbn) {
			case '自社倉庫':
				var strSpaceCd = "W";break;
			case 'ショールーム':
				var strSpaceCd = "S";break;
			case 'デパート':
				var strSpaceCd = "D";break;
			case '催事場':
				var strSpaceCd = "E";break;
			case '卸倉庫':
				var strSpaceCd = "G";break;
			default:
				var strSpaceCd = "Z";break;
		};
		
		return strSpaceCd;
	},
	// 顧客区分（名称⇒コード）変換関数
	fncGetCustomerKbnCd: function(strCustomerKbn) {
		switch (strCustomerKbn) {
			case '納入先':
				var strCustomerCd = "D";break;
			case '仕入先':
				var strCustomerCd = "P";break;
			case '購入先':
				var strCustomerCd = "C";break;
			default:
				var strCustomerCd = "Z";break;
		};
		
		return strCustomerCd;
	},
	// エリア区分（略称）変換関数
	fncGetAreaCd: function(strAreaKbn) {
		return strAreaKbn.slice(0 , 2);
	},
	// 年月変換関数
	fncGetYmd: function(strDate) {
		var v1 = moment(new Date(strDate));
		return v1.format("YYYYMM");
	}

}
