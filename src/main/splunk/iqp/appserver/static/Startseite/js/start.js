var deps = [
    "jquery",
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!"
];
require(deps, function($) {
    $("#panel1 h2.panel-title").prepend('<div style="text-align: center"><h2 style="color: #5379af;">FG-9 Innovation Lab &amp; TV-2-I</h2><img width="400px" src="/static/app/iqp/logo_without_background.png"></div>')
});
