import React, { useState } from 'react';
import { useLearningUnits } from '../../context/LearningUnitContext';
import { ReactSortable } from 'react-sortablejs';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiThumbsUp, FiThumbsDown, FiMessageCircle, FiSend, FiUser, FiImage, FiCheck, FiChevronDown, FiChevronRight } = FiIcons;

const SnippetsTab = ({ unit }) => {
  const { updateLearningUnit, addSnippet, updateSnippet, deleteSnippet, reorderSnippets, rateSnippet, addComment, currentUser } = useLearningUnits();
  const [newComments, setNewComments] = useState({});
  const [expandedSnippets, setExpandedSnippets] = useState({});

  const handleAddSnippet = () => {
    const newSnippetId = addSnippet(unit.id);
    // Auto-expand newly created snippets
    if (newSnippetId) {
      setExpandedSnippets(prev => ({ ...prev, [newSnippetId.id]: true }));
    }
  };

  const handleSnippetChange = (snippetId, field, value) => {
    updateSnippet(unit.id, snippetId, { [field]: value });
  };

  const handleDeleteSnippet = (snippetId) => {
    if (window.confirm('Möchten Sie dieses Snippet wirklich löschen?')) {
      deleteSnippet(unit.id, snippetId);
    }
  };

  const handleReorder = (newList) => {
    const reorderedSnippets = newList.map((snippet, index) => ({
      ...snippet,
      order: index + 1
    }));
    reorderSnippets(unit.id, reorderedSnippets);
  };

  const handleRate = (snippetId, isUpvote) => {
    rateSnippet(unit.id, snippetId, isUpvote);
  };

  const handleAddComment = (snippetId) => {
    const comment = newComments[snippetId];
    if (!comment?.trim()) return;
    
    addComment(unit.id, snippetId, comment.trim());
    setNewComments({ ...newComments, [snippetId]: '' });
  };

  const toggleExpanded = (snippetId) => {
    setExpandedSnippets(prev => ({
      ...prev,
      [snippetId]: !prev[snippetId]
    }));
  };

  const getUserVote = (snippet) => {
    return snippet.rating?.userVotes?.[currentUser.id];
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

  const getImageById = (imageId) => {
    return unit.images?.find(img => img.id === imageId);
  };

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Snippets bearbeiten</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verwalten Sie hier alle Snippets, ordnen Sie Bilder zu und bewerten Sie die Inhalte.
          </p>
        </div>
        <button
          onClick={handleAddSnippet}
          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
          Snippet hinzufügen
        </button>
      </div>

      {unit.textSnippets && unit.textSnippets.length > 0 ? (
        <ReactSortable
          list={unit.textSnippets}
          setList={handleReorder}
          className="space-y-3"
          handle=".drag-handle"
        >
          {unit.textSnippets.map((snippet, index) => {
            const userVote = getUserVote(snippet);
            const assignedImage = getImageById(snippet.imageId);
            const isExpanded = expandedSnippets[snippet.id];
            
            return (
              <div
                key={snippet.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Collapsed Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="drag-handle cursor-move p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                        ⋮⋮
                      </div>
                      
                      <button
                        onClick={() => toggleExpanded(snippet.id)}
                        className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        <SafeIcon 
                          icon={isExpanded ? FiChevronDown : FiChevronRight} 
                          className="h-4 w-4" 
                        />
                      </button>

                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {index + 1}.
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900 dark:text-white font-medium truncate">
                              {truncateText(snippet.content || 'Neues Snippet')}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                              ({snippet.content.length} Zeichen)
                            </span>
                          </div>
                        </div>

                        {snippet.approved && (
                          <div className="flex items-center text-green-600 dark:text-green-400 flex-shrink-0">
                            <SafeIcon icon={FiCheck} className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Genehmigt</span>
                          </div>
                        )}

                        {assignedImage && (
                          <div className="flex items-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <SafeIcon icon={FiImage} className="h-4 w-4 mr-1" />
                            <span className="text-xs">Bild</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Quick Rating Display */}
                      <div className="flex items-center space-x-1 text-xs">
                        <span className="text-green-600 dark:text-green-400">↑{snippet.rating?.up || 0}</span>
                        <span className="text-red-600 dark:text-red-400">↓{snippet.rating?.down || 0}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteSnippet(snippet.id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="pt-4">
                      {/* Content and Image Assignment */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Snippet-Text
                          </label>
                          <textarea
                            value={snippet.content}
                            onChange={(e) => handleSnippetChange(snippet.id, 'content', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Snippet-Text eingeben..."
                          />
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                            {snippet.content.length} Zeichen
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bild zuordnen
                          </label>
                          <select
                            value={snippet.imageId || ''}
                            onChange={(e) => handleSnippetChange(snippet.id, 'imageId', e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Kein Bild ausgewählt</option>
                            {unit.images?.map((image) => (
                              <option key={image.id} value={image.id}>
                                {image.name}
                              </option>
                            ))}
                          </select>
                          
                          {assignedImage && (
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                              <img
                                src={assignedImage.url}
                                alt={assignedImage.name}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  console.error('Image load error:', e);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="p-2 bg-gray-50 dark:bg-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{assignedImage.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rating System */}
                      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bewertung:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRate(snippet.id, true)}
                              className={`flex items-center px-2 py-1 rounded transition-colors ${
                                userVote === true
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-300'
                              }`}
                            >
                              <SafeIcon icon={FiThumbsUp} className="h-4 w-4 mr-1" />
                              <span className="text-sm">{snippet.rating?.up || 0}</span>
                            </button>
                            <button
                              onClick={() => handleRate(snippet.id, false)}
                              className={`flex items-center px-2 py-1 rounded transition-colors ${
                                userVote === false
                                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-300'
                              }`}
                            >
                              <SafeIcon icon={FiThumbsDown} className="h-4 w-4 mr-1" />
                              <span className="text-sm">{snippet.rating?.down || 0}</span>
                            </button>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Erstellt: {formatDate(snippet.createdAt)}
                        </span>
                      </div>

                      {/* Comments Section */}
                      <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
                        <div className="flex items-center mb-3">
                          <SafeIcon icon={FiMessageCircle} className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kommentare ({snippet.comments?.length || 0})
                          </span>
                        </div>

                        {/* Add Comment */}
                        <div className="mb-4">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newComments[snippet.id] || ''}
                              onChange={(e) => setNewComments({ ...newComments, [snippet.id]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Kommentar hinzufügen..."
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(snippet.id)}
                            />
                            <button
                              onClick={() => handleAddComment(snippet.id)}
                              disabled={!newComments[snippet.id]?.trim()}
                              className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              <SafeIcon icon={FiSend} className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        {snippet.comments && snippet.comments.length > 0 && (
                          <div className="space-y-2">
                            {snippet.comments.map((comment) => (
                              <div key={comment.id} className="flex space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <img
                                  src={comment.author.avatar}
                                  alt={comment.author.name}
                                  className="w-6 h-6 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {comment.author.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </ReactSortable>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <SafeIcon icon={FiMessageCircle} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Snippets vorhanden</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Erstellen Sie Snippets aus dem Sprechtext oder fügen Sie manuell welche hinzu.
          </p>
          <button
            onClick={handleAddSnippet}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Erstes Snippet hinzufügen
          </button>
        </div>
      )}
    </div>
  );
};

export default SnippetsTab;