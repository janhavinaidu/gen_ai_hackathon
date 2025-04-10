
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Automatically redirect to the dashboard
  return <Navigate to="/" replace />;
};

export default Index;
