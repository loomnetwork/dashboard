#!/bin/bash -ex

export SENTRY_ORG=loom-network
export SENTRY_PROJECT=loomgames-frontend
#export SENTRY_AUTH_TOKEN= #this is on the CI SERVER



PRESET_MOBILE="m-dashboard.dappchains.com"
PRESET_DEV="dev-dashboard.dappchains.com"
PRESET_STAGE="stage-dashboard.dappchains.com" #future production
PRESET_PROD="dashboard.dappchains.com"
FAUCET_PATH='dashboard.dappchains.com'
ALT_FAUCET_PATH="wallet.loomx.io"

# You probably don't need to modify this stuff.
if [ "$GIT_BRANCH" == '' ]; then
  GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`
fi
BRANCH_CHOICE=${1:-$GIT_BRANCH}


# This is where you add any extra branches you want to recognise.
case "$BRANCH_CHOICE" in
  origin/master|master)
    FAUCET_PATH="${PRESET_PROD}"
  ;;
  origin/staging|staging)
    FAUCET_PATH="${PRESET_STAGE}"
  ;;
  origin/develop|develop)
    FAUCET_PATH="${PRESET_DEV}"
  ;;
  origin/mobile-ui|mobile-ui)
    FAUCET_PATH="${PRESET_MOBILE}"
  ;;
  *)
    echo "Sanity check failed. You are trying to deploy from branch $GIT_BRANCH. Is that intended? If so add it to jenkins.sh so that it does the right thing."
    exit 1
  ;;
esac

bash -e ./remove_src.sh 

yarn install

#bundle install --path vendor/bundle
# yarn
# export AWS_DEFAULT_INDEX_DOC=index.html
echo "Using bucket $BUCKET_PATH."
# bundle exec middleman s3_sync --build --bucket=$BUCKET_PATH
rm -rf dist

export NODE_OPTIONS="--max-old-space-size=8048"

yarn run build

REV=`git rev-parse --short HEAD`

export RELEASE=$REV

./node_modules/@sentry/cli/sentry-cli releases new $REV

#temp hack to have all the cards ! 
mkdir -p dist/faucet
cd dist
aws s3 sync . s3://$FAUCET_PATH --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*.html" --exclude "*" --include "*.html"
aws s3 sync . s3://$FAUCET_PATH --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*.html" --cache-control 'max-age=86400'

