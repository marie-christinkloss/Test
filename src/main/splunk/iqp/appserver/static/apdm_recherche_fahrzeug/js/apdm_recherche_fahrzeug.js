//# sourceURL=apdm_recherche_fahrzeug/js/apdm_recherche_fahrzeug.js


require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tableview",
    "jquery",
    "underscore",
    "splunkjs/mvc/simpleform/formutils",
    "../app/iqp/excel_export_fnc",
    "../app/iqp/werkfilter_fnc",
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!"
], function(
        mvc,
        utils,
        TableView,
        $,
        _,
        FormUtils,
        excel_export,
        erstelleWerkfilter
    ) {
    var defaultTokenModel = mvc.Components.getInstance("default");
    var submittedTokenModel = mvc.Components.getInstance("submitted");
    
    function setToken(name, value) {
        defaultTokenModel.set(name, value);
        submittedTokenModel.set(name, value);
    }
    
    function getToken(name) {
        return submittedTokenModel.get(name);
    }
    
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return _(['source']).contains(cell.field);
        },
        render: function($td, cell) {
            $td.addClass('invisible-cell');
            $td.text(cell.value);
        }
    });
    
    var tbl_pruefungen = mvc.Components.getInstance("tbl_pruefungen");
    tbl_pruefungen.on("click", function (e) {
        if ((e.field !== undefined)) {
            e.preventDefault();
            setToken("pruefumfangName_det", e.data["row." + getToken("i18n_Pruefumfang")]);
            setToken("testTime_det", e.data["row." + getToken("i18n_Test_Zeit")]);
            setToken("source", e.data["row.source"]);
        }
    });
    
    tbl_pruefungen.getVisualization(function(tableView) {
        tableView.addCellRenderer(new CustomRangeRenderer());
    });
    
    // setze die Filtertoken auf den leeren String, wenn kein Filter gesetzt ist
    var input_systemName = mvc.Components.getInstance("input_systemName");
    var input_testStand = mvc.Components.getInstance("input_testStand");
    var input_pruefumfangName = mvc.Components.getInstance("input_pruefumfangName");
    var input_complete = mvc.Components.getInstance("input_complete");
    var input_errorCount = mvc.Components.getInstance("input_errorCount");
    var input_testDuration = mvc.Components.getInstance("input_testDuration");
    var input_keywords = mvc.Components.getInstance("input_keywords");

    if (! getToken("systemName")) setToken("systemName","");
    input_systemName.on("change", function(newValue) {
        FormUtils.handleValueChange(input_systemName);
        if ( newValue.length == 0 ) setToken("systemName","");
    });
    if (! getToken("testStand")) setToken("testStand","");
    input_testStand.on("change", function(newValue) {
        FormUtils.handleValueChange(input_testStand);
        if ( newValue.length == 0 ) setToken("testStand","");
    });
    if (! getToken("pruefumfangName")) setToken("pruefumfangName","");
    input_pruefumfangName.on("change", function(newValue) {
        FormUtils.handleValueChange(input_pruefumfangName);
        if ( newValue.length == 0 ) setToken("pruefumfangName","");
    });
    if (! getToken("complete")) setToken("complete","");
    input_complete.on("change", function(newValue) {
        FormUtils.handleValueChange(input_complete);
        if ( newValue.length == 0 ) setToken("complete","");
    });
    if (! getToken("errorCount")) setToken("errorCount","");
    input_errorCount.on("change", function(newValue) {
        FormUtils.handleValueChange(input_errorCount);
        if (! newValue ) setToken("errorCount","");
        if (newValue > -1) {
            setToken("form.testStepResult",'testStepResult="NOK"')
            setToken("testStepResult",'testStepResult="NOK"')
        }
    });
    if (! getToken("testDuration")) setToken("testDuration","");
    input_testDuration.on("change", function(newValue) {
        FormUtils.handleValueChange(input_testDuration);
        if (! newValue ) setToken("testDuration","");
    });
    if (! getToken("keywords")) setToken("keywords","");
    input_keywords.on("change", function(newValue) {
        FormUtils.handleValueChange(input_keywords);
        if (! newValue ) setToken("keywords","");
    });
    
    // replace single backslashes in source by double backslashes
    defaultTokenModel.on("change:row", function(model, value, options) {
        setToken("source",value.replace(/\\/g,'\\\\'));
    });
    
    // set pruefumfang-filter when clicking on table
    mvc.Components.getInstance("element_pruefumfaenge").on("click", function(e) {
        if (e.field !== undefined) {
            e.preventDefault();
            var pruefumfangName=e.data["row.Prüfumfang"];
            var pruefumfangFilter=getToken("form.pruefumfangName");
            
            if ( pruefumfangFilter ) {
                if ($.inArray(pruefumfangName,pruefumfangFilter) != -1) {
                    pruefumfangFilter.splice(pruefumfangFilter.indexOf(pruefumfangName),1);
                } else {
                    pruefumfangFilter.push(pruefumfangName);
                }
            } else {
                pruefumfangFilter= [ pruefumfangName ];
            }
            
            setToken("form.pruefumfangName",pruefumfangFilter);
            mvc.Components.getInstance("input_pruefumfangName").render();
        }
    });

    // Aufruf der Excelexport-Funktion aus excel_export_fnc.js
    excel_export.excel_export("tbl_pruefungen", "search_pruefungen");
    excel_export.excel_export("tbl_nacharbeiten", "search_nacharbeiten");
    

    // erstelleWerkfilter
    erstelleWerkfilter( "werkinput" );
    
});
