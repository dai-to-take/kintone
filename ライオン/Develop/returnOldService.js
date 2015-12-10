/* returnOldService.js */

var returnOldService = function(record) {
	this._init(record);
};

returnOldService.prototype = {
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
		this.strReturnDate = record['ReturnDate']['value'];
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
	/* 返却管理用の伝票番号採番            */
	/***************************************/
	getReturnNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('ReturnDate' , 'ReturnNumber' , _SILPNUM.RETURN , this.strReturnDate , this.strOffice )){
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
	/* 関連情報の更新                      */
	/***************************************/
	setRelationInfo: function(autoReturnNumber) {
		// 移動履歴の登録
		if (! this.movementService.fncPostMovement(_SILPNUM.RETURN , this.strReturnDate , autoReturnNumber)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 在庫の更新
		if (! this.movementService.fncPutZaiko(_SILPNUM.RETURN , this.strReturnDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		// 商品の更新
		if (! this.movementService.fncPutItem(_SILPNUM.RETURN , this.strReturnDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		return true;
	}
}
