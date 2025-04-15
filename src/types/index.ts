export type TabName = 'home' | 'investments' | 'tasks' | 'referrals' | 'withdrawals';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  reward: number;
}

export interface Refer {
  id: string;
  name: string;
  date: string;
  amount: number;
}

export interface UserData {
  uid: string;
  email: string;
  firstName: string;
  middleName?: string;
  photoURL?: string;
  profileImage?: string;
  createdAt?: any;
}

// Adding the missing HomeTabProps interface
export interface HomeTabProps {
  data: {
    graphData: Array<{
      date: string;
      value: number;
    }>;
  };
  showBalance: boolean;
  setShowBalance: (show: boolean) => void;
}
