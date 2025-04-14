
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import './css/BottomSheet.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  return (
    <>
      {(isOpen || isClosing) && (
        <div className={`bottom-sheet-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
          <div 
            className="bottom-sheet" 
            ref={sheetRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bottom-sheet-header">
              <h3>{title}</h3>
              <button onClick={handleClose} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="bottom-sheet-content">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomSheet;
