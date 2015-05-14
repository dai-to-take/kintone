/* spaceService.js */

SpaceService = function(record) {
	this.status = "";
	this.message = "";
	
	this.recNo = 1;
	this.record = record;
};

SpaceService.prototype.initialize = function() {
	// 変数セット
	this.strSpaceKbn = this.record['SpaceKbn']['value'];
	this.strAreaKbn = this.record['AreaKbn']['value'];

	// クリエリー作成
	this.query = 'SpaceKbn in ("' + this.strSpaceKbn+ '") and AreaKbn in ("' + this.strAreaKbn + '") order by SpaceCd limit 1';
	
	// API用URL作成
	this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
};

SpaceService.prototype.getRecords = function() {
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

SpaceService.prototype.getSpaceCd = function(keyVal) {
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

			this.recNo = parseInt(strGetVal.slice(-5),10) +1;
			
		} catch(e){
			this.message = '伝票番号が取得できません。';
			return false;
		}
	}
	return true;
};

SpaceService.prototype.getAutoSpaceCd = function(shapeNm) {
	return getSpaceKbnCd(this.strSpaceKbn) + getAreaCd(this.strAreaKbn) + ('00000' + this.recNo).slice(-5);
};

SpaceService.prototype.getMessage = function() {
  return this.message;
};

SpaceService.prototype.putRecords = function(appId) {

	//アプリID
 	var appId_nyusyutu = 47;
 	var appId_zaiko = 45;
 	var appId_item = 56;	
	//場所コード(画面)
	var strSpaceCode = this.record['SpaceCode']['value'];
	
	//場所コードが一致する全てのレコードを更新する。
	var offset = 0;
	var records = new Array();
	var loopendflg = false;
	
	while(!loopendflg){
		if(appId == appId_nyusyutu) {
		  var query = encodeURIComponent('SpaceCodeSaki = "' + strSpaceCode + '" order by レコード番号 asc limit 100 offset ' + offset);
		  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId + '&query=' + query;
		} else if(appId == appId_zaiko) {
		  var query = encodeURIComponent('SpaceCode = "' + strSpaceCode + '" order by レコード番号 asc limit 100 offset ' + offset);
		  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId + '&query=' + query;
		} else {
		  var query = encodeURIComponent('SpaceLookUp = "' + strSpaceCode + '" order by レコード番号 asc limit 100 offset ' + offset);
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
	
	var queryObj = new Object();
	queryObj["app"] = appId;
	queryObj["records"] = new Array();
	
    for (var i = 0, l = records.length; i < l; i++) {
    	var record = records[i];
    	var partObj = new Object();
    	partObj["id"] = record['$id'].value;
    	partObj["record"] = new Array();
    	if(appId == appId_nyusyutu) {
    		partObj["record"] = {SpaceCodeSaki:{value:this.record['SpaceCode']['value']}};
    	} else if (appId == appId_zaiko) {
    		partObj["record"] = {SpaceCode:{value:this.record['SpaceCode']['value']}};
    	} else {
    		partObj["record"] = {SpaceLookUp:{value:this.record['SpaceCode']['value']}};
    	}
		queryObj["records"].push(partObj);
    }
	
	if(records.length > 0){
		this.updateLookup(appId,queryObj);
	}
};
 
SpaceService.prototype.updateLookup = function(appId, queryObj) {
	
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
	xmlHttp.send(JSON.stringify(putparams));
	if (xmlHttp.status == 200){
		var obj = JSON.parse(xmlHttp.responseText);
		alert(xmlHttp.status + '：更新に成功しました。');
	} else {
		alert(xmlHttp.status + '：更新エラー');
	}
};