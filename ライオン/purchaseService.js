/* purchaseService.js */

var PurchaseService = function(record) {
	this._init(record);
};

PurchaseService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;
		this.tableRecords = record['ItemTable']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		this.movementService = new MovementService(this.record);
		
		// 変数セット
		this.strPurchaseDate = record['PurchaseDate']['value'];
		this.strOffice = record['Office']['value'];
		
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
	/* 仕入管理用の伝票番号採番            */
	/***************************************/
	getPurchaseNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('PurchaseDate' , 'PurchaseNumber' , _SILPNUM.PURCH , this.strPurchaseDate , this.strOffice)){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoPurchaseNumber: function() {
		return this.commonService.getSlipNumber();
	},
	
	/***************************************/
	/* 移動履歴の登録                    */
	/***************************************/
	postMovement: function(autoPurchaseNumber) {
		if (this.movementService.fncPostMovement(_SILPNUM.PURCH , this.strPurchaseDate , autoPurchaseNumber)) {
			this.message = this.movementService.getMessage();
			return true;
		} else {
			this.message = this.movementService.getMessage();
			return false;
		}
	},
	
	/***************************************/
	/* 商品の更新                          */
	/***************************************/
	putItem: function() {
		if (this.movementService.fncPutItem(_SILPNUM.PURCH , this.strPurchaseDate)) {
			this.message = this.movementService.getMessage();
			return true;
		} else {
			this.message = this.movementService.getMessage();
			return false;
		}
	}
}
