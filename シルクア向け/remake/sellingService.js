/* sellingService.js */

var SellingService = function(record) {
	this._init(record);
};

SellingService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;
		this.tableRecords = record['TABEL']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strSellingDate = record['SellingDate']['value'];
		
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
	/* 売上管理の伝票番号採番            */
	/***************************************/
	getSellingNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('SellingDate' , 'SellingNumber' , _SILPNUM.SELL , this.strSellingDate )){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoSellingNumber: function() {
		return this.commonService.getSlipNumber();
	},

	/***************************************/
	/* 入出庫履歴の登録                    */
	/***************************************/
	postNyusyutu: function(autoSellingNumber) {
		// 変数初期化
		var cntNyusyutu = 0;
		
		// 基準番号を取得
		if (this.commonService.fncMakeIdoNumber(this.strSellingDate)) {
			// 初期値を取得
			cntNyusyutu  = this.commonService.getRecNo();
		} else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
		
		// JSONパラメータ作成
		var queryObj = new Object();
		queryObj["app"] = _APPID.IDO;
		queryObj["records"] = new Array();

		for (var i = 0; i < this.tableRecords.length; i++) {
			var partObj = new Object();
			partObj["IdoNumber"] = {value: this.commonService.fncGetIdoNumber(this.strSellingDate , cntNyusyutu)};	// 入出庫番号
			partObj["IdoDate"] = {value: this.commonService.fncGetFormatDate(this.strSellingDate , "YYYY-MM-DD")};	// 入出庫日
			
			partObj["IdoKbn"] = {value: _IDOKBN.SELL};	// 移動区分
			partObj["IdoReason"] = {value: _IDORSN.SELL};	// 移動理由
			
			partObj["SlipNumber"] = {value: autoSellingNumber};						// 伝票番号
			
			partObj["CustomerCdLU"] = {value: this.record['DeliveryCodeLU']['value']};	// 顧客コード
			partObj["ItemCdLU"] = {value: this.tableRecords[i].value['ItemCdLU'].value};	//商品コード
			partObj["Price"] = {value: this.tableRecords[i].value['SellingPrice'].value};	//価格

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
		return _SILPNUM.NST + this.commonService.fncGetYmd(this.strSellingDate) + ('00000' + nyusyutuNo).slice(-5);
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
			var resVal = this.commonService.fncItemCheck(updateItemCd , this.strSellingDate);
			if (resVal == _CHECK.YES) {
				// 未来の商品が存在した場合
				continue;
			} else if (resVal == _CHECK.ERROR) {
				this.message = '商品チェックが失敗しました。';
				return false;
			}

			// 商品ID取得
			if (this.commonService.fncGetRecordData(_APPID.ITEM , 'ItemCd' , updateItemCd , '$id' )) {
				itemCdId = this.commonService.getRecordData();
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
