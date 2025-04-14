
import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  showSuccess?: boolean;
  successMessage?: string;
  successSubMessage?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  iconColor,
  children,
  showSuccess = false,
  successMessage = 'Payment Successful!',
  successSubMessage = 'Your purchase is complete.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay-mp">
      <div className={`bottom-sheet-mp ${showSuccess ? 'success-mp' : ''}`}>
        {showSuccess ? (
          <div className="payment-success-mp">
            <div className="success-icon-mp">✓</div>
            <h2 className="sheet-title-mp">{successMessage}</h2>
            <p>{successSubMessage}</p>
          </div>
        ) : (
          <>
            <div className="bottom-sheet-header-mp">
              <div className="bottom-sheet-handle-mp"></div>
              {title && <h2 className="sheet-title-mp">{title}</h2>}
              {icon && (
                <div className="selected-service-icon-mp" style={{ backgroundColor: iconColor }}>
                  {icon}
                </div>
              )}
            </div>
            {children}
          </>
        )}
      </div>
    </div>
  );
};

export default BottomSheet;
