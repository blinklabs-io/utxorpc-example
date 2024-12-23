import { useState, useCallback } from "react";
import { FunctionComponent, useEffect } from "react";
import {
  useConnectWallet,
} from "@newm.io/cardano-dapp-wallet-connector";
import "./App.css";
import { createTransaction, fetchAndDecodeUtxos } from "./api/api";

import { DecodedUtxo, WalletApi } from "./types/wallet";
import Header from './Header';
import TransactionForm from './TransactionForm';
import WalletInfo from './WalletInfo';
import ConnectWalletButton from './ConnectWalletButton';

const App: FunctionComponent = () => {
  const { wallet, getAddress, getBalance } = useConnectWallet();
  const [address, setAddress] = useState<string>();
  const [walletBalance, setWalletBalance] = useState<number>();
  const [amount, setAmount] = useState<number>();
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [txId, setTxId] = useState<string>();
  const [selectedAsset, setSelectedAsset] = useState<string>("lovelace");
  const [utxos, setUtxos] = useState<DecodedUtxo[]>([]);

  const fetchUtxos = useCallback(async () => {
    if (wallet) {
      try {
        const decodedUtxos = await fetchAndDecodeUtxos(wallet as WalletApi);
        setUtxos(decodedUtxos);
      } catch (error) {
        console.error("Error fetching UTXOs:", error);
      }
    }
  }, [wallet]);

  const uniqueAssets = Array.from(
    new Set(
      utxos.flatMap((utxo) =>
        utxo.assetDetails.map((asset) => ({
          id: asset.id,
          name: asset.assetName,
        }))
      )
    )
  );

  useEffect(() => {
    if (wallet) {
      getBalance(setWalletBalance);
      getAddress(setAddress);
      fetchUtxos();
    }
  }, [wallet, getAddress, getBalance, fetchUtxos]);


const handleCreateTransaction = async () => {
  if (!recipientAddress || !amount || !address || !wallet) return;

  await createTransaction(
    recipientAddress,
    amount,
    address,
    selectedAsset,
    wallet as WalletApi,
    setTxId,
    getBalance,
    setWalletBalance
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4 py-8 gap-8">
        <Header />
        <TransactionForm
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          amount={amount}
          setAmount={setAmount}
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          uniqueAssets={uniqueAssets}
          handleCreateTransaction={handleCreateTransaction}
        />

        {wallet && (
          <WalletInfo
            walletName={wallet.name}
            walletBalance={walletBalance}
            txId={txId}
          />
        )}

        <ConnectWalletButton />
      </div>
    </div>
  );
};

export default App;
