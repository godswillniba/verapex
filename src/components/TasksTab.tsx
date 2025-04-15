
import React, { useState, useEffect } from 'react';
import { DocumentData } from 'firebase/firestore';
import { authStateListener } from "../../firebase/auth";
import { listenToUserData } from "../../firebase/firestore";
import { formatAmount } from '../utils/formatters';
import { Task } from '../types';



const TasksTab: React.FC = () => {
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserData: () => void = () => {};

    const unsubscribeAuth = authStateListener((user) => {
      if (user) {
        unsubscribeUserData = listenToUserData(user, (data) => {
          setUserData(data);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserData();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Please sign in to view tasks</div>;
  }

  if (!userData.tasks || userData.tasks.length === 0) {
    return (
      <div className="tab-content">
        <div className="grid-container">
          <div className="left-side">
            <div className="text-box">
              <h2>Complete <span style={{ color: '#006600' }}>Tasks</span> <br /> Earn Money</h2>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#9CA3AF' }}>
          No tasks available at the moment
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="grid-container">
        <div className="left-side">
          <div className="text-box">
            <h2 style={{ lineHeight: 1.2 }}>
              Complete <span style={{ color: '#006600' }}>Tasks</span>
              <br />
              Earn Money
            </h2>
          </div>

          <div className="earnings-box">
            <p className="earnings-title">Task Earnings</p>
            <h1 className="earnings-amount">{formatAmount(userData.earnings?.tasks || 0)} {userData.currency}</h1>
            
          </div>
        </div>

        <div className="image-box">
          <img 
            src="/IMG_8154.png"
            alt="Complete tasks" 
            className="refer-people-image"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        {userData.tasks.map((task: Task) => (
          <div
            key={task.id}
            style={{
              backgroundColor: '#1E1D1D',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '15px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>{task.title}</h3>
              <div style={{ color: '#006600', fontWeight: 'bold' }}>
                {formatAmount(task.reward)} {userData.currency}
              </div>
            </div>
            <p style={{ color: '#9CA3AF', margin: '10px 0' }}>{task.description}</p>
            <button
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #006600',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#006600';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Start Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksTab;
