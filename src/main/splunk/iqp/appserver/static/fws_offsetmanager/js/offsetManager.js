//# sourceURL=fws_offsetmanager/js/offsetManager.js

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "jquery",
        "underscore",
        "splunk.i18n",
        "../../app/iqp/splunkUtils",
        "../../app/iqp/werkfilter_fnc",
        "../../app/iqp/excel_export_fnc",
        "../../app/RDS_TA_html2pdf/html2pdf",
        "splunkjs/ready!",
        "splunkjs/mvc/simplexml/ready!"
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        $,
        _,
        i18n,
        splunkUtils,
        erstelleWerkfilter,
        excelExportFnc,
        html2pdf
    ){ 
        var defaultTokenModel = mvc.Components.getInstance('default');
        var submittedTokenModel = mvc.Components.getInstance('submitted');
        
        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }
        
        function getToken(name) {
            return defaultTokenModel.get(name);
        }
        
        var env_locale = "alias_" + window.location.pathname.split("/")[1].split("-")[0];
        
        setToken("env_locale", env_locale);
        
        var input_dateTime = mvc.Components.getInstance("input_dateTime");
        input_dateTime.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
        });
        
        var input_werk = mvc.Components.getInstance("input_werk");
        input_werk.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
        });
        
        var input_wheelAlignmentCode = mvc.Components.getInstance("input_wheelAlignmentCode");
        input_wheelAlignmentCode.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_outlier_range = mvc.Components.getInstance("input_outlier_range");
        input_outlier_range.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
        });
        
        var input_outlier_limit = mvc.Components.getInstance("input_outlier_limit");
        input_outlier_limit.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
        });
        
        var input_testStand_rama = mvc.Components.getInstance("input_testStand_rama");
        input_testStand_rama.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_pruefumfangName_rama = mvc.Components.getInstance("input_pruefumfangName_rama");
        input_pruefumfangName_rama.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_inAuswertung_rama = mvc.Components.getInstance("input_inAuswertung_rama");
        input_inAuswertung_rama.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_testStand_linie = mvc.Components.getInstance("input_testStand_linie");
        input_testStand_linie.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_pruefumfangName_linie = mvc.Components.getInstance("input_pruefumfangName_linie");
        input_pruefumfangName_linie.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input_measureType_linie = mvc.Components.getInstance("input_measureType_linie");
        input_measureType_linie.on("change", function(newValue) {
            submittedTokenModel.unset("runSearch");
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var table_aw_va = mvc.Components.getInstance("table_aw_va");
        table_aw_va.on("click", function (e) {
            if (e.field === getToken("i18n_AW_Ausreisser")) {
                e.preventDefault();
                var sid_offsetBase = mvc.Components.getInstance("offsetBase").job.sid;
                var url = TokenUtils.replaceTokenNames("/app/iqp/ft_fws_offsetmanager_ausreisser?jobid=" + sid_offsetBase + "&testStand=" + e.data["row." + getToken("i18n_testStand_iL")] + "&resultName=" + e.data["row." + getToken("i18n_shortResultName")] + "&AW_VA_HA=true", _.extend(defaultTokenModel.toJSON()), TokenUtils.getEscaper('url'));
                utils.redirect(url, newWindow = true);
            } else if ((e.field !== undefined)) {
                e.preventDefault();
            }
        });
        
        var table_aw_ha = mvc.Components.getInstance("table_aw_ha");
        table_aw_ha.on("click", function (e) {
            if (e.field === getToken("i18n_AW_Ausreisser")) {
                e.preventDefault();
                var sid_offsetBase = mvc.Components.getInstance("offsetBase").job.sid;
                var url = TokenUtils.replaceTokenNames("/app/iqp/ft_fws_offsetmanager_ausreisser?jobid=" + sid_offsetBase + "&testStand=" + e.data["row." + getToken("i18n_testStand_iL")] + "&resultName=" + e.data["row." + getToken("i18n_shortResultName")] + "&AW_VA_HA=true", _.extend(defaultTokenModel.toJSON()), TokenUtils.getEscaper('url'));
                utils.redirect(url, newWindow = true);
            } else if ((e.field !== undefined)) {
                e.preventDefault();
            }
        });
        
        var table_ew_ha = mvc.Components.getInstance("table_ew_ha");
        table_ew_ha.on("click", function (e) {
            if (e.field === getToken("i18n_AW_Ausreisser")) {
                e.preventDefault();
                var sid_offsetBase = mvc.Components.getInstance("offsetBase").job.sid;
                var url = TokenUtils.replaceTokenNames("/app/iqp/ft_fws_offsetmanager_ausreisser?jobid=" + sid_offsetBase + "&hinterTestStand=" + e.data["row." + getToken("i18n_hinterTestStand")] + "&testStand=" + e.data["row." + getToken("i18n_testStand_iL")] + "&resultName=" + e.data["row." + getToken("i18n_shortResultName")] + "&EW_HA=true", _.extend(defaultTokenModel.toJSON()), TokenUtils.getEscaper('url'));
                utils.redirect(url, newWindow = true);
            } else if ((e.field !== undefined)) {
                e.preventDefault();
            }
        });
        
        $("div#submit button").on("click", function() {
            submittedTokenModel.set("runSearch", "");
        });
        
        $("input[id^=input_outlier_range]")
            .attr('type','number')
            .attr('min','0')
            .attr('max','100')
            .attr('step','1');
        $("input[id^=input_outlier_limit]")
            .attr('type','number')
            .attr('min','0')
            .attr('max','100')
            .attr('step','0.1');
        
        // erstelle Drucken-Button
        html2pdf.addPrintButton();
        
        // erstelle Excel-Export-Button
        excelExportFnc.add_excel_export_button(
            '| tstats ' +
            '    count \n' +
            '  from datamodel=APDM_FWS.Achse \n' +
            '  where (nodename = Achse) $runSearch$ Achse.$tok_werk$ ( \n' +
            '  Achse.resultName="Gesamtspur vorne vor Einstellung" OR Achse.resultName="Gesamtspur hinten vor Einstellung" OR Achse.resultName="Fahrachswinkel vor Einstellung" OR Achse.resultName="Sturz vorne links vor Einstellung" OR Achse.resultName="Sturz vorne rechts vor Einstellung" OR Achse.resultName="Sturz hinten links vor Einstellung" OR Achse.resultName="Sturz hinten rechts vor Einstellung" OR Achse.resultName="Spur hinten links vor Einstellung" OR Achse.resultName="Spur hinten rechts vor Einstellung" OR  \n' +
            '  Achse.resultName="Gesamtspur vorne" OR Achse.resultName="Gesamtspur hinten" OR Achse.resultName="Fahrachswinkel" OR Achse.resultName="Sturz vorne links" OR Achse.resultName="Sturz vorne rechts" OR Achse.resultName="Sturz hinten links" OR Achse.resultName="Sturz hinten rechts" OR Achse.resultName="Spur hinten links" OR Achse.resultName="Spur hinten rechts") \n' +
            '  groupby _time source Achse.werk Achse.shortVIN Achse.testStand Achse.measureType Achse.pruefumfangName Achse.resultName Achse.resultValueDbl Achse.desiredValueDbl Achse.minValueDbl Achse.maxValueDbl  \n' +
            '  span=1s summariesonly=true \n' +
            '| rename \n' +
            '  Achse.werk as werk \n' +
            '  Achse.shortVIN as shortVIN \n' +
            '  Achse.resultName as resultName \n' +
            '  Achse.resultValueDbl as resultValueDbl \n' +
            '  Achse.desiredValueDbl as desiredValueDbl \n' +
            '  Achse.minValueDbl AS minValueDbl \n' +
            '  Achse.maxValueDbl AS maxValueDbl \n' +
            '`comment("Hinzufuegen von nicht erfassten Spurcodes")` \n' +
            '| lookup lkup_order_data local=true _key AS shortVIN OUTPUTNEW wheelAlignmentCode  \n' +
            '| search $tok_wheelAligmentCode$ \n' +
            '`comment("Hinzufuegen der Hinterachsstaende")` \n' +
            '| lookup lkup_fws_hinterachse_anlagen werk shortVIN OUTPUTNEW testStand AS hinterTestStand \n' +
            '| eval hinterTestStand=if(isNull(hinterTestStand), "NONE", hinterTestStand) \n' +
            '| eval  \n' +
            '  differenceValueDbl=desiredValueDbl-resultValueDbl, \n' +
            '  IS_VE=if(like(resultName,"%vor Einstellung"), 1, 0), \n' +
            '  resultName=replace(resultName," vor Einstellung", "") \n' +
            '| fields - count resultValueDbl desiredValueDbl \n' +
            '`comment("Ermittlung von Referenzfahrzeugen")` \n' +
            '| join type=outer source  \n' +
            '[  \n' +
            '  | tstats  \n' +
            '      count AS IS_REF \n' +
            '    from datamodel=APDM_FWS.Achse  \n' +
            '    where (nodename = Achse.ReferenceCar) Achse.$tok_werk$ $tok_testStand_rama$ $tok_pruefumfangName_rama$  \n' +
            '    groupby source Achse.resultValueStr summariesonly=true \n' +
            '  | rename Achse.resultValueStr AS resultValueStr \n' +
            '  | search $tok_inAus_rama$ \n' +
            '  | fields - resultValueStr \n' +
            '] \n' + 
            '| eval IS_REF=if(isNotNull(IS_REF), 1, 0) \n' + 
            '| rename Achse.* AS * \n' +
            '| table *', 'tok_datetime.latest', 'tok_datetime.earliest' 
        );
        
        // erstelleWerkfilter
        erstelleWerkfilter( "input_werk" );
        
    });