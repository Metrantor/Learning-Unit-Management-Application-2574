import React, { useState, useRef } from 'react';
import { useLearningUnits } from '../../context/LearningUnitContext';
import { v4 as uuidv4 } from 'uuid';
import MDEditor from '@uiw/react-md-editor';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTarget, FiImage, FiUpload, FiClipboard, FiTrash2, FiEye, FiCopy, FiMessageCircle, FiSend, FiUser } = FiIcons;

const ExplanationTab = ({ unit }) => {
  const { updateLearningUnit, getTopic, currentUser } = useLearningUnits();
  const [explanation, setExplanation] = useState(unit.explanation || '');
  const [imageName, setImageName] = useState('');
  const [showImageNameDialog, setShowImageNameDialog] = useState(false);
  const [pendingImageData, setPendingImageData] = useState(null);
  const [newComment, setNewComment] = useState('');

  const handleChange = (value) => {
    setExplanation(value || '');
    updateLearningUnit(unit.id, { explanation: value || '' });
  };

  // Comment Management for Explanation
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: uuidv4(),
      content: newComment.trim(),
      author: currentUser,
      createdAt: new Date().toISOString(),
      context: 'explanation' // Mark as explanation comment
    };

    const updatedComments = [newCommentObj, ...(unit.explanationComments || [])]; // Add to beginning for newest first
    updateLearningUnit(unit.id, { explanationComments: updatedComments });
    setNewComment('');
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      const updatedComments = (unit.explanationComments || []).filter(comment => comment.id !== commentId);
      updateLearningUnit(unit.id, { explanationComments: updatedComments });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to generate unique filename for explanation images
  const generateUniqueFilename = (originalName = '') => {
    const topic = unit.topicId ? getTopic(unit.topicId) : null;
    const topicName = topic?.title || '';
    const unitName = unit.title || '';

    // Create abbreviated versions
    const topicAbbr = topicName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const unitAbbr = unitName.split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '');

    // Get current image count for sequential numbering
    const currentImageCount = (unit.images || []).length + 1;
    const sequentialNumber = String(currentImageCount).padStart(3, '0'); // 001, 002, etc.

    // Generate timestamp with seconds
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0]; // YYYYMMDD_HHMMSS

    // Use original name if provided, otherwise generate generic name
    const baseName = originalName.replace(/\.[^/.]+$/, "") || 'Erklaerung';

    // Construct unique filename
    let filename = '';
    if (topicAbbr && unitAbbr) {
      filename = `${topicAbbr}_${unitAbbr}_${sequentialNumber}_${baseName}_${timestamp}`;
    } else if (unitAbbr) {
      filename = `${unitAbbr}_${sequentialNumber}_${baseName}_${timestamp}`;
    } else {
      filename = `${sequentialNumber}_${baseName}_${timestamp}`;
    }

    return filename;
  };

  // Image Management for Explanation
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = { file, url: event.target.result };
          setPendingImageData(imageData);
          setImageName(generateUniqueFilename(file.name));
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
        uploadedAt: new Date().toISOString(),
        context: 'explanation' // Mark as explanation image
      };

      const updatedImages = [...(unit.images || []), newImage];
      updateLearningUnit(unit.id, { images: updatedImages });
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
              setPendingImageData({ file: blob, url: event.target.result });
              setImageName(generateUniqueFilename('Erklaerung_Zwischenablage'));
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
      updateLearningUnit(unit.id, { images: updatedImages });
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

  // Insert image markdown into editor
  const insertImageIntoEditor = (image) => {
    const imageMarkdown = `![${image.name}](${image.url})`;
    const newValue = explanation + '\n\n' + imageMarkdown;
    setExplanation(newValue);
    updateLearningUnit(unit.id, { explanation: newValue });
  };

  return (
    <div className="space-y-6">
      {/* Learning Goals Display (Read-only) */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiTarget} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lernziele (Übersicht)</h3>
        </div>
        {unit.learningGoals && unit.learningGoals.length > 0 ? (
          <div className="space-y-2">
            {unit.learningGoals.map((goal, index) => (
              <div key={goal.id} className="flex items-start p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-3 mt-0.5">
                  {index + 1}.
                </span>
                <span className="text-gray-900 dark:text-white">{goal.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            Keine Lernziele definiert. Diese können im Tab "Stammdaten" hinzugefügt werden.
          </p>
        )}
      </div>

      {/* Image Management for Explanation */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <SafeIcon icon={FiImage} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bilder für Erklärung</h3>
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
              onClick={() => document.getElementById('explanationImageUpload').click()}
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
                    className="max-w-full max-h-full object-contain cursor-pointer"
                    onClick={() => insertImageIntoEditor(image)}
                    title="Klicken, um in Erklärung einzufügen"
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
                      onClick={() => insertImageIntoEditor(image)}
                      className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded transition-colors"
                      title="In Erklärung einfügen"
                    >
                      <SafeIcon icon={FiTarget} className="h-4 w-4" />
                    </button>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hochgeladene Bilder können durch Anklicken direkt in die Erklärung eingefügt werden.
            </p>
          </div>
        )}
        <input
          id="explanationImageUpload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Markdown Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schriftliche Erklärung</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Verfassen Sie hier die schriftliche Erklärung der Lerninhalte zur späteren Veröffentlichung. Sie können Markdown-Formatierung verwenden.
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            💡 Tipp: Klicken Sie auf ein Bild oben, um es direkt in die Erklärung einzufügen.
          </p>
        </div>
        <div className="p-4">
          <MDEditor
            value={explanation}
            onChange={handleChange}
            preview="edit"
            hideToolbar={false}
            visibleDragBar={false}
            data-color-mode="auto"
            textareaProps={{
              placeholder: 'Schreiben Sie hier Ihre schriftliche Erklärung...\n\n**Sie können Markdown verwenden:**\n- **Fett** oder *kursiv*\n- [Links](http://example.com)\n- ![Bilder](url)\n- Listen und mehr',
              style: {
                fontSize: 14,
                lineHeight: 1.5,
                minHeight: 400
              }
            }}
          />
        </div>
      </div>

      {/* Preview Section */}
      {explanation && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vorschau</h3>
          <div className="prose dark:prose-invert max-w-none">
            <MDEditor.Markdown source={explanation} />
          </div>
        </div>
      )}

      {/* Comments Section for Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <SafeIcon icon={FiMessageCircle} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Anmerkungen zur Erklärung</h3>
            {unit.explanationComments && unit.explanationComments.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                {unit.explanationComments.length}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Anmerkung zur schriftlichen Erklärung hinzufügen..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <SafeIcon icon={FiSend} className="h-4 w-4 mr-2" />
                    Anmerkung senden
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List - Newest First */}
          {unit.explanationComments && unit.explanationComments.length > 0 ? (
            <div className="space-y-4">
              {unit.explanationComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.author.id === currentUser.id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Noch keine Anmerkungen zur schriftlichen Erklärung vorhanden.
            </p>
          )}
        </div>
      </div>

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

export default ExplanationTab;