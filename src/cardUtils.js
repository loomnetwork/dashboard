/* eslint-disable */
import CardDetails from './data/cardDetail'
import Cards from './data/cards'

export const defaultCardData = {
  display_name: 'Card',
  priceInUSD: 0.0,
  priceInETH: 0.0,
  image: require(`@/statics/cards/question_card.png`),
  title: 'A Great Zombie',
  inventory: 0,
  variation: 'Standard Edition',
  mould_type: 0,
}

export const cardLevelImageSufix = {
  'limited': '_LE'
}

export function parseImageURL(img) {
  const assetsPath = 'cards'
  return `${assetsPath}/${img}.png` || defaultCardData.image
}

export function filterCardInfo(card) {
  card.image = require(`@/statics/${parseImageURL(card.image)}`)
  card.priceInETH = card.price_in_eth || defaultCardData.priceInETH
  card.priceInUSD = card.price_in_usd || defaultCardData.priceInUSD
  card.inventory = card.inventory || defaultCardData.inventory
  return card
}

export function getCardByTokenId(tokenId) {
  const cardDetail = CardDetails[tokenId]
  let card = Object.assign({}, Cards.cards.find(cd => parseInt(cd.mould_type, 10) === cardDetail.mouldId))
  let variation = cardDetail.variant.replace('-edition', '')
  card.variation = variation === 'backers' ? 'backer' : variation
  card.tokenId = tokenId
  card.image = getCardImageByLevel(card)
  return card
}

export function parseOwnedCards(ownedCards) {
  const cards = ownedCards
  let myCards = []
  Object.keys(cards)
    .forEach(token => {
      let card = getCardByTokenId(token)
      card.amount = cards[token]
      myCards.push(card)
    })
  return myCards
}

export function getCardImageByLevel(card) {
  if (cardLevelImageSufix.hasOwnProperty(card.variation)) {
    return card.mould_type + cardLevelImageSufix[card.variation]
  }
  return card.mould_type

}
