/// <reference types="cypress" />

describe('example to-do app', () => {
  beforeEach(() => {
	cy.visit('https://www.ato.gov.au/Calculators-and-tools/Host/?anchor=DIV7A#DIV7A/questions')
  })

  it('generate_testcase', () => {

	cy.contains('Calculate a minimum yearly repayment and the amount of the loan not repaid by the end of an income year').click()
	
	/* cypress seems to be a dysfunctional trap. You cannot operate on arrays, all arrays have length zero, no matter how many elements you push to them. Things are getting crazy faster than with selenium. 
	Also, you must not assign results of cy.get() to variables, because they are not what you think they are.
	*/

	let tree = {incomeYearOfLoan:{}};

	cy.get('[id=ddl-incomeYearOfLoan]').find('option').each(($el) => {
		let incomeYearOfLoan_text = $el[0].innerText;
		if (incomeYearOfLoan_text != " - Select -")
		{
			
			let incomeYearOfLoan_number = Number(incomeYearOfLoan_text.substring(0, 4)) + 1
			cy.get('[id=ddl-incomeYearOfLoan]').select(incomeYearOfLoan_text);
			cy.get('[id=vrb-loanType-span-1]').click();
			
			let tc = {
				incomeYearOfLoan:incomeYearOfLoan_number
			};

			let term = 1;
			for (term = 1; term < 8; term++)
			{
				cy.get('[id=textfullTermOfAmalgamatedLoan]').type('{selectall}{backspace}' + term);

				cy.get('[id=ddl-incomeYearOfEnquiring]').find('option').each(($el) => {
					let incomeYearOfEnquiring_text = $el[0].innerText;
					if (incomeYearOfEnquiring_text !== " - Select -")
					{
						let incomeYearOfEnquiring_number = Number(incomeYearOfEnquiring_text.substring(0, 4)) + 1

						tc = {
							...tc,
							incomeYearOfEnquiring:incomeYearOfEnquiring_number
						}

						cy.log('selecting ' + incomeYearOfEnquiring_text);
						cy.get('[id=ddl-incomeYearOfEnquiring]').select(incomeYearOfEnquiring_text);
						
						let amalgamatedLoanNotPaidByEOIY;
						if (Math.random() < 0.5)
							amalgamatedLoanNotPaidByEOIY = Math.floor(Math.random() * 123)
						else
							amalgamatedLoanNotPaidByEOIY = Math.random() * 123000000
						
						tc = {
							...tc,
							amalgamatedLoanNotPaidByEOIY:amalgamatedLoanNotPaidByEOIY
						}

						cy.get('[id=textamalgamatedLoanNotPaidByEOIY]').type('{selectall}{backspace}' + amalgamatedLoanNotPaidByEOIY);
						cy.get('[id=vrb-calculateAmountOfTheAmalgamatedLoan-span-0]').click();

						
						
						
						tc = {
							...tc,
							repayments:[]
						}

						let num_repayments = Math.floor(Math.random() * 12); 
						for (var repayment_idx = 0; repayment_idx < num_repayments; repayment_idx++)
						{
							cy.get('[id="btn_repayment_add"]').click().then(() => 
							{
								let rd = '1/1/2020'
								let ra = '100'
								tc.repayments.push({rd,ra})
								
								cy.get('[id="textdateOfLoanRepaymentadd"]').type('{selectall}{backspace}' + rd);
								cy.get('[id="textamountOfRepaymentadd"]').type('{selectall}{backspace}' + ra);
								cy.get('[id="btn_repayment_save"]').click().then(f1(tc,incomeYearOfEnquiring_number,incomeYearOfLoan_number));
							}
							);
						}
					}	
				})
			}
		}
	});
  })
})

function f1(tc,incomeYearOfEnquiring_number,incomeYearOfLoan_number)
{
	if (incomeYearOfEnquiring_number - incomeYearOfLoan_number > 1)
	{
		f2({
			...tc,
			lodgement_date_string:lodgement_date_string
		})
	}
	else
	{

		let min = new Date(incomeYearOfLoan_number,  7-1, 1);
		let max = new Date(incomeYearOfLoan_number+1,6-1, 30);

		for (var d = new Date(min); d <= max; d.setDate(d.getDate() + 1))
		{
			let lodgement_date_string = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
			
			cy.get('[id=textlodgmentDate]').type('{selectall}{backspace}' + lodgement_date_string);
	
			f2({
				...tc,
				lodgement_date_string:lodgement_date_string
			})
									
		}

	}
}

function f2(tc)
{
								
	cy.contains('Show result').click();
			
	tc = {
		...tc,
		minimumYearRepaymentFormatted: cy.get('[data-bind="text: minimumYearRepaymentFormatted"]').innerText,
		enquiryRateFormatted: cy.get('[data-bind="text: enquiryRateFormatted"]').innerText
	}

	cy.writeFile(new Date().toISOString() + Math.random() + '.json', tc);
	
}


/*
//cy.log(parseInt(v));

		cy.get('[id=txt-loanAmount]').type('10000')
		cy.get('[id=txt-interestRate]').type('10')
		cy.get('[id=txt-repaymentThreshold]').type('


<span data-bind="text: minimumYearRepaymentFormatted">$9,946.00</span>


































*/