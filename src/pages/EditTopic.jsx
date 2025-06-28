import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiArrowLeft, FiTarget } = FiIcons;

const EditTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTopic, updateTopic, trainingModules } = useLearningUnits();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainingModuleId: ''
  });

  const topic = getTopic(id);

  useEffect(() => {
    if (topic) {
      setFormData({
        title: topic.title,
        description: topic.description || '',
        trainingModuleId: topic.trainingModuleId || ''
      });
    }
  }, [topic]);

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thema nicht gefunden</h3>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 dark:text-primary-400"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    updateTopic(id, formData);
    navigate(`/topics/${id}`);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/topics/${id}`)}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          Zurück zu {topic.title}
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thema bearbeiten</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="trainingModuleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trainingsmodul zuordnen
            </label>
            <select
              id="trainingModuleId"
              name="trainingModuleId"
              value={formData.trainingModuleId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Kein Trainingsmodul ausgewählt</option>
              {trainingModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titel des Themas *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beschreibung (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Beschreiben Sie das Thema und die geplanten Lerneinheiten..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/topics/${id}`)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4 mr-2" />
              Speichern
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditTopic;