#!/bin/bash
####################
# bitte bei den aufgeführten Parameter ggf. anpassen vornehmen
# app_name
# release_build - ist der Build für interne Testzwecke ("false") oder für eine Kundenauslieferung ("true")
# versionsnummer - hat sich die Versionsnummer geändert? 
# email_to, email_cc, email_bcc - bei Mehreen Mail-Adressen bitte mit Emila1, Email2, ... angeben
# bezeichnerX - ab welchen Bezeichner soll nach einem MUSTER gesucht und dies ersetzt werden
#		bei der Verwendung von Klammern, /, \,.. diese vorher bitte mit einem \ demaskieren, also z.B. \[A\/B\]
####################
app_name="iqp"
#JOB_NAME="mavenTest"
JENKINS_HOME="/var/lib/jenkins/jobs/"$JOB_NAME"/workspace"
#JENKINS_HOME="~/Schreibtisch/seleniumTest/Selenium-Maven-Template"
app_src=src/main/splunk/iqp
app_home=target
#versionsnummer=${versionsnummer:-"3.52"}
SPLUNK_HOME="/opt/splunk"

# kopiere src/app_name nach target/app_name

cp -r $app_src $app_home
cd $app_home


rm -rf $app_name/.svn
for f in `find | egrep -v Eliminate`
do
	rm -rf $f/.svn
done

####################
# nenne local zu default um
####################
#dir= default- Ordner
dir=$app_name/default

if [ -d $dir ] #(existiert default?)-> Löschen, dann Ordner umbenennen
then
	rm -rf $app_name/default
	mv $app_name/local $app_name/default
else
	mv $app_name/local $app_name/default
fi   

####################
# Ersetzungen
####################

# ersetze die Versionsnummer in app.conf
sed -i '/version/c\version = '$versionsnummer'' $app_name/default/app.conf
# Füge in ap.conf bei [install] noch eine buildnummer eine
sed -i '/install/c\\[install\]\nbuild = '$BUILD_NUMBER'' $app_name/default/app.conf
		
####################
# packe $app_name.spl Datei
####################
		
tar -czf $app_name.tar.gz $app_name/
mv $app_name.tar.gz $app_name$versionsnummer.spl

#rm -rf $app_name/


