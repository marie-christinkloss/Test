//# sourceURL=ipsq_recherche_nacharbeit\js\db_ipsq_recherche_nacharbeit.js

require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunk.i18n",
    "app/iqp/tagcloud/tagcloud",
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
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        i18n,
        TagCloud,
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
        var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
        var submittedTokenModel = mvc.Components.getInstance('submitted', {create: true});

        urlTokenModel.on('url:navigate', function() {
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
            FormUtils.submitForm({ replaceState: pageLoading });
        }

        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }

        function unsetToken(name) {
            defaultTokenModel.unset(name);
            submittedTokenModel.unset(name);
        }
        
        i18n._("Weitere Filter");
        i18n._("Statistische Auswertungen");
        i18n._("Anzahl durchgefuehrte Nacharbeiten");
        i18n._("Anzahl der betroffenen Fahrzeuge");
        i18n._("Haeufigste Fahrzeuge");
        i18n._("Haeufigste Baureihen");
        i18n._("NA Nacharbeitsdauer in Minuten (wenn > 0)");
        i18n._("F1 Datum");
        i18n._("Pruefdatum");
        i18n._("Dauer zwischen Pruefung und Nacharbeit in Stunden");
        i18n._("Dauer zwischen F1-Datum und Nacharbeit in Stunden");
        i18n._("Bemerkungen");
        i18n._("Ausschleuser und Nacharbeiten");
        
        var i18n_datetime = i18n._("Nacharbeitsdatum");
        var i18n_werk = i18n._("Werk");
        var i18n_freetext = i18n._("Freitextsuche");
        var i18n_saCode = i18n._("saCode");
        var i18n_sxCode = i18n._("sxCode");
        var i18n_series = i18n._("Baureihe");
        var i18n_iLevel = i18n._("I-Stufe");
        var i18n_shortVIN = i18n._("FGNR");
        var i18n_typeKey = i18n._("Typschluessel");
        var i18n_feature_name = i18n._("Merkmal Bezeichnung");
        var i18n_errorLocName = i18n._("NA Fehlerort Bezeichnung");
        var i18n_errorLocNr = i18n._("NA Fehlerort Nr");
        var i18n_errorTypeName = i18n._("NA Fehlerart Bezeichnung");
        var i18n_errorTypeNr = i18n._("NA Fehlerart Nr");
        var i18n_errorLevelName = i18n._("NA Fehlerlage Bezeichnung");
        var i18n_activityName = i18n._("NA Taetigkeit Bezeichnung");
        var i18n_NaPrComment = i18n._("PR Bemerkung und NA Bemerkung");
        var i18n_reworkerId = i18n._("NA Nacharbeiter ID");
        var i18n_shiftName = i18n._("NA Schicht Bezeichnung");
        var i18n_performCc = i18n._("NA Leist Kostenstelle Nr");
        var i18n_performMt = i18n._("NA Leist Meisterbereich Nr");
        var i18n_chargedCc = i18n._("NA Bel Kostenstelle Nr");
        var i18n_chargedMt = i18n._("NA Bel Meisterbereich Nr");
        var i18n_chargedPt = i18n._("NA Bel Produktionsbereich Nr");
        var i18n_reworkDuration = i18n._("NA Nacharbeitsdauer");
        var i18n_prNaErrorTypeName = i18n._("PR_NA Fehlertyp Bezeichnung");
        var i18n_errorProtocolP1 = i18n._("PR Fehlerprotokoll Teil 1");
        var i18n_errorProtocolP2 = i18n._("PR Fehlerprotokoll Teil 2");
        var i18n_errorProtocolP3 = i18n._("PR Fehlerprotokoll Teil 3");
        var i18n_errorProtocolP4 = i18n._("PR Fehlerprotokoll Teil 4");
        var i18n_stationNr = i18n._("PR Station Nr");
        var i18n_stationName = i18n._("NA Station Bezeichnung");
        var i18n_testReworkBI = i18n._("PR Pruef Nacharbeit BI");
        var i18n_testerID = i18n._("PR Pruefer ID");
        var i18n_NaComment = i18n._("NA Bemerkung");
        var i18n_PrComment = i18n._("PR Bemerkung");
        var i18n_testDate = i18n._("Pruefdatum");
        var i18n_f1Date = i18n._("F1 Datum");
        var i18n_count = i18n._("Anzahl");
        var i18n_time = i18n._("Zeit");
        var i18n_timeDiff = i18n._("Zeitdifferenz");
        var i18n_duration = i18n._("Dauer");
        
        //
        // SEARCH MANAGERS
        //
        
        
        {
        var search1 = new PostProcessManager({
            "search": "stats count as Fehleranzahl",
            "managerid": "ipsq_search",
            "id": "search1"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search2 = new PostProcessManager({
            "search": "stats dc(shortVIN) as Fehleranzahl",
            "managerid": "ipsq_search",
            "id": "search2"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search3 = new PostProcessManager({
            "search": "where field=\"shortVIN\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_shortVIN + "\"",
            "managerid": "histogram_search",
            "id": "search3"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search4 = new PostProcessManager({
            "search": "where field=\"Baureihe Code\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_series + "\"",
            "managerid": "histogram_search",
            "id": "search4"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search5 = new PostProcessManager({
            "search": "where field=\"Typschlüssel Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_typeKey + "\"",
            "managerid": "histogram_search",
            "id": "search5"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search6 = new PostProcessManager({
            "search": "where field=\"Sistufenr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_iLevel + "\"",
            "managerid": "histogram_search",
            "id": "search6"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search7 = new PostProcessManager({
            "search": "where field=\"Merkmal Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_feature_name + "\"",
            "managerid": "histogram_search",
            "id": "search7"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search8 = new PostProcessManager({
            "search": "where field=\"NA Bel Produktionsbereich Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_chargedPt + "\"",
            "managerid": "histogram_search",
            "id": "search8"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search9 = new PostProcessManager({
            "search": "where field=\"NA Fehlerlage Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_errorLevelName + "\"",
            "managerid": "histogram_search",
            "id": "search9"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search10 = new PostProcessManager({
            "search": "where field=\"NA Tätigkeit Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_activityName + "\"",
            "managerid": "histogram_search",
            "id": "search10"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search11 = new PostProcessManager({
            "search": "where field=\"NA Schicht Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_shiftName + "\"",
            "managerid": "histogram_search",
            "id": "search11"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search12 = new PostProcessManager({
            "search": "where field=\"NA Leist Kostenstelle Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_performCc + "\"",
            "managerid": "histogram_search",
            "id": "search12"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search13 = new PostProcessManager({
            "search": "where field=\"NA Leist Meisterbereich Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_performMt + "\"",
            "managerid": "histogram_search",
            "id": "search13"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search_bel_kst = new PostProcessManager({
            "search": "where field=\"NA Bel Kostenstelle Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_chargedCc + "\"",
            "managerid": "histogram_search",
            "id": "search_bel_kst"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        var search14 = new PostProcessManager({
            "search": "where field=\"NA Bel Meisterbereich Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_chargedMt + "\"",
            "managerid": "histogram_search",
            "id": "search14"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search15 = new PostProcessManager({
            "search": "where field=\"NA Fehlerort Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_errorLocNr + "\"",
            "managerid": "histogram_search",
            "id": "search15"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search16 = new PostProcessManager({
            "search": "where field=\"PR_NA Fehlertyp Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_prNaErrorTypeName + "\"",
            "managerid": "histogram_search",
            "id": "search16"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search17 = new PostProcessManager({
            "search": "where field=\"PR Station Nr\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_stationNr + "\"",
            "managerid": "histogram_search",
            "id": "search17"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search18 = new PostProcessManager({
            "search": "where field=\"NA Station Bezeichnung\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_stationName + "\"",
            "managerid": "histogram_search",
            "id": "search18"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search19 = new PostProcessManager({
            "search": "where field=\"PR Prüf Nacharbeit BI\" | spath input=values output=values path={} | mvexpand values | spath input=values | fields value count | sort - count | rename value as \"" + i18n_testReworkBI + "\"",
            "managerid": "histogram_search",
            "id": "search19"
        }, {tokens: true, tokenNamespace: "submitted"});

        var search_f1datum = new SearchManager({
            "search": '| loadjob $ipsq_base_search$ | eval _time=strptime(\'F1 Datum\',"%Y/%m/%d %H:%M:%S") | timechart span=1h count | rename count as "' + i18n_count + '" _time as "' + i18n_time + '"',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": false,
            "id": "search_f1datum"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        var search_prdatum = new SearchManager({
            "search": '| loadjob $ipsq_base_search$ | eval _time=strptime(\'Prüfdatum\',"%Y/%m/%d %H:%M:%S") | timechart span=1h count | rename count as "' + i18n_count + '" _time as "' + i18n_time + '"',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": false,
            "id": "search_prdatum"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        var search_nadatum = new SearchManager({
            "search": '| loadjob $ipsq_base_search$ | eval _time=strptime(\'Nacharbeitsdatum\',"%Y/%m/%d %H:%M:%S") | timechart count | rename count as "' + i18n_count + '" _time as "' + i18n_time + '"',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": false,
            "id": "search_nadatum"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        var search_f1diff = new SearchManager({
            "search": '| loadjob $ipsq_base_search$ | eval na_datum=strptime(\'Nacharbeitsdatum\',"%Y/%m/%d %H:%M:%S") | eval f1_datum=strptime(\'F1 Datum\',"%Y/%m/%d %H:%M:%S") | eval diff=(na_datum-f1_datum)/60/60  | table diff | bin span=1 diff | stats count by diff | sort diff | rename count as "' + i18n_count + '" diff as "' + i18n_timeDiff + '"',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": false,
            "id": "search_f1diff"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        var search_prdiff = new SearchManager({
            "search": '| loadjob $ipsq_base_search$ | eval na_datum=strptime(\'Nacharbeitsdatum\',"%Y/%m/%d %H:%M:%S") | eval pr_datum=strptime(\'Prüfdatum\',"%Y/%m/%d %H:%M:%S") | eval diff=(na_datum-pr_datum)/60/60  | table diff | bin span=1 diff | stats count by diff | sort diff | rename count as "' + i18n_count + '" diff as "' + i18n_timeDiff + '"',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": false,
            "id": "search_prdiff"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        var search_nadauer = new SearchManager({
            "search": '| loadjob $ipsq_base_search$ |  eval dauer=\'NA Nacharbeitsdauer\' | eval dauer=replace(dauer,",",".") | search dauer>0 | table dauer | eval dauer=if(dauer>120,120,dauer) | chart count by dauer span=5 | eval dauer=if(dauer=="120-125",">120",dauer) | rename count as "' + i18n_count + '" dauer as "' + i18n_duration + '"',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": false,
            "id": "search_nadauer"
        }, {tokens: true, tokenNamespace: "submitted"});
        
        
        
        
}
        var search_tagcloud = new SearchManager({
            "id": 'search_tagcloud',
            "search": '| loadjob $ipsq_base_search$ | search NOT ("NA Bemerkung"="..FMS" AND "PR Bemerkung"="..FMS") ("NA Bemerkung"=* AND "PR Bemerkung"=*) \
| eval token=\'PR Bemerkung\'." ".\'NA Bemerkung\' | eval token=replace(token,"\\[[^\\]]*\\]"," ") | table token \
| makemv tokenizer="([\\wÄÖÜäöüß]{3,})" token | eval token=lower(token) | stats count as tf by token \
| regex token!="\\d\\d" | lookup german_stopwords.csv stopword AS token OUTPUT stopword | search NOT stopword=* | fields - stopword \
| lookup doc_freq.csv token OUTPUT df | fillnull df value=1 | eventstats max(df) as max_df | eval idf=log(1+max_df/df) \
| eval tf_idf=tf*idf \
| sort - tf_idf | head 50 | eval rand=random() | sort rand',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var ipsq_search = new SearchManager({
            "id": "ipsq_search",
            "latest_time": "$pruefdatum.latest$",
            "earliest_time": "$pruefdatum.earliest$",
            "search": 'tag=ipsq werk=$werkfilter$ \
$freitext$ $baureihe$ $I-Stufe$ $shortVIN$ $typschluesselNr$ $merkmalBezeichnung$ $naFehlerortBezeichnung$ $naFehlerortNr$ $naFehlerartBezeichnung$ $naFehlerartNr$ $naFehlerlageBezeichnung$ \
$naTaetigkeitBezeichnung$ $prBemerkungNaBemerkung$ $naNacharbeiterId$ $naSchichtBezeichnung$ $naLeistKostenstelleNr$ $NaLeistMeisterbereichNr$ $naBelKostenstelleNr$ $naBelMeisterbereichNr$ \
$naBelProduktionsbereichNr$ $naNacharbeitsDauer$ $fehlertypbezeichnung$ $prFehlerprotokollTeil1$ $prFehlerprotokollTeil2$ $prFehlerprotokollTeil3$ $prFehlerprotokollTeil4$ $prStationNr$ \
$naStationBezeichnung$ $prPruefNacharbeitBI$ $prPrueferID$ \
NOT Fahrgestellnummer="" NOT Fahrgestellnummer=Fahrgestellnummer NOT Fahrgestellnummer=absteigend $order_data_join$  \
 \
| fields  shortVIN,"Baureihe Code","Typschluessel Nr","Sistufenr","Nacharbeitsdatum","Merkmal Bezeichnung","NA Fehlerort Bezeichnung","NA Fehlerort Nr","NA Fehlerart Bezeichnung","NA Fehlerart Nr",\
    "NA Fehlerlage Bezeichnung","NA Taetigkeit Bezeichnung","NA_Bemerkung","NA Nacharbeiter ID","NA Schicht Bezeichnung","NA Leist Kostenstelle Nr","NA Leist Meisterbereich Nr","NA Bel Kostenstelle Nr",\
    "NA Bel Meisterbereich Nr","NA Bel Produktionsbereich Nr","NA Nacharbeitsdauer","PR_NA Fehlertyp Bezeichnung","PR Fehlerprotokoll Teil 1","PR Fehlerprotokoll Teil 2","PR Fehlerprotokoll Teil 3",\
    "PR Fehlerprotokoll Teil 4","PR Station Nr","NA Station Bezeichnung","PR Pruef Nacharbeit BI","PR_Bemerkung","PR Pruefer ID","Pruefdatum","F1 Datum" \
| fields - _raw _time \
| rename \
  "NA Taetigkeit Bezeichnung" AS "NA T\u00e4tigkeit Bezeichnung" \
  "PR Pruef Nacharbeit BI" AS "PR Pr\u00fcf Nacharbeit BI" \
  "PR Pruefer ID" AS "PR Pr\u00fcfer ID" \
  Pruefdatum AS "Pr\u00fcfdatum" \
  "Typschluessel Nr" AS "Typschl\u00fcssel Nr" \
  "PR_Bemerkung" AS "PR Bemerkung" \
  "NA_Bemerkung" AS "NA Bemerkung"',
            "status_buckets": 0,
            "cancelOnUnload": true,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "cache": 600,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true, tokenNamespace: "submitted"});
        
        ipsq_search.on("search:done", function() {
            setToken("ipsq_base_search",ipsq_search.job.sid);
        });
        
        var ipsq_search_table = new PostProcessManager({
            "id": "ipsq_search_table",
            "managerid": "ipsq_search",
            "search": '| rename \n' +
                '  shortVIN as "' + i18n_shortVIN + '" \n' +
                '  "Baureihe Code" as "' + i18n_series + '" \n' +
                '  "Sistufenr" as "' + i18n_iLevel + '" \n' +
                '  "Nacharbeitsdatum" as "' + i18n_datetime + '" \n' +
                '  "Merkmal Bezeichnung" as "' + i18n_feature_name + '" \n' +
                '  "NA Fehlerort Bezeichnung" as "' + i18n_errorLocName + '" \n' +
                '  "NA Fehlerort Nr" as "' + i18n_errorLocNr + '" \n' +
                '  "NA Fehlerart Bezeichnung" as "' + i18n_errorTypeName + '" \n' +
                '  "NA Fehlerart Nr" as "' + i18n_errorTypeNr + '" \n' +
                '  "NA Fehlerlage Bezeichnung" as "' + i18n_errorLevelName + '" \n' +
                '  "NA_Bemerkung" as "' + i18n_NaComment + '" \n' +
                '  "NA Nacharbeiter ID" as "' + i18n_reworkerId + '" \n' +
                '  "NA Schicht Bezeichnung" as "' + i18n_shiftName + '" \n' +
                '  "NA Leist Kostenstelle Nr" as "' + i18n_performCc + '" \n' +
                '  "NA Leist Meisterbereich Nr" as "' + i18n_performMt + '" \n' +
                '  "NA Bel Kostenstelle Nr" as "' + i18n_chargedCc + '" \n' +
                '  "NA Bel Meisterbereich Nr" as "' + i18n_chargedMt + '" \n' +
                '  "NA Bel Produktionsbereich Nr" as "' + i18n_chargedPt + '" \n' +
                '  "NA Nacharbeitsdauer" as "' + i18n_reworkDuration + '" \n' +
                '  "PR_NA Fehlertyp Bezeichnung" as "' + i18n_prNaErrorTypeName + '" \n' +
                '  "PR Fehlerprotokoll Teil 1" as "' + i18n_errorProtocolP1 + '" \n' +
                '  "PR Fehlerprotokoll Teil 2" as "' + i18n_errorProtocolP2 + '" \n' +
                '  "PR Fehlerprotokoll Teil 3" as "' + i18n_errorProtocolP3 + '" \n' +
                '  "PR Fehlerprotokoll Teil 4" as "' + i18n_errorProtocolP4 + '" \n' +
                '  "PR Station Nr" as "' + i18n_stationNr + '" \n' +
                '  "NA Station Bezeichnung" as "' + i18n_stationName + '" \n' +
                '  "PR Bemerkung" as "' + i18n_PrComment + '" \n' +
                '  "F1 Datum" as "' + i18n_f1Date + '" \n' +
                '  "NA T\u00e4tigkeit Bezeichnung" as "' + i18n_activityName + '" \n' +
                '  "PR Pr\u00fcf Nacharbeit BI" as "' + i18n_testReworkBI + '" \n' +
                '  "PR Pr\u00fcfer ID" as "' + i18n_testerID + '" \n' +
                '  "Pr\u00fcfdatum" as "' + i18n_testDate + '" \n' +
                '  "Typschl\u00fcssel Nr" as "' + i18n_typeKey + '"',
        }, {tokens: true, tokenNamespace: "submitted"});
        
        
        var histogram_search = new SearchManager({
            "id": "histogram_search",
            "search": '| loadjob $ipsq_base_search$ \
| fieldsummary maxvals=10 "shortVIN" "Baureihe Code" "Typschlüssel Nr" "Sistufenr" "Merkmal Bezeichnung" "NA Bel Produktionsbereich Nr" "NA Fehlerlage Bezeichnung" "NA Tätigkeit Bezeichnung" "NA Schicht Bezeichnung" \
"NA Leist Kostenstelle Nr" "NA Leist Meisterbereich Nr" "NA Bel Kostenstelle Nr" "NA Bel Meisterbereich Nr" "NA Fehlerort Bezeichnung" "PR_NA Fehlertyp Bezeichnung" "PR Station Nr" "NA Station Bezeichnung" "PR Prüf Nacharbeit BI" \
| table field values',
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true
        }, {tokens: true, tokenNamespace: "submitted"});

        
        var search_saCodes = new SearchManager({
            "id": "search_saCodes",
            "latest_time": "$latest$",
            "earliest_time": "0",
            "search": "| tstats values(OrderData.saCode) AS saCode from datamodel=APDM_OrderData_Events where (nodename = OrderData) OrderData.werk=$werkfilter$  (earliest=$order_data_base_search_earliest$) (latest=$order_data_base_search_latest$) | mvexpand saCode",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true});

        var search_sxCodes = new SearchManager({
            "id": "search_sxCodes",
            "latest_time": "$latest$",
            "earliest_time": "$earliest$",
            "search": "| tstats values(OrderData.sxCode) AS sxCode from datamodel=APDM_OrderData_Events where (nodename = OrderData) OrderData.werk=$werkfilter$ (earliest=$order_data_base_search_earliest$) (latest=$order_data_base_search_latest$) | mvexpand sxCode",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {tokens: true});



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
        }, {tokens: true}).render();

        new FooterView({
            id: 'footer',
            el: $('.footer')
        }, {tokens: true}).render();


        //
        // DASHBOARD EDITOR
        //

        new Dashboard({
            id: 'dashboard',
            el: $('.dashboard-body'),
            showTitle: true,
            editable: true
        }, {tokens: true}).render();


        //
        // VIEWS: VISUALIZATION ELEMENTS
        //

        var element1 = new SingleElement({
            "id": "element1",
            "managerid": "search1",
            "el": $('#element1')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element2 = new SingleElement({
            "id": "element2",
            "managerid": "search2",
            "el": $('#element2')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element3 = new ChartElement({
            "id": "element3",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search3",
            "el": $('#element3')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element4 = new ChartElement({
            "id": "element4",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search4",
            "el": $('#element4')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element5 = new ChartElement({
            "id": "element5",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search5",
            "el": $('#element5')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element6 = new ChartElement({
            "id": "element6",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search6",
            "el": $('#element6')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element7 = new ChartElement({
            "id": "element7",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search7",
            "el": $('#element7')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element8 = new ChartElement({
            "id": "element8",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search8",
            "el": $('#element8')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element9 = new ChartElement({
            "id": "element9",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search9",
            "el": $('#element9')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element10 = new ChartElement({
            "id": "element10",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search10",
            "el": $('#element10')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element11 = new ChartElement({
            "id": "element11",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search11",
            "el": $('#element11')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element12 = new ChartElement({
            "id": "element12",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search12",
            "el": $('#element12')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element13 = new ChartElement({
            "id": "element13",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search13",
            "el": $('#element13')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element14 = new ChartElement({
            "id": "element14",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search14",
            "el": $('#element14')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        var element_bel_kst = new ChartElement({
            "id": "element_bel_kst",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search_bel_kst",
            "el": $('#element_bel_kst')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
 
        var element15 = new ChartElement({
            "id": "element15",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search15",
            "el": $('#element15')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element16 = new ChartElement({
            "id": "element16",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search16",
            "el": $('#element16')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element17 = new ChartElement({
            "id": "element17",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search17",
            "el": $('#element17')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element18 = new ChartElement({
            "id": "element18",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search18",
            "el": $('#element18')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        
        var element19 = new ChartElement({
            "id": "element19",
            "charting.chart": "bar",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisTitleX.visibility": "visible",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "charting.axisTitleY.visibility": "collapsed",
            "managerid": "search19",
            "el": $('#element19')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element_nadauer = new ChartElement({
            "id": "element_nadauer",
            "charting.chart": "column",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "managerid": "search_nadauer",
            "el": $('#element_nadauer')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element_f1datum = new ChartElement({
            "id": "element_f1datum",
            "charting.chart": "column",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "managerid": "search_f1datum",
            "el": $('#element_f1datum')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element_nadatum = new ChartElement({
            "id": "element_nadatum",
            "charting.chart": "column",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "managerid": "search_nadatum",
            "el": $('#element_nadatum')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        var element_prdatum = new ChartElement({
            "id": "element_prdatum",
            "charting.chart": "column",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "managerid": "search_prdatum",
            "el": $('#element_prdatum')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element_f1diff = new ChartElement({
            "id": "element_f1diff",
            "charting.chart": "column",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "managerid": "search_f1diff",
            "el": $('#element_f1diff')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var element_prdiff = new ChartElement({
            "id": "element_prdiff",
            "charting.chart": "column",
            "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
            "charting.legend.placement": "none",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.drilldown": "none",
            "width": "675px",
            "resizable": true,
            "managerid": "search_prdiff",
            "el": $('#element_prdiff')
        }, {tokens: true, tokenNamespace: "submitted"}).render();
        
        var BemerkungsTagCloud = TagCloud.extend({
            events: {
                'click a': function(e) {
                    e.preventDefault();
                    var name = this.settings.get('labelField');
                    var value = $.trim($(e.target).text());
                    setToken("form.freitext",submittedTokenModel.get("form.freitext")+" "+value)
                }
            }
        });
        var tagcloud = new BemerkungsTagCloud({
            id: 'tagcloud',
            managerid: 'search_tagcloud',
            labelField: 'token',
            valueField: 'tf_idf',
            el: $('#tagcloud')
        }).render();
        /*tagcloud.on("click a", function(e) {
            if (e.field !== undefined) {
                e.preventDefault();
                console.log(e.data);
                //var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/iqp/apdm_recherche_fahrzeug?form.tsdatum.earliest=$pruefdatum.earliest$&form.tsdatum.latest=$pruefdatum.latest$&form.shortVIN=$row.shortVIN$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
                //utils.redirect(url);
            }
        });*/
        
        var TableView = require("splunkjs/mvc/tableview");
        var ipsq_table = new DockedTableElement({
            "id": "ipsq_table",
            "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
            "charting.axisLabelsX.majorLabelStyle.rotation": "0",
            "charting.axisTitleX.visibility": "visible",
            "charting.axisTitleY.visibility": "visible",
            "charting.axisTitleY2.visibility": "visible",
            "charting.axisX.scale": "linear",
            "charting.axisY.scale": "linear",
            "charting.axisY2.enabled": "false",
            "charting.axisY2.scale": "inherit",
            "charting.chart": "column",
            "charting.chart.nullValueMode": "gaps",
            "charting.chart.sliceCollapsingThreshold": "0.01",
            "charting.chart.stackMode": "default",
            "charting.chart.style": "shiny",
            "charting.drilldown": "all",
            "charting.layout.splitSeries": "0",
            "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
            "charting.legend.placement": "right",
            "count": 10,
            "dataOverlayMode": "none",
            "drilldown": "row",
            "list.drilldown": "full",
            "list.wrap": "1",
            "maxLines": "5",
            "raw.drilldown": "full",
            "rowNumbers": "false",
            "table.drilldown": "all",
            "table.wrap": "1",
            "type": "list",
            "wrap": "true",
            "managerid": "ipsq_search_table",
            "el": $('#ipsq_table')
        }, {tokens: true, tokenNamespace: "submitted"}).render();

        ipsq_table.on("click", function(e) {
            if (e.field !== undefined) {
                e.preventDefault();
                var url = TokenUtils.replaceTokenNames("apdm_recherche_fahrzeug?form.tsdatum.earliest=$pruefdatum.earliest$&form.tsdatum.latest=$pruefdatum.latest$&form.shortVIN=$row." + i18n_shortVIN + "$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'));
                utils.redirect(url, newWindow = true);
            }
        });
        


        //
        // VIEWS: FORM INPUTS
        //
        var input1 = new TimeRangeInput({
            "id": "input1",
            "label": i18n_datetime,
            "default": {"latest_time": "now", "earliest_time": "-7d"},
            "searchWhenChanged": true,
            "earliest_time": "$form.pruefdatum.earliest$",
            "latest_time": "$form.pruefdatum.latest$",
            "el": $('#input1')
        }, {tokens: true}).render();

        input1.on("change", function(newValue) {
            FormUtils.handleValueChange(input1);
        });

    
    var werkinput = new DropdownInput({
            "id": "werkinput",
            "label": i18n_werk,
            "choices": [],
            "searchWhenChanged": true,
            "selectFirstChoice": false,
            "showClearButton": false,
            "value": "$form.werkfilter$",
            "el": $('#werkinput')
        }, {
            tokens: true
        }).render();

        werkinput.on("change", function(newValue) {
            FormUtils.handleValueChange(werkinput);
        });
  
		// erstelleWerkfilter
		erstelleWerkfilter( "werkinput" );

        
        //Beginn weitere Filter
        {
        var input_freitext = new TextInput({
            "id": "input_freitext",
            "label": i18n_freetext,
            "default": "*",
            "suffix": "",
            "prefix": "",
            "searchWhenChanged": true,
            "value": "$form.freitext$",
            "el": $('#input_freitext')
        }, {tokens: true}).render();

        input_freitext.on("change", function(newValue) {
            FormUtils.handleValueChange(input_freitext);
        });
        
        
        var input2 = new DropdownInput({
            "id": "input2",
            "label": i18n_saCode,
            "choices": [
                {"value": "*", "label": "Alle"}
            ],
            "default": "*",
            "showClearButton": true,
            "selectFirstChoice": false,
            "labelField": "saCode",
            "prefix": "(OrderData.saCode=\"",
            "valueField": "saCode",
            "suffix": "\")",
            "searchWhenChanged": true,
            "value": "$form.saCode$",
            "managerid": "search_saCodes",
            "el": $('#input2')
        }, {tokens: true}).render();

        input2.on("change", function(newValue) {
            FormUtils.handleValueChange(input2);
        });

    
        var input3 = new DropdownInput({
            "id": "input3",
            "label": i18n_sxCode,
            "choices": [
                {"value": "*", "label": "Alle"}
            ],
            "default": "*",
            "showClearButton": true,
            "selectFirstChoice": false,
            "labelField": "sxCode",
            "prefix": "(OrderData.sxCode=\"",
            "valueField": "sxCode",
            "suffix": "\")",
            "searchWhenChanged": true,
            "value": "$form.sxCode$",
            "managerid": "search_sxCodes",
            "el": $('#input3')
        }, {tokens: true}).render();

        input3.on("change", function(newValue) {
            FormUtils.handleValueChange(input3);
        });

    
        var input4 = new TextInput({
            "id": "input4",
            "label": i18n_series,
            "default": "",
            "suffix": "\"",
            "prefix": "\"Baureihe Code\"=\"",
            "searchWhenChanged": true,
            "value": "$form.baureihe$",
            "el": $('#input4')
        }, {tokens: true}).render();

        input4.on("change", function(newValue) {
            //FormUtils.handleValueChange(input4);
            if (newValue==="") {
                setToken("baureihe"," ");
            } else {
                FormUtils.handleValueChange(input4);
            }
        });

    
        var input5 = new TextInput({
            "id": "input5",
            "label": i18n_iLevel,
            "default": "",
            "suffix": "\"",
            "prefix": "\"Sistufenr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.I-Stufe$",
            "el": $('#input5')
        }, {tokens: true}).render();

        input5.on("change", function(newValue) {
           if (newValue==="") {
                setToken("I-Stufe"," ");
            } else {
                FormUtils.handleValueChange(input5);
            }
        });
        
        var input_shortVIN = new MultiSelectInput({
            "id": "input_shortVIN",
            "label": i18n_shortVIN,
            "choices": [{
                    "value": "*",
                    "label": "Alle"
            }],
            "default": "*",
            "valuePrefix": "shortVIN=\"",
            "valueSuffix": "\"",
            "delimiter": " OR ",
            "allowCustomValues": true,
            "value": "$form.shortVIN$",
            "searchWhenChanged": true,
            "el": $('#input6')
        }, {
            tokens: true
        }).render();
        
        input_shortVIN.on("change", function (newValue) {
            FormUtils.handleValueChange(input_shortVIN);
            splunkUtils.handleAllOption(this, newValue, defaultTokenModel);
        });
        
        var input7 = new TextInput({
            "id": "input7",
            "label": i18n_typeKey,
            "default": "",
            "suffix": "\"",
            "prefix": "\"Typschluessel Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.typschluesselNr$",
            "el": $('#input7')
        }, {tokens: true}).render();

        input7.on("change", function(newValue) {
            if (newValue==="") {
                setToken("typschluesselNr"," ");
            } else {
                FormUtils.handleValueChange(input7);
            }
        });

    
        var input8 = new TextInput({
            "id": "input8",
            "label": i18n_feature_name,
            "default": "",
            "suffix": "\"",
            "prefix": "\"Merkmal Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.merkmalBezeichnung$",
            "el": $('#input8')
        }, {tokens: true}).render();

        input8.on("change", function(newValue) {
            if (newValue==="") {
                setToken("merkmalBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input8);
            }
        });

    
        var input9 = new TextInput({
            "id": "input9",
            "label": i18n_errorLocName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Fehlerort Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naFehlerortBezeichnung$",
            "el": $('#input9')
        }, {tokens: true}).render();

        input9.on("change", function(newValue) {
           if (newValue==="") {
                setToken("naFehlerortBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input9);
            }
        });

    
        var input10 = new TextInput({
            "id": "input10",
            "label": i18n_errorLocNr,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Fehlerort Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naFehlerortNr$",
            "el": $('#input10')
        }, {tokens: true}).render();

        input10.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naFehlerortNr"," ");
            } else {
                FormUtils.handleValueChange(input10);
            }
        });

    
        var input11 = new TextInput({
            "id": "input11",
            "label": i18n_errorTypeName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Fehlerart Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naFehlerartBezeichnung$",
            "el": $('#input11')
        }, {tokens: true}).render();

        input11.on("change", function(newValue) {
             if (newValue==="") {
                setToken("naFehlerartBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input11);
            }
        });

    
        var input12 = new TextInput({
            "id": "input12",
            "label": i18n_errorTypeNr,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Fehlerart Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naFehlerartNr$",
            "el": $('#input12')
        }, {tokens: true}).render();

        input12.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naFehlerartNr"," ");
            } else {
                FormUtils.handleValueChange(input12);
            }
        });

    
        var input13 = new TextInput({
            "id": "input13",
            "label": i18n_errorLevelName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Fehlerlage Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naFehlerlageBezeichnung$",
            "el": $('#input13')
        }, {tokens: true}).render();

        input13.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naFehlerlageBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input13);
            }
        });

    
        var input14 = new TextInput({
            "id": "input14",
            "label": i18n_activityName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Taetigkeit Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naTaetigkeitBezeichnung$",
            "el": $('#input14')
        }, {tokens: true}).render();

        input14.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naTaetigkeitBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input14);
            }
        });

    
        var input15 = new TextInput({
            "id": "input15",
            "label": i18n_NaPrComment,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Bemerkung u NA Bemerkung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prBemerkungNaBemerkung$",
            "el": $('#input15')
        }, {tokens: true}).render();

        input15.on("change", function(newValue) {
              if (newValue==="") {
                setToken("prBemerkungNaBemerkung"," ");
            } else {
                FormUtils.handleValueChange(input15);
            }
        });

    
        var input16 = new TextInput({
            "id": "input16",
            "label": i18n_reworkerId,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Nacharbeiter ID\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naNacharbeiterId$",
            "el": $('#input16')
        }, {tokens: true}).render();

        input16.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naNacharbeiterId"," ");
            } else {
                FormUtils.handleValueChange(input16);
            }
        });

    
        var input17 = new TextInput({
            "id": "input17",
            "label": i18n_shiftName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Schicht Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naSchichtBezeichnung$",
            "el": $('#input17')
        }, {tokens: true}).render();

        input17.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naSchichtBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input17);
            }
        });

    
        var input18 = new TextInput({
            "id": "input18",
            "label": i18n_performCc,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Leist Kostenstelle Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naLeistKostenstelleNr$",
            "el": $('#input18')
        }, {tokens: true}).render();

        input18.on("change", function(newValue) {
             if (newValue==="") {
                setToken("naLeistKostenstelleNr"," ");
            } else {
                FormUtils.handleValueChange(input18);
            }
        });

    
        var input19 = new TextInput({
            "id": "input19",
            "label": i18n_performMt,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Leist Meisterbereich Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.NaLeistMeisterbereichNr$",
            "el": $('#input19')
        }, {tokens: true}).render();

        input19.on("change", function(newValue) {
             if (newValue==="") {
                setToken("NaLeistMeisterbereichNr"," ");
            } else {
                FormUtils.handleValueChange(input19);
            }
        });
        
        var input_bel_kst = new TextInput({
            "id": "input_bel_kst",
            "label": i18n_chargedCc,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Bel Kostenstelle Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naBelKostenstelleNr$",
            "el": $('#input_bel_kst')
        }, {tokens: true}).render();

        input_bel_kst.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naBelKostenstelleNr"," ");
            } else {
                FormUtils.handleValueChange(input_bel_kst);
            }
        });
    
        var input20 = new TextInput({
            "id": "input20",
            "label": i18n_chargedMt,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Bel Meisterbereich Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naBelMeisterbereichNr$",
            "el": $('#input20')
        }, {tokens: true}).render();

        input20.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naBelMeisterbereichNr"," ");
            } else {
                FormUtils.handleValueChange(input20);
            }
        });

    
        var input21 = new TextInput({
            "id": "input21",
            "label": i18n_chargedPt,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Bel Produktionsbereich Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naBelProduktionsbereichNr$",
            "el": $('#input21')
        }, {tokens: true}).render();

        input21.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naBelProduktionsbereichNr"," ");
            } else {
                FormUtils.handleValueChange(input21);
            }
        });

    
        var input22 = new TextInput({
            "id": "input22",
            "label": i18n_reworkDuration,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Nacharbeitsdauer\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naNacharbeitsDauer$",
            "el": $('#input22')
        }, {tokens: true}).render();

        input22.on("change", function(newValue) {
             if (newValue==="") {
                setToken("naNacharbeitsDauer"," ");
            } else {
                FormUtils.handleValueChange(input22);
            }
        });

    
        var input23 = new TextInput({
            "id": "input23",
            "label": i18n_prNaErrorTypeName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR_NA Fehlertyp Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.fehlertypbezeichnung$",
            "el": $('#input23')
        }, {tokens: true}).render();

        input23.on("change", function(newValue) {
             if (newValue==="") {
                setToken("fehlertypbezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input23);
            }
        });

    
        var input24 = new TextInput({
            "id": "input24",
            "label": i18n_errorProtocolP1,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Fehlerprotokoll Teil 1\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prFehlerprotokollTeil1$",
            "el": $('#input24')
        }, {tokens: true}).render();

        input24.on("change", function(newValue) {
            if (newValue==="") {
                setToken("prFehlerprotokollTeil1"," ");
            } else {
                FormUtils.handleValueChange(input24);
            }
        });

    
        var input25 = new TextInput({
            "id": "input25",
            "label": i18n_errorProtocolP2,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Fehlerprotokoll Teil 2\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prFehlerprotokollTeil2$",
            "el": $('#input25')
        }, {tokens: true}).render();

        input25.on("change", function(newValue) {
            if (newValue==="") {
                setToken("prFehlerprotokollTeil2"," ");
            } else {
                FormUtils.handleValueChange(input25);
            }
        });

    
        var input26 = new TextInput({
            "id": "input26",
            "label": i18n_errorProtocolP3,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Fehlerprotokoll Teil 3\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prFehlerprotokollTeil3$",
            "el": $('#input26')
        }, {tokens: true}).render();

        input26.on("change", function(newValue) {
            if (newValue==="") {
                setToken("prFehlerprotokollTeil3"," ");
            } else {
                FormUtils.handleValueChange(input26);
            }
        });

    
        var input27 = new TextInput({
            "id": "input27",
            "label": i18n_errorProtocolP4,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Fehlerprotokoll Teil 4\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prFehlerprotokollTeil4$",
            "el": $('#input27')
        }, {tokens: true}).render();

        input27.on("change", function(newValue) {
             if (newValue==="") {
                setToken("prFehlerprotokollTeil4"," ");
            } else {
                FormUtils.handleValueChange(input27);
            }
        });

    
        var input28 = new TextInput({
            "id": "input28",
            "label": i18n_stationNr,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Station Nr\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prStationNr$",
            "el": $('#input28')
        }, {tokens: true}).render();

        input28.on("change", function(newValue) {
            if (newValue==="") {
                setToken("prStationNr"," ");
            } else {
                FormUtils.handleValueChange(input28);
            }
        });

    
        var input29 = new TextInput({
            "id": "input29",
            "label": i18n_stationName,
            "default": "",
            "suffix": "\"",
            "prefix": "\"NA Station Bezeichnung\"=\"",
            "searchWhenChanged": true,
            "value": "$form.naStationBezeichnung$",
            "el": $('#input29')
        }, {tokens: true}).render();

        input29.on("change", function(newValue) {
            if (newValue==="") {
                setToken("naStationBezeichnung"," ");
            } else {
                FormUtils.handleValueChange(input29);
            }
        });

    
        var input30 = new TextInput({
            "id": "input30",
            "label": i18n_testReworkBI,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Pruef Nacharbeit BI\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prPruefNacharbeitBI$",
            "el": $('#input30')
        }, {tokens: true}).render();

        input30.on("change", function(newValue) {
            if (newValue==="") {
                setToken("prPruefNacharbeitBI"," ");
            } else {
                FormUtils.handleValueChange(input30);
            }
        });

    
        var input31 = new TextInput({
            "id": "input31",
            "label": i18n_testerID,
            "default": "",
            "suffix": "\"",
            "prefix": "\"PR Pruefer ID\"=\"",
            "searchWhenChanged": true,
            "value": "$form.prPrueferID$",
            "el": $('#input31')
        }, {tokens: true}).render();

        input31.on("change", function(newValue) {
            if (newValue==="") {
                setToken("prPrueferID"," ");
            } else {
                FormUtils.handleValueChange(input31);
            }
        });
        
        
        }
        // Ende weitere Filter
    

        // Initialize time tokens to default
        if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
            defaultTokenModel.set({ earliest: '0', latest: '' });
        }

        submitTokens();


        require(['jquery', 'splunkjs/mvc/simplexml/ready!'], function($) {
        
            // Statistische Auswertungen ausblenden
            $("#panel_stat .panel-title").append("<button class=\"btn\" id=\"hide_button\"><span class=\"icon-chevron-up\"></span></button>")
            $("#panel_stat .dashboard-panel").css("min-height","0px");
            $("#panel_stat #hide_button").on("click", function() {
                $("#panel_stat h2").nextAll().slideToggle();
                $("#panel_stat #hide_button span").toggleClass("icon-chevron-up");
                $("#panel_stat #hide_button span").toggleClass("icon-chevron-down");
                //[element1,element2,element3,element4,element5,element6,element7,element8,element9,element10,element11,element12,element13,element14,element15,element16,element17,element18,element19,element_bel_kst].forEach(function(chart){chart.render()});
            });
            $("#panel_stat h2").nextAll().slideToggle();
            $("#panel_stat #hide_button span").toggleClass("icon-chevron-up");
            $("#panel_stat #hide_button span").toggleClass("icon-chevron-down");
        
            // Weitere Filter ausblenden
            $("#panel_filt .panel-title").append("<button class=\"btn\" id=\"hide_button\"><span class=\"icon-chevron-up\"></span></button>")
            $("#panel_filt .dashboard-panel").css("min-height","0px");
            $("#panel_filt #hide_button").on("click", function() {
                $("#panel_filt h2").nextAll().slideToggle();
                $("#panel_filt #hide_button span").toggleClass("icon-chevron-up");
                $("#panel_filt #hide_button span").toggleClass("icon-chevron-down");
            });
            $("#panel_filt h2").nextAll().slideToggle();
            $("#panel_filt #hide_button span").toggleClass("icon-chevron-up");
            $("#panel_filt #hide_button span").toggleClass("icon-chevron-down");
        });

        //
        // DASHBOARD READY
        //

        DashboardController.ready();
        pageLoading = false;

    }
);