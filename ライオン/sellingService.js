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
		this.tableRecords = record['ItemTable']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		this.movementService = new MovementService(this.record);
		
		// 変数セット
		this.strSellingDate = record['SellingDate']['value'];
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
	/* 売上管理の伝票番号採番            */
	/***************************************/
	getSellingNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('SellingDate' , 'SellingNumber' , _SILPNUM.SELL , this.strSellingDate , this.strOffice )){
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
	postMovement: function(autoSellingNumber) {
		if (this.movementService.fncPostMovement(_SILPNUM.SELL , this.strSellingDate , autoSellingNumber)) {
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
		if (this.movementService.fncPutItem(_SILPNUM.SELL , this.strSellingDate)) {
			this.message = this.movementService.getMessage();
			return true;
		} else {
			this.message = this.movementService.getMessage();
			return false;
		}
	}
}
