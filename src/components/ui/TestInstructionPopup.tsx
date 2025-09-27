import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TestInstructionPopupProps {
  name: string;
  description: string;
  instructions?: string;
}

export function TestInstructionPopup({ name, description, instructions }: TestInstructionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  let longPressTimer: ReturnType<typeof setTimeout>;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    longPressTimer = setTimeout(() => {
      setIsLongPress(true);
      setIsVisible(true);
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    clearTimeout(longPressTimer);
    // Only hide if it wasn't a long press
    if (!isLongPress) {
      setIsVisible(false);
    }
    setIsLongPress(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    clearTimeout(longPressTimer);
    if (!isLongPress) {
      setIsVisible(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(true);
  };

  const closePopup = () => {
    setIsVisible(false);
    setIsLongPress(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => !isLongPress && setIsVisible(true)}
        onMouseLeave={() => !isLongPress && setIsVisible(false)}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => e.preventDefault()}
        className="text-left hover:text-blue-600 transition-colors select-none touch-none"
      >
        {name}
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 p-4 rounded-lg shadow-lg bg-white border border-gray-200"
            onMouseEnter={() => !isLongPress && setIsVisible(true)}
            onMouseLeave={() => !isLongPress && setIsVisible(false)}
          >
            <button
              onClick={closePopup}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
              <p className="text-xs text-gray-600">{description}</p>
              {instructions && (
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-900 mb-1">Test Performance:</h4>
                  <p className="text-xs text-gray-600">{instructions}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}