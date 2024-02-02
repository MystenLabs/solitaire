#!/bin/bash

# check dependencies are available.
for i in jq curl sui; do
  if ! command -V ${i} 2>/dev/null; then
    echo "${i} is not installed"
    exit 1
  fi
done

NETWORK=http://127.0.0.1:9000
BACKEND_API=http://127.0.0.1:3000
FAUCET=http://127.0.0.1:9123/gas

MOVE_PACKAGE_PATH=../move/solitaire

if [ $# -ne 0 ]; then
  if [ $1 = "testnet" ]; then
    NETWORK="https://rpc.testnet.sui.io:443"
    FAUCET="https://faucet.testnet.sui.io/gas"
    BACKEND_API="https://api-testnet.suifrens.sui.io"
  fi
  if [ $1 = "devnet" ]; then
    NETWORK="https://rpc.devnet.sui.io:443"
    FAUCET="https://faucet.devnet.sui.io/gas"
    BACKEND_API="https://api-devnet.suifrens.sui.io"
  fi
fi

ADMIN_ADDRESS=$(sui client active-address)
echo "- Admin Address is: ${ADMIN_ADDRESS}"

import_address=$(sui keytool import "$ADMIN_PHRASE" ed25519)

switch_res=$(sui client switch --address ${ADMIN_ADDRESS})

faucet_res=$(curl --location --request POST "$FAUCET" --header 'Content-Type: application/json' --data-raw '{"FixedAmountRequest": { "recipient": '$ADMIN_ADDRESS'}}')

publish_res=$(sui client publish --skip-fetch-latest-git-deps --gas-budget 2000000000 --skip-dependency-verification --json ${MOVE_PACKAGE_PATH})

echo ${publish_res} >.publish.res.json

# Check if the command succeeded (exit status 0)
if [[ "$publish_res" =~ "error" ]]; then
  # If yes, print the error message and exit the script
  echo "Error during move contract publishing.  Details : $publish_res"
  exit 1
fi

publishedObjs=$(echo "$publish_res" | jq -r '.objectChanges[] | select(.type == "published")')

PACKAGE_ID=$(echo "$publishedObjs" | jq -r '.packageId')

newObjs=$(echo "$publish_res" | jq -r '.objectChanges[] | select(.type == "created")')

# PUBLISHER_ID=$(echo "$newObjs" | jq -r 'select (.objectType | contains("package::Publisher")).objectId')


suffix=""
if [ $# -eq 0 ]; then
  suffix=".localnet"
fi

cat >.env<<-API_ENV
SUI_NETWORK=$NETWORK
BACKEND_API=$BACKEND_API
PACKAGE_ADDRESS=$PACKAGE_ID
NEXT_PUBLIC_PACKAGE_ADDRESS=$PACKAGE_ID
ADMIN_ADDRESS=$ADMIN_ADDRESS
API_ENV

cat >../app/.env$suffix<<-VITE_API_ENV
NEXT_PUBLIC_SUI_NETWORK=$NETWORK
NEXT_PUBLIC_PACKAGE_ADDRESS=$PACKAGE_ID
NEXT_PUBLIC_BACKEND_API=$BACKEND_API
VITE_API_ENV

# commented out as the POC template does not have an api directory
cat >../app/.env<<-BACKEND_API_ENV
NEXT_PUBLIC_SUI_NETWORK=$NETWORK
NEXT_PUBLIC_USE_TOP_NAVBAR_IN_LARGE_SCREEN=1
IS_SERVER_SIDE=1
NEXT_PUBLIC_ENOKI_API_KEY=enoki_apikey_2561b261b49126875f11a62d858c8009
NEXT_PUBLIC_GOOGLE_CLIENT_ID=46765980508-4iog648mir1nlg8drbqdsn1b75qtj6nv.apps.googleusercontent.com
NEXT_PUBLIC_PACKAGE_ADDRESS=$PACKAGE_ID
BACKEND_API_ENV

echo "Contract Deployment finished!"
