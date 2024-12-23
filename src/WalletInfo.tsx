import React from 'react';

interface WalletInfoProps {
  walletName: string;
  walletBalance: number | undefined;
  txId: string | undefined;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ walletName, walletBalance, txId }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700 w-full max-w-2xl">
    <div className="text-xl font-semibold text-blue-400 mb-4">
      {walletName.toUpperCase()} wallet is connected
    </div>

    {!!walletBalance && (
      <div className="text-gray-300 mb-2">
        Wallet Balance: <span className="font-medium">{walletBalance}</span>
      </div>
    )}

    {!!txId && (
      <div className="text-gray-300 break-all">
        Transaction ID: <span className="font-medium">{txId}</span>
      </div>
    )}
  </div>
);

export default WalletInfo;