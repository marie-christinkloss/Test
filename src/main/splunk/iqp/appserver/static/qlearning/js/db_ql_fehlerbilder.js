//# sourceURL=qlearning/js/db_ql_fehlerbilder.js

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "underscore",
        "splunkjs/mvc/simpleform/input/submit",
        "jquery",
        "splunk.i18n",
        "splunkjs/mvc/simplexml/element/table",
        "splunkjs/mvc/tableview",
        "splunkjs/mvc/searchmanager",
        "splunkjs/mvc/savedsearchmanager",
        "../app/iqp/excel_export_fnc",
        "../app/iqp/splunkUtils",
        "splunkjs/mvc/simplexml"
        // Add comma-separated libraries and modules manually here, for example:
        // ..."splunkjs/mvc/simplexml/urltokenmodel",
        // "splunkjs/mvc/checkboxview"
    ],
    function (
        mvc,
        utils,
        TokenUtils,
        _,
        SubmitButton,
        $,
        i18n,
        TableElement,
        TableView,
        SearchManager,
        SavedSearchManager,
        excel_export,
        splunkUtils

        // Add comma-separated parameter names here, for example:
        // ...UrlTokenModel,
        // CheckboxView
    ) {
        


    //
    // TOKENS
    //

    var defaultTokenModel = mvc.Components.getInstance('default');
    var submittedTokenModel = mvc.Components.getInstance('submitted');
    
    function getToken(name) {
        return submittedTokenModel.get(name);
    }
    
    var i18n_errorPatternSave = i18n._('Fehlerbild Speichern');
    var i18n_ShortDescriptionOfError = i18n._('Kurzbeschreibung des Fehlers');
    var i18n_errorPatternSaved = i18n._('Das Fehlerbild wurde gespeichert.');
    var i18n_errorPatternIsSaved = i18n._('Ein Fehlerbild mit dieser Beschreibung ist bereits gespeichert!');
    
    //
    // SEARCH MANAGERS
    //

    var service = mvc.createService();
    
    function set_period_in_unix_time(model, value, options) {
                
        service.oneshotSearch("| makeresults | addinfo | eval info_max_time=if(info_max_time==\"+Infinity\",now(),info_max_time)", {
            earliest_time : defaultTokenModel.get("time.earliest"),
            latest_time : defaultTokenModel.get("time.latest"),
            output_mode : "JSON"
        }, function (err, results) {
            submittedTokenModel.set("timestamp_earliest", results.results[0].info_min_time);
            submittedTokenModel.set("timestamp_latest", results.results[0].info_max_time);
            defaultTokenModel.set("timestamp_earliest", results.results[0].info_min_time);
            defaultTokenModel.set("timestamp_latest", results.results[0].info_max_time);
        });
    }
    defaultTokenModel.on("change:time.earliest", set_period_in_unix_time);
    defaultTokenModel.on("change:time.latest", set_period_in_unix_time); 
    
    //trick, weils anders nicht ging
    defaultTokenModel.on("change:recomputeTime", set_period_in_unix_time); 
    defaultTokenModel.set("recomputeTime", "1");
    
    $('#submit > .btn-primary').on("click", set_period_in_unix_time);

    //
    // VIEWS: VISUALIZATION ELEMENTS
    //
    
    var table_fehlerbilder = mvc.Components.getInstance("table_fehlerbilder");
    table_fehlerbilder.on("click", function (e) {
        if ((e.field !== undefined)) {
            e.preventDefault();
            setToken("save_fehlerbild", e.data["row." + getToken("i18n_errorPattern")]);
        }
    });
    
    function dialogSaveFehlerbild(fb_id) {
        
        var save_button=$('<button class="btn">' + getToken("i18n_save") + '</button>', {'class': 'btn btn-default button_save_fehlerbild_submit', 'id': 'button_save_fehlerbild_submit'});
        splunkUtils.showPopup(
            title=i18n_errorPatternSave,
            body=i18n_ShortDescriptionOfError +':<br/><textarea rows="4" cols="90" class="save_fehlerbild_short_description" id="save_fehlerbild_short_description"/><br/><div id="savefbdialogfehler" style="color:red;"/>',
            footer=save_button
        );
        save_button.on("click", function () {
            saveFehlerbild(fb_id);
        });
    
    }
    
    function saveFehlerbild(fb_id) {
        //empty error info
        $('#savefbdialogfehler').text("");
        
        var sid = splunkjs.mvc.Components.get("fehlerbilder_search")._job.id;
        var lookupName = "iqp_fehlerbilder.csv";
        
        var baseSearchSidStr = "| loadjob "+sid;
        var nachbearbeitungSearchStr = " | search group=* | fields ID, group | rename ID as Fehlerklassen, group as Fehlerbild | where Fehlerbild = " + fb_id + " | mvcombine delim=\";\" Fehlerklassen";
        
        var fb_beschriftung = $("#save_fehlerbild_short_description").val();
        
        defaultTokenModel.on("change:recomputeTime", set_period_in_unix_time); 
        defaultTokenModel.set("recomputeTime", "1");
        
        var addFieldsToSearchStr = " | eval Fehlerbild_Beschreibung = \"" + fb_beschriftung +"\""
        var saveLookupSearchStr = " | table Fehlerklassen Fehlerbild_Beschreibung | inputlookup append=true "+lookupName + " | outputlookup "+lookupName; 
        
        var saveFehlerbildSearchStr = baseSearchSidStr 
                                    + nachbearbeitungSearchStr 
                                    + addFieldsToSearchStr 
                                    + saveLookupSearchStr;
        
        // Ueberpruefe, ob das Fehlerbild mit dieser Beschreibung bereits existiert, wenn nicht speichere es
        var fehlerbildSearch = "| inputlookup iqp_fehlerbilder.csv | where Fehlerbild_Beschreibung = \"" + fb_beschriftung +"\"  | stats count";
        var searchParams = { exec_mode: "blocking", earliest_time: "0"};
        service.search(
          fehlerbildSearch,
          searchParams,
          function(err, job) {
            job.fetch(function(err){
              job.results({}, function(err, results) {
                if (parseInt((results.rows[0])[0]) <= 0) {
                    // Fehlerbild existiert noch nicht
                    fbExistsreturnValue = true;
                        service.oneshotSearch(saveFehlerbildSearchStr, {
                            output_mode : "JSON"
                        }, function (err, results) {
                            $('.modal').modal('toggle');
                            alert(i18n_errorPatternSaved);
                        });
                } else {
                    // Fehlerbild existiert schon
                    $('#savefbdialogfehler').text(i18n_errorPatternIsSaved);
                }
              })
            });
          }
        );
    }
        
    var SaveFehlerbildCellRenderer = TableView.BaseCellRenderer.extend({ 
        canRender: function(cellData) {
            return (cellData.field === getToken('i18n_save')); //TODO Feldname = Speichern
            //return true;
        },
        render: function($td, cellData) {
            
            if (cellData.value) {
                $td.on("click", function(e) {
                    //e.preventDefault();
                });
                
                $td.addClass('string');
                $td.html('<button class="btn btn-primary show_button btnModalInfo" data-toggle="modal" data-target=".savefbdialog">' + getToken("i18n_save") + '</button>');
                
                $td.children(".show_button").on("click", function(e) {
                    //alert("SaveFehlerbildCellRenderer clicked, field: " + e.field + " cellData.value: " + cellData.value);
                    set_period_in_unix_time; //TODO: hier vielleicht guenstig?
                    dialogSaveFehlerbild(cellData.value);
                });   

            } else {
                $td.addClass('string');
            }
        }
    });    
    
    splunkjs.mvc.Components.get('table_fehlerbilder').getVisualization(function(tableView) {
        console.log("splunkjs.mvc.Components.get 1 " );
        tableView.table.addCellRenderer(new SaveFehlerbildCellRenderer());
        tableView.table.render();
    });
    
    // Add slide toggle buttons 
    splunkUtils.setSlideTogglePanel("saved_error_patterns");
    
    //hide parameter input
    $('#parameter').hide();
    
    // Button Liste aller Fehlerbilder
    $("#btn_list_fehlerbilder").on("click", function () {
        var url = '/app/lookup_editor/lookup_edit?owner=nobody&namespace=iqp&lookup=iqp_fehlerbilder.csv&type=csv';
        utils.redirect(url, newWindow = true);
    });
    
    
});
