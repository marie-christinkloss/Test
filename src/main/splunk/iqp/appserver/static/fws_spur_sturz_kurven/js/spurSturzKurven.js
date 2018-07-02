//# sourceURL=fws_spur_sturz_kurven/js/spurSturzKurven.js
require([
        "splunkjs/mvc", 
        "jquery",
        "../app/iqp/werkfilter_fnc",
        "../app/iqp/splunkUtils",
        "../../app/RDS_TA_html2pdf/html2pdf",
        "../../app/iqp/excel_export_fnc",
        "splunkjs/ready!",
        "splunkjs/mvc/simplexml/ready!"
    ],
    function(
        mvc,
        $,
        erstelleWerkfilter,
        splunkUtils,
        html2pdf,
        excelExportFnc
    ) {
        var defaultTokenModel = mvc.Components.getInstance('default');
        var submittedTokenModel = mvc.Components.getInstance('submitted');
        
        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }
        
        function getToken(name) {
            return defaultTokenModel.get(name);
        }
        
        $(".dashboard-row").addClass("pageBreakAfter");
        $(".dashboard-row").last().removeClass("pageBreakAfter");
        
        var input_series = mvc.Components.getInstance("input_series");
        input_series.on("change", function (newValue) {
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_wheelAlignmentCode = mvc.Components.getInstance("input_wheelAlignmentCode");
        input_wheelAlignmentCode.on("change", function (newValue) {
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_shortVIN = mvc.Components.getInstance("input_shortVIN");
        input_shortVIN.on("change", function (newValue) {
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        // erstelle Drucken-Button
        html2pdf.addPrintButton();
        
        // erstelle Excel-Export-Button
        excelExportFnc.add_excel_export_button(
            'index="iqp_spur_sturz_kurven_summary" $tok_shortVINs$ $tok_testStands$ $tok_series2$ $tok_wheelAlignmentCodes$ \n' +
            '| append [  \n' +
            '| inputlookup lkup_spurSturz_sollwerte | search $tok_series2$ $tok_wheelAlignmentCodes$ \n' +
            '| fields series wheelAlignmentCode axle setting TTS_* TLD_* TP_* \n' +
            '| rename  \n' +
            '  TLD_description AS Umkehrpunkt  \n' +
            '  TP_pointNumber AS point \n' +
            '| eval SpurHL=if(setting="Spur" AND axle="HA", TP_xValue, null()), SpurHR=SpurHL \n' +
            '| eval SpurVL=if(setting="Spur" AND axle="VA", TP_xValue, null()), SpurVR=SpurVL \n' +
            '| eval SturzHL=if(setting="Sturz" AND axle="HA", TP_xValue, null()), SturzHR=SturzHL \n' +
            '| eval SturzVL=if(setting="Sturz" AND axle="VA", TP_xValue, null()), SturzVR=SturzVL \n' +
            '| eval SpHoeheHL=if(setting="Spur" AND axle="HA", TP_yValue * -1, null()), SpHoeheHR=SpHoeheHL \n' +
            '| eval SpHoeheVL=if(setting="Spur" AND axle="VA", TP_yValue * -1, null()), SpHoeheVR=SpHoeheVL \n' +
            '| eval StHoeheHL=if(setting="Sturz" AND axle="HA", TP_yValue * -1, null()), StHoeheHR=StHoeheHL \n' +
            '| eval StHoeheVL=if(setting="Sturz" AND axle="VA", TP_yValue * -1, null()), StHoeheVR=StHoeheVL \n' +
            '| stats \n' +
            '    max(Spur*) AS Spur* \n' +
            '    max(SpHoehe*) AS SpHoehe* \n' +
            '    max(Sturz*) AS Sturz* \n' +
            '    max(StHoehe*) AS StHoehe* \n' +
            '  by point series wheelAlignmentCode Umkehrpunkt \n' +
            '| sort Umkehrpunkt point \n' +
            '] \n' +
            '| table PruefTime Umkehrpunkt wheelAlignmentCode SpurVL SpurVR SpurHL SpurHR SturzVL SturzVR SturzHL SturzHR SpHoeheVL SpHoeheVR SpHoeheHL SpHoeheHR StHoeheVL StHoeheVR StHoeheHL StHoeheHR', 
            'tok_dateTime.latest', 'tok_datetime.earliest' 
        );
        
        // erstelleWerkfilter
        erstelleWerkfilter( "input_werk" );
        
    });