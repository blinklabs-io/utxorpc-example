import { ConnectWallet } from '@newm.io/cardano-dapp-wallet-connector';

interface ConnectWalletButtonProps {
  className?: string;
  isDisabled?: boolean;
}

const ConnectWalletButton = ({ className, isDisabled }: ConnectWalletButtonProps) => {
  return (
    <div className={className}>
      <ConnectWallet
        isInverted={true}
        mainButtonStyle={{
          color: 'white',
          backgroundColor: isDisabled ? '#A0AEC0' : '#4A5568',
          border: '2px solid #CBD5E0',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
        modalStyle={{ backgroundColor: '#2d3748' }}
        modalHeaderStyle={{ color: '#fff' }}
      />
    </div>
  );
};

export default ConnectWalletButton;