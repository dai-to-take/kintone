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
		
		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strPurchaseDate = record['PurchaseDate']['value'];
		
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
		if (this.commonService.fncMakeSlipNumber('PurchaseDate' , 'PurchaseNumber' , _SILPNUM.PURCH , this.strPurchaseDate )){
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
	/* 入出庫履歴の登録                    */
	/***************************************/
	postNyusyutu: function() {
		// 変数初期化
		var cntNyusyutu = 0;
		
		//すでに登録済みか？
		var resVal = this.commonService.fncIdoCheck(this.record['PurchaseNumber']['value']);
		if (resVal == _CHECK.YES) {
			// すでに展開済みの場合
			this.message = 'すでに移動履歴に展開済みです。';
			return false;
		} else if (resVal == _CHECK.ERROR) {
			this.message = '移動履歴チェックが失敗しました。';
			return false;
		}
		
		// 移動履歴登録
		// 基準番号を取得
		if (this.commonService.fncMakeIdoNumber(this.strPurchaseDate)) {
			// 初期値を取得
			cntNyusyutu  = this.commonService.getRecNo();
		} else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
		
		// JSONパラメータ作成
		var queryObj = new Object();
		queryObj["app"] = _APPID.IDO;

		var partObj = new Object();
		queryObj["record"] = partObj;

		partObj["IdoNumber"] = {value: this.commonService.fncGetIdoNumber(this.strPurchaseDate , cntNyusyutu)};	// 入出庫番号
		partObj["IdoDate"] = {value: this.commonService.fncGetFormatDate(this.strPurchaseDate , "YYYY-MM-DD")};	// 入出庫日
		
		partObj["IdoKbn"] = {value: _IDOKBN.NYUKO};	// 移動区分
		partObj["IdoReason"] = {value: _IDORSN.PURCH};	// 移動理由
		
		partObj["SlipNumber"] = {value: this.record['PurchaseNumber']['value']};	// 伝票番号
		partObj["PurchaseNumberLU"] = {value: this.record['PurchaseNumber']['value']};	// 伝票番号
		
		partObj["CustomerCdLU"] = {value: this.record['PurchaseCodeLU']['value']};	// 顧客コード
		partObj["WarehouseCdLU"] = {value: this.record['WarehouseCdLU']['value']};	//倉庫コード
		partObj["ItemCdLU"] = {value: this.record['ItemCdLU']['value']};	//商品コード
		partObj["Price"] = {value: this.record['PurchasePrice']['value']};	//価格
		
		if (this.commonService.fncPostRecord(queryObj)){
			this.message = '入出庫履歴が登録されました';
			return true;
		} else {
			this.message = '入出庫履歴の登録が失敗しました';
			return false;
		}
	},
	_getAutoIdoNumber: function(nyusyutuNo) {
		return _SILPNUM.NST + this.commonService.fncGetYmd(this.strPurchaseDate) + ('00000' + nyusyutuNo).slice(-5);
	}
}
