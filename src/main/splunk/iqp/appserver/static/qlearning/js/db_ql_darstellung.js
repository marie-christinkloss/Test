//# sourceURL=qlearning/js/db_ql_darstellung.js

var deps = [
	"jquery",
	"splunkjs/mvc",
	"splunkjs/mvc/utils",
	"splunkjs/mvc/tokenutils",
	"underscore",
	"splunkjs/mvc/searchmanager",
	"splunkjs/mvc/tableview",
	"splunkjs/mvc/simpleform/input/submit",
	"splunkjs/mvc/simpleform/formutils",
	"splunkjs/mvc/simpleform/input/dropdown",
	"splunkjs/mvc/simpleform/input/text",
	"splunkjs/mvc/savedsearchmanager",
	"splunkjs/mvc/postprocessmanager",
	"splunkjs/mvc/simplexml/urltokenmodel",
	"splunkjs/mvc/simpleform/input/checkboxgroup",
	"splunkjs/ready!",
	"splunkjs/mvc/simplexml/ready!"

];
require.config({
	waitSeconds: 0,
	paths: {
		'app': '/static/app/iqp'
	}
});

require(deps, function (
	$,
	mvc,
	utils,
	TokenUtils,
	_,
	SearchManager,
	TableView,
	SubmitButton,
	FormUtils,
	DropdownInput,
	TextInput,
	SavedSearchManager,
	PostProcessManager,
	UrlTokenModel,
	CheckboxGroupInput) {

	var defaultTokenModel = mvc.Components.getInstance('default');
	var submittedTokenModel = mvc.Components.getInstance('submitted');


	function getdefaultToken(name) {
		return defaultTokenModel.get(name);
	}

	function getsubmittedToken(name) {
		return submittedTokenModel.get(name);
	}

	function setToken(name, value) {
		defaultTokenModel.set(name, value);
		submittedTokenModel.set(name, value);
	}

	function unsetToken(name) {
		defaultTokenModel.unset(name);
		submittedTokenModel.unset(name);
	}
	
	function submitTokens() {
		// Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
        if (submittedTokenModel) {
            submittedTokenModel.set(defaultTokenModel.toJSON());
        }
	}
	
	var service = mvc.createService();
	
	//Button Funktionalitaet
	
	$('#ausblenden_button').click(function () {
		    unsetToken("clicktoken");
	});
		
	$('#submit_button').click(function () {
		    submitTokens();	
			setToken("neuer_baum", " ");	
	});


	// Butto ausgrauen wenn token button_redy nicht gesetzt
	defaultTokenModel.on('change:button_ready', function(model, newValue, options) {
		if (newValue) {
			$("#save_button :button").prop("disabled", false);
		}
		else {
			$("#save_button :button").prop("disabled", true);
		}
		}); 
		setToken("button_ready", "true");
		unsetToken("button_ready");
	
	$('#save_button').click(function () {
		    var question = "Soll die neue Hierachie die alte ersetzten?";
			showPopup("Nacharbeitshierarchie speichern", question, true, "Ja", save_as_lookup, "Nein", function() {});	
	});
	
	function save_as_lookup() {
		var sid_neuer_baum=getdefaultToken("sid_neuer_baum");		
		service.oneshotSearch("| loadjob " +  sid_neuer_baum + "| outputlookup fehlerkategorien ",{},function(err, results) {
			mvc.Components.getInstance("lookup").startSearch();
			document.getElementById('element1').scrollIntoView(); 

			});
			
		$("#myModal").modal("hide");
		}
	
	

    // Popup

	function showPopup(header, body, bool_button, button_text, button_function, info_text_button, cancel_function) {
		if (header) {
			$("#myModalLabel").html(header);
		}
		if (body) {
			$("#modal-body_content").html(body);
		}
		if (!bool_button) {
			$("#modal-save-btn").hide('fast');
			$("#modal-save-btn").unbind("click");
		} else {
			$("#modal-save-btn").text(button_text)
			$("#modal-save-btn").show('fast');
			$("#modal-save-btn").unbind("click");
			$("#modal-save-btn").click(button_function);
		}
		if (info_text_button) {
			$("#modal-cancel-btn").text(info_text_button);
		} else {
			$("#modal-cancel-btn").text('OK');
		}
		$("#modal-cancel-btn").unbind("click");
		$("#modal-cancel-btn").bind("click", cancel_function);

		$("#myModal").modal("show");
		$('#myModal').css('z-index', 9999);
		$("#myModal").css({
			"position": "",
			"left": "",
			"top": ""
		}); // CSS-Reset -> .css-Datei is prioritized
	}


});