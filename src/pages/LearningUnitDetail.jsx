import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

// Tab Components
import MasterDataTab from '../components/tabs/MasterDataTab';
import ExplanationTab from '../components/tabs/ExplanationTab';
import SpeechTextTab from '../components/tabs/SpeechTextTab';
import SnippetsTab from '../components/tabs/SnippetsTab';

const { FiArrowLeft, FiDatabase, FiEdit, FiMic, FiPackage } = FiIcons;

const TABS = [
  { id: 'masterdata', label: 'Stammdaten', icon: FiDatabase, component: MasterDataTab },
  { id: 'explanation', label: 'Schriftliche Erklärung', icon: FiEdit, component: ExplanationTab },
  { id: 'speechtext', label: 'Sprechtext', icon: FiMic, component: SpeechTextTab },
  { id: 'snippets', label: 'Snippets', icon: FiPackage, component: SnippetsTab }
];

const LearningUnitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLearningUnit } = useLearningUnits();
  const [activeTab, setActiveTab] = useState('masterdata');

  const unit = getLearningUnit(id);

  if (!unit) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Lerneinheit nicht gefunden</h3>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{unit.title}</h2>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'snippets' && unit.textSnippets?.length > 0 && (
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    {unit.textSnippets.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {ActiveComponent && <ActiveComponent unit={unit} />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LearningUnitDetail;