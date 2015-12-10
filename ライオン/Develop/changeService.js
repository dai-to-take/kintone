/* changeService.js */

var ChangeService = function(record) {
	this._init(record);
};

ChangeService.prototype = {
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
		this.strChangeDate = record['ChangeDate']['value'];
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
	getChangeNumber: function() {
		// API実行
		if (this.commonService.fncMakeSlipNumber('ChangeDate' , 'ChangeNumber' , _SILPNUM.CHANGE , this.strChangeDate , this.strOffice )){
			this.message = '伝票番号が取得できました';
			return true;
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
	},
	getAutoChangeNumber: function() {
		return this.commonService.getSlipNumber();
	},

	/***************************************/
	/* 関連情報の更新                      */
	/***************************************/
	setRelationInfo: function(autoChangeNumber) {
		//エラーチェック
		if (! this.movementService.fncInputMovement(_SILPNUM.CHANGE)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		
		//入力チェック
		//for (var i = 0; i < this.tableRecords.length; i++) {
		//	if(this.tableRecords[i].value['ConditionKbn'].value == '社内'){
		//		continue;
		//	}else if(this.tableRecords[i].value['ConditionKbn'].value == '出荷先'){
		//		continue;
		//	}else {
		//		this.message = '商品の更新が失敗しました';
		//		return false;
		//	}
		//}
		
		// 移動履歴の登録
		if (! this.movementService.fncPostMovement(_SILPNUM.CHANGE , this.strChangeDate , autoChangeNumber)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		// 商品の更新
		if (! this.movementService.fncPutItem(_SILPNUM.CHANGE , this.strChangeDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		// 在庫の更新
		if (! this.movementService.fncPutZaiko(_SILPNUM.CHANGE , this.strReturnDate)) {
			this.message = this.movementService.getMessage();
			return false;
		}
		return true;
	},
	
	conditionKbnCheck: function() {
		//状態区分チェック
		for (var i = 0; i < this.tableRecords.length; i++) {
			if(this.record['ChangeConditionKbn']['value'] == '返品'){
				//console.log(this.tableRecords[i].value['ItemCdLU'].value.slice(-1));
				if(this.tableRecords[i].value['ItemCdLU'].value.slice(-1) != 'E'){
				//console.log('Err');
					this.message = '返品を選択できる商品は委託のみです。商品コードを選び直してください。';
					return false;
				}
			}
		}
		return true;
	}
}
