import BN from 'bn.js'
import BigNumber from "bignumber.js"

describe('Undelegation Test', () => {

  before(() => {
    cy.visit('https://localhost:8080')

    cy.contains('Metamask (Test Wallet)').click()

    cy.wait(3000)
  })

  it('Undelegating 0.1 LOOM', () => {
    cy.get('[data-cy=plasma-loom-balance]').then((elem) => {
      const text = elem.text()
      const amountBN = parseToWei(text.slice(0, text.indexOf(' LOOM')))
      const expectedBalance = formatTokenAmount(amountBN.add(parseToWei('0.1')))

      cy.wrap(expectedBalance).as('expectedBalance')
    })

    cy.get('#delegations-container')
      .find('button').not('.disabled')
      .contains('button', 'Undelegate').click()
      .parents('.list-group-item')
      .as('delegation')

    cy.get('@delegation')
      .contains('dd', 'LOOM')
      .then((dd) => {
        const text = dd.text()
        const amountBN = parseToWei(text.slice(0, text.indexOf(' LOOM')))
        const expectedAmountDelegated = formatTokenAmount(amountBN.sub(parseToWei('0.1')))

        cy.wrap(expectedAmountDelegated).as('expectedAmountDelegated')
      })

    cy.get('input').type('0.1')

    cy.get('#faucet-delegate-modal')
      .contains('button', 'Undelegate').click()

    cy.wait(40000)

    cy.get('@delegation')
      .contains('dd', 'LOOM')
      .then((dd) => {
        const text = dd.text()
        cy.get('@expectedAmountDelegated').should('eq', text.slice(0, text.indexOf(' LOOM')))
      })

    cy.get('[data-cy=plasma-loom-balance]').then((elem) => {
      const text = elem.text()
      cy.get('@expectedBalance').should('eq', text.slice(3, text.indexOf(' LOOM')))
    })
  })
})

function parseToWei(amount, decimal = 18) {
  // BN is ints only
  const bigNumber = new BigNumber(amount).multipliedBy(10 ** decimal)
  return new BN(bigNumber.toFixed())
}

function formatTokenAmount(wei, decimals = 18, precision) {
  if (!wei) return wei
  const c = new BigNumber(wei.toString()).dividedBy(10 ** decimals)
  return c.toFormat(precision)
}
