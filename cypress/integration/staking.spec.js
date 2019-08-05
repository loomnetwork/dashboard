describe('Staking Test', () => {

  beforeEach(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.wait(3000)
  })

  afterEach(() => {
    cy.get('#faucet-sidebar')
      .contains('Sign out').click()
  })

  describe('Validator list', () => {
    it('Validators list should have at least 4 validator', () => {
      cy.get('#faucet-sidebar')
        .contains('Validators').click()

      cy.get('tbody')
        .find('tr')
        .then(($items) => {
          expect($items.length).to.gte(4)
        })
    })
  })
})
