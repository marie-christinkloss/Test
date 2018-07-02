package de.robotron.template.tests;


import java.util.ArrayList;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import de.robotron.template.DriverFactory;
import org.openqa.selenium.JavascriptExecutor;


public class testFunctions extends DriverFactory {
	
	static String versApp = null;
//	static String versApp = "19.99";
	//static String JenkinsVersion = "19.99";
	
	//Versionsnummer aus Jenkins holen
	static String JenkinsVersion = System.getProperty("versionsnummer");
//	static String appName = "iQP 4.0"; 

	
	/**
	 * Kann sich ein Benutzer anmelden. 
	 * @param URL URL zur Splunk-Instanz/ zum Dashboard
	 * @param user Benutzername zum Anmelden
	 * @param pw Passwort zum Anmelden
	 * @throws Exception Öffnet sich die richtige Seite
	 */
    public static void login(String URL, String user, String pw) throws Exception {

		System.out.println("*******************");
		System.out.println("Login");
		System.out.println("*******************");
		
		// Hole Driver aus DriverFactory
		WebDriver driver = getDriver();

		// Rufe Splunk auf
		driver.get(URL);
		System.out.println("Seite1: " + driver.getTitle());

		// Anmeldung
		WebElement element = driver.findElement(By.id("username"));
		element.sendKeys(user);
		element = driver.findElement(By.id("password"));
		element.sendKeys(pw);
		element.submit();

		// Check the title of the page
		(new WebDriverWait(driver, 10)).until(new ExpectedCondition<Boolean>() {
			public Boolean apply(WebDriver d) {
				return d.getTitle().startsWith("Startseite | Splunk");
			}
		});
    }
    
        /**
     * Prüfe die Sprache in der URL und setzte diese auf die gewünschte
     * @param URL URL im Browser
     * @param language gewünschte Sprache
     * @return URL in der gewünschten Sprache
     */
    public static String checkAndSwitchLanguage(String URL, String language){
    	//nehme URL und teste auf en-US oder de-DE
    	//ändere die URL ggf auf die gewünschte Sprache
//    	System.out.println("ate URL" + URL);
    	boolean ger =  URL.matches(".*de-DE.*");
//    			Pattern.compile("*de-DE*").matcher(URL).find();
    	System.out.println(ger);
    	if (ger == false && language.equals("german")){
    		//Setze en-US auf de-DE
    		URL = URL.replaceAll("en-US", "de-DE");
    	} else if(ger == true && language.endsWith("english")){
    		//setzt de-DE auf en-US
    		URL = URL.replaceAll("de-DE", "en-US");
    	} 
    	return URL;
    }
    
