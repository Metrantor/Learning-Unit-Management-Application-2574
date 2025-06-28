import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const LearningUnitContext = createContext();

export const EDITORIAL_STATES = {
  PLANNING: 'Planung',
  DRAFT: 'Entwurf',
  REVIEW: 'Redaktionelle Prüfung',
  READY: 'Bereit für Veröffentlichung',
  PUBLISHED: 'Veröffentlicht'
};

// Mock user for demonstration
const currentUser = {
  id: 'user-1',
  name: 'Max Mustermann',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
};

export const useLearningUnits = () => {
  const context = useContext(LearningUnitContext);
  if (!context) {
    throw new Error('useLearningUnits must be used within a LearningUnitProvider');
  }
  return context;
};

export const LearningUnitProvider = ({ children }) => {
  const [learningUnits, setLearningUnits] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const savedUnits = localStorage.getItem('learningUnits');
    const savedTopics = localStorage.getItem('topics');
    
    if (savedUnits) {
      setLearningUnits(JSON.parse(savedUnits));
    }
    
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('learningUnits', JSON.stringify(learningUnits));
  }, [learningUnits]);

  useEffect(() => {
    localStorage.setItem('topics', JSON.stringify(topics));
  }, [topics]);

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
      unit.topicId === id 
        ? { ...unit, topicId: null }
        : unit
    ));
    setTopics(prev => prev.filter(topic => topic.id !== id));
  };

  const getTopic = (id) => {
    return topics.find(topic => topic.id === id);
  };

  const getLearningUnitsByTopic = (topicId) => {
    return learningUnits.filter(unit => unit.topicId === topicId);
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
      learningGoals: [],
      notes: '',
      speechText: '',
      explanation: '',
      textSnippets: [],
      powerPointFile: null,
      images: [],
      comments: [],
      topicId: unitData.topicId || null
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
    if (!unit) return;

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
    if (!unit) return;

    const newComment = {
      id: uuidv4(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString()
    };

    if (isUnitComment) {
      const updatedComments = [...(unit.comments || []), newComment];
      updateLearningUnit(unitId, { comments: updatedComments });
    } else {
      const updatedSnippets = unit.textSnippets.map(snippet => {
        if (snippet.id === snippetId) {
          return { ...snippet, comments: [...(snippet.comments || []), newComment] };
        }
        return snippet;
      });
      updateLearningUnit(unitId, { textSnippets: updatedSnippets });
    }
  };

  const value = {
    // Topics
    topics,
    createTopic,
    updateTopic,
    deleteTopic,
    getTopic,
    getLearningUnitsByTopic,
    getTopicStats,
    
    // Learning Units
    learningUnits,
    createLearningUnit,
    updateLearningUnit,
    deleteLearningUnit,
    getLearningUnit,
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