//# sourceURL=db_apdm_fehlerhafte_testschritte.js
/************************************
 *Autor: Frank Effenberger, Georg Schröder
 *Datum: 15.02.2016
 *
 *Bemerkungen:
 *
 ************************************/

require([
		"splunkjs/mvc",
		"splunkjs/mvc/utils",
		"splunkjs/mvc/searchmanager",
		"jquery",
		"../app/iqp/apdm_fehlerhafte_testschritte/js/fehlerview",
		"../app/iqp/excel_export_fnc",
		"splunkjs/ready!",
		"splunkjs/mvc/simplexml/ready!"
	], function (
		mvc,
		utils,
		SearchManager,
		$,
		FehlerprotokollView,
		excel_export) {
	var tokens = mvc.Components.getInstance('default');
	var sTokens = mvc.Components.getInstance('submitted');

	function setToken(name, value) {
		tokens.set(name, value);
		sTokens.set(name, value);
	}

	function unsetToken(name) {
		tokens.unset(name);
		sTokens.unset(name);
	}
    
    function getToken(name) {
        var t = tokens.get(name);
        if (t == null) {
            t = sTokens.get(name);
        }
        return t;
    }

    if (typeof getToken("errorText") == "undefined") {
        setToken("errorText", "*");
    }
    if (typeof getToken("param2") == "undefined") {
        setToken("param2", "*");
    }

	function set_shortVIN(value) {
		console.log(value)
		if (!((!value) || value == "")) {
			console.log(value.replace(/shortVIN=/g, "").split(" OR "))
			console.log(value.replace(/shortVIN=/g, "source=*").replace(/ OR /g, "* OR ").replace(/(\d)$/, "*"))

			setToken("form.shortVIN", value.replace(/shortVIN=/g, "").split(" OR "));
			setToken("shortVIN", value.replace(/shortVIN=/g, "source=*").replace(/ OR /g, "* OR ").replace(/(\d)$/, "*"))
		}
	}

	set_shortVIN(tokens.get("vins"));
	tokens.on("change:vins", function (model, value, options) {
		set_shortVIN(value);
	});
    
	var fehlerview = new FehlerprotokollView({
			id: "fehlerprotokoll_view",
			managerid: "fehlerprotokoll_suche",
			el: $("#fehlerprotokoll_view")
		}).render();

	// Aufruf der Excelexport-Funktion aus excel_export_fnc.js
	excel_export.excel_export("table_fehler", "search_fehler");
	excel_export.excel_export("table_nacharbeiten", "search_nacharbeiten");
});


