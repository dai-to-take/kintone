/* common.js */
var _CONST = {
  'OK': '10',
  'WARNING': '80',
  'ERROR': '90'
};
Object.freeze(_CONST);

var _APPID = {
  'IDO': 97,
  'ITEM': 94
};
Object.freeze(_APPID);

var _NSTKBN = {
  'PURCH': '仕入',
  'DEL': '納入',
  'SELL': '売上',
  'RETURN': '返却'
};
Object.freeze(_NSTKBN);

var _SILPNUM = {
  'PURCH': 'P',
  'DEL': 'D',
  'SELL': 'S',
  'RETURN': 'R',
  'NST': 'N'
};
Object.freeze(_NSTKBN);

var _CONDKBN = {
  'WHA': '自社内',
  'DEL': '納入先',
  'SELL': '販売済',
  'FAUL': '不良'
};
Object.freeze(_CONDKBN);

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

// 倉庫コード変換（コード⇒略コード）関数
function getWarehouseCd(strWarehouseCd) {
	switch (strWarehouseCd.slice(0, 2)) {
		case 'WH':
			var strGetWarehouseCd = "M";break;
		case 'WS':
			var strGetWarehouseCd = "A";break;
		default:
			var strGetWarehouseCd = "O";break;
	};
	
	return strGetWarehouseCd;
};
// 倉庫区分（名称⇒コード）変換関数
function getWarehouseKbnCd(strWarehouseKbn) {
	switch (strWarehouseKbn) {
		case '自社倉庫':
			var strWarehouseCd = "WH";break;
		case 'ショールーム':
			var strWarehouseCd = "WS";break;
		default:
			var strWarehouseCd = "WZ";break;
	};
	
	return strWarehouseCd;
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

// 顧客区分（名称⇒コード）変換関数
function getCustomerKbnCd(strCustomerKbn) {
	switch (strCustomerKbn) {
		case '納入先':
			var strCustomerCd = "D";break;
		case '仕入先':
			var strCustomerCd = "P";break;
		case '購入先':
			var strCustomerCd = "C";break;
		default:
			var strCustomerCd = "Z";break;
	};
	
	return strCustomerCd;
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

// ヌーリ工房（nuri）
// ジェッディ工房（Jeddi）
// セイエディアン工房（Seyediyan）
// セイラフィアン工房（Seirafian）
// ダヴァリ工房（Davari）
// ババイ工房（Babai）
// ミルメーディ工房（Mir-Mehdi）
// ラジャビアン工房（Rajabian）
