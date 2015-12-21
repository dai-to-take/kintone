/* inventService.js */

var InventService = function(record) {
	this._init(record);
};

InventService.prototype = {
	_init: function(record) {
		// 初期化
		this.status = "";
		this.message = "";

		this.record = record;

		this.records = [];
		
		// サービス初期化
		this.commonService = new CommonService();
		
		this.referenceDate = new Date();
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
	/* 棚卸データ作成処理                  */
	/***************************************/
	fncMakeInventData: function(targetItem) {
		
		// 対象データ取得
		if (! this.getItemDate(targetItem)){
			return true;
		}
		
		
		// 棚卸マスタ登録
		if (! this.makeInventData()){
			return true;
		}
		
		return true;
	
	
	},
	/***************************************/
	/* 関連情報の更新                      */
	/***************************************/
	getItemDate: function(targetItem) {
		
		var offset = 0;
		var loopendflg = false;
		
		while (!loopendflg) {
			var wQuery = ' ConditionKbn in ("社内" , "出荷先")';
			// クエリー作成
			switch (targetItem) {
				case 'all':
					wQuery += '';
					break;
				case 'wha':
					wQuery += ' and (CurrentCdLU = "' + _SOUKOCD.LION + '" or CurrentCdLU = "' + _SOUKOCD.SILK + '")';
					break;
				case 'la':
					wQuery += ' and CurrentCdLU = "' + _SOUKOCD.LION + '"';
					break;
				case 'sl':
					wQuery += ' and CurrentCdLU = "' + _SOUKOCD.SILK + '"';
					break;
				default:
					this.message = '対象データの取得が失敗しました';
					return false;
			};
			
			wQuery += ' order by ConditionKbn , CurrentCdLU , ItemCd asc limit 100 offset ' + offset;
			
			console.log(wQuery);
			
			// API実行
			if (this.commonService.fncGetRecords(_APPID.ITEM , wQuery)){
				var jsonObj = this.commonService.getJsonObj();
				var respdata = JSON.parse(jsonObj);
				
				if (respdata.records.length > 0) {
	                for (var i = 0; respdata.records.length > i; i++) {
						this.records.push(respdata.records[i]);

					}
					offset += respdata.records.length;
				} else {
					loopendflg = true;
				}
				
				
			}else {
				this.message = '商品一覧が取得できません。';
				return false;
			}
		}
		
		return true;
		
	},
	
	/***************************************/
	/* 関連情報の更新                      */
	/***************************************/
	makeInventData: function() {
		var cntItemLow = 0;
		var cntNumber = 1;
		var cntLength = this.records.length;
		
		// 比較
		var strKeepConditionKbn = "";
		var strKeepCurrentCdLU = "";
		
		var newRow = {};
		var queryObj = new Object();
		queryObj["app"] = kintone.app.getId();
		queryObj["records"] = new Array();
		
		for (var i = 0; cntLength > i; i++) {
			
			var recdata = this.records[i];
			
			var strNowConditionKbn = recdata.ConditionKbn.value;
			var strNowCurrentCdLU = recdata.CurrentCdLU.value;
			
			if (strKeepConditionKbn != strNowConditionKbn || strKeepCurrentCdLU != strNowCurrentCdLU ) {
				// 初回意外
				if (i > 0) {
					partObj["ItemRow"] = {value: cntItemLow};	// 商品の件数
					queryObj["records"].push(partObj);
					
					if(cntNumber % 100 == 0){
						
						// 登録処理の実行
						if (! this.commonService.fncPostRecords(queryObj)){
							this.message = '棚卸データの登録が失敗しました';
							return false;
						}
						
						// リセット
						queryObj["records"] = new Array();
					}
					
					cntNumber++;
				}
				cntItemLow = 0;
				strKeepConditionKbn = recdata.ConditionKbn.value;
				strKeepCurrentCdLU = recdata.CurrentCdLU.value;

				// パラメータ作成
				var partObj = new Object();
				
				partObj["Office"] = {value: recdata.Office.value};	// 事業所  ※条件は調整
				
				partObj["InventNumber"] = {value: this.getInventNumber(cntNumber)};	// 棚卸番号
				partObj["InventDate"] = {value: this.commonService.fncGetFormatDate(this.referenceDate, "")};	// 移動日
				
				partObj["LocationCdLU"] = {value: recdata.CurrentCdLU.value};	// ロケーション
				
				partObj["ItemTable"] = {value: []};	// 商品一覧初期化

				newRow = {value: {ItemCdLU: {type: 'SINGLE_LINE_TEXT',value: recdata.ItemCd.value}}};
				partObj["ItemTable"]["value"].push(newRow);	
			
			} else {
				newRow = {value: {ItemCdLU: {type: 'SINGLE_LINE_TEXT',value: recdata.ItemCd.value}}};
				partObj["ItemTable"]["value"].push(newRow);
				
			}
			cntItemLow++;
			
		}
		
		// 最終ループ用の更新
		partObj["ItemRow"] = {value: cntItemLow};	// 商品の件数
		queryObj["records"].push(partObj);

		if (! this.commonService.fncPostRecords(queryObj)){
			this.message = '棚卸データの登録が失敗しました';
			return false;
		}
		
		console.log("end");
		
		return true;
	},
	
	/***************************************/
	/* 出荷管理用の伝票番号採番            */
	/***************************************/
	getInventNumber: function(referenceNumber) {
		
		var now = moment();
		
		return _SILPNUM.INVENT + now.format("YYYYMMDD") +  ('00' + referenceNumber).slice(-2);
		
	}
}
