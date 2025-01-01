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
  <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Transaction Form</h2>

    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Payment Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={0}
                  placeholder="0.00"
                />
              </div>
              <div className="w-1/3">
                <select
                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Recipient</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wallet Address
          </label>
          <input
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient's wallet address"
          />
        </div>
      </div>

      {/* Submit Button Section */}
      <div className="pt-4">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreateTransaction}
          disabled={!amount || !recipientAddress}
        >
          Confirm Payment
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          By confirming, you agree to send these funds to the specified address
        </p>
      </div>
    </div>
  </div>
);

export default TransactionForm;