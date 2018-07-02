//# sourceURL=db_uebersicht.js
require([
		"splunkjs/mvc",
		"splunkjs/mvc/tableview",
		"splunkjs/mvc/utils",
		"splunkjs/mvc/tokenutils",
        "splunk.i18n",
		"../app/iqp/splunkUtils",
		"../app/iqp/werkfilter_fnc",
		"splunkjs/ready!",
		"splunkjs/mvc/simplexml/ready!"
	],
	function(
		mvc,
		TableView,
		utils,
		TokenUtils,
        i18n,
        splunkUtils,
		erstelleWerkfilter
	) {
		var submittedTokenModel = mvc.Components.getInstance("submitted");
		var defaultTokenModel = mvc.Components.getInstance("default");
        
        // Button zur naeheren Analyse des Fahrzeugs einbinden
		var FzgAnalyseButtonCellRenderer = TableView.BaseCellRenderer.extend({
				canRender: function(cellData) {
					return ([' '].indexOf(cellData.field) >= 0);
				},
				render: function($td, cellData) {
					if (cellData.value) {
						$td.addClass('string');
						$td.html('<button class="btn btn fzg_analyse_button" style="width: 90px;">' + i18n._("Analyse") + '</button>');
						$td.on("click", function(e) {
							e.preventDefault();
						});
						$td.children(".fzg_analyse_button").on("click", function(e) {
							var url=TokenUtils.replaceTokenNames(
								"d2_apdm_dtc_analyse_ceasar_in_splunk_fahrzeug?"
								+"shortVIN="+cellData.value
								+"&el=$TimeRangeFilter.earliest$"
								+"&la=$TimeRangeFilter.latest$"
								,submittedTokenModel.toJSON());
							if (url) {
								utils.redirect(url, newWindow = true);
							} else {
								console.err("Could not build url to redirect to.");
							}
						});
					} else {
						$td.addClass('string');
					}
				}
		});
		var table_vehicle_selection = mvc.Components.getInstance('table_vehicle_selection');
		var input_filt_shortVIN = mvc.Components.getInstance('input_filt_shortVIN');
		table_vehicle_selection.getVisualization(function(tableView) {
			tableView.table.addCellRenderer(new FzgAnalyseButtonCellRenderer());
			tableView.table.render();
		});
        
        // Bei Klick in eine Reihe der Fahrzeugtabelle wird die shortVIN dem Input für die Schnittmengenbildung hinzugefügt
		table_vehicle_selection.on("click", function (e) {
			if ((e.field !== undefined )) {
				e.preventDefault();

				if (input_filt_shortVIN.val() === null) {
					console.warn("input_filt_shortVIN ist NULL");
				} else {
					var vins = input_filt_shortVIN.val();

					vins.push(TokenUtils.replaceTokenNames("$row." + defaultTokenModel.get("i18n_shortVIN") + "$", e.data));

					input_filt_shortVIN.val(vins);
					input_filt_shortVIN.render();

				}
			}
		});

		// Button zur naeheren Analyse des DTCs einbinden
		var DtcAnalyseButtonCellRenderer = TableView.BaseCellRenderer.extend({
				canRender: function(cellData) {
					return ([' '].indexOf(cellData.field) >= 0);
				},
				render: function($td, cellData) {
                    console.log("render");
					if (cellData.value) {
						$td.addClass('string');
						$td.html('<button class="btn btn dtc_analyse_button" style="width: 90px;">' + i18n._("Analyse") + '</button>');
						$td.on("click", function(e) {
							e.preventDefault();
						});
						$td.children(".dtc_analyse_button").on("click", function(e) { 
							var url=TokenUtils.replaceTokenNames(
								"d2_apdm_dtc_analyse_ceasar_in_splunk_dtc?"
								+"dtc="+cellData.value
								+"&el=$TimeRangeFilter.earliest$"
								+"&la=$TimeRangeFilter.latest$"
								+"&countryVariant=$countryVariant|u$"
								+"&werkfilter=$werkfilter|u$"
								+"&shortvin=$shortvin|u$"
								+"&integrationLevel=$integrationLevel|u$"
								+"&series=$series|u$"
								+"&saCode=$saCode|u$"
								+"&dtcSGBD=$dtcSGBD|u$"
								+"&dtcCode=$dtcCode|u$"
								,submittedTokenModel.toJSON());
							if (url) {
								utils.redirect(url, newWindow = true);
							} else {
								console.err("Could not build url to redirect to.");
							}
						});
					} else {
						$td.addClass('string');
					}
				}
		});
		var table_dtc_selection = mvc.Components.getInstance('table_dtc_selection');
		table_dtc_selection.getVisualization(function(tableView) {
			tableView.table.addCellRenderer(new DtcAnalyseButtonCellRenderer());
			tableView.table.render();
		});

        // Die Option Alle in den Filtern sollte verschwinden, sobald der erste andere Wert ausgewählt wurde
        mvc.Components.getInstance("werkinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("shortvininput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("countryVariantinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("ilevelinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("seriesinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("sacodeinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("sgbdinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
        mvc.Components.getInstance("dtcinput").on("change", function(newValue) {splunkUtils.handleAllOption(this, newValue, defaultTokenModel)});
		
		// erstelleWerkfilter
		erstelleWerkfilter( "werkinput" );
		
		//verstecke technisches dropdown für filt_dtc
		$('#input_filt_dtc').hide();
		
	});