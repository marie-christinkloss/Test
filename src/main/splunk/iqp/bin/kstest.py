#!/usr/bin/env python
# -*- coding: utf-8 -*-


import sys
#from pydevd import pydevd
from math import sqrt, pi, exp, log
from splunklib.searchcommands import dispatch, ReportingCommand, Configuration, Option, validators

@Configuration()
class KolmogorovSmirnovTestCommand(ReportingCommand):

    """ Computes the sum of a set of fields.

    ##Syntax

    .. code-block::
        sum total=<field> <field-list>

    ##Description:

    The total produced is sum(sum(fieldname, 1, n), 1, N) where n = number of fields, N = number of records.

    ##Example

    ..code-block::
        index = _internal | head 200 | sum total=lines linecount

    This example computes the total linecount in the first 200 records in the
    :code:`_internal index`.

    """
    significance = Option(
        doc='''
        **Syntax:** **significance=***<value>*
        **Description:** Value of the significance''',
        require=True)
    
    nameField = Option(
        doc='''
        **Syntax:** **nameField=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    valueField = Option(
        doc='''
        **Syntax:** **valueField=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    cntByField = Option(
        doc='''
        **Syntax:** **countField=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    avgField = Option(
        doc='''
        **Syntax:** **valueArea=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    stdevField = Option(
        doc='''
        **Syntax:** **stdevField=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    minField = Option(
        doc='''
        **Syntax:** **stdevField=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    maxField = Option(
        doc='''
        **Syntax:** **stdevField=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())
    
    cntAllField = Option(
        doc='''
        **Syntax:** **overall=***<fieldname>*
        **Description:** ''',
        require=True, validate=validators.Fieldname())

    @Configuration()
    def map(self, records):
        """ Computes sum(fieldname, 1, n) and stores the result in 'total' """
        
        pass
        #self.logger.debug('SumCommand.map')
        #fieldnames = self.fieldnames
        #total = 0.0
        #for record in records:
        #    for fieldname in fieldnames:
        #        total += float(record[fieldname])
        #yield {self.total: total}

    def reduce(self, records):
        """ Computes sum(total, 1, N) and stores the result in 'total' """
        
        #pydevd.settrace('rdspc078.robotron.de')
        
        #self.logger.debug('SumCommand.reduce')
        #fieldname = self.total
        #total = 0.0
        #for record in records:
        #    value = record[fieldname]
        #    try:
        #        total += float(value)
        #    except ValueError:
        #        self.logger.debug('  could not convert %s value to float: %s', fieldname, repr(value))
        #yield {self.total: total}
        
        tmp = {}
        try:
            signi = float(self.significance)
        except ValueError:
            self.logger.debug('  could not convert %s value to float: %s', 'signi', repr(self.significance))
            
        for record in records:
            name = str(record[self.nameField])
            try:
                valueF = float(record[self.valueField])
                cntBy = float(record[self.cntByField])
            except ValueError:
                self.logger.debug('  could not convert %s value to float: %s', fieldname, repr(value))
                
            if name in tmp:
                tmp[name]["values"][valueF] = {"count" : cntBy}
            else:
                attr = {"res" : "ja", "values" : {}}
                fieldnames = self.fieldnames
                for fiedname in fieldnames:
                    attr[str(fiedname)] = record[fiedname]
                try:
                    fieldname = self.avgField
                    attr["avg"] = float(record[fieldname])
                    fieldname = self.stdevField
                    attr["stdev"] = float(record[fieldname])
                    fieldname = self.cntAllField
                    attr["cntAll"] = float(record[fieldname])
                    fieldname = self.minField
                    min = float(record[fieldname])
                    attr["min"] = min
                    fieldname = self.maxField
                    max = float(record[fieldname])
                    attr["max"] = max
                except ValueError:
                    self.logger.debug('  could not convert %s value to float: %s', fieldname, repr(record[fieldname]))
                attr["dmax"] = sqrt(-0.5 * log(signi/2))/sqrt(attr["cntAll"])
                while min <= max:
                    attr["values"][min] = {"count" : 0}
                    min += 1
                
                attr["values"][valueF] = {"count" : cntBy}
                tmp[name] = attr
                
        for key, attr in tmp.iteritems():
            tmpSn = 0.0
            tmpF0 = 0.0
            for attrKey in sorted(attr["values"]):
                value = attr["values"][attrKey]
                sn1 = tmpSn
                sn = value["count"] / attr["cntAll"] + tmpSn
                f0 = 1/(sqrt(2*pi)*attr["stdev"])*exp(-0.5*pow((attrKey-attr["avg"])/attr["stdev"], 2)) + tmpF0
                dui = abs(sn1 - f0)
                doi = abs(sn - f0)
                if (dui>attr["dmax"] or doi>attr["dmax"]):
                    attr["res"] = "nein"
                    break;
                else:
                    tmpSn = sn
                    tmpF0 = f0
        
            yield {self.nameField : key, "Sollwert": attr["Sollwert"], "Toleranz" : attr["T"], "Stabw" : round(attr["stdev"], 2), "Mittelwert":  round(attr["avg"], 2), "StdNV" : attr["res"], "Min" : attr["min"], "Max" : attr["max"], "sortResultName" : attr["sortResultName"]}

dispatch(KolmogorovSmirnovTestCommand, sys.argv, sys.stdin, sys.stdout, __name__)
