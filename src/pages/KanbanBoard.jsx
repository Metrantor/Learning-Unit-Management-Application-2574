import React, { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLearningUnits, EDITORIAL_STATES } from '../context/LearningUnitContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFilter, FiFileText, FiBook, FiPackage, FiFolder, FiTarget, FiCalendar, FiClock, FiTag } = FiIcons;

const ITEM_TYPE = 'LEARNING_UNIT';

const KanbanCard = ({ unit, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: unit.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const isTargetDateOverdue = () => {
    if (!unit.targetDate) return false;
    const targetDate = new Date(unit.targetDate);
    const today = new Date();
    const isOverdue = targetDate < today;
    const isNotReady = unit.editorialState !== EDITORIAL_STATES.READY && unit.editorialState !== EDITORIAL_STATES.PUBLISHED;
    return isOverdue && isNotReady;
  };

  const getTagStyle = (color) => {
    return {
      backgroundColor: color,
      color: '#FFFFFF'
    };
  };

  return (
    <div
      ref={drag}
      onClick={() => onClick(unit.id)}
      className={`p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
        {unit.title}
      </h4>

      {unit.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {unit.description}
        </p>
      )}

      {/* Tags */}
      {unit.tags && unit.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {unit.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={getTagStyle(tag.color)}
            >
              {tag.label}
            </span>
          ))}
          {unit.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
              +{unit.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <div className="flex items-center">
          <SafeIcon icon={FiTarget} className="h-3 w-3 mr-1" />
          {unit.learningGoals?.length || 0}
        </div>
        <div className="text-xs">
          {new Date(unit.updatedAt).toLocaleDateString('de-DE')}
        </div>
      </div>

      {unit.targetDate && (
        <div className="flex items-center text-xs mb-2">
          <SafeIcon 
            icon={isTargetDateOverdue() ? FiClock : FiCalendar} 
            className={`h-3 w-3 mr-1 ${isTargetDateOverdue() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} 
          />
          <span className={isTargetDateOverdue() ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>
            {new Date(unit.targetDate).toLocaleDateString('de-DE')}
            {isTargetDateOverdue() && ' (überfällig)'}
          </span>
        </div>
      )}

      {unit.textSnippets?.length > 0 && (
        <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
          <SafeIcon icon={FiFileText} className="h-3 w-3 mr-1" />
          {unit.textSnippets.length} Snippets
        </div>
      )}
    </div>
  );
};

const KanbanColumn = ({ title, state, units, onDrop, onCardClick }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => onDrop(item.id, state),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getStateColor = (state) => {
    const colors = {
      [EDITORIAL_STATES.PLANNING]: 'border-gray-300 bg-gray-50 dark:bg-gray-800',
      [EDITORIAL_STATES.DRAFT]: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900',
      [EDITORIAL_STATES.REVIEW]: 'border-blue-300 bg-blue-50 dark:bg-blue-900',
      [EDITORIAL_STATES.READY]: 'border-green-300 bg-green-50 dark:bg-green-900',
      [EDITORIAL_STATES.PUBLISHED]: 'border-purple-300 bg-purple-50 dark:bg-purple-900'
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
          {units.length}
        </span>
      </div>

      <div className="space-y-3">
        {units.map((unit) => (
          <KanbanCard key={unit.id} unit={unit} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const { 
    learningUnits, 
    updateLearningUnit, 
    subjects, 
    trainings, 
    trainingModules, 
    topics, 
    getTopic, 
    getTrainingModule, 
    getTraining, 
    getSubject 
  } = useLearningUnits();

  const [filter, setFilter] = useState({ type: 'all', id: null });
  const [tagFilter, setTagFilter] = useState('');

  // Get all unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tagMap = new Map();
    learningUnits.forEach(unit => {
      (unit.tags || []).forEach(tag => {
        tagMap.set(tag.id, tag);
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [learningUnits]);

  const filteredUnits = useMemo(() => {
    let units = learningUnits;

    // Apply hierarchy filter
    if (filter.type !== 'all') {
      switch (filter.type) {
        case 'subject':
          const subjectTrainings = trainings.filter(t => t.subjectId === filter.id);
          const subjectModules = trainingModules.filter(m => 
            subjectTrainings.some(t => t.id === m.trainingId)
          );
          const subjectTopics = topics.filter(topic => 
            subjectModules.some(m => m.id === topic.trainingModuleId)
          );
          units = units.filter(unit => 
            subjectTopics.some(topic => topic.id === unit.topicId)
          );
          break;

        case 'training':
          const trainingModulesFiltered = trainingModules.filter(m => m.trainingId === filter.id);
          const trainingTopics = topics.filter(topic => 
            trainingModulesFiltered.some(m => m.id === topic.trainingModuleId)
          );
          units = units.filter(unit => 
            trainingTopics.some(topic => topic.id === unit.topicId)
          );
          break;

        case 'module':
          const moduleTopics = topics.filter(topic => topic.trainingModuleId === filter.id);
          units = units.filter(unit => 
            moduleTopics.some(topic => topic.id === unit.topicId)
          );
          break;

        case 'topic':
          units = units.filter(unit => unit.topicId === filter.id);
          break;
      }
    }

    // Apply tag filter
    if (tagFilter) {
      units = units.filter(unit => 
        (unit.tags || []).some(tag => tag.id === tagFilter)
      );
    }

    return units;
  }, [learningUnits, filter, tagFilter, trainings, trainingModules, topics]);

  const groupedUnits = useMemo(() => {
    const groups = {};
    Object.values(EDITORIAL_STATES).forEach(state => {
      groups[state] = filteredUnits.filter(unit => unit.editorialState === state);
    });
    return groups;
  }, [filteredUnits]);

  const handleDrop = (unitId, newState) => {
    updateLearningUnit(unitId, { editorialState: newState });
  };

  const handleCardClick = (unitId) => {
    window.location.href = `#/unit/${unitId}`;
  };

  const getFilterLabel = () => {
    if (filter.type === 'all') return 'Alle Lerneinheiten';

    switch (filter.type) {
      case 'subject':
        const subject = getSubject(filter.id);
        return `Fachthema: ${subject?.title}`;
      case 'training':
        const training = getTraining(filter.id);
        return `Training: ${training?.title}`;
      case 'module':
        const module = getTrainingModule(filter.id);
        return `Modul: ${module?.title}`;
      case 'topic':
        const topic = getTopic(filter.id);
        return `Thema: ${topic?.title}`;
      default:
        return 'Alle Lerneinheiten';
    }
  };

  const getSelectedTag = () => {
    return allTags.find(tag => tag.id === tagFilter);
  };

  const getTagStyle = (color) => {
    return {
      backgroundColor: color,
      color: '#FFFFFF'
    };
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h2>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Filter: {getFilterLabel()}</span>
              {getSelectedTag() && (
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={getTagStyle(getSelectedTag().color)}
                >
                  <SafeIcon icon={FiTag} className="h-3 w-3 mr-1" />
                  {getSelectedTag().label}
                </span>
              )}
            </div>
            
            {/* Hierarchy Filter */}
            <select
              value={`${filter.type}:${filter.id || ''}`}
              onChange={(e) => {
                const [type, id] = e.target.value.split(':');
                setFilter({ type, id: id || null });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all:">Alle Lerneinheiten</option>
              <optgroup label="Fachthemen">
                {subjects.map(subject => (
                  <option key={subject.id} value={`subject:${subject.id}`}>
                    {subject.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Trainings">
                {trainings.map(training => (
                  <option key={training.id} value={`training:${training.id}`}>
                    {training.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Module">
                {trainingModules.map(module => (
                  <option key={module.id} value={`module:${module.id}`}>
                    {module.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Themen">
                {topics.map(topic => (
                  <option key={topic.id} value={`topic:${topic.id}`}>
                    {topic.title}
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Alle Tags</option>
                {allTags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          {filteredUnits.length} Lerneinheiten • Ziehen Sie Karten zwischen den Spalten, um den Status zu ändern
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(EDITORIAL_STATES).map(([key, state]) => (
            <KanbanColumn
              key={state}
              title={state}
              state={state}
              units={groupedUnits[state] || []}
              onDrop={handleDrop}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        {filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiFileText} className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Keine Lerneinheiten gefunden
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter.type === 'all' && !tagFilter
                ? 'Erstellen Sie Ihre erste Lerneinheit.' 
                : 'Keine Lerneinheiten für die ausgewählten Filter gefunden.'
              }
            </p>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;