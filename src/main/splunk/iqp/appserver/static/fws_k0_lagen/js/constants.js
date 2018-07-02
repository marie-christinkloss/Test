//# sourceURL=fws_k0_lagen/js/constants.js

define(["splunkjs/mvc", "jquery"],function(mvc, $) {
    
        function createChassisChoices(elem) {
            var evt = $.Event('chassisChoicesCreated');
            var defaultTokenModel = mvc.Components.getInstance('default');
            var env_locale = defaultTokenModel.get("env_locale");
            var choices = {};
            var service = mvc.createService();
            
            var searchQuery = "| inputlookup lkup_ko_lagen";
            var searchParams = {
                exec_mode: "blocking"
            };
            
            // A blocking search returns the job's SID when the search is done
            console.log("Wait for the search to finish...");

            // Run a blocking search and get back a job
            service.oneshotSearch(
                searchQuery,
                searchParams,
                function(err, results) {
                    console.log("...done!\n");
                    
                    var f_topic = results.fields.indexOf("topic");
                    var f_resultName = results.fields.indexOf("resultName");
                    var f_label = results.fields.indexOf(env_locale);
                    var f_alias_de = results.fields.indexOf("alias_de");
                    var f_alias_en = results.fields.indexOf("alias_en");
                    var f_sortNr = results.fields.indexOf("sortNr");
                    var rows = results.rows;
                    
                    for(var i = 0; i < rows.length; i++) {
                        var topic = rows[i][f_topic];
                        if (!(rows[i][f_sortNr] in choices)) {
                            choices[rows[i][f_sortNr]] = {};
                        }
                        if (topic == "rama") {
                            choices[rows[i][f_sortNr]][topic] = rows[i][f_resultName];
                            choices[rows[i][f_sortNr]]["value"] = rows[i][f_sortNr];
                        } else if (topic == "linie") {
                            choices[rows[i][f_sortNr]]["label"] = rows[i][f_label];
                            choices[rows[i][f_sortNr]]["alias_de"] = rows[i][f_alias_de];
                            choices[rows[i][f_sortNr]]["alias_en"] = rows[i][f_alias_en];
                            choices[rows[i][f_sortNr]][topic] = rows[i][f_resultName];
                        }
                    }
            
                    chassis_choices.push({ 
                        "rama": "",
                        "value": "*",
                        "alias_de": "Alle",
                        "alias_en": "All",
                        "linie": ""
                    });
                    
                    chassis_choices[0]["label"] = chassis_choices[0][env_locale];
                    
                    for (var key in choices){
                        chassis_choices.push(choices[key]);
                    }
                    evt.state = "done";
                    console.log("trigger event");
                    elem.trigger(evt);
                    console.log("trigger event2");
                }
            );
        }
        
        // Options of chassis settings
        var chassis_choices = [/*
            {
                "rama": "Alle",
                "value": "*",
                "label": "Alle",
                "alias_en": "All",
                "linie": ""
            }, {
                "rama": "Gesamtspur vorne vor Einstellung",
                "value": "1",
                "label": "G-Spur VA",
                "alias_en": "total toe FA",
                "linie": "Gesamtspur vorne"
            }, {
                "rama": "Gesamtspur hinten vor Einstellung",
                "value": "2",
                "label": "G-Spur HA",
                "alias_en": "total toe RA",
                "linie": "Gesamtspur hinten"
            }, {
                "rama": "Fahrachswinkel vor Einstellung",
                "value": "3",
                "label": "FA-Winkel",
                "alias_en": "grap angle",
                "linie": "Fahrachswinkel"
            }, {
                "rama": "Sturz vorne links vor Einstellung",
                "value": "4",
                "label": "Sturz VL",
                "alias_en": "chamber FL",
                "linie": "Sturz vorne links"
            }, {
                "rama": "Sturz vorne rechts vor Einstellung",
                "value": "5",
                "label": "Sturz VR",
                "alias_en": "chamber FR",
                "linie": "Sturz vorne rechts"
            }, {
                "rama": "Sturzdifferenz vorne vor Einstellung",
                "value": "6",
                "label": "Sturzdifferenz VA",
                "alias_en": "chamber-different FA",
                "linie": "Sturzdifferenz vorne"
            }, {
                "rama": "Sturz hinten links vor Einstellung",
                "value": "7",
                "label": "Sturz HL",
                "alias_en": "chamber RL",
                "linie": "Sturz hinten links"
            }, {
                "rama": "Sturz hinten rechts vor Einstellung",
                "value": "8",
                "label": "Sturz HR",
                "alias_en": "chamber RR",
                "linie": "Sturz hinten rechts"
            }, {
                "rama": "Sturzdifferenz hinten vor Einstellung",
                "value": "9",
                "label": "Sturzdifferenz HA",
                "alias_en": "chamber-different RA",
                "linie": "Sturzdifferenz hinten"
            }, {
                "rama": "Spur vorne links vor Einstellung",
                "value": "10",
                "label": "Spur VL",
                "alias_en": "toe FL",
                "linie": "Spur vorne links"
            }, {
                "rama": "Spur vorne rechts vor Einstellung",
                "value": "11",
                "label": "Spur VR",
                "alias_en": "toe FR",
                "linie": "Spur vorne rechts"
            }, {
                "rama": "Spur hinten links vor Einstellung",
                "value": "12",
                "label": "Spur HL",
                "alias_en": "toe RL",
                "linie": "Spur hinten links"
            }, {
                "rama": "Spur hinten rechts vor Einstellung",
                "value": "13",
                "label": "Spur HR",
                "alias_en": "toe RR",
                "linie": "Spur hinten rechts"
            }*/
        ];
        
        var diagram_choices = [
            {
                "label": "Alle",
                "value": "*",
                "key" : ""
            }, {
                "label": "Histogramm",
                "value": "panel_histogramm",
                "key" : "is_histogram_visible"
            }, {
                "label": "Soll-Ist-Vergleich",
                "value": "panel_soll_ist",
                "key" : "is_soll_ist_visible"
            }, {
                "label": "CP-CPK",
                "value": "panel_cp_cpk",
                "key" : "is_cp_cpk_visible"
            }
        ];
        
        var ramaSuffix = {
            "alias_de" : "ist_RAMA",
            "alias_en" : "is_RAMA"
        };
        
        var linieSuffix = {
            "alias_de" : "ist_Linie",
            "alias_en" : "is_Line"
        };
        
        var istSuffix = {
            "alias_de" : " (Ist-Wert)",
            "alias_en" : " (act value)"
        };
        
        var istSollSuffix = {
            "alias_de" : " (Ist-Soll)",
            "alias_en" : " (act-des)"
        };
        
        var veSuffix = {
            "alias_de" : " VE",
            "alias_en" : " BA"
        };
        
        //div Name
        var histogram_chart_div = "histogram_chart_";
        var soll_ist_chart_div = "soll_ist_chart_";
        var cp_chart_div = "cp_chart_";
        var cpk_chart_div = "cpk_chart_";
        
        var constants = {
            createChassisChoices : createChassisChoices,
            chassis_choices : chassis_choices,
            diagram_choices : diagram_choices,
            ramaSuffix : ramaSuffix,
            linieSuffix : linieSuffix,
            istSuffix : istSuffix,
            istSollSuffix : istSollSuffix,
            veSuffix : veSuffix,
            histogram_chart_div : histogram_chart_div,
            soll_ist_chart_div : soll_ist_chart_div,
            cp_chart_div : cp_chart_div,
            cpk_chart_div : cpk_chart_div
        }
        
        return constants;
    }
);