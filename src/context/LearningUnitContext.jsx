import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const LearningUnitContext = createContext();

export const EDITORIAL_STATES = {
  PLANNING: 'Planung',
  DRAFT: 'Entwurf',
  REVIEW: 'Redaktionelle Prüfung',
  READY: 'Bereit für Veröffentlichung',
  PUBLISHED: 'Veröffentlicht'
};

export const useLearningUnits = () => {
  const context = useContext(LearningUnitContext);
  if (!context) {
    throw new Error('useLearningUnits must be used within a LearningUnitProvider');
  }
  return context;
};

export const LearningUnitProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  
  // State for all hierarchy levels
  const [subjects, setSubjects] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [trainingModules, setTrainingModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [learningUnits, setLearningUnits] = useState([]);

  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    const savedTrainings = localStorage.getItem('trainings');
    const savedModules = localStorage.getItem('trainingModules');
    const savedTopics = localStorage.getItem('topics');
    const savedUnits = localStorage.getItem('learningUnits');

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedTrainings) setTrainings(JSON.parse(savedTrainings));
    if (savedModules) setTrainingModules(JSON.parse(savedModules));
    if (savedTopics) setTopics(JSON.parse(savedTopics));
    if (savedUnits) setLearningUnits(JSON.parse(savedUnits));
  }, []);

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('trainings', JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem('trainingModules', JSON.stringify(trainingModules));
  }, [trainingModules]);

  useEffect(() => {
    localStorage.setItem('topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('learningUnits', JSON.stringify(learningUnits));
  }, [learningUnits]);

  // Subject Management
  const createSubject = (subjectData) => {
    const newSubject = {
      id: uuidv4(),
      ...subjectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  };

  const updateSubject = (id, updates) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === id 
        ? { ...subject, ...updates, updatedAt: new Date().toISOString() }
        : subject
    ));
  };

  const deleteSubject = (id) => {
    // Cascade delete trainings
    const associatedTrainings = trainings.filter(training => training.subjectId === id);
    associatedTrainings.forEach(training => deleteTraining(training.id));
    setSubjects(prev => prev.filter(subject => subject.id !== id));
  };

  const getSubject = (id) => {
    return subjects.find(subject => subject.id === id);
  };

  // Training Management
  const createTraining = (trainingData) => {
    const newTraining = {
      id: uuidv4(),
      ...trainingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTrainings(prev => [...prev, newTraining]);
    return newTraining;
  };

  const updateTraining = (id, updates) => {
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { ...training, ...updates, updatedAt: new Date().toISOString() }
        : training
    ));
  };

  const deleteTraining = (id) => {
    // Cascade delete training modules
    const associatedModules = trainingModules.filter(module => module.trainingId === id);
    associatedModules.forEach(module => deleteTrainingModule(module.id));
    setTrainings(prev => prev.filter(training => training.id !== id));
  };

  const getTraining = (id) => {
    return trainings.find(training => training.id === id);
  };

  const getTrainingsBySubject = (subjectId) => {
    return trainings.filter(training => training.subjectId === subjectId);
  };

  // Training Module Management
  const createTrainingModule = (moduleData) => {
    const newModule = {
      id: uuidv4(),
      ...moduleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTrainingModules(prev => [...prev, newModule]);
    return newModule;
  };

  const updateTrainingModule = (id, updates) => {
    setTrainingModules(prev => prev.map(module => 
      module.id === id 
        ? { ...module, ...updates, updatedAt: new Date().toISOString() }
        : module
    ));
  };

  const deleteTrainingModule = (id) => {
    // Cascade delete topics
    const associatedTopics = topics.filter(topic => topic.trainingModuleId === id);
    associatedTopics.forEach(topic => deleteTopic(topic.id));
    setTrainingModules(prev => prev.filter(module => module.id !== id));
  };

  const getTrainingModule = (id) => {
    return trainingModules.find(module => module.id === id);
  };

  const getTrainingModulesByTraining = (trainingId) => {
    return trainingModules.filter(module => module.trainingId === trainingId);
  };

  // Topic Management
  const createTopic = (topicData) => {
    const newTopic = {
      id: uuidv4(),
      ...topicData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  };

  const updateTopic = (id, updates) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id 
        ? { ...topic, ...updates, updatedAt: new Date().toISOString() }
        : topic
    ));
  };

  const deleteTopic = (id) => {
    // Remove topic reference from learning units
    setLearningUnits(prev => prev.map(unit => 
      unit.topicId === id ? { ...unit, topicId: null } : unit
    ));
    setTopics(prev => prev.filter(topic => topic.id !== id));
  };

  const getTopic = (id) => {
    return topics.find(topic => topic.id === id);
  };

  const getTopicsByTrainingModule = (trainingModuleId) => {
    return topics.filter(topic => topic.trainingModuleId === trainingModuleId);
  };

  const getLearningUnitsByTopic = (topicId) => {
    return learningUnits.filter(unit => unit.topicId === topicId);
  };

  // Helper function to get full topic path
  const getTopicPath = (topicId) => {
    const topic = getTopic(topicId);
    if (!topic) return '';
    
    const module = topic.trainingModuleId ? getTrainingModule(topic.trainingModuleId) : null;
    const training = module?.trainingId ? getTraining(module.trainingId) : null;
    const subject = training?.subjectId ? getSubject(training.subjectId) : null;
    
    const parts = [];
    if (subject) parts.push(subject.title);
    if (training) parts.push(training.title);
    if (module) parts.push(module.title);
    parts.push(topic.title);
    
    return parts.join(' → ');
  };

  // Statistics functions
  const getSubjectStats = (subjectId) => {
    const subjectTrainings = getTrainingsBySubject(subjectId);
    const modulesInSubject = subjectTrainings.flatMap(training => getTrainingModulesByTraining(training.id));
    const topicsInSubject = modulesInSubject.flatMap(module => getTopicsByTrainingModule(module.id));
    const unitsInSubject = topicsInSubject.flatMap(topic => getLearningUnitsByTopic(topic.id));

    const totalUnits = unitsInSubject.length;
    const readyOrPublishedUnits = unitsInSubject.filter(unit => 
      unit.editorialState === EDITORIAL_STATES.READY || 
      unit.editorialState === EDITORIAL_STATES.PUBLISHED
    ).length;

    return {
      trainings: subjectTrainings.length,
      modules: modulesInSubject.length,
      topics: topicsInSubject.length,
      totalUnits,
      readyOrPublishedUnits,
      percentage: totalUnits > 0 ? Math.round((readyOrPublishedUnits / totalUnits) * 100) : 0
    };
  };

  const getTrainingStats = (trainingId) => {
    const modulesInTraining = getTrainingModulesByTraining(trainingId);
    const topicsInTraining = modulesInTraining.flatMap(module => getTopicsByTrainingModule(module.id));
    const unitsInTraining = topicsInTraining.flatMap(topic => getLearningUnitsByTopic(topic.id));

    const totalUnits = unitsInTraining.length;
    const readyOrPublishedUnits = unitsInTraining.filter(unit => 
      unit.editorialState === EDITORIAL_STATES.READY || 
      unit.editorialState === EDITORIAL_STATES.PUBLISHED
    ).length;

    return {
      modules: modulesInTraining.length,
      topics: topicsInTraining.length,
      totalUnits,
      readyOrPublishedUnits,
      percentage: totalUnits > 0 ? Math.round((readyOrPublishedUnits / totalUnits) * 100) : 0
    };
  };

  const getTrainingModuleStats = (moduleId) => {
    const topicsInModule = getTopicsByTrainingModule(moduleId);
    const unitsInModule = topicsInModule.flatMap(topic => getLearningUnitsByTopic(topic.id));

    const totalUnits = unitsInModule.length;
    const readyOrPublishedUnits = unitsInModule.filter(unit => 
      unit.editorialState === EDITORIAL_STATES.READY || 
      unit.editorialState === EDITORIAL_STATES.PUBLISHED
    ).length;

    return {
      topics: topicsInModule.length,
      totalUnits,
      readyOrPublishedUnits,
      percentage: totalUnits > 0 ? Math.round((readyOrPublishedUnits / totalUnits) * 100) : 0
    };
  };

  const getTopicStats = (topicId) => {
    const units = getLearningUnitsByTopic(topicId);
    const total = units.length;

    if (total === 0) {
      return { total: 0, readyOrPublished: 0, percentage: 0, statusCounts: {} };
    }

    const statusCounts = {};
    Object.values(EDITORIAL_STATES).forEach(state => {
      statusCounts[state] = units.filter(unit => unit.editorialState === state).length;
    });

    const readyOrPublished = units.filter(unit => 
      unit.editorialState === EDITORIAL_STATES.READY || 
      unit.editorialState === EDITORIAL_STATES.PUBLISHED
    ).length;

    const percentage = Math.round((readyOrPublished / total) * 100);

    return { total, readyOrPublished, percentage, statusCounts };
  };

  // Learning Unit Management
  const createLearningUnit = (unitData) => {
    const newUnit = {
      id: uuidv4(),
      ...unitData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editorialState: EDITORIAL_STATES.PLANNING,
      learningGoals: unitData.learningGoals || [],
      notes: unitData.notes || '',
      speechText: unitData.speechText || '',
      explanation: unitData.explanation || '',
      textSnippets: unitData.textSnippets || [],
      powerPointFile: unitData.powerPointFile || null,
      images: unitData.images || [],
      comments: unitData.comments || [],
      explanationComments: unitData.explanationComments || [],
      speechTextComments: unitData.speechTextComments || [],
      topicId: unitData.topicId || null,
      urls: unitData.urls || [],
      video: unitData.video || null
    };
    setLearningUnits(prev => [...prev, newUnit]);
    return newUnit;
  };

  const updateLearningUnit = (id, updates) => {
    setLearningUnits(prev => prev.map(unit => 
      unit.id === id 
        ? { ...unit, ...updates, updatedAt: new Date().toISOString() }
        : unit
    ));
  };

  const deleteLearningUnit = (id) => {
    setLearningUnits(prev => prev.filter(unit => unit.id !== id));
  };

  const getLearningUnit = (id) => {
    return learningUnits.find(unit => unit.id === id);
  };

  const processTextToSnippets = async (unitId, text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const snippets = sentences.map((sentence, index) => ({
      id: uuidv4(),
      content: sentence.trim(),
      order: index + 1,
      createdAt: new Date().toISOString(),
      imageId: null,
      rating: { up: 0, down: 0, userVotes: {} },
      comments: [],
      approved: false
    }));

    updateLearningUnit(unitId, { textSnippets: snippets });
    return snippets;
  };

  const addSnippet = (unitId, content = '', order = null) => {
    const unit = getLearningUnit(unitId);
    if (!unit) return;

    const newSnippet = {
      id: uuidv4(),
      content,
      order: order || (unit.textSnippets.length + 1),
      createdAt: new Date().toISOString(),
      imageId: null,
      rating: { up: 0, down: 0, userVotes: {} },
      comments: [],
      approved: false
    };

    const updatedSnippets = [...unit.textSnippets, newSnippet];
    updateLearningUnit(unitId, { textSnippets: updatedSnippets });
    return newSnippet;
  };

  const updateSnippet = (unitId, snippetId, updates) => {
    const unit = getLearningUnit(unitId);
    if (!unit) return;

    const updatedSnippets = unit.textSnippets.map(snippet => 
      snippet.id === snippetId ? { ...snippet, ...updates } : snippet
    );
    updateLearningUnit(unitId, { textSnippets: updatedSnippets });
  };

  const deleteSnippet = (unitId, snippetId) => {
    const unit = getLearningUnit(unitId);
    if (!unit) return;

    const updatedSnippets = unit.textSnippets.filter(snippet => snippet.id !== snippetId);
    updateLearningUnit(unitId, { textSnippets: updatedSnippets });
  };

  const reorderSnippets = (unitId, newOrder) => {
    updateLearningUnit(unitId, { textSnippets: newOrder });
  };

  const rateSnippet = (unitId, snippetId, isUpvote) => {
    const unit = getLearningUnit(unitId);
    if (!unit || !currentUser) return;

    const updatedSnippets = unit.textSnippets.map(snippet => {
      if (snippet.id === snippetId) {
        const currentVote = snippet.rating.userVotes[currentUser.id];
        const newRating = { ...snippet.rating };

        if (currentVote === isUpvote) {
          // Remove vote
          delete newRating.userVotes[currentUser.id];
          newRating[isUpvote ? 'up' : 'down']--;
        } else {
          // Change or add vote
          if (currentVote !== undefined) {
            newRating[currentVote ? 'up' : 'down']--;
          }
          newRating.userVotes[currentUser.id] = isUpvote;
          newRating[isUpvote ? 'up' : 'down']++;
        }

        // Check if approved (2+ upvotes)
        const approved = newRating.up >= 2;

        return { ...snippet, rating: newRating, approved };
      }
      return snippet;
    });

    updateLearningUnit(unitId, { textSnippets: updatedSnippets });
  };

  const addComment = (unitId, snippetId, content, isUnitComment = false) => {
    const unit = getLearningUnit(unitId);
    if (!unit || !currentUser) return;

    const newComment = {
      id: uuidv4(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString()
    };

    if (isUnitComment) {
      const updatedComments = [newComment, ...(unit.comments || [])];
      updateLearningUnit(unitId, { comments: updatedComments });
    } else {
      const updatedSnippets = unit.textSnippets.map(snippet => {
        if (snippet.id === snippetId) {
          return {
            ...snippet,
            comments: [newComment, ...(snippet.comments || [])]
          };
        }
        return snippet;
      });
      updateLearningUnit(unitId, { textSnippets: updatedSnippets });
    }
  };

  const value = {
    // Subjects
    subjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    getSubjectStats,

    // Trainings
    trainings,
    createTraining,
    updateTraining,
    deleteTraining,
    getTraining,
    getTrainingsBySubject,
    getTrainingStats,

    // Training Modules
    trainingModules,
    createTrainingModule,
    updateTrainingModule,
    deleteTrainingModule,
    getTrainingModule,
    getTrainingModulesByTraining,
    getTrainingModuleStats,

    // Topics
    topics,
    createTopic,
    updateTopic,
    deleteTopic,
    getTopic,
    getTopicsByTrainingModule,
    getTopicStats,
    getTopicPath,

    // Learning Units
    learningUnits,
    createLearningUnit,
    updateLearningUnit,
    deleteLearningUnit,
    getLearningUnit,
    getLearningUnitsByTopic,
    processTextToSnippets,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    reorderSnippets,
    rateSnippet,
    addComment,

    currentUser,
    EDITORIAL_STATES
  };

  return (
    <LearningUnitContext.Provider value={value}>
      {children}
    </LearningUnitContext.Provider>
  );
};