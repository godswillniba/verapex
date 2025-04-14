import React from 'react';

interface CryptoRate {
  type: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
}

const PI_COIN_RATES: CryptoRate[] = [
  { type: 'Standard Rate', rate: 1750, minAmount: 10, maxAmount: 1000 },
  { type: 'Premium Rate', rate: 1800, minAmount: 1001, maxAmount: 5000 },
  { type: 'VIP Rate', rate: 1850, minAmount: 5001, maxAmount: 20000 }
];

interface GiftCardRate {
  type: string;
  country: string;
  rate: number;
  minAmount: number;
}

const GIFT_CARD_RATES: GiftCardRate[] = [
  { type: 'iTunes', country: 'USA', rate: 450, minAmount: 25 },
  { type: 'Amazon', country: 'USA', rate: 480, minAmount: 25 },
  { type: 'Steam', country: 'USA', rate: 460, minAmount: 10 },
  { type: 'Google Play', country: 'USA', rate: 455, minAmount: 10 },
  { type: 'iTunes', country: 'UK', rate: 520, minAmount: 25 }
];

interface CryptoCardSellProps {
  serviceName: string;
  onClose: () => void;
  onPurchase: (data: any) => void;
  processingPayment: boolean;
}

const CryptoCardSell: React.FC<CryptoCardSellProps> = ({
  serviceName,
  onClose,
  onPurchase,
  processingPayment
}) => {
  const isPiCoin = serviceName === 'Pi Coins';
  const [selectedRate, setSelectedRate] = React.useState<CryptoRate | GiftCardRate | null>(null);
  const [amount, setAmount] = React.useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = React.useState('');
  const [proofImage, setProofImage] = React.useState<string | null>(null);
  const [cardDetails, setCardDetails] = React.useState('');

  const calculateTotal = () => {
    if (!selectedRate || !amount) return 0;
    return parseFloat(amount) * selectedRate.rate;
  };

  const handleImageUpload = () => {
    // Simulate image upload - in a real app this would trigger file input
    setProofImage('proof_uploaded.jpg');
  };

  const handleSubmit = () => {
    onPurchase({
      rate: selectedRate,
      amount: parseFloat(amount),
      mobileMoneyNumber,
      proofImage,
      cardDetails,
      totalAmount: calculateTotal()
    });
  };

  return (
    <>
      <div className="form-group-mp">
        <label className="form-label-mp">Select {isPiCoin ? 'Pi Coin Rate' : 'Gift Card Type'}</label>
        <div className="rate-cards-mp">
          {isPiCoin ? (
            // Pi Coin rates
            PI_COIN_RATES.map(rate => (
              <div
                key={rate.type}
                className={`rate-card-mp ${selectedRate?.type === rate.type ? 'selected-mp' : ''}`}
                onClick={() => !processingPayment && setSelectedRate(rate)}
              >
                <div className="rate-name-mp">{rate.type}</div>
                <div className="rate-value-mp">{rate.rate} FCFA/Pi</div>
                <div className="rate-range-mp">
                  Range: {rate.minAmount} - {rate.maxAmount} Pi
                </div>
              </div>
            ))
          ) : (
            // Gift Card rates
            GIFT_CARD_RATES.map(rate => (
              <div
                key={`${rate.type}-${rate.country}`}
                className={`rate-card-mp ${selectedRate?.type === rate.type && (selectedRate as GiftCardRate).country === rate.country ? 'selected-mp' : ''}`}
                onClick={() => !processingPayment && setSelectedRate(rate)}
              >
                <div className="rate-name-mp">{rate.type}</div>
                <div className="rate-country-mp">{rate.country}</div>
                <div className="rate-value-mp">{rate.rate} FCFA/$</div>
                <div className="rate-min-mp">Minimum: ${rate.minAmount}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="form-group-mp">
        <label className="form-label-mp">
          {isPiCoin ? 'Amount of Pi Coins' : 'Gift Card Value (USD)'}
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder={isPiCoin ? 'Enter Pi amount' : 'Enter USD amount'}
          className="form-input-mp"
          disabled={processingPayment}
        />
        {selectedRate && amount && (
          <div className="total-calculation-mp">
            You'll receive: <span className="total-amount-mp">{calculateTotal().toLocaleString()} FCFA</span>
          </div>
        )}
      </div>

      {!isPiCoin && (
        <div className="form-group-mp">
          <label className="form-label-mp">Card Details</label>
          <textarea
            value={cardDetails}
            onChange={(e) => setCardDetails(e.target.value)}
            placeholder="Enter card code, PIN, etc."
            className="form-textarea-mp"
            disabled={processingPayment}
          />
        </div>
      )}

      <div className="form-group-mp">
        <label className="form-label-mp">
          {isPiCoin ? 'Upload Pi Transfer Screenshot' : 'Upload Gift Card Image'}
        </label>
        <div className="upload-container-mp">
          {proofImage ? (
            <div className="upload-preview-mp">
              <div className="file-name-mp">Image uploaded</div>
              <button 
                className="change-image-btn-mp"
                onClick={() => setProofImage(null)}
                disabled={processingPayment}
              >
                Change
              </button>
            </div>
          ) : (
            <button 
              className="upload-button-mp"
              onClick={handleImageUpload}
              disabled={processingPayment}
            >
              Upload Image
            </button>
          )}
        </div>
      </div>

      <div className="form-group-mp">
        <label className="form-label-mp">Mobile Money Number (To Receive Payment)</label>
        <input
          type="tel"
          value={mobileMoneyNumber}
          onChange={(e) => setMobileMoneyNumber(e.target.value)}
          placeholder="e.g., 237xxxxxxxxx"
          className="form-input-mp"
          disabled={processingPayment}
        />
      </div>

      <div className="button-group-mp">
        <button
          onClick={onClose}
          className="cancel-button-mp"
          disabled={processingPayment}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="purchase-button-mp confirm-button-mp"
          disabled={!selectedRate || !amount || !mobileMoneyNumber || !proofImage || (!isPiCoin && !cardDetails) || processingPayment}
          style={{ opacity: !selectedRate || !amount || !mobileMoneyNumber || !proofImage || (!isPiCoin && !cardDetails) || processingPayment ? 0.7 : 1 }}
        >
          {processingPayment ? 'Processing...' : 'Complete Sale'}
        </button>
      </div>

      <style>{`
        .rate-cards-mp {
          display: grid;
          grid-template-columns: ${isPiCoin ? '1fr' : 'repeat(2, 1fr)'};
          gap: 10px;
          margin-bottom: 20px;
        }

        .rate-card-mp {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rate-card-mp.selected-mp {
          border-color: #2196F3;
          background: #e3f2fd;
        }

        .rate-name-mp {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }

        .rate-country-mp {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .rate-value-mp {
          color: #2196F3;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .rate-range-mp, .rate-min-mp {
          font-size: 13px;
          color: #555;
        }

        .total-calculation-mp {
          margin-top: 10px;
          font-size: 14px;
        }

        .total-amount-mp {
          font-weight: bold;
          color: #2196F3;
          font-size: 16px;
        }

        .form-textarea-mp {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
          min-height: 100px;
          resize: vertical;
        }

        .upload-container-mp {
          margin-top: 10px;
        }

        .upload-button-mp {
          padding: 12px;
          width: 100%;
          background-color: #f5f5f5;
          border: 1px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #555;
        }

        .upload-preview-mp {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background-color: #e3f2fd;
          border: 1px solid #2196F3;
          border-radius: 8px;
        }

        .file-name-mp {
          font-size: 14px;
          color: #2196F3;
        }

        .change-image-btn-mp {
          padding: 6px 12px;
          background-color: white;
          border: 1px solid #2196F3;
          border-radius: 4px;
          color: #2196F3;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>
    </>
      
  );
};

export default CryptoCardSell;