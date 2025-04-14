import React, { useState } from 'react';
import { Tv, Smartphone, Facebook, Instagram, MessageCircle, Send, Activity, Gift } from 'lucide-react';
import AirtimePurchase from './components/AirtimePurchase';
import SubscriptionPurchase from './components/SubscriptionPurchase';
import AccountPurchase from './components/AccountPurchase';
import CryptoCardSell from './components/CryptoCardSell';
import BottomSheet from './components/BottomSheet';
import BackButton from '../BackButton';
// Define types for our services
type ServiceType = 'airtime' | 'subscription' | 'social' | 'crypto' | 'cards';

interface Service {
  name: string;
  type: ServiceType;
  color: string;
  borderColor?: string;
  icon: React.ReactNode;
}

// Group our services by category
const services = {
  telecom: [
    { 
      name: 'MTN', 
      type: 'airtime' as ServiceType, 
      color: '#FFC107',
      icon: <Smartphone strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'Orange', 
      type: 'airtime' as ServiceType, 
      color: '#FF5722',
      icon: <Smartphone strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'DSTV', 
      type: 'subscription' as ServiceType, 
      color: '#2196F3',
      icon: <Tv strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'Netflix', 
      type: 'subscription' as ServiceType, 
      color: '#E53935',
      icon: <Tv strokeWidth={1.5} size={24} /> 
    },
  ],
  social: [
    { 
      name: 'Facebook', 
      type: 'social' as ServiceType, 
      color: '#1976D2',
      icon: <Facebook strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'Instagram', 
      type: 'social' as ServiceType, 
      color: '#C2185B',
      icon: <Instagram strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'Threads', 
      type: 'social' as ServiceType, 
      color: '#000000', 
      borderColor: '#ffffff',
      icon: <MessageCircle strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'Telegram', 
      type: 'social' as ServiceType, 
      color: '#0288D1',
      icon: <Send strokeWidth={1.5} size={24} /> 
    },
  ],
  crypto: [
    { 
      name: 'Pi Coins', 
      type: 'crypto' as ServiceType, 
      color: '#6200EA',
      icon: <Activity strokeWidth={1.5} size={24} /> 
    },
    { 
      name: 'Gift Cards', 
      type: 'cards' as ServiceType, 
      color: '#00BCD4',
      icon: <Gift strokeWidth={1.5} size={24} /> 
    },
  ]
};

