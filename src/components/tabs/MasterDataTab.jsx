import React, { useState, useRef } from 'react';
import { useLearningUnits, EDITORIAL_STATES } from '../../context/LearningUnitContext';
import { v4 as uuidv4 } from 'uuid';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit3, FiTarget, FiPlus, FiTrash2, FiSettings, FiFile, FiUpload, FiDownload, FiEye, FiImage, FiCopy, FiClipboard, FiFolder, FiLink, FiVideo, FiPlay } = FiIcons;

const MasterDataTab = ({ unit }) => {
  const { updateLearningUnit, topics, getTopic } = useLearningUnits();
  const [newGoal, setNewGoal] = useState('');
  const [newUrl, setNewUrl] = useState({ title: '', url: '' });
  const [imageName, setImageName] = useState('');
  const [showImageNameDialog, setShowImageNameDialog] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [pendingImageData, setPendingImageData] = useState(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleUpdate = (updates) => {
    updateLearningUnit(unit.id, updates);
  };

  const handleBasicInfoChange = (field, value) => {
    handleUpdate({ [field]: value });
  };

  // Learning Goals Management
  const addGoal = () => {
    if (!newGoal.trim()) return;
    const updatedGoals = [
      ...unit.learningGoals,
      {
        id: uuidv4(),
        text: newGoal.trim(),
        createdAt: new Date().toISOString()
      }
    ];
    handleUpdate({ learningGoals: updatedGoals });
    setNewGoal('');
  };

  const removeGoal = (goalId) => {
    const updatedGoals = unit.learningGoals.filter(goal => goal.id !== goalId);
    handleUpdate({ learningGoals: updatedGoals });
  };

  // URL Management
  const addUrl = () => {
    if (!newUrl.title.trim() || !newUrl.url.trim()) return;
    const updatedUrls = [
      ...(unit.urls || []),
      {
        id: uuidv4(),
        title: newUrl.title.trim(),
        url: newUrl.url.trim(),
        createdAt: new Date().toISOString()
      }
    ];
    handleUpdate({ urls: updatedUrls });
    setNewUrl({ title: '', url: '' });
    setShowUrlDialog(false);
  };

  const removeUrl = (urlId) => {
    if (window.confirm('Möchten Sie diese URL wirklich entfernen?')) {
      const updatedUrls = (unit.urls || []).filter(url => url.id !== urlId);
      handleUpdate({ urls: updatedUrls });
    }
  };

  // Editorial State Management
  const getStateColor = (state) => {
    const colors = {
      [EDITORIAL_STATES.PLANNING]: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700',
      [EDITORIAL_STATES.DRAFT]: 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900',
      [EDITORIAL_STATES.REVIEW]: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900',
      [EDITORIAL_STATES.READY]: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900',
      [EDITORIAL_STATES.PUBLISHED]: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900'
    };
    return colors[state] || 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700';
  };

  // PowerPoint File Management
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString()
      };
      handleUpdate({ powerPointFile: fileData });
    } else {
      alert('Bitte wählen Sie eine PowerPoint-Datei (.pptx) aus.');
    }
  };

  const handleFileRemove = () => {
    if (window.confirm('Möchten Sie die PowerPoint-Datei wirklich entfernen?')) {
      handleUpdate({ powerPointFile: null });
    }
  };

  // Video File Management - Fixed version
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Bitte wählen Sie eine Videodatei aus.');
      return;
    }

    // Check file size (limit to 500MB for better compatibility)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert('Die Videodatei ist zu groß. Maximale Größe: 500MB');
      return;
    }

    setIsVideoUploading(true);

    try {
      // Create object URL instead of reading as data URL for better performance
      const videoUrl = URL.createObjectURL(file);
      
      const videoData = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: videoUrl,
        uploadedAt: new Date().toISOString()
      };

      handleUpdate({ video: videoData });
      setIsVideoUploading(false);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Fehler beim Upload der Videodatei.');
      setIsVideoUploading(false);
    }

    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleVideoRemove = () => {
    if (window.confirm('Möchten Sie das Video wirklich entfernen?')) {
      // Revoke object URL to free memory
      if (unit.video && unit.video.url) {
        URL.revokeObjectURL(unit.video.url);
      }
      handleUpdate({ video: null });
    }
  };

  const handleVideoDownload = () => {
    if (unit.video) {
      try {
        const link = document.createElement('a');
        link.href = unit.video.url;
        link.download = unit.video.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading video:', error);
        alert('Fehler beim Download der Videodatei.');
      }
    }
  };

  // Helper function to generate smart filename
  const generateSmartFilename = (originalName = '') => {
    const topic = unit.topicId ? getTopic(unit.topicId) : null;
    const topicName = topic?.title || '';
    const unitName = unit.title || '';
    
    // Create abbreviated versions
    const topicAbbr = topicName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const unitAbbr = unitName.split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '');
    
    // Use original name if provided, otherwise generate generic name
    const baseName = originalName.replace(/\.[^/.]+$/, "") || `Bild_${Date.now()}`;
    
    if (topicAbbr && unitAbbr) {
      return `${topicAbbr}_${unitAbbr}_${baseName}`;
    } else if (unitAbbr) {
      return `${unitAbbr}_${baseName}`;
    } else {
      return baseName;
    }
  };

  // Image Management - Enhanced with smart naming
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = {
            file,
            url: event.target.result
          };
          setPendingImageData(imageData);
          setImageName(generateSmartFilename(file.name));
          setShowImageNameDialog(true);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Bitte wählen Sie nur Bilddateien aus.');
      }
    });
  };

  const confirmImageUpload = () => {
    if (pendingImageData && imageName.trim()) {
      const newImage = {
        id: uuidv4(),
        name: imageName.trim(),
        size: pendingImageData.file.size,
        type: pendingImageData.file.type,
        url: pendingImageData.url,
        uploadedAt: new Date().toISOString()
      };

      const updatedImages = [...(unit.images || []), newImage];
      handleUpdate({ images: updatedImages });

      setShowImageNameDialog(false);
      setPendingImageData(null);
      setImageName('');
    }
  };

  const handleClipboardPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              setPendingImageData({
                file: blob,
                url: event.target.result
              });
              setImageName(generateSmartFilename(`Zwischenablage_${new Date().toISOString().slice(0, 10)}`));
              setShowImageNameDialog(true);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      alert('Kein Bild in der Zwischenablage gefunden.');
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Zwischenablage:', error);
      alert('Fehler beim Zugriff auf die Zwischenablage.');
    }
  };

  const handleImageRemove = (imageId) => {
    if (window.confirm('Möchten Sie dieses Bild wirklich entfernen?')) {
      const updatedImages = unit.images.filter(img => img.id !== imageId);
      handleUpdate({ images: updatedImages });
    }
  };

  const handleImageCopy = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert('Bild in Zwischenablage kopiert.');
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
      alert('Fehler beim Kopieren des Bildes.');
    }
  };

  const handleImageOpen = (imageUrl, imageName) => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head><title>${imageName}</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6;">
          <img src="${imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${imageName}" />
        </body>
      </html>
    `);
  };

  return (
    <div className="space-y-8">
      {/* Topic Assignment */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiFolder} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thema-Zuordnung</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thema auswählen
          </label>
          <select
            value={unit.topicId || ''}
            onChange={(e) => handleBasicInfoChange('topicId', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Kein Thema ausgewählt</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiEdit3} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grundinformationen</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titel der Lerneinheit
            </label>
            <input
              type="text"
              value={unit.title}
              onChange={(e) => handleBasicInfoChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beschreibung
            </label>
            <textarea
              value={unit.description || ''}
              onChange={(e) => handleBasicInfoChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Beschreiben Sie den Inhalt der Lerneinheit..."
            />
          </div>
        </div>
      </div>

      {/* Editorial State */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiSettings} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Redaktioneller Stand</h3>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={unit.editorialState}
            onChange={(e) => handleUpdate({ editorialState: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.values(EDITORIAL_STATES).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(unit.editorialState)}`}>
            {unit.editorialState}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Letztes Update:</strong> {new Date(unit.updatedAt).toLocaleString('de-DE')}</p>
          <p><strong>Erstellt am:</strong> {new Date(unit.createdAt).toLocaleString('de-DE')}</p>
        </div>
      </div>

      {/* Learning Goals */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiTarget} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lernziele</h3>
        </div>
        <div className="space-y-4">
          {unit.learningGoals.length > 0 && (
            <div className="space-y-2">
              {unit.learningGoals.map((goal, index) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3 mt-0.5">
                      {index + 1}.
                    </span>
                    <span className="text-gray-900 dark:text-white">{goal.text}</span>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Neues Lernziel hinzufügen..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={addGoal}
              disabled={!newGoal.trim()}
              className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SafeIcon icon={FiPlus} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* URLs Management */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SafeIcon icon={FiLink} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">URLs</h3>
            {unit.urls && unit.urls.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                {unit.urls.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowUrlDialog(true)}
            className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            URL hinzufügen
          </button>
        </div>

        {unit.urls && unit.urls.length > 0 ? (
          <div className="space-y-3">
            {unit.urls.map((url) => (
              <div key={url.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{url.title}</h4>
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                  >
                    {url.url}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Hinzugefügt: {new Date(url.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <button
                  onClick={() => removeUrl(url.id)}
                  className="ml-3 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                  title="Entfernen"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiLink} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Keine URLs hinzugefügt</p>
          </div>
        )}
      </div>

      {/* PowerPoint File Management */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiFile} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PowerPoint-Datei</h3>
        </div>

        {unit.powerPointFile ? (
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SafeIcon icon={FiFile} className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{unit.powerPointFile.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(unit.powerPointFile.size / 1024 / 1024).toFixed(2)} MB • Hochgeladen am {new Date(unit.powerPointFile.uploadedAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => alert('Öffnen-Funktion würde hier implementiert werden.')}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                  title="Öffnen"
                >
                  <SafeIcon icon={FiEye} className="h-4 w-4" />
                </button>
                <button
                  onClick={() => alert('Download-Funktion würde hier implementiert werden.')}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                  title="Herunterladen"
                >
                  <SafeIcon icon={FiDownload} className="h-4 w-4" />
                </button>
                <button
                  onClick={handleFileRemove}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                  title="Entfernen"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiFile} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Keine PowerPoint-Datei hochgeladen</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
              PowerPoint hochladen
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Video Management - Fixed */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiVideo} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video</h3>
        </div>

        {isVideoUploading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Video wird hochgeladen...</p>
          </div>
        )}

        {unit.video && !isVideoUploading ? (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SafeIcon icon={FiVideo} className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{unit.video.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(unit.video.size / 1024 / 1024).toFixed(2)} MB • Hochgeladen am {new Date(unit.video.uploadedAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleVideoDownload}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                    title="Herunterladen"
                  >
                    <SafeIcon icon={FiDownload} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleVideoRemove}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="Entfernen"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-2">
              <video
                controls
                className="w-full max-h-96 rounded"
                src={unit.video.url}
                onError={(e) => {
                  console.error('Video playback error:', e);
                }}
              >
                Ihr Browser unterstützt keine Videowiedergabe.
              </video>
            </div>
          </div>
        ) : !isVideoUploading ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiVideo} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Kein Video hochgeladen</p>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
              Video hochladen
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Maximale Dateigröße: 500MB
            </p>
          </div>
        ) : null}

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />
      </div>

      {/* Image Management */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SafeIcon icon={FiImage} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bilder</h3>
            {unit.images && unit.images.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                {unit.images.length}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleClipboardPaste}
              className="inline-flex items-center px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
            >
              <SafeIcon icon={FiClipboard} className="h-4 w-4 mr-2" />
              Aus Zwischenablage
            </button>
            <button
              onClick={() => document.getElementById('imageUpload').click()}
              className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm"
            >
              <SafeIcon icon={FiUpload} className="h-4 w-4 mr-2" />
              Bilder hochladen
            </button>
          </div>
        </div>

        {unit.images && unit.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unit.images.map((image) => (
              <div key={image.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                <div className="aspect-video bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSAyaDZhMiAyIDAgMCAxIDIgMnYxNmEyIDIgMCAwIDEtMiAySDlhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJ6IiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjEyIiB5PSIxMyIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJpbGQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate" title={image.name}>
                    {image.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleImageOpen(image.url, image.name)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      title="Öffnen"
                    >
                      <SafeIcon icon={FiEye} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleImageCopy(image.url)}
                      className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                      title="In Zwischenablage kopieren"
                    >
                      <SafeIcon icon={FiCopy} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleImageRemove(image.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                      title="Löschen"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SafeIcon icon={FiImage} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Keine Bilder hochgeladen</p>
          </div>
        )}

        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* URL Dialog */}
      {showUrlDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">URL hinzufügen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titel</label>
                <input
                  type="text"
                  value={newUrl.title}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Titel der URL..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL</label>
                <input
                  type="url"
                  value={newUrl.url}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUrlDialog(false);
                  setNewUrl({ title: '', url: '' });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={addUrl}
                disabled={!newUrl.title.trim() || !newUrl.url.trim()}
                className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Name Dialog */}
      {showImageNameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Bildname festlegen</h3>
            {pendingImageData && (
              <div className="mb-4">
                <img
                  src={pendingImageData.url}
                  alt="Vorschau"
                  className="w-full h-32 object-cover rounded border"
                />
              </div>
            )}
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Bildname eingeben..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImageNameDialog(false);
                  setPendingImageData(null);
                  setImageName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmImageUpload}
                disabled={!imageName.trim()}
                className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataTab;