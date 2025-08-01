import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 CRITICAL: Clean localStorage function - LIGHTWEIGHT VERSION
  const cleanLearningUnitsForStorage = (units) => {
    console.log('🧹 Cleaning learning units for localStorage...');
    return units.map(unit => {
      const cleaned = {
        id: unit.id,
        title: unit.title,
        description: unit.description ? unit.description.substring(0, 500) : '', // Max 500 chars
        editorialState: unit.editorialState,
        topicId: unit.topicId,
        targetDate: unit.targetDate,
        created_at: unit.created_at,
        updated_at: unit.updated_at,
        // 🔥 MINIMAL DATA ONLY
        learningGoals: (unit.learningGoals || []).slice(0, 5), // Max 5 goals
        notes: unit.notes ? unit.notes.substring(0, 1000) : '', // Max 1000 chars
        speechText: unit.speechText ? '[SPEECH_TEXT_STORED_IN_SUPABASE]' : '', // NO LARGE TEXT
        explanation: unit.explanation ? '[EXPLANATION_STORED_IN_SUPABASE]' : '', // NO LARGE TEXT
        urls: (unit.urls || []).slice(0, 10), // Max 10 URLs
        // 🔥 IMAGES: ONLY URLs - NO Base64
        images: (unit.images || []).slice(0, 10).map(img => ({
          id: img.id,
          name: img.name,
          publicUrl: img.publicUrl || img.url,
          uploadedAt: img.uploadedAt
          // ❌ NO size, type, storagePath, url with Base64!
        })),
        // 🔥 VIDEO: ONLY essential metadata
        video: unit.video ? {
          id: unit.video.id,
          name: unit.video.name,
          publicUrl: unit.video.publicUrl,
          uploadedAt: unit.video.uploadedAt
          // ❌ NO size, type, storagePath, comments!
        } : null,
        // 🔥 TEXT SNIPPETS: MINIMAL
        textSnippets: (unit.textSnippets || []).slice(0, 10).map(snippet => ({
          id: snippet.id,
          content: snippet.content ? snippet.content.substring(0, 100) : '', // Max 100 chars
          order: snippet.order,
          approved: snippet.approved
          // ❌ NO rating, comments, imageId!
        })),
        // 🔥 COMMENTS: MINIMAL
        comments: [], // NO COMMENTS IN LOCALSTORAGE
        explanationComments: [], // NO COMMENTS IN LOCALSTORAGE  
        speechTextComments: [], // NO COMMENTS IN LOCALSTORAGE
        // 🔥 POWERPOINT: MINIMAL
        powerPointFile: unit.powerPointFile ? {
          name: unit.powerPointFile.name
          // ❌ NO size, type, uploadedAt!
        } : null,
        // 🔥 TAGS: Include tags
        tags: unit.tags || [],
        // 🔥 CONTENT TYPES: Include content types
        contentTypes: unit.contentTypes || [],
        customContentTypes: unit.customContentTypes || []
      };
      
      return cleaned;
    });
  };

  // 🚀 EMERGENCY: Save to localStorage with size check
  const saveToLocalStorageSafely = (key, data) => {
    try {
      const jsonString = JSON.stringify(data);
      const sizeInMB = (new Blob([jsonString]).size / 1024 / 1024).toFixed(2);
      console.log(`💾 Saving ${key} to localStorage: ${sizeInMB}MB`);
      
      if (sizeInMB > 8) { // If larger than 8MB, use emergency mode
        console.warn('⚠️ Data too large, using emergency mode');
        const emergencyData = data.map(unit => ({
          id: unit.id,
          title: unit.title,
          editorialState: unit.editorialState,
          topicId: unit.topicId,
          updated_at: unit.updated_at
        }));
        localStorage.setItem(key, JSON.stringify(emergencyData));
        console.log('🚨 Emergency data saved');
      } else {
        localStorage.setItem(key, jsonString);
        console.log('✅ Normal data saved');
      }
    } catch (error) {
      console.error('❌ localStorage save failed:', error);
      // Ultimate fallback: Clear and save minimal data
      try {
        localStorage.removeItem(key);
        const minimalData = data.slice(0, 10).map(unit => ({
          id: unit.id,
          title: unit.title,
          topicId: unit.topicId
        }));
        localStorage.setItem(key, JSON.stringify(minimalData));
        console.log('🆘 Minimal data saved as last resort');
      } catch (finalError) {
        console.error('💥 Complete localStorage failure:', finalError);
      }
    }
  };

  // Load all data from Supabase with fallback
  useEffect(() => {
    console.log('🚀 LearningUnitProvider initializing...');
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      // Load each entity with proper error handling
      await loadSubjects();
      await loadTrainings();
      await loadTrainingModules();
      await loadTopics();
      await loadLearningUnits();
      console.log('✅ All learning unit data loaded');
    } catch (error) {
      console.error('❌ Error loading learning unit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ROBUST LOADING WITH PROPER FALLBACK
  const loadSubjects = async () => {
    try {
      console.log('📚 Loading subjects...');
      const { data, error } = await supabase
        .from('subjects_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        console.log('✅ Loaded subjects from Supabase:', data.length);
        setSubjects(data);
        saveToLocalStorageSafely('subjects_sb2024', data);
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localData = JSON.parse(localStorage.getItem('subjects_sb2024') || '[]');
        setSubjects(localData);
      }
    } catch (error) {
      console.error('❌ Error loading subjects:', error);
      const localData = JSON.parse(localStorage.getItem('subjects_sb2024') || '[]');
      setSubjects(localData);
    }
  };

  const loadTrainings = async () => {
    try {
      console.log('🎓 Loading trainings...');
      const { data, error } = await supabase
        .from('trainings_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Convert DB format to frontend format
        const frontendData = data.map(training => ({
          ...training,
          subjectId: training.subject_id
        }));
        console.log('✅ Loaded trainings from Supabase:', frontendData.length);
        setTrainings(frontendData);
        saveToLocalStorageSafely('trainings_sb2024', frontendData);
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localData = JSON.parse(localStorage.getItem('trainings_sb2024') || '[]');
        setTrainings(localData);
      }
    } catch (error) {
      console.error('❌ Error loading trainings:', error);
      const localData = JSON.parse(localStorage.getItem('trainings_sb2024') || '[]');
      setTrainings(localData);
    }
  };

  const loadTrainingModules = async () => {
    try {
      console.log('📦 Loading training modules...');
      const { data, error } = await supabase
        .from('training_modules_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const frontendData = data.map(module => ({
          ...module,
          trainingId: module.training_id
        }));
        console.log('✅ Loaded modules from Supabase:', frontendData.length);
        setTrainingModules(frontendData);
        saveToLocalStorageSafely('trainingModules_sb2024', frontendData);
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localData = JSON.parse(localStorage.getItem('trainingModules_sb2024') || '[]');
        setTrainingModules(localData);
      }
    } catch (error) {
      console.error('❌ Error loading training modules:', error);
      const localData = JSON.parse(localStorage.getItem('trainingModules_sb2024') || '[]');
      setTrainingModules(localData);
    }
  };

  const loadTopics = async () => {
    try {
      console.log('🎯 Loading topics...');
      const { data, error } = await supabase
        .from('topics_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const frontendData = data.map(topic => ({
          ...topic,
          trainingModuleId: topic.training_module_id,
          ownerId: topic.owner_id // Map owner_id from database
        }));
        console.log('✅ Loaded topics from Supabase:', frontendData.length);
        setTopics(frontendData);
        saveToLocalStorageSafely('topics_sb2024', frontendData);
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localData = JSON.parse(localStorage.getItem('topics_sb2024') || '[]');
        setTopics(localData);
      }
    } catch (error) {
      console.error('❌ Error loading topics:', error);
      const localData = JSON.parse(localStorage.getItem('topics_sb2024') || '[]');
      setTopics(localData);
    }
  };

  const loadLearningUnits = async () => {
    try {
      console.log('📖 Loading learning units...');
      const { data, error } = await supabase
        .from('learning_units_sb2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const frontendData = data.map(unit => ({
          ...unit,
          editorialState: unit.editorial_state || EDITORIAL_STATES.PLANNING,
          learningGoals: unit.learning_goals || [],
          speechText: unit.speech_text || '',
          textSnippets: unit.text_snippets || [],
          powerPointFile: unit.powerpoint_file || null,
          explanationComments: unit.explanation_comments || [],
          speechTextComments: unit.speech_text_comments || [],
          topicId: unit.topic_id,
          targetDate: unit.target_date,
          // 🔥 CRITICAL: Include tags and contentTypes from DB
          tags: unit.tags || [],
          contentTypes: unit.content_types || [],
          customContentTypes: unit.custom_content_types || []
        }));
        console.log('✅ Loaded learning units from Supabase:', frontendData.length);
        setLearningUnits(frontendData);
        
        // 🔥 CRITICAL: Clean data before localStorage
        const cleanedData = cleanLearningUnitsForStorage(frontendData);
        saveToLocalStorageSafely('learningUnits_sb2024', cleanedData);
        
      } else {
        console.log('⚠️ Supabase error, using localStorage fallback');
        const localData = JSON.parse(localStorage.getItem('learningUnits_sb2024') || '[]');
        setLearningUnits(localData);
      }
    } catch (error) {
      console.error('❌ Error loading learning units:', error);
      const localData = JSON.parse(localStorage.getItem('learningUnits_sb2024') || '[]');
      setLearningUnits(localData);
    }
  };

  // ROBUST CREATE FUNCTIONS
  const createSubject = async (subjectData) => {
    try {
      console.log('🆕 Creating subject:', subjectData.title);
      const newSubject = {
        id: uuidv4(),
        title: subjectData.title,
        description: subjectData.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('subjects_sb2024')
          .insert([newSubject])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created subject in Supabase:', data.title);
          const updatedSubjects = [data, ...subjects];
          setSubjects(updatedSubjects);
          saveToLocalStorageSafely('subjects_sb2024', updatedSubjects);
          return data;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating subject locally:', newSubject.title);
      const updatedSubjects = [newSubject, ...subjects];
      setSubjects(updatedSubjects);
      saveToLocalStorageSafely('subjects_sb2024', updatedSubjects);
      return newSubject;
    } catch (error) {
      console.error('❌ Error creating subject:', error);
      throw error;
    }
  };

  const updateSubject = async (id, updates) => {
    try {
      console.log('📝 Updating subject:', id);
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('subjects_sb2024')
          .update(updatedData)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated subject in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedSubjects = subjects.map(subject =>
        subject.id === id ? { ...subject, ...updatedData } : subject
      );
      setSubjects(updatedSubjects);
      saveToLocalStorageSafely('subjects_sb2024', updatedSubjects);
    } catch (error) {
      console.error('❌ Error updating subject:', error);
      throw error;
    }
  };

  const deleteSubject = async (id) => {
    try {
      console.log('🗑️ Deleting subject:', id);

      // 🔥 CASCADING DELETE: Get all related data first
      const relatedTrainings = trainings.filter(training => training.subjectId === id);
      const relatedModules = trainingModules.filter(module =>
        relatedTrainings.some(training => training.id === module.trainingId)
      );
      const relatedTopics = topics.filter(topic =>
        relatedModules.some(module => module.id === topic.trainingModuleId)
      );
      const relatedUnits = learningUnits.filter(unit =>
        relatedTopics.some(topic => topic.id === unit.topicId)
      );

      console.log(`🗑️ Cascading delete: ${relatedUnits.length} units, ${relatedTopics.length} topics, ${relatedModules.length} modules, ${relatedTrainings.length} trainings`);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('subjects_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted subject from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state - CASCADE DELETE
      const updatedSubjects = subjects.filter(subject => subject.id !== id);
      const updatedTrainings = trainings.filter(training => training.subjectId !== id);
      const updatedModules = trainingModules.filter(module =>
        !relatedTrainings.some(training => training.id === module.trainingId)
      );
      const updatedTopics = topics.filter(topic =>
        !relatedModules.some(module => module.id === topic.trainingModuleId)
      );
      const updatedUnits = learningUnits.filter(unit =>
        !relatedTopics.some(topic => topic.id === unit.topicId)
      );

      setSubjects(updatedSubjects);
      setTrainings(updatedTrainings);
      setTrainingModules(updatedModules);
      setTopics(updatedTopics);
      setLearningUnits(updatedUnits);

      // Update localStorage
      saveToLocalStorageSafely('subjects_sb2024', updatedSubjects);
      saveToLocalStorageSafely('trainings_sb2024', updatedTrainings);
      saveToLocalStorageSafely('trainingModules_sb2024', updatedModules);
      saveToLocalStorageSafely('topics_sb2024', updatedTopics);
      
      // 🔥 CRITICAL: Clean learning units before saving
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
      console.log('✅ Cascading delete completed');
    } catch (error) {
      console.error('❌ Error deleting subject:', error);
      throw error;
    }
  };

  // TRAINING FUNCTIONS
  const createTraining = async (trainingData) => {
    try {
      console.log('🆕 Creating training:', trainingData.title);
      const newTraining = {
        id: uuidv4(),
        title: trainingData.title,
        description: trainingData.description || '',
        subjectId: trainingData.subjectId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('trainings_sb2024')
          .insert([{
            id: newTraining.id,
            title: newTraining.title,
            description: newTraining.description,
            subject_id: newTraining.subjectId,
            created_at: newTraining.created_at,
            updated_at: newTraining.updated_at
          }])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created training in Supabase:', data.title);
          const frontendData = { ...data, subjectId: data.subject_id };
          const updatedTrainings = [frontendData, ...trainings];
          setTrainings(updatedTrainings);
          saveToLocalStorageSafely('trainings_sb2024', updatedTrainings);
          return frontendData;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating training locally:', newTraining.title);
      const updatedTrainings = [newTraining, ...trainings];
      setTrainings(updatedTrainings);
      saveToLocalStorageSafely('trainings_sb2024', updatedTrainings);
      return newTraining;
    } catch (error) {
      console.error('❌ Error creating training:', error);
      throw error;
    }
  };

  const updateTraining = async (id, updates) => {
    try {
      console.log('📝 Updating training:', id);
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const dbUpdates = { ...updatedData };
        if (updates.subjectId !== undefined) {
          dbUpdates.subject_id = updates.subjectId;
          delete dbUpdates.subjectId;
        }

        const { error } = await supabase
          .from('trainings_sb2024')
          .update(dbUpdates)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated training in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedTrainings = trainings.map(training =>
        training.id === id ? { ...training, ...updatedData } : training
      );
      setTrainings(updatedTrainings);
      saveToLocalStorageSafely('trainings_sb2024', updatedTrainings);
    } catch (error) {
      console.error('❌ Error updating training:', error);
      throw error;
    }
  };

  const deleteTraining = async (id) => {
    try {
      console.log('🗑️ Deleting training:', id);

      // 🔥 CASCADING DELETE: Get all related data first
      const relatedModules = trainingModules.filter(module => module.trainingId === id);
      const relatedTopics = topics.filter(topic =>
        relatedModules.some(module => module.id === topic.trainingModuleId)
      );
      const relatedUnits = learningUnits.filter(unit =>
        relatedTopics.some(topic => topic.id === unit.topicId)
      );

      console.log(`🗑️ Cascading delete: ${relatedUnits.length} units, ${relatedTopics.length} topics, ${relatedModules.length} modules`);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('trainings_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted training from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state - CASCADE DELETE
      const updatedTrainings = trainings.filter(training => training.id !== id);
      const updatedModules = trainingModules.filter(module => module.trainingId !== id);
      const updatedTopics = topics.filter(topic =>
        !relatedModules.some(module => module.id === topic.trainingModuleId)
      );
      const updatedUnits = learningUnits.filter(unit =>
        !relatedTopics.some(topic => topic.id === unit.topicId)
      );

      setTrainings(updatedTrainings);
      setTrainingModules(updatedModules);
      setTopics(updatedTopics);
      setLearningUnits(updatedUnits);

      // Update localStorage
      saveToLocalStorageSafely('trainings_sb2024', updatedTrainings);
      saveToLocalStorageSafely('trainingModules_sb2024', updatedModules);
      saveToLocalStorageSafely('topics_sb2024', updatedTopics);
      
      // 🔥 CRITICAL: Clean learning units before saving
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
      console.log('✅ Cascading delete completed');
    } catch (error) {
      console.error('❌ Error deleting training:', error);
      throw error;
    }
  };

  // TRAINING MODULE FUNCTIONS
  const createTrainingModule = async (moduleData) => {
    try {
      console.log('🆕 Creating training module:', moduleData.title);
      const newModule = {
        id: uuidv4(),
        title: moduleData.title,
        description: moduleData.description || '',
        trainingId: moduleData.trainingId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('training_modules_sb2024')
          .insert([{
            id: newModule.id,
            title: newModule.title,
            description: newModule.description,
            training_id: newModule.trainingId,
            created_at: newModule.created_at,
            updated_at: newModule.updated_at
          }])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created module in Supabase:', data.title);
          const frontendData = { ...data, trainingId: data.training_id };
          const updatedModules = [frontendData, ...trainingModules];
          setTrainingModules(updatedModules);
          saveToLocalStorageSafely('trainingModules_sb2024', updatedModules);
          return frontendData;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating module locally:', newModule.title);
      const updatedModules = [newModule, ...trainingModules];
      setTrainingModules(updatedModules);
      saveToLocalStorageSafely('trainingModules_sb2024', updatedModules);
      return newModule;
    } catch (error) {
      console.error('❌ Error creating training module:', error);
      throw error;
    }
  };

  const updateTrainingModule = async (id, updates) => {
    try {
      console.log('📝 Updating training module:', id);
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const dbUpdates = { ...updatedData };
        if (updates.trainingId !== undefined) {
          dbUpdates.training_id = updates.trainingId;
          delete dbUpdates.trainingId;
        }

        const { error } = await supabase
          .from('training_modules_sb2024')
          .update(dbUpdates)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated module in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedModules = trainingModules.map(module =>
        module.id === id ? { ...module, ...updatedData } : module
      );
      setTrainingModules(updatedModules);
      saveToLocalStorageSafely('trainingModules_sb2024', updatedModules);
    } catch (error) {
      console.error('❌ Error updating training module:', error);
      throw error;
    }
  };

  const deleteTrainingModule = async (id) => {
    try {
      console.log('🗑️ Deleting training module:', id);

      // 🔥 CASCADING DELETE: Get all related data first
      const relatedTopics = topics.filter(topic => topic.trainingModuleId === id);
      const relatedUnits = learningUnits.filter(unit =>
        relatedTopics.some(topic => topic.id === unit.topicId)
      );

      console.log(`🗑️ Cascading delete: ${relatedUnits.length} units, ${relatedTopics.length} topics`);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('training_modules_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted module from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state - CASCADE DELETE
      const updatedModules = trainingModules.filter(module => module.id !== id);
      const updatedTopics = topics.filter(topic => topic.trainingModuleId !== id);
      const updatedUnits = learningUnits.filter(unit =>
        !relatedTopics.some(topic => topic.id === unit.topicId)
      );

      setTrainingModules(updatedModules);
      setTopics(updatedTopics);
      setLearningUnits(updatedUnits);

      // Update localStorage
      saveToLocalStorageSafely('trainingModules_sb2024', updatedModules);
      saveToLocalStorageSafely('topics_sb2024', updatedTopics);
      
      // 🔥 CRITICAL: Clean learning units before saving
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
      console.log('✅ Cascading delete completed');
    } catch (error) {
      console.error('❌ Error deleting training module:', error);
      throw error;
    }
  };

  // TOPIC FUNCTIONS
  const createTopic = async (topicData) => {
    try {
      console.log('🆕 Creating topic:', topicData.title);
      const newTopic = {
        id: uuidv4(),
        title: topicData.title,
        description: topicData.description || '',
        trainingModuleId: topicData.trainingModuleId || null,
        ownerId: topicData.ownerId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('topics_sb2024')
          .insert([{
            id: newTopic.id,
            title: newTopic.title,
            description: newTopic.description,
            training_module_id: newTopic.trainingModuleId,
            owner_id: newTopic.ownerId,
            created_at: newTopic.created_at,
            updated_at: newTopic.updated_at
          }])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created topic in Supabase:', data.title);
          const frontendData = { 
            ...data, 
            trainingModuleId: data.training_module_id,
            ownerId: data.owner_id
          };
          const updatedTopics = [frontendData, ...topics];
          setTopics(updatedTopics);
          saveToLocalStorageSafely('topics_sb2024', updatedTopics);
          return frontendData;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating topic locally:', newTopic.title);
      const updatedTopics = [newTopic, ...topics];
      setTopics(updatedTopics);
      saveToLocalStorageSafely('topics_sb2024', updatedTopics);
      return newTopic;
    } catch (error) {
      console.error('❌ Error creating topic:', error);
      throw error;
    }
  };

  const updateTopic = async (id, updates) => {
    try {
      console.log('📝 Updating topic:', id);
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const dbUpdates = { ...updatedData };
        if (updates.trainingModuleId !== undefined) {
          dbUpdates.training_module_id = updates.trainingModuleId;
          delete dbUpdates.trainingModuleId;
        }
        if (updates.ownerId !== undefined) {
          dbUpdates.owner_id = updates.ownerId;
          delete dbUpdates.ownerId;
        }

        const { error } = await supabase
          .from('topics_sb2024')
          .update(dbUpdates)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated topic in Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed');
      }

      // Always update local state
      const updatedTopics = topics.map(topic =>
        topic.id === id ? { ...topic, ...updatedData } : topic
      );
      setTopics(updatedTopics);
      saveToLocalStorageSafely('topics_sb2024', updatedTopics);
    } catch (error) {
      console.error('❌ Error updating topic:', error);
      throw error;
    }
  };

  const deleteTopic = async (id) => {
    try {
      console.log('🗑️ Deleting topic:', id);

      // 🔥 CASCADING DELETE: Get all related units first
      const relatedUnits = learningUnits.filter(unit => unit.topicId === id);
      console.log(`🗑️ Cascading delete: ${relatedUnits.length} units`);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('topics_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted topic from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state - CASCADE DELETE
      const updatedTopics = topics.filter(topic => topic.id !== id);
      const updatedUnits = learningUnits.filter(unit => unit.topicId !== id);

      setTopics(updatedTopics);
      setLearningUnits(updatedUnits);

      // Update localStorage
      saveToLocalStorageSafely('topics_sb2024', updatedTopics);
      
      // 🔥 CRITICAL: Clean learning units before saving
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
      console.log('✅ Cascading delete completed');
    } catch (error) {
      console.error('❌ Error deleting topic:', error);
      throw error;
    }
  };

  // LEARNING UNIT FUNCTIONS
  const createLearningUnit = async (unitData) => {
    try {
      console.log('🆕 Creating learning unit:', unitData.title);
      const newUnit = {
        id: uuidv4(),
        title: unitData.title,
        description: unitData.description || '',
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
        video: unitData.video || null,
        targetDate: unitData.targetDate || null,
        // 🔥 CRITICAL: Include tags and contentTypes
        tags: unitData.tags || [],
        contentTypes: unitData.contentTypes || [],
        customContentTypes: unitData.customContentTypes || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const { data, error } = await supabase
          .from('learning_units_sb2024')
          .insert([{
            id: newUnit.id,
            title: newUnit.title,
            description: newUnit.description,
            editorial_state: newUnit.editorialState,
            learning_goals: newUnit.learningGoals,
            notes: newUnit.notes,
            speech_text: newUnit.speechText,
            explanation: newUnit.explanation,
            text_snippets: newUnit.textSnippets,
            powerpoint_file: newUnit.powerPointFile,
            images: newUnit.images,
            comments: newUnit.comments,
            explanation_comments: newUnit.explanationComments,
            speech_text_comments: newUnit.speechTextComments,
            topic_id: newUnit.topicId,
            urls: newUnit.urls,
            video: newUnit.video,
            target_date: newUnit.targetDate,
            // 🔥 CRITICAL: Store tags and contentTypes in DB
            tags: newUnit.tags,
            content_types: newUnit.contentTypes,
            custom_content_types: newUnit.customContentTypes,
            created_at: newUnit.created_at,
            updated_at: newUnit.updated_at
          }])
          .select()
          .single();

        if (!error && data) {
          console.log('✅ Created learning unit in Supabase:', data.title);
          const frontendData = {
            ...data,
            editorialState: data.editorial_state,
            learningGoals: data.learning_goals,
            speechText: data.speech_text,
            textSnippets: data.text_snippets,
            powerPointFile: data.powerpoint_file,
            explanationComments: data.explanation_comments,
            speechTextComments: data.speech_text_comments,
            topicId: data.topic_id,
            targetDate: data.target_date,
            // 🔥 CRITICAL: Map tags and contentTypes from DB
            tags: data.tags || [],
            contentTypes: data.content_types || [],
            customContentTypes: data.custom_content_types || []
          };
          const updatedUnits = [frontendData, ...learningUnits];
          setLearningUnits(updatedUnits);
          
          // 🔥 CRITICAL: Clean data before localStorage
          const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
          saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
          
          return frontendData;
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase failed, using local storage');
      }

      // Fallback: Local storage
      console.log('📝 Creating learning unit locally:', newUnit.title);
      const updatedUnits = [newUnit, ...learningUnits];
      setLearningUnits(updatedUnits);
      
      // 🔥 CRITICAL: Clean data before localStorage
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
      return newUnit;
    } catch (error) {
      console.error('❌ Error creating learning unit:', error);
      throw error;
    }
  };

  // 🚀 MOST CRITICAL FUNCTION: updateLearningUnit with SAFE localStorage and TAGS/CONTENT_TYPES
  const updateLearningUnit = async (id, updates) => {
    try {
      console.log('📝 Updating learning unit:', id, 'Fields:', Object.keys(updates));
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Try Supabase first
      try {
        const dbUpdates = { ...updatedData };
        // Map frontend keys to database keys
        const keyMappings = {
          editorialState: 'editorial_state',
          learningGoals: 'learning_goals',
          speechText: 'speech_text',
          textSnippets: 'text_snippets',
          powerPointFile: 'powerpoint_file',
          explanationComments: 'explanation_comments',
          speechTextComments: 'speech_text_comments',
          topicId: 'topic_id',
          targetDate: 'target_date',
          // 🔥 CRITICAL: Map tags and contentTypes
          contentTypes: 'content_types',
          customContentTypes: 'custom_content_types'
        };

        Object.keys(keyMappings).forEach(frontendKey => {
          if (updates[frontendKey] !== undefined) {
            dbUpdates[keyMappings[frontendKey]] = updates[frontendKey];
            delete dbUpdates[frontendKey];
          }
        });

        const { error } = await supabase
          .from('learning_units_sb2024')
          .update(dbUpdates)
          .eq('id', id);

        if (!error) {
          console.log('✅ Updated learning unit in Supabase');
        } else {
          console.log('⚠️ Supabase update error:', error);
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase update failed:', supabaseError);
      }

      // Always update local state
      const updatedUnits = learningUnits.map(unit =>
        unit.id === id ? { ...unit, ...updatedData } : unit
      );
      setLearningUnits(updatedUnits);
      
      // 🔥 CRITICAL: ALWAYS clean data before localStorage
      console.log('🧹 Cleaning data for localStorage after update...');
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
    } catch (error) {
      console.error('❌ Error updating learning unit:', error);
      throw error;
    }
  };

  const deleteLearningUnit = async (id) => {
    try {
      console.log('🗑️ Deleting learning unit:', id);

      // Try Supabase first
      try {
        const { error } = await supabase
          .from('learning_units_sb2024')
          .delete()
          .eq('id', id);

        if (!error) {
          console.log('✅ Deleted learning unit from Supabase');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase delete failed');
      }

      // Always update local state
      const updatedUnits = learningUnits.filter(unit => unit.id !== id);
      setLearningUnits(updatedUnits);
      
      // 🔥 CRITICAL: Clean data before localStorage
      const cleanedUnits = cleanLearningUnitsForStorage(updatedUnits);
      saveToLocalStorageSafely('learningUnits_sb2024', cleanedUnits);
      
      console.log('✅ Learning unit deleted (including media files)');
    } catch (error) {
      console.error('❌ Error deleting learning unit:', error);
      throw error;
    }
  };

  // HELPER FUNCTIONS
  const getSubject = (id) => subjects.find(subject => subject.id === id);
  const getTraining = (id) => trainings.find(training => training.id === id);
  const getTrainingModule = (id) => trainingModules.find(module => module.id === id);
  const getTopic = (id) => topics.find(topic => topic.id === id);
  const getLearningUnit = (id) => learningUnits.find(unit => unit.id === id);

  const getTrainingsBySubject = (subjectId) => trainings.filter(training => training.subjectId === subjectId);
  const getTrainingModulesByTraining = (trainingId) => trainingModules.filter(module => module.trainingId === trainingId);
  const getTopicsByTrainingModule = (trainingModuleId) => topics.filter(topic => topic.trainingModuleId === trainingModuleId);
  const getLearningUnitsByTopic = (topicId) => learningUnits.filter(unit => unit.topicId === topicId);

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

  // SNIPPET FUNCTIONS
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

    await updateLearningUnit(unitId, { textSnippets: snippets });
    return snippets;
  };

  const addSnippet = async (unitId, content = '', order = null) => {
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
    await updateLearningUnit(unitId, { textSnippets: updatedSnippets });
    return newSnippet;
  };

  const updateSnippet = async (unitId, snippetId, updates) => {
    const unit = getLearningUnit(unitId);
    if (!unit) return;

    const updatedSnippets = unit.textSnippets.map(snippet =>
      snippet.id === snippetId ? { ...snippet, ...updates } : snippet
    );
    await updateLearningUnit(unitId, { textSnippets: updatedSnippets });
  };

  const deleteSnippet = async (unitId, snippetId) => {
    const unit = getLearningUnit(unitId);
    if (!unit) return;

    const updatedSnippets = unit.textSnippets.filter(snippet => snippet.id !== snippetId);
    await updateLearningUnit(unitId, { textSnippets: updatedSnippets });
  };

  const reorderSnippets = async (unitId, newOrder) => {
    await updateLearningUnit(unitId, { textSnippets: newOrder });
  };

  const rateSnippet = async (unitId, snippetId, isUpvote) => {
    const unit = getLearningUnit(unitId);
    if (!unit || !currentUser) return;

    const updatedSnippets = unit.textSnippets.map(snippet => {
      if (snippet.id === snippetId) {
        const currentVote = snippet.rating.userVotes[currentUser.id];
        const newRating = { ...snippet.rating };

        if (currentVote === isUpvote) {
          delete newRating.userVotes[currentUser.id];
          newRating[isUpvote ? 'up' : 'down']--;
        } else {
          if (currentVote !== undefined) {
            newRating[currentVote ? 'up' : 'down']--;
          }
          newRating.userVotes[currentUser.id] = isUpvote;
          newRating[isUpvote ? 'up' : 'down']++;
        }

        const approved = newRating.up >= 2;
        return { ...snippet, rating: newRating, approved };
      }
      return snippet;
    });

    await updateLearningUnit(unitId, { textSnippets: updatedSnippets });
  };

  const addComment = async (unitId, snippetId, content, isUnitComment = false) => {
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
      await updateLearningUnit(unitId, { comments: updatedComments });
    } else {
      const updatedSnippets = unit.textSnippets.map(snippet => {
        if (snippet.id === snippetId) {
          return { ...snippet, comments: [newComment, ...(snippet.comments || [])] };
        }
        return snippet;
      });
      await updateLearningUnit(unitId, { textSnippets: updatedSnippets });
    }
  };

  // Statistics functions
  const getSubjectStats = (subjectId) => {
    const subjectTrainings = getTrainingsBySubject(subjectId);
    const modulesInSubject = subjectTrainings.flatMap(training =>
      getTrainingModulesByTraining(training.id)
    );
    const topicsInSubject = modulesInSubject.flatMap(module =>
      getTopicsByTrainingModule(module.id)
    );
    const unitsInSubject = topicsInSubject.flatMap(topic =>
      getLearningUnitsByTopic(topic.id)
    );

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
    const topicsInTraining = modulesInTraining.flatMap(module =>
      getTopicsByTrainingModule(module.id)
    );
    const unitsInTraining = topicsInTraining.flatMap(topic =>
      getLearningUnitsByTopic(topic.id)
    );

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
    const unitsInModule = topicsInModule.flatMap(topic =>
      getLearningUnitsByTopic(topic.id)
    );

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
      return {
        total: 0,
        readyOrPublished: 0,
        percentage: 0,
        statusCounts: {}
      };
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

    return {
      total,
      readyOrPublished,
      percentage,
      statusCounts
    };
  };

  const value = {
    // Loading state
    isLoading,

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

    // Current user
    currentUser,

    // Constants
    EDITORIAL_STATES
  };

  return (
    <LearningUnitContext.Provider value={value}>
      {children}
    </LearningUnitContext.Provider>
  );
};