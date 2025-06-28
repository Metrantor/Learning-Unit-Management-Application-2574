import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LearningUnitProvider } from './context/LearningUnitContext';
import { IdeasProvider } from './context/IdeasContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginForm from './components/auth/LoginForm';
import AdminPanel from './components/admin/AdminPanel';
import Dashboard from './pages/Dashboard';
import SubjectDetail from './pages/SubjectDetail';
import CreateSubject from './pages/CreateSubject';
import EditSubject from './pages/EditSubject';
import TrainingDetail from './pages/TrainingDetail';
import CreateTraining from './pages/CreateTraining';
import EditTraining from './pages/EditTraining';
import TrainingModuleDetail from './pages/TrainingModuleDetail';
import CreateTrainingModule from './pages/CreateTrainingModule';
import EditTrainingModule from './pages/EditTrainingModule';
import TopicDetail from './pages/TopicDetail';
import CreateTopic from './pages/CreateTopic';
import EditTopic from './pages/EditTopic';
import LearningUnitDetail from './pages/LearningUnitDetail';
import CreateLearningUnit from './pages/CreateLearningUnit';
import KanbanBoard from './pages/KanbanBoard';
import IdeasKanban from './pages/IdeasKanban';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <LearningUnitProvider>
      <IdeasProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/ideas" element={<IdeasKanban />} />
              
              {/* Subjects */}
              <Route path="/subjects/create" element={<CreateSubject />} />
              <Route path="/subjects/:id" element={<SubjectDetail />} />
              <Route path="/subjects/:id/edit" element={<EditSubject />} />
              
              {/* Trainings */}
              <Route path="/trainings/create" element={<CreateTraining />} />
              <Route path="/trainings/:id" element={<TrainingDetail />} />
              <Route path="/trainings/:id/edit" element={<EditTraining />} />
              
              {/* Training Modules */}
              <Route path="/training-modules/create" element={<CreateTrainingModule />} />
              <Route path="/training-modules/:id" element={<TrainingModuleDetail />} />
              <Route path="/training-modules/:id/edit" element={<EditTrainingModule />} />
              
              {/* Topics */}
              <Route path="/topics/create" element={<CreateTopic />} />
              <Route path="/topics/:id" element={<TopicDetail />} />
              <Route path="/topics/:id/edit" element={<EditTopic />} />
              
              {/* Learning Units */}
              <Route path="/create" element={<CreateLearningUnit />} />
              <Route path="/unit/:id" element={<LearningUnitDetail />} />
            </Routes>
          </Layout>
        </Router>
      </IdeasProvider>
    </LearningUnitProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;