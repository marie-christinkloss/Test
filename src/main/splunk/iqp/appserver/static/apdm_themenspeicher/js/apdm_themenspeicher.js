//# sourceURL=apdm_themenspeicher/js/apdm_themenspeicher.js

//
// LIBRARY REQUIREMENTS
//
// In the require function, we include the necessary libraries and modules for
// the HTML dashboard. Then, we pass variable names for these libraries and
// modules as function parameters, in order.
//
// When you add libraries or modules, remember to retain this mapping order
// between the library or module and its function parameter. You can do this by
// adding to the end of these lists, as shown in the commented examples below.

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
        "../app/iqp/DockedTableView/DockedTableElement",
        "splunkjs/mvc/simpleform/formutils",
        "splunkjs/mvc/simplexml/eventhandler",
        "splunkjs/mvc/simplexml/searcheventhandler",
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
        "../app/iqp/splunkUtils"
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
        DockedTableElement,
        FormUtils,
        EventHandler,
        SearchEventHandler,
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
            create : true
        });
    var submittedTokenModel = mvc.Components.getInstance('submitted', {
            create : true
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
    
    function setToken(name, value) {
        defaultTokenModel.set(name, value);
        submittedTokenModel.set(name, value);
    }
    
    function unsetToken(name) {
        defaultTokenModel.unset(name);
        submittedTokenModel.unset(name);
    }
    
    function getToken(name) {
        var t = defaultTokenModel.get(name);
        if (t == null) {
            t = submittedTokenModel.get(name);
        }
        return t;
    }
    
    function submitTokens() {
        // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
        FormUtils.submitForm({
            replaceState : pageLoading
        });
    }

    // Translation
    var i18n_Kommentar = i18n._("Kommentar");
    var i18n_Wiedervorlage = i18n._("Wiedervorlage");
    var i18n_Wiedervorlage_KW = i18n._("Wiedervorlage KW");
    var i18n_Kommentar_Werk = i18n._("Kommentar Werk");
    var i18n_Link = i18n._("Link");
    var i18n_Kommentar_Datum = i18n._("Kommentar Datum");
    var i18n_Notizen = i18n._("Notizen");
    var i18n_PQM_QC = i18n._("PQM/QC");
    var i18n_Verantwortlich = i18n._("Verantwortlich");
    var i18n_Status = i18n._("Status");
    var i18n_pruefumfang = i18n._("Pruefumfang");
    var i18n_Pruefling = i18n._("Pruefling");
    var i18n_Pruefprozedur = i18n._("Pruefprozedur");
    var i18n_SGBD = i18n._("SGBD");
    var i18n_Api_Job = i18n._("Api-Job");
    var i18n_Error_Code_Dec = i18n._("Error Code (Dec)");
    var i18n_Error_Code_Hex = i18n._("Error Code (Hex)");
    var i18n_Fehlertext = i18n._("Fehlertext");
    var i18n_Result_Data = i18n._("Result Data");
    var i18n_Anzahl_Fahrzeuge = i18n._("Anzahl Fahrzeuge");
    var i18n_Inline_Offline = i18n._("Inline/Offline");
    var i18n_Systemname = i18n._("Systemname");
    var i18n_FGNR = i18n._("FGNR");
    var i18n_I_Stufe = i18n._("I-Stufe");
    var i18n_Baureihe = i18n._("Baureihe");
    var i18n_Werk = i18n._("Werk");
    var i18n_Montagehalle = i18n._("Montagehalle");
    var i18n_beliebig = i18n._("beliebig");
    var i18n_Kommentar_fuer_Werk = i18n._("Kommentar fuer Werk");
    var i18n_Datum_des_Testschrittes = i18n._("Datum des Testschrittes");
    var i18n_nicht_relevante_ausschliessen = i18n._("nicht relevante (n.r.) ausschliessen");
    var i18n_Nur_Erstfehler_anzeigen = i18n._("Nur Erstfehler anzeigen");
    var i18n_Pruefumfang_Gruppe = i18n._("Pruefumfang-Gruppe");
    
    //
    // SEARCH MANAGERS
    //


    // Themenspeicher Suche


    // setze die time constraints für den join mit Order Data (latest plus 14 Tage)
    var time_constraint_search = new SearchManager({
            "id" : "time_constraint_search",
            "cancelOnUnload" : true,
            "earliest_time" : "$tsdatum.earliest$",
            "latest_time" : "$tsdatum.latest$",
            "search" : "| gentimes start=-1 | addinfo | eval latest=info_max_time | eval earliest=info_min_time-14*24*60*60 | table earliest latest",
            "status_buckets" : 0,
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : false,
            "runWhenTimeIsUndefined" : false
        }, {
            tokens : true,
            tokenNamespace : "default"
        });
    var time_results = time_constraint_search.data("preview", {
            count : 1,
            offset : 0
        });
    time_results.on("data", function () {
        setToken("order_data_base_search_earliest", time_results.data().rows[0][0]);
        setToken("order_data_base_search_latest", time_results.data().rows[0][1]);
    });

    var search1 = new SearchManager({
            "id" : "search1",
            "cancelOnUnload" : true,
            "earliest_time" : "$tsdatum.earliest$",
            "latest_time" : "$tsdatum.latest$",
            "search" : 
            '| tstats \n' +
            '    dc(TestStepResult.shortVIN) AS shortVIN_count \n' +
            '    earliest(_time) AS earliest_evt_time  \n' +
            '    earliest(TestStepResult.werk) AS earliest_evt_werk \n' +
            '  from datamodel=APDM_Fehler \n' +
            '  where \n' +
            '    (nodename = TestStepResult)\n' +
            '    (TestStepResult.testStepResult=NOK)\n' +
            '    (TestStepResult.shortVIN="$filt_shortVIN$")\n' +
            '    ($filt_pruefumfangName$)\n' +
            '    ($filt_testStepName$)\n' +
            '    (TestStepResult.param1="$filt_param1$")\n' +
            '    (TestStepResult.ErrorCodeDec="$filt_ErrorCodeDec$")\n' +
            '    (TestStepResult.resultData="$filt_resultData$")\n' +
            '    (TestStepResult.description="$filt_description$")\n' +
            '    (TestStepResult.errorCount>0)\n' +
            '    (TestStepResult.systemName="$filt_system$")\n' +
            '    (TestStepResult.werk="$werkfilter$")\n' +
            '    ($tstats_TestStepResult_assemblyhallinput$)\n' +
            '    (TestStepResult.inline="$filt_inline$")\n' +
            '    ($filt_integrationLevel$)\n' +
            '    ($filt_baureihe$)\n' +
            '  groupby TestStepResult.pruefumfangName, TestStepResult.testStepName, TestStepResult.description, TestStepResult.param1, TestStepResult.ErrorCodeDec, TestStepResult.ErrorCodeHex, TestStepResult.errorText, TestStepResult.resultData, TestStepResult.param2 \n' +
            '  prestats=true \n' +
            '| stats dedup_splitvals=t \n' +
            '    dc(TestStepResult.shortVIN) AS shortVIN_count \n' +
            '    earliest(_time) AS earliest_evt_time \n' +
            '    earliest(TestStepResult.werk) AS earliest_evt_werk \n' +
            '  by TestStepResult.pruefumfangName, TestStepResult.testStepName, TestStepResult.description, TestStepResult.param1, TestStepResult.ErrorCodeDec, TestStepResult.ErrorCodeHex, TestStepResult.errorText, TestStepResult.resultData, TestStepResult.param2\n' +
            '| rename TestStepResult.* AS * \n' +
            '| fillnull shortVIN_count \n' +
            '| fields  pruefumfangName, testStepName, description, param1, ErrorCodeDec, ErrorCodeHex, resultData, shortVIN_count, param2, errorText, earliest_evt_time, earliest_evt_werk\n' +
            '| sort - shortVIN_count \n' +
            '| eval kommentar_werk="$filt_kommentar_werk$"  \n' +
            '| lookup lkup_thsp_notes pruefumfangName testStepName description param1 ErrorCodeDec resultData $use_filt_kommentar_werk$ OUTPUT ' + 
            '    pqm_qc ' + 
            '    notes ' + 
            '    responsible ' + 
            '    kommentar_wiedervorlage AS "' + i18n_Wiedervorlage + '" ' + 
            '    kommentar_wiedervorlage_kw AS "' + i18n_Wiedervorlage_KW + '" ' + 
            '    status ' + 
            '    kommentar_datum ' + 
            '    kommentar_werk as "' + i18n_Kommentar_Werk + '" ' + 
            '    link as "' + i18n_Link + '" \n' +
            '| fields - kommentar_werk \n' +
            '$nur_relevant$ $status$ $pqm_qc$ $verantwortlich$ \n' +
            '| eval " " = "' + i18n_Kommentar + '" \n' +
            '| eval "  " = pruefumfangName.";".testStepName.";".description .";".param1.";".ErrorCodeDec.";".resultData \n' +
            '| lookup lkup_pruefGr Werk AS earliest_evt_werk PruefumfangName AS pruefumfangName Output PruefumfangGruppe \n' +
            '| eval PruefumfangGruppe=if(isNull(PruefumfangGruppe), "NONE", PruefumfangGruppe) \n' +
            '$search_pruefumfangGr$ \n' +
            '| search $filter_pruefumfangGr$ \n' +
            '| table "  " pruefumfangName testStepName description param1 param2 ErrorCodeDec ErrorCodeHex errorText resultData shortVIN_count kommentar_datum "' + i18n_Kommentar_Werk + '" notes pqm_qc status responsible "' + i18n_Wiedervorlage + '" "' + i18n_Wiedervorlage_KW + '" "' + i18n_Link + '" " " \n' +
            '| rename \n' +
            '  pruefumfangName AS "' + i18n_pruefumfang + '"\n' +
            '  testStepName AS "' + i18n_Pruefling + '"\n' +
            '  description AS "' + i18n_Pruefprozedur + '"\n' +
            '  param1 AS "' + i18n_SGBD + '"\n' +
            '  param2 AS "' + i18n_Api_Job + '"\n' +
            '  ErrorCodeDec AS "' + i18n_Error_Code_Dec + '"\n' +
            '  ErrorCodeHex AS "' + i18n_Error_Code_Hex + '"\n' +
            '  errorText AS "' + i18n_Fehlertext + '"\n' +
            '  resultData AS "' + i18n_Result_Data + '"\n' +
            '  shortVIN_count AS "' + i18n_Anzahl_Fahrzeuge + '"\n' +
            '  kommentar_datum AS "' + i18n_Kommentar_Datum + '" ' + 
            '  notes as "' + i18n_Notizen + '" ' + 
            '  pqm_qc as "' + i18n_PQM_QC + '" ' + 
            '  responsible as "' + i18n_Verantwortlich + '" ' + 
            '  status as "' + i18n_Status + '"',
            "status_buckets" : 0,
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : true,
            "runWhenTimeIsUndefined" : true
        }, {
            tokens : true,
            tokenNamespace : "submitted"
        });

    var search2 = new SearchManager({
            "id" : "search2",
            "status_buckets" : 0,
            "cancelOnUnload" : true,
            "search" : "| tstats values(\"OrderData.integrationLevel\") AS integrationLevel from datamodel=APDM_OrderData_Events where (nodename=OrderData) (OrderData.werk=\"$werkfilter$\") (earliest=\"$tsdatum.earliest$\") (latest=\"$tsdatum.latest$\") | mvexpand integrationLevel",
            "earliest_time" : "$tsdatum.earliest$",
            "latest_time" : "$tsdatum.latest$",
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : true,
            "runWhenTimeIsUndefined" : false
        }, {
            tokens : true
        });

    var search3 = new SearchManager({
            "id" : "search3",
            "status_buckets" : 0,
            "cancelOnUnload" : true,
            "search" : "| tstats values(\"OrderData.series\") AS baureihe from datamodel=APDM_OrderData_Events where (nodename=OrderData) (OrderData.werk=\"$werkfilter$\") (earliest=\"$tsdatum.earliest$\") (latest=\"$tsdatum.latest$\") | mvexpand baureihe",
            "earliest_time" : "$tsdatum.earliest$",
            "latest_time" : "$tsdatum.latest$",
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : true,
            "runWhenTimeIsUndefined" : false
        }, {
            tokens : true
        });

    var search_systemName = new SearchManager({
            "id" : "search_systemName",
            "status_buckets" : 0,
            "cancelOnUnload" : true,
            "search" : "| tstats values(TestResult.systemName) as systemName from datamodel=APDM_TestResults | mvexpand systemName",
            "earliest_time" : "$tsdatum.earliest$",
            "latest_time" : "$tsdatum.latest$",
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : true,
            "runWhenTimeIsUndefined" : false
        }, {
            tokens : true
        });

    var search_input_pruefumfangGr = new SearchManager({
            "id" : "search_input_pruefumfangGr",
            "status_buckets" : 0,
            "cancelOnUnload" : true,
            "search" : "| inputlookup lkup_pruefGr | table PruefumfangGruppe | dedup PruefumfangGruppe | sort PruefumfangGruppe",
            "earliest_time" : "0",
            "latest_time" : "now",
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : true,
            "runWhenTimeIsUndefined" : false
        }, {
            tokens : true
        });
        
    var search_input_pruefumfangName = new SearchManager({
            "id" : "search_input_pruefumfangName",
            "status_buckets" : 0,
            "cancelOnUnload" : true,
            "search" : "| tstats values(TestResult.pruefumfangName) AS \"pruefumfangName\" from datamodel=APDM_TestResults where (TestResult.werk=\"$werkfilter$\") ($tstats_TestResult_assemblyhallinput$) | mvexpand pruefumfangName",
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
            "search" : "| tstats values(TestStepResult.testStepName) AS \"pruefling\" from datamodel=APDM_TestStepResults where (TestStepResult.werk=\"$werkfilter$\") ($tstats_TestStepResult_assemblyhallinput$) | mvexpand pruefling",
            "earliest_time" : "0",
            "latest_time" : "now",
            "app" : utils.getCurrentApp(),
            "auto_cancel" : 90,
            "preview" : true,
            "runWhenTimeIsUndefined" : false
        }, {
            tokens: true
        });

    // Kommentar für User/Werk setzen
    var search_kommentar_user = new SearchManager({
        "id": "search_kommentar_user",
        "search": "| rest /services/authentication/current-context splunk_server=local | lookup lkup_werk_input werksrolle as roles OUTPUT value as werk | table username werk | eval werk=mvindex(werk,0) | fillnull value=\"-\"",
    });
    new SearchEventHandler({
        managerid: "search_kommentar_user",
        event: "done",
        conditions: [
            {
                attr: "any",
                value: "*",
                actions: [
                    {"type": "set", "token": "com_user_username", "value": "$result.username$"},
                    {"type": "set", "token": "com_user_werk", "value": "$result.werk$"}
                ]
            }
        ]
    });
    //
    // SPLUNK HEADER AND FOOTER
    //

    new HeaderView({
        id : 'header',
        section : 'dashboards',
        el : $('.header'),
        acceleratedAppNav : true,
        useSessionStorageCache : true,
        splunkbar : true,
        appbar : true,
        litebar : false,
    }, {
        tokens : true
    }).render();

    new FooterView({
        id : 'footer',
        el : $('.footer')
    }, {
        tokens : true
    }).render();

    //
    // DASHBOARD EDITOR
    //

    new Dashboard({
        id : 'dashboard',
        el : $('.dashboard-body'),
        showTitle : true,
        editable : true
    }, {
        tokens : true
    }).render();

    //
    // VIEWS: VISUALIZATION ELEMENTS
    //
    var TableView = require("splunkjs/mvc/tableview");
    var element1 = new DockedTableElement({
            "id" : "element1",
            "count" : 100,
            "dataOverlayMode" : "none",
            "drilldown" : "cell",
            "rowNumbers" : "false",
            "wrap" : "true",
            "managerid" : "search1",
            "el" : $('#element1')
        }, {
            tokens : true,
            tokenNamespace : "submitted"
        });

    element1.render();
        

    /* BEGINN  Verkürzung der Notizen */

    var Notiz_CustomButtonCellRenderer = TableView.BaseCellRenderer.extend({
            canRender : function (cell) {
                return cell.field === i18n_Notizen;
            },
            render : function ($td, cell) {

                var message;
                var tip;

                if (typeof cell.value === 'string') {
                    // single-value field
                    message = cell.value;
                    tip = cell.value;
                    if (message.length > 48) {
                        message = message.substring(0, 47) + "...";
                        $td.html('<span title="'+tip+'">'+message+'</span>');
                    } else {
                        $td.html(message);
                    }
                } else if (Object.prototype.toString.call(cell.value) === '[object Array]') {
                    // multi-value field
                    for (var i = 0; i < cell.value.length; i++) {
                        mvindex = i;
                        message = cell.value[i];
                        tip = cell.value[i];
                        if (message.length > 48) {
                            message = message.substring(0, 47) + "...";
                            $td.append('<div class="multivalue-subcell" data-mv-index="'+mvindex+'" title="'+tip+'">'+message+'</div>');
                        } else {
                            $td.append('<div class="multivalue-subcell" data-mv-index="'+mvindex+'">'+message+'</div>');
                        }
                    }
                }
            }
        });

    element1.getVisualization(function (tableView) {
        tableView.table.addCellRenderer(new Notiz_CustomButtonCellRenderer());
        tableView.table.render();
    });

    /* ENDE  Verkürzung der Notizen */

    element1.on("click", function (e) {

        e.preventDefault();

        if (e.field === " ") { //comment
            setToken("com_pruefumfangName", TokenUtils.replaceTokenNames("$row." + i18n_pruefumfang + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("com_testStepName", TokenUtils.replaceTokenNames("$row." + i18n_Pruefling + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("com_description", TokenUtils.replaceTokenNames("$row." + i18n_Pruefprozedur + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("com_param1", TokenUtils.replaceTokenNames("$row." + i18n_SGBD + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("com_ErrorCodeDec", TokenUtils.replaceTokenNames("$row." + i18n_Error_Code_Dec + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("com_resultData", TokenUtils.replaceTokenNames("$row." + i18n_Result_Data + "$", _.extend(submittedTokenModel.toJSON(), e.data)));

            document.getElementById('element4').style.display = 'none';
            document.getElementById('element3').style.display = 'block';
            document.getElementById('exiting_comments').style.display = 'block';

            setToken("show_multi_comment_panel", false);

            $("div#comment_input_werk.iqp_comment input").val(getToken("com_user_werk"));
            $("div#comment_input_werk.iqp_comment input").attr('readonly', true);
            $("#add_et_modal").modal("toggle");
            
            $('#comment_lab_pruefumfang').html(i18n_pruefumfang + ":");
            $('#comment_lab_pruefling').html(i18n_Pruefling + ":");
            $('#comment_lab_pruefprozedur').html(i18n_Pruefprozedur + ":");
            $('#comment_lab_sgbd').html(i18n_SGBD + ":");
            $('#comment_lab_errorcode').html(i18n_Error_Code_Dec + ":");
            $('#comment_lab_resultData').html(i18n_Result_Data + ":");
    
            $('#comment_lab_headline').html(i18n._("Kommentare"));
            $('#comment_lab_add').html(i18n._("Kommentar hinzufuegen"));
            $('.comment_lab_error').html(i18n._("Fehler"));
            $('.comment_lab_success').html(i18n._("Erfolgreich"));
            $('#comment_lab_errorText').html(i18n._("Es muss mindestens ein Kommentarfeld gesetzt sein."));
            $('#comment_lab_success_add').html(i18n._("Alle Kommentare zum Fehler Loeschen"));
            $('#comment_lab_success_del').html(i18n._("Kommentar(e) wurden erfolgreich hinzugefuegt."));
            $('#comment_lab_deleteAll').html(i18n._("Kommentar(e) wurden erfolgreich geloescht."));
            $('#comment_lab_deleteAll').html(i18n._("Alle Kommentare zum Fehler Loeschen"));
            $('#comment_lab_existComment').html(i18n._("Vorhandene Kommentare zum Fehler"));
            
        } else if (e.field === i18n_Link) {
            console.log("link clicked");
            var url = TokenUtils.replaceTokenNames("$click.value2$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
            console.log(url);
            if (!(/(https?|file):\/\//.test(url))) {
                url = 'http://' + url;
            }
            console.log(url);
            window.open(url);
        } else if (e.field === i18n_Anzahl_Fahrzeuge) {
            x = typeof require("splunkjs/mvc").Components.get("default").get("form.filt_baureihe") === "string" ? "bla" : "blub";
            filt_integrationLevel = getToken("form.filt_integrationLevel");
            filt_baureihe = getToken("form.filt_baureihe");
            var linkPartIntegrationLevel = "&filt_integrationLevel_mv=" + (typeof filt_integrationLevel === "string" ? filt_integrationLevel : filt_integrationLevel.join(","));
            var linkPartBaureihe = "&filt_baureihe_mv=" + (typeof filt_baureihe === "string" ? filt_baureihe : filt_baureihe.join(","));
            var lowErrorText = TokenUtils.replaceTokenNames("$row." + i18n_Fehlertext + "$", _.extend(submittedTokenModel.toJSON(), e.data));
            console.log(lowErrorText);
            lowErrorText = lowErrorText.toLowerCase();
            console.log(lowErrorText);
            
            var assemblyHallFormToken = splunkjs.mvc.Components.getInstance('default').get("form.assemblyhall");
            var assemblyHallDrilldown="";
            if (assemblyHallFormToken >0) assemblyHallDrilldown ="form.assemblyhall="+assemblyHallFormToken.join("&form.assemblyhall=")+"&";
            
            var url = TokenUtils.replaceTokenNames("/app/iqp/apdm_recherche_thema" 
                     + "?"
                     + "form.tsdatum.earliest=$tsdatum.earliest$&"
                     + "form.tsdatum.latest=$tsdatum.latest$&"
                     + "form.pruefumfangName=$row." + i18n_pruefumfang + "$&"
                     + "form.testStepName=$row." + i18n_Pruefling + "$&"
                     + "form.description=$row." + i18n_Pruefprozedur + "$&"
                     + "form.param1=$row." + i18n_SGBD + "$&"
                     + "form.ErrorCodeDec=$row." + i18n_Error_Code_Dec + "$&"
                     + "form.resultData=$row." + i18n_Result_Data + "$&"
                     + "errorText=" + lowErrorText +  "&"
                     + "param2=$row." + i18n_Api_Job + "$&"
                     + "form.werkfilter=$werkfilter$&"
                     + assemblyHallDrilldown
                     + "form.filt_inline=$filt_inline$"
                     + linkPartBaureihe
                     + linkPartIntegrationLevel
                     + "&form.filt_shortVIN=$filt_shortVIN$"
                     + "&form.filt_system=$filt_system$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
            utils.redirect(url, newWindow = true);
        } else if (e.field === i18n_pruefumfang) {
            setToken("filt_pruefumfangName", TokenUtils.replaceTokenNames("$row." + i18n_pruefumfang + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_pruefumfangName", TokenUtils.replaceTokenNames("$row." + i18n_pruefumfang + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        } else if (e.field === i18n_Pruefling) {
            setToken("filt_testStepName", TokenUtils.replaceTokenNames("$row." + i18n_Pruefling + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_testStepName", TokenUtils.replaceTokenNames("$row." + i18n_Pruefling + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        } else if (e.field === i18n_Pruefprozedur) {
            setToken("filt_description", TokenUtils.replaceTokenNames("$row." + i18n_Pruefprozedur + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_description", TokenUtils.replaceTokenNames("$row." + i18n_Pruefprozedur + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        } else if (e.field === i18n_SGBD) {
            setToken("filt_param1", TokenUtils.replaceTokenNames("$row." + i18n_SGBD + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_param1", TokenUtils.replaceTokenNames("$row." + i18n_SGBD + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        } else if (e.field === i18n_Error_Code_Dec) {
            setToken("filt_ErrorCodeDec", TokenUtils.replaceTokenNames("$row." + i18n_Error_Code_Dec + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_ErrorCodeDec", TokenUtils.replaceTokenNames("$row." + i18n_Error_Code_Dec + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        } else if (e.field === i18n_Error_Code_Hex ) {
            setToken("filt_ErrorCodeDec", TokenUtils.replaceTokenNames("$row." + i18n_Error_Code_Dec + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_ErrorCodeDec", TokenUtils.replaceTokenNames("$row." + i18n_Error_Code_Dec + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        } else if (e.field === i18n_Result_Data) {
            setToken("filt_resultData", TokenUtils.replaceTokenNames("$row." + i18n_Result_Data + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
            setToken("form.filt_resultData", TokenUtils.replaceTokenNames("$row." + i18n_Result_Data + "$", _.extend(submittedTokenModel.toJSON(), e.data)));
        }

    });

    var element3 = new HtmlElement({
            "id" : "element3",
            "useTokens" : true,
            "el" : $('#element3')
        }, {
            tokens : true,
            tokenNamespace : "submitted"
        }).render();

    DashboardController.addReadyDep(element3.contentLoaded());

    //
    // VIEWS: FORM INPUTS
    //

    var filter_01 = new MultiSelectInput({
            "id": "filter_01",
            "label": i18n_pruefumfang,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": true,
            "valuePrefix": "TestStepResult.pruefumfangName=",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "pruefumfangName",
            "labelField": "pruefumfangName",
            "value": "$form.filt_pruefumfangName$",
            "managerid": "search_input_pruefumfangName",
            "el": $('#filter_01')
        }, {
            tokens: true
        }).render();
            filter_01.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_01);
    });

    var filter_inline = new DropdownInput({
            "id" : "filter_inline",
            "label": i18n_Inline_Offline,
            "choices" : [{
                    "label" : "Alle",
                    "value" : "*"
                }, {
                    "label" : "Inline",
                    "value" : "true"
                }, {
                    "label" : "Offline",
                    "value" : "false"
                }
            ],
            "value" : "$form.filt_inline$",
            "searchWhenChanged" : true,
            "showClearButton" : true,
            "selectFirstChoice" : false,
            "default" : "*",
            "el" : $('#filter_inline'),
        }, {
            tokens : true
        }).render();

    filter_inline.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_inline);
    });

    var filter_system = new DropdownInput({
            "id" : "filter_system",
            "label": i18n_Systemname,
            "choices" : [{
                    "label" : "Alle",
                    "value" : "*"
                }
            ],
            "valueField" : "systemName",
            "labelField" : "systemName",
            "value" : "$form.filt_system$",
            "searchWhenChanged" : true,
            "showClearButton" : true,
            "selectFirstChoice" : false,
            "default" : "Cascade",
            "el" : $('#filter_system'),
            "managerid" : "search_systemName"
        }, {
            tokens : true
        }).render();

    filter_system.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_system);
    });

    var filter_02 = new MultiSelectInput({
            "id": "filter_02",
            "label": i18n_Pruefling,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": true,
            "valuePrefix": "TestStepResult.testStepName=",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "pruefling",
            "labelField": "pruefling",
            "value": "$form.filt_testStepName$",
            "managerid": "search_input_pruefling",
            "el": $('#filter_02')
        }, {
            tokens: true
        }).render();
    
    filter_02.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_02);
    });

    var filter_03 = new TextInput({
            "id" : "filter_03",
            "label": i18n_Pruefprozedur,
            "value" : "$form.filt_description$",
            "searchWhenChanged" : true,
            "default" : "*",
            "el" : $('#filter_03')
        }, {
            tokens : true
        }).render();

    filter_03.on("change", function (newValue) {
        setToken("filt_description", newValue.toLowerCase());
    });

    var filter_04 = new TextInput({
            "id" : "filter_04",
            "label": i18n_SGBD,
            "value" : "$form.filt_param1$",
            "searchWhenChanged" : true,
            "default" : "*",
            "el" : $('#filter_04')
        }, {
            tokens : true
        }).render();

    filter_04.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_04);
    });

    var filter_05 = new TextInput({
            "id" : "filter_05",
            "label": i18n_Error_Code_Dec,
            "value" : "$form.filt_ErrorCodeDec$",
            "searchWhenChanged" : true,
            "default" : "*",
            "el" : $('#filter_05')
        }, {
            tokens : true
        }).render();

    filter_05.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_05);
    });

    var filter_06 = new TextInput({
            "id" : "filter_06",
            "label": i18n_Result_Data,
            "value" : "$form.filt_resultData$",
            "searchWhenChanged" : true,
            "default" : "*",
            "el" : $('#filter_06')
        }, {
            tokens : true
        }).render();

    filter_06.on("change", function (newValue) {
        setToken("filt_resultData", newValue.toLowerCase());
    });

    var filter_07 = new TextInput({
            "id" : "filter_07",
            "label": i18n_FGNR,
            "value" : "$form.filt_shortVIN$",
            "searchWhenChanged" : true,
            "default" : "*",
            "el" : $('#filter_07')
        }, {
            tokens : true
        }).render();

    filter_07.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_07);
    });

    var filter_08 = new MultiSelectInput({
            "id" : "filter_08",
            "label": i18n_I_Stufe,
            "choices" : [{
                    "label" : "Alle",
                    "value" : "*"
                }
            ],
            "valueField" : "integrationLevel",
            "labelField" : "integrationLevel",
            "value" : "$form.filt_integrationLevel$",
            "searchWhenChanged" : true,
            "default" : "*",
            "delimiter" : " OR ",
            "valuePrefix" : "\"TestStepResult.integrationLevel\"=",
            "managerid" : "search2",
            "el" : $('#filter_08')
        }, {
            tokens : true
        }).render();

    filter_08.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_08);
    });

    var filter_09 = new MultiSelectInput({
            "id" : "filter_09",
            "label": i18n_Baureihe,
            "choices" : [{
                    "label" : "Alle",
                    "value" : "*"
                }
            ],
            "valueField" : "baureihe",
            "labelField" : "baureihe",
            "value" : "$form.filt_baureihe$",
            "searchWhenChanged" : true,
            "default" : "*",
            "delimiter" : " OR ",
            "valuePrefix" : "\"TestStepResult.series\"=",
            "managerid" : "search3",
            "el" : $('#filter_09')
        }, {
            tokens : true
        }).render();

    filter_09.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_09);
    });

    var werkinput = new DropdownInput({
            "id" : "werkinput",
            "label": i18n_Werk,
            "choices": [],
            "searchWhenChanged" : true,
            "showClearButton" : true,
            "selectFirstChoice" : false,
            "value" : "$form.werkfilter$",
            "el" : $('#werkinput')
        }, {
            tokens : true
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
        "label": i18n_Montagehalle,
        "choices": [
            {"value": "*", "label": i18n_beliebig}
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
        console.log("filter montagehalle assemblyhallinput.on(change ");
        console.log("assemblyhallinput changed to:" + newValue);
        
        var isAllNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        //console.log("isAllNotFound:" + isAllNotFound);
        
        
            if (isAllNotFound) {
                
                //handle all option as null filter:  tstats_TestStepResult_assemblyhallinput 
                splunkUtils.setNewMultiValueSearchToken2(this, newValue, "TestStepResult", defaultTokenModel,"TestStepResult");
                splunkUtils.setNewMultiValueSearchToken2(this, newValue, "TestResult", defaultTokenModel,"TestResult");
            }
            
            
            
        include_null_for_option_all("assemblyhall", "assemblyHall", defaultTokenModel, defaultTokenModel.get("assemblyhall"), null);
        include_null_for_option_all("tstats_TestStepResult_assemblyhallinput", "TestStepResult.assemblyHall", defaultTokenModel, "("+defaultTokenModel.get("tstats_TestStepResult_assemblyhallinput")+")", null);
        include_null_for_option_all("tstats_TestResult_assemblyhallinput", "TestResult.assemblyHall", defaultTokenModel, "("+defaultTokenModel.get("tstats_TestResult_assemblyhallinput")+")", null);
    });
    

    var werkkommfilter = new DropdownInput({
            "id" : "kom_werk_filter",
            "label": i18n_Kommentar_fuer_Werk,
            "choices": [],
            "searchWhenChanged" : true,
            "showClearButton" : true,
            "selectFirstChoice" : false,
            "value" : "$form.filt_kommentar_werk$",
            "el" : $('#kom_werk_filter')
        }, {
            tokens : true
        }).render();

    werkkommfilter.on("change", function (newValue) {
        FormUtils.handleValueChange(werkkommfilter);
    });
    
    werkkommfilter.on("valueChange", function(e) {
        if (e.value !== undefined) {
            EventHandler.evalToken("use_filt_kommentar_werk", "if($value$=\"*\",\" \",\"kommentar_werk\")", e.data);
        }
    });

    // erstelleWerkfilter
    erstelleWerkfilter( "kom_werk_filter" );

    var input1 = new TimeRangeInput({
            "id" : "input1",
            "label": i18n_Datum_des_Testschrittes,
            "searchWhenChanged" : true,
            "default" : {
                "earliest_time" : "-7d",
                "latest_time" : "now"
            },
            "earliest_time" : "$form.tsdatum.earliest$",
            "latest_time" : "$form.tsdatum.latest$",
            "el" : $('#input1')
        }, {
            tokens : true
        }).render();

    input1.on("change", function (newValue) {
        FormUtils.handleValueChange(input1);
    });

    
    var input_pqm_qc = new TextInput({
            "id" : "input_pqm_qc",
            "label": i18n_PQM_QC,
            "prefix" : "| search pqm_qc=",
            "searchWhenChanged" : true,
            "value" : "$form.pqm_qc$",
            "el" : $('#input_pqm_qc')
        }, {
            tokens : true
        }).render();

    input_pqm_qc.on("change", function (newValue) {
        FormUtils.handleValueChange(input_pqm_qc);
        if (!newValue) {
            setToken("pqm_qc", "");
        }
    });

    var input_status = new TextInput({
            "id" : "input_status",
            "label": i18n_Status,
            "prefix" : "| search status=",
            "searchWhenChanged" : true,
            "value" : "$form.status$",
            "el" : $('#input_status')
        }, {
            tokens : true
        }).render();

    input_status.on("change", function (newValue) {
        FormUtils.handleValueChange(input_status);
        if (!newValue) {
            setToken("status", "");
        }
    });

    var input_status_nr = new CheckboxGroupInput({
            "id" : "input_status_nr",
            "choices" : [{
                    "value" : "| search NOT status=\"*n.r.*\"",
                    "label" : i18n_nicht_relevante_ausschliessen
                }
            ],
            "default" : ["", "| search NOT status=\"*n.r.*\""],
            "searchWhenChanged" : true,
            "value" : "$form.nur_relevant$",
            "el" : $('#input_status_nr')
        }, {
            tokens : true
        }).render();
    $("#input_status_nr > .splunk-checkboxgroup").attr('class', "splunk-checkboxgroup")

    input_status_nr.on("change", function (newValue) {
        FormUtils.handleValueChange(input_status_nr);
    });

    var input_verantwortlich = new TextInput({
            "id" : "input_verantwortlich",
            "label": i18n_Verantwortlich,
            "prefix" : "| search responsible=",
            "searchWhenChanged" : true,
            "value" : "$form.verantwortlich$",
            "el" : $('#input_verantwortlich')
        }, {
            tokens : true
        }).render();

    input_verantwortlich.on("change", function (newValue) {
        FormUtils.handleValueChange(input_verantwortlich);
        if (!newValue) {
            setToken("verantwortlich", "");
        }
    });
    
    var input_option_pruefumGr = new DropdownInput({
            "id" : "input_option_pruefumGr",
            "label": i18n_Nur_Erstfehler_anzeigen,
            "choices" : [
                {
                    "value" : "1",
                    "label" : "ja"
                }, {
                    "value" : "0",
                    "label" : "nein"
                }
            ],
            "default" : "0",
            "labelField" : "label",
            "valueField" : "value",
            "searchWhenChanged" : true,
            "value" : "$form.input_option_pruefumGr$",
            "el" : $('#input_option_pruefumGr')
        }, {
            tokens : true
        }).render();
        
    
    input_option_pruefumGr.on("change", function (newValue) {
        FormUtils.handleValueChange(input_option_pruefumGr);
        if (newValue==="1") {
            //console.log("true:" + newValue);
            setToken('search_pruefumfangGr',
                '| eventstats \n' +
                '    min(earliest_evt_time) AS evt_time_by_gr by PruefumfangGruppe \n' +
                '| where evt_time_by_gr=earliest_evt_time'
            );
        } else {
            //console.log("false:" + newValue);
            setToken('search_pruefumfangGr', '');
        }
    });
    
    var filter_pruefumfangGr = new MultiSelectInput({
            "id" : "filter_pruefumfangGr",
            "label": i18n_Pruefumfang_Gruppe,
            "choices" : [{
                    "value" : '*',
                    "label" : "Alle"
                }
            ],
            "default" : ['*'],
            "prefix" : "(",
            "suffix" : ")",
            "valuePrefix" : "PruefumfangGruppe=\"",
            "valueSuffix" : "\"",
            "delimiter" : " OR ",
            "managerid" : "search_input_pruefumfangGr",
            "valueField": "PruefumfangGruppe",
            "lableField": "PruefumfangGruppe",
            "searchWhenChanged" : true,
            "value" : "$form.filter_pruefumfangGr$",
            "el" : $('#input_pruefumGr')
        }, {
            tokens : true
        }).render();
        
    
    filter_pruefumfangGr.on("change", function (newValue) {
        FormUtils.handleValueChange(filter_pruefumfangGr);
        splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
    });

    element1.getVisualization(function (view) {
        view.on("rendered", function () {
            // synchronisiere die Höhen der Kommentarfelder
            $("#element1 tr").each(function () {
                var max_index = -1;
                $(this).find("td div.multivalue-subcell").each(function () {
                    max_index = Math.max(max_index, $(this).attr("data-mv-index"))
                });

                for (i = 0; i <= max_index; i++) {
                    var max_height = -1;
                    $(this).find("td div.multivalue-subcell[data-mv-index=" + i + "]").each(function () {
                        max_height = Math.max(max_height, $(this).outerHeight());
                    });
                    $(this).find("td div.multivalue-subcell[data-mv-index=" + i + "]").each(function () {
                        $(this).height(max_height);
                    });
                };
            });
        });
    });

    // Initialize time tokens to default
    if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
        defaultTokenModel.set({
            earliest : '0',
            latest : ''
        });
    }

    if (!_.isEmpty(urlTokenModel.toJSON())) {
        submitTokens();
    } 
    
    // Aufruf der Excelexport-Funktion aus excel_export_fnc.js
    excel_export.excel_export("element1", "search1");

    // For some filters all option needs to be interpreted as no filter
    function include_null_for_option_all(token, field, model, value, options) {
        console.log("filter montagehalle include_null_for_option_all");
        console.log("#### value:"+value+"===" + "(" + field + "=\"*\")");
            if (value === "(" + field + "=*)" || value === "(" + field + "=\"*\")") {
        console.log("filter montagehalle include_null_for_option_all value ===");
                model.set(token, " ");
            }
    }

    console.log("filter montagehalle unten");
    include_null_for_option_all("assemblyhall", "assemblyHall", defaultTokenModel, defaultTokenModel.get("assemblyhall"), null);
    include_null_for_option_all("tstats_TestStepResult_assemblyhallinput", "TestStepResult.assemblyHall", defaultTokenModel, "("+defaultTokenModel.get("tstats_TestStepResult_assemblyhallinput")+")", null);
    include_null_for_option_all("tstats_TestResult_assemblyhallinput", "TestResult.assemblyHall", defaultTokenModel, "("+defaultTokenModel.get("tstats_TestResult_assemblyhallinput")+")", null);

    

    //
    // DASHBOARD READY
    //

    DashboardController.ready();
    pageLoading = false;

});