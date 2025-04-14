
import React from 'react';

interface Plan {
  name: string;
  price: number;
  description: string;
  duration: string;
}

const DSTV_PLANS: Plan[] = [
  { name: 'Premium', price: 18000, description: 'All channels + Sports + Movies', duration: '1 Month' },
  { name: 'Compact Plus', price: 12000, description: 'Most channels + Selected Sports', duration: '1 Month' },
  { name: 'Compact', price: 7500, description: 'Family Entertainment + News', duration: '1 Month' },
  { name: 'Access', price: 4000, description: 'Basic Entertainment', duration: '1 Month' }
];

const NETFLIX_PLANS: Plan[] = [
  { name: 'Premium', price: 4500, description: '4K + 4 Screens + Downloads', duration: '1 Month' },
  { name: 'Standard', price: 3500, description: 'HD + 2 Screens + Downloads', duration: '1 Month' },
  { name: 'Basic', price: 2500, description: 'SD + 1 Screen + Downloads', duration: '1 Month' },
  { name: 'Mobile', price: 1500, description: 'Mobile Only + 1 Screen', duration: '1 Month' }
];

interface SubscriptionPurchaseProps {
  serviceName: string;
  onClose: () => void;
  onPurchase: (data: any) => void;
  processingPayment: boolean;
}

const SubscriptionPurchase: React.FC<SubscriptionPurchaseProps> = ({
  serviceName,
  onClose,
  onPurchase,
  processingPayment
}) => {
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [accountNumber, setAccountNumber] = React.useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = React.useState('');

  const plans = serviceName === 'DSTV' ? DSTV_PLANS : NETFLIX_PLANS;

  const handleSubmit = () => {
    onPurchase({
      plan: selectedPlan,
      accountNumber,
      mobileMoneyNumber,
      amount: selectedPlan?.price
    });
  };

  return (
    <>
      <div className="form-group-mp">
        <label className="form-label-mp">Choose Your Plan</label>
        <div className="plan-cards-mp">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`plan-card-mp ${selectedPlan?.name === plan.name ? 'selected-mp' : ''}`}
              onClick={() => !processingPayment && setSelectedPlan(plan)}
            >
              <div className="plan-name-mp">{plan.name}</div>
              <div className="plan-price-mp">{plan.price} FCFA</div>
              <div className="plan-duration-mp">{plan.duration}</div>
              <div className="plan-description-mp">{plan.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group-mp">
        <label className="form-label-mp">
          {serviceName === 'DSTV' ? 'SmartCard Number' : 'Netflix Email'}
        </label>
        <input
          type={serviceName === 'DSTV' ? 'text' : 'email'}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder={serviceName === 'DSTV' ? 'Enter SmartCard number' : 'Enter Netflix email'}
          className="form-input-mp"
          disabled={processingPayment}
        />
      </div>

      <div className="form-group-mp">
        <label className="form-label-mp">Mobile Money Number</label>
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
          disabled={!selectedPlan || !accountNumber || !mobileMoneyNumber || processingPayment}
          style={{ opacity: !selectedPlan || !accountNumber || !mobileMoneyNumber || processingPayment ? 0.7 : 1 }}
        >
          {processingPayment ? 'Processing...' : `Pay ${selectedPlan?.price || 0} FCFA`}
        </button>
      </div>

      <style>{`
        .plan-cards-mp {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
        }

        .plan-card-mp {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .plan-card-mp.selected-mp {
          border-color: #2196F3;
          background: #e3f2fd;
        }

        .plan-name-mp {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 5px;
        }

        .plan-price-mp {
          color: #2196F3;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .plan-duration-mp {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .plan-description-mp {
          font-size: 14px;
          color: #444;
        }
      `}</style>
    </>
  );
};

export default SubscriptionPurchase;