const MobilePurchases = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowBottomSheet(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handlePurchase = () => {
    if (!selectedService) return;

    setProcessingPayment(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentComplete(true);

      // Reset after showing success message
      setTimeout(() => {
        setPaymentComplete(false);
        setShowBottomSheet(false);
        setAmount('');
        setSelectedService(null);
      }, 2000);
    }, 1500);
  };

  const closeBottomSheet = () => {
    if (!processingPayment) {
      setShowBottomSheet(false);
      setSelectedService(null);
      setAmount('');
      setPaymentComplete(false);
    }
  };

  const handleViewAll = (category: string) => {
    alert(`Viewing all ${category}`);
  };

  const renderServiceButtons = (serviceList: Service[]) => {
    return (
      <div className="small-buttons-container-mp">
      
        {serviceList.map((service) => (
          <button
            key={service.name}
            className="purchase-button-mp small-button-mp"
            style={{ 
              backgroundColor: service.color,
              border: service.borderColor ? `1px solid ${service.borderColor}` : 'none' 
            }}
            onClick={() => handleServiceSelect(service)}
          >
            <div className="button-content-mp">
              <div className="icon-container-mp">
                {service.icon}
              </div>
              <div className="service-name-mp">{service.name}</div>
            </div>
          </button>
        ))}
      </div>
      );
      };

      // Determine which component to render based on service type
      const renderServiceForm = () => {
      if (!selectedService) return null;

      switch (selectedService.type) {
      case 'airtime':
        return (
          <AirtimePurchase
            serviceName={selectedService.name}
            onClose={closeBottomSheet}
            onPurchase={handlePurchase}
            processingPayment={processingPayment}
          />
        );
      case 'subscription':
        return (
          <SubscriptionPurchase
            serviceName={selectedService.name}
            onClose={closeBottomSheet}
            onPurchase={handlePurchase}
            processingPayment={processingPayment}
          />
        );
      case 'social':
        return (
          <AccountPurchase
            serviceName={selectedService.name}
            onClose={closeBottomSheet}
            onPurchase={handlePurchase}
            processingPayment={processingPayment}
          />
        );
      case 'crypto':
      case 'cards':
        return (
          <CryptoCardSell
            serviceName={selectedService.name}
            onClose={closeBottomSheet}
            onPurchase={handlePurchase}
            processingPayment={processingPayment}
          />
        );
      default:
        return (
          <div className="form-group-mp">
            <label className="form-label-mp">Enter Amount</label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="form-input-mp"
              disabled={processingPayment}
            />
            <div className="button-group-mp">
              <button
                onClick={closeBottomSheet}
                className="cancel-button-mp"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="purchase-button-mp confirm-button-mp"
                disabled={!amount || processingPayment}
                style={{ opacity: !amount || processingPayment ? 0.7 : 1 }}
              >
                {processingPayment ? 'Processing...' : 'Complete Purchase'}
              </button>
            </div>
          </div>
        );
      }
      };

      return (
      <div className="marketplace-container-mp">
        <BackButton />
        <br/>
      <h1 className="title-mp">Buy Airtime & Subscriptions</h1>
      {renderServiceButtons(services.telecom)}

      <button 
        className="purchase-button-mp large-button-mp subscriptions-mp"
        onClick={() => handleViewAll('subscriptions')}
      >
        View All Subscriptions
      </button>

      <h1 className="title-mp">Buy Social Media Accounts</h1>
      {renderServiceButtons(services.social)}

      <button 
        className="purchase-button-mp large-button-mp social-mp"
        onClick={() => handleViewAll('social accounts')}
      >
        View All Social Accounts
      </button>

      <h1 className="title-mp">Sell Cryptocurrency & Gift Cards</h1>
      {renderServiceButtons(services.crypto)}

      <BottomSheet
        isOpen={showBottomSheet && selectedService !== null}
        onClose={closeBottomSheet}
        title={selectedService?.type === 'crypto' || selectedService?.type === 'cards'
          ? `Sell ${selectedService?.name}`
          : `Purchase ${selectedService?.name}`}
        icon={selectedService?.icon}
        iconColor={selectedService?.color}
        showSuccess={paymentComplete}
        successMessage={selectedService?.type === 'crypto' || selectedService?.type === 'cards'
          ? 'Sale Successful!'
          : 'Payment Successful!'}
        successSubMessage={selectedService?.type === 'crypto' || selectedService?.type === 'cards'
          ? `Your ${selectedService?.name} sale is being processed.`
          : `Your ${selectedService?.name} purchase is complete.`}
      >
        {renderServiceForm()}
      </BottomSheet>

      <style>{`
        .marketplace-container-mp {
  padding: 20px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  display: flex;
  background-color: black;
  flex-direction: column;
  gap: 15px;
  box-sizing: border-box;
  min-height: 100vh;
}

.small-buttons-container-mp {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.large-button-mp {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.title-mp {
  color: white;
  font-size: 18px;
  margin: 10px 0;
}

.small-buttons-container-mp {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.purchase-button-mp {
  background-color: #00c853;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.purchase-button-mp:active {
  transform: scale(0.98);
}

.small-button-mp {
  width: calc(25% - 8px);
  height: 70px;
  font-size: 12px;
  padding: 0;
}

.button-content-mp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-container-mp {
  margin-bottom: 4px;
}

.service-name-mp {
  font-size: 10px;
}

.large-button-mp {
  width: 100%;
  height: 60px;
  font-size: 16px;
}

.subscriptions-mp {
  background-color: #4CAF50;
}

.social-mp {
  background-color: #1976D2;
}

.bottom-sheet-overlay-mp {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.bottom-sheet-mp {
  background-color: white;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 20px;
  position: relative;
  transition: transform 0.3s ease-out;
  animation: slideUp 0.3s forwards;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.bottom-sheet-mp.success-mp {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottom-sheet-header-mp {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.bottom-sheet-handle-mp {
  width: 40px;
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 15px;
}

.sheet-title-mp {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.selected-service-icon-mp {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.form-group-mp {
  margin-bottom: 20px;
}

.form-label-mp {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input-mp {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.button-group-mp {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.cancel-button-mp {
  flex: 1;
  padding: 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.confirm-button-mp {
  flex: 2;
  padding: 12px;
  background-color: #00c853;
  border-radius: 8px;
}

.confirm-button-mp:disabled {
  cursor: not-allowed;
}

.payment-success-mp {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon-mp {
  width: 60px;
  height: 60px;
  background-color: #00c853;
  color: white;
  font-size: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}
      `}</style>
    </div>
  );
};

export default MobilePurchases;