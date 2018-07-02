//# sourceURL=fws_k0_lagen/js/search.js

define([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "underscore",
    "jquery",
    "splunk.i18n",
    "splunkjs/mvc/simplexml/eventhandler",
    "splunkjs/mvc/simplexml/searcheventhandler",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/postprocessmanager",
    "./constants"
    
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/tokenforwarder"
    ],
    function(
        mvc,
        utils,
        _,
        $,
        i18n,
        EventHandler,
        SearchEventHandler,
        SearchManager,
        SavedSearchManager,
        PostProcessManager,
        constants

        // Add comma-separated parameter names here, for example: 
        // ...UrlTokenModel, 
        // TokenForwarder
        ) {
        
        //Filter
        var searchMeasureTypeRama = "measureType=\"Kolagenmessung\"";
        var tstatsMeasureTypeRama = "Achse." + searchMeasureTypeRama;
        
        var search_filt_pruefstand = "($search_filt_pruefstand_rama$ OR $search_filt_pruefstand_linie$) ";
        var search_filt_pruefumfang = "($search_filt_pruefumfang_rama$ OR $search_filt_pruefumfang_linie$) ";
        var search_filt_messungsart = "(" + searchMeasureTypeRama + " OR $search_filt_messungsart_linie$) ";
        var tstats_filt_pruefstand = "($tstats_filt_pruefstand_rama$ OR $tstats_filt_pruefstand_linie$) ";
        var tstats_filt_pruefumfang = "($tstats_filt_pruefumfang_rama$ OR $tstats_filt_pruefumfang_linie$) ";
        var tstats_filt_messungsart = "(" + tstatsMeasureTypeRama + " OR $tstats_filt_messungsart_linie$) ";
        
        //
        // SEARCH MANAGERS
        //

        function getSearchFilterOptions() {
            return new SearchManager({
                    "id": "search_filter_options",
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "search": 
                        '| tstats \n' +
                        '    count\n' +
                        '  from datamodel=APDM_FWS.Achse\n' +
                        '  where (nodename = Achse.ReferenceCar)\n' +
                        '  groupby source Achse.werk Achse.shortVIN Achse.testStand Achse.wheelAlignmentCode Achse.measureType Achse.pruefumfangName Achse.resultName Achse.resultValueStr\n' +
                        '  prestats=false summariesonly=true\n' +
                        '| rename \n' +
                        '    Achse.werk AS werk, \n' +
                        '    Achse.shortVIN AS shortVIN, \n' +
                        '    Achse.testStand AS testStand,\n' +
                        '    Achse.wheelAlignmentCode AS wheelAlignmentCode,\n' +
                        '    Achse.measureType AS measureType,\n' +
                        '    Achse.pruefumfangName AS pruefumfangName,\n' +
                        '    Achse.resultName AS resultName\n' +
                        '    Achse.resultValueStr AS resultValueStr\n' +
                        '| fields - count\n' +
                        '| lookup lkup_spurcode Spurcode as wheelAlignmentCode OUTPUT Beschreibung AS spurcode\n' +
                        '| eval spurcode=wheelAlignmentCode+" ("+spurcode+")"',
                    "status_buckets": 0,
                    "sample_ratio": 1,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": false,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true, 
                    tokenNamespace: "default"
                });
        }
        
        function getSearchFilterOptionsLinie() {
            return new SearchManager({
                    "id": "search_filter_options_Linie",
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "search": 
                        '| tstats \n' +
                        '    count\n' +
                        '  from datamodel=APDM_FWS.Achse\n' +
                        '  where (nodename = Achse) ($tstats_filt_shortVIN$) ($tstats_filt_chassis_property_linie$)\n' +
                        '  groupby source Achse.werk Achse.shortVIN Achse.testStand Achse.wheelAlignmentCode Achse.measureType Achse.pruefumfangName Achse.resultName\n' +
                        '  prestats=false summariesonly=true\n' +
                        '| rename \n' +
                        '    Achse.werk AS werk, \n' +
                        '    Achse.shortVIN AS shortVIN, \n' +
                        '    Achse.testStand AS testStand,\n' +
                        '    Achse.wheelAlignmentCode AS wheelAlignmentCode,\n' +
                        '    Achse.measureType AS measureType,\n' +
                        '    Achse.pruefumfangName AS pruefumfangName,\n' +
                        '    Achse.resultName AS resultName\n' +
                        '    Achse.resultValStr AS resultValStr\n' +
                        '| fields - count\n',
                    "status_buckets": 0,
                    "sample_ratio": 1,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": false,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true, 
                    tokenNamespace: "default"
                });
        }
        
        function getSearchSpurCode() {
            return new PostProcessManager({
                    "search": "| search (wheelAlignmentCode=*) ($search_filt_werk$) " + search_filt_pruefstand + search_filt_pruefumfang + search_filt_messungsart + " | table wheelAlignmentCode spurcode | dedup wheelAlignmentCode| sort spurcode",
                    "managerid": "search_filter_options",
                    "id": "searchSpurCode"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchChassisSet() {
            return new PostProcessManager({
                "search": "| table resultName | dedup resultName| sort resultName",
                "managerid": "search_filter_options",
                "id": "searchChassisSet"
            }, {
                tokens: true,
                tokenNamespace: "default"
            });
        }
        
        function getSearchPruefStandRama() {
            return new PostProcessManager({
                    "search": "| search (testStand=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_pruefumfang_rama$) | table testStand | dedup testStand| sort testStand",
                    "managerid": "search_filter_options",
                    "id": "searchPruefStandRama"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchPruefStandLinie() {
            return new PostProcessManager({
                    "search": "| search (testStand=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_pruefumfang_linie$) ($search_filt_messungsart_linie$) | table testStand | dedup testStand| sort testStand",
                    "managerid": "search_filter_options_Linie",
                    "id": "searchPruefStandLinie"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchPruefUmfangRama() {
            return new PostProcessManager({
                    "search": "| search (pruefumfangName=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_pruefstand_rama$) | table pruefumfangName | dedup pruefumfangName| sort pruefumfangName",
                    "managerid": "search_filter_options",
                    "id": "searchPruefUmfangRama"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchPruefUmfangLinie() {
            return new PostProcessManager({
                    "search": "| search (pruefumfangName=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_pruefstand_linie$) ($search_filt_messungsart_linie$) | table pruefumfangName | dedup pruefumfangName| sort pruefumfangName",
                    "managerid": "search_filter_options_Linie",
                    "id": "searchPruefUmfangLinie"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchMeasureType() {
            return new PostProcessManager({
                    "search": "| search (measureType=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_pruefumfang_linie$) ($search_filt_pruefstand_linie$) | table measureType | dedup measureType| sort measureType",
                    "managerid": "search_filter_options_Linie",
                    "id": "searchMeasureType"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchRefCarIdent() {
            return new PostProcessManager({
                    "search": "| search ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_pruefstand_rama$) ($search_filt_pruefumfang_rama$) | table resultValueStr | dedup resultValueStr| sort resultValueStr",
                    "managerid": "search_filter_options",
                    "id": "searchRefCarIdent"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchShortVIN() {
            return new PostProcessManager({
                    "search": "| search (testStand=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_shortVIN_input$)" + search_filt_pruefstand + search_filt_pruefumfang + search_filt_messungsart + " | table shortVIN | dedup shortVIN ",
                    "managerid": "search_filter_options",
                    "id": "searchShortVIN"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getSearchShortVINL() {
            return new PostProcessManager({
                    "search": "| search (testStand=*) ($search_filt_werk$) ($search_filt_spurcode$) ($search_filt_shortVIN_input$)" + search_filt_pruefstand + search_filt_pruefumfang + search_filt_messungsart + " | table shortVIN | dedup shortVIN ",
                    "managerid": "search_filter_options",
                    "id": "searchShortVINL"
                }, {
                    tokens: true,
                    tokenNamespace: "default"
                });
        }
        
        function getBaseStr(visibleToken) {
            var defaultTokenModel = mvc.Components.getInstance('default');
            var env_locale = defaultTokenModel.get("env_locale");
            var search = 
                '| tstats \n' +
                '    count\n' +
                '  from datamodel=APDM_FWS.Achse \n' +
                '  where (nodename = Achse) ($tstats_filt_chassis_property$ OR $tstats_filt_chassis_property_linie$) ($tstats_filt_shortVIN$) (' + visibleToken + ')\n' +
                '  groupby source Achse.shortVIN _time Achse.resultName Achse.resultValueDbl Achse.desiredValueDbl ' +
                'Achse.maxValueDbl Achse.minValueDbl Achse.testStand Achse.wheelAlignmentCode Achse.optParam2 ' +
                'Achse.measureType Achse.pruefumfangName Achse.series Achse.typeKey\n' +
                '  span=1s summariesonly=true\n' +
                '| rename\n' +
                '  Achse.* as *\n' +
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
                '| eval IS_REF=if(isNotNull(IS_REF), 1, 0)\n' +
                '| search (IS_REF=0 AND ($search_filt_chassis_property_linie$) AND ($search_filt_pruefstand_linie$) AND ($search_filt_pruefumfang_linie$) AND ($search_filt_messungsart_linie$)) OR (IS_REF=1 AND ($search_filt_chassis_property$))\n' +
                '| lookup lkup_ko_lagen resultName OUTPUT ' + env_locale + ' as shortResultName sortNr as sortResultName\n' +
                // get frist reference measure and last line measure of a vehicle
                '| eventstats \n' +
                '    earliest(eval(if(IS_REF==1, source, null()))) AS first_iR\n' +
                '    latest(eval(if(IS_REF==0, source, null()))) AS last_iL\n' +
                '  by shortVIN\n' +
                // master-filter 1:1 (filt_master=true()) --> filter all cars where are last line measure on testStand="..."
                '| where isNotNull(first_iR) AND IS_REF=1 AND source=first_iR OR (isNotNull(first_iR) AND IS_REF=0 AND source=last_iL AND if(false(), if(testStand=="*", true(), false()), true()))\n' +
                '| fields - first_iR last_iL\n' +
                '| eventstats\n' +
                '    dc(source) AS iR_iL_exist\n' +
                '  by shortVIN\n' +
                '| where if($filt_master$, iR_iL_exist>=2, true())\n' +
                '| eval UEG=desiredValueDbl+minValueDbl,\n' +
                '       OEG=desiredValueDbl+maxValueDbl,\n' +
                '       resultName=case(IS_REF==1, shortResultName + " ' + constants.ramaSuffix[env_locale] + '", IS_REF==0, shortResultName + " ' + constants.linieSuffix[env_locale] + '")\n' +
                '| eventstats\n' +
                '    count as Anz\n' +
                '    avg(resultValueDbl) as Avg\n' +
                '    stdev(resultValueDbl) as Stdev\n' +
                '    max(resultValueDbl) as Max\n' +
                '    min(resultValueDbl) as Min\n' +
                '    first(eval(OEG-UEG)) As T\n' +
                '    count(eval(resultValueDbl<UEG)) as under\n' +
                '    count(eval(resultValueDbl>OEG)) as over\n' +
                '  by resultName\n' +
                '| eval \n' +
                '  Avg=round(Avg, 2), \n' +
                '  Stdev=round(Stdev, 2) \n' +
                '| sort _time\n';
            return search;
        }
        
        //Base 
        function getSearchBase() {
            return new SearchManager({
                    "id": "search_base",
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "search": 
                        getBaseStr(''),
                    "status_buckets": 0,
                    "sample_ratio": null,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true, 
                    tokenNamespace: "submitted"
                });
        }
        
        //Search distinct shortVINs
        function getSearchShortVins() {
            return new PostProcessManager({
                    "search": 
                        '| fields shortVIN | dedup shortVIN',
                    "managerid": "search_base",
                    "id": "search_shortVins"
                }, {
                    tokens: true, 
                    tokenNamespace: "submitted"
                });
        }
        
        //Summary
        function getSearchSummary() {
            return new PostProcessManager({
                    "search": 
                        '| search IS_REF=1\n' +
                        '| eval roundReValDbl=round((round(resultValueDbl-0.5, 0)+round(resultValueDbl+0.5, 0))/2.00, 1)\n' +
                        '| eval desiredValueDbl=round(desiredValueDbl, 2)\n' +
                        '| eventstats\n' +
                        '    max(roundReValDbl) as Max\n' +
                        '    min(roundReValDbl) as Min\n' +
                        '    values(desiredValueDbl) as Sollwert\n' +
                        '  by resultName\n' +
                        '| fields resultName, Anz, Avg, Stdev, roundReValDbl, Max, Min, T, Sollwert, desiredValueDbl, sortResultName\n' +
                        '| stats\n' +
                        '  values(*) As *\n' +
                        '  count as AnzBy\n' +
                        '  by resultName sortResultName roundReValDbl\n' +
                        '| sort sortResultName resultName roundReValDbl\n' +
                        '| kstest cntAllField=Anz cntByField=AnzBy avgField=Avg maxField=Max minField=Min nameField=resultName significance=0.1 stdevField=Stdev valueField=roundReValDbl T Sollwert sortResultName\n' +
                        '| table resultName Sollwert Toleranz Min Max Mittelwert Stabw StdNV sortNr\n' +
                        '| sort sortNr\n' +
                        '| fields - sortNr \n' +
                        '| rename \n' +
                        '  resultName AS "' + i18n._("Name") + '" \n' +
                        '  Sollwert AS "' + i18n._("Sollwert") + '" \n' +
                        '  Toleranz AS "' + i18n._("Toleranz") + '" \n' +
                        '  Min AS "' + i18n._("Min") + '" \n' +
                        '  Max AS "' + i18n._("Max") + '" \n' +
                        '  Mittelwert AS "' + i18n._("Mittelwert") + '" \n' +
                        '  Stabw AS "' + i18n._("Stabw") + '" \n' +
                        '  StdNV AS "' + i18n._("StdNV") + '" ',
                    "managerid": "search_base",
                    "id": "search_summary"
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Base Histogramm Chart
        function getSearchBaseHistogram() {
            return new SearchManager({
                    "search": 
                        getBaseStr('$is_histogram_visible$'),
                    "id": "search_base_histogram",
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "status_buckets": 0,
                    "sample_ratio": null,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Histogramm Chart
        function getSearchHistogramChart(id, i, currChassisSet) {
            return new PostProcessManager({
                    "search": '\n' +
                        'search IS_REF=1 resultName="' + currChassisSet + '"\n' +
                        '| table shortVIN resultName resultValueDbl UEG OEG Stdev Avg',
                    "id": id,
                    "managerid": "search_base_histogram"
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Histogramm Overview
        function getSearchHistogramOverview() {
            return new PostProcessManager({
                    "search": 
                        'search IS_REF=1 \n' +
                        '| eval \n' +
                        '    XQuer=Avg,\n' +
                        '    Stabw=Stdev,\n' +
                        '    S=6*Stabw,\n' +
                        '    Range=OEG-UEG,\n' +
                        '    TNIO=under+over,\n' +
                        '    TIO=Anz-TNIO,\n' +
                        '    cp=round((OEG - UEG) / (6 * Stabw), 2),\n' +
                        '    cpk=round(min((XQuer - UEG),(OEG - XQuer)) / (3 * Stabw), 2),\n' +
                        '    FAu=round(under/Anz, 2),\n' +
                        '    FAo=round(over/Anz, 2),\n' +
                        '    FAg=round(TNIO/Anz, 2)\n' +
                        '| table resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg\n' +
                        '| dedup resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg\n' +
                        '| rename \n' + 
                        '  resultName as Name \n' + 
                        '  XQuer AS "' + i18n._("XQuer") + '" \n' +
                        '  Stabw AS "' + i18n._("Stabw") + '" \n' +
                        '  S AS "' + i18n._("S") + '" \n' +
                        '  Anz AS "' + i18n._("Anz") + '" \n' +
                        '  Min AS "' + i18n._("Min") + '" \n' +
                        '  Max AS "' + i18n._("Max") + '" \n' +
                        '  Range AS "' + i18n._("Bereich") + '" \n' +
                        '  TIO AS "' + i18n._("Tol. IO") + '" \n' +
                        '  TNIO AS "' + i18n._("Tol. NIO") + '" \n' +
                        '  UEG AS "' + i18n._("UEG") + '" \n' +
                        '  OEG AS "' + i18n._("OEG") + '" \n' +
                        '  cp AS "' + i18n._("cp") + '" \n' +
                        '  cpk AS "' + i18n._("cpk") + '" \n' +
                        '  FAu AS "' + i18n._("FAu") + '" \n' +
                        '  FAo AS "' + i18n._("FAo") + '" \n' +
                        '  FAg AS "' + i18n._("FAg") + '" ',
                    "id": "search_histogram_overview",
                    "managerid": "search_base_histogram"
                }, {
                    tokens: true, 
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Base Soll-Ist-Vergleich
        function getSearchBaseSollIst() {
            return new SearchManager({
                    "search": 
                        getBaseStr('$is_soll_ist_visible$') +
                        '| eval resultName=resultName + " Diff"\n' +
                        '| eval Set_Diff=desiredValueDbl-resultValueDbl',
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "id": "search_base_soll_ist",
                    "status_buckets": 0,
                    "sample_ratio": null,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Soll-Ist-Vergleich Chart
        function getSearchSollIstChart(id, i, currChassisSet) {
            var defaultTokenModel = mvc.Components.getInstance('default');
            var env_locale = defaultTokenModel.get("env_locale");
            return new PostProcessManager({
                    "search": '\n' +
                        ' search resultName="' + currChassisSet + '*"\n' +
                        '| stats\n' +
                        '  last(eval(if(IS_REF==1, Set_Diff, null()))) As "' + constants.ramaSuffix[env_locale] + '"\n' +
                        '  first(eval(if(IS_REF==0, Set_Diff, null()))) As "' + constants.linieSuffix[env_locale] + '"\n' +
                        '  last(maxValueDbl) As "' + i18n._("Maximum") + '"\n' +
                        '  last(minValueDbl) As "' + i18n._("Minimum") + '"\n' +
                        '  by shortVIN \n' +
                        '| rename shortVIN AS "' + i18n._("FGNR") + '"',
                    "managerid": "search_base_soll_ist",
                    "id": id
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Base Soll-Ist-Vergleich Overview
        function getSearchSollIstOverview() {
            return new PostProcessManager({
                    "search": 
                        '| eval \n' +
                        '    XQuer=Avg,\n' +
                        '    Stabw=Stdev,\n' +
                        '    UEG=round(minValueDbl, 2),\n' +
                        '    OEG=round(maxValueDbl, 2),\n' +
                        '    T= OEG-UEG,\n' +
                        '    S=6*Stabw,\n' +
                        '    Range=Max-Min,\n' +
                        '    TNIO=over+under,\n' +
                        '    TIO=Anz-TNIO,\n' +
                        '    cp=round((OEG - UEG) / (6 * Stabw), 2),\n' +
                        '    cpk=round(min((XQuer - UEG),(OEG - XQuer)) / (3 * Stabw), 2),\n' +
                        '    FAu=round(under/Anz, 2),\n' +
                        '    FAo=round(over/Anz, 2),\n' +
                        '    FAg=round(TNIO/Anz, 2)\n' +
                        '| table resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg\n' +
                        '| dedup resultName XQuer Stabw S Anz Min Max Range TIO TNIO UEG OEG cp cpk FAu FAo FAg \n' +
                        '| rename \n' + 
                        '  resultName as ' + i18n._("Name") + ' \n' + 
                        '  XQuer AS "' + i18n._("XQuer") + '" \n' +
                        '  Stabw AS "' + i18n._("Stabw") + '" \n' +
                        '  S AS "' + i18n._("S") + '" \n' +
                        '  Anz AS "' + i18n._("Anz") + '" \n' +
                        '  Min AS "' + i18n._("Min") + '" \n' +
                        '  Max AS "' + i18n._("Max") + '" \n' +
                        '  Range AS "' + i18n._("Bereich") + '" \n' +
                        '  TIO AS "' + i18n._("Tol. IO") + '" \n' +
                        '  TNIO AS "' + i18n._("Tol. NIO") + '" \n' +
                        '  UEG AS "' + i18n._("UEG") + '" \n' +
                        '  OEG AS "' + i18n._("OEG") + '" \n' +
                        '  cp AS "' + i18n._("cp") + '" \n' +
                        '  cpk AS "' + i18n._("cpk") + '" \n' +
                        '  FAu AS "' + i18n._("FAu") + '" \n' +
                        '  FAo AS "' + i18n._("FAo") + '" \n' +
                        '  FAg AS "' + i18n._("FAg") + '" ',
                    "managerid": "search_base_soll_ist",
                    "id": "search_soll_ist_overview"
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Base CP and CPK-Factor
        function getSearchBaseCpCpk() {
            return new SearchManager({
                    "search": 
                        getBaseStr('$is_cp_cpk_visible$') +
                        '| where IS_REF=1\n' +
                        '| sort resultName _time\n' +
                        '| streamstats \n' +
                        '  window=5 \n' +
                        '  avg(resultValueDbl) As AVG5  \n' +
                        '  stdevp(resultValueDbl) As STDEVP5 \n' +
                        '  by resultName\n' +
                        '| streamstats \n' +
                        '  window=10 \n' +
                        '  avg(resultValueDbl) As AVG10 \n' +
                        '  stdevp(resultValueDbl) As STDEVP10 \n' +
                        '  by resultName\n' +
                        '| streamstats \n' +
                        '  window=20 \n' +
                        '  avg(resultValueDbl) As AVG20 \n' +
                        '  stdevp(resultValueDbl) As STDEVP20 \n' +
                        '  count(resultValueDbl) As COUNTER \n' +
                        '  by resultName \n' +
                        '| eval \n' +
                        '    cpk5 = if(COUNTER >= 5, round(min((AVG5 - UEG),(OEG - AVG5)) / (3 * STDEVP5), 2), NULL), \n' +
                        '    cp5 = if(COUNTER >= 5, round((OEG - UEG) / (6 * STDEVP5), 2), NULL), \n' +
                        '    cpk10 = if(COUNTER >= 10, round(min((AVG10 - UEG),(OEG - AVG10)) / (3 * STDEVP10), 2), NULL), \n' +
                        '    cp10 = if(COUNTER >= 10, round((OEG - UEG) / (6 * STDEVP10), 2), NULL), \n' +
                        '    cpk20 = if(COUNTER >= 20, round(min((AVG20 - UEG),(OEG - AVG20)) / (3 * STDEVP20), 2), NULL), \n' +
                        '    cp20 = if(COUNTER >= 20, round((OEG - UEG) / (6 * STDEVP20), 2), NULL)',
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "id": "search_base_cp_cpk",
                    "status_buckets": 0,
                    "sample_ratio": null,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Cp-Cpk-Vergleich Chart
        function getSearchCpCpkChart(id, i, currChassisSet) {
            
            new PostProcessManager({
                    "search": 
                        '| search resultName="' + currChassisSet + '"\n' +
                        '| eval \n' +
                        '    Warnung = $form.filt_warn_fkt_idx$, \n' +
                        '    Eingriff = $form.filt_eing_fkt_idx$ \n',
                    "managerid": "search_base_cp_cpk",
                    "id": id
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        //Search Base DataCompressor
        function getSearchDataCompressor() {
            return new SearchManager({
                    "search": generateDataCompSearch(),
                    "latest_time": "$filt_time.latest$",
                    "earliest_time": "$filt_time.earliest$",
                    "id": "search_data_comp",
                    "status_buckets": 0,
                    "sample_ratio": null,
                    "cancelOnUnload": true,
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        function generateDataCompSearch() {
            var defaultTokenModel = mvc.Components.getInstance('default');
            var env_locale = defaultTokenModel.get("env_locale");
            var stats =
                getBaseStr('$is_data_comp_visible$') +
                '| eval \n' +
                '    OWG = desiredValueDbl + (maxValueDbl * $form.filt_warn_fkt_ist$ / 100), UWG = desiredValueDbl + (minValueDbl * $form.filt_warn_fkt_ist$ / 100),\n'+
                '    OEG = desiredValueDbl + (maxValueDbl * $form.filt_eing_fkt_ist$ / 100), UEG = desiredValueDbl + (minValueDbl * $form.filt_eing_fkt_ist$ / 100)\n' +
                '| eval color = if(resultValueDbl>OEG OR resultValueDbl<UEG, "eing", if(resultValueDbl>OWG OR resultValueDbl<UWG, "warn", "ok"))\n' +
                '| eval Time = strftime(_time, "%d-%m-%y - %H:%M:%S")\n' +
                '| stats\n' + 
                '   first(eval(if(IS_REF==1, "true", null()))) as IS_REF\n' + 
                '   first(eval(if(IS_REF==1, testStand, null()))) as TestStand_REF\n' + 
                '   first(eval(if(IS_REF==1, Time, null()))) as Time_REF\n' + 
                '   last(eval(if(IS_REF==0, testStand, null()))) as TestStand_LIN\n' + 
                '   last(eval(if(IS_REF==0, Time, null()))) as Time_LIN\n' + 
                '   first(eval(if(IS_REF==1, measureType, null()))) As measureType\n';
            var table = 
                '  by shortVIN wheelAlignmentCode optParam2 series typeKey\n' + 
                '| join type=outer shortVIN \n' +
                '[ \n' +
                '  | tstats \n' +
                '    count \n' +
                '    from datamodel=APDM_OrderData_Events \n' +
                '    where (nodename = OrderData) ($tstats_order_filt_shortVIN$)\n' +
                '    groupby OrderData.shortVIN, OrderData.driveType prestats=true \n' +
                '  | rename OrderData.shortVIN AS shortVIN OrderData.driveType AS driveType \n' +
                '  | fields shortVIN, driveType\n' +
                '  | dedup shortVIN, driveType\n' +
                '] \n' +
                '| table shortVIN wheelAlignmentCode optParam2 measureType IS_REF driveType series typeKey TestStand_REF Time_REF TestStand_LIN Time_LIN $chassis_choices_visible$';
            var sort = '| sort Time_REF';
            for (iter = 1; iter < constants.chassis_choices.length; iter++) {
                var curAlias = constants.chassis_choices[iter][env_locale] + constants.veSuffix[env_locale];
                stats += '    first(eval(if(IS_REF==1 AND resultName=="' + curAlias + ' ' + constants.ramaSuffix[env_locale] + '", resultValueDbl + "#" + color, null()))) As "' + curAlias + ' ' + constants.ramaSuffix[env_locale] + '"\n';
            }
            return stats + table + sort;
        }
        
        function getSearchDataCompressorFiltered() {
            return new PostProcessManager({
                    "search": 
                        '| search IS_REF=true ($dd_filt_shortVIN$)\n' +
                        '| rename\n' +
                        '  shortVIN AS "' + i18n._("FGNR") + '" \n' +
                        '  wheelAlignmentCode AS "' + i18n._("Spurcode") + '"\n' +
                        '  optParam2 AS "' + i18n._("Modellbeschreibung") + '"\n' +
                        '  measureType AS "' + i18n._("Messungsart") + '"\n' +
                        '  IS_REF AS "' + i18n._("IN_AUSWERTUNG") + '"\n' +
                        '  driveType AS "' + i18n._("LL/RL") + '"\n' +
                        '  series AS "' + i18n._("Baureihe") + '"\n' +
                        '  typeKey AS "' + i18n._("Typschluessel") + '"\n' +
                        '  TestStand_REF AS "' + i18n._("Pruefstand RAMA") + '"\n' +
                        '  Time_REF AS "' + i18n._("Pruefzeitpunkt RAMA") + '"\n' +
                        '  TestStand_LIN AS "' + i18n._("Pruefstand Linie") + '"\n' +
                        '  Time_LIN AS "' + i18n._("Pruefzeitpunkt Linie") + '"',
                    "managerid": "search_data_comp",
                    "id": "search_data_comp_filt"
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        function getSearchDataCompressorPrint() {
            return new PostProcessManager({
                    "search": 
                        generateDataCompTableCmd(),
                    "managerid": "search_data_comp_filt",
                    "id": "search_data_comp_print"
                }, {
                    tokens: true,
                    tokenNamespace: "submitted"
                });
        }
        
        function generateDataCompTableCmd() {
            var defaultTokenModel = mvc.Components.getInstance('default');
            var env_locale = defaultTokenModel.get("env_locale");
            var ev = '| eval \n';
            var table = 
                '| table "' + i18n._("FGNR") + '" "' + i18n._("Spurcode") + '" "' + i18n._("Modellbeschreibung") + '" "' + i18n._("Messungsart") + '" ' + 
                '"' + i18n._("IN_AUSWERTUNG") + '" "' + i18n._("LL/RL") + '" "' + i18n._("Baureihe") + '" "' + i18n._("Typschluessel") + '" ' + 
                '"' + i18n._("Pruefstand RAMA") + '" "' + i18n._("Pruefzeitpunkt RAMA") + '" "' + i18n._("Pruefstand Linie") + '" "' + i18n._("Pruefzeitpunkt Linie") + '" ' + 
                '$chassis_choices_visible$';
            for (iter = 1; iter < constants.chassis_choices.length; iter++) {
                var curAlias = constants.chassis_choices[iter][env_locale] + constants.veSuffix[env_locale];
                var comma = ",\n  ";
                if (iter == constants.chassis_choices.length - 1) {
                    comma = "\n  ";
                }
                ev += "\"" + curAlias + ' ' + constants.ramaSuffix[env_locale] + "\"=mvindex(split('" + curAlias + ' ' + constants.ramaSuffix[env_locale] + "', \"#\"),0)" + comma;
            }
            return ev + table;
        }
        
        var koLagenSearches = {
            getSearchFilterOptions : getSearchFilterOptions,
            getSearchFilterOptionsLinie : getSearchFilterOptionsLinie,
            getSearchSpurCode : getSearchSpurCode,
            getSearchChassisSet : getSearchChassisSet,
            getSearchPruefStandRama : getSearchPruefStandRama,
            getSearchPruefStandLinie : getSearchPruefStandLinie,
            getSearchPruefUmfangRama : getSearchPruefUmfangRama,
            getSearchPruefUmfangLinie : getSearchPruefUmfangLinie,
            getSearchMeasureType : getSearchMeasureType,
            getSearchRefCarIdent : getSearchRefCarIdent,
            getSearchShortVIN  : getSearchShortVIN ,
            getSearchBase : getSearchBase,
            getSearchShortVins : getSearchShortVins,
            getSearchSummary : getSearchSummary,
            getSearchBaseHistogram : getSearchBaseHistogram,
            getSearchHistogramOverview : getSearchHistogramOverview,
            getSearchBaseSollIst : getSearchBaseSollIst,
            getSearchSollIstOverview : getSearchSollIstOverview,
            getSearchBaseCpCpk : getSearchBaseCpCpk,
            getSearchDataCompressor : getSearchDataCompressor,
            getSearchDataCompressorFiltered  : getSearchDataCompressorFiltered,
            getSearchDataCompressorPrint : getSearchDataCompressorPrint,
            getSearchHistogramChart : getSearchHistogramChart,
            getSearchSollIstChart : getSearchSollIstChart,
            getSearchCpCpkChart : getSearchCpCpkChart
        }
        
        return koLagenSearches;
    }
);