    /**
     * Stimmt die Version auf dem Server mit der von Jenkins gebauten Version überein
     * @param URL URL zum Dashboard
     * @param appName Name der App, deren Version überprüft werden soll
     * @throws Exception IllegalArgumentException bei flascher Version
     */
    public static void checkVersion(String URL, String appName) throws Exception{
    	WebDriver driver = getDriver();
    	String appInTabelle ="test"; 
    	
		System.out.println("*******************");
		System.out.println("Test checkVersion starts");
		System.out.println("*******************");
		
		//Rufe die Übersichtsseite der App auf
		driver.get("http://rdslinux083.robotron.de:8001/en-US/manager/launcher/apps/local");
		WebElement table = driver.findElement(By.name("actionControl"));

		//Durchlaufe diue Tabelle und suche nach der Spalte in der der App-name steht und speichere den Wert unter 'count'	
		int count = 0;
		for (int j= 2; j < 22; j++){
			appInTabelle = table.findElement(By.xpath("//tr[" + j + "]/td[1]")).getText();
			if(appInTabelle.equals(appName)){
				count = j;
			}
		}

		//Gehe in Zeile 'count' und lass dir den Wert der 3. Splate (Version) ausgeben
		WebElement col = table.findElement(By.xpath("//tr[" + count + "]/td[3]"));
		versApp = col.getText();

		/*
		* Prüfe die deployde App-Verion und vergleiche dies mit der Version aus Jenkins	
		* Wenn die Versionen übereinstimme, Test bestanden
		* wenn die Versionen nicht übereinstimmen, warte und versuche es erneut, bis Timer abgelaufen. Dann werfe Exception
		*/
		for (int i = 0; i< 6; i++){
			if(i < 5){
				if (!(versApp.equals(JenkinsVersion))){
					System.out.println("Falsche App-Version, warte auf Neustart. Versuch:" + (i+1));
					System.out.println("Momentane App-Version: " + versApp + ";benötigte Version: " + JenkinsVersion);
			
					Thread.sleep(1 * 60 * 1000); //Minuten * Sekunden * MS
					driver.get("http://rdslinux083.robotron.de:8001/en-US/manager/launcher/apps/local");
					table = driver.findElement(By.name("actionControl"));
					col = table.findElement(By.xpath("//tr[" + count + "]/td[3]"));
					versApp = col.getText();
				}
				else{
					System.out.println("richtige Version: " + versApp + "=" + JenkinsVersion);
					break;
				}	
			}	
			else if(!(versApp.equals(JenkinsVersion)) && i < 6) 
				throw new IllegalArgumentException("Falsche Version");	
		}	
		System.out.println("*******************");
		System.out.println("Test checkVersion ends");
		System.out.println("*******************");
	}
    
    /**
     * Durchlaufe eine übergebene Tabelle und suche in einer bestimmten Spalte nach einen gesuchten Wert. Hierbei wir immer das erste vorkommen des Wertes genommen.
     * @param table Tabelle, die durchsucht werden soll
     * @param lookingFor Wert, der in der Tabelle gesucht wird
     * @param colName Name der Spalte, in der der Wert steht
     * @return Array mit [Zeile, Spalte] in der der Wert steht
     */

    public static int[] getPositionInTable(WebElement table, String lookingFor, String colName){
   
		int row = 0, col = 0;
		for (int j= 2; j < 22; j++){
			//System.out.println("Spalte im Header: " + j);
			WebElement cell = table.findElement(By.xpath("//tr[1]/th[" + j + "]"));
			String header = cell.getAttribute("data-sort-key");
			if(header.equals(colName)){
				row = j;
				System.out.println("Spalte im Header: " + row);
				break;
			}
		}
		
		for (int i= 1; i < 100; i++){
			//System.out.println("zelle" + i);
			//System.out.println("Zeile in der Tabelle: " + i);
			String cellContent = table.findElement(By.xpath("//tr[" + i + "]/td[" + row + "]")).getText();
			if(cellContent.equals(lookingFor)){
				col = i;
				System.out.println("Zeile in der Tabelle: " + col);
				break;
			}
		}
		
		return new int[]{col,row};

    }
    
    /**
     * Steht in einer Tabelle in einer angegebenen Zelle ein bestimmter Wert.
     * @param URL URL zum Dashboard
     * @param tableID ID der Tabelle in der nach dem Wert gesucht wird
     * @param cellContent SOLL-Inhalt der Zelle
     * @param col Zeile in der der Wert stehen soll
     * @param row Spalte in der der Wert stehen soll
     * @throws Exception IllegalArgumentException, wenn der gesuchte und gefundene Wert nicht übereinstimmen 
     */

