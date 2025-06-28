import React, { useState } from 'react';
import { useLearningUnits } from '../../context/LearningUnitContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiZap, FiLoader, FiMessageCircle, FiSend, FiUser, FiTrash2 } = FiIcons;

const SpeechTextTab = ({ unit }) => {
  const { updateLearningUnit, processTextToSnippets, currentUser } = useLearningUnits();
  const [speechText, setSpeechText] = useState(unit.speechText || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSpeechText(value);
    updateLearningUnit(unit.id, { speechText: value });
  };

  const handleProcessText = async () => {
    if (!speechText.trim()) return;

    let shouldProceed = true;
    if (unit.textSnippets && unit.textSnippets.length > 0) {
      shouldProceed = window.confirm(
        `Es sind bereits ${unit.textSnippets.length} Snippets vorhanden. Diese werden überschrieben. Möchten Sie fortfahren?`
      );
    }

    if (!shouldProceed) return;

    setIsProcessing(true);
    try {
      await processTextToSnippets(unit.id, speechText);
      alert('Text erfolgreich in Snippets zerlegt!');
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Textes:', error);
      alert('Fehler beim Verarbeiten des Textes.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: currentUser,
      createdAt: new Date().toISOString(),
      context: 'speechtext'
    };

    const updatedComments = [newCommentObj, ...(unit.speechTextComments || [])]; // Add to beginning for newest first
    updateLearningUnit(unit.id, { speechTextComments: updatedComments });
    setNewComment('');
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      const updatedComments = (unit.speechTextComments || []).filter(comment => comment.id !== commentId);
      updateLearningUnit(unit.id, { speechTextComments: updatedComments });
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

  return (
    <div className="space-y-6">
      {/* Speech Text Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprechtext</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Geben Sie hier den Text ein, der in Snippets zerlegt werden soll.
            </p>
          </div>
          <button
            onClick={handleProcessText}
            disabled={!speechText.trim() || isProcessing}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <SafeIcon icon={FiLoader} className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <SafeIcon icon={FiZap} className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Verarbeite...' : 'In Snippets zerlegen'}
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={speechText}
            onChange={handleChange}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Geben Sie hier den Sprechtext ein, der später in kleinere Snippets zerlegt werden soll..."
          />
          <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{speechText.length} Zeichen</span>
            <span>{speechText.split(/\s+/).filter(word => word.length > 0).length} Wörter</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <SafeIcon icon={FiMessageCircle} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Anmerkungen zum Sprechtext</h3>
            {unit.speechTextComments && unit.speechTextComments.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                {unit.speechTextComments.length}
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUser} className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Anmerkung zum Sprechtext hinzufügen..."
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
          {unit.speechTextComments && unit.speechTextComments.length > 0 ? (
            <div className="space-y-4">
              {unit.speechTextComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-8 h-8 rounded-full"
                    />
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
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Noch keine Anmerkungen zum Sprechtext vorhanden.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechTextTab;