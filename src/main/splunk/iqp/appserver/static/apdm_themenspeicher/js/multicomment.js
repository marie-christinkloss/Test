//# sourceURL=apdm_themenspeicher\js\multicomment.js

var deps = [
    "splunkjs/mvc",
    "jquery",
    "underscore",
    "splunkjs/mvc/utils",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/tableview",
    "splunkjs/ready!",
    "splunkjs/mvc/simplexml/ready!"
];

require(deps,function(mvc, $, _, utils, SearchManager, TableView){

    defaultTokenModel = mvc.Components.getInstance('default');
    submittedTokenModel = mvc.Components.getInstance('submitted');
    
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
  
    var selectedRows = [];
    mvc.Components.registerInstance("selectedRows",selectedRows);
    
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }
    
    function removeFromSelectedRows(unselectedRowString){
        var i = selectedRows.indexOf(unselectedRowString);
        if(i != -1) {
            selectedRows.splice(i, 1);
            console.info("row removed from selected rows array");
        }
        else {
            console.info("selectedRows-Array doesn't contain", unselectedRowString);
        }
        console.info("selected rows", selectedRows.length);
    };
    
    function addToSelectedRows(selectedRowString){
        // prüfen ob bereits enthalten
        var alreadyContains = selectedRows.contains(selectedRowString);
        if (!alreadyContains){
            selectedRows.push(selectedRowString);
            console.info("row added to selected rows array");
        }
        else {
            console.info("selectedRows-Array already contains", selectedRowString);
        }
        console.info("selected rows", selectedRows.length);
    };
    
    function commentSelectedRows() {
        if (selectedRows == null) {
            return;
        }
        console.info("# number of selected rows: ", selectedRows.length);
    
        if (selectedRows.length > 0) {
            var element4 = document.getElementById('element4');
            while (element4.firstChild) {
                element4.removeChild(element4.firstChild);
            }
    
            var table = document.createElement('table');
            table.style.width = '100%';
    
            var thead = document.createElement('thead');
            var tbody = document.createElement('tbody');
    
            table.appendChild(thead);
            table.appendChild(tbody);
    
            var trHead = document.createElement('tr');
            thead.appendChild(trHead);
    
            var th1 = document.createElement('th');
            var th2 = document.createElement('th');
            var th3 = document.createElement('th');
            var th4 = document.createElement('th');
            var th5 = document.createElement('th');
            var th6 = document.createElement('th');
    
            th1.appendChild(document.createTextNode("Prüfumfang"));
            th2.appendChild(document.createTextNode("Prüfling"));
            th3.appendChild(document.createTextNode("Prüfprozedur"));
            th4.appendChild(document.createTextNode("SGBD"));
            th5.appendChild(document.createTextNode("Error Code (Dec)"));
            th6.appendChild(document.createTextNode("Result Data"));
    
            trHead.appendChild(th1);
            trHead.appendChild(th2);
            trHead.appendChild(th3);
            trHead.appendChild(th4);
            trHead.appendChild(th5);
            trHead.appendChild(th6);
    
            for (var i = 0; i < selectedRows.length; i++) {
                var values = selectedRows[i].split(';');
                if (values.length > 0) {
                    var tr = document.createElement('tr');
                    var j = 0;
                    for (j; j < values.length; j++) {
                        var td = document.createElement('td');
                        td.appendChild(document.createTextNode(values[j]));
                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);
                } else {
                    console.info("# number of columns is 0");
                }
    
            }
            element4.appendChild(table);
            document.getElementById('element4').style.display = 'block';
            document.getElementById('element3').style.display = 'none';
            document.getElementById('exiting_comments').style.display = 'none';
    
            setToken("show_multi_comment_panel", true);
    
            $("div#comment_input_werk.iqp_comment input").val(getToken("com_user_werk"));
            $("div#comment_input_werk.iqp_comment input").attr('readonly', true);
            $("#add_et_modal").modal("toggle");
        } else {
            console.info("# number of rows is 0");
        }
    }
    
    
    
    function addCommentSelectedRowsButton(table_id, search_id) {
        // Intergriere ExcelLink
        var table_search = mvc.Components.getInstance(search_id);
        table_search.on("search:done", function() {
            $("#comment_selected_"+table_id).remove();
            var element = '<button disabled="disabled" style="display: inline-block; padding: 1px 3px; margin-bottom: 5px" class="btn btn-primary" id="comment_selected_'+table_id+'" data-original-title="Ausgewählte Zeilen kommentieren" title="Ausgewählte Zeilen kommentieren">Comment</button>';
            var button = $(element);
            button.click(commentSelectedRows);
            $("#"+table_id+" .view-results .refresh-button").after(button);
            button.tooltip();
            console.info("added 'comment selected rows' button");
        })
    }
    addCommentSelectedRowsButton("element1", "search1");

    
    function toggleCheckboxById(checkboxId, table_id) {
        console.info("toggle checkbox by id", checkboxId);
        var element = document.getElementById(checkboxId);
        console.info("toggle checkbox checked?: ", element.style.display == "none");
        if (element.style.display == "none") {
            element.style.display = "inline";
            addToSelectedRows(checkboxId);
        } else {
            element.style.display = "none";
            removeFromSelectedRows(checkboxId);
        }
        var buttonId = "comment_selected_" + table_id;
        var commentButton = document.getElementById(buttonId);
        if (commentButton != null) {
            commentButton.disabled = selectedRows.length === 0;
        }
    }
    
    // Use the BaseCellRenderer class to create a custom table cell renderer (checkbox)
    var CustomCheckBoxCellRenderer = TableView.BaseCellRenderer.extend({
        canRender : function (cellData) {
            return cellData.field === '  ' && cellData.value.length > 0;
        },
        render: function($td, cellData) {            
            $td.html('<label class="checkbox"><a href="#" data-name="splunk_web_service" class="btn"><i id="' + cellData.value + '" name="' + cellData.value + '" class="icon-check" style="display: none;"></i></a></label>');
            $td.on("click", function (e) {
                toggleCheckboxById(cellData.value, "element1");
            });
     }
    });
    
    var element1 = mvc.Components.getInstance("element1");
    element1.getVisualization(function (tableView) {
        tableView.table.addCellRenderer(new CustomCheckBoxCellRenderer());
        tableView.table.render();
    });
    
});



