const { Web3 } = require('web3');
const abi_roulette = require('./src/abis/rouletteContractAbi.json');
const infuraUrl = process.env.INFURA_URL;
const privateKey = process.env.PRIVATE_KEY_HOUSE;
const rouletteContractAddress = "0xDE498a87437214F6862A1f4B46D05817799eBd48";
const web3 = new Web3(infuraUrl);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

const rouletteContract = new web3.eth.Contract(abi_roulette, rouletteContractAddress);

async function withdraw() {
    try {
        const tx = await rouletteContract.methods.withdraw().send({ from: account.address });
        console.log('Withdrawal successful:', tx);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

withdraw();
