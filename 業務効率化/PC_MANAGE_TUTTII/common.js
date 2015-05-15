/* common.js */

// 年月変換関数
function getYmd(strDate) {
	var v1 = moment(new Date(strDate));
	return v1.format("YYYYMM");
};

		