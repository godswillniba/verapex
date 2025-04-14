import React from 'react';
import { useLocation } from 'react-router-dom';

const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default RouteTransition;