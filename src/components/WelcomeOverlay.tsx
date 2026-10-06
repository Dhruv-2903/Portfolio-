import React from 'react';
import { EncryptedText } from '@/components/ui/encrypted-text';

interface WelcomeOverlayProps {
  isVisible: boolean;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ isVisible }) => {
  return (
    <div className={`welcome-overlay-container ${!isVisible ? 'fade-out' : ''}`}>
      <div className="welcome-text-card">
        <h1 className="welcome-encrypted-heading">
          <EncryptedText
            text="WELCOME "
            encryptedClassName="encrypted-text-scrambled"
            revealedClassName="encrypted-text-pink"
            revealDelayMs={60}
          />
          <EncryptedText
            text="BACK, KID"
            encryptedClassName="encrypted-text-scrambled"
            revealedClassName="encrypted-text-white"
            revealDelayMs={60}
          />
        </h1>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
