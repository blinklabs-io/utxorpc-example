export type WalletApi = {
  getUtxos: () => Promise<string[]>;
};

export type SetTxId = (txId: string) => void;
export type GetBalance = (callback: (balance: number) => void) => void;
export type SetWalletBalance = (balance: number) => void;

export type DecodedUtxo = {
  txHash: string;
  outputIndex: number;
  amount: {
    coins: string;
    assets?: Record<string, string>;
  };
  address: string;
  assetDetails: {
    id: string;
    policyId: string;
    assetName: string;
  }[];
};
