import React, { createContext, useContext, useState, useEffect } from 'react';
import questConfig from '../config/questConfig';

const QuestAuthContext = createContext();

export const useQuestAuth = () => {
  const context = useContext(QuestAuthContext);
  if (!context) {
    throw new Error('useQuestAuth must be used within a QuestAuthProvider');
  }
  return context;
};

export const QuestAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const savedUser = localStorage.getItem('questUser');
    const savedToken = localStorage.getItem('questToken');
    const onboardingComplete = localStorage.getItem('questOnboardingComplete');

    if (savedUser && savedToken) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setNeedsOnboarding(!onboardingComplete);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = ({ userId, token, newUser }) => {
    const userData = {
      id: userId,
      token: token,
      isNewUser: newUser
    };

    localStorage.setItem('questUser', JSON.stringify(userData));
    localStorage.setItem('questToken', token);
    localStorage.setItem('questUserId', userId);

    setUser(userData);
    setIsAuthenticated(true);
    setNeedsOnboarding(newUser);
  };

  const completeOnboarding = () => {
    localStorage.setItem('questOnboardingComplete', 'true');
    setNeedsOnboarding(false);
  };

  const logout = () => {
    localStorage.removeItem('questUser');
    localStorage.removeItem('questToken');
    localStorage.removeItem('questUserId');
    localStorage.removeItem('questOnboardingComplete');
    
    setUser(null);
    setIsAuthenticated(false);
    setNeedsOnboarding(false);
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    needsOnboarding,
    handleLogin,
    completeOnboarding,
    logout
  };

  return (
    <QuestAuthContext.Provider value={value}>
      {children}
    </QuestAuthContext.Provider>
  );
};