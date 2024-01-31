'use client';

import React, { useState } from 'react';
import Web3 from 'web3';
import AirdropToken from './AirdropToken.json';

function Page() {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [contract, setContract] = useState<any | null>(null);
    const [account, setAccount] = useState<string>('');
    const [recipients, setRecipients] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false); // New state variable

    // Function to connect to MetaMask and initialize contract
    const connectToMetaMask = async () => {
        try {
            if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
                const web3Instance = new Web3((window as any).ethereum);
                setWeb3(web3Instance);

                // Request account access if needed
                await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0] || 'No accounts available');

                const networkId = await web3Instance.eth.net.getId();
                const deployedNetwork = (AirdropToken as any).networks[networkId.toString()];
                if (deployedNetwork) {
                    const instance = new web3Instance.eth.Contract(
                        (AirdropToken as any).abi,
                        deployedNetwork.address,
                    );
                    setContract(instance);
                    setConnected(true); // Set connected to true after successful connection
                } else {
                    console.log('Contract not deployed on the current network');
                }
            } else {
                console.log('Please install MetaMask or enable it in your browser');
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    };

    // Function to handle the airdrop
    const handleAirdrop = async () => {
        try {
            if (!contract) {
                console.log('Contract not initialized');
                return;
            }

            if (!recipients || !amount) {
                console.log('Recipient address or amount is missing');
                return;
            }

            console.log('Transaction in progress...');
            await contract.methods.transferTokens(recipients.split(','), amount).send({ from: account });
            console.log('Airdrop successful');
        } catch (error) {
            console.error('Airdrop failed:', error);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-black text-white">
            <main className="flex flex-col items-center gap-5">
                <div>
                    {connected ? (
                        <button className="bg-green-500 text-white font-bold py-2 px-4 rounded cursor-not-allowed" disabled>
                            Connected
                        </button>
                    ) : (
                        <button onClick={connectToMetaMask} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Connect Wallet
                        </button>
                    )}
                </div>
                <p className="text-red-500">Connect Your Wallet</p>
                <div className="flex gap-5">
                    <input type="text" placeholder="Enter recipient address" className="p-2 border-none rounded-md focus:outline-cyan-300 text-black" value={recipients} onChange={(e) => setRecipients(e.target.value)} />
                    <input type="text" placeholder="Enter amount" className="p-2 border-none rounded-md focus:outline-cyan-300 text-black" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <button onClick={handleAirdrop} disabled={!contract || !recipients || !amount || !connected} className={`border-cyan-700 border-2 rounded-md px-3 py-1 ${(!contract || !recipients || !amount || !connected) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-700 hover:border-cyan-900 text-cyan-700 hover:text-white'}`}>
                        Transfer
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Page;
