/* common.js */

PlaceService = function(locality , shape) {
	this.status = "";
	this.message = "";
	this.recNo = 1;
	this.strLocality = locality;
	this.strShape = shape;
};

PlaceService.prototype.setApiUrl = function(query) {
  this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(query);
};

PlaceService.prototype.getStatus = function() {
  return this.status;
};

PlaceService.prototype.getMessage = function() {
  return this.message;
};

PlaceService.prototype.getRecNo = function() {
  return this.recNo;
};

PlaceService.prototype.getRecords = function() {
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

PlaceService.prototype.getItemCd = function(keyVal) {
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

PlaceService.prototype.getLocalNm = function(localNm) {
	return localNm.slice(localNm.lastIndexOf("(") + 1 , localNm.lastIndexOf("(") + 4);
};
