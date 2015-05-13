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

SpaceService.prototype.putNyusyutuRecords = function() {
	
	//アプリID
	var appId_nyusyutu = 47;
	//場所コード(画面)
	var strSpaceCode = this.record['SpaceCode']['value'];
	
	//入出庫管理の場所コードが一致する全てのレコードを更新する。
	var offset = 0;
	var records = new Array();
	var loopendflg = false;
	
	while(!loopendflg){
	  var query = encodeURIComponent('SpaceCodeSaki = "' + strSpaceCode + '" order by レコード番号 asc limit 100 offset ' + offset);
	  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId_nyusyutu + '&query=' + query;
	 
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
	
    var putRecords = [];
	
    for (var i = 0, l = records.length; i < l; i++) {
        var record = records[i];
        putRecords[i] = {
            id: record['$id'].value,
            record: {
                SpaceCodeSaki: {
                    value: this.record['SpaceCode']['value']
                }
            }
        };
    }
    return putRecords;
};

SpaceService.prototype.putZaikoRecords = function() {
	
	//アプリID
	var appId_zaiko = 45;
	//場所コード(画面)
	var strSpaceCode = this.record['SpaceCode']['value'];
	
	//入出庫管理の場所コードが一致する全てのレコードを更新する。
	var offset = 0;
	var records = new Array();
	var loopendflg = false;
	
	while(!loopendflg){
	  var query = encodeURIComponent('SpaceCode = "' + strSpaceCode + '" order by レコード番号 asc limit 100 offset ' + offset);
	  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId_zaiko + '&query=' + query;
	 
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
    var putRecords = [];
	
    for (var i = 0, l = records.length; i < l; i++) {
        var record = records[i];
        putRecords[i] = {
            id: record['$id'].value,
            record: {
                SpaceCode: {
                    value: this.record['SpaceCode']['value']
                }
            }
        };
    }
    return putRecords;
};

SpaceService.prototype.putItemRecords = function() {
	
	//アプリID
	var appId_item = 56;
	//場所コード(画面)
	var strSpaceCode = this.record['SpaceCode']['value'];
	
	//入出庫管理の場所コードが一致する全てのレコードを更新する。
	var offset = 0;
	var records = new Array();
	var loopendflg = false;
	
	while(!loopendflg){
	  var query = encodeURIComponent('SpaceLookUp = "' + strSpaceCode + '" order by レコード番号 asc limit 100 offset ' + offset);
	  var appUrl = kintone.api.url('/k/v1/records') + '?app='+ appId_item + '&query=' + query;
	 
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
	
    var putRecords = [];
	
    for (var i = 0, l = records.length; i < l; i++) {
        var record = records[i];
        putRecords[i] = {
            id: record['$id'].value,
            record: {
                SpaceLookUp: {
                    value: this.record['SpaceCode']['value']
                }
            }
        };
    }
    return putRecords;
};
 
    /**
     * ルックアップを一括更新する関数
     * @param appId ルックアップの更新を行うアプリID
     * @param records 一括更新するrecordsデータ
     */
 
SpaceService.prototype.updateLookup = function(appId, records) {

    kintone.api(
        kintone.api.url('/k/v1/records', true),
        'PUT', {
            app: appId,
            records: records
        },
        function(resp) {
            alert('ルックアップの更新が完了しました!');
        }
    )
};