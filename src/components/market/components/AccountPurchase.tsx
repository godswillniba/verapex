import React from 'react';

interface SocialAccount {
  name: string;
  price: number;
  features: string[];
  lifespan: string;
}

interface BulkAccount {
  price: number;
  description: string;
}

const FACEBOOK_ACCOUNTS: SocialAccount[] = [
  { name: 'Standard', price: 2000, features: ['Profile', 'Friend Requests', 'Basic Usage'], lifespan: '3 Months' },
  { name: 'Premium', price: 3500, features: ['Profile', 'Friend Requests', 'Page Admin'], lifespan: '6 Months' },
  { name: 'Business', price: 5000, features: ['Profile', 'Ad Manager', 'Business Tools'], lifespan: '1 Year' }
];

const INSTAGRAM_ACCOUNTS: SocialAccount[] = [
  { name: 'Basic', price: 2500, features: ['Profile', 'Posts', 'Stories'], lifespan: '3 Months' },
  { name: 'Creator', price: 4000, features: ['Profile', 'Posts', 'Stories', 'Insights'], lifespan: '6 Months' },
  { name: 'Influencer', price: 6000, features: ['Profile', 'Verified Badge', 'All Features'], lifespan: '1 Year' }
];

const THREADS_ACCOUNTS: SocialAccount[] = [
  { name: 'Regular', price: 2000, features: ['Basic Posts', 'Comments'], lifespan: '3 Months' },
  { name: 'Creator', price: 3500, features: ['Enhanced Posts', 'Analytics'], lifespan: '6 Months' }
];

const TELEGRAM_ACCOUNTS: SocialAccount[] = [
  { name: 'Standard', price: 1800, features: ['Messaging', 'Groups'], lifespan: '3 Months' },
  { name: 'Premium', price: 3000, features: ['All Features', 'No Limits'], lifespan: '1 Year' }
];

const BULK_ACCOUNTS: Record<string, BulkAccount> = {
  'Facebook': {
    price: 1000,
    description: 'Aged Facebook accounts, all over 3 years old and valid. Basic functionality included.'
  },
  'Instagram': {
    price: 1000,
    description: 'Aged Instagram accounts, all over 3 years old and valid. Basic functionality included.'
  },
  'Threads': {
    price: 1000,
    description: 'Aged Threads accounts, all over 3 years old and valid. Basic functionality included.'
  },
  'Telegram': {
    price: 1000,
    description: 'Aged Telegram accounts, all over 3 years old and valid. Basic functionality included.'
  }
};

interface AccountPurchaseProps {
  serviceName: string;
  onClose: () => void;
  onPurchase: (data: any) => void;
  processingPayment: boolean;
}

