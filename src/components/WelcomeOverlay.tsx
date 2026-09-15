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
            text="Welcome Back, kid"
            encryptedClassName="encrypted-text-scrambled"
            revealedClassName="encrypted-text-revealed"
            revealDelayMs={60}
          />
        </h1>
      </div>
    </div>
  );
};

export default WelcomeOverlay;
