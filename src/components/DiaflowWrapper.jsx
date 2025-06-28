import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DiaflowWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Show Diaflow widget when user is authenticated
      const diaflowElement = document.getElementById('diaflow-chat');
      if (diaflowElement) {
        diaflowElement.style.display = 'block';
      }
    } else {
      // Hide Diaflow widget when user is not authenticated
      const diaflowElement = document.getElementById('diaflow-chat');
      if (diaflowElement) {
        diaflowElement.style.display = 'none';
      }
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default DiaflowWrapper;