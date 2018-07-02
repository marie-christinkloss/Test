//# sourceURL=fws_k0_lagen/js/inputs.js

define([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "underscore",
    "jquery",
    "splunk.i18n",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/simpleform/formutils",
    "splunkjs/mvc/simpleform/input/timerange",
    "splunkjs/mvc/simpleform/input/multiselect",
    "splunkjs/mvc/simpleform/input/text",
    "splunkjs/mvc/simpleform/input/dropdown",
    "splunkjs/mvc/simpleform/input/submit",
    "./constants",
    "../../splunkUtils"
    
    // Add comma-separated libraries and modules manually here, for example:
    // ..."splunkjs/mvc/simplexml/urltokenmodel",
    // "splunkjs/mvc/tokenforwarder"
    ],
    function(
        mvc,
        utils,
        _,
        $,
        i18n,
		SearchManager,
        FormUtils,
        TimeRangeInput,
        MultiSelectInput,
        TextInput,
        DropdownInput,
        SubmitButton,
        constants,
        splunkUtils

        // Add comma-separated parameter names here, for example: 
        // ...UrlTokenModel, 
        // TokenForwarder
    ) {
        function getFilterTime(defaultTokenModel) {
            var filt_time = new TimeRangeInput({
                "id": "filt_time",
                "label": i18n._("Zeit"),
                "default": {
                    "latest_time": "now",
                    "earliest_time": "-7d@h"
                },
                "earliest_time": "$form.filt_time.earliest$",
                "latest_time": "$form.filt_time.latest$",
                "el": $('#filt_time')
            }, {
                tokens: true
            }).render();

            filt_time.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_time);
            });
            
            return filt_time;
        }


        function getFilterWerk(defaultTokenModel) {
            var filt_werk = new MultiSelectInput({
                "id": "filt_werk",
                "label": i18n._("Werk"),
				"choices": [],
                "delimiter": " OR ",
                "valuePrefix": "werk=",
                "value": "$form.werkfilter$",
                "el": $('#filt_werk')
            }, {
                tokens: true
            }).render();
            

            filt_werk.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_werk);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
			
            return filt_werk;
        }
		
        
        function getFilterChassis(defaultTokenModel) {
            var env_locale = defaultTokenModel.get("env_locale");
            console.log(env_locale)
            var filt_chassis_property = new MultiSelectInput({
                "id": "filt_chassis_property",
                "label": i18n._("Einstellung"),
                "choices": constants.chassis_choices,
                "default": ["*"],
                "valuePrefix": "resultName=",
                "delimiter": " OR ",
                "value": "$form.filt_chassis_property$",
                "el": $('#filt_chassis_property')
            }, {tokens: true}).render();

            filt_chassis_property.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_chassis_property);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    var tstatsTokenName = "tstats_" + this.options.name;
                    var tstatsTokenNameLinie = "tstats_" + this.options.name + "_linie";
                    var searchTokenName = "search_" + this.options.name;
                    var searchTokenNameLinie = "search_" + this.options.name + "_linie";
                    var tstatsTokenValue = "";
                    var tstatsTokenValueLinie = "";
                    var searchTokenValue = "";
                    var searchTokenValueLinie = "";
                    var valCounter = newValue.length - 1;
                    var filtChassis = "";
                    for (iter = 1; iter < constants.chassis_choices.length; iter++) {
                        var curLabel = constants.chassis_choices[iter]["rama"];
                        var curValue = constants.chassis_choices[iter]["value"];
                        var curLinie = constants.chassis_choices[iter]["linie"];
                        var curAlias = constants.chassis_choices[iter][env_locale] + constants.veSuffix[env_locale];
                        var histogram_chart = $('#' + constants.histogram_chart_div + curValue);
                        var soll_ist_chart = $('#' + constants.soll_ist_chart_div + curValue);
                        var cp_chart = $('#' + constants.cp_chart_div + curValue);
                        var cpk_chart = $('#' + constants.cpk_chart_div + curValue);
                        for (iter2=0; iter2 < newValue.length; iter2++) {
                            if (curValue==newValue[iter2] || newValue[iter2]=="*") {
                                filtChassis += '"' + curAlias + ' ' + constants.ramaSuffix[env_locale] + '" ';
                                if (histogram_chart.hasClass('hiddenChart')) {
                                    histogram_chart.removeClass('hiddenChart');
                                }
                                if (soll_ist_chart.hasClass('hiddenChart')) {
                                    soll_ist_chart.removeClass('hiddenChart');
                                }
                                if (cp_chart.hasClass('hiddenChart')) {
                                    cp_chart.removeClass('hiddenChart');
                                }
                                if (cpk_chart.hasClass('hiddenChart')) {
                                    cpk_chart.removeClass('hiddenChart');
                                }
                                if (newValue[iter2]=="*") {
                                    tstatsTokenValue += "Achse." + this.options.valuePrefix + "\"" + curLabel + "\"";
                                    tstatsTokenValueLinie += "Achse." + this.options.valuePrefix + "\"" + curLinie + "\"";
                                    searchTokenValue += this.options.valuePrefix + "\"" + curLabel + "\"";
                                    searchTokenValueLinie += this.options.valuePrefix + "\"" + curLinie + "\"";
                                    if(iter < constants.chassis_choices.length-1){
                                        tstatsTokenValue += this.options.delimiter;
                                        tstatsTokenValueLinie += this.options.delimiter;
                                        searchTokenValue += this.options.delimiter;
                                        searchTokenValueLinie += this.options.delimiter;
                                        valCounter--;
                                    }
                                } else if (curValue==newValue[iter2]) {
                                    tstatsTokenValue += "Achse." + this.options.valuePrefix + "\"" + curLabel + "\"";
                                    tstatsTokenValueLinie += "Achse." + this.options.valuePrefix + "\"" + curLinie + "\"";
                                    searchTokenValue += this.options.valuePrefix + "\"" + curLabel + "\"";
                                    searchTokenValueLinie += this.options.valuePrefix + "\"" + curLinie + "\"";
                                    if(0 < valCounter){
                                        tstatsTokenValue += this.options.delimiter;
                                        tstatsTokenValueLinie += this.options.delimiter;
                                        searchTokenValue += this.options.delimiter;
                                        searchTokenValueLinie += this.options.delimiter;
                                        valCounter--;
                                    }
                                }
                                break;
                            } else {
                                if (!histogram_chart.hasClass('hiddenChart')) {
                                    histogram_chart.addClass('hiddenChart');
                                }
                                if (!soll_ist_chart.hasClass('hiddenChart')) {
                                    soll_ist_chart.addClass('hiddenChart');
                                }
                                if (!cp_chart.hasClass('hiddenChart')) {
                                    cp_chart.addClass('hiddenChart');
                                }
                                if (!cpk_chart.hasClass('hiddenChart')) {
                                    cpk_chart.addClass('hiddenChart');
                                }
                            }
                        }
                    }
                    
                    console.log(tstatsTokenName + "| " + tstatsTokenValue);
                    console.log(tstatsTokenNameLinie + "| " + tstatsTokenValueLinie);
                    defaultTokenModel.set(tstatsTokenName, tstatsTokenValue);
                    defaultTokenModel.set(tstatsTokenNameLinie, tstatsTokenValueLinie);
                    defaultTokenModel.set(searchTokenName, searchTokenValue);
                    defaultTokenModel.set(searchTokenNameLinie, searchTokenValueLinie);
                    defaultTokenModel.set('chassis_choices_visible', filtChassis);
                }
            });
            
            return filt_chassis_property
        }
        
        function getFilterSpurCode(defaultTokenModel) {
            var filt_spurcode = new MultiSelectInput({
                "id": "filt_spurcode",
                "label": i18n._("Spurcode"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "wheelAlignmentCode=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "wheelAlignmentCode",
                "labelField": "spurcode",
                "value": "$form.filt_spurcode$",
                "managerid": "searchSpurCode",
                "el": $('#filt_spurcode')
            }, {tokens: true}).render();

            filt_spurcode.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_spurcode);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_spurcode;
        }
        
        function getFilterMaster(defaultTokenModel) {
            var filt_master = new DropdownInput({
                "id": "filt_master",
                "label": i18n._("Master"),
                "choices": [
                    {"label": "(1:n)", "value": "false()"},
                    {"label": "(1:1)", "value": "true()"}
                ],
                "selectFirstChoice": true,
                "value": "$form.filt_master$",
                "el": $('#filt_master')
            }, {tokens: true}).render();

            filt_master.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_master);
                
            });
            
            return filt_master;
        }
        
        function getFilterPruefstandRama(defaultTokenModel) {
            var filt_pruefstand_rama = new MultiSelectInput({
                "id": "filt_pruefstand_rama",
                "label": i18n._("Pruefstand"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "testStand=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "testStand",
                "labelField": "testStand",
                "value": "$form.filt_pruefstand_rama$",
                "managerid": "searchPruefStandRama",
                "el": $('#filt_pruefstand_rama')
            }, {tokens: true}).render();

            filt_pruefstand_rama.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_pruefstand_rama);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_pruefstand_rama;
        }
        
        function getFilterPruefstandLinie(defaultTokenModel) {
            var filt_pruefstand_linie = new MultiSelectInput({
                "id": "filt_pruefstand_linie",
                "label": i18n._("Pruefstand"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "testStand=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "testStand",
                "labelField": "testStand",
                "value": "$form.filt_pruefstand_linie$",
                "managerid": "searchPruefStandLinie",
                "el": $('#filt_pruefstand_linie')
            }, {tokens: true}).render();

            filt_pruefstand_linie.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_pruefstand_linie);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                    var tokenName = "check_pruefstand";
                    var tokenValue = "";
                    for (iter = 0; iter < newValue.length; iter++) {
                        tokenValue += "testStand==\"" + newValue[iter];
                        if (iter < newValue.length - 1) {
                            tokenValue += "\" OR ";
                        } else {
                            tokenValue += "\"";
                        }
                    }
                    defaultTokenModel.set(tokenName, tokenValue);
                }
            });
            
            return filt_pruefstand_linie;
        }
        
        function getFilterPruefumfangRama(defaultTokenModel) {
            var filt_pruefumfang_rama = new MultiSelectInput({
                "id": "filt_pruefumfang_rama",
                "label": i18n._("Pruefumfang"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "pruefumfangName=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "pruefumfangName",
                "labelField": "pruefumfangName",
                "value": "$form.filt_pruefumfang_rama$",
                "managerid": "searchPruefUmfangRama",
                "el": $('#filt_pruefumfang_rama')
            }, {tokens: true}).render();

            filt_pruefumfang_rama.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_pruefumfang_rama);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_pruefumfang_rama;
        }
        
        function getFilterPruefumfangLinie(defaultTokenModel) {
            var filt_pruefumfang_linie = new MultiSelectInput({
                "id": "filt_pruefumfang_linie",
                "label": i18n._("Pruefumfang"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "pruefumfangName=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "pruefumfangName",
                "labelField": "pruefumfangName",
                "value": "$form.filt_pruefumfang_linie$",
                "managerid": "searchPruefUmfangLinie",
                "el": $('#filt_pruefumfang_linie')
            }, {tokens: true}).render();

            filt_pruefumfang_linie.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_pruefumfang_linie);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_pruefumfang_linie;
        }
        
        function getFilterMessungsartRama(defaultTokenModel) {
            var filt_messungsart_rama = new MultiSelectInput({
                "id": "filt_messungsart_rama",
                "label": i18n._("Messungsart"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "measureType=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "measureType",
                "labelField": "measureType",
                "value": "$form.filt_messungsart_rama$",
                "managerid": "searchMeasureType",
                "el": $('#filt_messungsart_rama')
            }, {tokens: true}).render();

            filt_messungsart_rama.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_messungsart_rama);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_messungsart_rama;
        }
        
        function getFilterMessungsartLinie(defaultTokenModel) {
            var filt_messungsart_linie = new MultiSelectInput({
                "id": "filt_messungsart_linie",
                "label": i18n._("Messungsart"),
                "choices": [{
                    "label": "Alle",
                    "value": "*"
                }],
                "valuePrefix": "measureType=",
                "delimiter": " OR ",
                "default": ["*"],
                "valueField": "measureType",
                "labelField": "measureType",
                "value": "$form.filt_messungsart_linie$",
                "managerid": "searchMeasureType",
                "el": $('#filt_messungsart_linie')
            }, {tokens: true}).render();

            filt_messungsart_linie.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_messungsart_linie);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_messungsart_linie;
        }
        
        function getFilterReferenceCar(defaultTokenModel) {
            var filt_ref_car = new MultiSelectInput({
                "id": "filt_ref_car",
                "label": i18n._("Referenzmessung (IN_AUSWERTUNG)"),
                "valuePrefix": "resultValueStr=",
                "delimiter": " OR ",
                "default": ["true"],
                "valueField": "resultValueStr",
                "labelField": "resultValueStr",
                "value": "$form.filt_ref_car$",
                "managerid": "searchRefCarIdent",
                "el": $('#filt_ref_car')
            }, {tokens: true}).render();
            
            filt_ref_car.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_ref_car);
                var isNotFound = splunkUtils.handleAllOption(this, newValue, defaultTokenModel);

                if (isNotFound) {
                    splunkUtils.setNewMultiValueSearchToken(this, newValue, "Achse", defaultTokenModel);
                }
            });
            
            return filt_ref_car;
        }
        
        function getSubmitButton() {
            var submit = new SubmitButton({
                id: 'submit',
                el: $('#search_btn')
            }, {tokens: true}).render();
            
            submit.on("submit", function() {
                FormUtils.submitForm();
            });
        }
        
        function getFiterWarnungFaktorIst(defaultTokenModel) {
            var filt_warn_fkt_ist = new TextInput({
                "id": "filt_warn_fkt_ist",
                "searchWhenChanged": false,
                "default": "75",
                "value": "$form.filt_warn_fkt_ist$",
                "el": $('#filt_warn_fkt_ist')
            }, {tokens: true}).render();

            filt_warn_fkt_ist.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_warn_fkt_ist);
            });
            
            $("[id^=filt_warn_fkt_ist]")
            .attr('type','number')
            .attr('min','0')
            .attr('max','100')
            .attr('step','0.1');
            
            return filt_warn_fkt_ist;
        }
        
        function getFiterEingriffFaktorIst(defaultTokenModel) {
            var filt_eing_fkt_ist = new TextInput({
                "id": "filt_eing_fkt_ist",
                "searchWhenChanged": false,
                "default": "90",
                "value": "$form.filt_eing_fkt_ist$",
                "el": $('#filt_eing_fkt_ist')
            }, {tokens: true}).render();

            filt_eing_fkt_ist.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_eing_fkt_ist);
            });
            
            $("[id^=filt_eing_fkt_ist]")
            .attr('type','number')
            .attr('min','0')
            .attr('max','100')
            .attr('step','0.1');
            
            return filt_eing_fkt_ist;
        }
        
        function getIstSubmitButton(submittedTokenModel) {
            var submit_idx = new SubmitButton({
                id: 'submitIst',
                el: $('#submit_ist_btn')
            }, {tokens: true}).render();
            
            submit_idx.on("submit", function() {
                submittedTokenModel.set("form.filt_warn_fkt_ist", mvc.Components.getInstance("filt_warn_fkt_ist").val());
                submittedTokenModel.set("form.filt_eing_fkt_ist", mvc.Components.getInstance("filt_eing_fkt_ist").val());
            });
        }
        
        function getFiterWarnungFaktorIdx(defaultTokenModel) {
            var filt_warn_fkt_idx = new TextInput({
                "id": "filt_warn_fkt_idx",
                "searchWhenChanged": false,
                "default": "1.33",
                "value": "$form.filt_warn_fkt_idx$",
                "el": $('#filt_warn_fkt_idx')
            }, {tokens: true}).render();

            filt_warn_fkt_idx.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_warn_fkt_idx);
            });
            
            $("[id^=filt_warn_fkt_idx]")
            .attr('type','number')
            .attr('min','0')
            .attr('max','5')
            .attr('step','0.01');
            
            return filt_warn_fkt_idx;
        }
        
        function getFiterEingriffFaktorIdx(defaultTokenModel) {
            var filt_eing_fkt_idx = new TextInput({
                "id": "filt_eing_fkt_idx",
                "searchWhenChanged": false,
                "default": "1",
                "value": "$form.filt_eing_fkt_idx$",
                "el": $('#filt_eing_fkt_idx')
            }, {tokens: true}).render();

            filt_eing_fkt_idx.on("change", function(newValue) {
                FormUtils.handleValueChange(filt_eing_fkt_idx);
            });
            
            $("[id^=filt_eing_fkt_idx]")
            .attr('type','number')
            .attr('min','0')
            .attr('max','5')
            .attr('step','0.01');
            
            return filt_eing_fkt_idx;
        }
        
        function getIdxSubmitButton(submittedTokenModel) {
            var submit_idx = new SubmitButton({
                id: 'submitIdx',
                el: $('#submit_idx_btn')
            }, {tokens: true}).render();
            
            submit_idx.on("submit", function() {
                submittedTokenModel.set("form.filt_warn_fkt_idx", mvc.Components.getInstance("filt_warn_fkt_idx").val());
                submittedTokenModel.set("form.filt_eing_fkt_idx", mvc.Components.getInstance("filt_eing_fkt_idx").val());
            });
        }
    
        var inputs = {
            getFilterTime : getFilterTime,
            getFilterWerk : getFilterWerk,
            getFilterChassis : getFilterChassis,
            getFilterSpurCode : getFilterSpurCode,
            getFilterPruefstandRama : getFilterPruefstandRama,
            getFilterPruefstandLinie : getFilterPruefstandLinie,
            getFilterPruefumfangRama : getFilterPruefumfangRama,
            getFilterPruefumfangLinie : getFilterPruefumfangLinie,
            getFilterMessungsartRama : getFilterMessungsartRama,
            getFilterMessungsartLinie : getFilterMessungsartLinie,
            getFilterReferenceCar : getFilterReferenceCar,
            getSubmitButton : getSubmitButton,
            getFiterWarnungFaktorIst : getFiterWarnungFaktorIst,
            getFiterEingriffFaktorIst : getFiterEingriffFaktorIst,
            getIstSubmitButton : getIstSubmitButton,
            getFiterWarnungFaktorIdx : getFiterWarnungFaktorIdx,
            getFiterEingriffFaktorIdx : getFiterEingriffFaktorIdx,
            getIdxSubmitButton : getIdxSubmitButton,
            getFilterMaster : getFilterMaster
        }
        
        return inputs;
    }
);