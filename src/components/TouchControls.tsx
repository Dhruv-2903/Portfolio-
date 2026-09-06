import React, { useState, useEffect } from 'react';
import { EventBus } from '../game/EventBus';

export const TouchControls: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  if (!isTouchDevice) return null;

  const handleLeftStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    EventBus.emit('move-left-start');
  };

  const handleLeftEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    EventBus.emit('move-left-stop');
  };

  const handleRightStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    EventBus.emit('move-right-start');
  };

  const handleRightEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    EventBus.emit('move-right-stop');
  };

  const handleInteract = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    EventBus.emit('interact-trigger');
  };

  return (
    <div className="touch-controls-overlay">
      <div className="dpad-container">
        <button
          className="touch-btn dpad-btn"
          onTouchStart={handleLeftStart}
          onTouchEnd={handleLeftEnd}
          onMouseDown={handleLeftStart}
          onMouseUp={handleLeftEnd}
          aria-label="Move Left"
        >
          ◀
        </button>
        <button
          className="touch-btn dpad-btn"
          onTouchStart={handleRightStart}
          onTouchEnd={handleRightEnd}
          onMouseDown={handleRightStart}
          onMouseUp={handleRightEnd}
          aria-label="Move Right"
        >
          ▶
        </button>
      </div>

      <div className="action-container">
        <button
          className="touch-btn action-btn"
          onTouchStart={handleInteract}
          onMouseDown={handleInteract}
          aria-label="Interact"
        >
          E
        </button>
      </div>
    </div>
  );
};

export default TouchControls;
