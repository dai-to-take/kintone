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
	getConditionKbn: function() {
	  return this.conditionKbn;
	},
	getCurrentCdLU: function() {
	  return this.currentCdLU;
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
		var wQuery = DateName + ' >= "' + this.fncGetStartNen(ReferenceDate , Office ).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + 
				'" and ' + DateName + ' <"' + this.fncGetEndNen(ReferenceDate , Office ).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + 
				'" and Office in ("' + Office + '") order by ' + SlipNumName + ' desc limit 1';
		// API実行
		if (this.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.getJsonObj();
			var strNend = ('00' + this.funGetNendo(ReferenceDate , Office)).slice(-2);
			// 新規SlipNumberを取得
			if (this.fncGetMaxNumber(jsonObj , SlipNumName , _DIGITS.SLIPNUM_S , _DIGITS.SLIPNUM_E)){
				this.slipNumber = SlipKbn + this.fncGetOffice(Office) + strNend + ('0000' + this.getRecNo()).slice(-4);
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
				'" and IdoDate <"' + this.fncGetEndDate(ReferenceDate).format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by IdoNumber desc limit 1';

		// API実行
		if (this.fncGetRecords(_APPID.IDO , wQuery)){
			var jsonObj = this.getJsonObj();
			// 新規SlipNumberを取得
			if (this.fncGetMaxNumber(jsonObj , 'IdoNumber' , _DIGITS.IDONUM_S , _DIGITS.IDONUM_E)){
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
	  return _SILPNUM.NST + this.fncGetFormatDate(ReferenceDate , 'YYMM') + ('0000' + ReferenceNumber).slice(-4);
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
	
	fncGetStartNen: function(ReferenceDate , strOffice) {
		var referenceDate = moment(ReferenceDate);
		// 該当月から年の開始日を生成
		if (this.fncGetOffice(strOffice) == _OFFICE.LION){
			var refYear = _OFFICEYEAR.LION;
		} else {
			var refYear = _OFFICEYEAR.SILK;
		}
		return moment(new Date(this.funGetNendo(ReferenceDate , strOffice) , refYear , '1'));
	},
	fncGetEndNen: function(ReferenceDate , strOffice) {
		var referenceDate = moment(ReferenceDate);
		// 該当月の年の終了日を生成
		if (this.fncGetOffice(strOffice) == _OFFICE.LION){
			var refYear = _OFFICEYEAR.LION;
		} else {
			var refYear = _OFFICEYEAR.SILK;
		}
		return moment(new Date(this.funGetNendo(ReferenceDate , strOffice) + 1 , refYear , '1'));
	},
	
	funGetNendo: function(ReferenceDate ,strOffice) {
		var referenceDate = moment(ReferenceDate);
		// 年度を取得
		y = parseInt(referenceDate.year());
		m = parseInt(referenceDate.month());
		
		if (this.fncGetOffice(strOffice) == _OFFICE.LION){
			if ((m >= _OFFICEYEAR.LION ) && ( m <= 11)) return y; else return y-1;
		} else {
			if ((m >= _OFFICEYEAR.SILK ) && ( m <= 11)) return y; else return y-1;
		}
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
	
	fncCurrentCheck: function(ItemCdLU) {
		// クエリー作成
		var wQuery = 'ItemCd = "' + ItemCdLU + '" limit 1';
		
		if (this.fncGetRecords(_APPID.ITEM , wQuery)){
			var jsonObj = this.getJsonObj();
			var obj = JSON.parse(jsonObj);
			if (obj.records[0] != null){
				try{
					var strGetVal = '';
					for ( var keyA in obj.records ) {
						for ( var keyB in obj.records[keyA] ) {
							if (keyB == 'CurrentCdLU'){
								this.currentCdLU = obj.records[keyA][keyB].value;
								
							}else if (keyB == 'ConditionKbn'){
								this.conditionKbn = obj.records[keyA][keyB].value;
								
							}
						}
					}
				} catch(e){
					this.message = '商品コードが取得できません。';
					return false;
				}
			//商品コードと所在コードの組み合わせが合っているか？
			//if (this.fncIsExistence(jsonObj)){
				//this.message = '対象の商品が取得できました';
				//return true;
			}else {
				this.message = '対象の商品が取得できません。';
				return false;
			}
		}else {
			this.message = '対象の商品が取得できません。';
			return false;
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
	fncGetMaxNumber: function(jsonObj , keyVal , cutNumS , cutNumE) {
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

				this.recNo = parseInt(strGetVal.slice(cutNumS ,cutNumE),10) +1;
				
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
	/* バーコード処理                              */
	/***************************************/
	fncGetBarcodeText: function() {
		// バーコード入力用項目を設定
		var myBarcodeText = document.createElement('input');
		myBarcodeText.type = "text";
		myBarcodeText.id = 'my_barcode_text';
		myBarcodeText.name = 'my_barcode_text';
		myBarcodeText.placeholder="バーコード専用"
		myBarcodeText.style.imeMode = "disabled";
		myBarcodeText.value = '';
		myBarcodeText.onfocus = function(evt) {
			var element = document.getElementById('my_barcode_text'); 
			element.style.backgroundColor = "#F4A460";
			//if(element.value.length==0){
			//	if(evt.which=="229" || evt.which=="0"){
			//		var werrmsg="日本語入力モードになっています。英数字入力エリアです。";
			//		alert(werrmsg);
			//		return true;
			//	}
			//}
		};
		myBarcodeText.onblur = function() {
			var element = document.getElementById('my_barcode_text'); 
			element.style.backgroundColor = "#FFFFFF";
		};
//		myBarcodeText.oninput = function() {
//			var element = document.getElementById('my_barcode_text'); 
//			if(element.value.match(/[^0-9a-zA-Z]/)) {
//				alert('半角英数字以外の文字が含まれています。');
//				return;
//			}
//		};
		myBarcodeText.onkeydown = function() {
			// 入力都度取得
			var element = document.getElementById('my_barcode_text'); 
			
			
			if (event.keyCode == 13 && _DIGITS.ITEMLENG1 <= element.value.length && element.value.length <= _DIGITS.ITEMLENG2 ) {
				// 商品コードと同じ桁数の場合のみテーブルに追加
				var rec = kintone.app.record.get();
				var record = rec.record;
				var tableRecords = record.ItemTable.value;
				
				try{
					// 現在最大明細行を取得
					var maxRec = tableRecords.length;
					
					var maxObject = tableRecords[maxRec-1];

					// 最大明細行の入力を値を取得
					var maxValue = maxObject['value']['ItemCdLU'].value;

					if (maxValue == element.value) {
						// 何もしない
					} else if (maxValue == null) {
						// 最大明細行が空白の場合は、該当行の入力値をセット
						maxObject['value']['ItemCdLU'].value = element.value;
						maxObject['value']['ItemPrice'].value = 0;
					} else {
						// 最大明細行に入力がある場合は
						// 最大明細行コピー元として１明細追加
						var copyObject = $.extend(true, {}, tableRecords[maxRec-1]);
						for ( var keyB in copyObject['value'] ) {
							copyObject['value'][keyB].value = undefined;
						}
						copyObject['value']['ItemCdLU'].value = element.value;
						copyObject['value']['ItemPrice'].value = 0;

						// 最終行に追加
						tableRecords.push(copyObject);
					}
				} catch(e){
					return false;
				}
				
				// バード領域を初期化
				element.value = '';
				
				// 画面へ反映
				kintone.app.record.set(rec);
			}
			element.focus();
		};
		return myBarcodeText;
	},
	/***************************************/
	/* 事業所                              */
	/***************************************/
	// 担当事業所を取得
	fncGetTantoOffice: function() {
		// ログインユーザーを取得
		var user = kintone.getLoginUser();
		if (user.code in _USEROFFICE) {
			return _USEROFFICE[user.code];
		} else {
			return '';
		}
	},
	// 担当倉庫コードを取得
	fncGetTantoSouko: function() {
		// ログインユーザーを取得
		var user = kintone.getLoginUser();
		if (user.code in _USERSOUKO) {
			return _USERSOUKO[user.code];
		} else {
			return '';
		}
	},
	/***************************************/
	/* 文字変換                            */
	/***************************************/
	// 産地名称（略称）変換関数
	fncGetLocalNm: function(strLocality) {
		//産地を英語表記にする
		switch (strLocality) {
			case 'クム':
				var strLocality = "QUM";break;
			case 'タブリーズ':
				var strLocality = "TABRIZ";break;
			case 'イスファハン':
				var strLocality = "ESFAHAN";break;
			case 'カシャーン':
				var strLocality = "KASHAN";break;
			case 'ナイン':
				var strLocality = "NAIN";break;
			case 'アルデビル':
				var strLocality = "ARDABIL";break;
			case 'アフシャル':
				var strLocality = "AFSHAR";break;
			case 'バクティアリ':
				var strLocality = "BAKTIALI";break;
			case 'カシュガイ':
				var strLocality = "QASHQAI";break;
			case 'ケルマン':
				var strLocality = "KERMAN";break;
			case 'サルーク':
				var strLocality = "SAROUK";break;
			case 'シラーズ':
				var strLocality = "SHIRAZ";break;
			case 'セネ':
				var strLocality = "SENNAH";break;
			case 'バルーチ':
				var strLocality = "BALOUCH";break;
			case 'ビジャール':
				var strLocality = "BIDJAR";break;
			case 'ビルジャンド':
				var strLocality = "BIRJAND";break;
			case 'ベラミン':
				var strLocality = "VERAMIN";break;
			case 'マシャッド':
				var strLocality = "MASHHAD";break;
			case 'ヤズド':
				var strLocality = "YAZD";break;
			case 'その他':
				var strLocality = "OTH";break;
		};
		
		return strLocality.slice(0 , 3);
	},
	// 事業所（名称⇒コード）変換関数
	fncGetOffice: function(strOffice) {
		switch (strOffice) {
			case _OFFICENAME.LION:
				var strOfficeCd = _OFFICE.LION;break;
			case _OFFICENAME.SILK:
				var strOfficeCd = _OFFICE.SILK;break;
			default:
				var strOfficeCd = "ZZ";break;
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
			case '仕入先':
				var strLocationCd = "P";break;
			case '委託元':
				var strLocationCd = "E";break;
			case '出荷先':
				var strLocationCd = "D";break;
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
	},
	// 仕入先区分変換関数
	fncGetPurchaseKbn: function(strPurchaseKbn) {
		var strConsCd = '';

		if (strPurchaseKbn == _LOCAKBN.CONS) {
			strConsCd = 'E';
		};
		
		return strConsCd;
	}	

}
