import React from 'react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-slate-900 pt-16 pb-32 space-y-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
          Launch Your Career with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Mira Internships
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-slate-300 mx-auto mb-10">
          Join our premium internship programs designed for students and freshers. 
          Gain hands-on experience, mentorship, and placement assistance.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#internships" className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
            Explore Internships
          </a>
          <a href="#how-it-works" className="px-8 py-3 rounded-full bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all duration-300">
            How it works
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
