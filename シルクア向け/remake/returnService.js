/* returnService.js */

var ReturnService = function(record) {
	this._init(record);
};

ReturnService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;
		this.tableRecords = record['TABEL']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strReturnDate = record['ReturnDate']['value'];
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
	/* 返却管理用の伝票番号採番            */
	/***************************************/
	getReturnNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('ReturnDate' , 'ReturnNumber' , _SILPNUM.RETURN , this.strReturnDate )){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoReturnNumber: function() {
		return this.commonService.getSlipNumber();
	},

	/***************************************/
	/* 入出庫履歴の登録                    */
	/***************************************/
	postNyusyutu: function(autoReturnNumber) {
		// 変数初期化
		var cntNyusyutu = 0;
		
		// 基準番号を取得
		if (this.commonService.fncMakeIdoNumber(this.strReturnDate)) {
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
			partObj["IdoNumber"] = {value: this.commonService.fncGetIdoNumber(this.strReturnDate , cntNyusyutu)};	// 入出庫番号
			partObj["IdoDate"] = {value: this.commonService.fncGetFormatDate(this.strReturnDate , "YYYY-MM-DD")};	// 入出庫日
			
			partObj["IdoKbn"] = {value: _IDOKBN.NYUKO};	// 移動区分
			partObj["IdoReason"] = {value: _IDORSN.RETURN};	// 移動理由
			
			partObj["SlipNumber"] = {value: autoReturnNumber};						// 伝票番号
			
			partObj["CustomerCdLU"] = {value: this.record['DeliveryCodeLU']['value']};	// 顧客コード
			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
			partObj["ItemCdLU"] = {value: this.tableRecords[i].value['ItemCdLU'].value};	//商品コード

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
		return _SILPNUM.NST + this.commonService.fncGetYmd(this.strReturnDate) + ('00000' + nyusyutuNo).slice(-5);
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
			var resVal = this.commonService.fncItemCheck(updateItemCd , this.strReturnDate);
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

			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	// 倉庫コード

			partObj["ConditionKbn"] = {value: _CONDKBN.WHA};	// 状態区分
			
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
