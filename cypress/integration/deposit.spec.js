describe('Deposit Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.get('#faucet-sidebar')
      .contains('Deposit/Withdraw').click()
  })

  it('Depositing 0.1 LOOM', () => {
    cy.contains('.symbol', 'LOOM')
      .parent()
      .as('token')

    cy.get('@token')
      .find('.balance')
      .first()
      .as('balance')

    cy.get('@balance').then(($span) => {
      const expectedBalance = parseFloat($span.text()) + 0.1

      cy.get('@token')
        .contains('Deposit').click()
  
      cy.get('input').type('0.1')

      cy.contains('Confirm').click()

      cy.contains('OK').click()

      cy.wait(300000)

      cy.get('#faucet-header')
        .should(
          'contain',
          "The deposit has been confirmed. Your plasma balance will be updated after 10 confirmations."
        )

      cy.get('@balance').then(($span) => {
        const actualBalance = parseFloat($span.text())
        expect(actualBalance).to.equal(expectedBalance)
      })
    })
  })

  it('Depositing 0.1 ETH', () => {
    cy.contains('.symbol', 'ETH')
      .parent()
      .as('token')

    cy.get('@token')
      .find('.balance')
      .first()
      .as('balance')

    cy.get('@balance').then(($span) => {
      const expectedBalance = parseFloat($span.text()) + 0.1

      cy.get('@token')
        .contains('Deposit').click()

      cy.get('input').type('0.1')

      cy.contains('Confirm').click()

      cy.wait(300000)

      cy.get('@balance').then(($span) => {
        const actualBalance = parseFloat($span.text())
        expect(actualBalance).to.equal(expectedBalance)
      })
    })
  })
})
