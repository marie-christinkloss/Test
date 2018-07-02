<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:bmw="http://bmw.com/standardResultData">

<!-- **********************************************************************************************
 *
 *  Project:                ResultData XML Parser / Slylesheet fuer Fehlerprotokolle
 *
 *  Customer:               BMW (Regensburg)
 *  Contact person:         Mr.Buecherl, Michael (Abteilung TI-536)
 *
 *  Module Name:            cascade_stylesheet_errorlog.xsl
 *  Description:            XML/XSL Stylesheet zur Darstellung bearbeiteter Pruefstandsprotokolle
 *                          im XML Format in Tabellenform als HTML im Browser.
 *
 *  Operating System:       Windows Explorer, BMW Protokollviewer "Fehlerprotokoll", Outlook Mail
 *  Development System:     Windows XP, Internet Explorer 6.0 mit sp3, Fehlerprotokoll 3.4,
 *                          Outlook Express 6.0, Outlook 2003
 *
 *  Originator:             rd electronic GmbH, Germany, 2012
 *  Version:                1.0.1.0
 *
 *  Revision list:
 *  27.01.2012  1.0.1.0  MBa  Divs und Style "float" entfernt und durch Tabllen ersetzt um
 *                            Outlook (2003) kompatibel zu sein.
 *  27.01.2012  1.0.0.0  MBa  Erste offizielle Release-Version.
 *
 **************************************************************************************************

	Explanations / Hints:

     - Die folgenden XML-Attribute werden im Script ausgewertet:
        fileInfo:    systemName, softwareVersion
        vehicleInfo: shortVIN, FZS, typeKey
        testInfo:    pruefumfangName, testVersion, testStand, testTime, editor, complete
        result:      testStepResult, testStepName, description, param1, param2, param3,
		             resultValueStr, resultName, resultValueDbl, resultName, minValueStr,
					 maxValueStr, minValueDbl, maxValueDbl, instructionText, adviseText, errorText
     - Die folgenden (bekannten) XML-Attribute von "result" werden nicht beruecksichtigt:
        resultID, resultType, sequenceNrResult, prueflingName, pruefprozedurName, toolName,
		retryCount, errorType, testStepDuration
     - Fuer die Tabelleneintraege "Nacharbeit" und "PU-Autor" steht keine passende Quelle im
	   XML-File zur Verfuegung.
	 - Es duerfen keine zentralen HTML-Style-Eintraege (text/css) enthalten sein, weil diese
	   beim Kopiervorgang in Outlook (von Outlook) entfernt werden.
	 - Ausgegebene Texte enthalten deutsche Umlaute. Im XML gibt es jedoch keine HTML-Entities
	   (z.B. &uuml;). Die Umlaute muessen deshalb in der richtigen Kodierung angegeben sein.
	 - Zusaeztliche '' innerhalb der "" muessen und duerfen nur bei den Style-Definitionen
	   bei xsl:param stehen. Die Wirkung der restlichen "" ist nicht zu sehen, weill der IE
	   bereits beim Einlesen den HTML-Text ueberarbeitet (u.A. verschwindet die Einheit "px".
	 - Outlook Express fuegt im Editiermodus bei den oeberen Tabellen zuaetzliche Eingabezeilen
	   hinzu. Dient anscheinend nur zum Editieren, es steht nichts auffaelliges im HTML-Code.
	 - Im Gegensatz zu Outlook Express, dass alle zentralen css Styles entfernt, fuegt
	   Outlook 2003 eine umfassende Sammlung eigener Styles hinzu (scheinbar MS-Office
	   aehnlich). Ob es auch Styles uebernehmen wuerde ist unklar (nicht rueckgebaut).
	 - Der css-Style "float" darf nicht vorkommen, weil Outlook (2003) diesen nicht unterstuetzt.

 ********************************************************************************************** -->

<!-- Variablen zum zentralen Ersatz bestimmter Passagen -->
<xsl:variable name="nbsp">&#160;</xsl:variable>
<xsl:variable name="title">Fehlerprotokoll</xsl:variable>

<!-- Parameter zur begrenzung der Anzeigebreite, muss gesetzt werden. Fuer volle Breite im Table-Tag der aeussersten Tabelle width="100%" setzen -->
<xsl:param name="style-width_control"       select="'width:700px'"></xsl:param>

<!-- Parameter zur Angabe der Styles fuer die verschiedenen Tabellenelemente -->
<xsl:param name="style-body"                select="'font-family:Arial; font-size:10pt'"></xsl:param>
<xsl:param name="style-table_master"        select="'border-width:2px; border-style:solid; border-color:black; font-family:Arial; font-size:10pt'"></xsl:param>
<xsl:param name="style-table_subs"          select="'border-color:gray; font-family:Arial; font-size:10pt'"></xsl:param>
<xsl:param name="style-colour_red_dark"     select="'color:#C00000'"></xsl:param>
<xsl:param name="style-font_big_bold"       select="'font-family:Arial; font-size:16pt'"></xsl:param>
<!-- Tabelleformatierung fuer Haeder Div 1 -->
<xsl:param name="style-header1_left_desc"   select="'width:100px'"></xsl:param>
<xsl:param name="style-header1_left_cont"   select="'width:40%'"></xsl:param>
<xsl:param name="style-header1_right_desc"  select="'width:50px'"></xsl:param>
<xsl:param name="style-header1_right_cont"  select="''"></xsl:param>
<!-- Tabelleformatierung fuer Haeder Div 2 -->
<xsl:param name="style-header2_left_desc"   select="'width:100px'"></xsl:param>
<xsl:param name="style-header2_left_cont"   select="'width:40%'"></xsl:param>
<xsl:param name="style-header2_right_desc"  select="'width:75px'"></xsl:param>
<xsl:param name="style-header2_right_cont"  select="''"></xsl:param>
<!-- Tabelleformatierung fuer Liste -->
<xsl:param name="style-list_left_desc"      select="'width:75px'"></xsl:param>
<xsl:param name="style-list_left_cont"      select="'width:40%'"></xsl:param>
<xsl:param name="style-list_right_desc"     select="'width:30px'"></xsl:param>
<xsl:param name="style-list_right_cont"     select="''"></xsl:param>

<!-- Beginn der HTML Seite / xsl:template -->
<xsl:template match="/">
<html>
	<head>
		<title><xsl:value-of select="$title" /></title>
	</head>
	<body style="{$style-body}">
		<!-- Grosser Rahmen um alles, das Attribute width="100%" wuerde auf volle breite ausdehnen -->
		<table border="1" style="{$style-table_master}" cellpadding="10px" cellspacing="0px"><tbody>
			<!-- Divs trennen die Sektionen, das oberste hat keinen top-rahmen -->
			<!-- ACHTUNG! Die width Angabe im Style steuert die maximale breite. Wenn man die im Inneren der Tabelle setzt, dann kann man die Tabelle auch kleiner schieben -->
			<tr><td style="{$style-width_control}">
				<!-- Erzeugen des Zeilenabstands Fontabhaengig mit zwei weiteren Divs -->
				<div style="padding-bottom:1em">
					<span style="{$style-font_big_bold}"><b><xsl:value-of select="$title" /></b></span>
					
				</div>
				<div>
					<table style="{$style-table_subs}" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr>
								<td><xsl:value-of select="//bmw:fileInfo/@systemName"/></td>
								<td width="50px"></td>
								<td><xsl:value-of select="//bmw:fileInfo/@softwareVersion"/></td>
							</tr>
						</tbody>
					</table>
				</div>
			</td></tr>
			<tr><td style="{$style-width_control}">
				<!-- Aufteilung in zwei Seiten mit Tabelle -->
				<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
					<tbody>
						<tr>
							<!-- Angaben in em oder ex funktionieren nicht im Firefox und fehlerhaft im IE wenn man eine zweite, innere Tabelle nimmt -->
							<!-- Die innere Tabelle funktionier mit Prozent und px einwandfrei -->
							<!-- Die verwendete Variante ohne innere Tabelle funktioniert auch und ist uebersichtlicher -->
							<td style="{$style-header1_left_desc}">Pruefumfang</td>
							<td style="{$style-header1_left_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:testInfo/@pruefumfangName"/></b></td>
							<td style="{$style-header1_right_desc}">FGNR</td>
							<td style="{$style-header1_right_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:vehicleInfo/@shortVIN"/></b></td>
						</tr>
						<tr>
							<td style="{$style-header1_left_desc}">PU-Autor</td>
							<td style="{$style-header1_left_cont}">:<xsl:value-of select="$nbsp" /></td>
							<td style="{$style-header1_right_desc}">FZS</td>
							<td style="{$style-header1_right_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:vehicleInfo/@FZS"/></b></td>
						</tr>
						<tr>
							<td style="{$style-header1_left_desc}">PU-Version</td>
							<td style="{$style-header1_left_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:testInfo/@testVersion"/></b></td>
							<td style="{$style-header1_right_desc}">TYP</td>
							<td style="{$style-header1_right_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:vehicleInfo/@typeKey"/></b></td>
						</tr>
						<tr>
							<td style="{$style-header1_left_desc}">Pruefstand</td>
							<td style="{$style-header1_left_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:testInfo/@testStand"/></b></td>
              <td style="{$style-header1_right_desc}">I-Stufe</td>
              <td style="{$style-header1_right_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:testInfo/@iStep"/></b></td>
            </tr>
						<tr>
							<td style="{$style-header1_left_desc}">Pruefzeit</td>
							<td style="{$style-header1_left_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:testInfo/@testTime"/></b></td>
							<td style="{$style-header1_right_desc}"></td>
							<td style="{$style-header1_right_cont}"></td>
						</tr>
					</tbody>
				</table>
			</td></tr>
			<tr><td style="{$style-width_control}">
				<!-- Aufteilung in zwei Seiten mit Tabelle -->
				<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
					<tbody>
						<tr>
							<td style="{$style-header2_left_desc}">Pruefer</td>
							<td style="{$style-header2_left_cont}">:<xsl:value-of select="$nbsp" /><b><xsl:value-of select="//bmw:testInfo/@editor"/></b></td>
							<td style="{$style-header2_right_desc}">Nacharbeit</td>
							<td style="{$style-header2_right_cont}">:<xsl:value-of select="$nbsp" /></td>
						</tr>
					</tbody>
				</table>
			</td></tr>
			<!-- Bei complete=0 einfuegen, wie im BASIC File -->
			<xsl:if test="//bmw:testInfo/@complete != 'true' and //bmw:testInfo/@complete != '1'">
				<tr><td style="{$style-width_control}">
					<span style="{$style-colour_red_dark}"><b>
					ACHTUNG!<br/>
					Prüfung wurde durch den Prüfer abgebrochen!<br/>
					Prüfung nicht komplett!
					</b></span>
				</td></tr>
			</xsl:if>
			<!-- Hier werden die Fehler-Divs eingefuegt -->
			<xsl:apply-templates select="//bmw:result"/>
		</tbody></table>
	</body>
</html>
</xsl:template>
<!-- Ende der HTML Seite / xsl:template -->

<!-- Template fuer result -->
<xsl:template match="bmw:result">
	<xsl:choose>
         <xsl:when test="contains(@errorType, 'F') or contains(@errorType, 'S')">     
			<tr><td style="{$style-width_control}">
			
			
				<xsl:if test="string-length(@param1) &gt; '0'">
				<!-- Teststep Name und Beschreibung, wird immer erzeugt -->
				<div style="padding-bottom:0.3em"  align="left">
					<b><u><xsl:value-of select="@testStepName"/>.<xsl:value-of select="@description"/></u></b>
				</div>
				</xsl:if>
				<xsl:if test="string-length(@param1) = '0'">
				<!-- Teststep Name und Beschreibung, wird immer erzeugt -->
				<div style="padding-bottom:0.3em"  align="center">
					<b><u><xsl:value-of select="@testStepName"/>.<xsl:value-of select="@description"/></u></b>
				</div>
				</xsl:if>
				
				<xsl:if test="string-length(@param1) &gt; '0'">
				<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
					<tbody>
						<tr valign="top">
							<td style="{$style-list_left_desc}">SGBD</td>
							<td style="{$style-list_left_cont}">: <b><xsl:value-of select="@param1"/></b></td>
							<td style="{$style-list_right_desc}">Job</td>
							<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@param2"/></b></td>
						</tr>
					</tbody>
				</table>
				</xsl:if>
				<!-- Par, wird erzeugt wenn der Wert da ist -->
		        <xsl:if test="string-length(@param3) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Par</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@param3"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Erg und Ist (String), wird jeweils erzeugt wenn der Wert resultValueStr da ist -->
				<xsl:if test="string-length(@resultValueStr) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Erg</td>
								<td style="{$style-list_left_cont}">: <b><xsl:value-of select="@resultName"/></b></td>
								<td style="{$style-list_right_desc}">Ist</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@resultValueStr"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Erg und Ist (Dbl), wird jeweils erzeugt wenn der Wert resultValueDbl da ist -->
				<xsl:if test="string-length(@resultValueDbl) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Erg</td>
								<td style="{$style-list_left_cont}">: <b><xsl:value-of select="@resultName"/></b></td>
								<td style="{$style-list_right_desc}">Ist</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@resultValueDbl"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Vier mal Soll, jeweils nur wenn vorhanden. Keine Kennzeichnung ueber Min, Max, ..., wie vorgegeben -->
		        <xsl:if test="string-length(@minValueStr) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Soll</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@minValueStr"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
		        <xsl:if test="string-length(@maxValueStr) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Soll</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@maxValueStr"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Geht das mit Double so? anscheinend -->
		        <xsl:if test="string-length(@minValueDbl) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Soll</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@minValueDbl"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
		        <xsl:if test="string-length(@maxValueDbl) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Soll</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@maxValueDbl"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Anweis-text, wenn vorhanden -->
		        <xsl:if test="string-length(@instructionText) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Anweistext</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@instructionText"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Hinweistext, wenn vorhanden -->
		        <xsl:if test="string-length(@adviseText) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Hinweistext</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@adviseText"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
				<!-- Fehlertext, wenn vorhanden -->
		        <xsl:if test="string-length(@errorText) &gt; '0'">
					<table style="{$style-table_subs}" width="100%" cellpadding="0px" cellspacing="0px">
						<tbody>
							<tr valign="top">
								<td style="{$style-list_left_desc}">Fehlertext</td>
								<td style="{$style-list_right_cont}">: <b><xsl:value-of select="@errorText"/></b></td>
							</tr>
						</tbody>
					</table>
				</xsl:if>
			
			<xsl:if test="contains(@errorType, 'S')">
				<table style="{$style-width_control}">
					<span style="{$style-colour_red_dark}"><b>
					S Y S T E M F E H L E R
					</b></span>
					</table>
			</xsl:if>
			
			
			
			</td></tr>
       </xsl:when>
	</xsl:choose>
</xsl:template>
<!-- Ende des Templates fuer result -->

</xsl:stylesheet>
