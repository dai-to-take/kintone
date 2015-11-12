/* movementService.js */

var MovementService = function(record, mode) {
	this._init(record, mode);
};

MovementService.prototype = {
	_init: function(record, mode) {
		// 初期化
		this.record = record;
		
		this.mode = mode;
		if (this.mode == _MODE.M) {
			this.tableRecords = record['ItemTable']['value'];
		}
		
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
		// 移動履歴登録
		// 基準番号を取得
		if (! this.commonService.fncMakeIdoNumber(ReferenceDate)) {
			this.message = '伝票番号が取得できません。';
			return false;
		}
		
		// JSONパラメータ作成
		var queryObj = new Object();
		queryObj = this.fncMakeMovement(SlipKbn , ReferenceDate , SlipNumber);
		
		// 登録処理の実行
		if (this.commonService.fncPostRecords(queryObj)){
			this.message = '移動履歴が登録されました';
			return true;
		} else {
			this.message = '移動履歴の登録が失敗しました';
			return false;
		}
	},
	
	fncMakeMovement: function(SlipKbn , ReferenceDate , SlipNumber) {
		// 変数初期化
		var cntNyusyutu = this.commonService.getRecNo();
		var cntLength = 1;
		
		if (this.mode == _MODE.M) {
			cntLength = this.tableRecords.length;
		}
		
		// JSONパラメータ作成
		var queryObj = new Object();
		queryObj["app"] = _APPID.IDO;
		queryObj["records"] = new Array();

		for (var i = 0; i < cntLength; i++) {
			var partObj = new Object();

			var strItemCd = ( this.mode == _MODE.S ) ? this.record['ItemCd'].value : this.tableRecords[i].value['ItemCdLU'].value; 
			var strOffice = this.record['Office'].value;
			// 伝票種別によって変更
			switch (SlipKbn) {
				case _SILPNUM.PURCH:
					var strIdoKbn = _IDOKBN.NYUKO;
					var strIdoReason = _IDORSN.PURCH;
					var strMotoLocationCdLU = this.record['PurchaseCdLU']['value'];
					var strSakiLocationCdLU = this.record['WarehouseCdLU']['value'];
					var strPrice = ( this.mode == _MODE.S ) ? this.record['PurchasePrice'].value : this.tableRecords[i].value['ItemPrice'].value; 
					break;
				case _SILPNUM.SHIP:
					var strIdoKbn = _IDOKBN.SYUKO;
					var strIdoReason = _IDORSN.SHIP;
					var strMotoLocationCdLU = this.record['WarehouseCdLU']['value'];
					var strSakiLocationCdLU = this.record['ShipmentCdLU']['value'];
					var strPrice = ( this.mode == _MODE.S ) ? this.record['ShipmentPrice'].value : this.tableRecords[i].value['ItemPrice'].value; 
					break;
				case _SILPNUM.SELL:
					var strIdoKbn = _IDOKBN.SELL;
					var strIdoReason = _IDORSN.SELL;
					var strMotoLocationCdLU = this.record['ShipmentCdLU']['value'];
					var strSakiLocationCdLU = '';
					var strPrice = ( this.mode == _MODE.S ) ? this.record['SellingPrice'].value : this.tableRecords[i].value['ItemPrice'].value; 
					break;
				case _SILPNUM.RETURN:
					var strIdoKbn = _IDOKBN.NYUKO;
					var strIdoReason = _IDORSN.RETURN;
					var strMotoLocationCdLU = ( this.mode == _MODE.S ) ? this.record['ShipmentCdLU']['value'] : this.tableRecords[i].value['ShipmentCdLU'].value; 
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
			
			partObj["Office"] = {value: strOffice};	// 事業所
			
			partObj["MotoLocationCdLU"] = {value: strMotoLocationCdLU};	// 移動元ロケーションコード
			partObj["SakiLocationCdLU"] = {value: strSakiLocationCdLU};	// 移動先ロケーションコード
			
			partObj["ItemCdLU"] = {value: strItemCd};	//商品コード
			partObj["Price"] = {value: strPrice};	//価格
			
		
			queryObj["records"].push(partObj);
			
			cntNyusyutu++;
		}
		
		return queryObj;
	},
	
	/***************************************/
	/* 商品の更新                          */
	/***************************************/
	fncPutItem: function(SlipKbn , ReferenceDate) {
		var cntLength = 1;
		
		if (this.mode == _MODE.M) {
			cntLength = this.tableRecords.length;
		}
		
		for (var i = 0; i < cntLength; i++) {
			var updateItemCd = ( this.mode == _MODE.S ) ? this.record['ItemCd'].value : this.tableRecords[i].value['ItemCdLU'].value;
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
					this.message = '対象商品idが取得できません。';
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
					partObj["PurchasePrice"] = {value: this.record['PurchasePrice']['value']};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.WHA};	// 状態区分
					partObj["ZaikoTenkai"] = {value: '在庫展開済'};	// 在庫展開
					break;
				case _SILPNUM.SHIP:
					partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
					partObj["ShipmentCdLU"] = {value: this.record['ShipmentCdLU']['value']};	// 出荷先コード
					partObj["ShipmentPrice"] = {value: this.tableRecords[i].value['ItemPrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.SHIP};	// 状態区分
					break;
				case _SILPNUM.SELL:
					partObj["SellingPrice"] = {value: this.tableRecords[i].value['ItemPrice'].value};	// 価格
					partObj["ConditionKbn"] = {value: _CONDKBN.SELL};	// 状態区分
					break;
				case _SILPNUM.RETURN:
					partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
					partObj["ConditionKbn"] = {value: _CONDKBN.WHA};	// 状態区分
					break;
				default:
					this.message = '商品の更新が失敗しました';
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
		// 変数初期化
		var cntLength = 1;
		
		if (this.mode == _MODE.M) {
			cntLength = this.tableRecords.length;
		}
		
		for (var i = 0; i < cntLength; i++) {
			// 変数初期化
			var updateItemCd = ( this.mode == _MODE.S ) ? this.record['ItemCd'].value : this.tableRecords[i].value['ItemCdLU'].value; // 対象商品
					
			var motoLocationCd  = ''; // 移動元
			var sakiLocationCd  = ''; // 移動先
			
			var office = this.record['Office']['value'];
			
			// 出庫（減算減算処理）
			switch (SlipKbn) {
				case _SILPNUM.PURCH:
					break;
				case _SILPNUM.SHIP:
					motoLocationCd  = this.record['WarehouseCdLU']['value']; // 倉庫
					break;
				case _SILPNUM.SELL:
					motoLocationCd  = this.record['ShipmentCdLU']['value']; // 販売元
					break;
				case _SILPNUM.RETURN:
					motoLocationCd = ( this.mode == _MODE.S ) ? this.record['ShipmentCdLU'].value : this.tableRecords[i].value['ShipmentCdLU'].value;  // 顧客
					break;
				default:
					motoLocationCd  = ''
					break;
			};	
			if (motoLocationCd != ''){
				if(! this.fncUpsertZaiko(_CALKBN.SUB , ReferenceDate , updateItemCd , motoLocationCd , office)){
					return false;
				}
			}
			
			// 入庫（在庫加算処理）
			switch (SlipKbn) {
				case _SILPNUM.PURCH:
					sakiLocationCd  = this.record['WarehouseCdLU']['value']; // 倉庫
					break;
				case _SILPNUM.SHIP:
					sakiLocationCd  = this.record['ShipmentCdLU']['value']; // 出荷先
					break;
				case _SILPNUM.SELL:
					break;
				case _SILPNUM.RETURN:
					sakiLocationCd  = this.record['WarehouseCdLU']['value']; // 倉庫
					break;
				default:
					sakiLocationCd  = ''
					break;
			};	
			if (sakiLocationCd != ''){
				if(! this.fncUpsertZaiko(_CALKBN.ADD , ReferenceDate , updateItemCd , sakiLocationCd , office)){
					return false;
				}
			}
			
		}
		return true;
	},
	fncUpsertZaiko: function(CalKbn , ReferenceDate , ItemCd , LocationCd , Office) {
		// ActKbn:0(加算) , 1(減産)

		// 変数初期化
		var itemCdId = '';
		var stockQuantity = 0;
			
		// 商品とロケーションの組み合わせで在庫の存在確認
		var wQuery = 'ItemCdLU = "' + ItemCd + '" and LocationCdLU = "' + LocationCd + '"';
		if (this.commonService.fncGetRecordDataQry(_APPID.ZAIKO , wQuery)) {
			// 商品$idを取得
			if (this.commonService.fncSetKeyData('$id')) {
				itemCdId = this.commonService.getRecordData();
			} else {
				this.message = '商品$idが取得できません。';
				return false;
			}
			// 現在数を取得
			if (this.commonService.fncSetKeyData('StockQuantity')) {
				stockQuantity = this.commonService.getRecordData();
			} else {
				this.message = '現在数が取得できません。';
				return false;
			}
		} else {
			this.message = '対象レコード取得エラー';
			return false;
		}
		//console.log('CalKbn=>' + CalKbn);
		//console.log('ItemCd=>' + ItemCd);
		//console.log('LocationCd=>' + LocationCd);
		//console.log('itemCdId=>' + itemCdId);
		//console.log('stockQuantity=>' + itemCdId);
		if (itemCdId == '') {
		// 存在しない場合
			// 登録用パラメータを作成
			var queryObj = new Object();
			queryObj["app"] = _APPID.ZAIKO;
			
			var partObj = new Object();
			queryObj["record"] = partObj;
			
			partObj["Office"] = {value: Office};	// 事業所
			partObj["ItemCdLU"] = {value: ItemCd};	// 商品コード
			
			partObj["LocationCdLU"] = {value: LocationCd};	// ロケーションコード
			
			partObj["StockQuantity"] = {value: 1};	// 在庫数量
			
			if(_CALKBN.SUB == CalKbn){
				// 出庫の場合
				partObj["SyukoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 出庫日
			} else {
				// 入庫の場合
				partObj["NyukoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 入庫日
			}
		
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
			
			
			if(_CALKBN.SUB == CalKbn){
				// 出庫の場合
				partObj["SyukoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 出庫日
				partObj["StockQuantity"] = {value: eval(stockQuantity) - 1};	// 在庫数量
			} else {
				// 入庫の場合
				partObj["NyukoDate"] = {value: this.commonService.fncGetFormatDate(ReferenceDate , "YYYY-MM-DD")};	// 入庫日
				partObj["StockQuantity"] = {value: eval(stockQuantity) + 1};	// 在庫数量
			}
			
			// 更新実行
			if (this.commonService.fntPutRecord(queryObj)){
				this.message = '在庫が更新されました';
			} else {
				this.message = '在庫の更新が失敗しました';
				return false;
			}
		}
		return true;
	}
}
