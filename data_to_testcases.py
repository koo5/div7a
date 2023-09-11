#!/usr/bin/env python3

from xml.dom import minidom
from xml.dom.minidom import getDOMImplementation
impl = getDOMImplementation()
import json
from pathlib import Path as P



def ato_date_to_xml(date):
	d = date.split('/') # dmy
	return f'{d[2]}-{d[1]}-{d[0]}' # ymd


print( __name__)

if __name__ == '__main__':
	
	for f in P('data/').glob('*.json'):
		print(f)

		with open(f, 'r') as f:
			j = json.load(f)

		id = j['id']

		case_dir = P(f'../endpoint_tests/loan/good_calc_autogen/{id}')
		case_dir.mkdir(parents=True)

		inputs_dir = case_dir / 'request'
		inputs_dir.mkdir(parents=True)

		outputs_dir = case_dir/ 'responses'
		outputs_dir.mkdir(parents=True)

	
		def write_request_xml():
	
			request_fn = inputs_dir / 'request.xml'
	
			doc = impl.createDocument(None, "reports", None)
			loan = doc.documentElement.appendChild(doc.createElement('loanDetails'))
			
			agreement = loan.appendChild(doc.createElement('loanAgreement'))
			repayments = loan.appendChild(doc.createElement('loanAgreement'))
	
			def field(name, value):
				field = agreement.appendChild(doc.createElement('field'))
				field.setAttribute('name', name)
				field.setAttribute('value', str(value))
	
			income_year_of_loan_creation = j['inputs']['incomeYearOfLoan']
			full_term_of_loan_in_years = j['inputs']['fullTermOfAmalgamatedLoan']
			opening_balance = j['inputs']['amalgamatedLoanNotPaidByEOIY']
			lodgement_day_of_private_company = j['inputs']['lodgement_date']
			income_year_of_computation = j['inputs']['incomeYearOfEnquiring']
	
			field('Income year of loan creation', income_year_of_loan_creation)
			field('Full term of loan in years', full_term_of_loan_in_years)
			#field('Principal amount of loan', principal_amount_of_loan)
			if lodgement_day_of_private_company is not None:
				field('Lodgement day of private company', ato_date_to_xml(lodgement_day_of_private_company))
			field('Income year of computation', income_year_of_computation)
			field('Opening balance of computation', opening_balance)
			
			for r in j['repayments']:
				repayment = repayments.appendChild(doc.createElement('repayment'))
				repayment.setAttribute('date', ato_date_to_xml(r['rd']))
				repayment.setAttribute('amount', str(r['ra']))
				
			with open(request_fn, 'w') as f:
				f.write(doc.toprettyxml(indent='\t'))


		write_request_xml()
		
		def write_response_xml():
			response_fn = outputs_dir / 'response.xml'

	
	
	
		
	print('done')