//# sourceURL=db_analyse.js
require([
		"splunkjs/mvc",
		"splunkjs/ready!",
		"splunkjs/mvc/simplexml/ready!"
	],
	function(
		mvc
	) {

		var defaultTokenModel = mvc.Components.getInstance("default");
		var submittedTokenModel = mvc.Components.getInstance("submitted");
        
        function setToken(token, value) {
            defaultTokenModel.set(token, value);
            submittedTokenModel.set(token, value);
        }
			
		var masterTable = mvc.Components.getInstance('master');
        masterTable.on("click", function(e) {
            if ((e.field !== undefined )) {
				e.preventDefault();
                if (e.field === defaultTokenModel.get("i18n_pruefumfangName") || e.field === defaultTokenModel.get("i18n_AnzahlDTC") || e.field === "Jitter_Button") {
                    setToken("pruefumfangNameClicked", e.data["row." + defaultTokenModel.get("i18n_pruefumfangName")]);
                    setToken("AnzahlDTC", e.data["row." + defaultTokenModel.get("i18n_AnzahlDTC")]);
                }
            }
        });
        
	});
