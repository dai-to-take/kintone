/* common.js */
var _CONST = {
  'OK': '10',
  'WARNING': '80',
  'ERROR': '90'
};
Object.freeze(_CONST);

var _APPID = {
  'ITEM': 15,
  'NYUSYUTU': 41
};
Object.freeze(_APPID);

// 産地名称（略称）変換関数
function getLocalNm(strLocality) {
	return strLocality.slice(strLocality.lastIndexOf("(") + 1 , strLocality.lastIndexOf("(") + 4);
};

// 形状変換（名称⇒コード）関数
function getShapeCd(strShape) {
	switch (strShape) {
		case '長方形':
			var strShapeCd = "1";break;
		case '正方形':
			var strShapeCd = "2";break;
		case '円形':
			var strShapeCd = "3";break;
		case '楕円形':
			var strShapeCd = "4";break;
		case '八角形':
			var strShapeCd = "5";break;
		case 'その他':
			var strShapeCd = "6";break;
		default:
			var strShapeCd = "E";break;
	};
	
	return strShapeCd;
};

// 場所区分（名称⇒コード）変換関数
function getSpaceKbnCd(strSpaceKbn) {
	switch (strSpaceKbn) {
		case '自社倉庫':
			var strSpaceCd = "W";break;
		case 'ショールーム':
			var strSpaceCd = "S";break;
		case 'デパート':
			var strSpaceCd = "D";break;
		case '催事場':
			var strSpaceCd = "E";break;
		case '卸倉庫':
			var strSpaceCd = "G";break;
		default:
			var strSpaceCd = "Z";break;
	};
	
	return strSpaceCd;
};

// エリア区分（略称）変換関数
function getAreaCd(strAreaKbn) {
	return strAreaKbn.slice(0 , 2);
};

// 年月変換関数
function getYmd(strDate) {
	var v1 = moment(new Date(strDate));
	return v1.format("YYYYMM");
};

		