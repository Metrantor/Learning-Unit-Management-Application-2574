import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits } from '../context/LearningUnitContext';
import TagsManager from '../components/TagsManager';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiArrowLeft, FiUpload, FiFile, FiCheckSquare, FiSquare, FiPlus, FiTag, FiBookOpen } = FiIcons;

const CONTENT_TYPES = [
  { id: 'explanation', label: 'Erklärtext', icon: FiFile },
  { id: 'video', label: 'Video', icon: FiFile },
  { id: 'podcast', label: 'Podcast', icon: FiFile },
  { id: 'quiz', label: 'Quiz', icon: FiFile },
];

const CreateLearningUnit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createLearningUnit } = useLearningUnits();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topicId: searchParams.get('topicId') || '',
    targetDate: '',
    tags: [],
    contentTypes: [],
    customContentTypes: []
  });
  const [showXmlImport, setShowXmlImport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customContentType, setCustomContentType] = useState('');
  const xmlImportInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    try {
      console.log('🆕 Creating learning unit with data:', formData);
      const newUnit = await createLearningUnit(formData);
      console.log('✅ Learning unit created:', newUnit);
      
      if (newUnit && newUnit.id) {
        console.log('🔄 Navigating to learning unit:', newUnit.id);
        navigate(`/unit/${newUnit.id}`);
      } else {
        console.error('❌ No ID returned from createLearningUnit');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Error creating learning unit:', error);
      alert('Fehler beim Erstellen der Lerneinheit: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleContentTypeChange = (typeId, checked) => {
    const currentTypes = formData.contentTypes || [];
    let updatedTypes;

    if (checked) {
      updatedTypes = [...currentTypes, typeId];
    } else {
      updatedTypes = currentTypes.filter(type => type !== typeId);
    }

    setFormData(prev => ({
      ...prev,
      contentTypes: updatedTypes
    }));
  };

  const handleCustomContentTypeAdd = () => {
    if (!customContentType.trim()) return;

    const currentTypes = formData.contentTypes || [];
    const customTypes = formData.customContentTypes || [];

    const newCustomType = {
      id: `custom_${Date.now()}`,
      label: customContentType.trim(),
      isCustom: true
    };

    setFormData(prev => ({
      ...prev,
      contentTypes: [...currentTypes, newCustomType.id],
      customContentTypes: [...customTypes, newCustomType]
    }));

    setCustomContentType('');
  };

  const handleCustomContentTypeRemove = (typeId) => {
    const currentTypes = formData.contentTypes || [];
    const customTypes = formData.customContentTypes || [];

    setFormData(prev => ({
      ...prev,
      contentTypes: currentTypes.filter(type => type !== typeId),
      customContentTypes: customTypes.filter(type => type.id !== typeId)
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
    reader.onload = async (e) => {
      setIsLoading(true);
      try {
        const xmlContent = e.target.result;
        const importedData = parseXmlToData(xmlContent);

        // Update form data with imported data
        setFormData(prev => ({
          ...prev,
          title: importedData.title || prev.title,
          description: importedData.description || prev.description,
          tags: importedData.tags || [],
          contentTypes: importedData.contentTypes || [],
          customContentTypes: importedData.customContentTypes || []
        }));

        // Create unit with imported data
        console.log('🆕 Creating learning unit from XML with data:', {
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
          speechTextComments: importedData.speechTextComments || [],
          tags: importedData.tags || [],
          contentTypes: importedData.contentTypes || [],
          customContentTypes: importedData.customContentTypes || []
        });

        const newUnit = await createLearningUnit({
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
          speechTextComments: importedData.speechTextComments || [],
          tags: importedData.tags || [],
          contentTypes: importedData.contentTypes || [],
          customContentTypes: importedData.customContentTypes || []
        });

        console.log('✅ Learning unit created from XML:', newUnit);
        
        if (newUnit && newUnit.id) {
          navigate(`/unit/${newUnit.id}`);
          alert('XML-Import erfolgreich abgeschlossen!');
        } else {
          console.error('❌ No ID returned from createLearningUnit');
          navigate('/');
        }
      } catch (error) {
        console.error('Fehler beim XML-Import:', error);
        alert('Fehler beim XML-Import: ' + error.message);
      } finally {
        setIsLoading(false);
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
      speechTextComments: [],
      tags: [],
      contentTypes: [],
      customContentTypes: []
    };

    // Parse tags
    const tags = xmlDoc.querySelectorAll('tags tag');
    tags.forEach(tagElement => {
      const tag = {
        id: tagElement.getAttribute('id') || Date.now().toString() + Math.random(),
        label: tagElement.querySelector('label')?.textContent || '',
        color: tagElement.querySelector('color')?.textContent || '#3B82F6',
        createdAt: tagElement.querySelector('erstellt_am')?.textContent || new Date().toISOString()
      };
      data.tags.push(tag);
    });

    // Parse content types
    const contentTypes = xmlDoc.querySelectorAll('inhaltstypen typ');
    contentTypes.forEach(typeElement => {
      data.contentTypes.push(typeElement.textContent);
    });

    // Parse custom content types
    const customContentTypes = xmlDoc.querySelectorAll('benutzerdefinierte_inhaltstypen typ');
    customContentTypes.forEach(customTypeElement => {
      const customType = {
        id: customTypeElement.getAttribute('id') || Date.now().toString() + Math.random(),
        label: customTypeElement.querySelector('label')?.textContent || '',
        isCustom: true
      };
      data.customContentTypes.push(customType);
    });

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
        approve: snippetElement.querySelector('genehmigt')?.textContent === 'true',
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
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Das Zieldatum wird rot angezeigt, wenn die Lerneinheit bis dahin nicht fertiggestellt ist.
            </p>
          </div>

          {/* Tags Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiTag} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>
            </div>
            <TagsManager
              tags={formData.tags}
              onChange={handleTagsChange}
            />
          </div>

          {/* Content Types Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiBookOpen} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zu erstellende Inhalte</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Wählen Sie aus, welche Arten von Inhalten für diese Lerneinheit erstellt werden sollen.
            </p>
            
            <div className="space-y-3">
              {/* Predefined Content Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTENT_TYPES.map((contentType) => (
                  <label key={contentType.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.contentTypes.includes(contentType.id)}
                      onChange={(e) => handleContentTypeChange(contentType.id, e.target.checked)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <SafeIcon 
                        icon={formData.contentTypes.includes(contentType.id) ? FiCheckSquare : FiSquare} 
                        className={`h-5 w-5 mr-3 ${
                          formData.contentTypes.includes(contentType.id) 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`} 
                      />
                      <SafeIcon icon={contentType.icon} className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{contentType.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Content Types */}
              {formData.customContentTypes && formData.customContentTypes.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Benutzerdefinierte Inhalte</h4>
                  <div className="space-y-2">
                    {formData.customContentTypes.map((customType) => (
                      <label key={customType.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={formData.contentTypes.includes(customType.id)}
                            onChange={(e) => handleContentTypeChange(customType.id, e.target.checked)}
                            className="sr-only"
                          />
                          <SafeIcon 
                            icon={formData.contentTypes.includes(customType.id) ? FiCheckSquare : FiSquare} 
                            className={`h-5 w-5 mr-3 ${
                              formData.contentTypes.includes(customType.id) 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-gray-400 dark:text-gray-500'
                            }`} 
                          />
                          <span className="text-gray-900 dark:text-white font-medium">{customType.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCustomContentTypeRemove(customType.id)}
                          className="ml-2 p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                          title="Entfernen"
                        >
                          <SafeIcon icon={FiFile} className="h-4 w-4" />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Content Type */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customContentType}
                    onChange={(e) => setCustomContentType(e.target.value)}
                    placeholder="Benutzerdefinierten Inhaltstyp hinzufügen..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomContentTypeAdd()}
                  />
                  <button
                    type="button"
                    onClick={handleCustomContentTypeAdd}
                    disabled={!customContentType.trim()}
                    className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <SafeIcon icon={FiPlus} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isLoading}
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4 mr-2" />
              {isLoading ? 'Erstelle...' : 'Erstellen'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateLearningUnit;