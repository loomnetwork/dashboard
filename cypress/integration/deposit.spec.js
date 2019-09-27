describe('Deposit Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.get('#faucet-sidebar')
      .contains('Deposit/Withdraw').click()
  })

  it('Depositing 1 LOOM', () => {
    cy.contains('.symbol', 'LOOM')
      .parent()
      .as('token')

    cy.get('@token')
      .find('.balance')
      .first()
      .as('balance')

    cy.get('@balance').then(($span) => {
      const expectedBalance = Number($span.text()) + 1
      cy.wrap(expectedBalance).as('expectedBalance')
    })

    cy.get('@token')
      .contains('Deposit').click()

    cy.get('input').type('1')

    cy.contains('Confirm').click()

    cy.contains('OK').click()

    cy.wait(300000)

    cy.get('#faucet-header')
      .should(
        'contain',
        "The deposit has been confirmed. " +
        "Your Basechain balance will be updated after 10 confirmations."
      )

    cy.get('.close').click()

    cy.get('@balance').then(($span) => {
      const actualBalance = Number($span.text())
      cy.get('@expectedBalance').should('eq', actualBalance)
    })
  })

  it('Depositing 1 ETH', () => {
    cy.contains('.symbol', 'ETH')
      .parent()
      .as('token')

    cy.get('@token')
      .find('.balance')
      .first()
      .as('balance')

    cy.get('@balance').then(($span) => {
      const expectedBalance = Number($span.text()) + 1
      cy.wrap(expectedBalance).as('expectedBalance')
    })

    cy.get('@token')
      .contains('Deposit').click()

    cy.get('input').type('1')

    cy.contains('Confirm').click()

    cy.wait(300000)

    cy.get('@balance').then(($span) => {
      const actualBalance = Number($span.text())
      cy.get('@expectedBalance').should('eq', actualBalance)
    })
  })
})
