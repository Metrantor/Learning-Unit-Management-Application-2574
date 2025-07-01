import React,{useState} from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiMessageCircle,FiSend,FiTrash2,FiCheck,FiEdit,FiX,FiAlertCircle,FiClock}=FiIcons;

const CommentSystem=({
  comments=[],
  onAddComment,
  onDeleteComment,
  onUpdateComment,
  currentUser,
  context,
  placeholder="Anmerkung hinzufügen..."
})=> {
  const [newComment,setNewComment]=useState('');
  const [editingComment,setEditingComment]=useState(null);
  const [editText,setEditText]=useState('');

  const handleAddComment=()=> {
    if (!newComment.trim()) return;

    const commentData={
      content: newComment.trim(),
      isForDiscussion: true, // Default: zur Diskussion
      isProcessed: false,    // Default: nicht bearbeitet
      resolution: ''         // Leer für neue Kommentare
    };

    onAddComment(commentData);
    setNewComment('');
  };

  const handleUpdateComment=(commentId,updates)=> {
    onUpdateComment(commentId,updates);
    setEditingComment(null);
    setEditText('');
  };

  const handleEditStart=(comment)=> {
    setEditingComment(comment.id);
    setEditText(comment.resolution || '');
  };

  const formatDate=(dateString)=> {
    return new Date(dateString).toLocaleString('de-DE',{
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if comment is overdue (more than 7 days old and still for discussion)
  const isCommentOverdue=(comment)=> {
    const daysSinceCreated=Math.floor((new Date() - new Date(comment.createdAt)) / (1000 * 60 * 60 * 24));
    return comment.isForDiscussion && daysSinceCreated > 7;
  };

  // Get priority based on comment age and status
  const getCommentPriority=(comment)=> {
    const daysSinceCreated=Math.floor((new Date() - new Date(comment.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (comment.isProcessed) return 'low';
    if (comment.isForDiscussion && daysSinceCreated > 7) return 'high';
    if (daysSinceCreated > 3) return 'medium';
    return 'low';
  };

  const getPriorityColor=(priority)=> {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900';
      default: return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900';
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e)=> setNewComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={placeholder}
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

      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment)=> {
            const isOverdue=isCommentOverdue(comment);
            const priority=getCommentPriority(comment);
            
            return (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {/* Comment Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                          {priority === 'high' ? 'Hoch' : priority === 'medium' ? 'Mittel' : 'Niedrig'}
                        </span>
                        
                        {/* Status Indicators */}
                        {comment.isForDiscussion && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs rounded-full font-medium">
                            Zur Diskussion
                          </span>
                        )}
                        {comment.isProcessed && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                            ✓ Bearbeitet
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">
                            <SafeIcon icon={FiClock} className="h-3 w-3 mr-1 inline" />
                            Überfällig
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {/* Toggle Discussion Status */}
                        <button
                          onClick={()=> handleUpdateComment(comment.id,{isForDiscussion: !comment.isForDiscussion})}
                          className={`p-1 rounded transition-colors text-xs px-2 py-1 ${
                            comment.isForDiscussion
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                          title={comment.isForDiscussion ? 'Von Diskussion entfernen' : 'Zur Diskussion hinzufügen'}
                        >
                          <SafeIcon icon={FiAlertCircle} className="h-3 w-3" />
                        </button>

                        {/* Toggle Processed Status */}
                        <button
                          onClick={()=> handleUpdateComment(comment.id,{isProcessed: !comment.isProcessed})}
                          className={`p-1 rounded transition-colors text-xs px-2 py-1 ${
                            comment.isProcessed
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                          title={comment.isProcessed ? 'Als nicht bearbeitet markieren' : 'Als bearbeitet markieren'}
                        >
                          <SafeIcon icon={FiCheck} className="h-3 w-3" />
                        </button>

                        {/* Delete Comment */}
                        {comment.author.id===currentUser.id && (
                          <button
                            onClick={()=> onDeleteComment(comment.id)}
                            className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            title="Kommentar löschen"
                          >
                            <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                      {comment.content}
                    </p>

                    {/* Resolution Field */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2 flex-shrink-0">
                          Beschluss:
                        </span>
                        {editingComment===comment.id ? (
                          <div className="flex-1">
                            <textarea
                              value={editText}
                              onChange={(e)=> setEditText(e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                              placeholder="Beschluss oder Lösung dokumentieren..."
                            />
                            <div className="flex justify-end space-x-1 mt-1">
                              <button
                                onClick={()=> {
                                  setEditingComment(null);
                                  setEditText('');
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              >
                                <SafeIcon icon={FiX} className="h-3 w-3" />
                              </button>
                              <button
                                onClick={()=> handleUpdateComment(comment.id,{resolution: editText})}
                                className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                              >
                                <SafeIcon icon={FiCheck} className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 cursor-pointer" onClick={()=> handleEditStart(comment)}>
                            {comment.resolution ? (
                              <p className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-2 rounded">
                                {comment.resolution}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 italic p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded">
                                Klicken zum Hinzufügen eines Beschlusses...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Noch keine Anmerkungen vorhanden.
        </p>
      )}
    </div>
  );
};

export default CommentSystem;