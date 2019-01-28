#!/bin/bash -ex
# Deploy battleground-marketplace.

export SENTRY_ORG=loom-network
export SENTRY_PROJECT=loomgames-frontend
export SENTRY_AUTH_TOKEN=cdee406313f047fd89156b6c0cf0b30e45112161ec424b81925782f53625e70b

PRESET_DEV="dashboard.dappchains.com"
PRESET_STAGE="dashboard.dappchains.com" #future production
PRESET_PROD="faucet.dappchains.com"
FAUCET_PATH='faucet.dappchains.com'

# You probably don't need to modify this stuff.
if [ "$GIT_BRANCH" == '' ]; then
  GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`
fi
BRANCH_CHOICE=${1:-$GIT_BRANCH}


# This is where you add any extra branches you want to recognise.
case "$BRANCH_CHOICE" in
  origin/master|master)
    FAUCET_PATH="${PRESET_PROD}"
    AWS_DISTRIBUTION_ID=E2NYGSJ6V75DN
  ;;
  origin/staging|staging)
    FAUCET_PATH="${PRESET_STAGE}"
    AWS_DISTRIBUTION_ID=E3MGPR8CO07CC2
  ;;
  origin/develop|develop|origin/add-cardpack|add-cardpack|dpos_ui|origin/dpos_ui)
    FAUCET_PATH="${PRESET_DEV}"
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

yarn run build

#temp hack to have all the cards ! 
mkdir -p dist/faucet
cd dist
aws s3 sync . s3://$FAUCET_PATH --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*.map" --exclude "*.html" --exclude "*" --include "*.html"
aws s3 sync . s3://$FAUCET_PATH --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --exclude "*.map" --exclude "*.html" --cache-control 'max-age=86400'

# TODO get the one for the faucet
#if [ ! -z "${AWS_DISTRIBUTION_ID}" ]; then
#  aws cloudfront create-invalidation --distribution-id ${AWS_DISTRIBUTION_ID} --paths /\*
#fi
