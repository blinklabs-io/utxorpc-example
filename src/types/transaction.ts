export interface TransactionFormProps {
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  amount: number | undefined;
  setAmount: (amount: number) => void;
  recipientAddress: string | undefined;
  setRecipientAddress: (address: string) => void;
  uniqueAssets: { id: string; name: string }[];
  handleCreateTransaction: () => void;
}
