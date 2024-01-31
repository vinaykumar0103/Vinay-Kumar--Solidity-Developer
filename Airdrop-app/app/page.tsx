'use client';

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import AirdropToken from './AirdropToken.json'; // Importing the JSON file

// Declare global interface for Window object
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Define Component
const App = () => {
    // State variables
    const [web3, setWeb3] = useState<Web3 | null>(null); // Web3 instance or null
    const [accounts, setAccounts] = useState<string[]>([]); // Array of account addresses
    const [recipientAddress, setRecipientAddress] = useState<string>(''); // Recipient address for token transfer
    const [amount, setAmount] = useState<string>(''); // Amount of tokens to transfer
    const [error, setError] = useState<string>(''); // Error message
    const [connected, setConnected] = useState<boolean>(false); // Indicates whether MetaMask is connected

    // Effect hook to check MetaMask installation
    useEffect(() => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
        } else {
            setError('MetaMask not detected. Please install MetaMask to continue.');
        }
    }, []);

    // Function to connect to MetaMask
    const connectToMetaMask = async () => {
        try {
            await window.ethereum?.request({ method: 'eth_requestAccounts' });
            const accounts = await web3?.eth.getAccounts();
            if (accounts) {
                setAccounts(accounts);
                setConnected(true);
            }
        } catch (error) {
            setError('Failed to connect to MetaMask. Please try again.');
        }
    };

    // Function to handle token transfer
    const handleTokenTransfer = async () => {
        try {
            // Validate recipient address
            if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
                setError('Invalid recipient address');
                return;
            }

            // Check if web3 is not null before proceeding
            if (!web3) {
                setError('Web3 instance not available');
                return;
            }

            const tokenContract = new web3.eth.Contract(AirdropToken.abi);
            const tx = await tokenContract.methods.transfer(recipientAddress, amount).send({ from: accounts[0] });

            if (tx.status) {
                alert('Token transfer successful!');
            } else {
                setError('Failed to transfer tokens. Please try again.');
            }
        } catch (error) {
            setError('Failed to transfer tokens. Please try again.');
        }
    };


    // Render JSX
    return (
        <div className="h-screen flex justify-center items-center bg-black text-white">
            <main className="flex flex-col items-center gap-5">
                {error && <div className="error">{error}</div>}
                {!connected ? (
                    <div>
                        <button onClick={connectToMetaMask} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Connect Wallet
                        </button>
                        <p className="text-red-500 mt-2">Connect Your Wallet</p>
                    </div>
                ) : (
                    <div>
                        <button className="bg-green-500 text-white font-bold py-2 px-4 rounded cursor-not-allowed" disabled>
                            Connected
                        </button>
                        <p className="text-green-500 mt-2">Connected Account: {accounts.length > 0 ? accounts[0] : ''}</p>

                    </div>
                )}
                {connected && (
                    <div className="flex flex-col items-center">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="mt-2 px-3 py-2 border border-gray-400 rounded w-64 bg-white text-gray-800 focus:outline-none focus:bg-blue-400"

                        />
                        <input
                            type="text"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-2 px-3 py-2 border border-gray-400 rounded w-64 bg-white text-gray-800 focus:outline-none focus:bg-blue-400"
                        />
                        <button onClick={handleTokenTransfer} className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Transfer Tokens
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

// Export YourComponent
export default App;
