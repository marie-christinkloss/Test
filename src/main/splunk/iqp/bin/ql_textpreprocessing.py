#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Scientific Python nutzen für Zugriff auf numpy, scipy, pandas, scikit-learn,...
import exec_anaconda
exec_anaconda.exec_anaconda()


# initialisiere das NLTK
import os
import sys
running_dir = os.path.dirname(os.path.realpath(__file__))
egg_dir = running_dir
for filename in os.listdir(egg_dir):
	if filename.endswith(".egg"):
		sys.path.append( os.path.join(egg_dir,filename))
import nltk
nltk_data = os.path.join(running_dir, 'nltk_data')
os.environ["NLTK_DATA"] = nltk_data
#nltk_data pfad festlegen
nltk.data.path.append(nltk_data)
#lookuppfad bestimmen
lookup_pfad = running_dir.replace('bin', 'lookups')

import pandas as pd
import re


#stopwords und stemmer definieren
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer


def find_language_stem_remove_stopwords(words,self):
	words = unicode(words, errors='ignore')
	words=re.sub(r"[:|/|-]", " ", words)
	words=re.sub(r"[.|;|_]", " ", words)
	words=re.sub(r"\[[^\]]*\]", " ", words)
	words=re.sub(r"[\\|\´|\`]", " ", words)
	#words=re.sub(r"\]", "", words)
	words=re.sub(r"\d{1}", "", words)
	words=re.sub(r"[?|$|!|#|)|*|(|,|\"|\'|=|<|>|+|&|%]", " ", words)
	words_set = set(words.split(' '))
	if self.language=='mix':
		english_count=len(words_set.intersection(self.english_stopwords_set))
		german_count=len(words_set.intersection(self.german_stopwords_set))
	if self.language=='de':
		english_count=0
		german_count=1
	if self.language=='en':
		german_count=0
		english_count=1
	if english_count>german_count:
		x=[]
		x_filter=[]
		for y in nltk.word_tokenize(words):
			x.append(self.stemmerE.stem(y))
		for y in x:
			if y not in self.english_stopwords_set:
				if len(y)>2:
					x_filter.append(y)
		return x_filter
	else:	 
		x=[]
		x_filter=[]
		for y in nltk.word_tokenize(words):
			x.append(self.stemmerG.stem(y))
		for y in x:
			if y not in self.german_stopwords_set:
				if len(y)>2:
					x_filter.append(y)
		return x_filter


# Variante mit dem Python SDK
from splunklib.searchcommands import \
	dispatch, StreamingCommand, Configuration, Option, validators
@Configuration()
class TextPreprocessingCommand(StreamingCommand):
	#""" Does something customized
	#"""
	preprocessField = Option(
		doc='''
		**Syntax:** **preprocessField=***<fieldname>*
		**Description:** Name of the field to do preprocessing on''',
		require=True)

	fieldName = Option(
		doc='''
		**Syntax:** **fieldName=***<fieldname>*
		**Description:** Name of the output field''',
		require=True, validate=validators.Fieldname())
		
	lookup = Option(
		doc='''
		**Syntax:** **lookup=***<fieldname>*
		**Description:** Lookup name (optional)''',
		require=False, validate=validators.Fieldname())

	language = Option(
		doc='''
		**Syntax:** **language=***<fieldname>*
		**Description:** Language used for stemming (optional): en for English, de for German''',
		require=True, validate=validators.Fieldname())
		
	def prepare(self):
		if self.lookup:
			kundenstop = pd.read_csv(os.path.join(lookup_pfad,self.lookup), encoding='utf-8')
			kundenstopset=set(kundenstop.stopword)
		if self.language=='de':
			self.stemmerG = SnowballStemmer("german", ignore_stopwords=True)
			self.german_stopwords_set=set(stopwords.words('german'))
			if self.lookup:
				x=[]
				for y in kundenstopset:
					x.append(self.stemmerG.stem(y))
				kundenstopset=set(x)
				self.german_stopwords_set.update(kundenstopset)
		if self.language=='en':	
			self.stemmerE = SnowballStemmer("english", ignore_stopwords=True)
			self.english_stopwords_set=set(stopwords.words('english'))
			if self.lookup:
				self.english_stopwords_set.update(kundenstopset)
				x=[]
				for y in kundenstopset:
					x.append(self.stemmerE.stem(y))
				kundenstopset=set(x)
		if self.language=='mix':
			self.stemmerG = SnowballStemmer("german", ignore_stopwords=True)
			self.german_stopwords_set=set(stopwords.words('german'))
			self.stemmerE = SnowballStemmer("english", ignore_stopwords=True)
			self.english_stopwords_set=set(stopwords.words('english'))
			if self.lookup:
				x=[]
				for y in kundenstopset:
					x.append(self.stemmerG.stem(y))
				kundenstopset=set(x)
				self.german_stopwords_set.update(kundenstopset)
				self.english_stopwords_set.update(kundenstopset)
		return self

	def stream(self, records):
		for record in records:
			record[self.fieldName] = find_language_stem_remove_stopwords(record[self.preprocessField],self)
			yield record

dispatch(TextPreprocessingCommand, sys.argv, sys.stdin, sys.stdout, __name__)


# Variante mit Intersplunk
#import splunk.Intersplunk
#results,unused1,unused2 = splunk.Intersplunk.getOrganizedResults()
#
#for result in results:
#	result["shape"] = "test"
#
#splunk.Intersplunk.outputResults(results)

