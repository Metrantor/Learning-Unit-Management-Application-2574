import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DiaflowWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait a bit for the DOM to be ready
    const timer = setTimeout(() => {
      const diaflowElement = document.getElementById('diaflow-chat');
      console.log('Diaflow element found:', diaflowElement);
      console.log('Is authenticated:', isAuthenticated);
      
      if (diaflowElement) {
        if (isAuthenticated) {
          diaflowElement.style.display = 'block';
          diaflowElement.style.visibility = 'visible';
          diaflowElement.style.opacity = '1';
          console.log('Showing Diaflow widget');
        } else {
          diaflowElement.style.display = 'none';
          diaflowElement.style.visibility = 'hidden';
          diaflowElement.style.opacity = '0';
          console.log('Hiding Diaflow widget');
        }
      } else {
        console.error('Diaflow element not found!');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default DiaflowWrapper;