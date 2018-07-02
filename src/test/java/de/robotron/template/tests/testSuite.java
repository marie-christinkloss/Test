package de.robotron.template.tests;

import org.openqa.selenium.WebDriver;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;

import de.robotron.template.DriverFactory;
import de.robotron.template.tests.testFunctions;


//public class testSuite extends DriverFactory{
public class testSuite extends testFunctions{
	
	@Test
	public void testSuite() throws Exception{	
	String URLThemenspeicher ="http://rdslinux083.robotron.de:8001/de-DE/app/iqp/apdm_themenspeicher?form.filt_pruefumfangName=*&form.filt_inline=*&form.filt_system=Cascade&form.filt_testStepName=*&form.filt_description=*&form.filt_param1=*&form.filt_ErrorCodeDec=*&form.filt_resultData=*&form.filt_shortVIN=*&form.filt_integrationLevel=*&form.filt_baureihe=*&form.assemblyhall=*&form.tsdatum.earliest=1517785200&form.tsdatum.latest=1518476400&form.nur_relevant=&form.nur_relevant=%7C%20search%20NOT%20status%3D%22*n.r.*%22&form.input_option_pruefumGr=0&form.filter_pruefumfangGr=*&earliest=0&latest=&form.filt_kommentar_werk=w06&form.werkfilter=w06";
	String URLMultiVal = "http://rdslinux083.robotron.de:8001/de-DE/app/iqp/apdm_themenspeicher?form.filt_pruefumfangName=*&form.filt_inline=*&form.filt_system=Cascade&form.filt_testStepName=*&form.filt_description=*&form.filt_param1=*&form.filt_ErrorCodeDec=*&form.filt_resultData=*&form.filt_shortVIN=*&form.filt_integrationLevel=*&form.filt_baureihe=*&form.werkfilter=w06&form.assemblyhall=*&form.filt_kommentar_werk=w06&form.tsdatum.earliest=-7d%40h&form.tsdatum.latest=now&form.nur_relevant=&form.nur_relevant=%7C%20search%20NOT%20status%3D%22*n.r.*%22&form.input_option_pruefumGr=0&form.filter_pruefumfangGr=*&earliest=0&latest=";
	
	//Login
	login("http://rdslinux083.robotron.de:8001/en-US/", "test_user", "pw4test_user");
	
	//Test der Version
	checkVersion("http://rdslinux083.robotron.de:8001/en-US/manager/launcher/apps/local", "iQP 4.0");
	
	//Test, ob eine Tabelle/Inputfeld an einer bestimmten Stelle einen bestimmten Inhalt hat
	checkTableContent(URLThemenspeicher, "statistics", "OPT_BAND70_DIAGNOSE", 1, 2);
	checkMultiValueInputOptionsContain(URLMultiVal, "filter_09", "F20");
	checkDropDownInputOptionsContain(URLMultiVal, "werkinput", "Leipzig");
	
	//Test ob beim Klick in eine Tabelle die neu geöffnetet Seite einen bestimmten Titel hat
	drillDownToView(URLThemenspeicher, "statistics", "APDM Recherche - Thema", true);

	//String url = "http://rdslinux083.robotron.de:8001/de-DE/app/iqp/apdm_historie_7_tage?form.pruefumfang=*&form.pruefling=*&form.pruefprozedur=*&form.sgbd=*&form.errorCodeDec=*&form.resultData=*&form.werkfilter=w06";
	//	String urlToken ="http://rdslinux083.robotron.de:8001/de-DE/app/iqp/apdm_themenspeicher?form.filt_pruefumfangName=*&form.filt_inline=*&form.filt_system=Cascade&form.filt_testStepName=*&form.filt_description=*&form.filt_param1=*&form.filt_ErrorCodeDec=*&form.filt_resultData=*&form.filt_shortVIN=*&form.filt_integrationLevel=*&form.filt_baureihe=*&form.assemblyhall=*&form.tsdatum.earliest=-7d%40h&form.tsdatum.latest=now&form.nur_relevant=&form.nur_relevant=%7C%20search%20NOT%20status%3D%22*n.r.*%22&form.input_option_pruefumGr=0&form.filter_pruefumfangGr=*&earliest=0&latest=&form.werkfilter=w06&form.filt_kommentar_werk=w06";
//	drillDownToToken(urlToken, "steuern_icomp_send_wake_up", "statistics");
	
	}
}
