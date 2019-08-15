describe('Redelegation Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()
  })

  it('Redelegating test-z-us1-dappchains-2-aws1 to jaab', () => {

    cy.get('.list-group')
      .find('.list-group-item')
      .as('stakes-list')
      
    cy.get('@stakes-list').then(($items) => {
      let count = {
        'aws1': 0,
        'jaab': 0
      }

      for (var i = 0; i < $items.length; i++) {
        if ($items[i].innerText.includes('test-z-us1-dappchains-2-aws1')) {
          count['aws1']++
        } else if ($items[i].innerText.includes('jaab')) {
          count['jaab']++
        }
      }

      cy.wrap(count['aws1'] - 1).as('expectedAws1Count')
      cy.wrap(count['jaab'] + 1).as('expectedJaabCount')
    })

    cy.get('@stakes-list')
      .contains('test-z-us1-dappchains-2-aws1')
      .parents('.list-group-item')
      .contains('button', 'Redelegate').click()

    cy.get('#redelegate-modal')
      .contains('jaab').click()

    cy.get('#redelegate-modal')
      .contains('button', 'Redelegate').click()

    cy.wait(60000)

    cy.get('@stakes-list').then(($items) => {
      let count = {
        'aws1': 0,
        'jaab': 0
      }

      for (var i = 0; i < $items.length; i++) {
        if ($items[i].innerText.includes('test-z-us1-dappchains-2-aws1')) {
          count['aws1']++
        } else if ($items[i].innerText.includes('jaab')) {
          count['jaab']++
        }
      }

      cy.get('expectedAws1Count').should('eq', count['aws1'])
      cy.get('expectedJaabCount').should('eq', count['jaab'])
    })
  })
})
