/* deliveryService.js */

var DeliveryService = function(record) {
	this._init(record);
};

DeliveryService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;
		this.tableRecords = record['TABEL']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strDeliveryDate = record['DeliveryDate']['value'];
		
		// クリエリー作成
		this.deliveryDate = moment(this.strDeliveryDate);
		// 開始終了年を生成
		this.startDate = moment(new Date(this.deliveryDate.year() , this.deliveryDate.month(), '1'));
		this.endDate = moment(new Date(this.deliveryDate.year() , this.deliveryDate.month() + 1 , '1'));
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
	/* 納入管理-伝票番号 の 採番用初期処理 */
	/***************************************/
	initDelivery: function() {
		// 初期化
		// クリエリー作成
		this.query = 'DeliveryDate >= "' + this.startDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" and DeliveryDate <"' + this.endDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]") + '" order by DeliveryNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
	},
	
	/***************************************/
	/* 納入管理用の伝票番号採番            */
	/***************************************/
	getDeliveryNumber: function() {
		
		if (this.commonService.fncGetRecords(this.apiUrl)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規DeliveryNumberを取得
			if (this.commonService.fncGetMaxNumber(jsonObj,'DeliveryNumber',-3)){
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
	getAutoDeliveryNumber: function() {
		return _SILPNUM.DELV + this.commonService.fncGetYmd(this.strDeliveryDate) + ('000' + this.commonService.getRecNo()).slice(-3);
	},

	/***************************************/
	/* 入出庫履歴 の 登録用初期処理        */
	/***************************************/
	initNyuSyutu: function() {
		// 初期化
		// クリエリー作成
		this.query = 'IdoDate >= "' + this.startDate.format("YYYY-MM-DD") + '" and IdoDate <"' + this.endDate.format("YYYY-MM-DD") + '" order by IdoNumber limit 1';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.IDO + '&query=' + encodeURI(this.query);
	},
	/***************************************/
	/* 入出庫履歴の登録                    */
	/***************************************/
	postNyusyutu: function(autoDeliveryNumber) {
		// 変数初期化
		var cntNyusyutu = 0;
		
		// 取得
		if (this.commonService.fncGetRecords(this.apiUrl)){
			var jsonObj = this.commonService.getJsonObj();
			// IdoNumberから初期値を取得
			if (this.commonService.fncGetMaxNumber(jsonObj,'IdoNumber' , -5)){
				// 初期値を取得
				cntNyusyutu  = this.commonService.getRecNo();
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
			partObj["IdoNumber"] = {value: this._getAutoIdoNumber(cntNyusyutu)};	// 入出庫番号
			partObj["IdoDate"] = {value: this.deliveryDate.format("YYYY-MM-DD")};	// 入出庫日
			
			partObj["IdoKbn"] = {value: _IDOKBN.SYUKO};	// 移動区分
			partObj["IdoReason"] = {value: _IDORSN.DELV};	// 移動理由
			
			partObj["SlipNumber"] = {value: autoDeliveryNumber};						// 伝票番号
//			partObj["DeliveryNumberLU"] = {value: autoDeliveryNumber};	// 伝票番号
			
			partObj["CustomerCdLU"] = {value: this.record['DeliveryCodeLU']['value']};	// 顧客コード
			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
			partObj["ItemCdLU"] = {value: this.tableRecords[i].value['ItemCdLU'].value};	//商品コード
			partObj["Price"] = {value: this.tableRecords[i].value['DeliveryPrice'].value};	//価格

			queryObj["records"].push(partObj);
			
			cntNyusyutu++;
		}
		
		if (this.commonService.fncPostRecords(queryObj)){
			this.message = '入出庫履歴が登録されました';
			return true;
		} else {
			this.message = '入出庫履歴の登録が失敗しました';
			return false;
		}
	},
	_getAutoIdoNumber: function(nyusyutuNo) {
		return _SILPNUM.NST + this.commonService.fncGetYmd(this.strDeliveryDate) + ('00000' + nyusyutuNo).slice(-5);
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
		this.query = 'ItemCdLU = "' + updateItemCd + '" and IdoDate > "' + this.deliveryDate.format("YYYY-MM-DD[T]HH:mm:ss[Z]")  + '"';
		// API用URL作成
		this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ _APPID.IDO + '&query=' + encodeURI(this.query);
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
			if (this.commonService.fncGetRecords(this.apiUrl)){
				var jsonObj = this.commonService.getJsonObj();
				if (this.commonService.fncIsExistence(jsonObj)){
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
			if (this.commonService.fncGetRecords(this.apiUrl)){
				var jsonObj = this.commonService.getJsonObj();
				if (this.commonService.fncGetKeyVal(jsonObj,'$id')){
					itemCdId = this.commonService.getKeyVal();
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

			partObj["DeliveryCodeLU"] = {value: this.record['DeliveryCodeLU']['value']};	// 納入先コード
			partObj["DeliveryPrice"] = {value: this.tableRecords[i].value['DeliveryPrice'].value};	// 価格

			partObj["ConditionKbn"] = {value: _CONDKBN.DELV};	// 状態区分
			
			// 更新実行
			if (this.commonService.fntPutRecord(queryObj)){
				this.message = '商品マスタが更新されました';
			} else {
				this.message = '商品マスタの更新が失敗しました';
				return false;
			}
		}
		return true;
	}
}
