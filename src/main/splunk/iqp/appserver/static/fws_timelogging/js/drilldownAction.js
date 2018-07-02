//# sourceURL=fws_timelogging/js/drilldownAction.js

require([
    "splunkjs/mvc",
    "splunkjs/mvc/tokenutils",
    "jquery",
    "splunk.i18n",
    "../../app/iqp/splunkUtils",
    "../../app/RDS_TA_html2pdf/html2pdf",
    "../../app/iqp/excel_export_fnc",
    "../app/iqp/werkfilter_fnc",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    TokenUtils,
    $,
    i18n,
    splunkUtils,
    html2pdf,
    excelExportFnc,
    erstelleWerkfilter
) {
    console.log("Execute: drilldownAction.js");
    
    var defaultTokenModel = mvc.Components.getInstance('default');
    var submittedTokenModel = mvc.Components.getInstance('submitted');
    
    var vinInput = mvc.Components.getInstance("vinInput");
    var tsInput = mvc.Components.getInstance("tsInput");    
    var wacInput = mvc.Components.getInstance("wacInput");
    var rnInput = mvc.Components.getInstance("rnInput");
    
    var vinTable = mvc.Components.getInstance("vinTable");
    vinTable.on("click", function (e) {
        e.preventDefault();
        if ((e.field !== undefined)) {
            if (vinInput.val() === null) {
                console.log("vinInput ist NULL");
            } else {
                var tmpColName = defaultTokenModel.get("i18n_FGNR");
                vinInput.val(TokenUtils.replaceTokenNames("$row." + tmpColName + "$", _.extend(defaultTokenModel.toJSON(), e.data)));
                vinInput.render();
            }
            if (tsInput.val() === null) {
                console.log("tsInput ist NULL");
            } else {
                var tmpColName = defaultTokenModel.get("i18n_testStand");
                tsInput.val(TokenUtils.replaceTokenNames("$row." + tmpColName + "$", _.extend(defaultTokenModel.toJSON(), e.data)));
                tsInput.render();
            }
            if (wacInput.val() === null) {
                console.log("wacInput ist NULL");
            } else {
                var tmpColName = defaultTokenModel.get("i18n_wheelAlignmentCode");
                wacInput.val(TokenUtils.replaceTokenNames("$row." + tmpColName + "$", _.extend(defaultTokenModel.toJSON(), e.data)));
                wacInput.render();
            }
        }
    });
    
    var vinMvInput = mvc.Components.getInstance("vinMvInput");
    vinMvInput.on("change", function(newValue) {
        splunkUtils.handleAllOption(this, newValue, defaultTokenModel)
    });
    
    var tsIMvnput = mvc.Components.getInstance("tsIMvnput");
    tsIMvnput.on("change", function(newValue) {
        splunkUtils.handleAllOption(this, newValue, defaultTokenModel)
    });
    
    var wacMvInput = mvc.Components.getInstance("wacMvInput");
    wacMvInput.on("change", function(newValue) {
        splunkUtils.handleAllOption(this, newValue, defaultTokenModel)
    });
    
    var sacMvInput = mvc.Components.getInstance("sacMvInput");
    sacMvInput.on("change", function(newValue) {
        splunkUtils.handleAllOption(this, newValue, defaultTokenModel)
    });
    
    var vinChart = mvc.Components.getInstance("vinChart");
    vinChart.on("click", function (e) {
        e.preventDefault();
                var tmpColName = defaultTokenModel.get("i18n_FGNR");
        vinInput.val(TokenUtils.replaceTokenNames("$row." + tmpColName + "$", _.extend(defaultTokenModel.toJSON(), e.data)));
        vinInput.render();
        tsInput.val("*");
        tsInput.render();
        wacInput.val("*");
        wacInput.render();
        $("#tab2").click();
        $("#FGNR_Filter").hide(400);
        $("#showF").text(i18n._("Show Filters"));
    });
    
    $("#reset_FGNR_button").on("click", function (){
        submittedTokenModel.set("tok_clk_shortVIN", "*");
    });
    
    $('<a id="showF" class="show-global-filters noPrint" onclick="if ($(\'#FGNR_Filter\').is(\':visible\')) {$(\'#FGNR_Filter\').hide(400);$(\'#showF\').text(\'Show Filters\');} else {$(\'#FGNR_Filter\').show(400);$(\'#showF\').text(\'Hide Filters\');}" href="#">Show Filters</a>').appendTo("#FGNR_Gantt h2");
    
    $("#tab2").on("click", function() {
        if ($("#FGNR_Filter").is(":visible")) {
            $("#showF").text(i18n._("Show Filters"));
        } else {
            $("#showF").text(i18n._("Hide Filters"));
        }
    });
        
    // erstelle Drucken-Button
    html2pdf.addPrintButton();
        
    // erstelle Excel-Export-Button
    excelExportFnc.add_excel_export_button(
        '| tstats \n' +
        '    count \n' +
        '  from datamodel=APDM_FWS.Achse \n' +
        '  where (nodename=Achse) $tok_werk$ Achse.sequenceNrResult>0  \n' +
        '  groupby _time Achse.wheelAlignmentCode Achse.saCode Achse.testStepResultUnit Achse.sequenceNrResult Achse.resultName Achse.testStepResult Achse.retryCount Achse.shortVIN Achse.minValueDbl Achse.maxValueDbl \n' +
        '| rename \n' +
        '  Achse.* AS * \n' +
        '| fields - count', 
        'dateTime.latest', 'dateTime.earliest' 
    );
    
    // erstelleWerkfilter
    erstelleWerkfilter( "input_werk" );
});