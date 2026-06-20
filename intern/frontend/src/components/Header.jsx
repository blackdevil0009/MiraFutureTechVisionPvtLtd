import React from 'react';

const Header = ({ onLoginClick }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            M
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
            Mira Internships
          </h1>
        </div>
        <nav className="hidden md:flex gap-8 font-medium text-slate-300">
          <a href="#" className="hover:text-white transition-colors duration-300">Home</a>
          <a href="#internships" className="hover:text-white transition-colors duration-300">Domains</a>
          <a href="#benefits" className="hover:text-white transition-colors duration-300">Benefits</a>
        </nav>
        <div>
          <button 
            onClick={onLoginClick}
            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-semibold hover:bg-slate-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Student Portal
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
