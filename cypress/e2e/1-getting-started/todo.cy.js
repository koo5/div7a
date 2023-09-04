/// <reference types="cypress" />

/*
python3 -m pip install -U "watchdog[watchmedo]"
watchmedo auto-restart -q -d data -- fish -c 'cd data; echo -e "\n\n\n"; tail -n 55555555 -f (ls -t . | head -1)'
*/

describe('example to-do app', () => {
  beforeEach(() => {
	cy.visit('https://www.ato.gov.au/Calculators-and-tools/Host/?anchor=DIV7A#DIV7A/questions')
	cy.viewport(1000, 1080)
	idx = 0;
  })

  it('generate_testcase', () => {

	cy.contains('Calculate a minimum yearly repayment and the amount of the loan not repaid by the end of an income year').click()
	cy.get('[id=ddl-incomeYearOfLoan]').find('option').each(($el) => {
		let incomeYearOfLoan_text = $el[0].innerText;
		if (incomeYearOfLoan_text != " - Select -")
		{
			
			let incomeYearOfLoan_number = Number(incomeYearOfLoan_text.substring(0, 4)) + 1
			cy.get('[id=ddl-incomeYearOfLoan]').select(incomeYearOfLoan_text);
			cy.get('[id=vrb-loanType-span-1]').click();
			
			let tc0 = {
				incomeYearOfLoan:incomeYearOfLoan_number,
			};

			var termsArr = Array.from({length:7},(v,k)=>k+1)
			cy.wrap(termsArr).each((term) => 
			{
				cy.get('[id=textfullTermOfAmalgamatedLoan]').type('{selectall}{backspace}' + term,{delay: 0});

				cy.get('[id=ddl-incomeYearOfEnquiring]').find('option').each(($el) => {
					let incomeYearOfEnquiring_text = $el[0].innerText;
					if (incomeYearOfEnquiring_text !== " - Select -")
					{
						let incomeYearOfEnquiring_number = Number(incomeYearOfEnquiring_text.substring(0, 4)) + 1

						cy.log('selecting ' + incomeYearOfEnquiring_text);
						cy.get('[id=ddl-incomeYearOfEnquiring]').select(incomeYearOfEnquiring_text);
						
						let amalgamatedLoanNotPaidByEOIY;
						if (Math.random() < 0.5)
							amalgamatedLoanNotPaidByEOIY = Math.floor(Math.random() * 12300)
						else
							amalgamatedLoanNotPaidByEOIY = Math.random() * 123000000
						
						cy.get('[id=textamalgamatedLoanNotPaidByEOIY]').type('{selectall}{backspace}' + amalgamatedLoanNotPaidByEOIY,{delay: 0});
						cy.get('[id=vrb-calculateAmountOfTheAmalgamatedLoan-span-0]').click();

						let tc = {
							repayments:[],
							...tc0,
							fullTermOfAmalgamatedLoan: term,
							incomeYearOfEnquiring:incomeYearOfEnquiring_number,
							amalgamatedLoanNotPaidByEOIY:amalgamatedLoanNotPaidByEOIY,
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
						}

						cy.wrap(tc.repayments).each((r) =>
						{		
							cy.get('[id="btn_repayment_add"]').click();
							cy.get('[id="textdateOfLoanRepaymentadd"]').type('{selectall}{backspace}' + r.rd,{delay: 0});
							cy.get('[id="textamountOfRepaymentadd"]').type('{selectall}{backspace}' + r.ra,{delay: 0});
							cy.get('[id="btn_repayment_save"]').click()
							f1(tc,incomeYearOfEnquiring_number,incomeYearOfLoan_number);
						});

						cy.wrap(tc.repayments).each((_) => 
						{
							cy.get('[id^="toggle_collapseMethod_repayment"]').first().click()
							cy.get('[id="btn_repayment_delete"]').first().click()
						});						
					}	
				});
			});
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

		var dates = [];
		for (var d = new Date(min); d <= max; d.setDate(d.getDate() + 100))
			dates.push(new Date(d));
		
		cy.wrap(dates).each((d) =>
		{
			lodgement_f(tc, d)
		});
		
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

var idx = 0;

function f2(tc0)
{
	cy.contains('Show result').first().trigger('click').then(() => {
	
		let outputs = {}
		let tc = {
			inputs: tc0,
			outputs,
			id: new Date().toISOString() + Math.random(),
			idx: idx++,
		}

		cy.wrap(db(outputs,'enquiryRateFormatted'), {log:true})
		cy.wrap(db(outputs,'enquiryYearEndMinusOneDisplay'), {log:true})
		cy.wrap(db(outputs,'amalgamatedLoanNotPaidByEOIYFormatted'), {log:true})
		cy.wrap(db(outputs,'openingBalancePayDays'), {log:true})
		cy.wrap(db(outputs,'openingBalanceInterestFormatted'), {log:true})
		cy.wrap(db(outputs,'totalAmountOfRepaymentFormatted'), {log:true})
		cy.wrap(db(outputs,'totalInterestFormatted'), {log:true})
		cy.wrap(db(outputs,'principalFormatted'), {log:true})
		cy.wrap(db(outputs,'enquiryYearEndDisplay'), {log:true})
		cy.wrap(db(outputs,'minimumYearRepaymentFormatted'), {log:true})
		
		cy.get('.alert-attention').then(($el) => {outputs['alert'] = $el[0].innerText})
	
		cy.writeFile('data/' + tc.idx + '_' + tc.id + '.json', tc)
	})
}

function db(tc, k)
{
	cy.get('[data-bind="text: '+k+'"]').then(($el) => {tc[k] = $el[0].innerText});
}