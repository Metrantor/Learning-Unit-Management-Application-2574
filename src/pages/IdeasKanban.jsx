import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'framer-motion';
import { useIdeas, IDEA_STATES } from '../context/IdeasContext';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiTrash2, FiMessageCircle, FiTag, FiCalendar, FiUser, FiSend, FiLink, FiEye } = FiIcons;

const ITEM_TYPE = 'IDEA';

const IdeaDetailModal = ({ idea, isOpen, onClose, onUpdate, onAddComment, onAddUrl, onDeleteComment, onDeleteUrl }) => {
  const [newComment, setNewComment] = useState('');
  const [newUrl, setNewUrl] = useState({ title: '', url: '' });
  const [showUrlForm, setShowUrlForm] = useState(false);
  const { user } = useAuth();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(idea.id, newComment.trim());
    setNewComment('');
  };

  const handleAddUrl = () => {
    if (!newUrl.title.trim() || !newUrl.url.trim()) return;
    onAddUrl(idea.id, newUrl);
    setNewUrl({ title: '', url: '' });
    setShowUrlForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !idea) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{idea.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  idea.state === IDEA_STATES.IDEA ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                  idea.state === IDEA_STATES.EXPLORATION ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  idea.state === IDEA_STATES.EVALUATION ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  idea.state === IDEA_STATES.IMPLEMENTATION ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {idea.state}
                </span>
                <span>Erstellt: {formatDate(idea.createdAt)}</span>
                <span>Autor: {idea.author?.name || 'Unbekannt'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <SafeIcon icon={FiEdit} className="h-6 w-6 rotate-45" />
            </button>
          </div>

          {/* Description */}
          {idea.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Beschreibung</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{idea.description}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* URLs */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">URLs</h3>
              <button
                onClick={() => setShowUrlForm(!showUrlForm)}
                className="inline-flex items-center px-3 py-1 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm"
              >
                <SafeIcon icon={FiPlus} className="h-4 w-4 mr-1" />
                URL hinzufügen
              </button>
            </div>

            {showUrlForm && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newUrl.title}
                    onChange={(e) => setNewUrl(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="URL-Titel..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    value={newUrl.url}
                    onChange={(e) => setNewUrl(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowUrlForm(false)}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleAddUrl}
                      disabled={!newUrl.title.trim() || !newUrl.url.trim()}
                      className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {idea.urls && idea.urls.length > 0 ? (
              <div className="space-y-2">
                {idea.urls.map((url) => (
                  <div key={url.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{url.title}</h4>
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                      >
                        {url.url}
                      </a>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => window.open(url.url, '_blank')}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      >
                        <SafeIcon icon={FiEye} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteUrl(idea.id, url.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Noch keine URLs hinzugefügt.</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Anmerkungen ({idea.comments?.length || 0})
            </h3>

            {/* Add Comment */}
            <div className="mb-4">
              <div className="flex space-x-3">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Anmerkung hinzufügen..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="inline-flex items-center px-3 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <SafeIcon icon={FiSend} className="h-4 w-4 mr-1" />
                      Senden
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {idea.comments && idea.comments.length > 0 ? (
              <div className="space-y-3">
                {idea.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full flex-shrink-0" />
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
                            {comment.author.id === user.id && (
                              <button
                                onClick={() => onDeleteComment(idea.id, comment.id)}
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
                Noch keine Anmerkungen vorhanden.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const IdeaCard = ({ idea, onClick, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: idea.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={() => onClick(idea)}
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {idea.title}
        </h4>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(idea);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <SafeIcon icon={FiEdit} className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(idea.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <SafeIcon icon={FiTrash2} className="h-3 w-3" />
          </button>
        </div>
      </div>

      {idea.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
          {idea.description}
        </p>
      )}

      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {idea.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">+{idea.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <SafeIcon icon={FiMessageCircle} className="h-3 w-3 mr-1" />
            {idea.comments?.length || 0}
          </div>
          {idea.urls && idea.urls.length > 0 && (
            <div className="flex items-center">
              <SafeIcon icon={FiLink} className="h-3 w-3 mr-1" />
              {idea.urls.length}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <SafeIcon icon={FiCalendar} className="h-3 w-3 mr-1" />
          {new Date(idea.createdAt).toLocaleDateString('de-DE')}
        </div>
      </div>
    </div>
  );
};

const IdeaColumn = ({ title, state, ideas, onDrop, onCardClick, onCardEdit, onCardDelete }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDrop(item.id, state),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getStateColor = (state) => {
    const colors = {
      [IDEA_STATES.IDEA]: 'border-gray-300 bg-gray-50 dark:bg-gray-800',
      [IDEA_STATES.EXPLORATION]: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900',
      [IDEA_STATES.EVALUATION]: 'border-blue-300 bg-blue-50 dark:bg-blue-900',
      [IDEA_STATES.IMPLEMENTATION]: 'border-green-300 bg-green-50 dark:bg-green-900',
      [IDEA_STATES.REJECTED]: 'border-red-300 bg-red-50 dark:bg-red-900'
    };
    return colors[state] || 'border-gray-300 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div
      ref={drop}
      className={`flex-1 min-h-96 p-4 rounded-lg border-2 transition-colors ${
        isOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900' : getStateColor(state)
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
          {ideas.length}
        </span>
      </div>
      <div className="space-y-3">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onClick={onCardClick}
            onEdit={onCardEdit}
            onDelete={onCardDelete}
          />
        ))}
      </div>
    </div>
  );
};

const CreateIdeaModal = ({ isOpen, onClose, onSave, editingIdea = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });

  React.useEffect(() => {
    if (editingIdea) {
      setFormData({
        title: editingIdea.title,
        description: editingIdea.description || '',
        tags: editingIdea.tags ? editingIdea.tags.join(', ') : ''
      });
    } else {
      setFormData({ title: '', description: '', tags: '' });
    }
  }, [editingIdea, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const ideaData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    onSave(ideaData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingIdea ? 'Idee bearbeiten' : 'Neue Idee'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (durch Komma getrennt)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="z.B. Innovation, KI, Automatisierung"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              {editingIdea ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const IdeasKanban = () => {
  const { ideas, createIdea, updateIdea, deleteIdea, moveIdea, getIdeasByState, addComment, deleteComment, addUrl, deleteUrl } = useIdeas();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleDrop = (ideaId, newState) => {
    moveIdea(ideaId, newState);
  };

  const handleSaveIdea = (ideaData) => {
    if (editingIdea) {
      updateIdea(editingIdea.id, ideaData);
      setEditingIdea(null);
    } else {
      createIdea(ideaData);
    }
  };

  const handleEditIdea = (idea) => {
    setEditingIdea(idea);
    setShowCreateModal(true);
  };

  const handleDeleteIdea = (ideaId) => {
    if (window.confirm('Möchten Sie diese Idee wirklich löschen?')) {
      deleteIdea(ideaId);
    }
  };

  const handleCardClick = (idea) => {
    setSelectedIdea(idea);
  };

  const groupedIdeas = Object.values(IDEA_STATES).reduce((acc, state) => {
    acc[state] = getIdeasByState(state);
    return acc;
  }, {});

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ideen-Kanban</h2>
            <p className="text-gray-600 dark:text-gray-400">Sammeln und entwickeln Sie neue Ideen</p>
          </div>
          <button
            onClick={() => {
              setEditingIdea(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Neue Idee
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          {ideas.length} Ideen • Ziehen Sie Karten zwischen den Spalten, um den Status zu ändern • Klicken Sie auf eine Karte für Details
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(IDEA_STATES).map(([key, state]) => (
            <IdeaColumn
              key={state}
              title={state}
              state={state}
              ideas={groupedIdeas[state] || []}
              onDrop={handleDrop}
              onCardClick={handleCardClick}
              onCardEdit={handleEditIdea}
              onCardDelete={handleDeleteIdea}
            />
          ))}
        </div>

        <CreateIdeaModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingIdea(null);
          }}
          onSave={handleSaveIdea}
          editingIdea={editingIdea}
        />

        <IdeaDetailModal
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onUpdate={updateIdea}
          onAddComment={addComment}
          onAddUrl={addUrl}
          onDeleteComment={deleteComment}
          onDeleteUrl={deleteUrl}
        />
      </div>
    </DndProvider>
  );
};

export default IdeasKanban;