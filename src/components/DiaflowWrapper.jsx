import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DiaflowWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔄 DiaflowWrapper - Auth status:', isAuthenticated);
    
    // Wait for DOM and Diaflow script to be ready
    const checkAndToggleDiaflow = () => {
      const diaflowElement = document.getElementById('diaflow-chat');
      if (diaflowElement) {
        if (isAuthenticated) {
          diaflowElement.style.display = 'block';
          diaflowElement.style.visibility = 'visible';
          diaflowElement.style.opacity = '1';
          diaflowElement.style.pointerEvents = 'auto';
          console.log('✅ Diaflow widget shown');
        } else {
          diaflowElement.style.display = 'none';
          diaflowElement.style.visibility = 'hidden';
          diaflowElement.style.opacity = '0';
          diaflowElement.style.pointerEvents = 'none';
          console.log('❌ Diaflow widget hidden');
        }
      } else {
        console.warn('⚠️ Diaflow element not found, retrying...');
        // Retry after a short delay
        setTimeout(checkAndToggleDiaflow, 500);
      }
    };

    // Initial check with delay to ensure DOM is ready
    const timer = setTimeout(checkAndToggleDiaflow, 1000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default DiaflowWrapper;