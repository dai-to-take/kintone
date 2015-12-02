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
		this.movementService = new MovementService(this.record, _MODE.M);
		
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
	/* 関連情報の更新                      */
	/***************************************/
	setRelationInfo: function(autoSellingNumber) {
		//エラーチェック
		if (! this.movementService.fncInputMovement(_SILPNUM.SELL)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 移動履歴の登録
		if (! this.movementService.fncPostMovement(_SILPNUM.SELL , this.strSellingDate , autoSellingNumber)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 在庫の更新
		if (! this.movementService.fncPutZaiko(_SILPNUM.SELL , this.strSellingDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 商品の更新
		if (! this.movementService.fncPutItem(_SILPNUM.SELL , this.strSellingDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		return true;
	}
}
