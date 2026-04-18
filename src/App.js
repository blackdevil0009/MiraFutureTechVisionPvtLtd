import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import InternshipForm from './components/sections/InternshipForm';
import { AnimatePresence } from 'framer-motion';

function AppContent() {
  const location = useLocation();
  const isApplyPage = location.pathname === '/apply';

  return (
    <div className="min-h-screen bg-background text-textMain overflow-x-hidden font-sans transition-colors duration-300">
      <Navbar 
        showApply={!isApplyPage} 
      />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<InternshipForm />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
