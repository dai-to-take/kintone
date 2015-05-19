/* ApplyTakePcService.js */

ApplyTakePcService = function(record) {
	this.status = "";
	this.message = "";
	this.record = record;
	
	this.strApplyDate = this.record['applyDate']['value'];
};

ApplyTakePcService.prototype.initNumbering = function() {
	
	// 申請日を作成
	this.applyDate = moment(this.strApplyDate,"YYYY-MM-DD"); 
	// 基準日を作成(YYYY-07-01)
	this.baseDate = moment(new Date(this.applyDate.year() ,'6', '1'));

	
	if(this.applyDate < this.baseDate){
		// 開始終了年を生成
		this.startDate = moment(new Date(this.applyDate.year() - 1 ,'6', '1'));
		this.endDate = moment(new Date(this.applyDate.year() , '6', '1'));
		//採番用年を取得
		this.postYear = parseInt(this.strApplyDate.slice(2,4)) -1;
	} else {
		// 開始終了年を生成
		this.startDate = moment(new Date(this.applyDate.year() , '6', '1'));
		this.endDate = moment(new Date(this.applyDate.year() + 1 , '6', '1'));
		//採番用年を取得
		this.postYear = this.strApplyDate.slice(2,4);
	}
	
	// 初期化
	this.recNo = 1;
	// クリエリー作成
	this.query = 'applyDate >= "' + this.startDate.format("YYYY-MM-DD") + '" and applyDate <"' + this.endDate.format("YYYY-MM-DD") + '" order by applyNo limit 1';
	
	// API用URL作成
	this.apiUrl = kintone.api.url('/k/v1/records',true) + '?app='+ kintone.app.getId() + '&query=' + encodeURI(this.query);
};

ApplyTakePcService.prototype.getRecords = function() {
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

ApplyTakePcService.prototype.getApplyNo = function(keyVal) {
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

			this.recNo = parseInt(strGetVal.slice(-3),10) +1;
			
		} catch(e){
			this.message = '申請Noが取得できません。';
			return false;
		}
	}
	return true;
};

ApplyTakePcService.prototype.getAutoApplyNo = function(shapeNm) {
	return "PC-" + this.postYear + "-" + ('000' + this.recNo).slice(-3);
};

ApplyTakePcService.prototype.getMessage = function() {
  return this.message;
};

ApplyTakePcService.prototype.putRecords = function(appId) {

	//管理番号(画面)
	var strControlNumber = this.record['controlNumber']['value'];
	
	//場所コードが一致する全てのレコードを更新する。
	var offset = 0;
	var records = new Array();
	var loopendflg = false;
	
    var query = encodeURIComponent('controlNumber = "' + strControlNumber + '"');
    var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId + '&query=' + query;
   
    // 同期リクエストを行う
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", appUrl, false);
    xmlHttp.setRequestHeader('X-Requested-With','XMLHttpRequest');
    xmlHttp.send(null);
   
    //取得したレコードをArrayに格納
    var respdata = JSON.parse(xmlHttp.responseText);
    records = respdata.records
	
	//申請種別が持出かどうかを判断
	var strApplyKbn = this.record['applyKbn']['value'];
	var takeOutFlg = strApplyKbn.indexOf("持出");

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
    	
    	//利用者と利用場所を更新する。
    	//申請種別が持出ならば相手設置場所、持込ならば本社を設定する。
    	if(takeOutFlg == 0){
    		partObj["record"] = {userName:{value:this.record['userName']['value']},location:{value:this.record['spaceName']['value']}};
    	} else {
    		partObj["record"] = {userName:{value:this.record['userName']['value']},location:{value:"本社"}};
    	}
		queryObj["records"].push(partObj);
    }
	
	if(records.length > 0){
		this.updateLookup(appId,queryObj);
	}
};
 
    /**
     * レコードを更新する関数
     */
 
ApplyTakePcService.prototype.updateLookup = function(appId, queryObj) {
	
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