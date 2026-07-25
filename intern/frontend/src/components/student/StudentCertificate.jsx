import { API_URL } from '../../config';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, CheckCircle, Clock } from 'lucide-react';

const StudentCertificate = ({ student }) => {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${API_URL}/api/student/certificate`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCertData(res.data);
      } catch (error) {
        console.error("Error fetching certificate", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, []);

  if (loading) return <div className="text-center p-10">Loading certificate data...</div>;

  const isEligible = certData && certData.status === 'Generated';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Completion Certificate</h3>
            <p className="text-slate-500">Track your internship completion status and download your official certificate.</p>
          </div>
          <div className={`p-4 rounded-full ${isEligible ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            <Award className={`w-8 h-8 ${isEligible ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8">
          <h4 className="font-semibold text-slate-800 mb-4">Eligibility Requirements</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Complete all assigned projects
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Maintain 85% attendance
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Complete internship duration
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              {isEligible ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
              Admin Approval
            </li>
          </ul>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border-2 border-dashed border-slate-200 bg-white gap-4">
          <div>
            <h4 className="font-bold text-slate-800">Your Certificate</h4>
            <p className="text-sm text-slate-500 mt-1">
              {isEligible ? 'Your certificate is ready to download.' : 'Your certificate is currently being processed by the Admin.'}
            </p>
          </div>
          <a
            href={isEligible && certData.pdf_url ? `${API_URL}${certData.pdf_url}` : '#'}
            target={isEligible && certData.pdf_url ? "_blank" : "_self"}
            rel="noreferrer"
            className={`flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              isEligible
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            <Download className="w-5 h-5" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Certificate Preview UI */}
      <div className={`relative bg-white p-8 md:p-16 rounded-lg shadow-xl overflow-hidden border border-slate-200 ${!isEligible ? 'opacity-50 grayscale' : ''}`}>
        <div className="absolute top-0 left-0 w-full h-4 bg-amber-500"></div>
        <div className="absolute top-0 left-0 w-4 h-full bg-amber-500"></div>
        <div className="absolute top-4 left-4 w-full h-full border-2 border-amber-200 rounded-sm pointer-events-none"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <Award className="w-12 h-12 text-amber-500" />
          </div>
          <div className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2">
            Mira Future Tech Pvt Ltd
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-800 mb-10 text-amber-600">
            Certificate of Internship
          </h1>
          
          <p className="text-lg text-slate-600 mb-4 font-serif italic">This is proudly presented to</p>
          
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 border-b-2 border-slate-300 pb-2 inline-block px-10">
            {student?.name || 'Student Name'}
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-16 font-serif">
            For successfully completing the rigorous requirements and practical implementation in the field of <strong className="text-slate-800">{student?.domain || 'Software Engineering'}</strong>. Their dedication, technical prowess, and innovative problem-solving skills have been an invaluable asset during their tenure.
          </p>
          
          <div className="flex justify-between items-end max-w-3xl mx-auto px-4">
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-2 h-10 flex items-end justify-center pb-1">
                <span className="text-slate-700 font-medium">{certData?.issue_date ? new Date(certData.issue_date).toLocaleDateString() : '--/--/----'}</span>
              </div>
              <p className="font-bold text-slate-800 uppercase text-xs tracking-wider">Date Issued</p>
            </div>
            
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-200 opacity-80 mix-blend-multiply">
              <span className="text-amber-700 font-bold text-xs tracking-widest uppercase">Verified</span>
            </div>
            
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-2 h-10 flex items-end justify-center">
                <span className="font-serif italic text-2xl -mb-2 text-slate-700">Director</span>
              </div>
              <p className="font-bold text-slate-800 uppercase text-xs tracking-wider">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {!isEligible && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="bg-white px-8 py-4 rounded-full shadow-lg border border-amber-200 flex items-center gap-3">
              <Clock className="text-amber-500 w-6 h-6" />
              <span className="font-bold text-slate-800">Certificate Locked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertificate;
