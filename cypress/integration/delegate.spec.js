describe('Delegation Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.get('#faucet-sidebar')
      .contains('Validators').click()
  })

  it('Delegating 1 LOOM/2 weeks to test-z-us1-dappchains-2-aws1', () => {
    cy.contains('td', 'test-z-us1-dappchains-2-aws1').click()

    cy.get('.list-group')
      .find('.list-group-item')
      .as('stakes-list')
      
    cy.get('@stakes-list').then(($items) => {
      const expectedStakesCount = $items.length + 1
      cy.wrap(expectedStakesCount).as('expectedStakesCount')
    })

    cy.contains('button', 'Stake tokens').click()

    cy.get('#delegation-amount-input').type('1')

    cy.get('#faucet-delegate-modal')
      .contains('2 weeks').click()

    cy.get('#faucet-delegate-modal')
      .contains('delegate').click()

    cy.wait(20000)

    cy.get('@stakes-list').then(($items) => {
      const actualStakesCount = $items.length + 1
      cy.get('@expectedStakesCount').should('eq', actualStakesCount)

      expect($items[0]).to.contain.text('1 LOOM')
      expect($items[0]).to.contain.text('2 weeks')
    })
  })
})
