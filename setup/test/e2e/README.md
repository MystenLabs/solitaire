# Test e2e
### Steps
1. Run `sui start` from the terminal to spin up a local network
2. Run the `publish.sh` script to publish the smart contract and create the .env file.
3. Add your private key in the .env file with the name ADMIN_SECRET_KEY. 
The private key can be retrieved from the sui.keystore file under the sui_config folder. 
The .env file should look like that:
```
SUI_NETWORK=http://localhost:9000
BACKEND_API=http://localhost:3000
PACKAGE_ADDRESS=XXXXXXXXXXXXXXXXXXXXXX
ADMIN_ADDRESS=XXXXXXXXXXXXXXXXXXXXXX
ADMIN_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXX
```
4. Run `pnpm test:e2e` to execute the e2e tests.

*Note: If you have already published the smart contract, created the .env file, and haven't reset the local network's state (eg. with `sui genesis --force`), then you can just run `sui start` and begin testing.
