describe('Withdrawal Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.get('#faucet-sidebar')
      .contains('Deposit/Withdraw').click()
  })

  it('Withdrawing 1 LOOM', () => {
    cy.contains('.symbol', 'LOOM')
      .parent()
      .as('token')

    cy.get('@token')
      .find('.balance')
      .first()
      .as('balance')

    cy.get('@balance').then(($span) => {
      const expectedBalance = Number($span.text()) - 1
      cy.wrap(expectedBalance).as('expectedBalance')
    })

    cy.get('@token')
      .contains('Withdraw').click()

    cy.get('input').type('1')

    cy.get('#deposit-approval-success button')
      .contains('Withdraw').click()

    cy.get('#withdraw-confirmed p', { timeout: 30000 })
      .should(
        "contain",
        "1 LOOM have been withdrawn out of Basechain. " +
        "Click complete to transfer your funds to your ethereum account."
      )

    cy.get('#withdraw-confirmed button')
      .contains('Complete withdraw').click()

    cy.get('#faucet-header', { timeout: 30000 })
      .should(
        'contain',
        "Transaction sent successfully."
      )

    cy.get('.close').click()

    cy.get('@balance').then(($span) => {
      const actualBalance = Number($span.text())
      cy.get('@expectedBalance').should('eq', actualBalance)
    })
  })

  it('Withdrawing 1 ETH', () => {
    cy.contains('.symbol', 'ETH')
      .parent()
      .as('token')

    cy.get('@token')
      .find('.balance')
      .first()
      .as('balance')

    cy.get('@balance').then(($span) => {
      const expectedBalance = Number($span.text()) - 1
      cy.wrap(expectedBalance).as('expectedBalance')
    })

    cy.get('@token')
      .contains('Withdraw').click()

    cy.get('input').type('1')

    cy.get('#deposit-approval-success button')
      .contains('Withdraw').click()

    cy.get('#withdraw-confirmed p', { timeout: 30000 })
      .should(
        "contain",
        "1 ETH have been withdrawn out of Basechain. " +
        "Click complete to transfer your funds to your ethereum account."
      )

    cy.get('#withdraw-confirmed button')
      .contains('Complete withdraw').click()

    cy.get('#faucet-header', { timeout: 30000 })
      .should(
        'contain',
        "Transaction sent successfully."
      )

    cy.get('.close').click()

    cy.get('@balance').then(($span) => {
      const actualBalance = Number($span.text())
      cy.get('@expectedBalance').should('eq', actualBalance)
    })
  })
})
