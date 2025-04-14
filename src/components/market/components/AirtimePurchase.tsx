import React from 'react';

interface AirtimePurchaseProps {
  serviceName: string;
  onClose: () => void;
  onPurchase: (data: any) => void;
  processingPayment: boolean;
}

const AirtimePurchase: React.FC<AirtimePurchaseProps> = ({
  serviceName,
  onClose,
  onPurchase,
  processingPayment
}) => {
  const [payerPhone, setPayerPhone] = React.useState('');
  const [receiverPhone, setReceiverPhone] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [isSameNumber, setIsSameNumber] = React.useState(false);

  const handleSubmit = () => {
    onPurchase({
      payerPhone,
      receiverPhone: isSameNumber ? payerPhone : receiverPhone,
      amount: parseFloat(amount)
    });
  };

  const predefinedAmounts = [100, 250, 500, 1000, 2000, 5000];

  return (
    <>
      <div className="form-group-mp">
        <label className="form-label-mp">Mobile Money Number (To Pay)</label>
        <input
          type="tel"
          value={payerPhone}
          onChange={(e) => setPayerPhone(e.target.value)}
          placeholder="e.g., 237xxxxxxxxx"
          className="form-input-mp"
          disabled={processingPayment}
        />
      </div>

      <div className="form-group-mp">
        <label className="form-label-mp">Number to Recharge</label>
        {isSameNumber ? (
          <div className="same-number-text-mp">Using Mobile Money Number</div>
        ) : (
          <input
            type="tel"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            placeholder="e.g., 237xxxxxxxxx"
            className="form-input-mp"
            disabled={processingPayment}
          />
        )}
        <div className="checkbox-group-mp">
          <input
            type="checkbox"
            id="sameNumber"
            checked={isSameNumber}
            onChange={(e) => setIsSameNumber(e.target.checked)}
            disabled={processingPayment}
          />
          <label htmlFor="sameNumber">Same as Mobile Money Number</label>
        </div>
      </div>

      <div className="form-group-mp">
        <label className="form-label-mp">Select Amount</label>
        <div className="amount-buttons-mp">
          {predefinedAmounts.map((amt) => (
            <button
              key={amt}
              className={`amount-button-mp ${amount === amt.toString() ? 'selected-mp' : ''}`}
              onClick={() => setAmount(amt.toString())}
              disabled={processingPayment}
            >
              {amt} FCFA
            </button>
          ))}
        </div>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Or enter custom amount"
          className="form-input-mp mt-10-mp"
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
          disabled={!amount || !payerPhone || (!receiverPhone && !isSameNumber) || processingPayment}
          style={{ opacity: !amount || !payerPhone || (!receiverPhone && !isSameNumber) || processingPayment ? 0.7 : 1 }}
        >
          {processingPayment ? 'Processing...' : `Pay ${amount} FCFA`}
        </button>
      </div>

      <style>{`
        .amount-buttons-mp {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }

        .amount-button-mp {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .amount-button-mp.selected-mp {
          background: #e3f2fd;
          border-color: #2196F3;
          color: #2196F3;
        }

        .checkbox-group-mp {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .same-number-text-mp {
          color: #666;
          font-style: italic;
          margin: 8px 0;
        }

        .mt-10-mp {
          margin-top: 10px;
        }
      `}</style>
    </>
  );
};

export default AirtimePurchase;