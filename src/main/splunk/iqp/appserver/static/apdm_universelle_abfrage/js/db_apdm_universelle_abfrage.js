//# sourceURL=UniAPDM\js\apdm_universelle_abfrage.js

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "underscore",
        "jquery",
        "splunk.i18n",
        "splunkjs/mvc/simplexml",
        "splunkjs/mvc/layoutview",
        "splunkjs/mvc/tableview",
        "splunkjs/mvc/simplexml/dashboardview",
        "splunkjs/mvc/simplexml/dashboard/panelref",
        "splunkjs/mvc/simplexml/element/chart",
        "splunkjs/mvc/simplexml/element/event",
        "splunkjs/mvc/simplexml/element/html",
        "splunkjs/mvc/simplexml/element/list",
        "splunkjs/mvc/simplexml/element/map",
        "splunkjs/mvc/simplexml/element/single",
        "splunkjs/mvc/simplexml/element/table",
        "splunkjs/mvc/simplexml/element/visualization",
        "splunkjs/mvc/simpleform/formutils",
        "splunkjs/mvc/simplexml/eventhandler",
        "splunkjs/mvc/simplexml/searcheventhandler",
        "splunkjs/mvc/simpleform/input/dropdown",
        "splunkjs/mvc/simpleform/input/radiogroup",
        "splunkjs/mvc/simpleform/input/linklist",
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
        "../app/iqp/DockedTableView/DockedTableElement",
        "../app/iqp/DockedTableView/DockedTableView2",
        "../app/iqp/werkfilter_fnc"
        // Add comma-separated libraries and modules manually here, for example:
        // ..."splunkjs/mvc/simplexml/urltokenmodel",
        // "splunkjs/mvc/tokenforwarder"
    ],
    function(
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        i18n,
        DashboardController,
        LayoutView,
        TableView,
        Dashboard,
        PanelRef,
        ChartElement,
        EventElement,
        HtmlElement,
        ListElement,
        MapElement,
        SingleElement,
        TableElement,
        VisualizationElement,
        FormUtils,
        EventHandler,
        SearchEventHandler,
        DropdownInput,
        RadioGroupInput,
        LinkListInput,
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
        DockedTableElement,
        DockedTableView,
        erstelleWerkfilter

        // Add comma-separated parameter names here, for example:
        // ...UrlTokenModel,
        // TokenForwarder
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
        
        i18n._("Einstellungen fuer Tabelle");
        i18n._("Filter zuruecksetzen");
        
        var i18n_dateTestStep = i18n._("Datum des Testschrittes");
        var i18n_series = i18n._("Baureihe");
        var i18n_iLevel = i18n._("I-Stufe");
        var i18n_system = i18n._("System");
        var i18n_testProcedure = i18n._("Pruefprozedur");
        var i18n_errCodeDec = i18n._("Error Code (Dec)");
        var i18n_resultData = i18n._("Result Data");
        var i18n_factory = i18n._("Werk");
        var i18n_inSaCode = i18n._("Fahrzeug enthaelt saCode");
        var i18n_outSaCode = i18n._("Fahrzeug enthaelt saCode nicht");
        var i18n_groupBy = i18n._("Gruppierung");
        var i18n_colHide = i18n._("Spalten ausblenden");
        var i18n_none = i18n._("Keine");
        var i18n_shortVIN = i18n._("FGNR");
        var i18n_testTime = i18n._("Pruefzeit");
        var i18n_testScope = i18n._("Pruefumfang");
        var i18n_errorCount = i18n._("Fehleranzahl");
        var i18n_sequence = i18n._("Sequenz");
        var i18n_testObject = i18n._("Pruefling");
        var i18n_testStep = i18n._("Pruefschritt");
        var i18n_sgbd = i18n._("SGBD");
        var i18n_apiJob = i18n._("Api-Job");
        var i18n_parameter = i18n._("Parameter");
        var i18n_resultName = i18n._("Ergebnisname");
        var i18n_minVal = i18n._("Min-Wert");
        var i18n_isVal = i18n._("Ist-Wert");
        var i18n_maxVal = i18n._("Max-Wert");
        var i18n_ok_nok = i18n._("OK/NOK");
        var i18n_errorType = i18n._("Fehlertyp");
        var i18n_stepDuration = i18n._("Schrittdauer");
        var i18n_errorText = i18n._("Fehlertext");
        var i18n_annotationText = i18n._("Hinweistext");
        var i18n_puVersion = i18n._("PU-Version");
        
        //
        // SEARCH MANAGERS
        //

        var search_filter_options_tests = new SearchManager({
            "id": "search_filter_options_tests",
            "sample_ratio": null,
            "latest_time": "$tsdatum.latest$",
            "search": '| tstats values(TestStepResult.systemName) AS systemName values(TestStepResult.pruefumfangName) AS pruefumfangName values(TestStepResult.prueflingName) AS prueflingName values(TestStepResult.param1) AS param1 from datamodel=APDM_TestStepResults where (nodename = TestStepResult) () prestats=false ',
            "earliest_time": "$tsdatum.earliest$",
            "cancelOnUnload": true,
            "status_buckets": 0,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search_filter_options_vehicle = new SearchManager({
            "id": "search_filter_options_vehicle",
            "sample_ratio": null,
            "latest_time": "$tsdatum.latest$",
            "search": '| tstats count from datamodel=APDM_TestStepResults where (nodename = TestStepResult) ($tstats_filt_werk$) prestats=true groupBy TestStepResult.series TestStepResult.integrationLevel TestStepResult.systemName TestStepResult.saCode | head 10000 \n' +
                '| stats count by TestStepResult.series TestStepResult.integrationLevel TestStepResult.saCode \n' +
                '| rename TestStepResult.series AS series, TestStepResult.integrationLevel AS integrationLevel, TestStepResult.saCode AS saCode' +
                '| fields series, integrationLevel, saCode',
            "earliest_time": "$tsdatum.earliest$",
            "cancelOnUnload": true,
            "status_buckets": 0,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search1 = new PostProcessManager({
            "search": "search (series=*) ($search_filt_saCode_or$) ($search_filt_saCode_not$) ($search_filt_integrationLevel$) | table series | dedup series | sort series",
            "managerid": "search_filter_options_vehicle",
            "id": "search1"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search2 = new PostProcessManager({
            "search": "search (integrationLevel=*) ($search_filt_saCode_or$) ($search_filt_saCode_not$) ($search_filt_baureihe$) | table integrationLevel | dedup integrationLevel | sort integrationLevel",
            "managerid": "search_filter_options_vehicle",
            "id": "search2"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search3 = new PostProcessManager({
            "search": "search (systemName=*) ($search_filt_pruefumfang$) ($search_filt_pruefling$) ($search_filt_sgbd$) | fields systemName | mvexpand systemName | sort systemName",
            "managerid": "search_filter_options_tests",
            "id": "search3"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search4 = new PostProcessManager({
            "search": "search (pruefumfangName=*) ($search_filt_system$) ($search_filt_pruefling$) ($search_filt_sgbd$) | fields pruefumfangName | mvexpand pruefumfangName | sort pruefumfangName",
            "managerid": "search_filter_options_tests",
            "id": "search4"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search5 = new PostProcessManager({
            "search": "search (prueflingName=*) ($search_filt_system$) ($search_filt_pruefumfang$) ($search_filt_sgbd$) | fields prueflingName | mvexpand prueflingName | sort prueflingName",
            "managerid": "search_filter_options_tests",
            "id": "search5"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search6 = new PostProcessManager({
            "search": "search (param1=*) ($search_filt_system$) ($search_filt_pruefumfang$) ($search_filt_pruefling$) | fields param1 | mvexpand param1 | sort param1",
            "managerid": "search_filter_options_tests",
            "id": "search6"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });

        var search7 = new PostProcessManager({
            "search": "search (saCode=*) ($search_filt_baureihe$) ($search_filt_integrationLevel$) | table saCode | dedup saCode | sort saCode",
            "managerid": "search_filter_options_vehicle",
            "id": "search7"
        }, {
            tokens: true,
            tokenNamespace: "default"
        });



        //
        // SPLUNK LAYOUT
        //

        $('header').remove();
        new LayoutView({
                "hideAppBar": false,
                "hideChrome": false,
                "hideFooter": false,
                "hideSplunkBar": false
            })
            .render()
            .getContainerElement()
            .appendChild($('.dashboard-body')[0]);

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

        var table_no_groups = new DockedTableElement({
            "id": "table_no_groups",
            "tokenDependencies": {
                "depends": "$group_by_not_set$",
            },
            "drilldown": "none",
            "managerid": "search_table_no_groups",
            "pageSize": 100,
            "el": $('#table_no_groups')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();

        var table_groups = new TableElement({
            "id": "table_groups",
            "tokenDependencies": {
                "depends": "$group_by_set$",
            },
            "drilldown": "none",
            "managerid": "search_outer_table_groups",
            "pageSize": 100,
            "el": $('#table_groups')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();


        //
        // VIEWS: FORM INPUTS
        //

        var filt_time = new TimeRangeInput({
            "id": "filt_time",
            "label": i18n_dateTestStep,
            "searchWhenChanged": false,
            "default": {
                "latest_time": "now",
                "earliest_time": "-15m@m"
            },
            "earliest_time": "$form.tsdatum.earliest$",
            "latest_time": "$form.tsdatum.latest$",
            "el": $('#filt_time')
        }, {
            tokens: true
        }).render();

        filt_time.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_time);
        });

        var filt_baureihe = new MultiSelectInput({
            "id": "filt_baureihe",
            "label": i18n_series,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "series=",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "series",
            "labelField": "series",
            "value": "$form.filt_baureihe$",
            "managerid": "search1",
            "el": $('#filt_baureihe')
        }, {
            tokens: true
        }).render();

        filt_baureihe.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_baureihe);
            setNewMultiValueSearchToken(this, newValue);
            // changeTstatInputTokens(newValue, this);
        });

        var filt_integrationLevel = new MultiSelectInput({
            "id": "filt_integrationLevel",
            "label": i18n_iLevel,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "integrationLevel=",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "integrationLevel",
            "labelField": "integrationLevel",
            "value": "$form.filt_integrationLevel$",
            "managerid": "search2",
            "el": $('#filt_integrationLevel')
        }, {
            tokens: true
        }).render();

        filt_integrationLevel.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_integrationLevel);
            //changeTstatInputTokens(newValue, this);
            setNewMultiValueSearchToken(this, newValue);
        });

        var filt_shortVIN = new TextInput({
            "id": "filt_shortVIN",
            "searchWhenChanged": false,
            "default": "*",
            "value": "$form.filt_shortVIN$",
            "el": $('#filt_shortVIN')
        }, {
            tokens: true
        }).render();

        filt_shortVIN.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_shortVIN);
        });

        var filt_system = new MultiSelectInput({
            "id": "filt_system",
            "label": i18n_system,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "systemName=",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "systemName",
            "labelField": "systemName",
            "value": "$form.filt_system$",
            "managerid": "search3",
            "el": $('#filt_system')
        }, {
            tokens: true
        }).render();

        filt_system.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_system);
            setNewMultiValueSearchToken(this, newValue);
            //changeTstatInputTokens(newValue, this);
        });

        var filt_pruefumfang = new MultiSelectInput({
            "id": "filt_pruefumfang",
            "label": i18n_testScope,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "pruefumfangName=",
            "delimiter": "\n OR\n ",
            "default": ["*"],
            "valueField": "pruefumfangName",
            "labelField": "pruefumfangName",
            "value": "$form.filt_pruefumfang$",
            "managerid": "search4",
            "el": $('#filt_pruefumfang')
        }, {
            tokens: true
        }).render();

        filt_pruefumfang.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_pruefumfang);
            setNewMultiValueSearchToken(this, newValue);
            //changeTstatInputTokens(newValue, this);
        });

        var filt_pruefling = new MultiSelectInput({
            "id": "filt_pruefling",
            "label": i18n_testObject,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "prueflingName=",
            "delimiter": "\n  OR\n ",
            "default": ["*"],
            "valueField": "prueflingName",
            "labelField": "prueflingName",
            "value": "$form.filt_pruefling$",
            "managerid": "search5",
            "el": $('#filt_pruefling')
        }, {
            tokens: true
        }).render();

        filt_pruefling.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_pruefling);
            //changeTstatInputTokens(newValue, this);
            setNewMultiValueSearchToken(this, newValue);
        });

        var filt_pruefprozedur = new TextInput({
            "id": "filt_pruefprozedur",
            "label": i18n_testProcedure,
            "searchWhenChanged": false,
            "default": "*",
            "value": "$form.filt_pruefprozedur$",
            "el": $('#filt_pruefprozedur')
        }, {
            tokens: true
        }).render();

        filt_pruefprozedur.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_pruefprozedur);
        });

        var filt_sgbd = new MultiSelectInput({
            "id": "filt_sgbd",
            "label": i18n_sgbd,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "param1=",
            "delimiter": " OR ",
            "default": ["*"],
            "valueField": "param1",
            "labelField": "param1",
            "value": "$form.filt_sgbd$",
            "managerid": "search6",
            "el": $('#filt_sgbd')
        }, {
            tokens: true
        }).render();

        filt_sgbd.on("change", function(newValue) {
            setNewMultiValueSearchToken(this, newValue);
            FormUtils.handleValueChange(filt_sgbd);
        });

        var filt_errorCode = new TextInput({
            "id": "filt_errorCode",
            "label": i18n_errCodeDec,
            "searchWhenChanged": false,
            "default": "*",
            "value": "$form.filt_errorCode$",
            "el": $('#filt_errorCode')
        }, {
            tokens: true
        }).render();

        filt_errorCode.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_errorCode);
        });

        var filt_errorText = new TextInput({
            "id": "filt_errorText",
            "label": i18n_errorText,
            "searchWhenChanged": false,
            "default": "*",
            "value": "$form.filt_errorText$",
            "el": $('#filt_errorText')
        }, {
            tokens: true
        }).render();

        filt_errorText.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_errorText);
        });

        var filt_hinweisText = new TextInput({
            "id": "filt_hinweisText",
            "label": i18n_annotationText,
            "searchWhenChanged": false,
            "default": "*",
            "value": "$form.filt_hinweisText$",
            "el": $('#filt_hinweisText')
        }, {
            tokens: true
        }).render();

        filt_hinweisText.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_hinweisText);
        });

        var filt_resultData = new TextInput({
            "id": "filt_resultData",
            "label": i18n_resultData,
            "searchWhenChanged": false,
            "default": "*",
            "value": "$form.filt_resultData$",
            "el": $('#filt_resultData')
        }, {
            tokens: true
        }).render();

        filt_resultData.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_resultData);
        });
        

        var filt_werk = new MultiSelectInput({
            "id": "filt_werk",
            "label": i18n_factory,
            "choices": [],
            "delimiter": " OR ",
            "searchWhenChanged": false,
            "valuePrefix": "werk=",
            "value": "$form.werkfilter$",
            "el": $('#filt_werk')
        }, {
            tokens: true
        }).render();

        filt_werk.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_werk);
            setNewMultiValueSearchToken(this, newValue);
        });
        
        // erstelleWerkfilter
        erstelleWerkfilter( "filt_werk" );

        var filt_saCode_or = new MultiSelectInput({
            "id": "filt_saCode_or",
            "label": i18n_inSaCode,
            "choices": [{
                "label": "Alle",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "saCode=",
            "delimiter": " OR ",
            "default": ["*"],
            "valueField": "saCode",
            "labelField": "saCode",
            "value": "$form.filt_saCode_or$",
            "managerid": "search7",
            "el": $('#filt_saCode_or')
        }, {
            tokens: true
        }).render();

        filt_saCode_or.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_saCode_or);
            //changeTstatInputTokens(newValue, this);
            setNewMultiValueSearchToken(this, newValue);

        });

        var filt_saCode_not = new MultiSelectInput({
            "id": "filt_saCode_not",
            "label": i18n_outSaCode,
            "choices": [{
                "label": "Keine",
                "value": "*"
            }],
            "searchWhenChanged": false,
            "valuePrefix": "NOT saCode=",
            "delimiter": " ",
            "default": ["*"],
            "valueField": "saCode",
            "labelField": "saCode",
            "value": "$form.filt_saCode_not$",
            "managerid": "search7",
            "el": $('#filt_saCode_not')
        }, {
            tokens: true
        }).render();

        filt_saCode_not.on("change", function(newValue) {
            FormUtils.handleValueChange(filt_saCode_not);
            var prefix_tstats = " NOT TestStepResult." + this.options.valueField + "=";
            var prefix_search = " NOT " + this.options.valueField + "=";
            var tstatsTokenName = "tstats_" + this.name;
            var tstatsTokenString = "";
            var searchTokenName = "search_" + this.name;
            var searchTokenString = "";
            if (newValue[0] != '*') {
                for (var i = 0; i < newValue.length; i++) {
                    tstatsTokenString += prefix_tstats + newValue[i];
                    searchTokenString += prefix_search + newValue[i];
                }
            } else {
                tstatsTokenString = "";
                searchTokenString = "";
            }
            setToken(tstatsTokenName, tstatsTokenString);
            setToken(searchTokenName, searchTokenString);
        });

        var div_buttons = new HtmlElement({
            "id": "div_buttons",
            "useTokens": true,
            "el": $('#div_buttons')
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        }).render();
        DashboardController.addReadyDep(div_buttons.contentLoaded());

        div_buttons.on("change", function(newValue) {
            FormUtils.handleValueChange(div_buttons);
        });

        function setNewMultiValueSearchToken(input, newValue) {
            var searchTokenName = "search_" + input.options.name;
            var searchTokenValue = "";
            var tstatsTokenName = "tstats_" + input.options.name;
            var tstatsTokenValue = "";

            var change = false;
            if (newValue.length == 1) {
                if (newValue[0] != "*") {
                    change = true;
                } else {

                }
            } else if (newValue.length > 1) {
                change = true;

            }
            if (change) {
                for (var i = 0; i < newValue.length; i++) {
                    searchTokenValue += input.options.valuePrefix + "\"" + newValue[i] + "\"";
                    tstatsTokenValue += "TestStepResult." + input.options.valuePrefix + "\"" + newValue[i] + "\"";
                    if (i < newValue.length - 1) {
                        searchTokenValue += input.options.delimiter;
                        tstatsTokenValue += input.options.delimiter;
                    }
                }
            }
            defaultTokenModel.set(searchTokenName, searchTokenValue);
            defaultTokenModel.set(tstatsTokenName, tstatsTokenValue);
        }

        function setNewTextValueSearchToken(valuePrefix, tokenName, token) {
            var searchTokenName = "search_" + tokenName;
            var searchTokenValue = "";
            var tstatsTokenName = "tstats_" + tokenName;
            var tstatsTokenValue = "";
            if (token.length < 2) {
                if (token != "*" && token != "") {
                    searchTokenValue = valuePrefix + "=\"" + token + "\"";
                    tstatsTokenValue = "TestStepResult." + valuePrefix + "=\"" + token + "\"";
                }
            } else {
                searchTokenValue = valuePrefix + "=\"" + token + "\"";
                tstatsTokenValue = "TestStepResult." + valuePrefix + "=\"" + token + "\"";
            }
            defaultTokenModel.set(searchTokenName, searchTokenValue);
            defaultTokenModel.set(tstatsTokenName, tstatsTokenValue);
        }

        var columnChoices = [{
            'label': i18n_none,
            'value': 'None'
        }, {
            'label': i18n_shortVIN,
            'value': 'shortVIN'
        }, {
            'label': i18n_testTime,
            'value': 'testTime'
        }, {
            'label': i18n_testScope,
            'value': 'physicalPruefumfangName'
        }, {
            'label': i18n_errorCount,
            'value': 'errorCount'
        }, {
            'label': i18n_sequence,
            'value': 'sequenceNrResult'
        }, {
            'label': i18n_testObject,
            'value': 'testStepName'
        }, {
            'label': i18n_testStep,
            'value': 'description'
        }, {
            'label': i18n_sgbd,
            'value': 'param1'
        }, {
            'label': i18n_apiJob,
            'value': 'param2'
        }, {
            'label': i18n_parameter,
            'value': 'param3'
        }, {
            'label': i18n_resultName,
            'value': 'resultName'
        }, {
            'label': i18n_minVal,
            'value': 'minValueStr'
        }, {
            'label': i18n_isVal,
            'value': 'resultValueStr'
        }, {
            'label': i18n_maxVal,
            'value': 'maxValueStr'
        }, {
            'label': i18n_ok_nok,
            'value': 'testStepResult'
        }, {
            'label': i18n_errorType,
            'value': 'errorType'
        }, {
            'label': i18n_stepDuration,
            'value': 'testStepDuration'
        }, {
            'label': i18n_errorText,
            'value': 'errorText'
        }, {
            'label': i18n_annotationText,
            'value': 'adviceText'
        }, {
            'label': i18n_puVersion,
            'value': 'testVersion'
        }];


        var renameStr = " | rename ";
        for (i = 1; i < columnChoices.length; i++) {
            renameStr += columnChoices[i]["value"] + " AS \"" + columnChoices[i]["label"] + "\" ";
        }
        var valuesStr = columnChoices.map(function(a) {return (["*","shortVIN","sequenceNrResult"].indexOf(a.value)>-1) ? "" : "    values(TestStepResult."+a.value+") as "+a.value+"\n";}).slice(1, columnChoices.length).join("");
        var dropdown_group_by = new DropdownInput({
            "id": "dropdown_group_by",
            "label": i18n_groupBy,
            "choices": columnChoices,
            "selectFirstChoice": false,
            "searchWhenChanged": true,
            "default": "None",
            "showClearButton": true,
            "value": "$form.groupBy$",
            "el": $('#dropdown_group_by')
        }, {
            tokens: true
        }).render();

        dropdown_group_by.on("change", function(newValue) {
            FormUtils.handleValueChange(dropdown_group_by);
        });

        columnChoices.shift();
        columnChoices.unshift({
            "label": "Keine",
            "value": "*"
        });


        var selectColumns = new MultiSelectInput({
            "id": "selectColumns",
            "label": i18n_colHide,
            "choices": columnChoices,
            "searchWhenChanged": true,
            "default": ["*"],
            "delimiter": " ",
            "value": "$form.filt_column$",
            "el": $('#selectColumns')
        }, {
            tokens: true
        }).render();

        selectColumns.on("change", function(newValue) {
            FormUtils.handleValueChange(dropdown_group_by);
            var tokenString = newValue.join(' ');
            if (tokenString == '*') {
                tokenString = ' ';
            }
            setToken("filt_selected_columns", tokenString);

        });

        DashboardController.onReady(function() {
            if (!submittedTokenModel.has('earliest') && !submittedTokenModel.has('latest')) {
                submittedTokenModel.set({
                    earliest: '0',
                    latest: ''
                });
            }
        });

        // Initialize time tokens to default
        if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
            defaultTokenModel.set({
                earliest: '0',
                latest: ''
            });
        }

        submitTokens();


        //
        // CUSTOMIZATION
        //
        setToken('filt_shortVIN_string', "");
        var submit = new SubmitButton({
            id: 'submit',
            el: $('#submit_button')
        }, {
            tokens: true
        }).render();


        submit.on("submit", function() {

            var filter_vin = " ";
            var vin_array = TokenUtils.replaceTokenNames("$filt_shortVIN$", defaultTokenModel.toJSON()).match(/\S+/g);
            filter_vin += "(TestStepResult.shortVIN=*" + vin_array.join(" OR TestStepResult.shortVIN=*") + ")";
            setToken('filt_shortVIN_string', filter_vin);

            var filt_errorCode = defaultTokenModel.get("filt_errorCode");
            var filt_errorText = defaultTokenModel.get("filt_errorText");
            var filt_hinweisText = defaultTokenModel.get("filt_hinweisText");
            var filt_resultData = defaultTokenModel.get("filt_resultData");
            var filt_pruefprozedur = defaultTokenModel.get("filt_pruefprozedur");
            setNewTextValueSearchToken("ErrorCodeDec", "filt_errorCode", filt_errorCode);
            setNewTextValueSearchToken("errorText", "filt_errorText", filt_errorText);
            setNewTextValueSearchToken("adviseText", "filt_hinweisText", filt_hinweisText);
            setNewTextValueSearchToken("resultData", "filt_resultData", filt_resultData);
            setNewTextValueSearchToken("pruefprozedurName", "filt_pruefprozedur", filt_pruefprozedur);
            
            excel_export.excel_export(table_no_groups.options.id, table_no_groups.options.managerid);
            submitTokens();
            setToken("base_search_filters_set", "true");
        });

        var BasicRowRenderer = TableView.BaseRowExpansionRenderer.extend({
            canRender: function(rowData) {
                return true;
            },
            render: function($container, rowData) {
                var inTabObj = mvc.Components.get("inner_table");
                if(inTabObj!=undefined){
                    inTabObj.remove();
                }
                var subTableDiv = $('<div id="UniApdmSubTable" class="table"></div>');

                var inner_table = new DockedTableView({
                    id: "inner_table",
                    managerid: "search_inner_table",
                    drilldown: "none",
                    pageSize: 100,
                    el: subTableDiv
                });
                setToken("group_by_value", rowData.values[0]);
                // Display some of the rowData in the expanded row
                subTableDiv.css({
                    width: ($container.width() - 20),
                    'overflow-x': 'auto',
                    'overflow-y': 'hidden'
                });
                $container.append(subTableDiv);
                
                (function tableHeadChecker(){
                    setTimeout(function(){
                        if(typeof submittedTokenModel.get("group_by_not_set") == "undefined") {
                            $('.header-table-docked').css('left','80px');
                            $('.header-table-docked').css('right','30px');
                            tableHeadChecker();
                        }
                    },3000);
                })();
            }
        });

        var tableRowRender = new BasicRowRenderer();


        var search_base = new SearchManager({
            "search": '| tstats count\n' + valuesStr + 
                '  from datamodel=APDM_TestStepResults\n' +
                '  where (nodename = TestStepResult) $filt_shortVIN_string$ ($tstats_filt_saCode_or$) ($tstats_filt_saCode_not$) ($tstats_filt_baureihe$) ($tstats_filt_integrationLevel$) ($tstats_filt_system$) ($tstats_filt_pruefumfang$) ($tstats_filt_pruefling$) ($tstats_filt_sgbd$) ($tstats_filt_werk$) $tstats_filt_pruefprozedur$ $tstats_filt_errorCode$ $tstats_filt_errorText$ $tstats_filt_hinweisText$ $tstats_filt_resultData$\n' +
                '  groupby source, TestStepResult.sequenceNrResult, TestStepResult.shortVIN prestats=true \n' +
                '| head 10000',
            "earliest_time": "$tsdatum.earliest$",
            "latest_time": "$tsdatum.latest$",
            "id": "search_base"
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

        var search_table_no_groups = new PostProcessManager({
            "search": '| stats count\n' + valuesStr + 
                '  by source, TestStepResult.sequenceNrResult, TestStepResult.shortVIN\n' +
                '| rename TestStepResult.* AS * | fields - source\n' +
                '| fillnull value="-"\n' + 
                "$group_by_not_set$ | fields - $groupBy$ $filt_selected_columns$ " + renameStr,
            "id": "search_table_no_groups",
            "managerid": "search_base",
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

        var search_outer_table_groups = new PostProcessManager({
            "search": '| stats count\n' + valuesStr + 
                '  by source, TestStepResult.sequenceNrResult, TestStepResult.shortVIN\n' +
                '| rename TestStepResult.* AS * | fields - source\n' +
                '| fillnull value="-"\n' + 
                "$group_by_set$ | table $groupBy$ | dedup $groupBy$" + renameStr,
            "id": "search_outer_table_groups",
            "managerid": "search_base",
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });

        var search_inner_table = new PostProcessManager({
            "search": '| stats count\n' + valuesStr + 
                '  by source, TestStepResult.sequenceNrResult, TestStepResult.shortVIN\n' +
                '| rename TestStepResult.* AS * | fields - source\n' +
                '| fillnull value="-"\n' + 
                "$group_by_set$ | search $groupBy$=$group_by_value$ | fields - $groupBy$ $filt_selected_columns$" + renameStr,
            "id": "search_inner_table",
            "managerid": "search_base",
        }, {
            tokens: true,
            tokenNamespace: "submitted"
        });



        search_outer_table_groups.on("search:done", function() {
            table_groups.getVisualization().done(function(myTableView) {
                myTableView.addRowExpansionRenderer(tableRowRender);
            });
        });

        submittedTokenModel.on("change:groupBy", function(model, value, options) {
            if (value == "None") {
                unsetToken("group_by_set");
                setToken("group_by_not_set", " ");
            } else {
                setToken("group_by_set", " ");
                unsetToken("group_by_not_set");
            }
        });


        defaultTokenModel.on("change:filt_shortVIN", function(e) {
            var textfeld = $('#input_shortVIN');
            textfeld.val(e.attributes.filt_shortVIN);
            textfeld.text(e.attributes.filt_shortVIN);
        });


        function handle_all_option(value, input) {
            var token = input.settings.attributes.token
            var index = value.indexOf("*");
            var last_index = value.length - 1;
            if (index > -1 && last_index > 0) {
                var newValue = value.slice();
                if (index == last_index) {
                    newValue = ["*"];
                } else {
                    newValue.splice(index, 1);
                }
                defaultTokenModel.set("form." + token, newValue);
            }
        };


        mvc.Components.get("filt_baureihe").on("change", handle_all_option);
        mvc.Components.get("filt_integrationLevel").on("change", handle_all_option);
        mvc.Components.get("filt_system").on("change", handle_all_option);
        mvc.Components.get("filt_pruefumfang").on("change", handle_all_option);
        mvc.Components.get("filt_pruefling").on("change", handle_all_option);
        mvc.Components.get("filt_sgbd").on("change", handle_all_option);
        mvc.Components.get("filt_saCode_or").on("change", handle_all_option);
        mvc.Components.get("filt_saCode_not").on("change", handle_all_option);
        mvc.Components.get("filt_werk").on("change", handle_all_option);
        mvc.Components.get("selectColumns").on("change", handle_all_option);

        mvc.Components.get("filt_saCode_not").on("change", function(value, input) {
            var token = input.settings.attributes.token
            var index = value.indexOf("xyzxyzxyz");
            var last_index = value.length - 1;
            if (index > -1 && last_index > 0) {
                var newValue = value.slice();
                if (index == last_index) {
                    newValue = ["xyzxyzxyz"];
                } else {
                    newValue.splice(index, 1);
                }
                defaultTokenModel.set("form." + token, newValue);
            }
        });


        $("#input_shortVIN").on('input', function(input) {
            var text = $("#input_shortVIN").val();
            defaultTokenModel.set("filt_shortVIN", text);
        });

        $("#reset_button").on("click", function() {

            filt_time.val(filt_time.settings.get("default"));
            filt_baureihe.val(filt_baureihe.settings.get("default"));
            filt_integrationLevel.val(filt_integrationLevel.settings.get("default"));
            filt_system.val(filt_system.settings.get("default"));
            filt_pruefumfang.val(filt_pruefumfang.settings.get("default"));
            filt_pruefling.val(filt_pruefling.settings.get("default"));
            filt_pruefprozedur.val(filt_pruefprozedur.settings.get("default"));
            filt_sgbd.val(filt_sgbd.settings.get("default"));
            filt_errorCode.val(filt_errorCode.settings.get("default"));
            filt_errorText.val(filt_errorText.settings.get("default"));
            filt_hinweisText.val(filt_hinweisText.settings.get("default"));
            filt_resultData.val(filt_resultData.settings.get("default"));
            filt_saCode_or.val(filt_saCode_or.settings.get("default"));
            filt_saCode_not.val(filt_saCode_not.settings.get("default"));
            filt_werk.val(filt_werk.settings.get("default"));
            defaultTokenModel.set('form.filt_shortVIN', ['*']);
            unsetToken("base_search_filters_set");

        });


        //
        // DASHBOARD READY
        //


        DashboardController.ready();
        pageLoading = false;

    }
);
