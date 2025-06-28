import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

// Tab Components
import MasterDataTab from '../components/tabs/MasterDataTab';
import ExplanationTab from '../components/tabs/ExplanationTab';
import SpeechTextTab from '../components/tabs/SpeechTextTab';
import SnippetsTab from '../components/tabs/SnippetsTab';
import VideoTab from '../components/tabs/VideoTab';

const { FiArrowLeft, FiBookOpen, FiEdit, FiMic, FiPackage, FiVideo, FiChevronRight } = FiIcons;

const TABS = [
  { id: 'masterdata', label: 'Stammdaten', icon: FiBookOpen, component: MasterDataTab },
  { id: 'explanation', label: 'Schriftliche Erklärung', icon: FiEdit, component: ExplanationTab },
  { id: 'speechtext', label: 'Sprechtext', icon: FiMic, component: SpeechTextTab },
  { id: 'snippets', label: 'Snippets', icon: FiPackage, component: SnippetsTab },
  { id: 'video', label: 'Video', icon: FiVideo, component: VideoTab }
];

const LearningUnitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLearningUnit, getTopic, getTrainingModule, getTraining, getSubject } = useLearningUnits();
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

  // Get hierarchy for breadcrumb navigation
  const topic = unit.topicId ? getTopic(unit.topicId) : null;
  const trainingModule = topic?.trainingModuleId ? getTrainingModule(topic.trainingModuleId) : null;
  const training = trainingModule?.trainingId ? getTraining(trainingModule.trainingId) : null;
  const subject = training?.subjectId ? getSubject(training.subjectId) : null;

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
            Dashboard
          </Link>
          {subject && (
            <>
              <SafeIcon icon={FiChevronRight} className="h-4 w-4 mx-2" />
              <Link 
                to={`/subjects/${subject.id}`} 
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {subject.title}
              </Link>
            </>
          )}
          {training && (
            <>
              <SafeIcon icon={FiChevronRight} className="h-4 w-4 mx-2" />
              <Link 
                to={`/trainings/${training.id}`} 
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {training.title}
              </Link>
            </>
          )}
          {trainingModule && (
            <>
              <SafeIcon icon={FiChevronRight} className="h-4 w-4 mx-2" />
              <Link 
                to={`/training-modules/${trainingModule.id}`} 
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {trainingModule.title}
              </Link>
            </>
          )}
          {topic && (
            <>
              <SafeIcon icon={FiChevronRight} className="h-4 w-4 mx-2" />
              <Link 
                to={`/topics/${topic.id}`} 
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {topic.title}
              </Link>
            </>
          )}
          <SafeIcon icon={FiChevronRight} className="h-4 w-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{unit.title}</span>
        </div>

        <button
          onClick={() => topic ? navigate(`/topics/${topic.id}`) : navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          {topic ? `Zurück zu ${topic.title}` : 'Zurück zum Dashboard'}
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{unit.title}</h2>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
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
                {tab.id === 'video' && unit.video && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                    ●
                  </span>
                )}
                {tab.id === 'explanation' && unit.explanationComments?.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {unit.explanationComments.length}
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