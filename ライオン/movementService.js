/* movementService.js */

var MovementService = function(record) {
	this._init(record);
};

MovementService.prototype = {
	_init: function(record) {
		// 初期化
		this.record = record;
		this.tableRecords = record['ItemTable']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
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
	/* 移動履歴登録                        */
	/***************************************/
	fncPostMovement: function(SlipKbn , ReferenceDate , SlipNumber) {
		// 変数初期化
		var cntNyusyutu = 0;
		
		// 移動履歴登録
		// 基準番号を取得
		if (this.commonService.fncMakeIdoNumber(ReferenceDate)) {
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
			queryObj["record"] = partObj;

			// 伝票種別によって変更
			switch (SlipKbn) {
				case _SILPNUM.PURCH:
					var strIdoKbn = _IDOKBN.NYUKO;
					var strIdoReason = _IDORSN.PURCH;
					var strCustomerCdLU = this.record['PurchaseCdLU']['value'];
					var strPrice = this.tableRecords[i].value['PurchasePrice'].value;
					break;
				case _SILPNUM.DELV:
					var strIdoKbn = _IDOKBN.SYUKO;
					var strIdoReason = _IDORSN.DELV;
					var strCustomerCdLU = this.record['DeliveryCdLU']['value'];
					var strPrice = this.tableRecords[i].value['DeliveryPrice'].value;
					break;
				case _SILPNUM.SELL:
					break;
				case _SILPNUM.RETURN:
					break;
				default:
					this.message = '移動履歴の登録が失敗しました';
					return false;
			};
			
			// パラメータ作成
			partObj["IdoNumber"] = {value: this.commonService.fncGetIdoNumber(ReferenceDate , cntNyusyutu)};	// 移動番号
			partObj["IdoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 移動日
			
			partObj["IdoKbn"] = {value: strIdoKbn};	// 移動区分
			partObj["IdoReason"] = {value: strIdoReason};	// 移動理由
			
			partObj["SlipNumber"] = {value: SlipNumber};	// 伝票番号
			
			partObj["CustomerCdLU"] = {value: strCustomerCdLU};	// 顧客コード
			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
			
			partObj["ItemCdLU"] = {value: this.tableRecords[i].value['ItemCdLU'].value};	//商品コード
			partObj["Price"] = {value: strPrice};	//価格
			
		
			queryObj["records"].push(partObj);
			
			cntNyusyutu++;
		}
		
		if (this.commonService.fncPostRecord(queryObj)){
			this.message = '移動履歴が登録されました';
			return true;
		} else {
			this.message = '移動履歴の登録が失敗しました';
			return false;
		}
	},
	
	/***************************************/
	/* 商品の更新                          */
	/***************************************/
	fncPutItem: function(SlipKbn , ReferenceDate) {
		// 変数初期化
		for (var i = 0; i < this.tableRecords.length; i++) {
			var updateItemCd = this.tableRecords[i].value['ItemCdLU'].value;
			var itemCdId = null;
			
			// 商品チェック
			var resVal = this.commonService.fncItemCheck(updateItemCd , ReferenceDate);
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

			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
			
			
			// 伝票種別によって変更
			switch (SlipKbn) {
				case _SILPNUM.PURCH:
					partObj["PurchaseCdLU"] = {value: this.record['PurchaseCdLU']['value']};	// 仕入先コード
					partObj["PurchasePrice"] = {value: this.tableRecords[i].value['PurchasePrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.WHA};	// 状態区分
					break;
				case _SILPNUM.DELV:
					partObj["DeliveryCdLU"] = {value: this.record['DeliveryCdLU']['value']};	// 納入先コード
					partObj["DeliveryPrice"] = {value: this.tableRecords[i].value['DeliveryPrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.DELV};	// 状態区分
					break;
				case _SILPNUM.SELL:
					break;
				case _SILPNUM.RETURN:
					break;
				default:
					this.message = '移動履歴の登録が失敗しました';
					return false;
			};
			
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