    public void checkTableContent(String URL, String tableID, String cellContent, int col, int row ) throws Exception{
    	
		System.out.println("*******************");
		System.out.println("Test 'checkTableContent' " + cellContent + " starts");
		System.out.println("*******************");
		
		WebDriver driver = getDriver();
		driver.get(URL);
		//Thread.sleep(10 * 1000);
		waitForSplunk(driver, null, "splunk-message-container", "Warten auf Daten...", 20);

		WebElement cell = driver.findElement(By.xpath("//*[@id='" + tableID + "']/table//tr[" + col + "]/td["+ row + "]"));

		String pruefumfang = cell.getText();
		
		System.out.println("Text in Zelle " + col + "/" + row + ": " + pruefumfang);

		if(!(pruefumfang.equals(cellContent))){	
			throw new IllegalArgumentException("Falsche Bezeichnung. Gesuchte Bezeichnung: " + cellContent + ". Gefundene Bezeichnung: " + pruefumfang);
		}
		System.out.println("*******************");
		System.out.println("Test 'checkTableContent' " +  cellContent +" ends");
		System.out.println("*******************");
    }
    
    /**
     * Wartet bis das gewünschte Element geladen ist
     * @param driver wenn sich das Element auf der höchsten Ebene im Driver des Browsers befindet
     * @param elem wenn sich das Element auf einer unteren Ebene findet und ein Webelement ist 
     * @param classWebElement Name der Klasse, in der das Element liegt
     * @param waitFor  String der während des Ladens des Elementesangezeigt wird
     * @param timeToWait Sekunden, wie lange maximal gewartet wird
     * @throws InterruptedException 
     */
    public static void waitForSplunk(WebDriver driver, WebElement elem,  String classWebElement, String waitFor, int timeToWait) throws InterruptedException{
    	WebElement dia = null;

    	//je nach Ebene befindet sich der Dialog im Browser oder in einem Unterelement davon
    	if (elem == null){
    		dia = driver.findElement(By.className(classWebElement));
    	} else if(driver == null){
    		dia = elem.findElement(By.className(classWebElement));
    	}
    	
		//überprüfe Nachricht und warte 
		for(int i = 0; i < timeToWait; i++){
			String mess = dia.getText();
			System.out.println(mess);
			if(mess.equals(waitFor) || mess.equals("Warten, bis in Warteschlange befindlicher Auftrag gestartet wird.")){
				System.out.println("Warten auf Daten");
				Thread.sleep(1 * 1 * 1000);
			}
			else break; 
		}
    }
    
    
    /**
     * Hilfsfunktion. Wandelt einen Werkscode in das entsprechende Werk um
     * @param factoryCode Werkscode 
     * @return den Namen des Werkes
     */
    public static String getFactory(String factoryCode){
    	String fac = null;
    	if (factoryCode.equals("w00")){fac = "FIZ"; 	}
    	if (factoryCode.equals("w01")){fac = "München"; 	}
    	if (factoryCode.equals("w02")){fac = "Dingolfing"; 	}
    	if (factoryCode.equals("w03")){fac = "Berlin";	}
    	if (factoryCode.equals("w06")){fac = "Regensburg";	}
    	if (factoryCode.equals("w07")){fac = "Leipzig";	}
    	if (factoryCode.equals("w09")){fac = "Rosslyn"; 	}
    	if (factoryCode.equals("w10")){fac = "Spartanburg"; 	}
    	if (factoryCode.equals("w30")){fac = "SLP"; 	}
    	if (factoryCode.equals("w34")){fac = "Oxford";	}
    	if (factoryCode.equals("w50")){fac = "Goodwood";	}
    	if (factoryCode.equals("pnw2")){fac = "PNW2";	}
//    	else System.out.println("Ungültiger Werkcode");
    	
    	return fac;
    }
    
    /**
     * Wandelt ein Werk in den definierten Werkscode um
     * @param factory Name des Werkes
     * @return dazugehöriger Werkscode
     */
    public static String getFactoryCode(String factory){
    	String fac = null;
    	if (factory.equals("FIZ")){fac = "w00"; 	}
    	if (factory.equals("München")){fac = "w01"; 	}
    	if (factory.equals("Dingolfing")){fac = "w02"; 	}
    	if (factory.equals("Berlin")){fac = "w03";	}
    	if (factory.equals("Regensburg")){fac = "w06";	}
    	if (factory.equals("Leipzig")){fac = "w07";	}
    	if (factory.equals("Rosslyn")){fac = "w09"; 	}
    	if (factory.equals("Spartanburg")){fac = "w10"; 	}
    	if (factory.equals("SLP")){fac = "w30"; 	}
    	if (factory.equals("Oxford")){fac = "w34";	}
    	if (factory.equals("Goodwood")){fac = "w50";	}
    	if (factory.equals("PNW2")){fac = "pnw2";	}
//    	else System.out.println("Ungültiger Werkcode");
    	
    	return fac;
    }

