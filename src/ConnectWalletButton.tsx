import React from 'react';
import { ConnectWallet } from '@newm.io/cardano-dapp-wallet-connector';

const ConnectWalletButton: React.FC = () => (
  <div className="mt-4">
    <ConnectWallet isInverted={false} />
  </div>
);

export default ConnectWalletButton;