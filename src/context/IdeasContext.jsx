import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const IdeasContext = createContext();

export const IDEA_STATES = {
  IDEA: 'Idee',
  EXPLORATION: 'Exploration',
  EVALUATION: 'Evaluation',
  IMPLEMENTATION: 'Umsetzung',
  REJECTED: 'Verworfen'
};

export const useIdeas = () => {
  const context = useContext(IdeasContext);
  if (!context) {
    throw new Error('useIdeas must be used within an IdeasProvider');
  }
  return context;
};

export const IdeasProvider = ({ children }) => {
  const [ideas, setIdeas] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const savedIdeas = localStorage.getItem('ideas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const createIdea = (ideaData) => {
    const newIdea = {
      id: uuidv4(),
      ...ideaData,
      state: IDEA_STATES.IDEA,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      tags: ideaData.tags || [],
      urls: ideaData.urls || [],
      author: currentUser
    };
    setIdeas(prev => [...prev, newIdea]);
    return newIdea;
  };

  const updateIdea = (id, updates) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id 
        ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
        : idea
    ));
  };

  const deleteIdea = (id) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const getIdea = (id) => {
    return ideas.find(idea => idea.id === id);
  };

  const moveIdea = (ideaId, newState) => {
    updateIdea(ideaId, { state: newState });
  };

  const addComment = (ideaId, content) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const newComment = {
      id: uuidv4(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(idea.comments || []), newComment];
    updateIdea(ideaId, { comments: updatedComments });
  };

  const deleteComment = (ideaId, commentId) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const updatedComments = idea.comments.filter(comment => comment.id !== commentId);
    updateIdea(ideaId, { comments: updatedComments });
  };

  const addUrl = (ideaId, urlData) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const newUrl = {
      id: uuidv4(),
      ...urlData,
      createdAt: new Date().toISOString()
    };

    const updatedUrls = [...(idea.urls || []), newUrl];
    updateIdea(ideaId, { urls: updatedUrls });
  };

  const deleteUrl = (ideaId, urlId) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const updatedUrls = idea.urls.filter(url => url.id !== urlId);
    updateIdea(ideaId, { urls: updatedUrls });
  };

  const getIdeasByState = (state) => {
    return ideas.filter(idea => idea.state === state);
  };

  const value = {
    ideas,
    createIdea,
    updateIdea,
    deleteIdea,
    getIdea,
    moveIdea,
    addComment,
    deleteComment,
    addUrl,
    deleteUrl,
    getIdeasByState,
    IDEA_STATES
  };

  return (
    <IdeasContext.Provider value={value}>
      {children}
    </IdeasContext.Provider>
  );
};