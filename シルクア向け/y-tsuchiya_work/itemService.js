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

ItemService.prototype.createPutRecords = function(records) {
    var putRecords = [];
    for (var i = 0, l = records.length; i < l; i++) {
        var record = records[i];
        putRecords[i] = {
            id: record['$id'].value,
            record: {
                ItemCd: {
                    value: this.record['ItemCd']['value']
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
 
ItemService.prototype.updateLookup = function(appId, records) {
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