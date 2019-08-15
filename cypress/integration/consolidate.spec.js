describe('Consolidation Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.wait(3000)

    cy.get('#faucet-sidebar')
      .contains('Validators').click()
  })

  it('Consolidating delegations in test-z-us1-dappchains-2-aws1', () => {
    cy.contains('td', 'test-z-us1-dappchains-2-aws1').click()

    cy.contains('button', 'Consolidate').click()

    cy.get('button:contains(Undelegate)')
      .not('.disabled')
      .should('have.length', '1')
  })
})
