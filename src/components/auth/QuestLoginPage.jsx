import React from 'react';
import { QuestLogin } from '@questlabs/react-sdk';
import { useQuestAuth } from '../../context/QuestAuthContext';
import { motion } from 'framer-motion';
import questConfig from '../../config/questConfig';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBook, FiShield, FiUsers, FiTrendingUp } = FiIcons;

const QuestLoginPage = () => {
  const { handleLogin } = useQuestAuth();

  const onLoginSubmit = ({ userId, token, newUser }) => {
    handleLogin({ userId, token, newUser });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800"></div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-white bg-opacity-5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <SafeIcon icon={FiBook} className="h-12 w-12 mr-4" />
              <h1 className="text-4xl font-bold">SkillBase Workshop</h1>
            </div>
            
            <h2 className="text-2xl font-light mb-6">
              Willkommen zurück
            </h2>
            
            <p className="text-xl text-primary-100 mb-12 leading-relaxed">
              Ihr zentraler Ort für die Erstellung und Verwaltung von Lerneinheiten. 
              Entwickeln Sie strukturierte Bildungsinhalte mit unserem intuitiven System.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-6">
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SafeIcon icon={FiShield} className="h-6 w-6 mr-4 text-primary-200" />
                <span className="text-primary-100">Sichere Authentifizierung</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SafeIcon icon={FiUsers} className="h-6 w-6 mr-4 text-primary-200" />
                <span className="text-primary-100">Kollaborative Arbeitsräume</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SafeIcon icon={FiTrendingUp} className="h-6 w-6 mr-4 text-primary-200" />
                <span className="text-primary-100">Fortschrittsverfolgung</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Authentication */}
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SkillBase Workshop</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Melden Sie sich an, um fortzufahren</p>
          </div>

          {/* Quest Login Component */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Anmelden
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Geben Sie Ihre Anmeldedaten ein
              </p>
            </div>

            <QuestLogin
              onSubmit={onLoginSubmit}
              email={true}
              google={false}
              accent={questConfig.PRIMARY_COLOR}
            />

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Demo-Zugang:
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Verwenden Sie <strong>admin@example.com</strong> mit Code <strong>ADMIN2024</strong>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Noch keinen Zugang? Wenden Sie sich an Ihren Administrator.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestLoginPage;