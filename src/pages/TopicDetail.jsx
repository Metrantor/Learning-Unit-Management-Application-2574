import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCalendar, FiTarget, FiFileText } = FiIcons;

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTopic, getLearningUnitsByTopic, deleteLearningUnit, EDITORIAL_STATES } = useLearningUnits();

  const topic = getTopic(id);
  const learningUnits = getLearningUnitsByTopic(id);

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thema nicht gefunden</h3>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

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

  const handleDelete = (unitId, title) => {
    if (window.confirm(`Möchten Sie die Lerneinheit "${title}" wirklich löschen?`)) {
      deleteLearningUnit(unitId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{topic.title}</h2>
            {topic.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{topic.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lerneinheiten ({learningUnits.length})
        </h3>
        <Link
          to={`/create?topicId=${topic.id}`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
          Neue Lerneinheit
        </Link>
      </div>

      {learningUnits.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiFileText} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Lerneinheiten vorhanden</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Erstellen Sie die erste Lerneinheit für dieses Thema.</p>
          <Link
            to={`/create?topicId=${topic.id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Lerneinheit erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningUnits.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {unit.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(unit.editorialState)}`}>
                  {unit.editorialState}
                </span>
              </div>

              {unit.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {unit.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {unit.learningGoals.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <SafeIcon icon={FiTarget} className="h-4 w-4 mr-2" />
                    {unit.learningGoals.length} Lernziele
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <SafeIcon icon={FiCalendar} className="h-4 w-4 mr-2" />
                  {new Date(unit.updatedAt).toLocaleDateString('de-DE')}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Link
                  to={`/unit/${unit.id}`}
                  className="inline-flex items-center px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-sm"
                >
                  <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Link>
                <button
                  onClick={() => handleDelete(unit.id, unit.title)}
                  className="inline-flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-sm"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicDetail;