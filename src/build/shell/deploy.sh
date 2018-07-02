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
#app_src= $JENKINS_HOME"/src/main/splunk/"$app_name
#app_home=$JENKINS_HOME"/target/"$app_name

app_src=src/main/splunk/iqp
app_home=target
#versionsnummer=${versionsnummer:-"3.52"}
SPLUNK_HOME=/opt/splunk
		 
# Verschiebe die Ordner $app_name in 103/$sp
	
if [ -d $SPLUNK_HOME/etc/deployment-apps/$app_name/ ]
then
	rm -rf $SPLUNK_HOME/etc/deployment-apps/$app_name/*
fi

cp -a target/$app_name/* $SPLUNK_HOME/etc/deployment-apps/$app_name/

