#!/usr/bin/env python3

from xml.dom import minidom
from xml.dom.minidom import getDOMImplementation
impl = getDOMImplementation()
import json
from pathlib import Path as P



def ato_date_to_xml(date):
	d = date.split('/') # dmy
	return f'{d[2]}-{d[1]}-{d[0]}' # ymd

def ato_monetary_to_float_str(s):
	return s.replace('$', '').replace(',', '')


print( __name__)

if __name__ == '__main__':
	
	for f in P('data/').glob('*.json'):
		print(f)

		with open(f, 'r') as f:
			j = json.load(f)

		id = j['id']

		case_dir = P(f'endpoint_tests/loan/good_calc_autogen/{id}')
		case_dir.mkdir(parents=True)

		inputs_dir = case_dir / 'request'
		inputs_dir.mkdir(parents=True)

		outputs_dir = case_dir/ 'responses'
		outputs_dir.mkdir(parents=True)

		response_fn = case_dir / 'response.json'
		with open(response_fn, 'w') as f:
			json.dump(200, f)

		income_year_of_computation = j['inputs']['incomeYearOfEnquiring']
		opening_balance = j['inputs']['amalgamatedLoanNotPaidByEOIY']

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
	
			income_year_of_loan_creation	 = j['inputs']['incomeYearOfLoan']
			full_term_of_loan_in_years		 = j['inputs']['fullTermOfAmalgamatedLoan']
			lodgement_day_of_private_company = j['inputs']['lodgement_date']

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

			doc = impl.createDocument(None, "LoanSummary", None)
			root = doc.documentElement
			
			def add(name, value):
				e = root.appendChild(doc.createElement(name))
				e.appendChild(doc.createTextNode(str(value)))

			totalAmountOfRepayment = ato_monetary_to_float_str(j['outputs']['totalAmountOfRepaymentFormatted'])
			minimumYearRepayment   = ato_monetary_to_float_str(j['outputs']['minimumYearRepaymentFormatted'])
			
			shortfall = max(0, float(minimumYearRepayment) - float(totalAmountOfRepayment))

			# i forgot to take closing balance. But we can parse it from alert.
			enquiryYearEndDisplay = j['outputs']['enquiryYearEndDisplay']
			xxx = j['alert'].split('$')
			
			ClosingBalance = xxx[-1]
			expected = f"""\n\nClosing balance\n\nDate: {enquiryYearEndDisplay}\n\nBalance: ${ClosingBalance}"""
			if not j['alert'].endswith(expected):
				raise Exception(f"""unexpected alert format, expected: {expected}, got: {j['alert']}""")
			
			add('IncomeYear'		, income_year_of_computation)
			add('OpeningBalance'	, opening_balance)
			add('InterestRate'		, j['outputs']['enquiryRateFormatted'][:-1])
			add('MinYearlyRepayment', minimumYearRepayment)
			add('TotalRepayment'	, totalAmountOfRepayment) # note that all the ato calculations are only for one year, while our calc would sum up all calculations across all years, if provided 	
			add('RepaymentShortfall', shortfall)
			add('TotalInterest'		, ato_monetary_to_float_str(j['outputs']['totalInterestFormatted']))
			add('TotalPrincipal'	, ato_monetary_to_float_str(j['outputs']['principalFormatted']))
			add('ClosingBalance'	, ato_monetary_to_float_str(ClosingBalance))

			with open(response_fn, 'w') as f:
				f.write(doc.toprettyxml(indent='\t'))

		write_response_xml()
		
		
	print('done')