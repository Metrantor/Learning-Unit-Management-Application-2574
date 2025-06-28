import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiFolder, FiFileText, FiTrendingUp } = FiIcons;

const Dashboard = () => {
  const { topics, getTopicStats, EDITORIAL_STATES } = useLearningUnits();

  const getStateColor = (state) => {
    const colors = {
      [EDITORIAL_STATES.PLANNING]: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      [EDITORIAL_STATES.DRAFT]: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      [EDITORIAL_STATES.REVIEW]: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      [EDITORIAL_STATES.READY]: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      [EDITORIAL_STATES.PUBLISHED]: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    };
    return colors[state] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meine Themen</h2>
        <div className="flex space-x-3">
          <Link
            to="/topics/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiFolder} className="h-4 w-4 mr-2" />
            Neues Thema
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Neue Lerneinheit
          </Link>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiFolder} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Themen vorhanden</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Erstellen Sie Ihr erstes Thema, um Lerneinheiten zu organisieren.</p>
          <Link
            to="/topics/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiFolder} className="h-4 w-4 mr-2" />
            Thema erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => {
            const stats = getTopicStats(topic.id);
            
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {topic.title}
                    </h3>
                    {topic.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Completion Percentage */}
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold ${getPercentageColor(stats.percentage)} mb-1`}>
                    {stats.percentage}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    bereit/veröffentlicht
                  </div>
                  <div className="flex items-center justify-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <SafeIcon icon={FiTrendingUp} className="h-3 w-3 mr-1" />
                    {stats.readyOrPublished} von {stats.total} Einheiten
                  </div>
                </div>

                {/* Status Overview */}
                {stats.total > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status-Übersicht:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(stats.statusCounts).map(([state, count]) => (
                        count > 0 && (
                          <div key={state} className={`px-2 py-1 rounded text-center ${getStateColor(state)}`}>
                            {count}x {state.split(' ')[0]}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/topics/${topic.id}`}
                    className="inline-flex items-center px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-sm"
                  >
                    <SafeIcon icon={FiFileText} className="h-4 w-4 mr-2" />
                    Lerneinheiten ({stats.total})
                  </Link>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(topic.updatedAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;