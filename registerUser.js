'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser } = require('../utils-javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet, buildCCPOrg2 } = require('../utils-javascript/AppUtil.js');
let mspOrg = 'Org1MSP';

const walletPath = path.join(__dirname, 'wallet');

let args = process.argv.slice(2);
if (args.length < 2){
    console.error('Invalid number of arguments, expecting 2.');
    process.exit(1);
}
let username = args[0];
let role = args[1];
let org = args[2];
if (org == 2){
    mspOrg = 'Org2MSP';
} 
async function main() {

	try {
		// build an in memory object with the network configuration (also known as a connection profile)
	console.log(`${username}, ${role}, ${org}, ${mspOrg}`);
        let ccp = buildCCPOrg1();
        if (org == 2){
            ccp = buildCCPOrg2();
        }

		// build an instance of the fabric ca services client based on
        // the information in the network configuration
        let ca  = 'ca.org1.example.com';
        if (org == 2) {
            ca = 'ca.org2.example.com';
        }
		const caClient = buildCAClient(FabricCAServices, ccp, ca);

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

        // in a real application this would be done on an administrative flow, and only once
        let attrs = [{name: 'username', value: username, ecert: false},{name: 'role', value: role, ecert: false}];
        let attr_reqs = [{name: 'username', optional: false},{name: 'role', optional: false}];

        console.log("Registering new user");
        let affiliation = 'org1.department1';
        if (org == 2){
            affiliation = 'org2.department1';
        }
        await registerAndEnrollUser(caClient, wallet, mspOrg, username,affiliation, attrs, attr_reqs);
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}

	console.log('*** application ending');

}

main();
