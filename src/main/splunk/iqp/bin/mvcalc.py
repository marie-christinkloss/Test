#!/usr/bin/env python

import sys
from splunklib.searchcommands import \
    dispatch, StreamingCommand, Configuration, Option, validators


@Configuration()
class mvcalc(StreamingCommand):
    """ %(synopsis)

    ##Syntax

    %(syntax)

    ##Description

    %(description)

    """
    
    singleValField = Option(
        doc='''
        **Syntax:** **singleValField=***<fieldname>*
        **Description:** Name of the field that will calculate into multiValField''',
        require=True, validate=validators.Fieldname())
    
    
    multiValField = Option(
        doc='''
        **Syntax:** **multiValField=***<fieldname>*
        **Description:** Name of the field that will calculate all pieces with singleValField''',
        require=True, validate=validators.Fieldname())
        
    
    fieldName = Option(
        doc='''
        **Syntax:** **fieldName=***<fieldname>*
        **Description:** Name of the output field''',
        require=True, validate=validators.Fieldname())

    operation = Option(
        doc='''
        **Syntax:** **operation=***<string>*
        **Description:** operation to calculate between singleValField and multiValField (+, -, *, /, <, <=, ==, !=, >=, >)''',
        require=True)

    orientation = Option(
        doc='''
        **Syntax:** **orientation=***<string>*
        **Description:** Orientation of the calculation (single-multi, multi-single)''')
    
    boolOperation = ["<", "<=", "==", "!=", ">=", ">"]
    
    def stream(self, records):
        self.logger.debug('mvCalc: %s', self)  # logs command line
        operation = self.operation
        orientation = self.orientation
        for record in records:
            rValue=0
            rValues=[]
            if isinstance(record[self.multiValField], list):
                mValues=list(record[self.multiValField])
                sValue=str(record[self.singleValField])
                for mValue in mValues: 
                    if orientation=="single-multi":
                        calc = eval(sValue + operation + str(mValue))
                    else:
                        calc = eval(str(mValue) + operation + sValue)
                    if operation in self.boolOperation: 
                        if calc:
                            rValue += 1
                    else:
                        rValues.append(calc)
                if operation in self.boolOperation: 
                    record[self.fieldName] = rValue
                else: 
                    record[self.fieldName] = rValues
            else:
                if orientation=="single-multi":
                    calc = eval(str(record[self.singleValField]) + operation + str(record[self.multiValField]))
                else:
                    calc = eval(str(record[self.multiValField]) + operation + str(record[self.singleValField]))
                if operation in self.boolOperation: 
                    if calc:
                        record[self.fieldName] = 1
                    else:
                        record[self.fieldName] = 0
                else:
                    record[self.fieldName] = calc
                
            yield record

dispatch(mvcalc, sys.argv, sys.stdin, sys.stdout, __name__)
