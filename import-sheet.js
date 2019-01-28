/* eslint-disable */
const sheetToJson = require('spreadsheet-to-json')

const sheetUrl =
  'https://docs.google.com/spreadsheets/d/188glBf8hCCeAE_kpygAceRZnyjzBRaAe8SyoKqGr7uQ/edit#gid=1823698452'
const keyFile = './ZBBattleGround-card-sheet-key.json'
const fs = require('fs')

const destFile = 'src/data/cards.json'

const getSheetKeyFromURL = function (url) {
  return url.match(/\/d\/(\w+)/)[1]
}

const writeDataToFile = function (data) {
  fs.writeFileSync(destFile, JSON.stringify(data, null, 2))
}

const prepareCards = function (cards) {
  const newCards = cards.map(card => {
    const newCard = {}
    for (const key in card) {
      if (Object.prototype.hasOwnProperty.call(card, key)) {
        const newKey = key.toLowerCase().replace(/\s+/gi, '_')
        const newValue = key !== 'MOULD TYPE' && !isNaN(card[key]) ? parseInt(card[key]) : card[key]
        newCard[newKey] = newValue
      }
    }
    return newCard
  })

  return { cards: newCards }
}

sheetToJson.extractSheets(
  {
    spreadsheetKey: getSheetKeyFromURL(sheetUrl),
    credentials: require(keyFile),
    sheetsToExtract: []
  },
  (err, data) => {
    if (data) {
      // there should be only one sheet, so the for here is ok
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          writeDataToFile(prepareCards(data[key]))
        }
      }
    }
  }
)
