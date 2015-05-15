/* itemService.js */

ItemService = function(record) {
	this.status = "";
	this.message = "";
	
	this.recNo = 1;
	this.record = record;
};

ItemService.prototype.initialize = function() {
	// 変数セット
	this.strLocality = this.record['Locality']['value'];
	this.strShape = this.record['Shape']['value'];

	// クリエリー作成
	this.query = 'Locality in ("' + this.strLocality + '") and Shape in ("' + this.strShape + '") order by ItemCd limit 1';
	
	// API用URL作成
	this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
};

ItemService.prototype.getRecords = function() {
	var xmlHttp = new XMLHttpRequest();
	// 同期リクエストを行う
	xmlHttp.open("GET", this.apiUrl, false);
	xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
	xmlHttp.send(null);
	
	if (xmlHttp.status == 200){
		if(window.JSON){
			this.status = "00";
			this.jsonObj = xmlHttp.responseText;
			return true;
		} else {
			this.status = "80";
			this.message = xmlHttp.statusText;
			return false;
		}
	} else {
		this.status = "90";
		this.message = 'コードが取得できません。';
		return false;
	}
};

ItemService.prototype.getItemCd = function(keyVal) {
	var obj = JSON.parse(this.jsonObj);
	if (obj.records[0] != null){
		try{
			var strGetVal = '';
			for ( var keyA in obj.records ) {
				for ( var keyB in obj.records[keyA] ) {
					if (keyB == keyVal){
						strGetVal = obj.records[keyA][keyB].value;
					}
				}
			}

			this.recNo = parseInt(strGetVal.slice(-4),10) +1;
			
		} catch(e){
			this.message = '伝票番号が取得できません。';
			return false;
		}
	}
	return true;
};

ItemService.prototype.getAutoItemCd = function(shapeNm) {
	return getLocalNm(this.strLocality) + getShapeCd(this.strShape) + ('0000' + this.recNo).slice(-4);
};

//ItemService.prototype.makeQuery = function() {
//	this.query = 'Locality in ("' + this.strLocality + '") and Shape in ("' + this.strShape + '") order by ItemCd limit 1';
//};

//ItemService.prototype.setApiUrl = function(query) {
//	this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
//};

ItemService.prototype.getMessage = function() {
  return this.message;
};

ItemService.prototype.putRecords = function(appId) {

	//アプリID
 	var appId_nyusyutu = 47;
 	var appId_zaiko = 45;
	//商品コード(画面)
	var strItemCd = this.record['ItemCd']['value'];
	
	//場所コードが一致する全てのレコードを更新する。
	var offset = 0;
	var records = new Array();
	var loopendflg = false;
	
	while(!loopendflg){
		if(appId == appId_nyusyutu) {
		  var query = encodeURIComponent('ItemCd = "' + strItemCd + '" order by レコード番号 asc limit 100 offset ' + offset);
		  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId + '&query=' + query;
		} else {
		  var query = encodeURIComponent('ItemCd in ("' + strItemCd + '") order by レコード番号 asc limit 100 offset ' + offset);
		  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId + '&query=' + query;
		}
	 
	  // 同期リクエストを行う
	  var xmlHttp = new XMLHttpRequest();
	  xmlHttp.open("GET", appUrl, false);
	  xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
	  xmlHttp.send(null);
	 
	  //取得したレコードをArrayに格納
	  var respdata = JSON.parse(xmlHttp.responseText);
	  if(respdata.records.length > 0){
	    for(var i = 0; respdata.records.length > i; i++){
	      records.push(respdata.records[i]);
	    }
	    offset += respdata.records.length;
	  }else{
	    loopendflg = true;
	  }
	}
	
	//共通項目
	var queryObj = new Object();
	queryObj["app"] = appId;
	queryObj["records"] = new Array();
	
    for (var i = 0, l = records.length; i < l; i++) {
    	var record = records[i];
    	var partObj = new Object();
    	//レコードID
    	partObj["id"] = record['$id'].value;
    	//レコードの各フィールド
    	partObj["record"] = new Array();
    	
    	if(appId == appId_nyusyutu) {
    		//商品コードを上書きする。
    		partObj["record"] = {ItemCd:{value:record['ItemCd']['value']}};
    	} else {
    		//商品テーブルパラメータを作成する。
    		var ItemTable = new Array();
    		ItemTable = record.ItemTable.value;
    		var tableValueObj = new Object();
    		tableValueObj["value"] = new Array();
    		//テーブルの要素分回す。
    		for (var j = 0; j < ItemTable.length; j++){
    			var tableValue = ItemTable[j];
    			var tablePartObj = new Object();
    			//商品コードを上書きする。
    			tablePartObj["value"] = {id:tableValue.id,value:{ItemCd:{value:tableValue.value.ItemCd.value}}};
    			tableValueObj["value"].push(tablePartObj["value"]);
    		}
    		partObj["record"] = {ItemTable:{value:tableValueObj["value"]}};
    	}
		queryObj["records"].push(partObj);
    }
	
	if(records.length > 0){
		this.updateLookup(appId,queryObj);
	}
};
 
    /**
     * ルックアップを一括更新する関数
     * @param appId ルックアップの更新を行うアプリID
     * @param records 一括更新するrecordsデータ
     */
 
ItemService.prototype.updateLookup = function(appId, queryObj) {
	
	var putparams = queryObj;

	var appUrl = kintone.api.url('/k/v1/records');
	// CSRFトークンの取得
	var token = kintone.getRequestToken();
	putparams["__REQUEST_TOKEN__"] = token; 
	
	// 同期リクエストを行う
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('PUT', appUrl, false);
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
	xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
	alert(JSON.stringify(putparams));
	xmlHttp.send(JSON.stringify(putparams));
	if (xmlHttp.status == 200){
		var obj = JSON.parse(xmlHttp.responseText);
		alert(xmlHttp.status + '：更新に成功しました。');
	} else {
		alert(xmlHttp.status + '：更新エラー');
	}
};