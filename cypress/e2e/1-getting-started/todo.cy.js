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
			//let subtree = {};
			//tree.incomeYearOfLoan[incomeYearOfLoan_text] = subtree;
			cy.get('[id=vrb-loanType-span-1]').click();
			
			let term = 1;
			for (term = 1; term < 8; term++)
			{
				cy.get('[id=textfullTermOfAmalgamatedLoan]').type('{selectall}{backspace}' + term);

				cy.get('[id=ddl-incomeYearOfEnquiring]').find('option').each(($el) => {
					let incomeYearOfEnquiring_text = $el[0].innerText;
					if (incomeYearOfEnquiring_text !== " - Select -")
					{
						let incomeYearOfEnquiring_number = Number(incomeYearOfEnquiring_text.substring(0, 4)) + 1
						cy.log('selecting ' + incomeYearOfEnquiring_text);
						cy.get('[id=ddl-incomeYearOfEnquiring]').select(incomeYearOfEnquiring_text);
						
						cy.get('[id=textamalgamatedLoanNotPaidByEOIY]').type('{selectall}{backspace}' + 123);
						cy.get('[id=vrb-calculateAmountOfTheAmalgamatedLoan-span-0]').click();
						
						if (incomeYearOfEnquiring_number - incomeYearOfLoan_number == 1)
						{
												
							cy.get('[id=textlodgmentDate]').then(($el) => {
		
								let min = new Date(incomeYearOfLoan_number,  7-1, 1);
								let max = new Date(incomeYearOfLoan_number+1,6-1, 30);
		
								for (var d = new Date(min); d <= max; d.setDate(d.getDate() + 1))
								{
									let lodgement_date_string = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
									
									cy.get('[id=textlodgmentDate]').type('{selectall}{backspace}' + lodgement_date_string)
									
									
									
								}
							});
						}
						
						

						
						cy.log('done.');
					}	
				})
			}
		}
	});
  })
})

function generate_testcase2(c)
{
	cy.log(c)
}


/*
//cy.log(parseInt(v));

		cy.get('[id=txt-loanAmount]').type('10000')
		cy.get('[id=txt-interestRate]').type('10')
		cy.get('[id=txt-repaymentThreshold]').type('


<span data-bind="text: minimumYearRepaymentFormatted">$9,946.00</span>


































*/