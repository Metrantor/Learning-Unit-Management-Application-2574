import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();

  // Load ideas from Supabase with fallback
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading ideas...');
      
      const { data, error } = await supabase
        .from('ideas_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setIdeas(data);
        localStorage.setItem('ideas_sb2024', JSON.stringify(data));
        console.log('✅ Loaded ideas from Supabase:', data.length);
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localIdeas = JSON.parse(localStorage.getItem('ideas_sb2024') || '[]');
        setIdeas(localIdeas);
      }
    } catch (error) {
      console.error('❌ Error loading ideas:', error);
      const localIdeas = JSON.parse(localStorage.getItem('ideas_sb2024') || '[]');
      setIdeas(localIdeas);
    } finally {
      setIsLoading(false);
    }
  };

  const createIdea = async (ideaData) => {
    try {
      console.log('🆕 Creating idea:', ideaData.title);
      
      const newIdea = {
        id: uuidv4(),
        title: ideaData.title,
        description: ideaData.description || '',
        state: IDEA_STATES.IDEA,
        tags: ideaData.tags || [],
        urls: ideaData.urls || [],
        comments: [],
        author: currentUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('ideas_sb2024')
          .insert([newIdea])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created idea in Supabase:', data);
          const updatedIdeas = [data, ...ideas];
          setIdeas(updatedIdeas);
          localStorage.setItem('ideas_sb2024', JSON.stringify(updatedIdeas));
          return data;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating idea locally:', newIdea.title);
      const updatedIdeas = [newIdea, ...ideas];
      setIdeas(updatedIdeas);
      localStorage.setItem('ideas_sb2024', JSON.stringify(updatedIdeas));
      return newIdea;
    } catch (error) {
      console.error('❌ Error creating idea:', error);
      throw error;
    }
  };

  const updateIdea = async (id, updates) => {
    try {
      console.log('📝 Updating idea:', id);
      const updatedData = { ...updates, updated_at: new Date().toISOString() };
      
      // Try Supabase first
      try {
        const { error } = await supabase
          .from('ideas_sb2024')
          .update(updatedData)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated idea in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedIdeas = ideas.map(idea => 
        idea.id === id ? { ...idea, ...updatedData } : idea
      );
      setIdeas(updatedIdeas);
      localStorage.setItem('ideas_sb2024', JSON.stringify(updatedIdeas));
    } catch (error) {
      console.error('❌ Error updating idea:', error);
      throw error;
    }
  };

  const deleteIdea = async (id) => {
    try {
      console.log('🗑️ Deleting idea:', id);
      
      // Try Supabase first
      try {
        const { error } = await supabase
          .from('ideas_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted idea from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state
      const updatedIdeas = ideas.filter(idea => idea.id !== id);
      setIdeas(updatedIdeas);
      localStorage.setItem('ideas_sb2024', JSON.stringify(updatedIdeas));
    } catch (error) {
      console.error('❌ Error deleting idea:', error);
      throw error;
    }
  };

  const getIdea = (id) => {
    return ideas.find(idea => idea.id === id);
  };

  const moveIdea = async (ideaId, newState) => {
    await updateIdea(ideaId, { state: newState });
  };

  const addComment = async (ideaId, content) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const newComment = {
      id: uuidv4(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(idea.comments || []), newComment];
    await updateIdea(ideaId, { comments: updatedComments });
  };

  const deleteComment = async (ideaId, commentId) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const updatedComments = idea.comments.filter(comment => comment.id !== commentId);
    await updateIdea(ideaId, { comments: updatedComments });
  };

  const addUrl = async (ideaId, urlData) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const newUrl = {
      id: uuidv4(),
      ...urlData,
      createdAt: new Date().toISOString()
    };

    const updatedUrls = [...(idea.urls || []), newUrl];
    await updateIdea(ideaId, { urls: updatedUrls });
  };

  const deleteUrl = async (ideaId, urlId) => {
    const idea = getIdea(ideaId);
    if (!idea) return;

    const updatedUrls = idea.urls.filter(url => url.id !== urlId);
    await updateIdea(ideaId, { urls: updatedUrls });
  };

  const getIdeasByState = (state) => {
    return ideas.filter(idea => idea.state === state);
  };

  if (isLoading) {
    return (
      <IdeasContext.Provider value={{ isLoading: true }}>
        {children}
      </IdeasContext.Provider>
    );
  }

  const value = {
    isLoading,
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