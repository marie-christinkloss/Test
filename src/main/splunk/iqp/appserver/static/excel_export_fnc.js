
define([
    'splunkjs/mvc',
    "splunkjs/mvc/utils",
    'jquery',
    "splunk.i18n",
    "splunkjs/mvc/searchmanager",
    "../../app/iqp/splunkUtils"
    ],function(
        mvc,
        utils,
        $,
        i18n,
        SearchManager,
        splunkUtils
    ){
    var i18n_excelExport = i18n._("Excel Export");
    var i18n_pleaseWait = i18n._("Bitte Warten ...");
    var i18n_close = i18n._("Schließen");
    var i18n_error = i18n._("Fehler");
    
    var exportPopupFooter = $('<button id="export_close" type="button" class="btn" data-dismiss="modal">' + i18n_close + '</button>');
    
    function add_excel_export_button(baseSearch, latestTok, earliestTok) {
        var interval = setInterval(function () {
            if($('span.dashboard-view-controls').length) {
                add_excel_export(baseSearch, latestTok, earliestTok);
                clearInterval(interval);
            } else {
                if (time > maxTime) {
                    clearInterval(interval);
                    return;
                }
                time += 200;
            }
        }, 200);
    }
    
    function add_excel_export(baseSearch, latestTok, earliestTok) {
        var submittedTokenModel = mvc.Components.getInstance('submitted');
        $('span.dashboard-view-controls').append('<a class="btn edit-excel-export" href="#" style="margin-right: 3px;">' + i18n_excelExport + '</a>');
        $('span.dashboard-view-controls > .edit-excel-export').on("click", function() {
            var searchMan = new SearchManager({
                    "id": "excel_export_baseSearch",
                    "latest_time": submittedTokenModel.get(latestTok),
                    "earliest_time": submittedTokenModel.get(earliestTok),
                    "search": baseSearch,
                    "status_buckets": 0,
                    "sample_ratio": 1,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": false,
                    "runWhenTimeIsUndefined": false,
                    "autostart": false
            }, {
                tokens: true, 
                tokenNamespace: "submitted"
            });
            
            searchMan.on("search:error", function(properties) {
                var body = $('<div></div>').append(
                    '<div width="100%" align="center">\n' +
                    '    <p><span id="exportInfo">' + properties + '</span><p/>\n' +
                    '</div>'
                );
                splunkUtils.showPopup(i18n_error, body, exportPopupFooter);
                mvc.Components.revokeInstance("excel_export_baseSearch");
            });
            
            searchMan.on("search:failed", function(properties) {
                var body = $('<div></div>').append(
                    '<div width="100%" align="center">\n' +
                    '    <p><span id="exportInfo">' + properties + '</span><p/>\n' +
                    '</div>'
                );
                splunkUtils.showPopup(i18n_error, body, exportPopupFooter);
                mvc.Components.revokeInstance("excel_export_baseSearch");
            });
            
            searchMan.on("search:start", function(properties) {
                var exportWaitPopupBody = $('<div></div>').append(
                    '<div width="100%" align="center">\n' +
                    '    <img width="100px" src="/static/app/RDS_TA_html2pdf/loader.gif"/>\n' +
                    '    <p><span id="exportInfo"></span><p/>\n' +
                    '</div>'
                );
                
                splunkUtils.showPopup(i18n_pleaseWait, exportWaitPopupBody, false);
            });
            
            searchMan.on("search:done", function(properties) {
                console.log(properties);
                console.log("SEARCH DONE: ");
                console.log("    sid: " + searchMan.job.sid);
                console.log("    earliest: " + searchMan.attributes.earliest_time);
                console.log("    latest: " + searchMan.attributes.latest_time);
                console.log("    count: " + properties.content.resultCount);
                $('#myModal').modal('hide');
                window.open('/custom/excel_export/excel/' + searchMan.job.sid + '?count=1000000', '_blank');
                mvc.Components.revokeInstance("excel_export_baseSearch");
            });
            
            searchMan.startSearch();
        });
    }
    
    function excel_export(table_id, search_id) {
        //var tokens = mvc.Components.getInstance("default");
        //var sTokens = mvc.Components.getInstance("submitted");
        
        var excel_table_search = mvc.Components.getInstance(search_id);
        excel_table_search.on("search:done", function() {
            $("#excel_link_"+table_id).remove();
            element='<a id="excel_link_'+table_id+'" title="" class="excel_link inspect-button btn-pill" href="/custom/excel_export/excel/'+excel_table_search.job.sid+'" style="display: inline-block;" data-original-title="Excelexport"><i class="icon-excel" /></a>';
            $("#"+table_id+" .view-results .refresh-button").after(element);
            $("#excel_link_"+table_id).tooltip();
        });
    }
    
    var excel_export_func = {
            excel_export : excel_export,
            add_excel_export_button : add_excel_export_button
        };
    
    return excel_export_func;
})

/*
function(require){
    var mvc = require('splunkjs/mvc');
    var $ = require('jquery');
    var utils = require('splunkjs/mvc/utils');
    var SearchManager = require('splunkjs/mvc/searchmanager');

    

    return excel_export;
}

function excel_export(table_id, search_id) {
    
    
    var deps = [
        "splunkjs/mvc",
        "jquery",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/searchmanager",
        "splunkjs/ready!",
        "splunkjs/mvc/simplexml/ready!"
    ];
    require(deps, function(mvc, $, utils, SearchManager) {
        var tokens = mvc.Components.getInstance("default");
        var sTokens = mvc.Components.getInstance("submitted");
        
        // Intergriere ExcelLink
        var excel_table_search = mvc.Components.getInstance(search_id);
        excel_table_search.on("search:done", function() {
            $("#excel_link_"+table_id).remove();
            element='<a id="excel_link_'+table_id+'" title="" class="excel_link inspect-button btn-pill" href="/custom/excel_export/excel/'+excel_table_search.job.sid+'" style="display: inline-block;" data-original-title="Excelexport"><i class="icon-excel" /></a>';
            $("#"+table_id+" .view-results .refresh-button").after(element);
            $("#excel_link_"+table_id).tooltip();
     
        })
        
        //    excel_export("ipsq_table", "ipsq_search");
    });
}*/