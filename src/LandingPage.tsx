import { useConnectWallet } from '@newm.io/cardano-dapp-wallet-connector';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConnectWalletButton from './ConnectWalletButton';

const LandingPage = () => {
  const navigate = useNavigate();
  const { wallet } = useConnectWallet();
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (wallet) {
      navigate('/transaction');
    }
  }, [wallet, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center">
      <motion.h1
        className="text-5xl font-bold mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        Cardano Transaction Wallet
      </motion.h1>
      <motion.p
        className="text-xl mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
      >
        Connect your wallet to start sending transactions
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 1 }}
      >
        <ConnectWalletButton isDisabled={!isAnimationComplete} />
      </motion.div>
    </div>
  );
};

export default LandingPage;