import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCalendar, FiTrendingUp, FiPackage } = FiIcons;

const TrainingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getTraining, 
    getTrainingModulesByTraining, 
    deleteTrainingModule, 
    getTrainingModuleStats,
    getSubject 
  } = useLearningUnits();

  const training = getTraining(id);
  const trainingModules = getTrainingModulesByTraining(id);
  const subject = training ? getSubject(training.subjectId) : null;

  if (!training) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Training nicht gefunden</h3>
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

  const handleDelete = (moduleId, title) => {
    if (window.confirm(`Möchten Sie das Trainingsmodul "${title}" wirklich löschen?`)) {
      deleteTrainingModule(moduleId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <button
          onClick={() => subject ? navigate(`/subjects/${subject.id}`) : navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          {subject ? `Zurück zu ${subject.title}` : 'Zurück zum Dashboard'}
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{training.title}</h2>
            {subject && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Fachthema: {subject.title}
              </p>
            )}
            {training.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{training.description}</p>
            )}
          </div>
          <Link
            to={`/trainings/${training.id}/edit`}
            className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
            Bearbeiten
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trainingsmodule ({trainingModules.length})
        </h3>
        <Link
          to={`/training-modules/create?trainingId=${training.id}`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
          Neues Trainingsmodul
        </Link>
      </div>

      {trainingModules.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiPackage} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Trainingsmodule vorhanden</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Erstellen Sie das erste Trainingsmodul für dieses Training.</p>
          <Link
            to={`/training-modules/create?trainingId=${training.id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Trainingsmodul erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainingModules.map((module, index) => {
            const stats = getTrainingModuleStats(module.id);
            
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `#/training-modules/${module.id}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {module.title}
                    </h3>
                  </div>

                  {module.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {module.description}
                    </p>
                  )}

                  {/* Completion Percentage */}
                  <div className="text-center mb-4">
                    <div className={`text-3xl font-bold ${getPercentageColor(stats.percentage)} mb-1`}>
                      {stats.percentage}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.readyOrPublishedUnits} von {stats.totalUnits} Lerneinheiten
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    <div className="bg-green-50 dark:bg-green-900 rounded p-2">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">{stats.topics}</div>
                      <div className="text-xs text-green-500 dark:text-green-300">Themen</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 rounded p-2">
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{stats.totalUnits}</div>
                      <div className="text-xs text-purple-500 dark:text-purple-300">Einheiten</div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <SafeIcon icon={FiCalendar} className="h-4 w-4 mr-2" />
                    {new Date(module.updatedAt).toLocaleDateString('de-DE')}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `#/training-modules/${module.id}`;
                      }}
                      className="inline-flex items-center px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-sm"
                    >
                      <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(module.id, module.title);
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

export default TrainingDetail;