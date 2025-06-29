import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiKey, FiLogIn, FiBug } = FiIcons;

const LoginForm = () => {
  const { loginWithInvitationCode, invitationCodes } = useAuth();
  const [formData, setFormData] = useState({
    email: 'admin@example.com', // Pre-filled for convenience
    invitationCode: 'ADMIN2024' // Pre-filled for convenience
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Debug: Log available codes when component mounts
  useEffect(() => {
    console.log('🐛 LoginForm mounted, available codes:', invitationCodes);
  }, [invitationCodes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 Login form submitted');
    console.log('📧 Email:', formData.email);
    console.log('🔑 Code:', formData.invitationCode);

    try {
      await loginWithInvitationCode(formData.email, formData.invitationCode);
      console.log('✅ Login successful');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDebugReset = () => {
    console.log('🔧 Debug: Clearing localStorage and resetting...');
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
            <SafeIcon icon={FiLogIn} className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Anmelden
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Verwenden Sie Ihren Einladungscode als Passwort
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                  placeholder="ihre.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Einladungscode (Passwort)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiKey} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="invitationCode"
                  name="invitationCode"
                  type="text"
                  required
                  value={formData.invitationCode}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                  placeholder="Geben Sie Ihren Code ein"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sie können sich mit Ihrem Code beliebig oft anmelden.
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              🔑 Admin-Zugang (bereits ausgefüllt):
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>E-Mail:</strong> admin@example.com<br />
              <strong>Code:</strong> ADMIN2024
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              💡 Dieser Code funktioniert dauerhaft als Passwort
            </p>
          </div>

          {/* Debug Section */}
          <div className="mt-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <SafeIcon icon={FiBug} className="h-3 w-3 mr-1 inline" />
              Debug Info {showDebug ? '▼' : '▶'}
            </button>
            
            {showDebug && (
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-left">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Verfügbare Codes:</strong>
                </p>
                {invitationCodes.length > 0 ? (
                  invitationCodes.map(code => (
                    <div key={code.id} className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">
                      {code.email} → {code.code} ({code.isActive ? 'Aktiv' : 'Inaktiv'})
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">Keine Codes gefunden!</p>
                )}
                <button
                  onClick={handleDebugReset}
                  className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  LocalStorage löschen & neu starten
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;