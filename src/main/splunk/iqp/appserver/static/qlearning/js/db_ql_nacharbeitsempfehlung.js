//# sourceURL=qlearning/js/db_ql_nacharbeitsempfehlung.js

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "splunkjs/mvc/tableview",
        "underscore",
        "jquery",
        "../../app/iqp/werkfilter_fnc",
        "splunkjs/ready!",
        "splunkjs/mvc/simplexml/ready!"
    ],
    function (
        mvc,
        utils,
        TokenUtils,
        TableView,
        _,
        $,
        erstelleWerkfilter
    ) {
        
        
        var defaultTokenModel=mvc.Components.getInstance("default");
        var submittedTokenModel=mvc.Components.getInstance("submitted");
        
        function setToken(name, value) {
            defaultTokenModel.set(name, value);
            submittedTokenModel.set(name, value);
        }
        
        function unsetToken(name) {
            defaultTokenModel.unset(name);
            submittedTokenModel.unset(name);
        }
        
        function getToken(name) {
            return submittedTokenModel.get(name);
        }
        
        var CustomVisibleRenderer = TableView.BaseCellRenderer.extend({
            canRender: function(cell) {
                return _(['source', 'Fehlerbild_Fehlerklassen', 'cluster_label']).contains(cell.field);
            },
            render: function($td, cell) {
                $td.addClass('invisible-cell');
                $td.text(cell.value);
            }
        });
        
        // deaktiviere Vorschau bei der Textmining-Suche
        var search_text_mining_part1=mvc.Components.getInstance("search_text_mining_part1");
        search_text_mining_part1.set("preview",false);
        var search_text_mining_part2=mvc.Components.getInstance("search_text_mining_part2");
        search_text_mining_part2.set("preview",false);
        //var search_text_mining_part3=mvc.Components.getInstance("search_text_mining_part3");
        //search_text_mining_part3.set("preview",false);
        var search_text_mining_part4=mvc.Components.getInstance("search_text_mining_part4");
        search_text_mining_part4.set("preview",false);
        
        
        var tablePruefumfangFehler = mvc.Components.getInstance('tablePruefumfangFehler');
        tablePruefumfangFehler.getVisualization(function(tableView) {
            tableView.addCellRenderer(new CustomVisibleRenderer());
        });
        
        var tablePruefschrittFehler = mvc.Components.getInstance('tablePruefschrittFehler');
        tablePruefschrittFehler.getVisualization(function(tableView) {
            tableView.addCellRenderer(new CustomVisibleRenderer());
        });
        tablePruefschrittFehler.on("click", function (e) {
            if ((e.field !== undefined)) {
                e.preventDefault();
                setToken("tsr_filter", TokenUtils.replaceTokenNames(' source="$row.source$" TestStepResult.pruefumfangName="$row.' + getToken("i18n_testScope") + '$" TestStepResult.testStepName="$row.' + getToken("i18n_testStepName") + '$" TestStepResult.description="$row.' + getToken("i18n_description") + '$" TestStepResult.param1="$row.' + getToken("i18n_sgbd") + '$" TestStepResult.param2="$row.' + getToken("i18n_apiJob") + '$"', _.extend(submittedTokenModel.toJSON(), e.data)));
            }
        });
        
        var tableEinzelFehler = mvc.Components.getInstance('tableEinzelFehler');
        tableEinzelFehler.getVisualization(function(tableView) {
            tableView.addCellRenderer(new CustomVisibleRenderer());
        });
        tableEinzelFehler.on("click", function (e) {
            if (e.field === getToken("i18n_errorClass")) {
                e.preventDefault();
                setToken("fehlerklasse", e.data["row." + getToken("i18n_errorClass")]);
                unsetToken("fehlerbild");
                unsetToken("fehler");
                setToken("nacharbeitsfilter", 'fehlerklasse_id="' + e.data["row." + getToken("i18n_errorClass")] + '"');
                unsetToken("clusternum");
            } else if (e.field === getToken("i18n_errorPattern")) {
                e.preventDefault();
                unsetToken("fehlerklasse");
                setToken("fehlerbild", e.data["row." + getToken("i18n_errorPattern")]);
                unsetToken("fehler");
                setToken("nacharbeitsfilter", 'fehlerklasse_id IN ' + e.data["row.Fehlerbild_Fehlerklassen"]);
                unsetToken("clusternum");
            } else if ((e.field !== undefined)) {
                e.preventDefault();
                unsetToken("fehlerklasse");
                unsetToken("fehlerbild");
                setToken("fehler", true);
                setToken("nacharbeitsfilter", TokenUtils.replaceTokenNames('pruefumfangName="$row.' + getToken("i18n_testScope") + '$", testStepName="$row.' + getToken("i18n_testStepName") + '$", description="$row.' + getToken("i18n_description") + '$", param1="$row.' + getToken("i18n_sgbd") + '$", param2="$row.' + getToken("i18n_apiJob") + '$", resultName="$row.' + getToken("i18n_resultName") + '$", resultValueStr="$row.' + getToken("i18n_resultValue") + '$", ErrorCodeDec="$row.' + getToken("i18n_errorCodeDec") + '$", errorText="$row.' + getToken("i18n_errorText") + '$", adviseText="$row.' + getToken("i18n_adviseText") + '$"', _.extend(submittedTokenModel.toJSON(), e.data)));
                unsetToken("clusternum");
            }
        });
        
        var tableReworkCat = mvc.Components.getInstance('tableReworkCat');
        tableReworkCat.getVisualization(function(tableView) {
            tableView.addCellRenderer(new CustomVisibleRenderer());
        });
        
        // erstelleWerkfilter
        erstelleWerkfilter( "input_werk" );
    }
);