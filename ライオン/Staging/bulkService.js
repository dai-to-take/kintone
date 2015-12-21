/* bulkService.js */

BulkService = function(record) {
	this._init(record);
};
BulkService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		this.intRecNo = 0;
		
		this.record = record;

		// サービス初期化
		this.commonService = new CommonService();
		
		//this.movementService = new MovementService(this.record, _MODE.M);
		
		// 変数セット
		this.strBulkDate = record['BulkDate']['value'];
		this.strOffice = record['Office']['value'];
		this.strWarehouseCdLU = record['WarehouseCdLU']['value'];
		this.strPurchaseKbn =  this.record['PurchaseKbnLU']['value'];
		this.intBulkNum = record['BulkNum']['value'];
	},
	
	/***************************************/
	/* getter                              */
	/***************************************/
	getMessage: function() {
	  return this.message;
	},
	
	/***************************************/
	/* 商品一括管理用の伝票番号採番            */
	/***************************************/
	getBulkNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('BulkDate' , 'BulkNumber' , _SILPNUM.BULK, this.strBulkDate , this.strOffice )){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoBulkNumber: function() {
		return this.commonService.getSlipNumber();
	},

	/***************************************/
	/* 商品情報の更新                      */
	/***************************************/
	putBulkItemInfo: function() {

		// 基準商品コードの取得
		if (this.getItemCd()){
			this.intRecNo = this.commonService.getRecNo();
		}else {
			return false;
		}

console.log(this.intRecNo);
		
		// 商品の一括登録
		if (! this.makeItemInfo()){
			return false;
		}
		
		return true;
	},
	
	/***************************************/
	/* 関連情報の更新                      */
	/***************************************/
	setRelationInfo: function() {
		var strPurchaseDate = this.record['PurchaseDate']['value'];

		// 移動履歴の登録
		if (! this.movementService.fncPostMovement(_SILPNUM.PURCH , strPurchaseDate , '')) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 在庫の更新
		if (! this.movementService.fncPutZaiko(_SILPNUM.PURCH , strPurchaseDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 商品の更新
		if (! this.movementService.fncPutItem(_SILPNUM.PURCH , strPurchaseDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		return true;
	},
	
	/***************************************/
	/* 商品コード用の取得採番              */
	/***************************************/
	getItemCd: function() {
		// クエリー作成
		var wQuery = 'Office in ("' + this.strOffice + '")  order by ItemCd desc limit 1';
		
		if (this.commonService.fncGetRecords(_APPID.ITEM , wQuery)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規ItemCdを取得
			if (this.commonService.fncGetMaxNumber(jsonObj , 'ItemCd' , _DIGITS.ITEMCD_S , _DIGITS.ITEMCD_E)){
				this.message = '商品コードが取得できました';
				return true;
			} else {
				this.message = '商品コードが取得できません。';
				return false;
			}
		}else {
			this.message = '商品コードが取得できません。';
			return false;
		}
		
	},
	getAutoItemCd: function(intRecNo) {
		if (this.commonService.fncGetOffice(this.strOffice) == _OFFICE.LION){
			if(intRecNo == 1){
				intRecNo = intRecNo + 50000;
			}
		}
	
		return this.commonService.fncGetOffice(this.strOffice) + 
				('00000' + intRecNo).slice(-5) +
				this.commonService.fncGetPurchaseKbn(this.strPurchaseKbn);
	},
	getAutoItemCdOut: function(intRecNo) {
		if (this.commonService.fncGetOffice(this.strOffice) == _OFFICE.LION){
			if(intRecNo == 1){
				intRecNo = intRecNo + 50000;
			}
		}
		return intRecNo + this.commonService.fncGetPurchaseKbn(this.strPurchaseKbn);
	},
	/***************************************/
	/* 商品情報登録                      */
	/***************************************/
	makeItemInfo: function() {
		var cntLow = 0;
		
		// 商品の初期化
		var cntItem = this.intRecNo;

		// JSONパラメータ作成
		var queryObj = new Object();
		queryObj["app"] = _APPID.ITEM;
		queryObj["records"] = new Array();

console.log(this.intBulkNum);
		for (var i = 0; i < this.intBulkNum; i++) {
			var partObj = new Object();

			// パラメータ作成
			partObj["Office"] = {value: this.strOffice};	// 仕入先コード
			partObj["ItemCd"] = {value: this.getAutoItemCd(cntItem)};	// 商品コード
			partObj["ItemCdOut"] = {value: this.getAutoItemCdOut(cntItem)};	// 商品コード（表示用）
console.log(this.getAutoItemCd(cntItem));
			
			partObj["PurchaseCdLU"] = {value: this.record['PurchaseCdLU']['value']};	// 仕入先コード
			partObj["PurchaseDate"] = {value: this.commonService.fncGetFormatDate(this.record['PurchaseDate']['value'] , "")};	// 仕入日
			partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	// 倉庫コード
			
			partObj["ItemCategory"] = {value: this.record['ItemCategory']['value']};	// 商品カテゴリ
			partObj["Material"] = {value: this.record['Material']['value']};	// 素材
			partObj["Design"] = {value: this.record['Design']['value']};	// デザイン
			partObj["Design2"] = {value: this.record['Design2']['value']};	// デザイン補足
			partObj["Color"] = {value: this.record['Color']['value']};	// 色
			partObj["Note"] = {value: this.record['Note']['value']};	//備考
			
			queryObj["records"].push(partObj);
			
			if((this.intBulkNum-1) == cntLow || (i+1) % 100 == 0){
console.log(queryObj);
				// 登録処理の実行
				if (! this.commonService.fncPostRecords(queryObj)){
					this.message = '商品情報の登録が失敗しました';
					return false;
				}
				// リセット
				queryObj["records"] = new Array();
			}
			
			cntLow++;
			cntItem++;
		}
		
		this.message = 'fncPostRecordsが登録されました';
		return true;
	}
}

