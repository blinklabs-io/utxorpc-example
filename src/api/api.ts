import { EnabledWallet, signWalletTransaction } from "@newm.io/cardano-dapp-wallet-connector";
import { WalletApi, SetTxId, GetBalance, SetWalletBalance, DecodedUtxo } from "../types/wallet";

export const createTransaction = async (
  recipientAddress: string,
  amount: number,
  address: string,
  selectedAsset: string,
  wallet: WalletApi,
  setTxId: SetTxId,
  getBalance: GetBalance,
  setWalletBalance: SetWalletBalance
) => {
  try {
    const response = await fetch("http://localhost:3000/api/create-transaction", {
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
    });

    if (!response.ok) {
      throw new Error("Failed to create transaction");
    }

    const { unsignedTx } = await response.json();

    const signedTx = await signWalletTransaction(wallet as EnabledWallet, unsignedTx);

    // Submit the signed transaction
    const submitResponse = await fetch("http://localhost:3000/api/submit-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signedTx,
      }),
    });

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


export const fetchAndDecodeUtxos = async (wallet: WalletApi): Promise<DecodedUtxo[]> => {
  try {
    const rawUtxos = await wallet.getUtxos();
    console.log("rawutxos", rawUtxos);

    const response = await fetch("http://localhost:3000/api/decode-utxos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utxos: rawUtxos }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch UTXOs");
    }

    const decodedUtxos: DecodedUtxo[] = await response.json();
    return decodedUtxos;
  } catch (error) {
    console.error("Error fetching UTXOs:", error);
    throw error;
  }
};