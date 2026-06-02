import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Benefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/benefits');
        setBenefits(res.data);
      } catch (err) {
        console.error('Failed to fetch benefits', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, []);

  if (loading) return null;

  return (
    <section id="benefits" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Why Join Us?</h2>
          <p className="text-lg text-slate-600">
            We provide an environment where you can learn, build, and grow your career with real-world exposure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={benefit.id} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-blue-200/50">
                {benefit.icon || '✨'}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
