//# sourceURL=fws_appender/js/appender.js

require.config({
    waitSeconds: 0
});

require([
    "splunkjs/mvc",
    "splunkjs/mvc/tokenutils",
    "splunkjs/mvc/tableview",
    "jquery",
    "underscore",
    "splunk.i18n",
    "../../app/iqp/splunkUtils",
    "../app/iqp/werkfilter_fnc",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    TokenUtils,
    TableView,
    $,
    _,
    i18n,
    splunkUtils,
    erstelleWerkfilter
) {
    console.log("Execute: appender.js");
    
    var defaultTokenModel = mvc.Components.getInstance('default');
    var submittedTokenModel = mvc.Components.getInstance('submitted');

    function setToken(name, value) {
        defaultTokenModel.set(name, value);
        submittedTokenModel.set(name, value);
    }

    function unsetToken(name) {
        defaultTokenModel.unset(name);
        submittedTokenModel.unset(name);
    }
    
    $("#addBtn").prop('disabled', true);
    $("#editBtn").prop('disabled', true);
    $("#rmBtn").prop('disabled', true);
    
    var defSelectOpt = ["Beanstandung durch fdP", "Schiefstand Kombi", "Schiefstand Lenkrad"];
    var selectOptions = "";
    
    defaultTokenModel.on("change:tok_exist_rn", function(model, value, options) {
        var count = 0;
        var selectOpt = defaultTokenModel.get('tok_exist_rn').split(","); 
        var tmpSelectOpt = defSelectOpt.filter(function(x) { 
            return selectOpt.indexOf(x) < 0;
        });
        selectOptions = "";
        console.log("tmpSelectOpt: " + tmpSelectOpt);
        tmpSelectOpt.forEach(function(elem) {
            selectOptions += '    <option value="' + elem + '">' + elem + '</option>\n'
            count += 1
        });
        if (count > 0) {
            $("#addBtn").prop('disabled', false);
        } else {
            $("#addBtn").prop('disabled', true);
        }
    });
    
    defaultTokenModel.on("change:tok_edit_man", function(model, value, options) {
        var tok_edit_man = defaultTokenModel.get('tok_edit_man');
        if (tok_edit_man === "1") {
            $("#editBtn").prop('disabled', false);
            $("#rmBtn").prop('disabled', false);
        } else {
            $("#editBtn").prop('disabled', true);
            $("#rmBtn").prop('disabled', true);
        }
    });
    
    var CustomRangeRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return _(['mark', 'id']).contains(cell.field);
        },
        render: function($td, cell) {
            var value = parseInt(cell.value);
            if (cell.field === 'mark' && cell.value > 0) {
                $td.addClass('markTestStep');
            }
            $td.addClass('invisible-cell');
            $td.text(value).addClass('numeric');
        }
    });
    mvc.Components.get('checkresults').getVisualization(function(tableView) {
        tableView.on('rendered', function() {
            tableView.$el.find('td.markTestStep').parent().addClass('markTestStep');
        });
        tableView.addCellRenderer(new CustomRangeRenderer());
    });
    
    var checkTable = mvc.Components.get("check");
    checkTable.on("click", function(e) {
        e.preventDefault();
        setToken("tok_click_src", e.data["row.source"].replace(/\\/g, "\\\\"));
        setToken("tok_click_testStand", e.data["row." + defaultTokenModel.get("i18n_Teststand")]);
        setToken("tok_click_testTime", e.data["row." + defaultTokenModel.get("i18n_Testzeit")]);
        setToken("tok_edit_id", 0);
        setToken("tok_edit_man", 0);
        setToken("tok_edit_resultName", "");
        setToken("tok_edit_value", "");
        setToken("tok_edit_unit", "");
        setToken("tok_exist_rn", "");
    });
    
    var checkTable = mvc.Components.get("checkresults");
    checkTable.on("click", function(e) {
        e.preventDefault();
        setToken("tok_edit_id", e.data["row.id"]);
        setToken("tok_edit_man", e.data["row." + defaultTokenModel.get("i18n_Manuell-Flag")]);
        setToken("tok_edit_resultName", e.data["row." + defaultTokenModel.get("i18n_Ergebnisname")]);
        setToken("tok_edit_value", e.data["row." + defaultTokenModel.get("i18n_Ergebniswert")]);
        setToken("tok_edit_unit", e.data["row." + defaultTokenModel.get("i18n_Einheit")]);
    });
    
    var exist_rn = mvc.Components.get("exist_rn");
    var res = exist_rn.data('results');
    res.on("data", function () {
        if (res.hasData()) {
            setToken("tok_exist_rn", res.data().rows[0].toString());
        }
    });
    
    /* 
     * Add Button
     */
    $("#addBtn").on("click", function() {
        var addPopupBody = createPopupBody("add");
        
        var resultNameVal = addPopupBody.find('#resultName').val();
        setInputForms(addPopupBody, resultNameVal);
        
        addPopupBody.find('#resultName').on("click", function() {
            var resultNameVal = $('#resultName').val();
            setInputForms(addPopupBody, resultNameVal);
        });
        
        var okBtn = $('<button type="button" class="btn" data-dismiss="modal">' + i18n._('OK') + '</button>');
        okBtn.on("click", function() {
            /*var paperFormat = document.getElementById("paperFormat");
            var paperFormatVal = paperFormat.options[paperFormat.selectedIndex].value;
            var paperOrientation = document.getElementById("paperOrientation");
            var paperOrientationVal = paperOrientation.options[paperOrientation.selectedIndex].value;
            var userPrintCommentVal = document.getElementById("userPrintCommentInput").value;*/
            
            var sourceVal = $('#source').val();
            var testStandVal = $('#testStand').val();
            var testTimeVal = $('#testTime').val();
            var shortVINVal = $('#shortVIN').val();
            var systemNameVal = $('#systemName').val();
            var pruefumfangNameVal = $('#pruefumfangName').val();
            var resultNameVal = $('#resultName').val();
            var preResultValue = '    resultValueDbl="';
            if ($('#resultValue').attr("type") === "text") {
                preResultValue = '    resultValueStr="';
            }
            var resultValueVal = $('#resultValue').val();
            var testStepResultUnitVal = $('#testStepResultUnit').val();
            
            var searchQuery = 
                '| inputlookup lkup_appended_teststepresults \n' +
                '| append [\n' +
                '  | makeresults \n' +
                '  | eval \n' +
                '    source="' + sourceVal + '",\n' +
                '    testStand="' + testStandVal + '",\n' +
                '    testTime="' + testTimeVal + '",\n' +
                '    editTime=now(),\n' +
                '    shortVIN="' + shortVINVal + '",\n' +
                '    systemName="' + systemNameVal + '",\n' +
                '    pruefumfangName="' + pruefumfangNameVal + '",\n' +
                '    resultName="' + resultNameVal + '",\n' +
                /*'    correctionValueDbl\n' +
                '    desiredValueDbl\n' +
                '    maxValueDbl\n' +
                '    minValueDbl\n' +*/
                preResultValue + resultValueVal + '",\n' +
                '    testStepResultUnit="' + testStepResultUnitVal + '",\n' +
                '    manFlag=1\n' +
                ']\n' +
                '| fields - _time\n' +
                '| outputlookup lkup_appended_teststepresults';
                
            
            var service = mvc.createService();
            var searchParams = {
                exec_mode: "blocking"
            };
            
            service.oneshotSearch(
                searchQuery,
                searchParams,
                function(err, results) {
                    mvc.Components.getInstance("tests").startSearch();
                }
            );
        });
        var cnlBtn = $('<button type="button" class="btn" data-dismiss="modal">' + i18n._('Abbrechen') + '</button>');
        var printPopupFooter = $('<div></div>').append(okBtn).append(cnlBtn);
        
        splunkUtils.showPopup(i18n._("Hinzufuegen"), addPopupBody, printPopupFooter);
    });
    
    /* 
     * Edit Button
     */
    $("#editBtn").on("click", function() {
        var editPopupBody = createPopupBody("edit");
        
        var resultNameVal = editPopupBody.find('#resultName').val();
        setInputForms(editPopupBody, resultNameVal);
            
        var okBtn = $('<button type="button" class="btn" data-dismiss="modal">' + i18n._('OK') + '</button>');
        okBtn.on("click", function() {
            /*var paperFormat = document.getElementById("paperFormat");
            var paperFormatVal = paperFormat.options[paperFormat.selectedIndex].value;
            var paperOrientation = document.getElementById("paperOrientation");
            var paperOrientationVal = paperOrientation.options[paperOrientation.selectedIndex].value;
            var userPrintCommentVal = document.getElementById("userPrintCommentInput").value;*/
            
            var sourceVal = $('#source').val();
            var testStandVal = $('#testStand').val();
            var testTimeVal = $('#testTime').val();
            var shortVINVal = $('#shortVIN').val();
            var systemNameVal = $('#systemName').val();
            var pruefumfangNameVal = $('#pruefumfangName').val();
            var resultNameVal = $('#resultName').val();
            var preResultValue = '    resultValueDbl=if(isEvent=1, "';
            if ($('#resultValue').attr("type") === "text") {
                preResultValue = '    resultValueStr=if(isEvent=1, "';
            }
            var resultValueVal = $('#resultValue').val();
            var testStepResultUnitVal = $('#testStepResultUnit').val();
            
            var searchQuery = 
                '| inputlookup lkup_appended_teststepresults \n' +
                '| eval \n' +
                '    isEvent=if( \n' +
                '      source="' + sourceVal + '" AND\n' +
                '      testStand="' + testStandVal + '" AND\n' +
                '      testTime="' + testTimeVal + '" AND\n' +
                '      shortVIN="' + shortVINVal + '" AND\n' +
                '      systemName="' + systemNameVal + '" AND\n' +
                '      pruefumfangName="' + pruefumfangNameVal + '" AND\n' +
                '      resultName="' + resultNameVal + '",\n' +
                '      1, 0)\n' +
                '| eval \n' + 
                '    editTime=if(isEvent=1, now(), editTime),\n' +
                preResultValue + resultValueVal + '", resultValueDbl),\n' +
                '    testStepResultUnit=if(isEvent=1, "' + testStepResultUnitVal + '", testStepResultUnit)\n' +
                '| fields - _time isEvent\n' +
                '| outputlookup lkup_appended_teststepresults';
                
            
            var service = mvc.createService();
            var searchParams = {
                exec_mode: "blocking"
            };
            
            //console.log(searchQuery);
            
            service.oneshotSearch(
                searchQuery,
                searchParams,
                function(err, results) {
                    mvc.Components.getInstance("tests").startSearch();
                }
            );
        });
        var cnlBtn = $('<button type="button" class="btn" data-dismiss="modal">' + i18n._('Abbrechen') + '</button>');
        var printPopupFooter = $('<div></div>').append(okBtn).append(cnlBtn);
        
        splunkUtils.showPopup(i18n._("Bearbeiten"), editPopupBody, printPopupFooter);
    });
    
    /* 
     * Remove Button
     */
    $("#rmBtn").on("click", function() {
        var rmPopupBody = createPopupBody("remove");
            
        var okBtn = $('<button type="button" class="btn" data-dismiss="modal">' + i18n._('OK') + '</button>');
        okBtn.on("click", function() {
            /*var paperFormat = document.getElementById("paperFormat");
            var paperFormatVal = paperFormat.options[paperFormat.selectedIndex].value;
            var paperOrientation = document.getElementById("paperOrientation");
            var paperOrientationVal = paperOrientation.options[paperOrientation.selectedIndex].value;
            var userPrintCommentVal = document.getElementById("userPrintCommentInput").value;*/
            
            var sourceVal = $('#source').val();
            var testStandVal = $('#testStand').val();
            var testTimeVal = $('#testTime').val();
            var shortVINVal = $('#shortVIN').val();
            var systemNameVal = $('#systemName').val();
            var pruefumfangNameVal = $('#pruefumfangName').val();
            var resultNameVal = $('#resultName').val();
            
            var searchQuery = 
                '| inputlookup lkup_appended_teststepresults \n' +
                '| eval \n' +
                '    isEvent=if( \n' +
                '      source="' + sourceVal + '" AND\n' +
                '      testStand="' + testStandVal + '" AND\n' +
                '      testTime="' + testTimeVal + '" AND\n' +
                '      shortVIN="' + shortVINVal + '" AND\n' +
                '      systemName="' + systemNameVal + '" AND\n' +
                '      pruefumfangName="' + pruefumfangNameVal + '" AND\n' +
                '      resultName="' + resultNameVal + '",\n' +
                '      1, 0)\n' +
                '| where isEvent=0 ' +
                '| fields - isEvent\n' +
                '| outputlookup lkup_appended_teststepresults';
                
            
            var service = mvc.createService();
            var searchParams = {
                exec_mode: "blocking"
            };
            
            //console.log(searchQuery);
            
            service.oneshotSearch(
                searchQuery,
                searchParams,
                function(err, results) {
                    mvc.Components.getInstance("tests").startSearch();
                }
            );
        });
        var cnlBtn = $('<button type="button" class="btn" data-dismiss="modal">' + i18n._('Abbrechen') + '</button>');
        var printPopupFooter = $('<div></div>').append(okBtn).append(cnlBtn);
        
        splunkUtils.showPopup(i18n._("Entfernen"), rmPopupBody, printPopupFooter);
    });
    
    function createPopupBody(mode) {
        var inputForm = '<input type="hidden" id="source" value="' + defaultTokenModel.get('tok_click_src') + '">\n' +
            '<input type="hidden" id="testStand" value="' + defaultTokenModel.get('tok_click_testStand') + '">\n' +
            '<input type="hidden" id="testTime" value="' + defaultTokenModel.get('tok_click_testTime') + '">\n' +
            '<label>' + i18n._('FGNR') + '</label>\n'+
            '<input type="text" id="shortVIN" value="' + defaultTokenModel.get('tok_shortVIN') + '" disabled />\n' +
            '<label>' + i18n._('Systemname') + '</label>\n' +
            '<input type="text" id="systemName" value="' + defaultTokenModel.get('tok_systemName') + '" disabled />\n' +
            '<label>' + i18n._('Pruefumfang') + '</label>\n' +
            '<input type="text" id="pruefumfangName" value="' + defaultTokenModel.get('tok_pruefumfangName') + '" disabled />\n' +
            '<label>' + i18n._('Ergebnisname') + '</label>\n';
            
        if (mode === "edit" || mode === "remove") {
            inputForm += '<input type="text" id="resultName" value="' + defaultTokenModel.get('tok_edit_resultName') + '" disabled />\n';
        } else {
            inputForm += '<select id="resultName">\n' +
                selectOptions +
                '</select>\n';
        }
        /*inputForm += '<label>Korrekturwert</label>\n' +
            '<input type="number" id="correctionValueDbl" step="0.01"></input>\n' +
            '<label>Sollwert</label>\n' +
            '<input type="number" id="desiredValueDbl" step="0.01"></input>\n' +
            '<label>Maximalwert</label>\n' +
            '<input type="number" id="maxValueDbl" step="0.01"></input>\n' +
            '<label>Minimalwert</label>\n' +
            '<input type="number" id="minValueDbl" step="0.01"></input>\n' +*/
            
        if (mode === "remove") {
            inputForm += '<label>' + i18n._('Ergebniswert') + '</label>\n' +
                '<input type="text" id="resultValue" value="' + defaultTokenModel.get('tok_edit_value') + '" disabled />\n' +
                '<label>' + i18n._('Einheit') + '</label>\n' +
                '<input type="text" id="testStepResultUnit" value="' + defaultTokenModel.get('tok_edit_unit') + '" disabled />';
        } else if (mode === "edit") {
            inputForm += '<label>' + i18n._('Ergebniswert') + '</label>\n' +
                '<input type="text" id="resultValue" value="' + defaultTokenModel.get('tok_edit_value') + '" />\n' +
                '<label>' + i18n._('Einheit') + '</label>\n' +
                '<input type="text" id="testStepResultUnit" value="' + defaultTokenModel.get('tok_edit_unit') + '" />';
        } else {
            inputForm += '<label>' + i18n._('Ergebniswert') + '</label>\n' +
                '<input type="text" id="resultValue" placeholder="" step="0.01" disabled />\n' +
                '<label>' + i18n._('Einheit') + '</label>\n' +
                '<input type="text" id="testStepResultUnit" step="0.01" disabled />';
        }
        
        var body = $('<div style="overflow-y: scroll;height: -webkit-fill-available;"></div>').append(
            inputForm
        );
        
        return body;
    }
    
    function setInputForms(body, resultNameVal) {
        console.log(resultNameVal);
        if (resultNameVal.match(/Schiefstand.*/)) {
            body.find('#resultValue').attr("type", "number");
            body.find('#resultValue').removeAttr("placeholder");
            body.find('#resultValue').prop('disabled', false);
            body.find('#testStepResultUnit').val("Grad");
            body.find('#testStepResultUnit').prop('disabled', false);
        } else if (resultNameVal === "Beanstandung durch fdP") {
            body.find('#resultValue').attr("type", "text");
            body.find('#resultValue').attr("placeholder", "ja oder nein");
            body.find('#resultValue').prop('disabled', false);
            body.find('#testStepResultUnit').val("");
            body.find('#testStepResultUnit').prop('disabled', true);
        } else {
            body.find('#resultValue').val("");
            body.find('#resultValue').prop('disabled', false);
            body.find('#testStepResultUnit').val("");
            body.find('#testStepResultUnit').prop('disabled', false);
        }
    }
    
    function waitOf(selector, maxTime, interval) {
        var ret = false;
        var inter = setInterval(function () {
            if($(selector).length) {
                ret = true;
                clearInterval(inter);
            } else {
                if (time > maxTime) {
                    clearInterval(inter);
                    return;
                }
                time += interval;
            }
        }, interval);
        return ret;
   }
    
    // erstelleWerkfilter
    erstelleWerkfilter( "input_werk" );
});