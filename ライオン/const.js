/* const.js */
var _STATUS = {
  'OK': '10',
  'WARNING': '80',
  'ERROR': '90'
};
Object.freeze(_STATUS);

var _CHECK = {
  'YES': 'YES',
  'NO': 'NO',
  'ERROR': 'ERROR'
};
Object.freeze(_CHECK);

var _MODE = {
  'S': 'Single',
  'M': 'Multi'
};
Object.freeze(_MODE);

var _IDOKBN = {
  'NYUKO': '入庫',
  'SYUKO': '出庫',
  'SELL': '販売'
};
Object.freeze(_IDOKBN);

var _IDORSN = {
  'PURCH': '仕入',
  'SHIP': '出荷',
  'SELL': '売上',
  'RETURN': '返却',
  'CLEAN': 'クリーニング',
  'REPAIR': '修理'
};
Object.freeze(_IDORSN);

var _SILPNUM = {
  'PURCH': 'P',
  'SHIP': 'D',
  'SELL': 'S',
  'RETURN': 'R',
  'NST': 'M'
};
Object.freeze(_SILPNUM);

var _CONDKBN = {
  'WHA': '自社内',
  'SHIP': '出荷先',
  'SELL': '販売済',
  'FAUL': '不良'
};
Object.freeze(_CONDKBN);

var _OFFICE = {
  'SILK': 'SA',
  'LION': 'LR'
};
Object.freeze(_OFFICE);

var _OFFICEYEAR = {
  'SILK': 4,
  'LION': 5
};
Object.freeze(_OFFICEYEAR);

var _CALKBN = {
  'ADD': 'ADDIND',
  'SUB': 'SUBTRANCTION'
};
Object.freeze(_CALKBN);

var _DIGITS = {
  'ITEMLENG': 7,
  'SLIPNUM': -3,
  'IDONUM': -5,
  'ITEMCD': -5,
  'LOCATIONCD': -3,
};
Object.freeze(_DIGITS);

var _APPID = {
  'IDO': 127,
  'ITEM': 120,
  'ZAIKO': 122
};
Object.freeze(_APPID);


var _OFFICENAME = {
  'LION': 'ライオンラグス',
  'SILK': 'シルクラアジア'
};
Object.freeze(_OFFICENAME);

var _USEROFFICE = {
  'to-take': _OFFICENAME.SILK,
  '2sg-share': _OFFICENAME.LION,
  'lion': _OFFICENAME.LION
};
Object.freeze(_USEROFFICE);

var _SOUKOCD = {
  'LION': 'W00001',
  'SILK': 'W00002'
};
Object.freeze(_SOUKOCD);

var _USERSOUKO = {
  'to-take': _SOUKOCD.SILK,
  '2sg-share': _SOUKOCD.LION,
  'lion': _SOUKOCD.LION
};
Object.freeze(_USERSOUKO);

// ヌーリ工房（nuri）
// ジェッディ工房（Jeddi）
// セイエディアン工房（Seyediyan）
// セイラフィアン工房（Seirafian）
// ダヴァリ工房（Davari）
// ババイ工房（Babai）
// ミルメーディ工房（Mir-Mehdi）
// ラジャビアン工房（Rajabian）
