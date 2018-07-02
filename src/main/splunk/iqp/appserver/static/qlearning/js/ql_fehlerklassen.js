//# sourceURL=qlearning/js/ql_fehlerklassen.js

var deps = [
	"jquery",
	"underscore",
	"splunkjs/mvc",
	"splunkjs/mvc/utils",
	"splunkjs/mvc/tokenutils",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/tableview",
    "../app/iqp/splunkUtils",
    "../app/iqp/werkfilter_fnc",
	"splunkjs/ready!",
	"splunkjs/mvc/simplexml/ready!"
];
require(deps, function(
	$,
    _,
	mvc,
	utils,
	TokenUtils,
    TextInput,
    FormUtils,
    TableView,
    splunkUtils,
    erstelleWerkfilter
	) {
    
    var CustomVisibleRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return _(['example_text']).contains(cell.field);
        },
        render: function($td, cell) {
            $td.addClass('invisible-cell');
            $td.text(cell.value);
        }
    });
    
    var errorClassTable = mvc.Components.getInstance("errorClassTable");
    errorClassTable.getVisualization(function(tableView) {
        tableView.addCellRenderer(new CustomVisibleRenderer());
    });
    
    var defaultTokenModel=mvc.Components.getInstance("default");
    var submittedTokenModel=mvc.Components.getInstance("submitted");
    
    //Werkfilter auf Default-WErk für den Nutzer stellen
    var werkinput=mvc.Components.get("input_werk");
    setDefaultWerk(werkinput);
    
	//Button Fehlertyp hinzufügen
    var service = mvc.createService();
    $("#btn_add_fehlerklasse").on("click", function () {
        var query=TokenUtils.replaceTokenNames(
            '\
             | inputlookup lkup_fehlerklasse \
             `comment("Wenn die neue Fehlerklasse existierende Fehlerklassen einschliesst, loesche die betreffenden existierenden Fehlerklassen")`\
             | search NOT\
                 [ makeresults \
                 | fields - _time \
                 | eval \
                  pruefumfangName="$ft_pruefumfangName$",\
                  testStepName="$ft_testStepName$",\
                  resultName="$ft_resultName$",\
                  description="$ft_description$",\
                  param1="$ft_param1$",\
                  param2="$ft_param2$",\
                  resultValueStr="$ft_resultValueStr$",\
                  ErrorCodeDec="$ft_ErrorCodeDec$",\
                  errorText="$ft_errorText$",\
                  adviseText="$ft_adviseText$",\
                 ]\
             \
             | append \
                 [ makeresults \
                 | fields - _time \
                 | eval \
                  pruefumfangName="$ft_pruefumfangName$",\
                  testStepName="$ft_testStepName$",\
                  resultName="$ft_resultName$",\
                  description="$ft_description$",\
                  param1="$ft_param1$",\
                  param2="$ft_param2$",\
                  resultValueStr="$ft_resultValueStr$",\
                  ErrorCodeDec="$ft_ErrorCodeDec$",\
                  errorText="$ft_errorText$",\
                  adviseText="$ft_adviseText$",\
                  examples="'+$("textarea#input_example_text").val()+'"\
                 \
                 `comment("Wenn eine existierende Fehlerklasse die neue Fehlerklasse einschliesst, fuege keinen neuen Eintrag hinzu")`\
                 | lookup lkup_fehlerklasse pruefumfangName testStepName resultName description param1 param2 resultValueStr ErrorCodeDec errorText adviseText OUTPUT pruefumfangName testStepName resultName description param1 param2 resultValueStr ErrorCodeDec errorText adviseText\
                 ] \
             | dedup pruefumfangName testStepName resultName description param1 param2 resultValueStr ErrorCodeDec errorText adviseText\
             \
             | streamstats count as ID\
             | outputlookup lkup_fehlerklasse', defaultTokenModel.toJSON());
        
        service.oneshotSearch(query, {}, function(err, results) {
            if (err) {
                console.log(err);
                splunkUtils.showPopup("Warnung", err.error, null);
            } else {
                splunkUtils.showPopup("Erfolgreich", "Fehlerklasse erfolgreich hinzugefügt", null);
            }
        });
    });
    
    // Button Liste aller Fehlerklassen
    $("#btn_list_fehlerklassen").on("click", function () {
        var url = '/app/lookup_editor/lookup_edit?owner=nobody&namespace=iqp&lookup=fehlerklassen.csv&type=csv';
        utils.redirect(url, newWindow = true);
    });
    
    // create slider for cluster sensitivity
    $("#input_submit_btn_cluster").on("click", function() {
        submittedTokenModel.set("sensitivity",defaultTokenModel.get("sensitivity"));
    });
    requirejs.config({paths: {'jquery-ui-private': '../app/iqp/jqui/jquery-ui-1.10.4.custom.min'},shim: {'jquery-ui-private': {deps: ['jquery']}}});
    require(['jquery-ui-private','css!../app/iqp/jqui/jquery-ui-1.10.4.custom.min'], function() {
        if (! ( defaultTokenModel.get("sensitivity") )) {
            defaultTokenModel.set("sensitivity","0.9");
            submittedTokenModel.set("sensitivity","0.9");
        }
        $('#input_sensitivity_slider').slider({
            value: defaultTokenModel.get("sensitivity"),
            min: 0.01,
            max: 0.99,
            step: 0.01,
            slide: function( event, ui ) {
                defaultTokenModel.set("sensitivity",ui.value );
                $("#input_sensitivity_text-input").val(ui.value)
            }
        });
        $('#input_sensitivity input').attr("style","border: none; box-shadow: none; background-color: #fff;");
    })
    
    // erstelleWerkfilter
    erstelleWerkfilter( "input_werk" );
    
});
