interface WalletInfoProps {
  walletName: string;
  walletBalance: number | undefined;
  txId: string | undefined;
}

const WalletInfo = ({ walletName, walletBalance, txId }: WalletInfoProps) => (
  <nav className="bg-gray-800/50 backdrop-blur-sm h-14 border-b border-gray-700 flex items-center px-8">
    <div className="flex items-center">
      <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
      <span className="text-blue-400 font-medium text-sm">
        {walletName.toUpperCase()}
      </span>
    </div>
    <div className="ml-auto flex items-center space-x-4">
      {!!walletBalance && (
        <div className="text-gray-300 text-sm">
          Balance: <span className="font-medium">{walletBalance}</span>
        </div>
      )}

      {!!txId && (
        <div className="text-gray-300 text-xs truncate max-w-[200px]">
          Tx: <span className="font-medium">{txId}</span>
        </div>
      )}
    </div>
  </nav>
);

export default WalletInfo;