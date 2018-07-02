


var deps = [
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/searchmanager",
    "../app/iqp/werkfilter_fnc",
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!"
];
require(deps, function(mvc, utils, SearchManager, erstelleWerkfilter) {
    var tokens = mvc.Components.getInstance("default");
    var sTokens = mvc.Components.getInstance("submitted");
    
    // setze die time constraints für den join auf die im Dashboard gegebenen plus 14 Tage davor
    var time_constraint_search = new SearchManager({
        "id": "time_constraint_search",
        "cancelOnUnload": true,
        "earliest_time": "$Zeitauswahl.earliest$",
        "latest_time": "$Zeitauswahl.latest$",
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
        sTokens.set("order_data_base_search_earliest",time_results.data().rows[0][0]);
        sTokens.set("order_data_base_search_latest",time_results.data().rows[0][1]);
    });
    
    // lade die shortVINs vor, auf die die Bedingungen zutreffen
    var order_data_base_search = new SearchManager({
        "id": "order_data_base_search",
        "cancelOnUnload": true,
        "earliest_time": "$order_data_base_search_earliest$",
        "latest_time": "$order_data_base_search_latest$",
        "search": "| tstats count from datamodel=APDM_OrderData_Events where (host=$werkfilter_host$) $tok_serie$ groupby \"OrderData.shortVIN\" prestats=false",
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
            set_order_data_join();
    });
    
    // Führe den Join über die Order Data nur aus, wenn Serien Filter gesetzt sind
    function set_order_data_join() {
        var currentSerieFilter =  tokens.get("form.tok_serie");
        if (currentSerieFilter != "*") {
            var order_data_base_search_sid = tokens.get("order_data_base_search_sid");
            if (order_data_base_search_sid) {
                tokens.set("order_data_join","| join type=inner shortVIN [ | loadjob "+order_data_base_search_sid+" | rename OrderData.shortVIN AS shortVIN ] ");
                sTokens.set("order_data_join","| join type=inner shortVIN [ | loadjob "+order_data_base_search_sid+" | rename OrderData.shortVIN AS shortVIN ] ");
            } else {
                tokens.unset("order_data_join");
                sTokens.unset("order_data_join");
            }
            
        } else {
            if (!(tokens.get("order_data_join")==="")) {
                tokens.set("order_data_join","");
                sTokens.set("order_data_join","");
            }
        }
    }
    tokens.set("order_data_join","");
    set_order_data_join();
    mvc.Components.getInstance("input2").on("change", set_order_data_join);
    mvc.Components.getInstance("input3").on("change", set_order_data_join);
    
    
	// erstelleWerkfilter
	erstelleWerkfilter( "werkinput" );
});


