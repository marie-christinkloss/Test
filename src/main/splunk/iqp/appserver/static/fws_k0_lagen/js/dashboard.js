//# sourceURL=fws_k0_lagen/js/dashboard.js

require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    'splunkjs/mvc/tableview',
    "underscore",
    "jquery",
    "splunk.i18n",
    "moment",
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
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/simplexml/urltokenmodel",
    "../app/iqp/splunkUtils",
    "../app/iqp/fws_k0_lagen/js/constants",
    "../app/iqp/fws_k0_lagen/js/search",
    "../app/iqp/fws_k0_lagen/js/inputs",
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
        TableView,
        _,
        $,
        i18n,
        moment,
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
        TextInput,
        SearchManager,
        PostProcessManager,
        UrlTokenModel,
        splunkUtils,
        constants,
        search,
        inputs,
        html2pdf,
        excelExportFnc,
        erstelleWerkfilter

        // Add comma-separated parameter names here, for example: 
        // ...UrlTokenModel, 
        // TokenForwarder
        ) {

        var pageLoading = true;
        
        //i18n - Translation
        var foundVeh = i18n._("Gefundene Fahrzeuge: ");
        
        $('#summary').html(foundVeh + "-");
        $('#histoHeader').html(i18n._("Histogramm"));
        $('#siHeader').html(i18n._("Soll-Ist-Vergleich"));
        $('#ccHeader').html(i18n._("CP-CPK-Faktor"));
        $('#vdHeader').html(i18n._("Fahrzeugdaten"));
        $('#resetFgnr').html(i18n._("Filter FGNR zuruecksetzen"));
        
        var wFac = i18n._("Warnfaktor");
        var eFac = i18n._("Eingriffsfaktor");
        var idxVal = i18n._("Indexwert");
        var isVal = i18n._("Istwert");

        
        $('#wFac_idxVal').html(wFac + " (" + idxVal + ")");
        $('#eFac_idxVal').html(eFac + " (" + idxVal + ")");
        $('#wFac_isVal').html(wFac + " (" + isVal + ")");
        $('#eFac_isVal').html(eFac + " (" + isVal + ")");
        
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
        
        var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
            canRender: function(cell) {
                return cell.field.match(/^.* (ist|is)_RAMA$/) || cell.index==0;
            },
            
            render: function($td, cell) {
                // Apply interpretation for number of historical searches
                if (cell.field.match(/^.* (ist|is)_RAMA$/) && cell.value != null) {
                    spValue = cell.value.split("#")
                    if (spValue.length == 2) {
                        $td.html(spValue[0]);
                        $td.addClass('chassis_set_' + spValue[1]);
                    }
                }
                
                if (cell.index==0) {
                    $td.html(cell.value);
                    $td.css({
                        'position': 'relative',
                        'z-index': 10,
                        'left': '0px'
                    });
                    
                    $('#data_comp_table div.results-table').scroll(function() {
                        var pos = $('#data_comp_table div.results-table').scrollLeft();
                        $('#data_comp_table div.results-table thead > tr > th[data-sort-key="' + i18n._("FGNR") + '"]').css({
                            'position': 'relative',
                            'z-index': 12,
                            'left': pos
                        });
                        $td.css({
                            'left': pos
                        });
                    });
                }
            }
        });
        
        
        var ICONS = {
            ja: 'check-circle',
            nein: 'x-circle'
        };
        var CustomIconCellRenderer = TableView.BaseCellRenderer.extend({ 
            canRender: function(cellData) {
                return cellData.field === i18n._("StdNV");
            },
            
            render: function($td, cellData) {
                var icon = '';
                var value = '';
                var label = '';
                if(ICONS.hasOwnProperty(cellData.value)) {
                    icon = ICONS[cellData.value];
                    value = cellData.value;
                    lable = i18n._(value);
                }
                $td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%- range %>" title="<%- val %>"></i> <%- val %>', {
                    icon: icon,
                    range: value,
                    val: lable
                }));
            }
        });
        
        var win = $(window);
        
        constants.createChassisChoices(win);
        
        win.on('chassisChoicesCreated', function (e) {
            defaultTokenModel.set("dd_filt_shortVIN", "");
            defaultTokenModel.set("search_filt_shortVIN_input", "");
            defaultTokenModel.set("tstats_filt_shortVIN_input", "");
            
            // SEARCH MANAGERS
            //
            
            //Filter searches
            var search_filter_options = search.getSearchFilterOptions();
            var search_filter_options_Linie = search.getSearchFilterOptionsLinie();
            
            var searchSpurCode = search.getSearchSpurCode();
            
            var searchChassisSet = search.getSearchChassisSet();
            
            var searchPruefStandR = search.getSearchPruefStandRama();
            var searchPruefStandL = search.getSearchPruefStandLinie();
            
            var searchPruefUmfangR = search.getSearchPruefUmfangRama();
            var searchPruefUmfangL = search.getSearchPruefUmfangLinie();
            
            var searchMeasureType = search.getSearchMeasureType();
            
            var searchRefCarIdent = search.getSearchRefCarIdent();
            
            var searchShortVIN = search.getSearchShortVIN();
            
            //Base for sub_search_base and Soll-Ist-Vergleich
            var search_base = search.getSearchBase();
            
            //Search distinct shortVINs
            var search_shortVins = search.getSearchShortVins();
            
            search_shortVins.on('search:done', function(properties) {
                //Set count of founded vehicles
                $('#summary').html(foundVeh + properties.content.resultCount);
            });
            
            //Summary
            var search_summary = search.getSearchSummary();
            
            //Histogramm
            var search_base_histogram = search.getSearchBaseHistogram();
            
            var search_histogram_overview = search.getSearchHistogramOverview();
            
            //Soll-Ist-Vergleich
            var search_base_soll_ist = search.getSearchBaseSollIst();
            
            var search_soll_ist_overview = search.getSearchSollIstOverview();
            
            //CP and CPK-Factor
            var search_base_cp_cpk = search.getSearchBaseCpCpk();
            
            //DataCompressor
            var search_data_comp = search.getSearchDataCompressor();
            
            //DataCompressor filtered
            var search_data_comp_filt = search.getSearchDataCompressorFiltered();
            var search_data_comp_print = search.getSearchDataCompressorPrint();
            
            search_data_comp_filt.on('search:done', function(){
                mvc.Components.get("data_comp_table").visualization.table.addCellRenderer(new CustomRangeRenderer());
            });
            
            //
            // SPLUNK LAYOUT
            //

            $('header').remove();
            new LayoutView({"hideAppBar": false, "hideSplunkBar": false, "hideChrome": false, "hideFooter": false})
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

            // DataCompressor Table
            var data_comp_table = new TableElement({
                "id": "data_comp_table",
                "count": "20",
                "managerid": "search_data_comp_filt",
                "drilldown": "none",
                "el": $('#data_comp_table')
            }, {
                tokens: true, 
                tokenNamespace: "submitted"
            }).render();
            
            // Summary Table
            var summary_table = new TableElement({
                "id": "summary_table",
                "count": "50",
                "managerid": "search_summary",
                "drilldown": "none",
                "el": $('#summary_table')
            }, {
                tokens: true, 
                tokenNamespace: "submitted"
            }).render();
            
            search_summary.on('search:done', function(){
                summary_table.visualization.table.addCellRenderer(new CustomIconCellRenderer());
            });
            
            //console.log("BEGIN: Update Data");
            var container_histogram = document.getElementById("container_histogram_chart");
            var container_soll_ist = document.getElementById("container_soll_ist_chart");
            var container_cp_cpk = document.getElementById("container_cp_cpk");
            for (iter = 1; iter < constants.chassis_choices.length; iter++) { 
                var currChassisSet = constants.chassis_choices[iter][env_locale];
                var i = constants.chassis_choices[iter]["value"];
                cal_viz_histogram(container_histogram, i, currChassisSet + constants.veSuffix[env_locale] + " " + constants.ramaSuffix[env_locale], currChassisSet + constants.istSuffix[env_locale]);
                cal_viz_soll_ist(container_soll_ist, i, currChassisSet , currChassisSet + constants.istSollSuffix[env_locale]);
                cal_viz_cp_cpk(container_cp_cpk, i, currChassisSet + constants.veSuffix[env_locale] + " " + constants.ramaSuffix[env_locale]);
            }
            
            //console.log("END: Update Data");
            
            function cal_viz_histogram(container, i, currChassisSet, headline) {
                //console.log(i + ": " + currChassisSet);
                var id = "search_histogram_" + i;
                var obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined") {
                    var histo_search = search.getSearchHistogramChart(id, i, currChassisSet);
                    
                    var histo_search_ov = new PostProcessManager({
                        "search": '\n' +
                            'search Name="' + currChassisSet + '"\n' +
                            '| fields - Name',
                        "managerid": "search_histogram_overview",
                        "id": "search_histogram_ov_" + i
                    }, {
                        tokens: true,
                        tokenNamespace: "submitted"
                    });
                }
                
                var currDivName = constants.histogram_chart_div + i;
                obj = mvc.Components.getInstance(currDivName);
                if (typeof obj == "undefined") {
                    var histogramDiv = document.createElement('div');
                    histogramDiv.className = "histo_chart_table";
                    histogramDiv.id = currDivName;
                    
                    var histogramChartDiv = document.createElement('div');
                    histogramChartDiv.className = "dashboard-element chart";
                    histogramChartDiv.id = currDivName + '_chart';
                    histogramChartDiv.style = "width: 100%";
                    histogramChartDiv.innerHTML = 
                        '        <div class="panel-head">' +
                        '            <h3>' + headline + '</h3>' +
                        '        </div>' +
                        '        <div class="panel-body"></div>' +
                        '        <div class="panel-footer"></div>';
                    
                    var histo_chart = new VisualizationElement({
                        "id": currDivName,
                        "type": "viz_plotly_histogram_app.histogram",
                        "height": 300,
                        "viz_plotly_histogram_app.histogram.xLable": i18n._("Minuten"),
                        "viz_plotly_histogram_app.histogram.HistogrammLbl": i18n._("Anzahl"),
                        "viz_plotly_histogram_app.histogram.StdNVLbl": i18n._("StdNV"),
                        "viz_plotly_histogram_app.histogram.UEGLbl": i18n._("UEG"),
                        "viz_plotly_histogram_app.histogram.OEGLbl": i18n._("OEG"),
                        "viz_plotly_histogram_app.histogram.drillDownField": "shortVIN",
                        "viz_plotly_histogram_app.histogram.colorGrenzen": "#FF0000",
                        "viz_plotly_histogram_app.histogram.colorHisto": "#73A550",
                        "viz_plotly_histogram_app.histogram.colorStdNv": "#FFDF00",
                        "resizable": true,
                        "managerid": id,
                        "el": histogramChartDiv
                    }, {tokens: true, tokenNamespace: "submitted"}).render();
                    
                    histo_chart.on("click", function(e) {
                        e.preventDefault();
                        //console.log(e);
                        setToken("dd_filt_shortVIN", TokenUtils.replaceTokenNames("$row.dd_filt_shortVIN$", _.extend(submittedTokenModel.toJSON(), e.data)))
                    });
                    
                    histogramDiv.appendChild(histogramChartDiv);
            
                    var histogramOvDiv = document.createElement('div');
                    histogramOvDiv.className = "dashboard-element table";
                    histogramOvDiv.id = currDivName + "_ov";
                    histogramOvDiv.style = "width: 100%";
                    histogramOvDiv.innerHTML = 
                        '        <div class="panel-head"></div>' +
                        '        <div class="panel-body"></div>' +
                        '        <div class="panel-footer"></div>';
                    
                    var histo_ov = new TableElement({
                        "id": currDivName + "_ov",
                        "count": "50",
                        "managerid": "search_histogram_ov_" + i,
                        "el": histogramOvDiv,
                        "drilldown": "none"
                    }, {tokens: true, tokenNamespace: "submitted"}).render();
                    
                    histogramDiv.appendChild(histogramOvDiv);
                    
                    panelDiv = document.createElement('div');
                    panelDiv.appendChild(histogramDiv);
                    panelDiv.className = "panel-element-row";
                    container.appendChild(panelDiv);
                }
            }
            
            function cal_viz_soll_ist(container, i, currChassisSet, headline) {
                //console.log(i + ": " + currChassisSet);
                var id = "search_soll_ist_" + i;
                var obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined") {
                    search.getSearchSollIstChart(id, i, currChassisSet);
                    
                    new PostProcessManager({
                        "search": '\n' +
                            ' search ' + i18n._("Name") + '="' + currChassisSet + '*"',
                        "managerid": "search_soll_ist_overview",
                        "id": "search_soll_ist_ov_" + i
                    }, {
                        tokens: true,
                        tokenNamespace: "submitted"
                    });
                } 
                
                var currDivName = constants.soll_ist_chart_div + i;
                obj = mvc.Components.getInstance(currDivName);
                if (typeof obj == "undefined") {
                    var sollIstDiv = document.createElement('div');
                    sollIstDiv.className = "sollIst_chart_table";
                    sollIstDiv.id = currDivName;
                    
                    var sollIstChartDiv = document.createElement('div');
                    sollIstChartDiv.className = "dashboard-element chart";
                    sollIstChartDiv.id = currDivName + '_chart';
                    sollIstChartDiv.style = "width: 100%";
                    sollIstChartDiv.innerHTML = 
                        '        <div class="panel-head">' +
                        '            <h3>' + headline + '</h3>' +
                        '        </div>' +
                        '        <div class="panel-body"></div>' +
                        '        <div class="panel-footer"></div>';
                    
                    new ChartElement({
                        "id": currDivName,
                        "height" : 300,
                        "charting.chart": "line",
                        "charting.chart.showMarkers": true,
                        "charting.chart.markerSize" : 3,
                        "charting.chart.lineStyle.alpha" : 0,
                        "charting.axisLabelsY.majorUnit" : 5,
                        "charting.drilldown" : "none",
                        "charting.fieldColors": "{\"Maximum\":0xe80015, \"Minimum\":0xe80015, \"" + constants.ramaSuffix[env_locale] + "\":0x73A550, \"" + constants.linieSuffix[env_locale] + "\":0x0099FF}",
                        "charting.axisLabelsX.majorLabelStyle.rotation" : "90",
                        "charting.axisTitleX.text": i18n._("FGNR"),
                        "charting.legend.placement" : "bottom",
                        "resizable": true,
                        "managerid": id,
                        "el": sollIstChartDiv
                    }, {tokens: true, tokenNamespace: "submitted"}).render();
                    
                    sollIstDiv.appendChild(sollIstChartDiv);
            
                    var sollIstOvDiv = document.createElement('div');
                    sollIstOvDiv.className = "dashboard-element table";
                    sollIstOvDiv.id = currDivName + "_ov";
                    sollIstOvDiv.style = "width: 100%";
                    sollIstOvDiv.innerHTML = 
                        '        <div class="panel-head"></div>' +
                        '        <div class="panel-body"></div>' +
                        '        <div class="panel-footer"></div>';
                    
                    new TableElement({
                        "id": currDivName + "ov",
                        "count": "50",
                        "managerid": "search_soll_ist_ov_" + i,
                        "el": sollIstOvDiv,
                        "drilldown": "none"
                    }, {tokens: true, tokenNamespace: "submitted"}).render();
                    
                    sollIstDiv.appendChild(sollIstOvDiv);
                    
                    panelDiv = document.createElement('div');
                    panelDiv.className = "panel-element-row";
                    panelDiv.appendChild(sollIstDiv);
                    container.appendChild(panelDiv);
                }
            }
            
            function cal_viz_cp_cpk(container, i, currChassisSet) {
                //console.log(i + ": " + currChassisSet);
                var id = "search_cp_cpk_" + i
                var obj = mvc.Components.getInstance(id);
                if (typeof obj == "undefined" ) {
                    search.getSearchCpCpkChart(id, i, currChassisSet)
                    
                    var search_cp = new PostProcessManager({
                        "search": "| fields _time cp5 cp10 cp20 Warnung Eingriff",
                        "managerid": id,
                        "id": "search_cp_" + i
                    }, {
                        tokens: true,
                        tokenNamespace: "submitted"
                    });
                
                    var search_cpk = new PostProcessManager({
                        "search": "| fields _time cpk5 cpk10 cpk20 Warnung Eingriff",
                        "managerid": id,
                        "id": "search_cpk_" + i
                    }, {
                        tokens: true,
                        tokenNamespace: "submitted"
                    });
                }
                
                var cpDivName = constants.cp_chart_div + i;
                var cpkDivName = constants.cpk_chart_div + i;
                var objCP = mvc.Components.getInstance(cpDivName);
                var objCPK = mvc.Components.getInstance(cpkDivName);
                if (typeof objCP == "undefined" || typeof objCPK == "undefined") {
                    
                    var panelDiv = document.createElement('div');
                    panelDiv.className = "panel-element-row";
                    
                    if (typeof objCP == "undefined") {
                        var cpChartDiv = document.createElement('div');
                        cpChartDiv.className = "dashboard-element chart";
                        cpChartDiv.id = cpDivName;
                        cpChartDiv.innerHTML = 
                            '        <div class="panel-head">' +
                            '            <h3>CP "' + currChassisSet + '"</h3>' +
                            '        </div>' +
                            '        <div class="panel-body"></div>' +
                            '        <div class="panel-footer"></div>';
                        
                        new VisualizationElement({
                            "id": cpDivName,
                            "type": "viz_cp_cpk_app.cp_cpk",
                            "resizable": true,
                            "managerid": "search_cp_" + i,
                            "el": cpChartDiv
                        }, {tokens: true, tokenNamespace: "submitted"}).render();
                        
                        panelDiv.appendChild(cpChartDiv);
                    }
                    
                    if (typeof objCPK == "undefined") {
                        var cpkChartDiv = document.createElement('div');
                        cpkChartDiv.className = "dashboard-element chart";
                        cpkChartDiv.id = cpkDivName;
                        cpkChartDiv.innerHTML = 
                            '        <div class="panel-head">' +
                            '            <h3>CPK "' + currChassisSet + '"</h3>' +
                            '        </div>' +
                            '        <div class="panel-body"></div>' +
                            '        <div class="panel-footer"></div>';
                        
                        new VisualizationElement({
                            "id": cpkDivName,
                            "type": "viz_cp_cpk_app.cp_cpk",
                            "resizable": true,
                            "managerid": "search_cpk_" + i,
                            "el": cpkChartDiv
                        }, {tokens: true, tokenNamespace: "submitted"}).render();
                        
                        panelDiv.appendChild(cpkChartDiv);
                    }
                    container.appendChild(panelDiv);
                }
            }

            //
            // VIEWS: FORM INPUTS
            //

            var filt_time = inputs.getFilterTime(defaultTokenModel);
            
            var filt_werk = inputs.getFilterWerk(defaultTokenModel);
            
            var filt_chassis_property = inputs.getFilterChassis(defaultTokenModel);
            
            var filt_spurcode = inputs.getFilterSpurCode(defaultTokenModel);
            
            var filt_pruefstand_rama = inputs.getFilterPruefstandRama(defaultTokenModel);
            
            var filt_pruefstand_linie = inputs.getFilterPruefstandLinie(defaultTokenModel);
            
            var filt_pruefumfang_rama = inputs.getFilterPruefumfangRama(defaultTokenModel);
            
            var filt_pruefumfang_linie = inputs.getFilterPruefumfangLinie(defaultTokenModel);
            
            var filt_messungsart_rama = inputs.getFilterMessungsartRama(defaultTokenModel);
            
            var filt_messungsart_linie = inputs.getFilterMessungsartLinie(defaultTokenModel);
            
            var filt_ref_car = inputs.getFilterReferenceCar(defaultTokenModel);
            
            var submit = inputs.getSubmitButton();
            
            var filt_warn_fkt_ist = inputs.getFiterWarnungFaktorIst(defaultTokenModel);
            
            var filt_eing_fkt_ist = inputs.getFiterEingriffFaktorIst(defaultTokenModel);
            
            var submit_ist = inputs.getIstSubmitButton(submittedTokenModel);
            
            var filt_warn_fkt_idx = inputs.getFiterWarnungFaktorIdx(defaultTokenModel);
            
            var filt_eing_fkt_idx = inputs.getFiterEingriffFaktorIdx(defaultTokenModel);
            
            var submit_idx = inputs.getIdxSubmitButton(submittedTokenModel);
            
            var filt_master = inputs.getFilterMaster(defaultTokenModel);

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

            $("#input_shortVIN").on('input', function(input) {
                var shortVinArr = $("#input_shortVIN").val().match(/\S+/g);
                if (shortVinArr) {
                    setShortVinTokens(shortVinArr, "shortVIN_input");
                }
            });
            
            var res_filt_shortVIN = searchShortVIN.data("results", {count:0});
            res_filt_shortVIN.on( "data", function() {
                var shortVinArr = res_filt_shortVIN.data().rows;
                if (shortVinArr) {
                    setShortVinTokens(shortVinArr, "shortVIN");
                }
            } );
            
            function setShortVinTokens(shortVinArr, key) {
                var sTokenName = "search_filt_" + key;
                var sTokenValue = "";
                var tTokenName = "tstats_filt_" + key;
                var tTokenValue = "";
                var tOrderTokenName = "tstats_order_filt_" + key;
                var tOrderTokenValue = "";
                var delimiter = " OR ";
                for (iter = 0; iter < shortVinArr.length; iter++) {
                    sTokenValue += "shortVIN=" + shortVinArr[iter];
                    tTokenValue += "Achse.shortVIN=" + shortVinArr[iter];
                    tOrderTokenValue += "OrderData.shortVIN=" + shortVinArr[iter];
                    if (iter < shortVinArr.length - 1) {
                        sTokenValue += delimiter;
                        tTokenValue += delimiter;
                        tOrderTokenValue += delimiter;
                    } 
                }
                setToken(sTokenName, sTokenValue);
                setToken(tTokenName, tTokenValue);
                setToken(tOrderTokenName, tOrderTokenValue);
            }
            
            $("#reset_button").on("click", function() {
                setToken("dd_filt_shortVIN", "");
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

            splunkUtils.excelExportPostProcess("data_comp_table", "search_data_comp", ["search_data_comp_filt", "search_data_comp_print"], submittedTokenModel);
            
            function setHistogramVis() {
                if($("#panel_histogramm #hide_button span").hasClass("icon-chevron-up")) {
                    $("#panel_histogramm").removeClass("noPrint");
                    setToken("is_histogram_visible", "");
                } else {
                    $("#panel_histogramm").addClass("noPrint");
                    unsetToken("is_histogram_visible");
                }
            }
            function setSollIstVis() {
                if($("#panel_soll_ist #hide_button span").hasClass("icon-chevron-up")) {
                    $("#panel_soll_ist").removeClass("noPrint");
                    setToken("is_soll_ist_visible", "");
                } else {
                    $("#panel_soll_ist").addClass("noPrint");
                    unsetToken("is_soll_ist_visible");
                }
            }
            function setCpCpkVis() {
                if($("#panel_cp_cpk #hide_button span").hasClass("icon-chevron-up")) {
                    $("#panel_cp_cpk").removeClass("noPrint");
                    setToken("is_cp_cpk_visible", "");
                } else {
                    $("#panel_cp_cpk").addClass("noPrint");
                    unsetToken("is_cp_cpk_visible");
                }
            }
            function setDataCompVis() {
                if($("#panel_filt #hide_button span").hasClass("icon-chevron-up")) {
                    setToken("is_data_comp_visible", "");
                } else {
                    unsetToken("is_data_comp_visible");
                }
            }
            
            // Add slide toggle buttons 
            splunkUtils.setSlideTogglePanel("panel_histogramm", setHistogramVis);
            splunkUtils.setSlideTogglePanel("panel_soll_ist", setSollIstVis);
            splunkUtils.setSlideTogglePanel("panel_cp_cpk", setCpCpkVis);
            splunkUtils.setSlideTogglePanel("panel_filt", setDataCompVis);
            $("#panel_histogramm").addClass("noPrint");
            $("#panel_soll_ist").addClass("noPrint");
            $("#panel_cp_cpk").addClass("noPrint");
            $("#panel_filt").addClass("noPrint");
            $("#hide_button").addClass("noPrint");

            
            // Add scroll event handler
            $(window).scroll(function() {
                var table = $('#data_comp_table div.results-table');
                var posTop = $(window).scrollTop();
                if (typeof table.offset() !== 'undefined'){
                    var posTable = table.offset().top;
                    if (posTop > posTable && posTop < posTable + table.height()) {
                        $('#data_comp_table div.results-table thead > tr > th').css({
                            'position': 'relative',
                            'z-index': 11,
                            'top': posTop - posTable
                        });
                        $('#data_comp_table div.results-table thead > tr > th[data-sort-key="' + i18n._("FGNR") + '"]').css({
                            'z-index': 12
                        });
                    } else {
                        $('#data_comp_table div.results-table thead > tr > th').css({
                            'position': 'static',
                            'top': 0
                        });
                        $('#data_comp_table div.results-table thead > tr > th[data-sort-key="' + i18n._("FGNR") + '"]').css({
                            'position': 'relative'
                        });
                    }
                }
            });
            
            // erstelle Drucken-Button
            html2pdf.addPrintButton();
            
            excelExportFnc.add_excel_export_button(
                '| tstats \n' +
                '    count\n' +
                '  from datamodel=APDM_FWS.Achse \n' +
                '  where (nodename = Achse) ($tstats_filt_chassis_property$ OR $tstats_filt_chassis_property_linie$) ($tstats_filt_shortVIN$) \n' +
                '  groupby source Achse.shortVIN _time Achse.resultName Achse.resultValueDbl Achse.desiredValueDbl ' +
                'Achse.maxValueDbl Achse.minValueDbl Achse.testStand Achse.wheelAlignmentCode Achse.optParam2 ' +
                'Achse.measureType Achse.pruefumfangName Achse.series Achse.typeKey\n' +
                '  span=1s summariesonly=true\n' +
                '| rename\n' +
                '  Achse.shortVIN as shortVIN\n' +
                '  Achse.resultName as resultName\n' +
                '  Achse.testStand as testStand\n' +
                '  Achse.resultValueDbl as resultValueDbl\n' +
                '  Achse.desiredValueDbl as desiredValueDbl\n' +
                '  Achse.maxValueDbl as maxValueDbl\n' +
                '  Achse.minValueDbl as minValueDbl\n' +
                '  Achse.wheelAlignmentCode as wheelAlignmentCode\n' +
                '  Achse.optParam2 as optParam2\n' +
                '  Achse.measureType as measureType\n' +
                '  Achse.series as series\n' +
                '  Achse.typeKey as typeKey\n' +
                '  Achse.pruefumfangName as pruefumfangName \n' +
                '| eval desiredValueDbl=round(desiredValueDbl, 2)\n' +
                '| fields - count\n' +
                // get all reference cars
                '| join type=outer source \n' +
                '[ \n' +
                '  | tstats \n' +
                '      count AS IS_REF\n' +
                '    from datamodel=APDM_FWS.Achse \n' +
                '    where (nodename = Achse.ReferenceCar) ($tstats_filt_ref_car$) ($tstats_filt_pruefstand_rama$) ($tstats_filt_pruefumfang_rama$)\n' +
                '    groupby source summariesonly=true\n' +
                '] \n' +
                '| eval IS_REF=if(isNotNull(IS_REF), 1, 0)', 'tok_datetime.latest', 'tok_datetime.earliest' 
            );
            
            // erstelleWerkfilter
            erstelleWerkfilter( "filt_werk" );
            
            
            //
            // DASHBOARD READY
            //

            DashboardController.ready();
            pageLoading = false;

        });
        
    }
);
// ]]>