//# sourceURL=apdm_themenspeicher\js\comment.js

require([
        "splunkjs/mvc",
        "splunkjs/mvc/utils",
        "splunkjs/mvc/tokenutils",
        "underscore",
        "jquery",
        "splunk.i18n",
        "splunkjs/mvc/simplexml",
        "splunkjs/mvc/headerview",
        "splunkjs/mvc/footerview",
        "splunkjs/mvc/simplexml/dashboardview",
        "splunkjs/mvc/simplexml/dashboard/panelref",
        "splunkjs/mvc/simplexml/element/chart",
        "splunkjs/mvc/simplexml/element/event",
        "splunkjs/mvc/simplexml/element/html",
        "splunkjs/mvc/simplexml/element/list",
        "splunkjs/mvc/simplexml/element/map",
        "splunkjs/mvc/simplexml/element/single",
        "splunkjs/mvc/simplexml/element/table",
        "../app/iqp/DockedTableView/DockedTableElement",
        "splunkjs/mvc/simpleform/formutils",
        "splunkjs/mvc/simplexml/eventhandler",
        "splunkjs/mvc/simpleform/input/dropdown",
        "splunkjs/mvc/simpleform/input/radiogroup",
        "splunkjs/mvc/simpleform/input/multiselect",
        "splunkjs/mvc/simpleform/input/checkboxgroup",
        "splunkjs/mvc/simpleform/input/text",
        "splunkjs/mvc/simpleform/input/timerange",
        "splunkjs/mvc/simpleform/input/submit",
        "splunkjs/mvc/searchmanager",
        "splunkjs/mvc/savedsearchmanager",
        "splunkjs/mvc/postprocessmanager",
        "splunkjs/mvc/simplexml/urltokenmodel",
        "../app/iqp/excel_export_fnc",
        "../app/iqp/splunkUtils",
        "splunkjs/mvc/tableview"
        // Add comma-separated libraries and modules manually here, for example:
        // ..."splunkjs/mvc/simplexml/urltokenmodel",
        // "splunkjs/mvc/checkboxview"
    ],
    function (
        mvc,
        utils,
        TokenUtils,
        _,
        $,
        i18n,
        DashboardController,
        HeaderView,
        FooterView,
        Dashboard,
        PanelRef,
        ChartElement,
        EventElement,
        HtmlElement,
        ListElement,
        MapElement,
        SingleElement,
        TableElement,
        DockedTableElement,
        FormUtils,
        EventHandler,
        DropdownInput,
        RadioGroupInput,
        MultiSelectInput,
        CheckboxGroupInput,
        TextInput,
        TimeRangeInput,
        SubmitButton,
        SearchManager,
        SavedSearchManager,
        PostProcessManager,
        UrlTokenModel,
        excel_export,
        splunkUtils,
        TableView

        // Add comma-separated parameter names here, for example:
        // ...UrlTokenModel,
        // CheckboxView
    ) {
    
    /* Beginn Kommentarfunktionalität*/
    //
    // SUBMIT FORM DATA
    //// Create token namespaces
    var urlTokenModel = mvc.Components.getInstance('url');
    var defaultTokenModel = mvc.Components.getInstance('default', {
            create : true
        });
    var submittedTokenModel = mvc.Components.getInstance('submitted', {
            create : true
        });

    // Initialize tokens
    defaultTokenModel.set(urlTokenModel.toJSON());
    
    function setToken(name, value) {
        defaultTokenModel.set(name, value);
        submittedTokenModel.set(name, value);
    }
    
    function unsetToken(name) {
        defaultTokenModel.unset(name);
        submittedTokenModel.unset(name);
    }
    
    function getToken(name) {
        var t = defaultTokenModel.get(name);
        if (t == null) {
            t = submittedTokenModel.get(name);
        }
        return t;
    }
    
    function submitTokens() {
        // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
        FormUtils.submitForm({
            replaceState : false
        });
    }
    
    // Translation
    var i18n_Wiedervorlage = i18n._("Wiedervorlage");
    var i18n_Wiedervorlage_KW = i18n._("Wiedervorlage KW");
    var i18n_Kommentar_Werk = i18n._("Kommentar Werk");
    var i18n_Link = i18n._("Link");
    var i18n_Kommentar_Datum = i18n._("Kommentar Datum");
    var i18n_Kommentar_User = i18n._("Kommentar User");
    var i18n_Notizen = i18n._("Notizen");
    var i18n_PQM_QC = i18n._("PQM/QC");
    var i18n_Verantwortlich = i18n._("Verantwortlich");
    var i18n_Status = i18n._("Status");
    var i18n_pruefumfang = i18n._("Pruefumfang");
    var i18n_Pruefling = i18n._("Pruefling");
    var i18n_Pruefprozedur = i18n._("Pruefprozedur");
    var i18n_SGBD = i18n._("SGBD");
    var i18n_Error_Code_Dec = i18n._("Error Code (Dec)");
    var i18n_Result_Data = i18n._("Result Data");
    var i18n_gueltig_fuer_werk = i18n._("gueltig fuer Werk");
    var i18n_loeschen = i18n._("Loeschen");
    var i18n_bearbeiten = i18n._("Bearbeiten");

    var search_comments = new SearchManager({
        "id" : "search_comments",
        "search" : 
            '| inputlookup lkup_thsp_notes \n' +
            '| search ' +
            '  pruefumfangName="$com_pruefumfangName$" \n' +
            '  testStepName="$com_testStepName$" \n'+
            '  description="$com_description$" \n' +
            '  param1="$com_param1$" \n' + 
            '  ErrorCodeDec="$com_ErrorCodeDec$" \n' +
            '  resultData="$com_resultData$" \n' +
            '| eval " "=_key \n' +
            '| table pqm_qc notes responsible status kommentar_datum kommentar_user kommentar_werk kommentar_wiedervorlage kommentar_wiedervorlage_kw link " " \n' + 
            '| rename \n' +
            '  kommentar_datum AS "' + i18n_Kommentar_Datum            + '" \n' +
            '  kommentar_user AS "' + i18n_Kommentar_User + '" \n' +
            '  kommentar_werk AS "' + i18n_Kommentar_Werk + '" \n' +
            '  notes as "' + i18n_Notizen + '", pqm_qc as "' + i18n_PQM_QC + '" \n' +
            '  responsible as "' + i18n_Verantwortlich + '" \n' +
            '  kommentar_wiedervorlage as "' + i18n_Wiedervorlage + '" \n' +
            '  kommentar_wiedervorlage_kw as "' + i18n_Wiedervorlage_KW + '" \n' +
            '  status as "' + i18n_Status + '"' +
            '  link as "' + i18n_Link + '"',
        "latest_time": "",
        "earliest_time": "0",
        "status_buckets": 0,
        "sample_ratio": null,
        "cancelOnUnload": true,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": false,
        "runWhenTimeIsUndefined": true
    }, {
        tokens : true,
        tokenNamespace: "default"
    });
        
    var search1 = mvc.Components.getInstance('search1');
    
    var exiting_comments = new TableView({
        "id": "exiting_comments",
        "count": "10",
        "managerid": "search_comments",
        "drilldown": "none",
        "el": $('#exiting_comments')
    }, {
        tokens: true, 
        tokenNamespace: "default"
    }).render();
    
    var CustomButtonCellRenderer = TableView.BaseCellRenderer.extend({
        canRender : function (cellData) {
            return ([' ', '  '].indexOf(cellData.field) >= 0);
        },
        render : function ($td, cellData) {
            if (cellData.value) {
                $td.addClass('string');
                $td.html('<button class="btn btn-primary delete_comment">' + i18n_loeschen + '</button> <button class="btn btn-primary edit_comment">' + i18n_bearbeiten + '</button>');
                $td.on("click", function (e) {
                    e.preventDefault();
                });
                $td.children(".delete_comment").on("click", function () {
                    delete_comment(cellData.value);
                });
                $td.children(".edit_comment").on("click", function () {
                    edit_comment(cellData.value);
                });
            } else {
                $td.addClass('string');
            }
        }
    });
    
    // Create an instance of the custom cell renderer
    var myCellRenderer = new CustomButtonCellRenderer();

    // Add the custom cell renderer to the table
    exiting_comments.addCellRenderer(myCellRenderer); 

    // Render the table
    exiting_comments.render();
    
    var comment_submit_btn = new SubmitButton({
            id : 'submit',
            el : $('#comment_submit_btn')
        }, {
            tokens : true
        }).render();

    comment_submit_btn.on("submit", function () {
        submitTokens();
        // Get the value of the key ID field

        var com_key = getToken("com_key");

        var form_pruefumfangName = getToken("com_pruefumfangName");
        var form_testStepName = getToken("com_testStepName");
        var form_description = getToken("com_description");
        var form_param1 = getToken("com_param1");
        var form_ErrorCodeDec = getToken("com_ErrorCodeDec");
        var form_resultData = getToken("com_resultData");

        var form_pqm_qc = getToken("com_pqm_qc");
        var form_notes = getToken("com_notes");
        var form_responsible = getToken("com_responsible");
        var form_resubmission = getToken("com_resubmission");
        var form_resubmission_cw = getToken("com_resubmission_cw");
        var form_status = getToken("com_status");
        var form_link = getToken("com_link");
        var form_kommentar_werk = getToken("com_user_werk");
        var form_kommentar_user = getToken("com_user_username");

        // Es dürfen nicht alle Felder leer gelassen werden
        if (form_pqm_qc === "" && form_notes === "" && form_responsible === "" && form_status === "" && form_link === "") {
            $('#comment_err_all_fields_empty').modal('show');

            $(".close_modal").click(function () {
                $("#comment_err_all_fields_empty").modal('hide')
            });
            return;
        }
        
        if (form_resubmission === "") {
            form_resubmission="-";
            form_resubmission_cw="-";
        }
        // Create a dictionary to store the field names and values
        var comment_date = getToken("edit_com_date");
        if (!comment_date) {
            var d = new Date(new Date());
            var comment_date = d.getFullYear().toString() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
            /*
            Datum mit Uhrzeit
            var comment_date = d.getFullYear().toString()+"-"+("0" + (d.getMonth()+1)).slice (-2)+"-"+("0" +  d.getDate() ).slice (-2)+" "+("0" +  d.getHours()  ).slice (-2)+":"+("0" +  d.getMinutes()).slice (-2)+":"+("0" +  d.getSeconds()).slice (-2);
             */
        }

        var show_multi_comment_panel = getToken("show_multi_comment_panel");
        console.info("show_multi_comment_panel", show_multi_comment_panel);

        //reset the fields
        setToken("com_pqm_qc", "");
        setToken("form.com_pqm_qc", "");
        setToken("com_notes", "");
        setToken("form.com_notes", "");
        setToken("com_responsible", "");
        setToken("form.com_responsible", "");
        setToken("com_resubmission", "");
        setToken("form.com_resubmission", "");
        setToken("com_resubmission_cw", "");
        setToken("form.com_resubmission_cw", "");
        setToken("com_status", "");
        setToken("form.com_status", "");
        setToken("com_link", "");
        setToken("form.com_link", "");

        // set heading back to "Create Comment"
        $("#iqp_comment_section .panel-head h3").html("Kommentar hinzuf&uuml;gen");

        if (show_multi_comment_panel) {
            var selectedRows = mvc.Components.getInstance("selectedRows");
            if (selectedRows.length > 0) {
                for (var i = 0; i < selectedRows.length; i++) {
                    console.info("comment for row ", selectedRows[i]);

                    var doneCounter = 0;
                    var values = selectedRows[i].split(';');
                    if (values.length > 0 && values.length > 5) {
                        var record = {
                            "pruefumfangName" : values[0],
                            "testStepName" : values[1],
                            "description" : values[2],
                            "param1" : values[3],
                            "ErrorCodeDec" : values[4],
                            "resultData" : values[5],

                            "pqm_qc" : form_pqm_qc,
                            "notes" : form_notes,
                            "responsible" : form_responsible,
                            "kommentar_wiedervorlage" : form_resubmission,
                            "kommentar_wiedervorlage_kw" : form_resubmission_cw,
                            "status" : form_status,
                            "link" : form_link,
                            "kommentar_werk" : form_kommentar_werk,
                            "kommentar_user" : form_kommentar_user,
                            "kommentar_datum" : comment_date
                        };
                        var service = mvc.createService({
                                owner : "nobody"
                            });
                        service.request(
                            "storage/collections/data/thsp_notes/",
                            "POST",
                            null,
                            null,
                            JSON.stringify(record), {
                            "Content-Type" : "application/json"
                        },
                            null).done(function () {
                            doneCounter++;
                            if (doneCounter == selectedRows.length) {
                                selectedRows = [];
                                // Run the search again to update the table
                                search1.startSearch();
                                //console.info("search_comments", search_comments);
                                unsetToken("edit_com_date");
                                unsetToken("com_key");

                                // delete cancel button
                                $("#cancel_btn").remove();

                                $(".close_modal").click(function () {
                                    $(this).parents(".modal").modal('hide')
                                });
                                $('#comment_ok_message').modal('show');
                            }
                        });
                    }
                }
                return false;
            } else {
                return;
            }
        }
        $(".close_modal").click(function () {
            $("#comment_ok_message").modal('hide')
        });

        var record = {
            "pruefumfangName" : form_pruefumfangName,
            "testStepName" : form_testStepName,
            "description" : form_description,
            "param1" : form_param1,
            "ErrorCodeDec" : form_ErrorCodeDec,
            "resultData" : form_resultData,
            "pqm_qc" : form_pqm_qc,
            "notes" : form_notes,
            "responsible" : form_responsible,
            "kommentar_wiedervorlage" : form_resubmission,
            "kommentar_wiedervorlage_kw" : form_resubmission_cw,
            "status" : form_status,
            "link" : form_link,
            "kommentar_werk" : form_kommentar_werk,
            "kommentar_user" : form_kommentar_user,
            "kommentar_datum" : comment_date
        };

        // Create a service object using the Splunk SDK for JavaScript
        // to send REST requests
        var service = mvc.createService({
                owner : "nobody"
            });

        if (com_key && com_key != "") {
            // update the comment
            service.request(
                "storage/collections/data/thsp_notes/" + com_key,
                "POST",
                null,
                null,
                JSON.stringify(record), {
                "Content-Type" : "application/json"
            },
                null).done(function () {
                // Run the search again to update the table
                search1.startSearch();
                search_comments.startSearch();

                $('#comment_ok_message').modal('show');
            });
            unsetToken("edit_com_date");
            unsetToken("com_key");

            // delete cancel button
            $("#cancel_btn").remove();
            $('#comment_ok_message').modal('show');
        } else {
            // Use the request method to send a REST POST request
            // to the storage/collections/data/{collection}/ endpoint
            service.request(
                "storage/collections/data/thsp_notes/",
                "POST",
                null,
                null,
                JSON.stringify(record), {
                "Content-Type" : "application/json"
            },
                null).done(function () {
                // Run the search again to update the table
                search1.startSearch();
                search_comments.startSearch();

                $('#comment_ok_message').modal('show');
            });

        }
    });

    //$(".close_modal").click(function() {
    //    $(this).parents(".modal").modal('hide')
    //});

    //
    // DELETE BUTTON
    //

    // Call this function when the Delete Record button is clicked
    var kv_service = mvc.createService({
            owner : "nobody"
        });
    $("#comment_all_delete_btn").click(function () {
        // Get the value of the key ID field

        var form_pruefumfangName = getToken("com_pruefumfangName");
        var form_testStepName = getToken("com_testStepName");
        var form_description = getToken("com_description");
        var form_param1 = getToken("com_param1");
        var form_ErrorCodeDec = getToken("com_ErrorCodeDec");
        var form_resultData = getToken("com_resultData");
        var form_kommentar_werk = getToken("com_user_werk");

        //reset the fields
        setToken("com_pqm_qc", "");
        setToken("com_notes", "");
        setToken("com_responsible", "");
        setToken("com_resubmission", "");
        setToken("com_status", "");
        setToken("com_link", "");

        var show_multi_comment_panel = getToken("show_multi_comment_panel");
        console.info("show_multi_comment_panel", show_multi_comment_panel);

        if (show_multi_comment_panel) {
            var selectedRows = mvc.Components.getInstance("selectedRows");
            if (selectedRows.length > 0) {
                for (var i = 0; i < selectedRows.length; i++) {
                    console.info("comment for row ", selectedRows[i]);

                    var doneCounter = 0;
                    var values = selectedRows[i].split(';');
                    if (values.length > 0 && values.length > 5) {
                        // Create a dictionary to store the field names and values
                        var record = {
                            "pruefumfangName" : values[0],
                            "testStepName" : values[1],
                            "description" : values[2],
                            "param1" : values[3],
                            "ErrorCodeDec" : values[4],
                            "resultData" : values[5],
                            "kommentar_werk" : form_kommentar_werk
                        };

                        var query = {
                            "query" : JSON.stringify(record)
                        };
                        //console.info("query: ", query);
                        kv_service.get("storage/collections/data/thsp_notes", query).done(function (data) {
                            var entries = JSON.parse(data);
                            //console.info("entries: ", entries);
                            for (i in entries) {
                                var key = entries[i]._key;
                                console.info("key: ", key)
                                if (key != null) {
                                    kv_service.del("storage/collections/data/thsp_notes/" + key);
                                }

                            }
                            doneCounter++;
                            if (doneCounter == selectedRows.length) {
                                selectedRows = [];
                                // Run the search again to update the table
                                search1.startSearch();

                                $(".close_modal").click(function () {
                                    $(this).parents(".modal").modal('hide')
                                });
                                $('#comment_delete_ok_message').modal('show');
                            }

                        });
                    }
                }
                // delete cancel button
                $("#cancel_btn").remove();
                return false;
            } else {
                return;
            }
        }

        $(".close_modal").click(function () {
            $("#comment_delete_ok_message").modal('hide')
        });

        // Create a dictionary to store the field names and values
        var record = {
            "pruefumfangName" : form_pruefumfangName,
            "testStepName" : form_testStepName,
            "description" : form_description,
            "param1" : form_param1,
            "ErrorCodeDec" : form_ErrorCodeDec,
            "resultData" : form_resultData,
            "kommentar_werk" : form_kommentar_werk
        };

        // delete cancel button
        $("#cancel_btn").remove();

        var query = {
            "query" : JSON.stringify(record)
        };
        kv_service.get("storage/collections/data/thsp_notes", query).done(function (data) {
            var entries = JSON.parse(data);
            //console.log(entries);
            for (i in entries) {
                var key = entries[i]._key;
                //console.log(key)
                if (key != null) {
                    kv_service.del("storage/collections/data/thsp_notes/" + key);
                }

            }
            // Run the search again to update the table
            search1.startSearch();
            search_comments.startSearch();

            $('#comment_delete_ok_message').modal('show');
        });
        return false;
    });

    function cancel_btn_click() {
        //reset the fields
        setToken("com_pqm_qc", "");
        setToken("form.com_pqm_qc", "");
        setToken("com_notes", "");
        setToken("form.com_notes", "");
        setToken("com_responsible", "");
        setToken("form.com_responsible", "");
        setToken("com_resubmission", "");
        setToken("form.com_resubmission", "");
        setToken("com_resubmission_cw", "");
        setToken("form.com_resubmission_cw", "");
        setToken("com_status", "");
        setToken("form.com_status", "");
        setToken("com_link", "");
        setToken("form.com_link", "");
        unsetToken("edit_com_date");

        // delete cancel button
        $("#cancel_btn").remove()

        // change panel header
        $("#iqp_comment_section .panel-head h3").html("Kommentar hinzuf&uuml;gen");

        unsetToken("com_key")
    };

    function delete_comment(key) {
        kv_service.del("storage/collections/data/thsp_notes/" + key);
        search1.startSearch();
        search_comments.startSearch();
    }
    function edit_comment(key) {
        var old_key = getToken("com_key")

            setToken("com_key", key);

        if (!old_key) {
            // change panel header
            $("#iqp_comment_section .panel-head h3").html("Kommentar bearbeiten");

            // add cancel button
            $("#comment_submit_btn").after("<div id=\"cancel_btn\" class=\"form-submit iqp_comment\"><button class=\"btn btn-primary submit\" style=\"margin-bottom: 8px; margin-left: 3px;\">Abbrechen</button></div>")
            $("#cancel_btn").click(cancel_btn_click);
        }

        // fill the form
        kv_service.get("storage/collections/data/thsp_notes/" + key).done(function (data) {
            var entries = JSON.parse(data);
            setToken("form.com_pqm_qc", entries.pqm_qc);
            setToken("form.com_notes", entries.notes);
            setToken("form.com_responsible", entries.responsible);
            setToken("form.com_resubmission", entries.kommentar_wiedervorlage);
            setToken("form.com_resubmission_cw", entries.kommentar_wiedervorlage_kw);
            setToken("form.com_status", entries.status);
            setToken("form.com_link", entries.link);
            setToken("edit_com_date", entries.kommentar_datum);
        });

    }
    
    var comment_input_pqm_qc = new TextInput({
            "id" : "comment_input_pqm_qc",
            "label" : i18n_PQM_QC,
            "value" : "$form.com_pqm_qc$",
            "el" : $('#comment_input_pqm_qc')
        }, {
            tokens : true
        }).render();

    comment_input_pqm_qc.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_pqm_qc);
    });

    var comment_input_note = new TextInput({
            "id" : "comment_input_note",
            "label" : i18n_Notizen,
            "value" : "$form.com_notes$",
            "el" : $('#comment_input_note')
        }, {
            tokens : true
        }).render();

    comment_input_note.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_note);
    });

    var comment_input_responsible = new TextInput({
            "id" : "comment_input_responsible",
            "label" : i18n_Verantwortlich,
            "value" : "$form.com_responsible$",
            "el" : $('#comment_input_responsible')
        }, {
            tokens : true
        }).render();

    comment_input_responsible.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_responsible);
    });

    var comment_input_resubmission = new TextInput({
            "id" : "comment_input_resubmission",
            "label" : i18n_Wiedervorlage,
            "value" : "$form.com_resubmission$",
            "el" : $('#comment_input_resubmission')
        }, {
            tokens : true
        }).render();

    comment_input_resubmission.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_resubmission);
        var selectedDate = $("#comment_input_resubmission > div > input").datepicker("getDate");
        if (selectedDate == null) {
            $("#comment_input_resubmission_cw > div > input").val("");
        } else {
            setToken("form.com_resubmission_cw", $.datepicker.iso8601Week(selectedDate));
        }
    });
    
    $("#comment_input_resubmission > div > input").datepicker({dateFormat: "yy-mm-dd"});

    var comment_input_resubmission_cw = new TextInput({
            "id" : "comment_input_resubmission_cw",
            "label" : i18n_Wiedervorlage_KW,
            "value" : "$form.com_resubmission_cw$",
            "el" : $('#comment_input_resubmission_cw')
        }, {
            tokens : true
        }).render();

    comment_input_resubmission_cw.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_resubmission_cw);
    });
    
    $("#comment_input_resubmission_cw > div > input").attr('readonly', true);

    var comment_input_status = new TextInput({
            "id" : "comment_input_status",
            "label" : i18n_Status,
            "value" : "$form.com_status$",
            "el" : $('#comment_input_status')
        }, {
            tokens : true
        }).render();

    comment_input_status.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_status);
    });

    var comment_input_link = new TextInput({
            "id" : "comment_input_link",
            "label" : i18n_Link,
            "value" : "$form.com_link$",
            "el" : $('#comment_input_link')
        }, {
            tokens : true
        }).render();

    comment_input_link.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_link);
    });

    var comment_input_werk = new TextInput({
            "id" : "comment_input_werk",
            "label" : i18n_gueltig_fuer_werk,
            "value" : "$form.comment_input_werk$",
            "el" : $('#comment_input_werk')
        }, {
            tokens : true
        }).render();

    comment_input_werk.on("change", function (newValue) {
        FormUtils.handleValueChange(comment_input_werk);
    });

    
    /* Ende Kommentarfunktionalität*/
});