    /**
     * Ist in einem DropDown Menü ein gesuchter Menüpunkt enthalten
     * @param URL URL zum Dashboard
     * @param input_id ID des Dropdown Menüs
     * @param option gesuchte Option im Menü
     * @throws Exception IllegalArgumentException, wenn der Wert nicht enthalten ist
     */
    public void checkDropDownInputOptionsContain(String URL, String input_id, String option) throws Exception{
    	System.out.println("*******************");
		System.out.println("Test 'checkDropDownInputOptionsContain' " + option + " available starts");
		System.out.println("*******************");
		
		String text = null;
		String tempOption = getFactoryCode(option);
		//suche im Driver den entsprechenden Div
		WebDriver driver = getDriver();
		driver.get(URL);
		Thread.sleep(3 * 1000);
		
		//suche die Liste mit dem Element 
		for(int i = 1; i<25; i++){
			WebElement cell = driver.findElement(By.xpath("//*[@id='" + input_id + "']//input[@class='select2-offscreen']/option[" + i + "]"));
			text = cell.getAttribute("value");
			System.out.println(text);
			if(text.equals(tempOption)){
				break;
			}
		}

		if(text.equals(tempOption)){
			System.out.println("Option enthalten");
		}
		else{
			throw new IllegalArgumentException("Falsche Bezeichnung. Gesuchter Wert " + option);
		}

		
		System.out.println("*******************");
		System.out.println("Test 'checkDropDownInputOptionsContain' " +  option +" ends");
		System.out.println("*******************");
   	
    }
    
    /**
     * Ist in einem Eingabefeld der gesuchte Menüpunkt enthalten
     * @param URL URL zum Dashboard
     * @param input_id ID für das Eingabefeld
     * @param option gesuchte Option in Feld
     * @throws Exception IllegalArgumentException, wenn der Wert nicht enthalten ist
     */
    /*
     * Testet, ob in einem Eingabefeld <input_id> an einer bestimmten Position <positionInList> ein Wert <option> steht
     */
    public void checkMultiValueInputOptionsContain(String URL, String input_id, String option) throws Exception{
		System.out.println("*******************");
		System.out.println("Test 'checkMultiValueInputOptionsContain' " + option + " available starts");
		System.out.println("*******************");
		
		String text = null;
		
		//suche im Driver den entsprechenden Div
		WebDriver driver = getDriver();
		driver.get(URL);
		Thread.sleep(3 * 1000);
		WebElement elem = driver.findElement(By.id(input_id));
		//Warte bis "Füllen" nicht mehr angezeigt wird
		waitForSplunk(null, elem, "splunk-choice-input-message", "Füllen...", 20);
		Thread.sleep(2 * 1000);
		//suche die Liste mit dem Element 
		for(int i = 1; i<25; i++){
			WebElement cell = driver.findElement(By.xpath("//*[@id='" + input_id + "']//input[@class='select2-offscreen']/option[" + i + "]"));
			text = cell.getAttribute("value");
			System.out.println(text);
			if(text.equals(option)){
				break;
			}
		}
			
		//Stimmt der gefundene Wert mit dem gesuchten überein?
		if(text.equals(option)){
			System.out.println("Option enthalten");
		}
		else{
			throw new IllegalArgumentException("Falsche Bezeichnung. Gesuchter Wert " + option);
		}

		System.out.println("*******************");
		System.out.println("Test 'checkMultiValueInputOptionsContain' " +  option +" ends");
		System.out.println("*******************");
    }
    
