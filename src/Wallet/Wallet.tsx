import {useState} from 'react';
import {ethers} from 'ethers';
import {TransactionResponse} from '@ethersproject/abstract-provider';
import axios from 'axios';

interface Transaction {
  hash: string;
  type: number;
  from: string;
  to?: string;
  value?: any;
}
export const Wallet = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [defaultAddress, seDefaultAddress] = useState('');
  const [connectionButtonText, setConnectionButtonText] = useState('Connect Wallet');
  const [addressBalance, setAddressBalance] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ether, setEther] = useState('');
  const [randomWallet, setRandomWallet] = useState('');

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      const accountsChanged = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      await accountChangedHandler(accountsChanged[0]);
    } else {
      setErrorMessage('You need to install Metamask');
    }
  };

  const accountChangedHandler = async (newAccount: string) => {
    seDefaultAddress(newAccount);
    await getUserBalance(newAccount.toString());
  };

  const getUserBalance = async (address: string) => {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    setAddressBalance(ethers.utils.formatEther(balance));
  };

  const getTransactionsByAddress = async (address: string) => {
    await window.ethereum.send('eth_requestAccounts');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    ethers.utils.getAddress(address);

    const {hash, type, from, to, value}: TransactionResponse = await signer.sendTransaction({
      to: randomWallet,
      value: ethers.utils.parseEther(ether),
    });
    if (hash && type) {
      setTransactions([...transactions, {hash, type, from, to, value}]);
    }
  };

  const generateRandomAddress = (): void => {
    const wallet = ethers.Wallet.createRandom();
    setRandomWallet(wallet.address);
  };

  const getEnsRaking = async () => {
    const {data} = await axios.get('https://ethleaderboard.xyz/api/frens', {
      params: {count: 10},
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
    console.log(data);
    //   const provider = new ethers.providers.JsonRpcProvider('https://ethleaderboard.xyz/');

    //  console.log(provider);
  };

  return (
    <div className="flex flex-col gap-4 overflow-x-auto overflow-y-auto justify-center items-center w-2/3">
      <p className="font-bold text-lg p-4">Connection to Metamask</p>
      <button className="rounded-lg w-30 bg-blue-600 p-2 text-white font-bold" onClick={connectWalletHandler}>
        {connectionButtonText}
      </button>
      <div className="accountDisplay">
        <span className="font-bold text-md">Address: {defaultAddress}</span>
      </div>
      <div className="font-bold text-md">
        <h3>Balance: {addressBalance}</h3>
      </div>

      <div className="flex flex-col gap-4 justify-start w-2/3">
        <span className="font-bold self-start">Send Eth payment</span>
        <div className="w-full">
          <input
            className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="newAdress"
            type="text"
            placeholder="Address"
            value={randomWallet}
          />
          <span className="text-sm hover:cursor-pointer" onClick={generateRandomAddress}>
            Generate Random Address
          </span>
        </div>
        <input
          className=" shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="ether"
          type="text"
          placeholder="Amount of Eth"
          onChange={(e) => setEther(e.target.value)}
        />
        <button
          className="rounded-lg w-30 bg-blue-600 p-2 text-white font-bold"
          onClick={() => getTransactionsByAddress(defaultAddress)}
          disabled={!defaultAddress}
        >
          Make Payment
        </button>
      </div>

      {transactions.length > 0 && (
        <div className="flex flex-col">
          <span className="font-bold text-md">Transactions</span>
          <table className="w-2/3 m-4 table-auto border-collapse border border-spacing-2 border-slate-500">
            <thead>
              <tr>
                <th className=" border border-slate-600">Hash Tx</th>
                <th className=" border border-slate-600">EthScan link</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(({hash, from, to}) => (
                <tr>
                  <td className=" border border-slate-700">{hash}</td>
                  <td className=" border border-slate-700">
                    <a target="_blank" href={`https://rinkeby.etherscan.io//tx/${hash}`}>
                      Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="rounded-lg w-30 bg-blue-600 p-2 text-white font-bold" onClick={getEnsRaking} disabled={!defaultAddress}>
        Get ENS Ranking
      </button>
      {errorMessage}
    </div>
  );
};
