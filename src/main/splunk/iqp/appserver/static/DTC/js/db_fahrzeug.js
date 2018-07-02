//# sourceURL=DTC/js/db_fahrzeug.js
require([
        "splunkjs/mvc",
        "splunkjs/mvc/tableview",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "splunkjs/ready!",
        "splunkjs/mvc/simplexml/ready!"
    ],
    function(
        mvc,
        TableView,
        utils,
        TokenUtils
    ) {
        console.debug("Executing db_fahrzeug.js");

		var submittedTokenModel = mvc.Components.getInstance("submitted");
		var defaultTokenModel = mvc.Components.getInstance("default");
        
        function setToken(token, value) {
            defaultTokenModel.set(token, value);
            submittedTokenModel.set(token, value);
        }
        
		var table_dtcs = mvc.Components.getInstance('table_dtcs');
        table_dtcs.on("click", function (e) {
			if ((e.field !== undefined )) {
				e.preventDefault();
                setToken('pruefUmfang', e.data['row.' + defaultTokenModel.get('i18n_pruefumfangName')]);
                setToken('stepTime', e.data['row.testStepTime']);
                setToken('selectedDTC', e.data['row.' + defaultTokenModel.get('i18n_dtcCode')]);
			}
		});
        
        //Wenn auf der Uebersichtsseite DTC-Codes ausgwaehlt oder auf einen geklickt wird, wird dieser in der Ansicht von den DTC-Codes auf dem Fahrzeuganalyse-Dashboard markiert
        function setDtcCodeHighlight(model,value,options) {
                        var newValue = value||"";
                        if (typeof newValue === 'string') {
                                newValue = "dtcCode=\"" + newValue.trim() + "\"";
                        } else {
                                newValue = "dtcCode=\"" + newValue.join("\" OR dtcCode=\"") + "\"";
                        }
                        model.set("dtcCodeHighlight",newValue);        
        }
        submittedTokenModel.on("change:dtcCode", setDtcCodeHighlight);
        setDtcCodeHighlight(submittedTokenModel,submittedTokenModel.get("dtcCode"),{});
        
        submittedTokenModel.on("change:selectedDTC", function() {
            $("#selectedPUS").val(submittedTokenModel.get("selectedDTC"));
        });

        // Bei Klick auf die einzelnen Pruefumfaengen wird dieser in dem Input hinzugefuegt
        var sub_pruefUmfang = mvc.Components.getInstance('highlight');
        var input_selectedPU = mvc.Components.getInstance('selectedPU');
        sub_pruefUmfang.on("click", function (e) {
            if ((e.field !== undefined )) {
                e.preventDefault();

                if (input_selectedPU.val() === null) {
                    console.warn("input_selectedPU ist NULL");
                } else {
                    var vins = input_selectedPU.val();

                    vins.push(TokenUtils.replaceTokenNames("$row.pruefUmfangToken$", e.data));

                    input_selectedPU.val(vins);
                    input_selectedPU.render();

                }
            }
        });
        
        $("#reset_DTC_button").on("click", function (){
            submittedTokenModel.set("pruefUmfang", "");
            submittedTokenModel.set("stepTime", 0);
            submittedTokenModel.set("selectedDTC", "");
        });
    }
);

