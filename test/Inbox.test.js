const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');               // Capitalized -- constructor function imported to create instances of Web3 library
const { interface, bytecode } = require('../compile');      // Unwraps json object returned in compile.js

const provider = ganache.provider();
const web3 = new Web3(provider);      // tells web3 to connect to the local ganache test network 


let accounts;
let inbox;

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use an account to deploy the contract
    //Create instance of eth.Contract, deploy contract from data returned from compile.js
    
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ 
            data: bytecode, 
            arguments: ['Hi there!'] 
        })
        .send({ 
            from: accounts[0], 
            gas: '1000000' 
        });

    inbox.setProvider(provider);
});

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });

    it('has default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Hi there!');
    })

    it('can update the message', async () => {
        await inbox.methods.setMessage('Bye there!').send({ from: accounts[0] });
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Bye there!');
    })
})