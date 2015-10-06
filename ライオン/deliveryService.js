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
		this.tableRecords = record['ItemTable']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		this.movementService = new MovementService(this.record);
		
		// 変数セット
		this.strDeliveryDate = record['DeliveryDate']['value'];
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
	/* 納入管理用の伝票番号採番            */
	/***************************************/
	getDeliveryNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('DeliveryDate' , 'DeliveryNumber' , _SILPNUM.DELV , this.strDeliveryDate , this.strOffice )){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoDeliveryNumber: function() {
		return this.commonService.getSlipNumber();
	},

	/***************************************/
	/* 入出庫履歴の登録                    */
	/***************************************/
	postMovement: function(autoDeliveryNumber) {
		if (this.movementService.fncPostMovement(_SILPNUM.DELV , this.strDeliveryDate , autoDeliveryNumber)) {
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
		if (this.movementService.fncPutItem(_SILPNUM.DELV , this.strDeliveryDate)) {
			this.message = this.movementService.getMessage();
			return true;
		} else {
			this.message = this.movementService.getMessage();
			return false;
		}
	}
}
