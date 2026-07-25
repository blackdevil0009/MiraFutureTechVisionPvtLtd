import { API_URL } from './config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Hero from './components/Hero';
import InternshipList from './components/InternshipList';
import Benefits from './components/Benefits';
import InternshipForm from './InternshipForm';
import PaymentPage from './components/PaymentPage';
import StudentLogin from './components/student/StudentLogin';
import StudentLayout from './components/student/StudentLayout';
import './index.css';

function App() {
  const [view, setView] = useState('home'); // 'home', 'apply', 'payment', 'success', 'student_login', 'student_portal'
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applicantData, setApplicantData] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      axios.get(`${API_URL}/api/student/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setCurrentStudent(res.data);
        setView('student_portal');
      }).catch(() => {
        localStorage.removeItem('studentToken');
      });
    }
  }, []);

  const handleApplyClick = (internship) => {
    setSelectedInternship(internship);
    setView('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = (formData) => {
    setApplicantData(formData);
    if (selectedInternship?.type === 'Paid') {
      setView('payment');
    } else {
      setView('success');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentLogin = async (basicStudentData) => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(`${API_URL}/api/student/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentStudent(res.data);
      setView('student_portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Failed to fetch student profile", error);
    }
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('studentToken');
    setCurrentStudent(null);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    if (view === 'student_login') {
      return (
        <StudentLogin 
          onLoginSuccess={handleStudentLogin} 
          onBack={() => setView('home')} 
        />
      );
    }

    if (view === 'student_portal') {
      return (
        <StudentLayout 
          student={currentStudent} 
          onLogout={handleStudentLogout} 
        />
      );
    }

    if (view === 'apply') {
      return (
        <div className="py-12">
          <button 
            onClick={() => setView('home')} 
            className="max-w-4xl mx-auto block mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold"
          >
            ← Back to Internships
          </button>
          <InternshipForm 
            internship={selectedInternship} 
            onSuccess={handleFormSuccess} 
          />
        </div>
      );
    }

    if (view === 'payment') {
      return (
        <PaymentPage 
          internship={selectedInternship} 
          applicant={applicantData} 
          onSuccess={() => setView('success')}
          onBack={() => setView('home')}
        />
      );
    }

    if (view === 'success') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Application Successful!</h2>
            <p className="text-slate-600 mb-8">
              Thank you for applying to the {selectedInternship?.title} program. Our team will review your application and get back to you shortly.
            </p>
            <button 
              onClick={() => setView('home')} 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-md hover:shadow-lg w-full"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <Hero />
        <InternshipList onApply={handleApplyClick} />
        <Benefits />
      </>
    );
  };

  // Do not render Header and Footer if inside the student portal (it has its own layout)
  if (view === 'student_portal') {
    return renderView();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      <Header onLoginClick={() => setView('student_login')} />
      <main className="flex-grow">
        {renderView()}
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-12 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-4">© {new Date().getFullYear()} Mira Future Tech Pvt Ltd. All rights reserved.</p>
          <p className="text-sm">Empowering the next generation of tech leaders.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
