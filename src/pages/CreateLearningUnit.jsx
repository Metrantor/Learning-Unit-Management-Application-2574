import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiArrowLeft, FiUpload, FiFile } = FiIcons;

const CreateLearningUnit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createLearningUnit, topics, getTopicPath } = useLearningUnits();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicId: searchParams.get('topicId') || '',
    targetDate: ''
  });
  const [showXmlImport, setShowXmlImport] = useState(false);
  const xmlImportInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newUnit = createLearningUnit(formData);
    navigate(`/unit/${newUnit.id}`);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleXmlImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert('Bitte wählen Sie eine XML-Datei aus.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlContent = e.target.result;
        const importedData = parseXmlToData(xmlContent);
        
        // Update form data with imported data
        setFormData(prev => ({
          ...prev,
          title: importedData.title || prev.title,
          description: importedData.description || prev.description
        }));

        // Create unit with imported data
        const newUnit = createLearningUnit({
          ...formData,
          title: importedData.title || formData.title,
          description: importedData.description || formData.description,
          learningGoals: importedData.learningGoals || [],
          notes: importedData.notes || '',
          speechText: importedData.speechText || '',
          explanation: importedData.explanation || '',
          urls: importedData.urls || [],
          textSnippets: importedData.textSnippets || [],
          comments: importedData.comments || [],
          explanationComments: importedData.explanationComments || [],
          speechTextComments: importedData.speechTextComments || []
        });

        navigate(`/unit/${newUnit.id}`);
        alert('XML-Import erfolgreich abgeschlossen!');
      } catch (error) {
        console.error('Fehler beim XML-Import:', error);
        alert('Fehler beim XML-Import: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Helper function to parse XML to data (same as in MasterDataTab)
  const parseXmlToData = (xmlContent) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Ungültiges XML-Format');
    }

    const getTextContent = (selector) => {
      const element = xmlDoc.querySelector(selector);
      return element ? element.textContent : '';
    };

    const data = {
      title: getTextContent('grunddaten titel'),
      description: getTextContent('grunddaten beschreibung'),
      notes: getTextContent('notizen'),
      speechText: getTextContent('sprechtext'),
      explanation: getTextContent('erklaerung'),
      learningGoals: [],
      urls: [],
      textSnippets: [],
      comments: [],
      explanationComments: [],
      speechTextComments: []
    };

    // Parse learning goals
    const lernziele = xmlDoc.querySelectorAll('lernziele lernziel');
    lernziele.forEach(ziel => {
      const goal = {
        id: ziel.getAttribute('id') || Date.now().toString() + Math.random(),
        text: ziel.querySelector('text')?.textContent || '',
        createdAt: ziel.querySelector('erstellt_am')?.textContent || new Date().toISOString()
      };
      data.learningGoals.push(goal);
    });

    // Parse URLs
    const urls = xmlDoc.querySelectorAll('urls url');
    urls.forEach(urlElement => {
      const url = {
        id: urlElement.getAttribute('id') || Date.now().toString() + Math.random(),
        title: urlElement.querySelector('titel')?.textContent || '',
        url: urlElement.querySelector('link')?.textContent || '',
        createdAt: urlElement.querySelector('erstellt_am')?.textContent || new Date().toISOString()
      };
      data.urls.push(url);
    });

    // Parse text snippets
    const snippets = xmlDoc.querySelectorAll('text_snippets snippet');
    snippets.forEach(snippetElement => {
      const snippet = {
        id: snippetElement.getAttribute('id') || Date.now().toString() + Math.random(),
        content: snippetElement.querySelector('inhalt')?.textContent || '',
        order: parseInt(snippetElement.querySelector('reihenfolge')?.textContent) || 1,
        approved: snippetElement.querySelector('genehmigt')?.textContent === 'true',
        createdAt: new Date().toISOString(),
        imageId: null,
        rating: { up: 0, down: 0, userVotes: {} },
        comments: []
      };
      data.textSnippets.push(snippet);
    });

    // Parse comments (new feature)
    const comments = xmlDoc.querySelectorAll('kommentare kommentar');
    comments.forEach(commentElement => {
      const comment = {
        id: commentElement.getAttribute('id') || Date.now().toString() + Math.random(),
        content: commentElement.querySelector('inhalt')?.textContent || '',
        context: commentElement.querySelector('kontext')?.textContent || 'general',
        author: {
          id: commentElement.querySelector('autor_id')?.textContent || 'unknown',
          name: commentElement.querySelector('autor_name')?.textContent || 'Unbekannt',
          avatar: commentElement.querySelector('autor_avatar')?.textContent || 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown'
        },
        createdAt: commentElement.querySelector('erstellt_am')?.textContent || new Date().toISOString()
      };
      
      // Distribute comments to appropriate arrays based on context
      if (comment.context === 'explanation') {
        data.explanationComments.push(comment);
      } else if (comment.context === 'speechtext') {
        data.speechTextComments.push(comment);
      } else {
        data.comments.push(comment);
      }
    });

    return data;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Neue Lerneinheit erstellen</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        {/* XML Import Section */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">XML-Import</h3>
            <button
              onClick={() => xmlImportInputRef.current?.click()}
              className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
            >
              <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
              XML importieren
            </button>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Sie können eine zuvor exportierte XML-Datei importieren, um eine Lerneinheit mit vorhandenen Daten zu erstellen.
          </p>
          <input
            ref={xmlImportInputRef}
            type="file"
            accept=".xml"
            onChange={handleXmlImport}
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topicId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thema zuordnen
            </label>
            <select
              id="topicId"
              name="topicId"
              value={formData.topicId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Kein Thema ausgewählt</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {getTopicPath(topic.id)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titel der Lerneinheit *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Geben Sie einen aussagekräftigen Titel ein..."
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
              placeholder="Beschreiben Sie kurz den Inhalt der Lerneinheit..."
            />
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zieldatum für Fertigstellung (optional)
            </label>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Das Zieldatum wird rot angezeigt, wenn die Lerneinheit bis dahin nicht fertiggestellt ist.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
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
              Erstellen
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateLearningUnit;