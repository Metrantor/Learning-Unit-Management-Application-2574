import React from 'react';
import { useQuestAuth } from '../context/QuestAuthContext';
import QuestLoginPage from './auth/QuestLoginPage';
import QuestOnboardingPage from './auth/QuestOnboardingPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, needsOnboarding } = useQuestAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <QuestLoginPage />;
  }

  if (needsOnboarding) {
    return <QuestOnboardingPage />;
  }

  return children;
};

export default ProtectedRoute;