/*************************************
 * BMW WAS: Werkfilter               *
 * Autor: Frank Effenberger,         *
 *        Georg Schröder,            *
 *        Sven Kossack,              *
 *		  Moritz Brettschneider      *
 * Stand: 17.08.2017                 *
 * Anmerkungen:                      *
 *-Rolle iqp_user_muc und            *
 * iqp_user_reg müssen vergeben sein *
 *-lkup_werk_input muss existieren   *
 *************************************/


define(["splunkjs/mvc"], function (mvc) {
	function erstelleWerkfilter(input_id) {

		//console.log('dev werkfilter start');		

		// get input
		var input = splunkjs.mvc.Components.getInstance(input_id);
		//input.settings.attributes.default = "";
		input.render();

		/********* fülle Inputs ***********/
		if (typeof input.settings.attributes.choices == 'undefined') {
			input.settings.attributes.choices = [];
		}
		input.settings.attributes.choices.push({ "value": "*", "label": "Alle Werke" });

		// Search and search parameters
		var service = mvc.createService();
		var search_spl = "| inputlookup lkup_werk_input";
		var searchParams = { exec_mode: "blocking", earliest_time: "0" };

		// Run a blocking search and get back a job
		service.search(
			search_spl,
			searchParams,
			function (err, job) {

				// Get the job from the server to display more info
				job.fetch(function (err) {

					// Get the results and display them
					job.results({}, function (err, results) {

						var labelIdx = results.fields.indexOf("werk");
						var valueIdx = results.fields.indexOf("value");
						var rows = results.rows;
						for (var i = 0; i < rows.length; i++) {
							var values = rows[i];
							//console.log("Row " + i + ": ");

							input.settings.attributes.choices.push({ "value": values[valueIdx], "label": values[labelIdx] });
						}
						input.render();
					})
				});
			}
		);


		/******* set default plant ***********/

		// Only set default plant if the input is empty or still has the default value (* in most cases)
		var currentValue = JSON.stringify(input.val());
		var defaultValue = JSON.stringify(input.settings.attributes.default);
		if ( !!currentValue && currentValue!="[]" && currentValue!=defaultValue ) {
			return;
		}

		var role_service = mvc.createService();
		role_service.oneshotSearch(
			"| rest /services/authentication/current-context splunk_server=local | lookup lkup_werk_input werksrolle as roles OUTPUT value as werk | table werk | eval werk=mvindex(werk,0) | search werk=*",
			{},
			function (err, results) {
				if (results.rows[0]) {
					var current_users_plant = results.rows[0][results.fields.indexOf("werk")]
					input.val(current_users_plant);
				}
			}
		);
	}
	return erstelleWerkfilter;
})