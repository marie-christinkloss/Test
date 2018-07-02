//# sourceURL=apdm_recherche_thema\js\apdm_recherche_thema.js

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "underscore",
        "jquery",
        "splunk.i18n",
        "splunkjs/mvc/simplexml",
        "splunkjs/mvc/headerview",
        "splunkjs/mvc/footerview",
        "splunkjs/mvc/simplexml/dashboardview",
        "splunkjs/mvc/simplexml/dashboard/panelref",
        "splunkjs/mvc/simplexml/element/chart",
        "splunkjs/mvc/simplexml/element/event",
        "splunkjs/mvc/simplexml/element/html",
        "splunkjs/mvc/simplexml/element/list",
        "splunkjs/mvc/simplexml/element/map",
        "splunkjs/mvc/simplexml/element/single",
        "splunkjs/mvc/simplexml/element/table",
        "splunkjs/mvc/simpleform/formutils",
        "splunkjs/mvc/simplexml/eventhandler",
        "splunkjs/mvc/simpleform/input/dropdown",
        "splunkjs/mvc/simpleform/input/radiogroup",
        "splunkjs/mvc/simpleform/input/multiselect",
        "splunkjs/mvc/simpleform/input/checkboxgroup",
        "splunkjs/mvc/simpleform/input/text",
        "splunkjs/mvc/simpleform/input/timerange",
        "splunkjs/mvc/simpleform/input/submit",
        "splunkjs/mvc/searchmanager",
        "splunkjs/mvc/savedsearchmanager",
        "splunkjs/mvc/postprocessmanager",
        "splunkjs/mvc/simplexml/urltokenmodel",
        "../app/iqp/excel_export_fnc",
        "../app/iqp/werkfilter_fnc",
        "../app/iqp/splunkUtils",
        "splunkjs/mvc/tableview"
        // Add comma-separated libraries and modules manually here, for example:
        // ..."splunkjs/mvc/simplexml/urltokenmodel",
        // "splunkjs/mvc/checkboxview"
    ],
    function (
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        i18n,
        DashboardController,
        HeaderView,
        FooterView,
        Dashboard,
        PanelRef,
        ChartElement,
        EventElement,
        HtmlElement,
        ListElement,
        MapElement,
        SingleElement,
        TableElement,
        FormUtils,
        EventHandler,
        DropdownInput,
        RadioGroupInput,
        MultiSelectInput,
        CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        SearchManager,
        SavedSearchManager,
        PostProcessManager,
        UrlTokenModel,
        excel_export,
        erstelleWerkfilter,
        splunkUtils

        // Add comma-separated parameter names here, for example:
        // ...UrlTokenModel,
        // CheckboxView
    ) {

    var pageLoading = true;

    //
    // TOKENS
    //

    // Create token namespaces
    var urlTokenModel = new UrlTokenModel();
    mvc.Components.registerInstance('url', urlTokenModel);
    var defaultTokenModel = mvc.Components.getInstance('default', {
            create: true
        });
    var submittedTokenModel = mvc.Components.getInstance('submitted', {
            create: true
        });

    urlTokenModel.on('url:navigate', function () {
        defaultTokenModel.set(urlTokenModel.toJSON());
        if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
            submitTokens();
        } else {
            submittedTokenModel.clear();
        }
    });

    // Initialize tokens
    defaultTokenModel.set(urlTokenModel.toJSON());

    function submitTokens() {
        // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
        FormUtils.submitForm({
            replaceState: pageLoading
        });
    }

    function setToken(name, value) {
        defaultTokenModel.set(name, value);
        submittedTokenModel.set(name, value);
    }

    function unsetToken(name) {
        defaultTokenModel.unset(name);
        submittedTokenModel.unset(name);
    }

    if (typeof getToken("errorText") == "undefined") {
        setToken("errorText", "*");
    }
    if (typeof getToken("param2") == "undefined") {
        setToken("param2", "*");
    }
    
    function getToken(name) {
        return defaultTokenModel.get(name);
    }
    
    //
    // Translation
    //
    
    // - Headlines & Custom HTML Objects
    i18n._("Zeitlicher Verlauf");
    i18n._("Betroffene Fahrzeuge");
    i18n._("Fehlerdetails");
    i18n._("Nacharbeiten");
    i18n._("Korrelierende Fehler - Davor");
    i18n._("Korrelierende Fehler - Danach");
    
    // - internal
    var i18n_FGNR = i18n._("FGNR");
    var i18n_Anzahl_Fahrzeuge = i18n._("Anzahl Fahrzeuge");
    var i18n_Anzahl_Fehler = i18n._("Anzahl Fehler");
    var i18n_Baureihe = i18n._("Baureihe");
    var i18n_Fahrzeugtyp = i18n._("Fahrzeugtyp");
    var i18n_I_Stufe = i18n._("I-Stufe");
    var i18n_Motorbaureihe = i18n._("Motorbaureihe");
    var i18n_Anzahl = i18n._("Anzahl");
    var i18n_NA_Dauer = i18n._("NA-Dauer");
    var i18n_NA_Bemerkung = i18n._("NA-Bemerkung");
    var i18n_belastete_Kostenstelle = i18n._("belastete Kostenstelle");
    var i18n_pruefumfang = i18n._("Pruefumfang");
    var i18n_Pruefling = i18n._("Pruefling");
    var i18n_Pruefprozedur = i18n._("Pruefprozedur");
    var i18n_SGBD = i18n._("SGBD");
    var i18n_Api_Job = i18n._("Api-Job");
    var i18n_Error_Code_Dec = i18n._("Error Code (Dec)");
    var i18n_Fehlertext = i18n._("Fehlertext");
    var i18n_Result_Data = i18n._("Result Data");
    var i18n_Korrelation    = i18n._("Korrelation");
    var i18n_proz_Korrelation = i18n._("prozentuale Korrelation");
    var i18n_Anzahl_bet_Fahrzeuge = i18n._("Anzahl betroffene Fahrzeuge");
    var i18n_Zeit = i18n._("Zeit");
    
    //
    // SEARCH MANAGERS
    //

    var search_count_global = new SearchManager({
            "id": "search_count_global",
            "search":
            '| tstats  count\n'+
            '     dc(TestStepResult.shortVIN) \n' +
            '     dc(TestStepResult.ErrorCodeDec) \n' +
            '   from datamodel=APDM_Fehler \n' +
            '   where \n' +
            '     (nodename = TestStepResult)\n' +
            '     (TestStepResult.testStepResult=NOK)\n' +
            '     (TestStepResult.shortVIN="$filt_shortVIN$")\n' +
            '     ($pruefumfangName$)\n' +
            '     ($testStepName$)\n' +
            '     (TestStepResult.param1="$param1$")\n' +
            '     (TestStepResult.param2="$param2$")\n' +
            '     (TestStepResult.errorText="$errorText$")\n' +
            '     (TestStepResult.ErrorCodeDec="$ErrorCodeDec$")\n' +
            '     (TestStepResult.resultData="$resultData$")\n' +
            '     (TestStepResult.description="$description$")\n' +
            '     (TestStepResult.errorCount>0)\n' +
            '     (TestStepResult.systemName="$filt_system$")\n' +
            '     (TestStepResult.werk="$werkfilter$")\n' +
            '     ($tstats_TestStepResult_assemblyhallinput$)\n' +
            '     (TestStepResult.inline="$filt_inline$")\n' +
            '     ($filt_integrationLevel$)\n' +
            '     ($filt_baureihe$)\n' +
            '   groupby _time \n' +
            '   prestats=true \n'
            ,
            "status_buckets": 0,
            "cancelOnUnload": true,
            "latest_time": "$tsdatum.latest$",
            "earliest_time": "$tsdatum.earliest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

    var time_dist_search = new PostProcessManager({
            "managerid": "search_count_global",
            "search": '| timechart count as "' + i18n_Anzahl_Fehler + '" dc(TestStepResult.shortVIN) as "' + i18n_Anzahl_Fahrzeuge + '" ',
            "id": "time_dist_search"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

    var search_count1 = new PostProcessManager({
            "managerid": "search_count_global",
            "search": "| stats dc(TestStepResult.shortVIN) as count_shortVIN", // | fields count_shortVIN",
            "id": "search_count1"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

    var search_count2 = new PostProcessManager({
            "managerid": "search_count_global",
            "search": " | stats count",
            "id": "search_count2"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

    var search_count_error = new PostProcessManager({
            "managerid": "search_count_global",
            "search": "stats dc(TestStepResult.ErrorCodeDec)",
            "id": "search_count_error"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });
        
    var myResults = search_count_error.data("results");
    
    myResults.on("data", function() {
        if (myResults.data().rows[0][0] == 1 ) {
            setToken("runDavorDanachSearch", "");
        } else {
            unsetToken("runDavorDanachSearch");
        }
    });

    var fzge_search = new SearchManager({
            "id": "fzge_search",
            "search": 
                '| tstats \n' +
                '     count \n' +
                '     first("TestStepResult.series") AS "series" \n' +
                '     first("TestStepResult.vehicleType") AS "vehicleType" \n' +
                '     first("TestStepResult.integrationLevel") AS "integrationLevel" \n' +
                '     first("TestStepResult.engineSeries") AS "engineSeries" \n' +
                '     first("TestStepResult.pruefumfangName") as pruefumfangName \n' +
                '   from datamodel=APDM_Fehler \n' +
                '   where \n' +
                '     (nodename = TestStepResult)\n' +
                '     (TestStepResult.testStepResult=NOK)\n' +
                '     (TestStepResult.shortVIN="$filt_shortVIN$")\n' +
                '     ($pruefumfangName$)\n' +
                '     ($testStepName$)\n' +
                '     (TestStepResult.param1="$param1$")\n' +
                '     (TestStepResult.param2="$param2$")\n' +
                '     (TestStepResult.errorText="$errorText$")\n' +
                '     (TestStepResult.ErrorCodeDec="$ErrorCodeDec$")\n' +
                '     (TestStepResult.resultData="$resultData$")\n' +
                '     (TestStepResult.description="$description$")\n' +
                '     (TestStepResult.errorCount>0)\n' +
                '     (TestStepResult.systemName="$filt_system$")\n' +
                '     (TestStepResult.werk="$werkfilter$")\n' +
                '     ($tstats_TestStepResult_assemblyhallinput$)\n' +
                '     (TestStepResult.inline="$filt_inline$")\n' +
                '     ($filt_integrationLevel$)\n' +
                '     ($filt_baureihe$)\n' +
                '   groupby TestStepResult.shortVIN \n' +
                '   prestats=true \n' +
                '| stats \n' +
                '     count \n' +
                '     first("TestStepResult.series") AS "series" \n' +
                '     first("TestStepResult.vehicleType") AS "vehicleType" \n' +
                '     first("TestStepResult.integrationLevel") AS "integrationLevel" \n' +
                '     first("TestStepResult.engineSeries") AS "engineSeries" \n' +
                '     first("TestStepResult.pruefumfangName") as pruefumfangName \n' +
                '    by TestStepResult.shortVIN \n' +
                '| rename TestStepResult.shortVIN AS shortVIN \n' +
                '| eval AKZ=trim(pruefumfangName, "_")\n' +
                '| join type=left shortVIN AKZ \n' +
                '  [\n' +
                '    | from datamodel:"IPSQ" \n' +
                '    | fields shortVIN "NA Bel Kostenstelle Nr" "NA Nacharbeitsdauer" "PR Bemerkung u NA Bemerkung" AKZ \n' +
                '    | mvexpand AKZ \n' +
                '    | eval AKZ=trim(AKZ, "_")\n' +
                '    | dedup shortVIN "NA Bel Kostenstelle Nr" "NA Nacharbeitsdauer" "PR Bemerkung u NA Bemerkung" AKZ\n' +
                '    | rex field="PR Bemerkung u NA Bemerkung" "PR:\\s(?P<PR>.*)\\s?NA:(?P<NA>.*)"\n' +
                '    | fields shortVIN AKZ "NA Nacharbeitsdauer" NA "NA Bel Kostenstelle Nr"\n' +
                '  ]\n' +
                '| fields - AKZ\n' +
                '| sort - count  \n' +
                '| table shortVIN count series vehicleType integrationLevel engineSeries "NA Nacharbeitsdauer" NA "NA Bel Kostenstelle Nr" \n' +
                '| rename  \n' +
                '    shortVIN as "' + i18n_FGNR + '" \n' +
                '    count AS "' + i18n_Anzahl + '" \n' +
                '    series AS "' + i18n_Baureihe + '" \n' +
                '    vehicleType AS "' + i18n_Fahrzeugtyp + '" \n' +
                '    integrationLevel AS "' + i18n_I_Stufe + '" \n' +
                '    engineSeries AS "' + i18n_Motorbaureihe + '" \n' +
                '    "NA Nacharbeitsdauer" as "' + i18n_NA_Dauer + '" \n' +
                '    NA as "' + i18n_NA_Bemerkung + '" \n' +
                '    "NA Bel Kostenstelle Nr" as "' + i18n_belastete_Kostenstelle + '"',
            "status_buckets": 0,
            "cancelOnUnload": true,
            "latest_time": "$tsdatum.latest$",
            "earliest_time": "$tsdatum.earliest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

    var search_baureihe = new SearchManager({
            "id": "search_baureihe",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "search": "| tstats values(\"OrderData.series\") AS baureihe from datamodel=APDM_OrderData_Events where (nodename=OrderData) (OrderData.werk=\"$werkfilter$\") | mvexpand baureihe",
            "earliest_time": "$tsdatum.earliest$",
            "latest_time": "$tsdatum.latest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true
        });

    var search_integrationLevel = new SearchManager({
            "id": "search_integrationLevel",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "search": "| tstats values(\"OrderData.integrationLevel\") AS integrationLevel from datamodel=APDM_OrderData_Events where (nodename=OrderData) (OrderData.werk=\"$werkfilter$\") | mvexpand integrationLevel",
            "earliest_time": "$tsdatum.earliest$",
            "latest_time": "$tsdatum.latest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true
        });

    var search_systemName = new SearchManager({
            "id": "search_systemName",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "search": "| tstats values(TestResult.systemName) as systemName from datamodel=APDM_TestResults | mvexpand systemName",
            "earliest_time": "$tsdatum.earliest$",
            "latest_time": "$tsdatum.latest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true
        });

    var search_davor_danach = new SearchManager({
            "id": "search_davor_danach",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "search": 
                '| tstats \n' +
                '     count \n' +
                '     min(_time) as first_time\n' +
                '   from datamodel=APDM_Fehler \n' +
                '   where \n' +
                '     (nodename = TestStepResult) $runDavorDanachSearch$\n' +
                '     (TestStepResult.shortVIN="$filt_shortVIN$")\n' +
                '     (TestStepResult.werk="$werkfilter$")\n' +
                '     ($tstats_TestStepResult_assemblyhallinput$)\n' +
                '     (TestStepResult.errorCount>0)\n' +
                '     (TestStepResult.inline="$filt_inline$")\n' +
                '     ($filt_integrationLevel$)\n' +
                '     ($filt_baureihe$)\n' +
                '   groupby TestStepResult.ErrorCodeDec TestStepResult.systemName TestStepResult.description TestStepResult.resultData TestStepResult.param1 TestStepResult.param2 TestStepResult.errorText TestStepResult.testStepName TestStepResult.pruefumfangName TestStepResult.shortVIN\n' +
                '   prestats=false\n' +
                '| rename\n' +
                '  TestStepResult.* as *\n' +
                '| eval errorPoint=if(\n' +
                '     like(ErrorCodeDec,replace("$ErrorCodeDec$", "\\*", "%")) and \n' +
                '     like(systemName,replace("$filt_system$", "\\*", "%")) and\n' +
                '     like(lower(testStepName),replace("$testStepName_singlevalue$", "\\*", "%")) and\n' +
                '     like(param1,replace("$param1$", "\\*", "%")) and\n' +
                '     like(param2,replace("$param2$", "\\*", "%")) and\n' +
                '     like(lower(errorText),replace("$errorText$", "\\*", "%")) and\n' +
                '     like(lower(resultData),replace("$resultData$", "\\*", "%")) and\n' +
                '     like(lower(description),replace("$description$", "\\*", "%")) and\n' +
                '     like(lower(pruefumfangName),replace("$pruefumfangName_singlevalue$", "\\*", "%")) \n' +
                '     ,first_time,null())\n' +
                '| eventstats \n' +
                '    first(errorPoint) as errorPoint\n' +
                '  by shortVIN\n' +
                '| where isNotNull(errorPoint)\n' +
                '| stats\n' +
                '    min(first_time) as first_time\n' +
                '  by shortVIN ErrorCodeDec systemName testStepName param1 param2 errorText resultData description pruefumfangName errorPoint\n' +
                '| eventstats\n' +
                '    sum(eval(if(errorPoint>first_time, 1, 0))) as davor\n' +
                '    sum(eval(if(errorPoint<first_time, 1, 0))) as danach\n' +
                '  by ErrorCodeDec systemName testStepName param1 param2 errorText resultData description pruefumfangName\n' +
                '| eventstats\n' +
                '    dc(shortVIN) as shortVIN_count\n' +
                '| eval prozent_davor=tostring((davor/shortVIN_count)*100, "commas") + "%", prozent_danach=tostring((danach/shortVIN_count)*100, "commas") + "%"\n' +
                '| fields ErrorCodeDec testStepName param1 param2 errorText resultData description pruefumfangName davor prozent_davor danach prozent_danach shortVIN_count\n' +
                '| dedup ErrorCodeDec testStepName param1 param2 errorText resultData description pruefumfangName davor prozent_davor danach prozent_danach shortVIN_count',
            "earliest_time": "$tsdatum.earliest$",
            "latest_time": "$tsdatum.latest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true
        });
        
        var search_davor = new PostProcessManager({
            "managerid": "search_davor_danach",
            "search": 
                '| where davor>0\n' +
                '| table pruefumfangName testStepName description param1 param2 ErrorCodeDec errorText resultData *davor\n' +
                '| sort - davor\n' +
                '| rename \n' +
                '  pruefumfangName as "' + i18n_pruefumfang + '" \n' +
                '  testStepName as "' + i18n_Pruefling + '" \n' +
                '  description as "' + i18n_Pruefprozedur + '" \n' +
                '  param1 as "' + i18n_SGBD + '" \n' +
                '  param2 as "' + i18n_Api_Job + '" \n' +
                '  ErrorCodeDec as "' + i18n_Error_Code_Dec + '" \n' +
                '  errorText as "' + i18n_Fehlertext + '" \n' +
                '  resultData as "' + i18n_Result_Data + '" \n' +
                '  davor as "' + i18n_Korrelation + '" \n' +
                '  prozent_davor as "' + i18n_proz_Korrelation + '"',
            "id": "search_davor"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });
        
        var search_danach = new PostProcessManager({
            "managerid": "search_davor_danach",
            "search": 
                '| where danach>0\n' +
                '| table pruefumfangName testStepName description param1 param2 ErrorCodeDec errorText resultData  *danach\n' +
                '| sort - danach\n' +
                '| rename \n' +
                '  pruefumfangName as "' + i18n_pruefumfang + '" \n' +
                '  testStepName as "' + i18n_Pruefling + '" \n' +
                '  description as "' + i18n_Pruefprozedur + '" \n' +
                '  param1 as "' + i18n_SGBD + '" \n' +
                '  param2 as "' + i18n_Api_Job + '" \n' +
                '  ErrorCodeDec as "' + i18n_Error_Code_Dec + '" \n' +
                '  errorText as "' + i18n_Fehlertext + '" \n' +
                '  resultData as "' + i18n_Result_Data + '" \n' +
                '  danach as "' + i18n_Korrelation + '" \n' +
                '  prozent_danach as "' + i18n_proz_Korrelation + '"',
            "id": "search_danach"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });
        
        var search_input_pruefumfang = new SearchManager({
                "id" : "search_input_pruefumfang",
                "status_buckets" : 0,
                "cancelOnUnload" : true,
                "search" : "| tstats values(TestResult.pruefumfangName) AS \"pruefumfangName\" from datamodel=APDM_TestResults where (TestResult.werk=\"$werkfilter$\") ($tstats_TestStepResult_assemblyhallinput$) summariesonly=true | mvexpand pruefumfangName",
                "earliest_time" : "0",
                "latest_time" : "now",
                "app" : utils.getCurrentApp(),
                "auto_cancel" : 90,
                "preview" : true,
                "runWhenTimeIsUndefined" : false
            }, {
                tokens: true
            });
        
        var search_input_pruefling = new SearchManager({
                "id" : "search_input_pruefling",
                "status_buckets" : 0,
                "cancelOnUnload" : true,
                "search" : "| tstats values(TestStepResult.testStepName) AS \"pruefling\" from datamodel=APDM_TestStepResults where (TestStepResult.werk=\"$werkfilter$\") ($tstats_TestStepResult_assemblyhallinput$) summariesonly=true | mvexpand pruefling",
                "earliest_time" : "0",
                "latest_time" : "now",
                "app" : utils.getCurrentApp(),
                "auto_cancel" : 90,
                "preview" : true,
                "runWhenTimeIsUndefined" : false
            }, {
                tokens: true
            });

    //
    // SPLUNK HEADER AND FOOTER
    //

    new HeaderView({
        id: 'header',
        section: 'dashboards',
        el: $('.header'),
        acceleratedAppNav: true,
        useSessionStorageCache: true,
        splunkbar: true,
        appbar: true,
        litebar: false,
    }, {
        tokens: true
    }).render();

    new FooterView({
        id: 'footer',
        el: $('.footer')
    }, {
        tokens: true
    }).render();

    //
    // DASHBOARD EDITOR
    //

    new Dashboard({
        id: 'dashboard',
        el: $('.dashboard-body'),
        showTitle: true,
        editable: true
    }, {
        tokens: true
    }).render();

    //
    // VIEWS: VISUALIZATION ELEMENTS
    //

    var element1 = new SingleElement({
            "id": "element1",
            "drilldown": "none",
            "managerid": "search_count1",
            "beforeLabel":  i18n_Anzahl_bet_Fahrzeuge + ": ",
            "el": $('#element1')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

    var element_count2 = new SingleElement({
            "id": "element_count2",
            "drilldown": "none",
            "managerid": "search_count2",
            "beforeLabel": i18n_Anzahl_Fehler + ": ",
            "el": $('#element_count2')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

    var element2 = new ChartElement({
            "id": "element2",
            "charting.axisY2.enabled": "1",
            "charting.chart.style": "shiny",
            "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
            "charting.axisTitleX.visibility": "visible",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisX.scale": "linear",
            "charting.chart": "column",
            "charting.axisY.scale": "linear",
            "charting.axisY2.scale": "inherit",
            "resizable": true,
            "charting.chart.stackMode": "default",
            "charting.axisTitleY2.visibility": "visible",
            "charting.layout.splitSeries": "0",
            "charting.axisLabelsX.majorLabelStyle.rotation": "0",
            "charting.axisTitleX.text": i18n_Zeit,
            "charting.chart.sliceCollapsingThreshold": "0.01",
            "charting.chart.nullValueMode": "gaps",
            "charting.legend.placement": "right",
            "charting.axisTitleY.visibility": "visible",
            "charting.drilldown": "none",
            "charting.chart.overlayFields": '"' + i18n_Anzahl_Fehler + '"',
            "charting.axisTitleY.text": i18n_Anzahl_Fahrzeuge,
            "charting.axisTitleY2.text": i18n_Anzahl_Fehler,
            "managerid": "time_dist_search",
            "el": $('#element2')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

    var tbl_betr_fzge = new TableElement({
            "id": "tbl_betr_fzge",
            "dataOverlayMode": "none",
            "drilldown": "row",
            "rowNumbers": "false",
            "wrap": "true",
            "managerid": "fzge_search",
            "pageSize": "20",
            "el": $('#tbl_betr_fzge')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

    tbl_betr_fzge.on("click", function (e) {
        if ((e.field !== undefined)) {

            e.preventDefault();

            if (mvc.Components.getInstance("vmfa_vins").val() === null) {
                console.log("vmfa_vins ist NULL");
            } else {
                var vmfa = mvc.Components.getInstance("vmfa_vins").val();

                vmfa.push(TokenUtils.replaceTokenNames("$row." + i18n_FGNR + "$", _.extend(submittedTokenModel.toJSON(), e.data)));

                mvc.Components.getInstance("vmfa_vins").val(vmfa);
                mvc.Components.getInstance("vmfa_vins").render();

                //$('html, body').animate({scrollTop: $("#vmfa_vins").offset().top}, 500);
            }

        }
    });

    var tbl_davor = new TableElement({
            "id": "tbl_davor",
            "dataOverlayMode": "none",
            "drilldown": "none",
            "rowNumbers": "false",
            "wrap": "true",
            "managerid": "search_davor",
            "pageSize": "50",
            "el": $('#davorTable')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

    var tbl_danach = new TableElement({
            "id": "tbl_danach",
            "dataOverlayMode": "none",
            "drilldown": "none",
            "rowNumbers": "false",
            "wrap": "true",
            "managerid": "search_danach",
            "pageSize": "50",
            "el": $('#danachTable')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

    //
    // VIEWS: FORM INPUTS
    //
    var input1 = new TimeRangeInput({
            "id": "input1",
            "searchWhenChanged": true,
            "default": {
                "latest_time": "now",
                "earliest_time": "-7d@h"
            },
            "earliest_time": "$form.tsdatum.earliest$",
            "latest_time": "$form.tsdatum.latest$",
            "el": $('#input1')
        }, {
            tokens: true
        }).render();

    input1.on("change", function (newValue) {
        FormUtils.handleValueChange(input1);
    });

    var input_pruefumfang = new MultiSelectInput({
            "id": "input_pruefumfang",
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "valuePrefix": "TestStepResult.pruefumfangName=\"",
            "valueSuffix": "\"",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "pruefumfangName",
            "labelField": "pruefumfangName",
            "value": "$form.pruefumfangName$",
            "managerid": "search_input_pruefumfang",
            "el": $('#input_pruefumfang')
        }, {
            tokens: true
        }).render();

    input_pruefumfang.on("change", function (newValue) {
        FormUtils.handleValueChange(input_pruefumfang);
        if ($.type(newValue)==="string") {
            setToken("pruefumfangName_singlevalue", newValue.toLowerCase());
        } else if ($.type(newValue)==="array") {
            setToken("pruefumfangName_singlevalue", newValue[0].toLowerCase());
        }
    });

    var input_pruefling = new MultiSelectInput({
            "id": "input_pruefling",
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "valuePrefix": "TestStepResult.testStepName=\"",
            "valueSuffix": "\"",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "pruefling",
            "labelField": "pruefling",
            "value": "$form.testStepName$",
            "managerid": "search_input_pruefling",
            "el": $('#input_pruefling')
        }, {
            tokens: true
        }).render();

    input_pruefling.on("change", function (newValue) {
        FormUtils.handleValueChange(input_pruefling);
        if ($.type(newValue)==="string") {
            setToken("testStepName_singlevalue", newValue.toLowerCase());
        } else if ($.type(newValue)==="array") {
            setToken("testStepName_singlevalue", newValue[0].toLowerCase());
        }
    });

    var input4 = new TextInput({
            "id": "input4",
            "searchWhenChanged": true,
            "default": "*",
            "value": "$form.description$",
            "el": $('#input4')
        }, {
            tokens: true
        }).render();

    input4.on("change", function (newValue) {
        setToken("description", newValue.toLowerCase());
        //          FormUtils.handleValueChange(input4);
    });

    var input5 = new TextInput({
            "id": "input5",
            "searchWhenChanged": true,
            "default": "*",
            "value": "$form.param1$",
            "el": $('#input5')
        }, {
            tokens: true
        }).render();

    input5.on("change", function (newValue) {
        FormUtils.handleValueChange(input5);
    });

    var input6 = new TextInput({
            "id": "input6",
            "searchWhenChanged": true,
            "value": "$form.ErrorCodeDec$",
            "default": "*",
            "el": $('#input6')
        }, {
            tokens: true
        }).render();

    input6.on("change", function (newValue) {
        FormUtils.handleValueChange(input6);
    });

    var input7 = new TextInput({
            "id": "input7",
            "searchWhenChanged": true,
            "default": "*",
            "value": "$form.resultData$",
            "el": $('#input7')
        }, {
            tokens: true
        }).render();

    input7.on("change", function (newValue) {

        setToken("resultData", newValue.toLowerCase());
        //          FormUtils.handleValueChange(input7);
    });

    
    var werkinput = new DropdownInput({
            "id": "werkinput",
            "choices": [],
            "searchWhenChanged": true,
            "selectFirstChoice": false,
            "showClearButton": false,
            "value": "$form.werkfilter$",
            "el": $('#werkinput')
        }, {
            tokens: true
        }).render();

    werkinput.on("change", function (newValue) {
        FormUtils.handleValueChange(werkinput);
    });
    
    // erstelleWerkfilter
    erstelleWerkfilter( "werkinput" );
    

    //Montagehalle
    
var assemblyhallsearch = new SearchManager({
            "id": "assemblyhallsearch",
            "cancelOnUnload": true,
            "sample_ratio": null,
            "earliest_time": "$earliest$",
            "status_buckets": 0,
            "search": "| inputlookup iqp_montagehallen.csv  | search werk=\"$werkfilter$\" | fields montagehalle",
            "latest_time": "$latest$",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "tokenDependencies": {
            },
            "runWhenTimeIsUndefined": false
        }, {tokens: true});

    var assemblyhallinput = new MultiSelectInput({
        "id": "assemblyhallinput",
        "choices": [
            {"value": "*", "label": "beliebig"}
        ],
        "prefix": "(",
        "labelField": "montagehalle",
        "default": ["*"],
        "searchWhenChanged": true,
        "valueField": "montagehalle",
        "valuePrefix": "assemblyHall=",
        "delimiter": " OR ",
        "suffix": ")",
        "value": "$form.assemblyhall$",
        "managerid": "assemblyhallsearch",
        "el": $('#assemblyhallinput')
    }, {tokens: true}).render();

    assemblyhallinput.on("change", function(newValue) {
        FormUtils.handleValueChange(assemblyhallinput);
    });
    

    var filter_baureihe = new MultiSelectInput({
            "id": "filter_baureihe",
            "choices": [{
                    "label": "Alle",
                    "value": "*"
                }
            ],
            "valueField": "baureihe",
            "labelField": "baureihe",
            "value": "$form.filt_baureihe$",
            "searchWhenChanged": true,
            "default": "*",
            "delimiter": " OR ",
            "valuePrefix": "\"TestStepResult.series\"=",
            "managerid": "search_baureihe",
            "el": $('#filter_baureihe')
        }, {
            tokens: true
        }).render();

    filter_baureihe.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_baureihe);
    });

    var filter_i_stufe = new MultiSelectInput({
            "id": "filter_i_stufe",
            "choices": [{
                    "label": "Alle",
                    "value": "*"
                }
            ],
            "valueField": "integrationLevel",
            "labelField": "integrationLevel",
            "value": "$form.filt_integrationLevel$",
            "searchWhenChanged": true,
            "default": "*",
            "delimiter": " OR ",
            "valuePrefix": "\"TestStepResult.integrationLevel\"=",
            "managerid": "search_integrationLevel",
            "el": $('#filter_i_stufe')
        }, {
            tokens: true
        }).render();

    filter_i_stufe.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_i_stufe);
    });

    var filter_shortvin = new TextInput({
            "id": "filter_shortvin",
            "value": "$form.filt_shortVIN$",
            "searchWhenChanged": true,
            "default": "*",
            "el": $('#filter_shortvin')
        }, {
            tokens: true
        }).render();

    filter_shortvin.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_shortvin);
    });

    var filter_system = new DropdownInput({
            "id": "filter_system",
            "choices": [{
                    "label": "Alle",
                    "value": "*"
                }
            ],
            "valueField": "systemName",
            "labelField": "systemName",
            "value": "$form.filt_system$",
            "searchWhenChanged": true,
            "showClearButton": true,
            "selectFirstChoice": false,
            "default": "*",
            "el": $('#filter_system'),
            "managerid": "search_systemName"
        }, {
            tokens: true
        }).render();

    filter_system.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_system);
    });

    i18n_register({
        'catalog': {
            '+-Inline': 'Inline'
        }
    });
    var filter_inline = new DropdownInput({
            "id": "filter_inline",
            "choices": [{
                    "label": "Alle",
                    "value": "*"
                }, {
                    "label": "Inline",
                    "value": "true"
                }, {
                    "label": "Offline",
                    "value": "false"
                }
            ],
            "value": "$form.filt_inline$",
            "searchWhenChanged": true,
            "showClearButton": true,
            "selectFirstChoice": false,
            "default": "*",
            "el": $('#filter_inline'),
        }, {
            tokens: true
        }).render();

    filter_inline.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_inline);
    });

    var vmfa_vins = new MultiSelectInput({
            "id": "vmfa_vins",
            "choices": [{
                    "value": "",
                    "label": "-"
                }
            ],
            "valuePrefix": "&form.shortVIN=",
            "valueSuffix": "",
            "value": "$form.vmfa_vins$",
            "searchWhenChanged": false,
            "el": $('#vmfa_vins')
        }, {
            tokens: true
        }).render();

    vmfa_vins.on("change", function (newValue) {
        FormUtils.handleValueChange(vmfa_vins);
        if (getToken("vmfa_vins")) {
            defaultTokenModel.set("vinsForIPSQ", getToken("vmfa_vins").replace(/&form\./g, 'OR ').replace('OR ', ''));
        }
    });

    // replace single backslashes in source by double backslashes
    submittedTokenModel.on("change:filt_integrationLevel_mv", function (model, value, options) {
        setToken("form.filt_integrationLevel", value.split(","));
    });
    submittedTokenModel.on("change:filt_baureihe_mv", function (model, value, options) {
        setToken("form.filt_baureihe", value.split(","));
    });

    //
    // SUBMIT FORM DATA
    //


    // Initialize time tokens to default
    if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
        defaultTokenModel.set({
            earliest: '0',
            latest: ''
        });
    }

    submitTokens();

    // Fehlerdetailsuche fuer gewaehlte VINs
    $('#fehler_det_btn').on("click", function (e) {
        submitTokens();
        if (defaultTokenModel.get("vinsForIPSQ") != undefined) {
            var url = TokenUtils.replaceTokenNames("/app/iqp/apdm_fehlerhafte_testschritte?form.tsdatum.earliest=$tsdatum.earliest$&form.tsdatum.latest=$tsdatum.latest$&form.pruefumfangName=$pruefumfangName_singlevalue$&form.testStepName=$testStepName_singlevalue$&form.description=$description$&form.param1=$param1$&form.ErrorCodeDec=$ErrorCodeDec$&form.resultData=$resultData$&vins=$vinsForIPSQ$&form.werkfilter=$werkfilter$&param2=$param2$&errorText=$errorText$", _.extend(defaultTokenModel.toJSON()), TokenUtils.getEscaper('url'));
            utils.redirect(url, newWindow = true);
        }
    });

    // Nacharbeiten fuer gewaehlte VINs
    $('#na_btn').on("click", function (e) {
        if (defaultTokenModel.get("vinsForIPSQ") != undefined) {
            var shortVINs = mvc.Components.getInstance("vmfa_vins").val();
            var tok_shortVIN = "";
            if (shortVINs!=null) {
                console.log(shortVINs);
                _.each(shortVINs, function(tmp_shortVIN){
                    tok_shortVIN+="&form.shortVIN=" + tmp_shortVIN;
                });
            }
            
            var url = TokenUtils.replaceTokenNames("ipsq_recherche_nacharbeit?form.pruefdatum.earliest=$tsdatum.earliest$&form.pruefdatum.latest=$tsdatum.latest$" + tok_shortVIN + "&form.werkfilter=$werkfilter$", _.extend(defaultTokenModel.toJSON()), TokenUtils.getEscaper('url'));
            utils.redirect(url, newWindow = true);
        }
    });

    // Aufruf der Excelexport-Funktion aus excel_export_fnc.js
    excel_export.excel_export("tbl_betr_fzge", "fzge_search");

            

    //********* Montagehalle ***********//

    // For some filters all option needs to be interpreted as no filter
    function include_null_for_option_all(token, field, model, value, options) {
console.log("filter montagehalle include_null_for_option_all");
        console.log("#### value:"+value+"===" + "(" + field + "=\"*\")");
            if (value === "(" + field + "=*)" || value === "(" + field + "=\"*\")") {
console.log("filter montagehalle include_null_for_option_all value ===");
                model.set(token, " ");
            }
    }
    
    var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
    
    assemblyhallinput = splunkjs.mvc.Components.getInstance("assemblyhallinput");
    assemblyhallinput.on("change", function(newValue) {
console.log("filter montagehalle assemblyhallinput.on(change ");
        console.log("assemblyhallinput changed to:" + newValue);
        
        var isAllNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        //console.log("isAllNotFound:" + isAllNotFound);
        
            if (isAllNotFound) {
                
                //handle all option as null filter:  tstats_TestStepResult_assemblyhallinput 
                splunkUtils.setNewMultiValueSearchToken2(this, newValue, "TestStepResult", defaultTokenModel,"TestStepResult");
            }
            
        include_null_for_option_all("assemblyhall", "assemblyHall", defaultTokenModel, defaultTokenModel.get("assemblyhall"), null);
        include_null_for_option_all("tstats_TestStepResult_assemblyhallinput", "TestStepResult.assemblyHall", defaultTokenModel, "("+defaultTokenModel.get("tstats_TestStepResult_assemblyhallinput")+")", null);
    });
    
console.log("filter montagehalle unten");
    include_null_for_option_all("assemblyhall", "assemblyHall", defaultTokenModel, defaultTokenModel.get("assemblyhall"), null);
    include_null_for_option_all("tstats_TestStepResult_assemblyhallinput", "TestStepResult.assemblyHall", defaultTokenModel, "("+defaultTokenModel.get("tstats_TestStepResult_assemblyhallinput")+")", null);

    
    
    
    
    
    //
    // DASHBOARD READY
    //

    DashboardController.ready();
    pageLoading = false;

});