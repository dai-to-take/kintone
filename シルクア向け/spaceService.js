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