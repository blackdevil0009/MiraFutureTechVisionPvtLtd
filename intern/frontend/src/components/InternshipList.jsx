import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InternshipCard from './InternshipCard';
// import { internshipDomains } from '../data/internships'; // Removing static data

const InternshipList = ({ onApply }) => {
  const [filter, setFilter] = useState('All');
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await axios.get('https://api.mirafuturetechvision.com/api/domains');
        // Parse skills and features if they come as strings
        const parsedData = res.data.map(d => ({
          ...d,
          skills: typeof d.skills === 'string' ? JSON.parse(d.skills || '[]') : d.skills,
          features: typeof d.features === 'string' ? JSON.parse(d.features || '[]') : d.features
        }));
        setInternships(parsedData);
      } catch (err) {
        console.error('Failed to fetch domains', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDomains();
  }, []);

  const filteredInternships = internships.filter(internship => 
    filter === 'All' ? true : internship.type === filter
  );

  return (
    <section id="internships" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Explore Open Roles</h2>
          <p className="text-lg text-slate-600">
            Choose from our highly sought-after domains. Whether you're looking to learn or ready to earn, we have the perfect fit for your career growth.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {['All', 'Paid', 'Unpaid'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                filter === type 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type} Internships
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filteredInternships.map(internship => (
            <InternshipCard 
              key={internship.id} 
              internship={internship} 
              onApply={() => onApply(internship)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternshipList;
