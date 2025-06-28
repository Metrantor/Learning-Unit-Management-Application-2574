import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearningUnits, EDITORIAL_STATES } from '../context/LearningUnitContext';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiFolder, FiFileText, FiTrendingUp, FiBook, FiPackage, FiMessageCircle, FiClock, FiTarget, FiUsers, FiLayers } = FiIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const { subjects, trainings, trainingModules, topics, learningUnits, getSubjectStats } = useLearningUnits();
  const { user: currentUser } = useAuth();

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalUnits = learningUnits.length;
    const readyOrPublishedUnits = learningUnits.filter(unit =>
      unit.editorialState === EDITORIAL_STATES.READY ||
      unit.editorialState === EDITORIAL_STATES.PUBLISHED
    ).length;
    const completionPercentage = totalUnits > 0 ? Math.round((readyOrPublishedUnits / totalUnits) * 100) : 0;

    return {
      subjects: subjects.length,
      trainings: trainings.length,
      modules: trainingModules.length,
      topics: topics.length,
      totalUnits,
      readyOrPublishedUnits,
      completionPercentage
    };
  }, [subjects, trainings, trainingModules, topics, learningUnits]);

  // Get recent activities with proper user data and navigation
  const recentActivities = useMemo(() => {
    const activities = [];

    // Recent comments from all units
    learningUnits.forEach(unit => {
      if (unit.comments) {
        unit.comments.forEach(comment => {
          activities.push({
            id: comment.id,
            type: 'comment',
            title: `Kommentar zu "${unit.title}"`,
            content: comment.content,
            author: comment.author || currentUser,
            date: comment.createdAt,
            unitId: unit.id,
            navigationPath: `/unit/${unit.id}`
          });
        });
      }
    });

    // Recent updates with proper user attribution
    [...subjects, ...trainings, ...trainingModules, ...topics, ...learningUnits]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .forEach(item => {
        const getNavigationPath = (item) => {
          if (subjects.includes(item)) return `/subjects/${item.id}`;
          if (trainings.includes(item)) return `/trainings/${item.id}`;
          if (trainingModules.includes(item)) return `/training-modules/${item.id}`;
          if (topics.includes(item)) return `/topics/${item.id}`;
          if (learningUnits.includes(item)) return `/unit/${item.id}`;
          return '/';
        };

        activities.push({
          id: `update-${item.id}`,
          type: 'update',
          title: `"${item.title}" aktualisiert`,
          content: item.description || 'Keine Beschreibung',
          author: item.lastModifiedBy || currentUser,
          date: item.updatedAt,
          itemId: item.id,
          navigationPath: getNavigationPath(item)
        });
      });

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [subjects, trainings, trainingModules, topics, learningUnits, currentUser]);

  const handleActivityClick = (activity) => {
    if (activity.navigationPath) {
      navigate(activity.navigationPath);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
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

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <SafeIcon icon={FiBook} className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{overallStats.subjects}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fachthemen</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <SafeIcon icon={FiUsers} className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{overallStats.trainings}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trainings</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <SafeIcon icon={FiLayers} className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{overallStats.modules}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Module</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <SafeIcon icon={FiTarget} className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{overallStats.topics}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Themen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gesamt-Fertigstellungsgrad</h3>
          <Link to="/kanban" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm">
            Kanban Board anzeigen →
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getPercentageColor(overallStats.completionPercentage)} mb-2`}>
              {overallStats.completionPercentage}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {overallStats.readyOrPublishedUnits} von {overallStats.totalUnits} Lerneinheiten bereit/veröffentlicht
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fachthemen */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fachthemen</h2>
            <Link
              to="/subjects/create"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              <SafeIcon icon={FiBook} className="h-4 w-4 mr-2" />
              Neues Fachthema
            </Link>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <SafeIcon icon={FiBook} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Keine Fachthemen vorhanden</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Erstellen Sie Ihr erstes Fachthema, um die Hierarchie aufzubauen.</p>
              <Link
                to="/subjects/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                <SafeIcon icon={FiBook} className="h-4 w-4 mr-2" />
                Fachthema erstellen
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {subjects.slice(0, 6).map((subject, index) => {
                const stats = getSubjectStats(subject.id);
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer p-4"
                    onClick={() => navigate(`/subjects/${subject.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {subject.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{stats.trainings} Trainings</span>
                          <span>{stats.topics} Themen</span>
                          <span>{stats.totalUnits} Einheiten</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPercentageColor(stats.percentage)}`}>
                          {stats.percentage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {stats.readyOrPublishedUnits}/{stats.totalUnits}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {subjects.length > 6 && (
                <div className="text-center pt-4">
                  <Link to="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    Alle {subjects.length} Fachthemen anzeigen →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activities Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <SafeIcon icon={FiClock} className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Letzte Aktivitäten</h3>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Noch keine Aktivitäten vorhanden.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    className="border-l-2 border-gray-200 dark:border-gray-600 pl-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex items-start space-x-2">
                      <SafeIcon
                        icon={activity.type === 'comment' ? FiMessageCircle : FiFileText}
                        className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {activity.content}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <img src={activity.author.avatar} alt={activity.author.name} className="w-4 h-4 rounded-full mr-1" />
                          <span className="mr-2">{activity.author.name}</span>
                          <span>{formatDate(activity.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schnellzugriff</h3>
            <div className="space-y-3">
              <Link
                to="/subjects/create"
                className="flex items-center p-3 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
              >
                <SafeIcon icon={FiBook} className="h-5 w-5 mr-3" />
                Fachthema erstellen
              </Link>
              <Link
                to="/kanban"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <SafeIcon icon={FiPackage} className="h-5 w-5 mr-3" />
                Kanban Board
              </Link>
              <Link
                to="/create"
                className="flex items-center p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="h-5 w-5 mr-3" />
                Lerneinheit erstellen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;