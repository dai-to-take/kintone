var _pcreatorConfig;

_pcreatorConfig = _pcreatorConfig || {};

_pcreatorConfig = {
appCode: "efd1aaa17dca6d7469cd77ed68dc93ee0f18b171",
baseUrl: "//print.kintoneapp.com"
};

(function() {
  "use strict"
  
  kintone.events.on('app.record.detail.show', function (event) {
    var l, s, scr, styl;
    _pcreatorConfig.event = event;
    styl = document.createElement("link");
    styl.rel = "stylesheet";
    styl.type = "text/css";
    styl.href = "//print.kintoneapp.com/build/kintone-lib.css";
    l = document.getElementsByTagName("link")[0];
    l.parentNode.insertBefore(styl, l);
    scr = document.createElement("script");
    scr.type = "text/javascript";
    scr.async = true;
    scr.src = "//print.kintoneapp.com/build/kintone-lib.js";
    s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(scr, s);

    return event;
  });
  kintone.events.on('app.record.index.show', function (event) {
    var l, s, scr, styl;
    _pcreatorConfig.event = event;
    styl = document.createElement("link");
    styl.rel = "stylesheet";
    styl.type = "text/css";
    styl.href = "//print.kintoneapp.com/build/kintone-lib.css";
    l = document.getElementsByTagName("link")[0];
    l.parentNode.insertBefore(styl, l);
    scr = document.createElement("script");
    scr.type = "text/javascript";
    scr.async = true;
    scr.src = "//print.kintoneapp.com/build/kintone-lib.js";
    s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(scr, s);

    return event;
  });
})();
