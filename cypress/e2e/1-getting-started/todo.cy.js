/// <reference types="cypress" />

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('https://www.ato.gov.au/Calculators-and-tools/Host/?anchor=DIV7A#DIV7A/questions')
  })

  it('generate_testcase', () => {

    cy.contains('Calculate a minimum yearly repayment and the amount of the loan not repaid by the end of an income year').click()
    
   	/* cypress seems to be a dysfunctional trap. You cannot operate on arrays, all arrays have length zero, no matter how many elements you push to them. Things are getting crazy faster than with selenium. */

    let incomeYearOfLoan_elements = Array();
    cy.get('[id=ddl-incomeYearOfLoan]').find('option').each(($el) => {
    	let e = $el[0];
    	if (e.innerText != " - Select -")
    		incomeYearOfLoan_elements.push(e)
    });
	cy.log(incomeYearOfLoan_elements)
	cy.log(incomeYearOfLoan_elements.length)
	incomeYearOfLoan_elements.forEach((e) => {cy.log(e)});

	//let incomeYearOfLoan_numbers = [];
	/*incomeYearOfLoan_elements.map(
		(_,e) => {
			incomeYearOfLoan_numbers.push(e)
		}
	);*/
	
/*	incomeYearOfLoan_numbers.push(incomeYearOfLoan_elements[0])
	cy.log(incomeYearOfLoan_elements.at(0))
	cy.log(incomeYearOfLoan_numbers)
	cy.log(incomeYearOfLoan_elements)
	
	let min = incomeYearOfLoan_numbers[0];
	let max = incomeYearOfLoan_numbers.at(-1);
	

	generate_testcase2({fail:true, incomeYearOfLoan: min - 10})
	generate_testcase2({fail:true, incomeYearOfLoan: min - 1})
	generate_testcase2({fail:true, incomeYearOfLoan: max + 1})
	generate_testcase2({fail:true, incomeYearOfLoan: max + 10})
	
	incomeYearOfLoan_elements.forEach((e) => {
		e.click();
		generate_testcase2({incomeYearOfLoan: e.innerText})
	});
	
	*/
  })
})

function generate_testcase2(c)
{
	cy.log(c)
}


/*
		cy.get('[id=ddl-incomeYearOfLoan]').select(year.innerText)
		cy.get('[id=txt-loanAmount]').type('10000')
		cy.get('[id=txt-interestRate]').type('10')
		cy.get('[id=txt-repaymentThreshold]').type('


<span data-bind="text: minimumYearRepaymentFormatted">$9,946.00</span>


































*/