/* locationService.js */

LocationService = function(record) {
	this._init(record);
};
LocationService.prototype = {
	
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";
		
		this.recNo = 1;
		this.record = record;

		// サービス初期化
		this.commonService = new CommonService();
		
		// 変数セット
		this.strLocationKbn = this.record['LocationKbn']['value'];
	},

	getMessage: function() {
	  return this.message;
	},
	
	/***************************************/
	/* ロケーションコードの採番                    */
	/***************************************/
	getLocationCd: function(keyVal) {
		// クエリー作成
		var wQuery = 'LocationKbn in ("' + this.strLocationKbn+ '")  order by LocationCd limit 1';
		// API実行
		if (this.commonService.fncGetRecords(kintone.app.getId() , wQuery)){
			var jsonObj = this.commonService.getJsonObj();
			// 新規LocationCdを取得
			if (this.commonService.fncGetMaxNumber(jsonObj,'LocationCd',-5)){
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
	getAutoLocationCd: function() {
		return this.commonService.fncGetLocationCd(this.strLocationKbn) + 
						('00000' + this.commonService.getRecNo()).slice(-5);
	}
	
}