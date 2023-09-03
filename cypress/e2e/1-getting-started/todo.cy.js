/// <reference types="cypress" />

describe('example to-do app', () => {
  beforeEach(() => {
	cy.visit('https://www.ato.gov.au/Calculators-and-tools/Host/?anchor=DIV7A#DIV7A/questions')
	//cy.clock()
	cy.viewport(1000, 2080)
	
  })

  it('generate_testcase', () => {

	cy.contains('Calculate a minimum yearly repayment and the amount of the loan not repaid by the end of an income year').click()
	
	/* You must not assign results of cy.get() to variables, because they are not what you think they are.
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
				cy.get('[id=textfullTermOfAmalgamatedLoan]').type('{selectall}{backspace}' + term,{delay: 0});

				cy.get('[id=ddl-incomeYearOfEnquiring]').find('option').each(($el) => {
					let incomeYearOfEnquiring_text = $el[0].innerText;
					if (incomeYearOfEnquiring_text !== " - Select -")
					{
						let incomeYearOfEnquiring_number = Number(incomeYearOfEnquiring_text.substring(0, 4)) + 1

						tc = {
							...tc,
							fullTermOfAmalgamatedLoan: term,
							incomeYearOfEnquiring:incomeYearOfEnquiring_number
						}

						cy.log('selecting ' + incomeYearOfEnquiring_text);
						cy.get('[id=ddl-incomeYearOfEnquiring]').select(incomeYearOfEnquiring_text);
						
						let amalgamatedLoanNotPaidByEOIY;
						if (Math.random() < 0.5)
							amalgamatedLoanNotPaidByEOIY = Math.floor(Math.random() * 12300)
						else
							amalgamatedLoanNotPaidByEOIY = Math.random() * 123000000
						
						tc = {
							...tc,
							amalgamatedLoanNotPaidByEOIY:amalgamatedLoanNotPaidByEOIY
						}

						cy.get('[id=textamalgamatedLoanNotPaidByEOIY]').type('{selectall}{backspace}' + amalgamatedLoanNotPaidByEOIY,{delay: 0});
						cy.get('[id=vrb-calculateAmountOfTheAmalgamatedLoan-span-0]').click();

							
						tc = {
							...tc,
							repayments:[]
						}

						let remaining = amalgamatedLoanNotPaidByEOIY;
						let min = new Date(incomeYearOfEnquiring_number-1 ,7-1, 1);
						let max = new Date(incomeYearOfEnquiring_number   ,6-1, 30);
						let sparsity = Math.floor(Math.random() * 1000);
						let start = new Date(min);
						start.setDate(start.getDate() + Math.floor(Math.random() * sparsity));
						for (var d = new Date(min); d <= max && remaining > 0; d.setDate(d.getDate() + 1 + Math.floor(Math.random() * sparsity)))
						{
							let rd = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
							let ra = Math.floor(Math.random() * 10000);
							if (tc.repayments.length > 50)
								ra *= 1000;
							remaining -= ra;
							if (remaining < 0)
								ra += remaining;

							tc.repayments.push({rd,ra})
							
							cy.get('[id="btn_repayment_add"]').click();
							cy.get('[id="textdateOfLoanRepaymentadd"]').type('{selectall}{backspace}' + rd,{delay: 0});
							cy.get('[id="textamountOfRepaymentadd"]').type('{selectall}{backspace}' + ra,{delay: 0});
							cy.get('[id="btn_repayment_save"]').click()
							f1(tc,incomeYearOfEnquiring_number,incomeYearOfLoan_number);
						}

						for (var i = 0; i < tc.repayments.length; i++)
						{
							cy.get('[id^="toggle_collapseMethod_repayment"]').first().click()
							cy.get('[id="btn_repayment_delete"]').first().click()
						}						
					}	
				});
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
			lodgement_date_string:null
		})
	}
	else
	{
		let min = new Date(incomeYearOfLoan_number,  7-1, 1);
		let max = new Date(incomeYearOfLoan_number+1,6-1, 30);

		for (var d = new Date(min); d <= max; d.setDate(d.getDate() + 100))
		{
			lodgement_f(tc, d)
		}
		lodgement_f(tc, max);
	}
}

function lodgement_f(tc, d)
{
	let lodgement_date_string = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
	cy.get('[id=textlodgmentDate]').type('{selectall}{backspace}' + lodgement_date_string,{delay: 0});
	cy.get('[data-bind="text: pageTitle"]').click()
	f2({
		...tc,
		lodgement_date_string:lodgement_date_string
	})
}

function f2(tc0)
{
	//cy.wait(100)
	//cy.scrollTo('bottom', {ensureScrollable: false})
	//cy.wait(10000)
	//cy.contains('Show result').should('exist').should('be.visible').click();
	
	cy.contains('Show result').first().trigger('click')
	//cy.wait(10000)
	
	let tc = {
		...tc0,
		id: new Date().toISOString() + Math.random()
	}
	cy.get('.alert-attention').then(($el) => {tc['alert'] = $el[0].innerText});
	db(tc,'enquiryRateFormatted')
   	db(tc,'enquiryYearEndMinusOneDisplay')
   	db(tc,'amalgamatedLoanNotPaidByEOIYFormatted')
   	db(tc,'openingBalancePayDays')
   	db(tc,'openingBalanceInterestFormatted')
   	db(tc,'totalAmountOfRepaymentFormatted')
   	db(tc,'totalInterestFormatted')
   	db(tc,'principalFormatted')
   	db(tc,'enquiryYearEndDisplay')
   	db(tc,'minimumYearRepaymentFormatted')
        	
	cy.writeFile('data/' + tc.id + '.json', tc)
	cy.writeFile('data/last.json', tc);
}

function db(tc, k)
{
	cy.get('[data-bind="text: '+k+'"]').then(($el) => {tc[k] = $el[0].innerText});
}