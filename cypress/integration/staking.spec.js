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

  describe('Validator detail page', () => {
    it('Validators detail should have correct info', () => {
      cy.get('#faucet-sidebar')
        .contains('Validators').click()

      cy.contains('td', 'test-z-us1-dappchains-2-aws1').click()

      cy.get('.validator-details header')
        .children()
        .should(($elements) => {
          expect($elements).to.have.length(4)
          expect($elements.eq(0)).to.contain('test-z-us1-dappchains-2-aws1')
          expect($elements.eq(1).text().slice(0, 4)).to.eq('loom')
        })

      cy.get('dl > dt').should(($dts) => {
        expect($dts).to.have.length(5)
        expect($dts.eq(0)).to.contain('State:')
        expect($dts.eq(1)).to.contain('Recently Missed Blocks')
        expect($dts.eq(2)).to.contain('Delegators Stake')
        expect($dts.eq(3)).to.contain('Total Staked')
        expect($dts.eq(4)).to.contain('Fee')
      })
    })
  })
})
