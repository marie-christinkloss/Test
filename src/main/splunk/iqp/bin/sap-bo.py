# -*- coding: utf-8 -*-
'''
Created on 09.01.2015

@author: georg.schroeder
'''

import sys
import logging
import os, xlrd, re, time, datetime
import tempfile
import urllib
import xml.dom.minidom, xml.sax.saxutils

#set up logging suitable for splunkd comsumption
logging.root
logging.root.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(levelname)s %(message)s')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logging.root.addHandler(handler)


SCHEME = """<scheme>
    <title>SAP-BO Reports</title>
    <description>Get data from SAP-BO Excel-Reports.</description>
    <use_external_validation>true</use_external_validation>
    <streaming_mode>simple</streaming_mode>
    <endpoint>
        <args>
            <arg name="name">
                <title>Input Name</title>
                <description>Name of the current input.</description>
            </arg>
            <arg name="url">
                <title>URL</title>
                <description>URL the Excel report can be read from.</description>
            </arg>
            <arg name="worksheet">
                <title>Worksheet Number</title>
                <description>Number of the Excel-Worksheet (Starting with 0).</description>
            </arg>
        </args>
    </endpoint>
</scheme>
"""

def do_scheme():
    print SCHEME

# prints XML error data to be consumed by Splunk
def print_error(s):
    print "<error><message>%s</message></error>" % xml.sax.saxutils.escape(s)

def get_validation_data():
    val_data = {}
    # read everything from stdin
    val_str = sys.stdin.read()
    # parse the validation XML
    doc = xml.dom.minidom.parseString(val_str)
    root = doc.documentElement
    logging.debug("XML: found items")
    item_node = root.getElementsByTagName("item")[0]
    if item_node:
        logging.debug("XML: found item")
        name = item_node.getAttribute("name")
        val_data["stanza"] = name
        params_node = item_node.getElementsByTagName("param")
        for param in params_node:
            name = param.getAttribute("name")
            logging.debug("Found param %s" % name)
            if name and param.firstChild and \
               param.firstChild.nodeType == param.firstChild.TEXT_NODE:
                val_data[name] = param.firstChild.data

    return val_data

def validate_arguments():
  val_data = get_validation_data()
  url = val_data["url"]
  worksheet = val_data["worksheet"]
  try:
    try:
        x = int(worksheet)
    except ValueError:
        print_error("Worksheet number is no valid number.")
        sys.exit(1) 
    
    xls_file_url = url
    xls_file_path = os.path.join(tempfile.gettempdir(),url.split('/')[-1].split('#')[0].split('?')[0])
    
    xlsfile_opener = urllib.URLopener()
    xlsfile_opener.retrieve(xls_file_url,xls_file_path)
    xlrd.open_workbook(xls_file_path)
    os.remove(xls_file_path)
  except Exception,e:
    print_error("Invalid configuration specified: %s" % str(e))
    os.remove(xls_file_path)
    sys.exit(1)  

def read_excel(excel_file,sheetnr):
    workbook = xlrd.open_workbook(excel_file);
    worksheet = workbook.sheet_by_index(int(sheetnr));

    for rownum in xrange(worksheet.nrows):
        if rownum == 0:
            gestern = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%x")          
            berichtsdatum = time.strftime("%x", time.strptime(re.sub(ur'''.*\D(\d{1,2}.\d{1,2}.\d{2} \d{1,2}:\d{2}:\d{2}).*''', ur'''\1''', worksheet.row_values(0)[0],flags=re.DOTALL),"%d.%m.%y %H:%M:%S"))
            if gestern != berichtsdatum: 
                logging.warning("SAP-BO Report is not up-to-date")
                return -1 # ist der Bericht nicht aktuell gebe nichts aus
        elif rownum == 1:
            pass
        else:
            row="";
            
            for idx, entry in enumerate(worksheet.row_values(rownum)):
                if (idx>=36 and idx<=40):
                    try:
                        row = row + "\"" + xlrd.xldate.xldate_as_datetime(entry,workbook.datemode).strftime("%Y-%m-%d %H:%M:%S") + "\","
                    except ValueError:
                        row = row + "\"" + unicode(entry).replace("\r\n","  ").replace("\"", "”") + "\","
                else:
                    row = row + "\"" + unicode(entry).replace("\r\n","  ").replace("\"", "”") + "\","
            
            #for entry in worksheet.row_values(rownum):
            #    row = row + "\"" + unicode(entry).replace("\r\n","  ").replace("\"", "”") + "\","
            #    #print entry
            print row
    return 0

# Routine to index data
def run_script(): 
    try:
        # read everything from stdin
        config_str = sys.stdin.read()

        # parse the config XML
        doc = xml.dom.minidom.parseString(config_str)
        root = doc.documentElement
        conf_node = root.getElementsByTagName("configuration")[0]
        if conf_node:
            stanza = conf_node.getElementsByTagName("stanza")[0]
            if stanza:
                stanza_name = stanza.getAttribute("name")
                if stanza_name:
                    params = stanza.getElementsByTagName("param")
                    for param in params:
                        param_name = param.getAttribute("name")
                        if param_name and param.firstChild and \
                           param.firstChild.nodeType == param.firstChild.TEXT_NODE and \
                           param_name == "url":
                            url = param.firstChild.data
                        if param_name and param.firstChild and \
                           param.firstChild.nodeType == param.firstChild.TEXT_NODE and \
                           param_name == "worksheet":
                            worksheet = param.firstChild.data
    except Exception, e:
        raise Exception, "Error getting Splunk configuration via STDIN: %s" % str(e)
    
    #try:
    xls_file_path = os.path.join(tempfile.gettempdir(),url.split('/')[-1].split('#')[0].split('?')[0])
    
    ret = 1
    while ret != 0:
        xlsfile_opener = urllib.URLopener()
        xlsfile_opener.retrieve(url,xls_file_path)
        ret = read_excel(xls_file_path,worksheet)
        os.remove(xls_file_path)
        if ret != 0:
            logging.info("Next try to read Excel report in 1 hour")
            time.sleep(1*60*60) #versuche es in einer Stunde nochmal
    #except Exception, e:
    #    raise Exception, "Error getting Splunk configuration via STDIN: %s" % str(e)

    return ""

# Script must implement these args: scheme, validate-arguments
if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == "--scheme":
            do_scheme()
        elif sys.argv[1] == "--validate-arguments":
            validate_arguments()
        else:
            pass
    else:
        run_script()

    sys.exit(0)