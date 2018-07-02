//# sourceURL=fws_fahrwerksdaten/js/fahrwerksdaten.js
require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "underscore",
    "jquery",
    "splunk.i18n",
    "splunkjs/mvc/simplexml",
    "splunkjs/mvc/layoutview",
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
    "../../app/RDS_TA_html2pdf/html2pdf",
    "../../app/iqp/excel_export_fnc",
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
        html2pdf,
        excelExportFnc,
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

        var env_locale = "alias_" + window.location.pathname.split("/")[1].split("-")[0];
        
        setToken("env_locale", env_locale);
        setToken("groupByArray", []);
        
        function createChassisChoices(elem) {
            var evt = $.Event('chassisChoicesCreated');
            var defaultTokenModel = mvc.Components.getInstance('default');
            var env_locale = defaultTokenModel.get("env_locale");;
            var choices = {};
            var service = mvc.createService();
            
            var searchQuery = "| inputlookup lkup_ko_lagen";
            var searchParams = {
                exec_mode: "blocking"
            };
            
            // A blocking search returns the job's SID when the search is done
            console.log("Wait for the search to finish...");

            // Run a blocking search and get back a job
            service.oneshotSearch(
                searchQuery,
                searchParams,
                function(err, results) {
                    console.log("...done!\n");
                    
                    var f_id = results.fields.indexOf("id");
                    var f_resultName = results.fields.indexOf("resultName");
                    var f_alias_de = results.fields.indexOf("alias_de");
                    var f_alias_en = results.fields.indexOf("alias_en");
                    var rows = results.rows;
                    
                    for(var i = 0; i < rows.length; i++) {
                        var choice = {};
                        choice["id"] = rows[i][f_id];
                        choice["alias_de"] = rows[i][f_alias_de];
                        choice["alias_en"] = rows[i][f_alias_en];
                        
                        chassis_choices[rows[i][f_resultName]] = choice;
                    }
                    
                    evt.state = "done";
                    elem.trigger(evt);
                }
            );
        }
        
        // Options of chassis settings
        var chassis_choices = {};
        
        var win = $(window);
        
        createChassisChoices(win);
        
        win.on('chassisChoicesCreated', function (e) {
            //
            // SEARCH MANAGERS
            //

            
            var search_filter_options = new SearchManager({
                "id": "search_filter_options",
                "status_buckets": 0,
                "earliest_time": "$tok_dt.earliest$",
                "cancelOnUnload": true,
                "latest_time": "$tok_dt.latest$",
                "search": "| tstats   \n" +
                    "    count  \n" +
                    "  from datamodel=APDM_FWS.Achse  \n" +
                    "  where (nodename=Achse) $tok_werk$ \n" +
                    "  groupby _time source Achse.shortVIN Achse.werk Achse.wheelAlignmentCode Achse.resultName Achse.measureType Achse.pruefumfangName Achse.testStand Achse.resultValueDbl Achse.desiredValueDbl \n" +
                    "| fields - count  \n" +
                    "| eventstats \n" +
                    "    count AS maxEinstellhaeufigkeit \n" +
                    "  by Achse.shortVIN Achse.resultName \n" +
                    "| table source Achse.werk Achse.wheelAlignmentCode Achse.resultName Achse.measureType Achse.pruefumfangName Achse.testStand maxEinstellhaeufigkeit \n" +
                    "| dedup source Achse.werk Achse.wheelAlignmentCode Achse.resultName Achse.measureType Achse.pruefumfangName Achse.testStand maxEinstellhaeufigkeit",
                "sample_ratio": 1,
                "app": utils.getCurrentApp(),
                "auto_cancel": 90,
                "preview": true,
                "tokenDependencies": {
                },
                "runWhenTimeIsUndefined": false
            }, {tokens: true, tokenNamespace: "default"});
            
            var search_histogram = new SearchManager({
                "id": "search_histogram",
                "status_buckets": 0,
                "earliest_time": "$tok_dt.earliest$",
                "cancelOnUnload": true,
                "latest_time": "$tok_dt.latest$",
                "search": "| tstats   \n" +
                    "    first(Achse.evaluationMaxValue) AS Achse.evaluationMaxValue \n" +
                    "    first(Achse.evaluationMinValue) AS Achse.evaluationMinValue \n" +
                    "    first(Achse.adjustMaxDbl) AS Achse.adjustMaxDbl \n" +
                    "    first(Achse.adjustMinDbl) AS Achse.adjustMinDbl \n" +
                    "    first(Achse.maxValueDbl) AS Achse.maxValueDbl \n" +
                    "    first(Achse.minValueDbl) AS Achse.minValueDbl \n" +
                    "    first(Achse.desiredValueDbl) AS Achse.desiredValueDbl \n" +
                    "  from datamodel=APDM_FWS.Achse  \n" +
                    "  where (nodename=Achse) $tok_werk$ $tok_fwe$ $tok_pruefumfang$ $tok_teststand$ $tok_messungsart$ $tok_wheelAlignmentCode$ \n" +
                    "  groupby _time source Achse.shortVIN Achse.werk Achse.wheelAlignmentCode Achse.resultName Achse.measureType Achse.pruefumfangName Achse.testStand Achse.resultValueDbl \n" +
                    "| rename \n" +
                    "  Achse.* AS * \n" +
                    "| eval differenceValDbl=resultValueDbl-desiredValueDbl \n" +
                    "| rename $tok_toleranz$ \n" +
                    "| fields werk testStand wheelAlignmentCode shortVIN resultName differenceValDbl minToleranz maxToleranz \n" +
                    "| lookup lkup_werk_input value AS werk OUTPUT werk AS werk\n" +
                    "| lookup lkup_spurcode Spurcode as wheelAlignmentCode OUTPUT Beschreibung AS spurcode \n" +
                    "| eval wheelAlignmentCode=wheelAlignmentCode+ if(isNotNull(spurcode), \" (\"+spurcode+\")\", \"\")\n" +
                    "| sort _time\n" +
                    "| streamstats\n" +
                    "    count AS Einstellhaeufigkeit \n" +
                    "  by shortVIN resultName \n" +
                    "| where $tok_einstellhaeufigkeit$ \n" +
                    "| rename \n" +
                    "  minToleranz AS UEG \n" +
                    "  maxToleranz AS OEG \n" +
                    "  differenceValDbl AS resultValueDbl \n" +
                    "| eventstats \n" +
                    "    count as Anz \n" +
                    "    avg(resultValueDbl) as Avg \n" +
                    "    stdev(resultValueDbl) as Stdev \n" +
                    "    max(resultValueDbl) as Max \n" +
                    "    min(resultValueDbl) as Min \n" +
                    "    first(eval(OEG-UEG)) As T \n" +
                    "    count(eval(resultValueDbl<UEG)) as under \n" +
                    "    count(eval(resultValueDbl>OEG)) as over \n" +
                    "  by resultName $tok_groupBy$ \n" +
                    "| eval    Avg=round(Avg, 2),    Stdev=round(Stdev, 2)",
                "sample_ratio": 1,
                "app": utils.getCurrentApp(),
                "auto_cancel": 90,
                "preview": false,
                "tokenDependencies": {
                },
                "runWhenTimeIsUndefined": false
            }, {tokens: true, tokenNamespace: "submitted"});
            search_histogram.on("search:progress", function(){
                $('#searchGif').show();
            });
            
            search_histogram.on("search:done", function(){
                setToken("search_histogram_done", "");
                $('#searchGif').hide();
                console.log("search_histogram_done");
            });
            
            var search_sollIst = new SearchManager({
                "id": "search_sollIst",
                "status_buckets": 0,
                "earliest_time": "$tok_dt.earliest$",
                "cancelOnUnload": true,
                "latest_time": "$tok_dt.latest$",
                "search": "| tstats   \n" +
                    "    first(Achse.evaluationMaxValue) AS Achse.evaluationMaxValue \n" +
                    "    first(Achse.evaluationMinValue) AS Achse.evaluationMinValue \n" +
                    "    first(Achse.adjustMaxDbl) AS Achse.adjustMaxDbl \n" +
                    "    first(Achse.adjustMinDbl) AS Achse.adjustMinDbl \n" +
                    "    first(Achse.maxValueDbl) AS Achse.maxValueDbl \n" +
                    "    first(Achse.minValueDbl) AS Achse.minValueDbl \n" +
                    "    first(Achse.desiredValueDbl) AS Achse.desiredValueDbl \n" +
                    "  from datamodel=APDM_FWS.Achse  \n" +
                    "  where (nodename=Achse) $tok_werk$ $tok_fwe$ $tok_pruefumfang$ $tok_teststand$ $tok_messungsart$ $tok_wheelAlignmentCode$ \n" +
                    "  groupby _time source Achse.shortVIN Achse.werk Achse.wheelAlignmentCode Achse.resultName Achse.measureType Achse.pruefumfangName Achse.testStand Achse.resultValueDbl \n" +
                    "| rename \n" +
                    "  Achse.* AS * \n" +
                    "| eval differenceValDbl=desiredValueDbl-resultValueDbl \n" +
                    "| rename $tok_toleranz$ \n" +
                    "| fields _time werk wheelAlignmentCode shortVIN testStand measureType resultName differenceValDbl minToleranz maxToleranz \n" +
                    "| lookup lkup_werk_input value AS werk OUTPUT werk AS werk\n" +
                    "| lookup lkup_spurcode Spurcode as wheelAlignmentCode OUTPUT Beschreibung AS spurcode \n" +
                    "| eval wheelAlignmentCode=wheelAlignmentCode+ if(isNotNull(spurcode), \" (\"+spurcode+\")\", \"\")\n" +
                    "| sort _time \n" +
                    "| streamstats \n" +
                    "    count AS Einstellhaeufigkeit \n" +
                    "  by shortVIN resultName \n" +
                    "| where $tok_einstellhaeufigkeit$ \n" +
                    "| rename \n" +
                    "  minToleranz AS UEG \n" +
                    "  maxToleranz AS OEG \n" +
                    "  differenceValDbl AS resultValueDbl \n" +
                    "| eventstats \n" +
                    "    count as Anz \n" +
                    "    avg(resultValueDbl) as Avg \n" +
                    "    stdev(resultValueDbl) as Stdev \n" +
                    "    max(resultValueDbl) as Max \n" +
                    "    min(resultValueDbl) as Min \n" +
                    "    first(eval(OEG-UEG)) As T \n" +
                    "    count(eval(resultValueDbl<UEG)) as under \n" +
                    "    count(eval(resultValueDbl>OEG)) as over \n" +
                    "  by resultName $tok_groupBy$ \n" +
                    "| eval    Avg=round(Avg, 2),    Stdev=round(Stdev, 2)",
                "sample_ratio": 1,
                "app": utils.getCurrentApp(),
                "auto_cancel": 90,
                "preview": false,
                "tokenDependencies": {
                },
                "runWhenTimeIsUndefined": false
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_filter_wheelAlignmentCode = new PostProcessManager({
                "tokenDependencies": {
                },
                "managerid": "search_filter_options",
                "search": "search $tok_werk$ $tok_pruefumfang$ $tok_teststand$ $tok_messungsart$  | rename Achse.* AS * | fields wheelAlignmentCode | dedup wheelAlignmentCode \n" +
                    "| lookup lkup_spurcode Spurcode as wheelAlignmentCode OUTPUT Beschreibung AS spurcode \n" +
                "| eval spurcode=wheelAlignmentCode+\" (\"+spurcode+\")\"",
                "id": "search_filter_wheelAlignmentCode"
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_filter_resultName = new PostProcessManager({
                "tokenDependencies": {
                },
                "managerid": "search_filter_options",
                "search": "search $tok_werk$ $tok_pruefumfang$ $tok_teststand$ $tok_messungsart$ | rename Achse.* AS * | fields resultName | dedup resultName \n" +
                "| lookup lkup_ko_lagen resultName OUTPUT " + env_locale + " as shortResultName sortNr as sortResultName \n" +
                "| sort sortResultName shortResultName",
                "id": "search_filter_resultName"
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_filter_pruefumfangName = new PostProcessManager({
                "tokenDependencies": {
                },
                "managerid": "search_filter_options",
                "search": "search $tok_werk$ $tok_teststand$ $tok_messungsart$ | rename Achse.* AS * | fields pruefumfangName | dedup pruefumfangName",
                "id": "search_filter_pruefumfangName"
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_filter_testStand = new PostProcessManager({
                "tokenDependencies": {
                },
                "managerid": "search_filter_options",
                "search": "search $tok_werk$ $tok_pruefumfang$ $tok_messungsart$ | rename Achse.* AS * | fields testStand | dedup testStand",
                "id": "search_filter_testStand"
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_filter_measureType = new PostProcessManager({
                "tokenDependencies": {
                },
                "managerid": "search_filter_options",
                "search": "search $tok_werk$ $tok_pruefumfang$ $tok_teststand$ | rename Achse.* AS * | fields measureType | dedup measureType",
                "id": "search_filter_measureType"
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_filter_einstellhaeufigkeit = new PostProcessManager({
                "tokenDependencies": {
                },
                "managerid": "search_filter_options",
                "search": "search $tok_werk$ $tok_pruefumfang$ $tok_teststand$ $tok_messungsart$ | rename Achse.* AS * | stats max(maxEinstellhaeufigkeit) As maxEinstellhaeufigkeit | eval Einstellhaeufigkeit=mvrange(1, maxEinstellhaeufigkeit+1, 1) | fields Einstellhaeufigkeit | mvexpand Einstellhaeufigkeit",
                "id": "search_filter_einstellhaeufigkeit"
            }, {tokens: true, tokenNamespace: "submitted"});

            var search_groupBy = new PostProcessManager({
                    "tokenDependencies": {
                    },
                    "managerid": "search_histogram",
                    "search": "table $tok_sub_groupBy$ $search_histogram_done$ | dedup $tok_sub_groupBy$",
                    "id": "search_groupBy"
                }, {tokens: true, tokenNamespace: "submitted"});
                
            search_groupBy.on("search:done", function() {
                console.log("search_groupBy : done");
            });
            
            var results_groupBy = search_groupBy.data("results", {count: 0});
            
            results_groupBy.on("data", function(){
                console.log("results_groupBy.on");
                var groupByArray = [];
                var groupByVal = input_groupBy.val();
                if (groupByVal != "" && results_groupBy.hasData()) {
                    //console.log(results_groupBy.data().rows);
                    _.each(results_groupBy.data().rows, function(row) {
                        groupByArray.push({"label": row[0], "value": groupByVal + "=\"" + row[0] + "\""});
                    });
                }
                
                setToken("groupByArray", groupByArray);
                
                updatePanel();
            });
            
            //
            // SPLUNK LAYOUT
            //

            $('header').remove();
            new LayoutView({"hideChrome": false, "hideAppBar": false, "hideSplunkBar": false, "hideFooter": false})
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
            }, {tokens: true}).render();


            //
            // VIEWS: VISUALIZATION ELEMENTS
            //


            //
            // VIEWS: FORM INPUTS
            //

            var input_dateTime = new TimeRangeInput({
                "id": "input_dateTime",
                "label": i18n._("Zeit"),
                "searchWhenChanged": true,
                "default": {"latest_time": "now", "earliest_time": "-30d@d"},
                "earliest_time": "$form.tok_dt.earliest$",
                "latest_time": "$form.tok_dt.latest$",
                "el": $('#input_dateTime')
            }, {tokens: true}).render();

            input_dateTime.on("change", function(newValue) {
                FormUtils.handleValueChange(input_dateTime);
            });
            
            var input_werk = new MultiSelectInput({
                "id": "input_werk",
                "label": i18n._("Werk"),
                "choices": [],
                "delimiter": " OR ",
                "labelField": "werk",
                "suffix": ")",
                "valuePrefix": "Achse.werk=\"",
                "valueField": "werk",
                "valueSuffix": "\"",
                "searchWhenChanged": true,
                "prefix": "(",
                "value": "$form.tok_werk$",
                "el": $('#input_werk')
            }, {tokens: true}).render();

            input_werk.on("change", function(newValue) {
                FormUtils.handleValueChange(input_werk);
            });
            
            var input_wheelalignmentCode = new MultiSelectInput({
                "id": "input_wheelalignmentCode",
                "label": i18n._("Spurcode"),
                "choices": [],
                "labelField": "spurcode",
                "suffix": ")",
                "valuePrefix": "Achse.wheelAlignmentCode=\"*",
                "valueField": "wheelAlignmentCode",
                "valueSuffix": "*\"",
                "searchWhenChanged": true,
                "delimiter": " OR ",
                "prefix": "(",
                "value": "$form.tok_wheelAlignmentCode$",
                "managerid": "search_filter_wheelAlignmentCode",
                "el": $('#input_wheelalignmentCode')
            }, {tokens: true}).render();

            input_wheelalignmentCode.on("change", function(newValue) {
                FormUtils.handleValueChange(input_wheelalignmentCode);
            });
            
            var input_fwe = new MultiSelectInput({
                "id": "input_fwe",
                "label": i18n._("Einstellung"),
                "choices": [],
                "labelField": "shortResultName",
                "suffix": ")",
                "valuePrefix": "Achse.resultName=\"",
                "valueField": "resultName",
                "valueSuffix": "\"",
                "searchWhenChanged": true,
                "delimiter": " OR ",
                "prefix": "(",
                "value": "$form.tok_fwe$",
                "managerid": "search_filter_resultName",
                "el": $('#input_fwe')
            }, {tokens: true}).render();

            input_fwe.on("change", function(newValue) {
                FormUtils.handleValueChange(input_fwe);
            });
            
            var input_pruefumfangName = new MultiSelectInput({
                "id": "input_pruefumfangName",
                "label": i18n._("Pruefumfang"),
                "choices": [
                    {"value": "*", "label": "Alle"}
                ],
                "default": "*",
                "labelField": "pruefumfangName",
                "suffix": ")",
                "valuePrefix": "Achse.pruefumfangName=\"",
                "valueField": "pruefumfangName",
                "valueSuffix": "\"",
                "searchWhenChanged": true,
                "delimiter": " OR ",
                "prefix": "(",
                "value": "$form.tok_pruefumfang$",
                "managerid": "search_filter_pruefumfangName",
                "el": $('#input_pruefumfangName')
            }, {tokens: true}).render();

            input_pruefumfangName.on("change", function(newValue) {
                FormUtils.handleValueChange(input_pruefumfangName);
            });
            
            var input_testStand = new MultiSelectInput({
                "id": "input_testStand",
                "label": i18n._("Pruefstand"),
                "choices": [
                    {"value": "*", "label": "Alle"}
                ],
                "default": "*",
                "labelField": "testStand",
                "suffix": ")",
                "valuePrefix": "Achse.testStand=\"",
                "valueField": "testStand",
                "valueSuffix": "\"",
                "searchWhenChanged": true,
                "delimiter": " OR ",
                "prefix": "(",
                "value": "$form.tok_teststand$",
                "managerid": "search_filter_testStand",
                "el": $('#input_testStand')
            }, {tokens: true}).render();

            input_testStand.on("change", function(newValue) {
                FormUtils.handleValueChange(input_testStand);
            });
            
            var input_measureType = new MultiSelectInput({
                "id": "input_measureType",
                "label": i18n._("Messungsart"),
                "choices": [
                    {"value": "*", "label": "Alle"}
                ],
                "default": "*",
                "labelField": "measureType",
                "suffix": ")",
                "valuePrefix": "Achse.measureType=\"",
                "valueField": "measureType",
                "valueSuffix": "\"",
                "searchWhenChanged": true,
                "delimiter": " OR ",
                "prefix": "(",
                "value": "$form.tok_messungsart$",
                "managerid": "search_filter_measureType",
                "el": $('#input_measureType')
            }, {tokens: true}).render();

            input_measureType.on("change", function(newValue) {
                FormUtils.handleValueChange(input_measureType);
            });
            
            var input_einstellhaeufigkeit = new MultiSelectInput({
                "id": "input_einstellhaeufigkeit",
                "label": i18n._("Einstellhaeufigkeit"),
                "choices": [
                    {"value": "*", "label": "Alle"}
                ],
                "default": "*",
                "labelField": "Einstellhaeufigkeit",
                "suffix": ")",
                "valuePrefix": "Einstellhaeufigkeit>=\"",
                "valueField": "Einstellhaeufigkeit",
                "valueSuffix": "\"",
                "searchWhenChanged": true,
                "delimiter": " OR ",
                "prefix": "(",
                "value": "$form.tok_einstellhaeufigkeit$",
                "managerid": "search_filter_einstellhaeufigkeit",
                "el": $('#input_einstellhaeufigkeit')
            }, {tokens: true}).render();

            input_einstellhaeufigkeit.on("change", function(newValue) {
                FormUtils.handleValueChange(input_einstellhaeufigkeit);
            });
            
            var input_toleranz = new DropdownInput({
                "id": "input_toleranz",
                "label": i18n._("Toleranz"),
                "choices": [
                    {"value": "minValueDbl AS minToleranz maxValueDbl AS maxToleranz", "label": "min/max"},
                    {"value": "adjustMinDbl AS minToleranz adjustMaxDbl AS maxToleranz", "label": "adjust"},
                    {"value": "evaluationMinValue AS minToleranz evaluationMaxValue AS maxToleranz", "label": "evaluation"}
                ],
                "selectFirstChoice": false,
                "searchWhenChanged": true,
                "default": "minValueDbl AS minToleranz maxValueDbl AS maxToleranz",
                "showClearButton": true,
                "value": "$form.tok_toleranz$",
                "el": $('#input_toleranz')
            }, {tokens: true}).render();

            input_toleranz.on("change", function(newValue) {
                FormUtils.handleValueChange(input_toleranz);
            });
            
            var input_groupBy = new DropdownInput({
                "id": "input_groupBy",
                "label": i18n._("Gruppieren"),
                "choices": [
                    {"value": "", "label": i18n._("Keine")},
                    {"value": "werk", "label": i18n._("Werk")},
                    {"value": "wheelAlignmentCode", "label": i18n._("Spurcode")},
                    {"value": "testStand", "label": i18n._("Teststand")}
                ],
                "selectFirstChoice": false,
                "searchWhenChanged": true,
                "default": "",
                "showClearButton": true,
                "value": "$form.tok_groupBy$",
                "el": $('#input_groupBy')
            }, {tokens: true}).render();

            input_groupBy.on("change", function(newValue) {
                unsetToken("search_histogram_done"); 
                
                FormUtils.handleValueChange(input_groupBy);
                
                if (newValue === "") {
                    setToken("tok_sub_groupBy", "shortVIN");
                } else {
                    setToken("tok_sub_groupBy", newValue);
                }
            });
            
            DashboardController.onReady(function() {
                if (!submittedTokenModel.has('earliest') && !submittedTokenModel.has('latest')) {
                    submittedTokenModel.set({ earliest: '0', latest: '' });
                }
            });

            // Initialize time tokens to default
            if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
                defaultTokenModel.set({ earliest: '0', latest: '' });
            }

            if (!_.isEmpty(urlTokenModel.toJSON())){
                submitTokens();
            }
            
            function updatePanel() {
                var container = document.getElementById("mainContainer");
                
                var values = input_fwe.val();
                var old_fwe_value = defaultTokenModel.get("curr_fwe_value");
                
                if (!(typeof old_fwe_value == "undefined")) {
                    _.each(values, function(value) {
                        var currChassisSet = value;
                        var headline = chassis_choices[currChassisSet][env_locale];
                        addChassisPanel(container, currChassisSet, headline);
                    });
                    
                    _.each(old_fwe_value, function(value) {
                        if (values.indexOf(value) === -1) {
                            var currChassisSet = value;
                            removeChassisPanel(currChassisSet);
                        }
                    });
                }
                
                setToken("curr_fwe_value", values);
            }
            
            function removeChassisPanel(currChassisSet) {
                console.log("removeChassisPanel: " + currChassisSet)
                var rowId = chassis_choices[currChassisSet]["id"].replace(" ", "_");
                var currDivName = "con_" + rowId;
                var groupByArray = defaultTokenModel.get("groupByArray");
                if (groupByArray.length === 0) {
                    ids = [
                        "search_histo_" + rowId,
                        "search_histoOV_" + rowId,
                        "search_sollIst" + rowId,
                        "search_sollIstOV" + rowId,
                        currDivName + "_histogram",
                        currDivName + "histogram_ov",
                        currDivName + "_sollIst",
                        currDivName + "_sollIst_ov"];
                    _.each(ids, function(id) {
                        obj = mvc.Components.getInstance(id);
                        if (!(typeof obj == "undefined")) {
                            mvc.Components.revokeInstance(id);
                        }
                    });
                } else {
                    _.each(groupByArray, function(groupByVal, i) {
                        currDivName = currDivName + "_" + groupByVal["label"] + "_";
                        var rowIdGb = rowIdGb + "_" + groupByVal["label"] + "_"
                        ids = [
                            "search_histo_" + rowId,
                            "search_histoOV_" + rowId,
                            "search_sollIst" + rowId,
                            "search_sollIstOV" + rowId,
                            currDivName + "_histogram",
                            currDivName + "histogram_ov",
                            currDivName + "_sollIst",
                            currDivName + "_sollIst_ov"];
                        _.each(ids, function(id) {
                            obj = mvc.Components.getInstance(id);
                            if (!(typeof obj == "undefined")) {
                                mvc.Components.revokeInstance(id);
                            }
                        });
                    });
                }
                
                $("#" + rowId).remove();
            }
            
            //
            function addChassisPanel(container, currChassisSet, headline) {
                console.log("addChassisPanel: " + currChassisSet)
                var rowId = chassis_choices[currChassisSet]["id"].replace(" ", "_");
                var obj = $("#" + rowId);
                if (obj.length > 0) {
                    obj.remove();
                }
                
                var panelh2 = document.createElement('h2');
                panelh2.className = "panel-title";
                panelh2.innerHTML = headline;
                
                var chassisDiv = document.createElement('div');
                chassisDiv.className = "dashboard-panel clearfix with-title";
                chassisDiv.setAttribute("style", "min-height: 0px;");
                chassisDiv.appendChild(panelh2);
                
                var subDiv = document.createElement('div');
                subDiv.className = "dashboard-cell last-visible splunk-view";
                subDiv.setAttribute("style", "width: 100%;");
                subDiv.appendChild(chassisDiv);
                
                
                var rowDiv = document.createElement('div');
                rowDiv.className = "dashboard-row splunk-view";
                rowDiv.id = rowId;
                rowDiv.appendChild(subDiv)
                
                ////console.log(i + ": " + currChassisSet);
                
                var currDivName = "con_" + rowId;
                var panelDiv = document.createElement('div');
                panelDiv.className = "panel-element-row";
                var groupByArray = defaultTokenModel.get("groupByArray");
                if (groupByArray.length === 0) {
                    var histogramDiv = addHistogram(currDivName, rowId, currChassisSet, null);
                    panelDiv.appendChild(histogramDiv);
                    
                    var sollIstDiv = addSollIst(currDivName, rowId, currChassisSet, null);
                    panelDiv.appendChild(sollIstDiv);
                } else {
                    _.each(groupByArray, function(groupByVal, i) {
                        var histogramDiv = addHistogram(currDivName + "_" + groupByVal["label"] + "_", rowId + "_" + groupByVal["label"] + "_", currChassisSet, groupByVal);
                        panelDiv.appendChild(histogramDiv);
                    });
                    
                    _.each(groupByArray, function(groupByVal, i) {
                        var sollIstDiv = addSollIst(currDivName + "_" + groupByVal["label"] + "_", rowId + "_" + groupByVal["label"] + "_", currChassisSet, groupByVal);
                        panelDiv.appendChild(sollIstDiv);
                    });
                }
                
                chassisDiv.appendChild(panelDiv);
                
                container.appendChild(rowDiv);
            }
            
            function addHistogram(currDivName, chassisId, currChassisSet, groupByVal) {
                var gbVal, gbLab;
                if (groupByVal === null) {
                    gbLab = "";
                    gbVal = "";
                } else {
                    gbLab = groupByVal["label"];
                    gbVal = groupByVal["value"];
                }
                
                var id = "search_histo_" + chassisId;
                obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined") {
                    new PostProcessManager({
                        "tokenDependencies": {
                        },
                        "managerid": "search_histogram",
                        "search": "search resultName=\"" + currChassisSet + "\" " + gbVal + " | table shortVIN resultName resultValueDbl UEG OEG Stdev Avg",
                        "id": id
                    }, {tokens: true, tokenNamespace: "submitted"});
                }
                
                id = "search_histoOV_" + chassisId;
                obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined") {
                    new PostProcessManager({
                        "tokenDependencies": {
                        },
                        "managerid": "search_histogram",
                        "search": "search resultName=\"" + currChassisSet + "\" " + gbVal + " \n" +
                        "| eval \n" +
                        "    XQuer=Avg, \n" +
                        "    Stabw=Stdev, \n" +
                        "    S=6*Stabw, \n" +
                        "    Range=OEG-UEG, \n" +
                        "    TNIO=under+over, \n" +
                        "    TIO=Anz-TNIO, \n" +
                        "    cp=if(Stabw!=0, round((OEG - UEG) / (6 * Stabw), 2), 0), \n" +
                        "    cpk=if(Stabw!=0, round(min((XQuer - UEG),(OEG - XQuer)) / (3 * Stabw), 2), 0), \n" +
                        "    FAu=under/Anz, \n" +
                        "    FAo=over/Anz, \n" +
                        "    FAg=TNIO/Anz \n" +
                        "| table resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg \n" +
                        "| dedup resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg \n" +
                        "| lookup lkup_ko_lagen resultName OUTPUT " + env_locale + " as resultName \n" +
                        "| rename resultName as Name TIO as \"Tol. IO\" TNIO as \"Tol. NIO\"",
                        "id": id,
                        "fields": 'resultName,XQuer,Stabw,S,Anz,Min,Max,Range,TIO,TNIO,UEG,OEG,cp,cpk,FAu,FAo'
                    }, {tokens: true, tokenNamespace: "submitted"});
                }
                
                var histogramDiv = document.createElement('div');
                histogramDiv.className = "histo_chart_table";
                histogramDiv.id = currDivName;
                
                var histogramChartDiv = document.createElement('div');
                histogramChartDiv.className = "dashboard-element chart";
                histogramChartDiv.id = currDivName + '_histogram_chart';
                histogramChartDiv.style = "width: 100%";
                histogramChartDiv.innerHTML = 
                    '        <div class="panel-head">' +
                    '            <h3>' + gbLab + '</h3>' +
                    '        </div>' +
                    '        <div class="panel-body"></div>' +
                    '        <div class="panel-footer"></div>';
                
                id = currDivName + "histogram";
                obj = mvc.Components.getInstance(id);
                if (!(typeof obj == "undefined")) {
                    mvc.Components.revokeInstance(id);
                }
                
                var histo_chart = new VisualizationElement({
                    "id": id,
                    "type": "viz_plotly_histogram_app.histogram",
                    "viz_plotly_histogram_app.histogram.xLable": i18n._("Minuten"),
                    "viz_plotly_histogram_app.histogram.colorGrenzen": "#FF0000",
                    "viz_plotly_histogram_app.histogram.colorHisto": "#73A550",
                    "viz_plotly_histogram_app.histogram.colorStdNv": "#FFDF00",
                    "height": "320",
                    "resizable": true,
                    "managerid": "search_histo_" + chassisId,
                    "el": histogramChartDiv
                }, {tokens: true, tokenNamespace: "submitted"}).render();
                
                histogramDiv.appendChild(histogramChartDiv);
        
                var histogramOvDiv = document.createElement('div');
                histogramOvDiv.className = "dashboard-element table";
                histogramOvDiv.id = currDivName + "_histogram_ov";
                histogramOvDiv.style = "width: 100%";
                histogramOvDiv.innerHTML = 
                    '        <div class="panel-head"></div>' +
                    '        <div class="panel-body"></div>' +
                    '        <div class="panel-footer"></div>';
                    
                id = currDivName + "histogram_ov";
                obj = mvc.Components.getInstance(id);
                if (!(typeof obj == "undefined")) {
                    mvc.Components.revokeInstance(id);
                }
                var histo_ov = new TableElement({
                    "id": id,
                    "count": "50",
                    "managerid": "search_histoOV_" + chassisId,
                    "el": histogramOvDiv,
                    "drilldown": "none"
                }, {tokens: true, tokenNamespace: "submitted"}).render();
                
                histogramDiv.appendChild(histogramOvDiv);
                
                return histogramDiv;
            }
            
            function addSollIst(currDivName, chassisId, currChassisSet, groupByVal) {
                var gbVal, gbLab;
                if (groupByVal === null) {
                    gbLab = "";
                    gbVal = "";
                } else {
                    gbLab = groupByVal["label"];
                    gbVal = groupByVal["value"];
                }
                id = "search_sollIst" + chassisId
                obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined") {
                    var search_sollIstChart = new PostProcessManager({
                        "tokenDependencies": {
                        },
                        "managerid": "search_sollIst",
                        "search": "search resultName=\"" + currChassisSet + "\" " + gbVal + " | stats latest(resultValueDbl) AS \"" + i18n._("Soll-Ist-Differenz") + "\" by shortVIN UEG OEG",
                        "id": id
                    }, {tokens: true, tokenNamespace: "submitted"});
                }
                
                id = "search_sollIstOV" + chassisId
                obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined") {
                    var search_sollIstOV = new PostProcessManager({
                        "tokenDependencies": {
                        },
                        "managerid": "search_sollIst",
                        "search": "search resultName=\"" + currChassisSet + "*\" " + gbVal + 
                        "| eval \n" +
                        "    XQuer=Avg, \n" +
                        "    Stabw=Stdev, \n" +
                        "    S=6*Stabw, \n" +
                        "    Range=OEG-UEG, \n" +
                        "    TNIO=under+over, \n" +
                        "    TIO=Anz-TNIO, \n" +
                        "    cp=if(Stabw!=0, round((OEG - UEG) / (6 * Stabw), 2), 0), \n" +
                        "    cpk=if(Stabw!=0, round(min((XQuer - UEG),(OEG - XQuer)) / (3 * Stabw), 2), 0), \n" +
                        "    FAu=under/Anz, \n" +
                        "    FAo=over/Anz, \n" +
                        "    FAg=TNIO/Anz \n" +
                        "| table resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg \n" +
                        "| dedup resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg \n" +
                        "| lookup lkup_ko_lagen resultName OUTPUT " + env_locale + " as resultName \n" +
                        "| rename resultName as Name TIO as \"Tol. IO\" TNIO as \"Tol. NIO\"",
                        "id": id
                    }, {tokens: true, tokenNamespace: "submitted"});
                }
                    
                var sollIstDiv = document.createElement('div');
                sollIstDiv.className = "sollIst_chart_table";
                sollIstDiv.id = currDivName + "_sollIst_main";
                
                var sollIstChartDiv = document.createElement('div');
                sollIstChartDiv.className = "dashboard-element chart";
                sollIstChartDiv.id = currDivName + '_sollIst_chart';
                sollIstChartDiv.style = "width: 100%";
                sollIstChartDiv.innerHTML = 
                    '        <div class="panel-head">' +
                    '            <h3>' + gbLab + '</h3>' +
                    '        </div>' +
                    '        <div class="panel-body"></div>' +
                    '        <div class="panel-footer"></div>';
                
                id = currDivName + "_sollIst";
                obj = mvc.Components.getInstance(id);
                if (!(typeof obj == "undefined")) {
                    mvc.Components.revokeInstance(id);
                }
                new ChartElement({
                    "id": id,
                    "height" : 300,
                    "charting.chart": "line",
                    "charting.chart.showMarkers": true,
                    "charting.chart.markerSize" : 3,
                    "charting.chart.lineStyle.alpha" : 0,
                    "charting.axisLabelsY.majorUnit" : 5,
                    "charting.drilldown" : "none",
                    "charting.fieldColors": "{\"OEG\":0xFF0000, \"UEG\":0xFF0000, \"" + i18n._("Soll-Ist-Differenz") + "\":0x73A550}",
                    "charting.axisLabelsX.majorLabelStyle.rotation" : "90",
                    "charting.axisTitleX.text": i18n._("FGNR"),
                    "charting.legend.placement" : "bottom",
                    "resizable": true,
                    "managerid": "search_sollIst" + chassisId,
                    "el": sollIstChartDiv
                }, {tokens: true, tokenNamespace: "submitted"}).render();
                
                sollIstDiv.appendChild(sollIstChartDiv);
                
                var sollIstOvDiv = document.createElement('div');
                sollIstOvDiv.className = "dashboard-element table";
                sollIstOvDiv.id = currDivName + "_sollIst_table";
                sollIstOvDiv.style = "width: 100%";
                sollIstOvDiv.innerHTML = 
                    '        <div class="panel-head"></div>' +
                    '        <div class="panel-body"></div>' +
                    '        <div class="panel-footer"></div>';
                
                id = currDivName + "_sollIst_ov";
                obj = mvc.Components.getInstance(id);
                if (!(typeof obj == "undefined")) {
                    mvc.Components.revokeInstance(id);
                }
                new TableElement({
                    "id": id,
                    "count": "50",
                    "managerid": "search_sollIstOV" + chassisId,
                    "el": sollIstOvDiv,
                    "drilldown": "none"
                }, {tokens: true, tokenNamespace: "submitted"}).render();
                
                sollIstDiv.appendChild(sollIstOvDiv);
                
                return sollIstDiv;
            }
                
            // erstelle Drucken-Button
            html2pdf.addPrintButton();
            
            excelExportFnc.add_excel_export_button(
                "| tstats   \n" +
                "    first(Achse.evaluationMaxValue) AS Achse.evaluationMaxValue \n" +
                "    first(Achse.evaluationMinValue) AS Achse.evaluationMinValue \n" +
                "    first(Achse.adjustMaxDbl) AS Achse.adjustMaxDbl \n" +
                "    first(Achse.adjustMinDbl) AS Achse.adjustMinDbl \n" +
                "    first(Achse.maxValueDbl) AS Achse.maxValueDbl \n" +
                "    first(Achse.minValueDbl) AS Achse.minValueDbl \n" +
                "    first(Achse.desiredValueDbl) AS Achse.desiredValueDbl \n" +
                "  from datamodel=APDM_FWS.Achse  \n" +
                "  where (nodename=Achse) $tok_werk$ $tok_fwe$ $tok_pruefumfang$ $tok_teststand$ $tok_messungsart$ $tok_wheelAlignmentCode$ \n" +
                "  groupby _time source Achse.shortVIN Achse.werk Achse.wheelAlignmentCode Achse.resultName Achse.measureType Achse.pruefumfangName Achse.testStand Achse.resultValueDbl \n" +
                "| rename \n" +
                "  Achse.* AS * ", 'tok_dt.latest', 'tok_dt.earliest' 
            );
        
            // erstelleWerkfilter
            erstelleWerkfilter( "input_werk" );
        });
        
        //
        // DASHBOARD READY
        //

        DashboardController.ready();
        pageLoading = false;

    }
);