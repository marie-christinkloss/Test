//# sourceURL=splunkUtils.js

define([
    "splunkjs/mvc", 
    "jquery", 
    "splunkjs/mvc/utils", 
    "splunkjs/mvc/tokenutils"
    ], function(
        mvc, 
        $, 
        utils, 
        TokenUtils
    ) {
        
        /**
         * @author: Stobi (Add by Sven Kossack)
         * 
         */
        function setNewMultiValueSearchToken(input, newValue, tstats_prefix, defaultTokenModel) {
            setNewMultiValueSearchToken2(input, newValue, tstats_prefix, defaultTokenModel, false);
        }
		
		
        /**
         * @author: Stobi (Add by Sven Kossack); erweitert durch Moritz
         * weiterer Tokenpräfix für mehrmalige Nutzung
         */
        function setNewMultiValueSearchToken2(input, newValue, tstats_prefix, defaultTokenModel, tokenNamePraefix) {
            var tokenPre = "";
            if (tokenNamePraefix) {
                tokenPre = tokenNamePraefix+"_";
            }
            var searchTokenName = "search_"+tokenPre+input.options.name;
            var searchTokenValue = "";
            var tstatsTokenName = "tstats_"+tokenPre+input.options.name;
            var tstatsTokenValue = "";

            var change = false;
            if(newValue.length==1){
                if(newValue[0]!="*"){
                    change = true;
                }else{
                    searchTokenValue = input.options.valuePrefix + "\"*\"";
                    tstatsTokenValue = tstats_prefix + "." + input.options.valuePrefix + "\"*\"";
                }
            }else if(newValue.length>1){
                change = true;
            }
            
            if(change){
                for(var i = 0;i<newValue.length;i++){
                    searchTokenValue += input.options.valuePrefix+"\""+newValue[i]+"\"";
                    tstatsTokenValue += tstats_prefix + "."+input.options.valuePrefix+"\""+newValue[i]+"\"";
                    if(i<newValue.length-1){
                        searchTokenValue += input.options.delimiter;
                        tstatsTokenValue += input.options.delimiter;
                    }
                }
            } 
            
            console.log(searchTokenName +"| "+searchTokenValue);
            console.log(tstatsTokenName +"| "+tstatsTokenValue);
            defaultTokenModel.set(searchTokenName,searchTokenValue);
            defaultTokenModel.set(tstatsTokenName,tstatsTokenValue);
        }
        
		
        
        /**
         * @author: Unknown (Add by Sven Kossack)
         * Handle the "all"-option of a multi-value-input of splunk
         * - "all"-option is selected -> other options are hide
         * - other-option is selected -> "all"-option is hide
         * 
         * Following code can used:
         * <multiselection-input>.on("change", function(newValue) {
         * ...
         *     var isAllNotFound = splunkUtils.handleAllOption(this, newValue);
         *     if (isAllNotFound) { ... }
         * });
         * 
         * @param: 
         * @return:
         *  return false if "all" option is selected else true
         */
        function handleAllOption(input, value, defaultTokenModel) {
            var ret = true;
            var token = input.settings.attributes.token
            var index = value.indexOf("*");
            var last_index = value.length - 1;
            if (index > -1 && last_index > 0) {
                var newValue = value.slice();
                if (index == last_index) {
                    newValue = ["*"];
                    ret = false;
                } else {
                    newValue.splice(index, 1);
                    ret = false;
                }
                console.log("handleAllOption 1");
                defaultTokenModel.set("form." + token, newValue);
                console.log("handleAllOption 2");
            }
            return ret;
        }
        
        /**
         * @author: Unknown (Add by Sven Kossack)
         * Add a button for a sliding panel.
         * You should add follwing css-code on your dashboard (<panel_name> replace with your panel id):
         *   #<panel_name> .fieldset.splunk-view.editable.hide-label.hidden.empty {
         *       display: none !important;
         *   }
         *   .panel-title > #hide_button {
         *       display: inline;
         *       position: absolute;
         *       right: 20px;
         *       padding: 3px;
         *       top: 6px;
         *   }
         */
        function setSlideTogglePanel(panelDivID, addFunc){
            require(['jquery', 'splunkjs/mvc/simplexml/ready!'], function($) {
                $("#" + panelDivID + " .panel-title").append(
                    "<button class=\"btn\" id=\"hide_button\">" +
                    "<span class=\"icon-chevron-up\"></span>" +
                    "</button>"
                );
                $("#" + panelDivID + " .dashboard-panel").css("min-height","0px");
                $("#" + panelDivID + " #hide_button").on("click", function() {
                    $("#" + panelDivID + " h2").nextAll().slideToggle();
                    $("#" + panelDivID + " #hide_button span").toggleClass("icon-chevron-up");
                    $("#" + panelDivID + " #hide_button span").toggleClass("icon-chevron-down");
                });
                $("#" + panelDivID + " #hide_button").on("click", addFunc);
                $("#" + panelDivID + " h2").nextAll().slideToggle();
                $("#" + panelDivID + " #hide_button span").toggleClass("icon-chevron-up");
                $("#" + panelDivID + " #hide_button span").toggleClass("icon-chevron-down");
            });
        }
        
        function excelExportSearchManager(table_id, search_id) {
            //var tokens = mvc.Components.getInstance("default");
            //var sTokens = mvc.Components.getInstance("submitted");
            
            var excel_table_search = mvc.Components.getInstance(search_id);
            excel_table_search.on("search:done", function() {
                setExcelButton(table_id, "");
                $("#excel_link_" + table_id + " .icon-excel").on("click", function() { 
                    var url = "/custom/excel_export/excel/" + excel_table_search.job.sid;
                    utils.redirect(url);
                });
            })
        }
        
        /**
         *
         *
         */
        function excelExportPostProcess(table_id, base_search_id, post_process_ids, submittedTokenModel) {
            
            var service = mvc.createService();
            
            var base_search = mvc.Components.getInstance(base_search_id);
            base_search.on("search:done", function() {
                setExcelButton(table_id, "");
                
                var isActive = false;
                
                $("#excel_link_" + table_id + " > .icon-excel").on("click", function() { 
                    if (isActive) {
                        return;
                    } else {
                        isActive = true;
                        $("#excel_link_" + table_id).addClass("disabled");
                        /*$("#excel_link_" + table_id).tooltip('hide')
                                .attr('data-original-title', "Bitte warten Excel-Datei wird generiert!")
                                .tooltip('fixTitle')
                                .tooltip('show');*/
                        $("#excel_link_" + table_id + " > .hide-text").innerHTML = "Bitte warten Excel-Datei wird generiert!";
                    }
                    var sid = base_search.job.sid
                    var searchQuery = "| loadjob " + sid ;
                    var searchParams = {exec_mode: "blocking"};
                    for (iter = 0; iter<post_process_ids.length; iter++) {
                        var pp_search = mvc.Components.get(post_process_ids[iter]);
                        var post_process = TokenUtils.replaceTokenNames(pp_search.attributes.search, submittedTokenModel.toJSON());
                        
                        searchQuery += " | " + post_process;
                    }
                    
                    searchQuery = searchQuery.replace(/\s*\|\s*\|\s*/g, " | ");
                    console.log("sQ:" + searchQuery)
                    service.search(searchQuery, searchParams,
                        function(err, job) {
                            var url = "/custom/excel_export/excel/" + job.sid;
                            utils.redirect(url);
                            $("#excel_link_" + table_id).removeClass("disabled");
                            /*$("#excel_link_" + table_id).tooltip('hide')
                                .attr('data-original-title', "Excel-Export")
                                .tooltip('fixTitle')
                                .tooltip('show');*/
                            $("#excel_link_" + table_id + " > .hide-text").innerHTML = "Excel-Export";
                        }
                    );
                    
                    isActive = false;
                });
            });
        }
        
        /**
         *
         */
        function setExcelButton(table_id, buttonClassName) {
            
            $("#excel_link_" + table_id).remove();
            element=
                '<a id="excel_link_' + table_id + '" title="" class="excel_link inspect-button btn-pill ' + buttonClassName + '" style="display: inline-block;" data-original-title="Excel-Export">' +
                '  <i class="icon-excel" />' +
                '  <span class="hide-text">Excel-Export</span>' +
                '</a>';
            $("#" + table_id + " .view-results .refresh-button").after(element);
            $("#excel_link_"+table_id).tooltip();
        }
        
        /**
         * @author: Georg Schröder
         * Show a modal popup with the given contents on the page.
         */
        function showPopup(title, body, footer) {
            var popupElem=$('<div/>', {id: 'myModal',class: 'modal fade',tabindex: '-1',role: 'dialog','aria-labelledby': 'myModalLabel'});
            var modalDialog=$('<div/>', {class: 'modal-dialog',role: 'document'}).appendTo(popupElem);
            var modalContent=$('<div/>', {class: 'modal-content'}).appendTo(modalDialog);
            var modalHeader=$('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&amp;times;</span></button></div>').appendTo(modalContent);
            var modalBody=$('<div/>', {class: 'modal-body'}).appendTo(modalContent);
            var modalFooter=$('<div/>', {class: 'modal-footer'}).appendTo(modalContent);
            if (title) {
                $('<h4 class="modal-title" id="myModalLabel"></h4>').html(title).appendTo(modalHeader);
            }
            if (body) {
                modalBody.html(body);
            }
            if (footer) {
                modalFooter.html(footer);
            }
    
            popupElem.modal("show");
            
            popupElem.on('hidden', function () {
                popupElem.remove();
            });
        }
        
        var splunkUtils = {
            setNewMultiValueSearchToken : setNewMultiValueSearchToken,
            setNewMultiValueSearchToken2 : setNewMultiValueSearchToken2,
            handleAllOption : handleAllOption,
            setSlideTogglePanel : setSlideTogglePanel,
            excelExportSearchManager : excelExportSearchManager,
            excelExportPostProcess : excelExportPostProcess,
            showPopup : showPopup
        }
        
        return splunkUtils;
    }
);