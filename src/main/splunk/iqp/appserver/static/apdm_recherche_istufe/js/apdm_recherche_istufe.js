var deps = [
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/tokenutils",
    "splunkjs/mvc/searchmanager",
    "../app/iqp/excel_export_fnc",
    "../app/iqp/werkfilter_fnc",
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!"
];
require(deps, function(
		mvc, 
		utils,
        TokenUtils,
		SearchManager,
        excel_export,
		erstelleWerkfilter
	) {
    var tokens = mvc.Components.getInstance("default");
    var sTokens = mvc.Components.getInstance("submitted");
    
    function setToken(name, value) {
        tokens.set(name, value);
        sTokens.set(name, value);
    }
    
    function getToken(name) {
        return sTokens.get(name);
    }
    // setze die time constraints für den join auf die im Dashboard gegebenen plus 14 Tage davor
    var time_constraint_search = new SearchManager({
        "id": "time_constraint_search",
        "cancelOnUnload": true,
        "earliest_time": "$time.earliest$",
        "latest_time": "$time.latest$",
        "search": "| gentimes start=-1 | addinfo | eval latest=info_max_time | eval earliest=info_min_time-14*24*60*60 | table earliest latest",
        "status_buckets": 0,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": false,
        "runWhenTimeIsUndefined": false
    }, {
        tokens: true,
        tokenNamespace: "default"
    });
    var time_results = time_constraint_search.data("preview", { count: 1, offset: 0 });
    time_results.on("data", function() {
        tokens.set("order_data_base_search_earliest",time_results.data().rows[0][0]);
        tokens.set("order_data_base_search_latest",time_results.data().rows[0][1]);
    });
    
    // lade die shortVINs vor, auf die die Bedingungen zutreffen
    var order_data_base_search = new SearchManager({
        "id": "order_data_base_search",
        "cancelOnUnload": true,
        "earliest_time": "$order_data_base_search_earliest$",
        "latest_time": "$order_data_base_search_latest$",
        "search": "| tstats count \n\
    from datamodel=APDM_OrderData_Events \n\
    where ($baureihe$) ($i_stufe$) (OrderData.werk=\"$werkfilter$\") \n\
    groupby \"OrderData.shortVIN\" \"OrderData.integrationLevel\" \"OrderData.series\" \n\
| rename OrderData.shortVIN AS shortVIN, OrderData.integrationLevel AS integrationLevel, OrderData.series AS baureihe | fields - count",
        "status_buckets": 0,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": false,
        "runWhenTimeIsUndefined": false
    }, {
        tokens: true,
        tokenNamespace: "default"
    });
    order_data_base_search.on("search:done", function() {
            tokens.set("order_data_base_search_sid",order_data_base_search.job.sid);
            sTokens.set("order_data_base_search_sid",order_data_base_search.job.sid);
    });
    
    var tbl_rech_istufe = mvc.Components.getInstance("tbl_rech_istufe");
    tbl_rech_istufe.on("click", function (e) {
        if ((e.field !== undefined)) {
            e.preventDefault();
            console.log(e.data);
            if (e.field === getToken("i18n_Baureihe")) {
                setToken("baureihe", e.data["click.value2"]);
                setToken("form.baureihe", e.data["click.value2"]);
            } else if (e.field === getToken("i18n_I_Stufe")) {
                setToken("i_stufe", e.data["click.value2"]);
                setToken("form.i_stufe", e.data["click.value2"]);
            } else if (e.field === getToken("i18n_TestStepResult")) {
                setToken("tsr", e.data["click.value2"]);
                setToken("form.tsr", e.data["click.value2"]);
            } else if (e.field === getToken("i18n_FGNR")) {
                var url = TokenUtils.replaceTokenNames("apdm_recherche_fahrzeug?form.shortVIN=$click.value2$&form.tsdatum.earliest=$time.earliest$&form.tsdatum.latest=$time.latest$&form.testStepResult=$row.TestStepResult$&form.werkfilter=$werkfilter$", _.extend(sTokens.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
                utils.redirect(url, false, "_blank");
            } 
        }
    });

    // erstelleWerkfilter
    erstelleWerkfilter( "werkinput" );

    // Aufruf der Excelexport-Funktion aus excel_export_fnc.js
    excel_export.excel_export("tbl_rech_istufe", "search_rech_istufe");
    
});