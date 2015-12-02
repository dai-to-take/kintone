/* shipmentService.js */

var ShipmentService = function(record) {
	this._init(record);
};

ShipmentService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;
		this.tableRecords = record['ItemTable']['value'];
		
		// サービス初期化
		this.commonService = new CommonService();
		this.movementService = new MovementService(this.record, _MODE.M);
		
		// 変数セット
		this.strShipmentDate = record['ShipmentDate']['value'];
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
	/* 出荷管理用の伝票番号採番            */
	/***************************************/
	getShipmentNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('ShipmentDate' , 'ShipmentNumber' , _SILPNUM.SHIP, this.strShipmentDate , this.strOffice )){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoShipmentNumber: function() {
		return this.commonService.getSlipNumber();
	},

	/***************************************/
	/* 関連情報の更新                      */
	/***************************************/
	setRelationInfo: function(autoShipmentNumber) {
		//エラーチェック
		if (! this.movementService.fncInputMovement(_SILPNUM.SHIP)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 移動履歴の登録
		if (! this.movementService.fncPostMovement(_SILPNUM.SHIP , this.strShipmentDate , autoShipmentNumber)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 在庫の更新
		if (! this.movementService.fncPutZaiko(_SILPNUM.SHIP , this.strShipmentDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 商品の更新
		if (! this.movementService.fncPutItem(_SILPNUM.SHIP , this.strShipmentDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		return true;
	}
}
