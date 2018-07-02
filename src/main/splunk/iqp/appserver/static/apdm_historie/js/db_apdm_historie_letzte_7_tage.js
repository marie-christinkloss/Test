require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunk.i18n",
    "splunkjs/mvc/simplexml/element/table",
    "../app/iqp/DockedTableView/DockedTableElement",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/savedsearchmanager",
    "../app/iqp/excel_export_fnc",
    "../app/iqp/werkfilter_fnc",
    "splunkjs/mvc/simplexml"
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/checkboxview"
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        i18n,
        TableElement,
        DockedTableElement,
        TableView,
        SearchManager,
        SavedSearchManager,
        excel_export,
        erstelleWerkfilter
 
        // Add comma-separated parameter names here, for example:
        // ...UrlTokenModel,
        // CheckboxView
        
        ) {
           
        var defaultTokenModel = mvc.Components.getInstance('default');
        var submittedTokenModel = mvc.Components.getInstance('submitted');
        
        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }
        
        var i18n_pruefumfangName = i18n._("Pruefumfang");
        var i18n_description = i18n._("Pruefprozedur");
        var i18n_testStepName = i18n._("Pruefling");
        var i18n_param1 = i18n._("SGBD");
        var i18n_ErrorCodeDec = i18n._("Error Code (Dec)");
        var i18n_resultData = i18n._("Result Data");
        
        var search_hist_7d = new SearchManager({
            "id": "search_hist_7d",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "search": 
                '| loadjob savedsearch="nobody:iqp:apdm_historie_7_tage" \n' + 
                '| search werk="$werkfilter$" pruefumfangName="$pruefumfang$" testStepName="$pruefling$" description="$pruefprozedur$" param1="$sgbd$" ErrorCodeDec="$errorCodeDec$" resultData="$resultData$" \n' + 
                '| stats \n' + 
                '    sum(20*) as 20* \n' + 
                '  by pruefumfangName, testStepName, description, param1, ErrorCodeDec, resultData \n' +
                '| rename \n' + 
                '  pruefumfangName AS "' + i18n_pruefumfangName + '" \n' + 
                '  description AS "' + i18n_description + '" \n' + 
                '  testStepName AS "' + i18n_testStepName + '" \n' + 
                '  param1 AS "' + i18n_param1 + '" \n' + 
                '  ErrorCodeDec AS "' + i18n_ErrorCodeDec + '" \n' + 
                '  resultData AS "' + i18n_resultData + '"',
            "latest_time": "$latest$",
            "earliest_time": "-7d",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});

        var tbl_hist_7d = new DockedTableElement({
            "id": "tbl_hist_7d",
            "count": 100,
            "dataOverlayMode": "none",
            "drilldown": "cell",
            "rowNumbers": "false",
            "wrap": "true",
            "managerid": "search_hist_7d",
            "el": $('#tbl_hist_7d')
        }, {tokens: true, tokenNamespace: "submitted"});
        tbl_hist_7d.render();
        
        
        function hist_drilldown(e) {
            if (e.field !== undefined) {
                e.preventDefault();
            }
            if ( [i18n_pruefumfangName,i18n_testStepName,i18n_description,i18n_param1,i18n_ErrorCodeDec,i18n_resultData].indexOf(e.field) == -1) {
                
                var clicked_date = TokenUtils.replaceTokenNames("$click.name2$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
                var inOff = "";
                if (clicked_date.match(/%20I$/)) {
                    inOff = "true";
                } else if (clicked_date.match(/%20O$/)) {
                    inOff = "false";
                } else {
                    inOff = "*";
                }
                clicked_date = clicked_date.replace(/%20(I|O)$/,'');
                if (clicked_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    earliest_utc=new Date(Date.parse(clicked_date+"T00:00:00Z"));
                    var earliest =((earliest_utc.getTime()+earliest_utc.getTimezoneOffset()*60*1000)/1000).toString();
                    latest_utc=new Date(Date.parse(clicked_date+"T24:00:00Z"));
                    var latest =((latest_utc.getTime()+latest_utc.getTimezoneOffset()*60*1000)/1000).toString();
                } else {
                    console.log("Falscher Feldname");
                    return;
                }
                
                var url = TokenUtils.replaceTokenNames('/app/iqp/apdm_recherche_thema?form.pruefumfangName=$row.' + i18n_pruefumfangName + '$&form.testStepName=$row.' + i18n_testStepName + '$&form.description=$row.' + i18n_description + '$&form.param1=$row.' + i18n_param1 + '$&form.ErrorCodeDec=$row.' + i18n_ErrorCodeDec + '$&form.resultData=$row.' + i18n_resultData + '$&form.werkfilter=$werkfilter$&form.filt_inline=' + inOff + '&form.tsdatum.earliest=' + earliest + '&form.tsdatum.latest=' + latest, _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
                utils.redirect(url, newWindow = true);
            } else {
                if (e.field == i18n_pruefumfangName) {
                    setToken("form.pruefumfang", e.data["click.value2"]);
                } else if (e.field == i18n_testStepName) {
                    setToken("form.pruefling", e.data["click.value2"]);
                } else if (e.field == i18n_description) {
                    setToken("form.pruefprozedur", e.data["click.value2"]);
                } else if (e.field == i18n_param1) {
                    setToken("form.sgbd", e.data["click.value2"]);
                } else if (e.field == i18n_ErrorCodeDec) {
                    setToken("form.errorCodeDec", e.data["click.value2"]);
                } else if (e.field == i18n_resultData) {
                    setToken("form.resultData", e.data["click.value2"]);
                } 
            }
        }

        tbl_hist_7d.on("click", hist_drilldown);
        
        // Aufruf der Excelexport-Funktion aus excel_export_fnc.js
        // excel_export(<table id>, <search id>);
        excel_export.excel_export("tbl_hist_7d", "search_hist_7d");
            
            
            
            
        // erstelleWerkfilter
        erstelleWerkfilter( "werkinput" );
});