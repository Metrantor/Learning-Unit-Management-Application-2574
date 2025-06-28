import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits, EDITORIAL_STATES } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCalendar, FiTarget, FiFileText, FiChevronRight, FiClock } = FiIcons;

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getTopic, 
    getLearningUnitsByTopic, 
    deleteTopic, 
    deleteLearningUnit, 
    getTrainingModule, 
    getTraining, 
    getSubject 
  } = useLearningUnits();

  const topic = getTopic(id);
  const learningUnits = getLearningUnitsByTopic(id);

  // Get hierarchy for breadcrumb
  const trainingModule = topic?.trainingModuleId ? getTrainingModule(topic.trainingModuleId) : null;
  const training = trainingModule?.trainingId ? getTraining(trainingModule.trainingId) : null;
  const subject = training?.subjectId ? getSubject(training.subjectId) : null;

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

  const isTargetDateOverdue = (unit) => {
    if (!unit.targetDate) return false;
    const targetDate = new Date(unit.targetDate);
    const today = new Date();
    const isOverdue = targetDate < today;
    const isNotReady = unit.editorialState !== EDITORIAL_STATES.READY && unit.editorialState !== EDITORIAL_STATES.PUBLISHED;
    return isOverdue && isNotReady;
  };

  const handleDeleteUnit = (unitId, title) => {
    if (window.confirm(`Möchten Sie die Lerneinheit "${title}" wirklich löschen?`)) {
      deleteLearningUnit(unitId);
    }
  };

  const handleDeleteTopic = () => {
    if (window.confirm(`Möchten Sie das Thema "${topic.title}" wirklich löschen? Alle zugehörigen Lerneinheiten werden ebenfalls gelöscht.`)) {
      deleteTopic(topic.id);
      if (trainingModule) {
        navigate(`/training-modules/${trainingModule.id}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="space-y-6">
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
          <SafeIcon icon={FiChevronRight} className="h-4 w-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{topic.title}</span>
        </div>

        <button
          onClick={() => trainingModule ? navigate(`/training-modules/${trainingModule.id}`) : navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          {trainingModule ? `Zurück zu ${trainingModule.title}` : 'Zurück zum Dashboard'}
        </button>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{topic.title}</h2>
            {topic.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{topic.description}</p>
            )}
          </div>
          <div className="flex space-x-2 ml-4">
            <Link
              to={`/topics/${topic.id}/edit`}
              className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
              Bearbeiten
            </Link>
            <button
              onClick={handleDeleteTopic}
              className="inline-flex items-center px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="h-4 w-4 mr-2" />
              Löschen
            </button>
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
                {unit.targetDate && (
                  <div className="flex items-center text-sm">
                    <SafeIcon 
                      icon={isTargetDateOverdue(unit) ? FiClock : FiCalendar} 
                      className={`h-4 w-4 mr-2 ${isTargetDateOverdue(unit) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} 
                    />
                    <span className={isTargetDateOverdue(unit) ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                      Ziel: {new Date(unit.targetDate).toLocaleDateString('de-DE')}
                      {isTargetDateOverdue(unit) && ' (überfällig)'}
                    </span>
                  </div>
                )}
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
                  onClick={() => handleDeleteUnit(unit.id, unit.title)}
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