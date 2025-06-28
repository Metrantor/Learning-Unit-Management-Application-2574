import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiPlus, FiEdit, FiTrash2, FiCalendar, FiTrendingUp, FiPackage, FiSettings } = FiIcons;

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getSubject, 
    getTrainingsBySubject, 
    deleteSubject,
    deleteTraining, 
    getTrainingStats 
  } = useLearningUnits();

  const subject = getSubject(id);
  const trainings = getTrainingsBySubject(id);

  if (!subject) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Fachthema nicht gefunden</h3>
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

  const handleDeleteTraining = (trainingId, title) => {
    if (window.confirm(`Möchten Sie das Training "${title}" wirklich löschen? Alle zugehörigen Module, Themen und Lerneinheiten werden ebenfalls gelöscht.`)) {
      deleteTraining(trainingId);
    }
  };

  const handleDeleteSubject = () => {
    if (window.confirm(`Möchten Sie das Fachthema "${subject.title}" wirklich löschen? Alle zugehörigen Trainings, Module, Themen und Lerneinheiten werden ebenfalls gelöscht.`)) {
      deleteSubject(subject.id);
      navigate('/');
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
          Zurück zu Fachthemen
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{subject.title}</h2>
            {subject.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{subject.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/subjects/${subject.id}/edit`}
              className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
              Bearbeiten
            </Link>
            <button
              onClick={handleDeleteSubject}
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
          Trainings ({trainings.length})
        </h3>
        <Link
          to={`/trainings/create?subjectId=${subject.id}`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
          Neues Training
        </Link>
      </div>

      {trainings.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiPackage} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Trainings vorhanden</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Erstellen Sie das erste Training für dieses Fachthema.</p>
          <Link
            to={`/trainings/create?subjectId=${subject.id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Training erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training, index) => {
            const stats = getTrainingStats(training.id);
            return (
              <motion.div
                key={training.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/trainings/${training.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {training.title}
                    </h3>
                  </div>

                  {training.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {training.description}
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
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900 rounded p-2">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.modules}</div>
                      <div className="text-xs text-blue-500 dark:text-blue-300">Module</div>
                    </div>
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
                    {new Date(training.updatedAt).toLocaleDateString('de-DE')}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trainings/${training.id}`);
                      }}
                      className="inline-flex items-center px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-sm"
                    >
                      <SafeIcon icon={FiEdit} className="h-4 w-4 mr-2" />
                      Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTraining(training.id, training.title);
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

export default SubjectDetail;