#!/usr/bin/env python
# -*- coding: utf-8 -*-


import sys
import re
import difflib
#from pydevd import pydevd
from math import sqrt, pi, exp, log
from splunklib.searchcommands import dispatch, StreamingCommand, Configuration, Option, validators

# Remote Debugging Einstellungen
#import sys
#import pydevd
#pydevd.settrace('rdspc438.robotron.de',stdoutToServer=True, stderrToServer=True)



@Configuration()
class MultiValueMatcherCommand(StreamingCommand):

	def stream(self, records):
		self.logger.debug('MultiValueMatcherCommand: %s', self)  # logs command line
		
		for record in records:
			for key in record.keys():
				if(isinstance(record[key], list)):
					self.logger.debug('MultiValueMatcherCommand: %s is a multi value field', key)
					basetokens=re.split('(\w+|\W)',record[key][0])[1::2]
					for string in record[key]:
						tokens=re.split('(\w+|\W)',string)[1::2]
						new_tokens=["*"]
						for i, j, n in difflib.SequenceMatcher(None, basetokens, tokens).get_matching_blocks():
							if n:
								if i==0 and j==0:
									new_tokens.pop(0)
								new_tokens.extend(basetokens[i:i+n])
								if not (i+n==len(basetokens) and j+n==len(tokens)):
									new_tokens.append("*")
						basetokens = new_tokens
					record[key]="".join(basetokens)
			yield record

dispatch(MultiValueMatcherCommand, sys.argv, sys.stdin, sys.stdout, __name__)