import { DocumentData } from '../../firebase/firestore';

export interface WithdrawalTabProps {
  data?: {
    transactions?: Array<{
      id: string;
      date: string | number;
      amount: number;
      status: string;
    }>;
  };
}

export interface Transaction {
  id: string;
  date: string | number;
  amount: number;
  status: string;
  provider?: 'MTN' | 'ORANGE';
  mobileNumber?: string;
}

export interface FinanceData {
  balances: {
    withdrawable: number;
    total: number;
    pending: number;
  };
  currency?: string;
  transactions: Transaction[];
}
