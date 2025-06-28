import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LearningUnitProvider } from './context/LearningUnitContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TopicDetail from './pages/TopicDetail';
import CreateTopic from './pages/CreateTopic';
import LearningUnitDetail from './pages/LearningUnitDetail';
import CreateLearningUnit from './pages/CreateLearningUnit';

function App() {
  return (
    <ThemeProvider>
      <LearningUnitProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/topics/create" element={<CreateTopic />} />
              <Route path="/topics/:id" element={<TopicDetail />} />
              <Route path="/create" element={<CreateLearningUnit />} />
              <Route path="/unit/:id" element={<LearningUnitDetail />} />
            </Routes>
          </Layout>
        </Router>
      </LearningUnitProvider>
    </ThemeProvider>
  );
}

export default App;