      /**
       * Öffne auf Klick eine neue Seite/Tab. Bei Klick auf einen Wert in einer Tabelle sollte sich eine neue Seite/Tab öffnen 
       * und den entsprechenden Titel besitzen  
       * @param URL URL zum Dashboard
       * @param tableID ID der Tabelle in der auf einen Wert geklickt werden soll
       * @param title Seitentitel der neuen Seite
       * @param tab wird mit Klick auf das Element eine neuer tab geöffnet (true) oder nur die Seite neu geladen
       * @throws Exception IllegalArgumentException, wenn der Seitentitel nicht mit den gesuchten Übereinstimmt
       */
        public void drillDownToView(String URL, String tableID, String title, Boolean tab) throws Exception{

    	System.out.println("*******************");
		System.out.println("Test drillDownToView " + title + " starts");
		System.out.println("*******************");
		
		//suche im Driver den entsprechenden Div
		WebDriver driver = getDriver();
		driver.get(URL);
		Thread.sleep(3 * 1000);
		WebElement elem = driver.findElement(By.id("filter_09"));
		
		waitForSplunk(null, elem, "splunk-choice-input-message", "Füllen...", 35);
		Thread.sleep(5 * 1000);
		WebElement table = driver.findElement(By.xpath("//*[@id='" + tableID + "']/table"));

		//KLicke in Tabelle auf <ZellenName>
		int pos[] = getPositionInTable(table, "17", "Anzahl Fahrzeuge");

		System.out.println(pos);
		WebElement cell = table.findElement(By.xpath("//tr["+ pos[0] +"]/td[" + pos[1] + "]"));
		cell.click();
		
		// füge alle Tabs in eine Liste hinzu und wechsle von Tab 0 zu Tab 1
		if(tab == true){
		ArrayList<String> tabs = new ArrayList<String> (driver.getWindowHandles());
	    driver.switchTo().window(tabs.get(1));
		}
		
		
		System.out.println("alte URL" + driver.getCurrentUrl());
		String newUrl = checkAndSwitchLanguage(driver.getCurrentUrl(), "german");
		driver.get(newUrl);
		System.out.println("neue URL" + driver.getCurrentUrl());
		
		//Laden der neuen Seite und warten bis geladen ist
		Thread.sleep(8 * 1000);

		


		
		String header = driver.findElement(By.xpath("//*[starts-with(@class, 'dashboard-header')]//h2")).getText();
		System.out.println(header);
		
		if(header.equals(title)){
			System.out.println("Richtiger Seitentitel");
		}else{
			throw new IllegalArgumentException("Falscher Seitentitel. Gesuchter Wert " + title + ". Gefundener Wert " + header);
			
		}
    
		System.out.println("*******************");
		System.out.println("Test 'drillDownToView' " +  title + " ends");
		System.out.println("*******************");
    }
    
    /**
     * Beim Klick auf einen Wert innerhalb einer Tabelle wird ein JS-Token gesetzt
     * @param URL URL zum Dashboard
     * @param tokenName Name/ Wert des Tokens 
     * @param tableID Tabelle auf die geklickt und damit der Token gesetzt wird
     * @throws Exception
     */
    public void drillDownToToken(String URL, String tokenName, String tableID) throws Exception{
        //ToDo: Test, der in <URL> in Tabelle <tableClass> in der <Splate> 'Prüfprozedur',1 klicken
    	//über js sollte ein Token gesetzt werden 
		 

    }
    
    
    
//    public String getTokenValue(WebDriver driver, String tokenModel, String tokenName){
//    	String token = null;
//    	if (driver instanceof JavascriptExecutor) {
// 		token = ((JavascriptExecutor) driver).executeScript("splunkjs.mvc.Components.get('" + tokenModel + "').get('" + tokenName + "')").toString();
// 		}
// 		return token;
// 	}
    
    
}