const AccountPurchase: React.FC<AccountPurchaseProps> = ({
  serviceName,
  onClose,
  onPurchase,
  processingPayment
}) => {
  const [purchaseType, setPurchaseType] = React.useState<'regular' | 'bulk'>('regular');
  const [selectedAccount, setSelectedAccount] = React.useState<SocialAccount | null>(null);
  const [email, setEmail] = React.useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = React.useState('');
  const [bulkQuantity, setBulkQuantity] = React.useState(1);

  const getAccounts = () => {
    switch (serviceName) {
      case 'Facebook': return FACEBOOK_ACCOUNTS;
      case 'Instagram': return INSTAGRAM_ACCOUNTS;
      case 'Threads': return THREADS_ACCOUNTS;
      case 'Telegram': return TELEGRAM_ACCOUNTS;
      default: return [];
    }
  };

  const accounts = getAccounts();
  const bulkAccount = BULK_ACCOUNTS[serviceName];

  const handleSubmit = () => {
    if (purchaseType === 'regular') {
      onPurchase({
        account: selectedAccount,
        email,
        mobileMoneyNumber,
        amount: selectedAccount?.price
      });
    } else {
      onPurchase({
        account: {
          name: `Bulk ${serviceName}`,
          price: bulkAccount.price,
          quantity: bulkQuantity
        },
        email,
        mobileMoneyNumber,
        amount: bulkAccount.price * bulkQuantity
      });
    }
  };

  return (
    <>
      <div className="purchase-type-toggle-mp">
        <button 
          className={`toggle-button-mp ${purchaseType === 'regular' ? 'active-mp' : ''}`}
          onClick={() => setPurchaseType('regular')}
          disabled={processingPayment}
        >
          Standard Accounts
        </button>
        <button 
          className={`toggle-button-mp ${purchaseType === 'bulk' ? 'active-mp' : ''}`}
          onClick={() => setPurchaseType('bulk')}
          disabled={processingPayment}
        >
          Bulk Purchase (1000 FCFA Each)
        </button>
      </div>

      {purchaseType === 'regular' ? (
        <div className="form-group-mp">
          <label className="form-label-mp">Choose Account Type</label>
          <div className="account-cards-mp">
            {accounts.map(account => (
              <div
                key={account.name}
                className={`account-card-mp ${selectedAccount?.name === account.name ? 'selected-mp' : ''}`}
                onClick={() => !processingPayment && setSelectedAccount(account)}
              >
                <div className="account-name-mp">{account.name}</div>
                <div className="account-price-mp">{account.price} FCFA</div>
                <div className="account-lifespan-mp">{account.lifespan}</div>
                <div className="account-features-mp">
                  {account.features.map((feature, index) => (
                    <div key={index} className="feature-item-mp">• {feature}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="form-group-mp">
          <div className="bulk-section-mp">
            <div className="bulk-info-mp">
              <h3>Bulk {serviceName} Accounts - 1000 FCFA Each</h3>
              <p className="bulk-description-mp">{bulkAccount.description}</p>
              <div className="bulk-badge-mp">All accounts over 3 years old and valid</div>
            </div>

            <div className="quantity-selector-mp">
              <label className="form-label-mp">How many accounts do you want?</label>
              <div className="quantity-control-mp">
                <button 
                  className="quantity-button-mp"
                  onClick={() => setBulkQuantity(prev => Math.max(1, prev - 1))}
                  disabled={bulkQuantity <= 1 || processingPayment}
                >-</button>
                <input
                  type="number"
                  min="1"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input-mp"
                  disabled={processingPayment}
                />
                <button 
                  className="quantity-button-mp"
                  onClick={() => setBulkQuantity(prev => prev + 1)}
                  disabled={processingPayment}
                >+</button>
              </div>
              <div className="bulk-total-mp">
                Total: {bulkAccount.price * bulkQuantity} FCFA
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-group-mp">
        <label className="form-label-mp">Your Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="form-input-mp"
          disabled={processingPayment}
        />
        <p className="input-help-mp">Account details will be sent to this email</p>
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
          disabled={
            (purchaseType === 'regular' && !selectedAccount) || 
            !email || 
            !mobileMoneyNumber || 
            processingPayment
          }
          style={{ 
            opacity: 
              (purchaseType === 'regular' && !selectedAccount) || 
              !email || 
              !mobileMoneyNumber || 
              processingPayment ? 0.7 : 1 
          }}
        >
          {processingPayment ? 'Processing...' : `Pay ${
            purchaseType === 'regular' 
              ? selectedAccount?.price || 0 
              : bulkAccount.price * bulkQuantity
          } FCFA`}
        </button>
      </div>

      <style>{`
      .purchase-type-toggle-mp {
        display: flex;
        margin-bottom: 20px;
        border-radius: 8px;
        overflow: hidden;
      }

      .toggle-button-mp {
        flex: 1;
        padding: 12px;
        border: none;
        background: #f0f0f0;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }

      .toggle-button-mp.active-mp {
        background: #2196F3;
        color: white;
      }

      .account-cards-mp {
        display: grid;
        gap: 10px;
        margin-bottom: 20px;
      }

      .account-card-mp {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .account-card-mp.selected-mp {
        border-color: #2196F3;
        background: #e3f2fd;
      }

      .account-name-mp {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 5px;
      }

      .account-price-mp {
        color: #2196F3;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .account-lifespan-mp {
        color: #666;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .account-features-mp {
        font-size: 14px;
        color: #444;
      }

      .feature-item-mp {
        margin-bottom: 3px;
      }

      .input-help-mp {
        color: #666;
        font-size: 12px;
        margin-top: 4px;
        margin-bottom: 0;
      }

      .bulk-section-mp {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        background: #f9f9f9;
      }

      .bulk-info-mp h3 {
        margin-top: 0;
        color: #2196F3;
      }

      .bulk-description-mp {
        margin-bottom: 15px;
        color: #555;
      }

      .bulk-badge-mp {
        display: inline-block;
        background: #4CAF50;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 15px;
      }

      .quantity-selector-mp {
        background: white;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #eee;
      }

      .quantity-control-mp {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }

      .quantity-button-mp {
        width: 40px;
        height: 40px;
        border: 1px solid #ddd;
        background: white;
        font-size: 18px;
        cursor: pointer;
      }

      .quantity-input-mp {
        width: 60px;
        height: 40px;
        text-align: center;
        border: 1px solid #ddd;
        margin: 0 10px;
      }

      .bulk-total-mp {
        font-size: 18px;
        font-weight: bold;
        color: #2196F3;
        text-align: right;
      }

      .form-group-mp {
        margin-bottom: 20px;
      }

      .form-label-mp {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
      }

      .form-input-mp {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 16px;
      }

      .button-group-mp {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
      }

      .cancel-button-mp,
      .purchase-button-mp {
        flex: 1;
        padding: 12px 20px;
        border: none;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .cancel-button-mp {
        background: #eee;
        color: #333;
        margin-right: 10px;
      }

      .confirm-button-mp {
        background: #2196F3;
        color: white;
      } `}
        </style>

      {/* You can also update style classes if needed to include -mp */}
    </>
  );
};

export default AccountPurchase;