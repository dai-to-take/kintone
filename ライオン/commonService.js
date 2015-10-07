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
	
	getSlipNumber: function() {
	  return this.slipNumber;
	},
	getRecordData: function() {
	  return this.recordData;
	},
	/***************************************/
	/* API関連                             */
	/***************************************/
	/**
	 * データ取得用ＡＰＩ実行
	 * @param appId 
	 * @param query 
	 * @return {boolean} 
	 */
	fncGetRecords: function(appId , query) {
		apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ appId + '&query=' + encodeURI(query);
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
	/**
	 * データ更新用ＡＰＩ実行（複数)
	 * @param param パラメーターを設定
	 * @return {boolean} 
	 */
	fntPutRecords: function(param) {
		return this._fncExecutApi("PUT", kintone.api.url('/k/v1/records') ,param);
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
	/* 伝票採番関連                        */
	/***************************************/
	fncMakeSlipNumber: function(DateName , SlipNumName , SlipKbn ,  ReferenceDate , Office ) {
		// クエリー作成
		var wQuery = DateName + ' >= "' + this.fncGetStartDate(ReferenceDate).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + 
				'" and ' + DateName + ' <"' + this.fncGetEndDate(ReferenceDate).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + 
				'" and Office in ("' + Office + '") order by ' + SlipNumName + ' limit 1';
		
		// API実行
		if (this.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.getJsonObj();
			// 新規SlipNumberを取得
			if (this.fncGetMaxNumber(jsonObj,SlipNumName,-3)){
				this.slipNumber = SlipKbn + this.fncGetOffice(Office) + this.fncGetYmd(ReferenceDate) + ('0000' + this.getRecNo()).slice(-4);
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
	fncMakeIdoNumber: function(ReferenceDate) {
		// クエリー作成
		var wQuery = 'IdoDate >= "' + this.fncGetStartDate(ReferenceDate).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + 
				'" and IdoDate <"' + this.fncGetEndDate(ReferenceDate).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by IdoNumber limit 1';
		
		// API実行
		if (this.fncGetRecords(_APPID.IDO , wQuery)){
			var jsonObj = this.getJsonObj();
			// 新規DeliveryNumberを取得
			if (this.fncGetMaxNumber(jsonObj,'IdoNumber' , -5)){
				this.message = '基準番号が取得できました';
				return true;
			} else {
				this.message = '基準番号が取得できません。';
				return false;
			}
		}else {
			this.message = '基準番号が取得できません。';
			return false;
		}
		
	},
	fncGetIdoNumber: function(ReferenceDate , ReferenceNumber) {
	  return _SILPNUM.NST + this.fncGetYmd(ReferenceDate) + ('00000' + ReferenceNumber).slice(-5);
	},
	/***************************************/
	/* 日付関連関数                        */
	/***************************************/
	fncGetStartDate: function(ReferenceDate) {
		var referenceDate = moment(ReferenceDate);
		// 該当月の開始日を生成
		return moment(new Date(referenceDate.year() , referenceDate.month(), '1'));
	},
	fncGetEndDate: function(ReferenceDate) {
		var referenceDate = moment(ReferenceDate);
		// 該当月の終了日を生成
		return moment(new Date(referenceDate.year() , referenceDate.month() + 1 , '1'));
	},
	fncGetFormatDate: function(ReferenceDate , Format) {
		var referenceDate = moment(ReferenceDate);
		// フォーマット変換
		return referenceDate.format(Format);
	},
	
	/***************************************/
	/* 入力チェック                        */
	/***************************************/
	// 処理日より未来での変更があるか?
	fncItemCheck: function(ItemCd , ReferenceDate) {
		// クエリー作成
		var wQuery = 'ItemCdLU = "' + ItemCd + '" and IdoDate > "' + this.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD[T]HH:mm:ss[Z]")  + '"';
		// 今回の処理日より未来での変更があるか？
		if (this.fncGetRecords(_APPID.IDO , wQuery)){
			var jsonObj = this.getJsonObj();
			if (this.fncIsExistence(jsonObj)){
				return _CHECK.YES;
			} else {
				return _CHECK.NO;
			}
		} else {
			this.message = '商品チェックが失敗しました。';
			return _CHECK.ERROR;
		}
	},
	// 移動履歴の存在チェック
	fncIdoCheck: function(SlipNumber) {
		// クエリー作成
		var wQuery = 'SlipNumber = "' + SlipNumber + '"';
		// すでに登録済みか？
		if (this.fncGetRecords(_APPID.IDO , wQuery)){
			var jsonObj = this.getJsonObj();
			if (this.fncIsExistence(jsonObj)){
				this.message = 'すでに移動履歴に展開済みです。';
				return _CHECK.YES;
			} else {
				return _CHECK.NO;
			}
		} else {
			this.message = '商品チェックが失敗しました。';
			return _CHECK.ERROR;
		}
	
	},
	/***************************************/
	/* アプリデータの取得                  */
	/***************************************/
	// キー固定
	fncGetRecordDataKey: function(AppId , KeyName , KeyData) {
		var wQuery = KeyName + ' = "' + KeyData + '" limit 1';
		if (! this.fncGetRecords(AppId , wQuery)){
			this.message = '対象情報が取得できません。';
			return false;
		}
		return true;
	},
	// クエリ―作成
	fncGetRecordDataQry: function(AppId , Query ) {
		var wQuery = Query + ' limit 1';
		// 対象商品の$idを取得
		if (! this.fncGetRecords(AppId , wQuery)){
			this.message = '対象情報が取得できません。';
			return false;
		}
		return true;
	},
	// キーから取得
	fncSetKeyData: function(GetKeyName ) {
		var jsonObj = this.getJsonObj();
		if (this.fncGetKeyVal(jsonObj,GetKeyName)){
			this.recordData = this.getKeyVal();
			return true;
		} else {
			this.message = '対象キー情報が取得できません。';
			return false;
		}
	},
	/***************************************/
	/* 共通系                              */
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
	// 事業所（名称⇒コード）変換関数
	fncGetOffice: function(strOffice) {
		switch (strOffice) {
			case 'ライオンラグス':
				var strOfficeCd = "L";break;
			case 'シルクラアジア':
				var strOfficeCd = "S";break;
			default:
				var strOfficeCd = "Z";break;
		};
		
		return strOfficeCd;
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
	// ロケーション区分（名称⇒コード）変換関数
	fncGetLocationCd: function(strLocationKbn) {
		switch (strLocationKbn) {
			case '納入先':
				var strLocationCd = "D";break;
			case '仕入先':
				var strLocationCd = "P";break;
			case '購入先':
				var strLocationCd = "C";break;
			case '倉庫':
				var strLocationCd = "W";break;
			default:
				var strLocationCd = "Z";break;
		};
		
		return strLocationCd;
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
