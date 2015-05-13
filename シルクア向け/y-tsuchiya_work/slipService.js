/* common.js */

SlipService = function() {
	this.recNo = 1;
	this.status = "";
	this.message = "";
};

SlipService.prototype.setApiUrl = function(query) {
  this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(query);
};

SlipService.prototype.getStatus = function() {
  return this.status;
};

SlipService.prototype.getMessage = function() {
  return this.message;
};

SlipService.prototype.getRecNo = function() {
  return this.recNo;
};

SlipService.prototype.makeQuery = function(strStartDate,strEndDate) {
	return 'ProcessDate >= "' + strStartDate + '" and ProcessDate <= "' + strEndDate + '" order by SlipNumber limit 1';
};

SlipService.prototype.getRecords = function() {
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
		return true;
	}
};

SlipService.prototype.postRecords = function(event) {
	
	var tableRecords = event.record.ItemTable.value;
	var queryObj = new Object();
	queryObj["app"] = 47;
	queryObj["records"] = new Array();
	
	// ここからループ
	for (var i = 0; i < tableRecords.length; i++) {
		var partObj = new Object();

		partObj["NyusyutuNumber"] = {value: "0001"};

		partObj["NyusyutuDate"] = {value: (event.record['ProcessDate']['value']).slice(0,10)};

		partObj["NyusyutuKbn"] = {value: event.record['ProcessKbn']['value']};

		partObj["SlipNumber"] = {value: event.record['SlipNumber']['value']};
		
		partObj["SpaceCodeSaki"] = {value: event.record['SpaceCode']['value']};
		
		partObj["ItemCd"] = {value: tableRecords[i].value['ItemCd'].value};
		
		queryObj["records"].push(partObj);
	}
	// ここまでループ
	
	var addparams = queryObj;

	var appUrl = kintone.api.url('/k/v1/records');
	// CSRFトークンの取得
	var token = kintone.getRequestToken();
	addparams["__REQUEST_TOKEN__"] = token; 
	
	// 同期リクエストを行う
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('POST', appUrl, false);
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
	xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
	xmlHttp.send(JSON.stringify(addparams));
	if (xmlHttp.status == 200){
		var obj = JSON.parse(xmlHttp.responseText);
		alert(xmlHttp.status + '：登録に成功しました。');
	} else {
		alert(xmlHttp.status + '：登録エラー');
	}
};

SlipService.prototype.getSlipNumber = function(keyVal) {
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

			this.recNo = parseInt(strGetVal.slice(-3),10) + 1;
			
		} catch(e){
			this.message = '伝票番号が取得できません。';
			return false;
		}
	}
	return true;
};
