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
SPLUNK_HOME="/opt/splunk"
mail="marie-christin.kloss@robotron.de"


cd $app_home

if [ -f email ]
then
	rm -rf email
fi

echo -e "Datein mit @ robotron \n" >email
			
#gibt es irgendwo noch @robotron?, wenn ja, schreibe in Datein mail
	#for f find....  sucht ab aktuellen Verzeichnis alles ab
	#grep... suche nach @ robotron

for f in `find $app_name`
do
	grep -i -n -e "@robotron" -r $f >>email
done

sed -i '/^[0-9].*/d' email
sed -i '/.*build.sh.*/d' email
sed -i '/.*test.sh.*/d' email

#Codierung

if [ -f encoding ]
then
	rm -rf encoding
fi

touch encoding

echo -e "\n \n Datein mit keiner UFT-8-, ASCII oder Binary-Codierung \n " >>email
	#for f find....  sucht ab aktuellen Verzeichnis alles ab	
	#file -bi... gebe alle Kodierungen der Datein aus, schreibe diese in Datei 'encoding'
	# in der Form <DATEINNAME> -- KODIERUNGEN

for f in `find $app_name`
do 
	echo "$f" ' -- ' `file -bi "$f"` >>encoding
done 

#Suche in Datei 'encoding' nach alles, was nicht mit UFT-8, us-ascii oder binary ist
egrep -v 'utf-8|us-ascii|binary' encoding >>email
sed -i '/.*.svn.*/d' email


echo -e "\n \n Ausgabe von AppInspect \n" >>email

#ausführen von Splunk AppInspect und schreibe Shellausgabe in Datei inspect_shell
#splunk-appinspect inspect $JENKINS_HOME/jobs/$JOB_NAME/workspace/$app_name$versionsnummer.spl --excluded-tags inputs_conf >>email #--output-file inspect 
splunk-appinspect inspect $app_name$versionsnummer.spl --excluded-tags inputs_conf >>email #--output-file inspect 

# füge alle erstellten Datein zusammen und schicke diese an $email (z.B. PL) 
mail -s "Fehler Build $app_name" $mail <email
