/* itemService.js */

ItemService = function(record) {
	this._init(record);
};
ItemService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		
		this.record = record;

		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strOffice = this.record['Office']['value'];
		
		this.strItemCd =  this.record['ItemCd']['value'];
	},
	
	/***************************************/
	/* getter                              */
	/***************************************/
	getMessage: function() {
	  return this.message;
	},
	
	/***************************************/
	/* 商品コード用の伝票番号採番            */
	/***************************************/
	getItemCd: function() {
		// クエリー作成
		var wQuery = 'Office in ("' + this.strOffice + '")  order by ItemCd limit 1';
		if (this.commonService.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規ItemCdを取得
			if (this.commonService.fncGetMaxNumber(jsonObj,'ItemCd',-5)){
				this.message = '伝票番号が取得できました';
				return true;
			} else {
				this.message = '伝票番号が取得できません。';
				return false;
			}
		}else {
			this.message = '伝票番号が取得できません。';
			return false;
		}
		
	},
	getAutoItemCd: function() {
		return this.commonService.fncGetOffice(this.strOffice) + 
				('00000' + this.commonService.getRecNo()).slice(-5);
	}
	
}

