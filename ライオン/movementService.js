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
					var strMotoLocationCdLU = this.record['PurchaseCdLU']['value'];
					var strSakiLocationCdLU = this.record['WarehouseCdLU']['value'];
					var strPrice = this.tableRecords[i].value['PurchasePrice'].value;
					break;
				case _SILPNUM.DELV:
					var strIdoKbn = _IDOKBN.SYUKO;
					var strIdoReason = _IDORSN.DELV;
					var strMotoLocationCdLU = this.record['WarehouseCdLU']['value'];
					var strSakiLocationCdLU = this.record['DeliveryCdLU']['value'];
					var strPrice = this.tableRecords[i].value['DeliveryPrice'].value;
					break;
				case _SILPNUM.SELL:
					var strIdoKbn = _IDOKBN.SELL;
					var strIdoReason = _IDORSN.SELL;
					var strMotoLocationCdLU = this.record['DeliveryCdLU']['value'];
					var strSakiLocationCdLU = '';
					var strPrice = this.tableRecords[i].value['SellingPrice'].value;
					break;
				case _SILPNUM.RETURN:
					var strIdoKbn = _IDOKBN.NYUKO;
					var strIdoReason = _IDORSN.RETURN;
					var strMotoLocationCdLU = this.record['CustomerCdLU']['value'];
					var strSakiLocationCdLU = this.record['WarehouseCdLU']['value'];
					var strPrice = 0;
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
			
			partObj["MotoLocationCdLU"] = {value: strMotoLocationCdLU};	// 移動元ロケーションコード
			partObj["SakiLocationCdLU"] = {value: strSakiLocationCdLU};	// 移動先ロケーションコード
			
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
			if (this.commonService.fncGetRecordDataKey(_APPID.ITEM , 'ItemCd' , updateItemCd)) {
				if (this.commonService.fncSetKeyData('$id')) {
					itemCdId = this.commonService.getRecordData();
				} else {
					this.message = '対象商品が取得できません。';
					return false;
				}
			} else {
				this.message = '対象商品が取得できません。';
				return false;
			}
			
			// 更新用パラメータを作成
			var queryObj = new Object();
			queryObj["app"] = _APPID.ITEM;
			queryObj["id"] = itemCdId;
			
			var partObj = new Object();
			queryObj["record"] = partObj;

			
			// 伝票種別によって変更
			switch (SlipKbn) {
				case _SILPNUM.PURCH:
					partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
					partObj["PurchaseCdLU"] = {value: this.record['PurchaseCdLU']['value']};	// 仕入先コード
					partObj["PurchasePrice"] = {value: this.tableRecords[i].value['PurchasePrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.WHA};	// 状態区分
					break;
				case _SILPNUM.DELV:
					partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
					partObj["DeliveryCdLU"] = {value: this.record['DeliveryCdLU']['value']};	// 納入先コード
					partObj["DeliveryPrice"] = {value: this.tableRecords[i].value['DeliveryPrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.DELV};	// 状態区分
					break;
				case _SILPNUM.SELL:
					// TODO 購入先の登録が後追い ⇒ 登録後の更新で上書きを想定
					partObj["SellingPrice"] = {value: this.tableRecords[i].value['SellingPrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.SELL};	// 状態区分
					break;
				case _SILPNUM.RETURN:
					partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
					partObj["ConditionKbn"] = {value: _CONDKBN.WHA};	// 状態区分
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
	},
	/***************************************/
	/* 在庫の更新                          */
	/***************************************/
	fncPutZaiko: function(SlipKbn , ReferenceDate) {
		for (var i = 0; i < this.tableRecords.length; i++) {
			// 変数初期化
			var itemCdId = '';
			var updateItemCd = this.tableRecords[i].value['ItemCdLU'].value;  // 対象商品

			var motoLocationCd  = this.record['WarehouseCdLU']['value']; // 移動元
			var sakiLocationCd  = this.record['WarehouseCdLU']['value']; // 移動先

			// 商品とロケーションの組み合わせで在庫の存在確認
			var wQuery = 'ItemCdLU = "' + updateItemCd + '" and LocationCdLU = "' + sakiLocationCd + '"';
			if (this.commonService.fncGetRecordDataQry(_APPID.ZAIKO , wQuery)) {
				if (this.commonService.fncSetKeyData('$id')) {
					itemCdId = this.commonService.getRecordData();
				} else {
					this.message = '対象情報が取得できません。';
					return false;
				}
			} else {
				this.message = '対象情報が取得できません。';
				return false;
			}
			
			if (itemCdId == '') {
			// 存在しない場合
				// 登録用パラメータを作成
				var queryObj = new Object();
				queryObj["app"] = _APPID.ZAIKO;
				
				var partObj = new Object();
				queryObj["record"] = partObj;
				
				partObj["Office"] = {value: this.record['Office']['value']};	// 事業所
				partObj["ItemCdLU"] = {value: updateItemCd};	// 商品コード
				
				partObj["LocationCdLU"] = {value: sakiLocationCd};	// ロケーションコード
				
				partObj["StockQuantity"] = {value: 1};	// 在庫数量
				partObj["NyukoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 入庫日
				partObj["SyukoDate"] = {value: ''};	// 出庫日
			
				if (this.commonService.fncPostRecord(queryObj)){
					this.message = '在庫が登録されました';
					return true;
				} else {
					this.message = '在庫の登録が失敗しました';
					return false;
				}
			} else {
			// 在庫が存在する場合
				
				// 更新用パラメータを作成
				var queryObj = new Object();
				queryObj["app"] = _APPID.ZAIKO;
				queryObj["id"] = itemCdId;
				
				var partObj = new Object();
				queryObj["record"] = partObj;
				
				partObj["StockQuantity"] = {value: 1};	// 在庫数量
				
				partObj["NyukoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 入庫日
				partObj["SyukoDate"] = {value: ''};	// 出庫日
				
				// 更新実行
				if (this.commonService.fntPutRecord(queryObj)){
					this.message = '在庫が更新されました';
				} else {
					this.message = '在庫の更新が失敗しました';
					return false;
				}
			}
		}
		return true;
	}
}
