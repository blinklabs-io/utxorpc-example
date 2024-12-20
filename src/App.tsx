import { useState } from "react";
import { FunctionComponent, useEffect } from "react";
import {
  ConnectWallet,
  useConnectWallet,
  signWalletTransaction,
} from "@newm.io/cardano-dapp-wallet-connector";
import "./App.css";

type WalletApi = {
  getUtxos: () => Promise<string[]>;
};

// Types
type DecodedUtxo = {
  txHash: string;
  outputIndex: number;
  amount: {
    coins: string;
    assets?: Record<string, string>;
  };
  address: string;
};

const App: FunctionComponent = () => {
  const { wallet, getAddress, getBalance } = useConnectWallet();
  const [address, setAddress] = useState<string>();
  const [walletBalance, setWalletBalance] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [txId, setTxId] = useState<string>();
  const [selectedAsset, setSelectedAsset] = useState<string>("lovelace");
  const [utxos, setUtxos] = useState<DecodedUtxo[]>([]);

  const fetchUtxos = async () => {
    if (wallet) {
      try {
        const walletApi = wallet as WalletApi;
        const rawUtxos = await walletApi.getUtxos();
        console.log("rawutxos", rawUtxos);

        const response = await fetch("http://localhost:3000/api/decode-utxos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utxos: rawUtxos }),
        });

        const decodedUtxos: DecodedUtxo[] = await response.json();
        setUtxos(decodedUtxos);
      } catch (error) {
        console.error("Error fetching UTXOs:", error);
      }
    }
  };
  //
  useEffect(() => {
    if (wallet) {
      getBalance(setWalletBalance);
      getAddress(setAddress);
      fetchUtxos();
    }
  }, [wallet, getAddress, getBalance]);

  const createTransaction = async (
    recipientAddress: string,
    amount: number,
    address: string
  ) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/create-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientAddress,
            amount,
            address,
            assetId: selectedAsset,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }

      const { unsignedTx } = await response.json();

      const signedTx = await signWalletTransaction(wallet, unsignedTx);

      // Submit the signed transaction
      const submitResponse = await fetch(
        "http://localhost:3000/api/submit-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            signedTx,
          }),
        }
      );

      if (!submitResponse.ok) {
        throw new Error("Failed to submit transaction");
      }

      const { txId } = await submitResponse.json();
      setTxId(txId);
      getBalance(setWalletBalance);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4 py-8 gap-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          CARDANO TRANSACTION
        </h1>

        <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-700">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
              >
                <option value="lovelace">ADA</option>
                <option value="d35c752af635d9e9cb79aea44537a57a5ecd91e23133cd7f210f0070.6d544f5349">
                  mTOSI
                </option>
                <option value="fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459">
                  tINDY
                </option>
              </select>

              <input
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                placeholder="Enter Amount"
              />

              <input
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Address"
              />
            </div>

            <div className="w-full">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                onClick={() =>
                  address &&
                  recipientAddress &&
                  amount &&
                  createTransaction(recipientAddress, amount, address)
                }
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {wallet && (
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700 w-full max-w-2xl">
            <div className="text-xl font-semibold text-blue-400 mb-4">
              {wallet?.name.toUpperCase()} wallet is connected
            </div>

            {!!walletBalance && (
              <div className="text-gray-300 mb-2">
                Wallet Balance:{" "}
                <span className="font-medium">{walletBalance}</span>
              </div>
            )}

            {!!txId && (
              <div className="text-gray-300 break-all">
                Transaction ID: <span className="font-medium">{txId}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <ConnectWallet isInverted={false} />
        </div>
      </div>
    </div>
  );
};

export default App;
