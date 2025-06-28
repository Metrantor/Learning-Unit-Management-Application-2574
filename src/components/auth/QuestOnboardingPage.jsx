import React, { useState } from 'react';
import { OnBoarding } from '@questlabs/react-sdk';
import { useQuestAuth } from '../../context/QuestAuthContext';
import { motion } from 'framer-motion';
import questConfig from '../../config/questConfig';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBook, FiTarget, FiUsers, FiTrendingUp, FiCheckCircle } = FiIcons;

const QuestOnboardingPage = () => {
  const { user, completeOnboarding } = useQuestAuth();
  const [answers, setAnswers] = useState({});
  
  const userId = localStorage.getItem('questUserId') || user?.id;
  const token = localStorage.getItem('questToken') || user?.token;

  const handleOnboardingComplete = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Left Section - Welcome & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-16 right-20 w-40 h-40 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-16 w-56 h-56 bg-white bg-opacity-5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <SafeIcon icon={FiBook} className="h-12 w-12 mr-4" />
              <h1 className="text-4xl font-bold">Fast geschafft!</h1>
            </div>
            
            <h2 className="text-2xl font-light mb-6">
              Lassen Sie uns Ihr Profil einrichten
            </h2>
            
            <p className="text-xl text-green-100 mb-12 leading-relaxed">
              Nur noch wenige Schritte, dann können Sie mit der Erstellung 
              Ihrer ersten Lerneinheiten beginnen.
            </p>

            {/* Setup Steps */}
            <div className="space-y-6">
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SafeIcon icon={FiCheckCircle} className="h-6 w-6 mr-4 text-green-200" />
                <span className="text-green-100">Konto erfolgreich erstellt</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SafeIcon icon={FiTarget} className="h-6 w-6 mr-4 text-green-200" />
                <span className="text-green-100">Präferenzen konfigurieren</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SafeIcon icon={FiUsers} className="h-6 w-6 mr-4 text-green-200" />
                <span className="text-green-100">Arbeitsbereich einrichten</span>
              </motion.div>

              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <SafeIcon icon={FiTrendingUp} className="h-6 w-6 mr-4 text-green-200" />
                <span className="text-green-100">Loslegen!</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Onboarding Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <SafeIcon icon={FiBook} className="h-10 w-10 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Willkommen!</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Lassen Sie uns Ihr Profil einrichten</p>
          </div>

          {/* Quest Onboarding Component */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Profil einrichten
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Helfen Sie uns, Ihr Erlebnis zu personalisieren
                </p>
              </div>

              {userId && token && (
                <OnBoarding
                  userId={userId}
                  token={token}
                  questId={questConfig.QUEST_ONBOARDING_QUESTID}
                  answer={answers}
                  setAnswer={setAnswers}
                  getAnswers={handleOnboardingComplete}
                  accent={questConfig.PRIMARY_COLOR}
                  singleChoose="modal1"
                  multiChoice="modal2"
                >
                  <OnBoarding.Header />
                  <OnBoarding.Content />
                  <OnBoarding.Footer />
                </OnBoarding>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sie können diese Einstellungen später in Ihrem Profil ändern.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestOnboardingPage;