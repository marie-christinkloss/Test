/************************************
 *Autor: Frank Effenberger
 *Datum: 15.02.2016
 *
 *Bemerkungen:
 *
 ************************************/

define(function (require, exports, module) {

	var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');

	function loadXMLDoc(filename) {
		if (window.ActiveXObject) {
			xhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} else {
			xhttp = new XMLHttpRequest();
		}
		xhttp.open("GET", filename, false);
		try {
			xhttp.responseType = "msxml-document"
		} catch (err) {}
		// Helping IE11
		xhttp.send("");
		return xhttp.responseXML;
	}

	var FehlerprotokollView = SimpleSplunkView.extend({
			className: "FehlerprotokollView",
			options: {
				data: "results"
			},
			createView: function () {
				return this;
			},

			//displayMessage : function (info) {},
			updateView: function (viz, data) {
				this.$el.html('');
				var xsl = loadXMLDoc("/static/app/iqp/apdm_fehlerhafte_testschritte/cascade_stylesheet_errorlog.xsl");
				for (var i = 0; i < data.length; i++) {
					var xmlstring = data[i][0];
					//remove closed "/" in testInfo 
					xmlstring = xmlstring.replace(/<testInfo(.*)\/>/g, "<testInfo$1>");
					//console.log(xmlstring);
					if (window.ActiveXObject || xhttp.responseType == "msxml-document") { // IF IE
						var ie_xml = new ActiveXObject("msxml2.DOMDocument.6.0");
						ie_xml.async = "false";
						ie_xml.loadXML(xmlstring);
						var ex = ie_xml.transformNode(xsl);
						this.$el.append(ex);
					} else if (document.implementation && document.implementation.createDocument) { // IF Other Browser
						var parser = new DOMParser();
						var xml = parser.parseFromString(xmlstring, "text/xml");
						var xsltProcessor = new XSLTProcessor();
						xsltProcessor.importStylesheet(xsl);
						var resultDocument = xsltProcessor.transformToFragment(xml, document);
						this.$el.append(resultDocument.querySelector('table'));
					}
				}
			},
		});
	return FehlerprotokollView;
});
