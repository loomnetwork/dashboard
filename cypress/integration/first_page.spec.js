describe('First Page Test', () => {

  it('Sign in with Test Wallet', () => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.url().should('include', '/account')
  })
})