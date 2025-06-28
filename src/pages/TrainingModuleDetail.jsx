import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCalendar, FiTarget, FiFileText, FiSettings } = FiIcons;

const TrainingModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getTrainingModule, 
    updateTrainingModule,
    trainings,
    getTopicsByTrainingModule, 
    deleteTrainingModule,
    deleteTopic, 
    getTraining, 
    getSubject, 
    getTopicStats 
  } = useLearningUnits();

  const trainingModule = getTrainingModule(id);
  const topics = getTopicsByTrainingModule(id);
  const training = trainingModule ? getTraining(trainingModule.trainingId) : null;
  const subject = training ? getSubject(training.subjectId) : null;

  if (!trainingModule) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Trainingsmodul nicht gefunden</h3>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleDeleteTopic = (topicId, title) => {
    if (window.confirm(`Möchten Sie das Thema "${title}" wirklich löschen? Alle zugehörigen Lerneinheiten werden ebenfalls gelöscht.`)) {
      deleteTopic(topicId);
    }
  };

  const handleDeleteModule = () => {
    if (window.confirm(`Möchten Sie das Trainingsmodul "${trainingModule.title}" wirklich löschen? Alle zugehörigen Themen und Lerneinheiten werden ebenfalls gelöscht.`)) {
      deleteTrainingModule(trainingModule.id);
      if (training) {
        navigate(`/trainings/${training.id}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleTrainingChange = (newTrainingId) => {
    updateTrainingModule(trainingModule.id, { trainingId: newTrainingId || null });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <button
          onClick={() => training ? navigate(`/trainings/${training.id}`) : navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          {training ? `Zurück zu ${training.title}` : 'Zurück zum Dashboard'}
        </button>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{trainingModule.title}</h2>
            {subject && training && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>{subject.title}</span> → <span>{training.title}</span>
              </div>
            )}
            {trainingModule.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{trainingModule.description}</p>
            )}
          </div>
          <div className="flex space-x-2 ml-4">
            <Link
              to={`/training-modules/${trainingModule.id}/edit`}
              className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
              Bearbeiten
            </Link>
            <button
              onClick={handleDeleteModule}
              className="inline-flex items-center px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="h-4 w-4 mr-2" />
              Löschen
            </button>
          </div>
        </div>
      </div>

      {/* Training Assignment */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiSettings} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Training-Zuordnung</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Training auswählen
          </label>
          <select
            value={trainingModule.trainingId || ''}
            onChange={(e) => handleTrainingChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Kein Training ausgewählt</option>
            {trainings.map((training) => (
              <option key={training.id} value={training.id}>
                {training.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Themen ({topics.length})
        </h3>
        <Link
          to={`/topics/create?trainingModuleId=${trainingModule.id}`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
          Neues Thema
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiFileText} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Themen vorhanden</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Erstellen Sie das erste Thema für dieses Trainingsmodul.</p>
          <Link
            to={`/topics/create?trainingModuleId=${trainingModule.id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/topics/${topic.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {topic.title}
                    </h3>
                  </div>

                  {topic.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {topic.description}
                    </p>
                  )}

                  {/* Completion Percentage */}
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold ${getPercentageColor(stats.percentage)} mb-1`}>
                      {stats.percentage}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.readyOrPublished} von {stats.total} Lerneinheiten
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-center mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900 rounded p-2">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                      <div className="text-xs text-blue-500 dark:text-blue-300">Lerneinheiten</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <SafeIcon icon={FiCalendar} className="h-4 w-4 mr-2" />
                    {new Date(topic.updatedAt).toLocaleDateString('de-DE')}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/topics/${topic.id}`);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-sm"
                    >
                      <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTopic(topic.id, topic.title);
                      }}
                      className="inline-flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-sm"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
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

export default TrainingModuleDetail;