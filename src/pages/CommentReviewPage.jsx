import React,{useState,useMemo} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {useLearningUnits} from '../context/LearningUnitContext';
import {useAuth} from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiMessageCircle,FiUser,FiCalendar,FiTarget,FiCheckCircle,FiAlertCircle,FiClock,FiEdit,FiArrowRight,FiFilter,FiSearch,FiBookOpen,FiUsers,FiLayers,FiHome,FiPackage,FiBug,FiChevronDown,FiChevronRight}=FiIcons;

const DebugSection=({debugData,title})=> {
  const [isExpanded,setIsExpanded]=useState(false);
  const {isAdmin}=useAuth();

  if (!isAdmin) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
      <button
        onClick={()=> setIsExpanded(!isExpanded)}
        className="flex items-center w-full text-left"
      >
        <SafeIcon icon={isExpanded ? FiChevronDown : FiChevronRight} className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
        <SafeIcon icon={FiBug} className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
        <span className="font-medium text-yellow-800 dark:text-yellow-200">{title}</span>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pl-10">
          <div className="bg-yellow-100 dark:bg-yellow-800 rounded p-3">
            <pre className="text-xs text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap font-mono">
              {JSON.stringify(debugData,null,2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentReviewPage=()=> {
  const navigate=useNavigate();
  const {learningUnits,updateLearningUnit,subjects,trainings,trainingModules,topics,getTopic,getTrainingModule,getTraining,getSubject}=useLearningUnits();
  const {user: currentUser,users}=useAuth();

  const [filters,setFilters]=useState({
    search: '',
    status: 'all',
    context: 'all',
    author: 'all',
    priority: 'all',
    owner: 'all'
  });

  const getPriority=(comment)=> {
    const daysSinceCreated=Math.floor((new Date() - new Date(comment.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (comment.isProcessed) return 'low';
    if (comment.isForDiscussion && daysSinceCreated > 7) return 'high';
    if (daysSinceCreated > 3) return 'medium';
    return 'low';
  };

  const isCommentOverdue=(comment)=> {
    const daysSinceCreated=Math.floor((new Date() - new Date(comment.createdAt)) / (1000 * 60 * 60 * 24));
    return comment.isForDiscussion && daysSinceCreated > 7;
  };

  const getUserById=(userId)=> {
    return users?.find(user=> user.id === userId) || {
      id: userId,
      name: 'Unbekannter Benutzer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
    };
  };

  const allComments=useMemo(()=> {
    const comments=[];

    if (!learningUnits || learningUnits.length === 0) {
      return [];
    }

    learningUnits.forEach((unit,unitIndex)=> {
      const topic=unit.topicId ? getTopic(unit.topicId) : null;
      const trainingModule=topic?.trainingModuleId ? getTrainingModule(topic.trainingModuleId) : null;
      const training=trainingModule?.trainingId ? getTraining(trainingModule.trainingId) : null;
      const subject=training?.subjectId ? getSubject(training.subjectId) : null;

      const topicOwner=topic?.ownerId ? getUserById(topic.ownerId) : null;

      const unitPath=[];
      if (subject) unitPath.push(subject.title);
      if (training) unitPath.push(training.title);
      if (trainingModule) unitPath.push(trainingModule.title);
      if (topic) unitPath.push(topic.title);

      // General comments
      if (unit.comments && unit.comments.length > 0) {
        unit.comments.forEach(comment=> {
          comments.push({
            ...comment,
            context: 'general',
            contextLabel: 'Allgemein',
            unitId: unit.id,
            unitTitle: unit.title,
            unitPath: unitPath.join(' → '),
            navigationPath: `/unit/${unit.id}`,
            priority: getPriority(comment),
            isOverdue: isCommentOverdue(comment),
            topicOwner
          });
        });
      }

      // Explanation comments
      if (unit.explanationComments && unit.explanationComments.length > 0) {
        unit.explanationComments.forEach(comment=> {
          comments.push({
            ...comment,
            context: 'explanation',
            contextLabel: 'Schriftliche Erklärung',
            unitId: unit.id,
            unitTitle: unit.title,
            unitPath: unitPath.join(' → '),
            navigationPath: `/unit/${unit.id}?tab=explanation`,
            priority: getPriority(comment),
            isOverdue: isCommentOverdue(comment),
            topicOwner
          });
        });
      }

      // Speech text comments
      if (unit.speechTextComments && unit.speechTextComments.length > 0) {
        unit.speechTextComments.forEach(comment=> {
          comments.push({
            ...comment,
            context: 'speechtext',
            contextLabel: 'Sprechtext',
            unitId: unit.id,
            unitTitle: unit.title,
            unitPath: unitPath.join(' → '),
            navigationPath: `/unit/${unit.id}?tab=speechtext`,
            priority: getPriority(comment),
            isOverdue: isCommentOverdue(comment),
            topicOwner
          });
        });
      }

      // Snippet comments
      if (unit.textSnippets && unit.textSnippets.length > 0) {
        unit.textSnippets.forEach((snippet,snippetIndex)=> {
          if (snippet.comments && snippet.comments.length > 0) {
            snippet.comments.forEach(comment=> {
              comments.push({
                ...comment,
                context: 'snippet',
                contextLabel: `Snippet "${snippet.content.substring(0,30)}..."`,
                snippetId: snippet.id,
                snippetContent: snippet.content,
                unitId: unit.id,
                unitTitle: unit.title,
                unitPath: unitPath.join(' → '),
                navigationPath: `/unit/${unit.id}?tab=snippets`,
                priority: getPriority(comment),
                isOverdue: isCommentOverdue(comment),
                topicOwner
              });
            });
          }
        });
      }
    });

    return comments.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  },[learningUnits,getTopic,getTrainingModule,getTraining,getSubject,users]);

  const filteredComments=useMemo(()=> {
    return allComments.filter(comment=> {
      if (filters.search && 
          !comment.content.toLowerCase().includes(filters.search.toLowerCase()) && 
          !comment.unitTitle.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(comment.snippetContent && comment.snippetContent.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }

      if (filters.status !== 'all') {
        switch (filters.status) {
          case 'discussion':
            if (!comment.isForDiscussion) return false;
            break;
          case 'processed':
            if (!comment.isProcessed) return false;
            break;
          case 'unprocessed':
            if (comment.isProcessed) return false;
            break;
        }
      }

      if (filters.context !== 'all' && comment.context !== filters.context) {
        return false;
      }

      if (filters.author !== 'all' && comment.author.id !== filters.author) {
        return false;
      }

      if (filters.priority !== 'all' && comment.priority !== filters.priority) {
        return false;
      }

      if (filters.owner !== 'all') {
        if (!comment.topicOwner || comment.topicOwner.id !== filters.owner) {
          return false;
        }
      }

      return true;
    });
  },[allComments,filters]);

  const uniqueAuthors=useMemo(()=> {
    const authors=new Map();
    allComments.forEach(comment=> {
      if (!authors.has(comment.author.id)) {
        authors.set(comment.author.id,comment.author);
      }
    });
    return Array.from(authors.values());
  },[allComments]);

  const uniqueOwners=useMemo(()=> {
    const owners=new Map();
    allComments.forEach(comment=> {
      if (comment.topicOwner && !owners.has(comment.topicOwner.id)) {
        owners.set(comment.topicOwner.id,comment.topicOwner);
      }
    });
    return Array.from(owners.values());
  },[allComments]);

  const stats=useMemo(()=> {
    const total=allComments.length;
    const forDiscussion=allComments.filter(c=> c.isForDiscussion).length;
    const processed=allComments.filter(c=> c.isProcessed).length;
    const overdue=allComments.filter(c=> c.isOverdue).length;
    const highPriority=allComments.filter(c=> c.priority==='high').length;
    const snippetComments=allComments.filter(c=> c.context==='snippet').length;

    return {total,forDiscussion,processed,overdue,highPriority,snippetComments};
  },[allComments]);

  // ✅ NEW: Debug information
  const debugData={
    dataSource: 'localStorage + Supabase hybrid',
    learningUnits: {
      total: learningUnits?.length || 0,
      withComments: learningUnits?.filter(unit=> 
        (unit.comments && unit.comments.length > 0) ||
        (unit.explanationComments && unit.explanationComments.length > 0) ||
        (unit.speechTextComments && unit.speechTextComments.length > 0) ||
        (unit.textSnippets && unit.textSnippets.some(snippet=> snippet.comments && snippet.comments.length > 0))
      ).length || 0
    },
    comments: {
      total: allComments.length,
      byContext: {
        general: allComments.filter(c=> c.context === 'general').length,
        explanation: allComments.filter(c=> c.context === 'explanation').length,
        speechtext: allComments.filter(c=> c.context === 'speechtext').length,
        snippet: allComments.filter(c=> c.context === 'snippet').length
      },
      filtered: filteredComments.length,
      authors: uniqueAuthors.length,
      topicOwners: uniqueOwners.length
    },
    filters: filters,
    hierarchy: {
      subjects: subjects?.length || 0,
      trainings: trainings?.length || 0,
      trainingModules: trainingModules?.length || 0,
      topics: topics?.length || 0
    }
  };

  const handleUpdateComment=(commentId,unitId,context,updates,snippetId=null)=> {
    const unit=learningUnits.find(u=> u.id===unitId);
    if (!unit) return;

    if (context === 'snippet' && snippetId) {
      const updatedSnippets=unit.textSnippets.map(snippet=> {
        if (snippet.id === snippetId) {
          const updatedComments=snippet.comments.map(comment=> 
            comment.id===commentId ? {...comment,...updates} : comment
          );
          return {...snippet,comments: updatedComments};
        }
        return snippet;
      });
      updateLearningUnit(unitId,{textSnippets: updatedSnippets});
      return;
    }

    let commentsArray;
    let updateKey;

    switch (context) {
      case 'explanation':
        commentsArray=unit.explanationComments || [];
        updateKey='explanationComments';
        break;
      case 'speechtext':
        commentsArray=unit.speechTextComments || [];
        updateKey='speechTextComments';
        break;
      default:
        commentsArray=unit.comments || [];
        updateKey='comments';
    }

    const updatedComments=commentsArray.map(comment=> 
      comment.id===commentId ? {...comment,...updates} : comment
    );

    updateLearningUnit(unitId,{[updateKey]: updatedComments});
  };

  const handleNavigateToComment=(comment)=> {
    navigate(comment.navigationPath);
  };

  const formatDate=(dateString)=> {
    return new Date(dateString).toLocaleDateString('de-DE',{
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor=(priority)=> {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900';
      default: return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900';
    }
  };

  const getContextColor=(context)=> {
    switch (context) {
      case 'explanation': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900';
      case 'speechtext': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900';
      case 'snippet': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Anmerkungen-Zentrale</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Zentrale Übersicht aller Anmerkungen und Diskussionspunkte (inkl. Snippet-Kommentare)
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
        >
          <SafeIcon icon={FiHome} className="h-4 w-4 mr-2" />
          Zum Dashboard
        </Link>
      </div>

      {/* ✅ NEW: Debug Section for Admins */}
      <DebugSection 
        debugData={debugData} 
        title={`Comment Review Debug (${debugData.comments.total} Comments, ${debugData.comments.byContext.snippet} Snippet Comments)`}
      />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiMessageCircle} className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiPackage} className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Snippets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.snippetComments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiAlertCircle} className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diskussion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.forDiscussion}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiCheckCircle} className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bearbeitet</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.processed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Überfällig</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiTarget} className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoch</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {allComments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <SafeIcon icon={FiMessageCircle} className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Noch keine Anmerkungen vorhanden
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Anmerkungen werden automatisch hier angezeigt, sobald sie zu Lerneinheiten hinzugefügt werden.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiHome} className="h-4 w-4 mr-2" />
            Zum Dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiFilter} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Suche</label>
                <div className="relative">
                  <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e)=> setFilters(prev=> ({...prev,search: e.target.value}))}
                    placeholder="Inhalt, Lerneinheit oder Snippet..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e)=> setFilters(prev=> ({...prev,status: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Alle</option>
                  <option value="discussion">Zur Diskussion</option>
                  <option value="processed">Bearbeitet</option>
                  <option value="unprocessed">Nicht bearbeitet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kontext</label>
                <select
                  value={filters.context}
                  onChange={(e)=> setFilters(prev=> ({...prev,context: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Alle</option>
                  <option value="general">Allgemein</option>
                  <option value="explanation">Erklärung</option>
                  <option value="speechtext">Sprechtext</option>
                  <option value="snippet">Snippet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Autor</label>
                <select
                  value={filters.author}
                  onChange={(e)=> setFilters(prev=> ({...prev,author: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Alle</option>
                  {uniqueAuthors.map(author=> (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorität</label>
                <select
                  value={filters.priority}
                  onChange={(e)=> setFilters(prev=> ({...prev,priority: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Alle</option>
                  <option value="high">Hoch</option>
                  <option value="medium">Mittel</option>
                  <option value="low">Niedrig</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thema-Owner</label>
                <select
                  value={filters.owner}
                  onChange={(e)=> setFilters(prev=> ({...prev,owner: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">Alle</option>
                  {uniqueOwners.map(owner=> (
                    <option key={owner.id} value={owner.id}>{owner.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {(filters.search || filters.status !== 'all' || filters.context !== 'all' || filters.author !== 'all' || filters.priority !== 'all' || filters.owner !== 'all') && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={()=> setFilters({search: '',status: 'all',context: 'all',author: 'all',priority: 'all',owner: 'all'})}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Anmerkungen ({filteredComments.length})
                </h3>
                {filteredComments.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sortiert nach Erstellungsdatum (neueste zuerst)
                  </p>
                )}
              </div>
            </div>

            {filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <SafeIcon icon={FiMessageCircle} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {filters.search || filters.status !== 'all' || filters.context !== 'all' || filters.author !== 'all' || filters.priority !== 'all' || filters.owner !== 'all'
                    ? 'Keine Anmerkungen gefunden' 
                    : 'Noch keine Anmerkungen vorhanden'
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filters.search || filters.status !== 'all' || filters.context !== 'all' || filters.author !== 'all' || filters.priority !== 'all' || filters.owner !== 'all'
                    ? 'Versuchen Sie andere Filtereinstellungen.'
                    : 'Anmerkungen werden automatisch hier angezeigt, sobald sie erstellt werden.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComments.map((comment,index)=> (
                  <motion.div
                    key={comment.id}
                    initial={{opacity: 0,y: 20}}
                    animate={{opacity: 1,y: 0}}
                    transition={{delay: index * 0.05}}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {comment.author.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContextColor(comment.context)}`}>
                              {comment.contextLabel}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(comment.priority)}`}>
                              {comment.priority === 'high' ? 'Hoch' : comment.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </span>
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
                            {comment.isOverdue && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">
                                Überfällig
                              </span>
                            )}
                            {comment.topicOwner && (
                              <div className="flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                                <img src={comment.topicOwner.avatar} alt={comment.topicOwner.name} className="w-4 h-4 rounded-full mr-1" />
                                Owner: {comment.topicOwner.name}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {comment.resolution && (
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Beschluss:</p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{comment.resolution}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <SafeIcon icon={FiBookOpen} className="h-4 w-4 mr-1" />
                            <span className="font-medium text-primary-600 dark:text-primary-400">{comment.unitTitle}</span>
                            {comment.unitPath && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-xs">{comment.unitPath}</span>
                              </>
                            )}
                            {comment.context === 'snippet' && comment.snippetContent && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-xs italic">"{comment.snippetContent.substring(0,50)}..."</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={()=> handleUpdateComment(
                                comment.id,
                                comment.unitId,
                                comment.context,
                                {isForDiscussion: !comment.isForDiscussion},
                                comment.snippetId
                              )}
                              className={`p-1 rounded transition-colors text-xs px-2 py-1 ${
                                comment.isForDiscussion 
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              title={comment.isForDiscussion ? 'Von Diskussion entfernen' : 'Zur Diskussion hinzufügen'}
                            >
                              {comment.isForDiscussion ? 'Diskussion' : 'Normal'}
                            </button>

                            <button
                              onClick={()=> handleUpdateComment(
                                comment.id,
                                comment.unitId,
                                comment.context,
                                {isProcessed: !comment.isProcessed},
                                comment.snippetId
                              )}
                              className={`p-1 rounded transition-colors text-xs px-2 py-1 ${
                                comment.isProcessed 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              title={comment.isProcessed ? 'Als nicht bearbeitet markieren' : 'Als bearbeitet markieren'}
                            >
                              {comment.isProcessed ? '✅ Bearbeitet' : 'Offen'}
                            </button>

                            <button
                              onClick={()=> handleNavigateToComment(comment)}
                              className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors text-xs"
                            >
                              <SafeIcon icon={FiEdit} className="h-3 w-3 mr-1" />
                              Öffnen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentReviewPage;