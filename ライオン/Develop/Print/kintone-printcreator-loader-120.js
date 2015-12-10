var _pcreatorConfig;

_pcreatorConfig = _pcreatorConfig || {};

_pcreatorConfig = {
appCode: "c90a3c79aca99323a75e4f30b9f272aa851204d6",
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
