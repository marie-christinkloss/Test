# -*- coding: utf-8 -*-
'''
Created on 09.01.2015

@author: georg.schroeder
'''
import sys, os, xlrd, re, time; 
import splunk.mining.dcutils as dcu;
import urllib;



def read_excel(excel_file,sheetnr):
    workbook = xlrd.open_workbook(excel_file);
    worksheet = workbook.sheet_by_index(int(sheetnr));

    for rownum in xrange(worksheet.nrows):
        if rownum == 0:
            heute = time.strftime("%x");            
            berichtsdatum = time.strftime("%x", time.strptime(re.sub(ur'''.*\D(\d{1,2}.\d{1,2}.\d{2} \d{1,2}:\d{2}:\d{2}).*''', ur'''\1''', worksheet.row_values(0)[0]),"%d.%m.%y %H:%M:%S"));
            #if heute != berichtsdatum: 
            #    logger.warn("SAP-BO Report is not up-to-date");
            #    return -1; # ist der Bericht nicht aktuell gebe nichts aus
        elif rownum == 1:
            pass;
        else:
            row="";
            for entry in worksheet.row_values(rownum):
                row = row + "\"" + unicode(entry).encode("utf-8").replace("\n","  ").replace("\"", "”") + "\",";
            print row;
    return 0;
    
if __name__ == "__main__":
    logger = dcu.getLogger();
    logger.info("Start importing SAP-BO report.");
    xls_file_url = sys.argv[1];
    xls_file_path = os.path.join(os.environ['TEMP'],sys.argv[1].split('/')[-1].split('#')[0].split('?')[0]);
    worksheetnr = sys.argv[2]
    try:
        ret = 1;
        while ret != 0:
            xlsfile_opener = urllib.URLopener();
            xlsfile_opener.retrieve(xls_file_url,xls_file_path);
            ret = read_excel(xls_file_path,worksheetnr);
            os.remove(xls_file_path);
            if ret != 0:
                time.sleep(1*60*60); #versuche es in einer Stunde nochmal
    except Exception, e:
        logger.error("Failed to import SAP-BO report. Error: %s" % (str(e)));
    
    logger.info("Finished importing SAP-BO report.");
    time.sleep(30);
