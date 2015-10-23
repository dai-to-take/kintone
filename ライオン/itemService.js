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
		var wQuery = 'Office in ("' + this.strOffice + '")  order by ItemCd desc limit 1';
		if (this.commonService.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規ItemCdを取得
			if (this.commonService.fncGetMaxNumber(jsonObj , 'ItemCd' , _DIGITS.ITEMCD)){
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
		var intRecNo = this.commonService.getRecNo();
		if (this.commonService.fncGetOffice(this.strOffice) == _OFFICE.LION){
			if(intRecNo == 1){
				intRecNo = intRecNo + 50000;
			}
		}
	
		return this.commonService.fncGetOffice(this.strOffice) + 
				('00000' + intRecNo).slice(-5);
	},
	/***************************************/
	/* 商品名の取得            */
	/***************************************/
	getItemName: function() {
		return this.commonService.fncGetLocalNm(this.record['Locality']['value']) + ' ' + 
				this.record['SizeOut']['value'] + ' ' + 
				this.record['Material']['value'];
	
	}
}

