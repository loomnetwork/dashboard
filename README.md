# battleground-marketplace

To run it:

```
yarn run serve
```

To build it:

```
yarn run build
```

Part of the build step is prerendering the pages, which uses puppeteer to drive a headless chrome browser. Make sure to install all dependencies.

# Blockchain and Smart Contracts

Run Ganache cli.

```
ganache-cli
```

Compile contracts
```
yarn run compile
```

Deploy contracts
```
yarn run deploy:ganache
```


# Trouble shooting

## "sh: 1: vue-cli-service: not found"

```
yarn install

```


# import card data from google sheet
The import script is `import-sheet.js` in the root, before you run it, you need to do
- run `yarn install`
- Get Google Drive Authentication:

    -  Create a credentials.json file for your app here : https://console.developers.google.com/
    - create a new project (input some random info for the fields like *name*, *service account*, etc. it's not important )
    - enable the __Drive API__
    - in __Credentials__, click __Create credentials__  and then select `Service account key`
    -
    - rename the credential file as `ZBBattleGround-card-sheet-key.json` and put it into the root folder,  or other name and location, then you need to modify the script
    - don't worry about the credential privacy, it's already ignored in `.gitignore`, won't uploaded
    - Share the target google spreadsheet with the __client_email__ from the __credentials.json__. (or as the owner to give view permission to the client email)
- run `yarn import-sheet`

the card data should be imported to `src/data/cards.json`


# Quick links

* [Staging site](https://stage.loom.games/battleground-marketplace/)
* [Github](https://github.com/loomnetwork/ops/issues/204)
* [Jenkins job](https://ci.kanwisher.com/job/loom.games-battleground-market-staging/)

