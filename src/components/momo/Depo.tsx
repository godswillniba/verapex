import React, { useState } from 'react';
import './App.css';
import VeraPexBanner from './VeraPexBanner';
import MoMoPaymentForm from './MoMoPaymentForm';
import VeraPexBannerBtm from './VeraPexBannerBtm';
import OrangeMoneyPayment from './OrangeMoneyPayment'
import { ChevronsUpDown } from 'lucide-react';


const Depo: React.FC = () => {
    // Moved the useState hook to the top level of the component
    const [paymentMethod, setPaymentMethod] = useState('mtn');

    const handleSubmit = (receipt: File | null) => {
      if (receipt) {
        console.log('Receipt uploaded:', receipt.name);
        // Here you would typically send the file to your server
        // using FormData and fetch or axios
      }
    };

  return (
    <div className="depoContainer">

      <VeraPexBanner />
      <div className="select-container">
        <select 
          className="paymentMethod" 
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="mtn">MTN MoMo</option>
          <option value="orange">Orange Money</option>
        </select>
        <ChevronsUpDown className="select-icon" size={24} strokeWidth={2} />

        
      </div>

      {/* Conditionally render based on payment method */}
      {paymentMethod === 'mtn' ? (
        <MoMoPaymentForm />
      ) : (
        <OrangeMoneyPayment
          accountNumber="670113464"
          accountName="Account"
          amount={3500}
          onSubmit={handleSubmit}
        />
      )}

      <br/>
      <VeraPexBannerBtm />

      {/* Your content goes here */}
    </div>
  );
};

export default Depo;