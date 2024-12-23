import { TransactionFormProps } from "./types/transaction";

const TransactionForm = ({
  selectedAsset,
  setSelectedAsset,
  amount,
  setAmount,
  recipientAddress,
  setRecipientAddress,
  uniqueAssets,
  handleCreateTransaction,
}: TransactionFormProps) => (
  <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-700">
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
        >
          <option value="lovelace">ADA</option>
          {uniqueAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
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
          onClick={handleCreateTransaction}
        >
          SUBMIT
        </button>
      </div>
    </div>
  </div>
);

export default TransactionForm;