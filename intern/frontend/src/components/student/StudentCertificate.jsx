import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, CheckCircle, Clock, ShieldCheck, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config';

const StudentCertificate = ({ student }) => {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCertificate = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchCertificate();
  }, []);

  const handleDownload = async (fileType) => {
    try {
      const token = localStorage.getItem('studentToken');
      const response = await axios.get(`${API_URL}/api/student/certificate/download/${fileType}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Certificate-${fileType.toUpperCase()}.${fileType === 'png' ? 'png' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert(err.response.data?.error || 'Access Denied: You do not meet attendance criteria or Admin permission is required.');
      } else {
        alert('Failed to download certificate file. Please contact Admin.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="font-semibold text-sm">Loading your completion certificate details...</p>
      </div>
    );
  }

  const isEligible = certData?.is_unlocked === true || certData?.status === 'Unlocked' || Boolean(certData?.pdf_url) || Boolean(certData?.png_url);
  const hasPdf = certData?.pdf_url;
  const hasPng = certData?.png_url;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Official Internship Certificate
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Completion Certificate
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isEligible
              ? 'Your official certificate has been issued by the Admin. Preview and download below.'
              : `Complete your mandatory attendance (${certData?.threshold || 85}%) & requirements to unlock your certificate.`}
          </p>
        </div>

        {/* Download Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isEligible ? (
            <>
              {hasPdf && (
                <button
                  onClick={() => handleDownload('pdf')}
                  className="flex-1 md:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Download PDF
                </button>
              )}

              {hasPng && (
                <button
                  onClick={() => handleDownload('png')}
                  className="flex-1 md:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" /> Download PNG
                </button>
              )}

              {!hasPdf && !hasPng && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Certificate Unlocked (Admin file upload pending)</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Locked (Requires {certData?.threshold || 85}% Attendance / Admin Unlock)</span>
            </div>
          )}
        </div>
      </div>

      {/* CERTIFICATE FILE PREVIEW CONTAINER */}
      {!isEligible ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 space-y-4">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Certificate Currently Locked</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Your attendance is currently at <strong>{certData?.attendance_percentage || 0}%</strong> (Required: <strong>{certData?.threshold || 85}%</strong>).
            Once you meet the threshold or receive Admin authorization, your official PDF/PNG certificate uploaded by the Admin will appear here.
          </p>
        </div>
      ) : hasPng ? (
        <div className="space-y-8">
          {/* Render PNG Certificate Image if Uploaded by Admin */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" /> Certificate Image (PNG)
              </h3>
              <button
                onClick={() => handleDownload('png')}
                className="px-4 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Save PNG File
              </button>
            </div>

            <div className="flex justify-center bg-slate-900/5 p-4 rounded-xl overflow-hidden">
              <img
                src={`${API_URL}${hasPng}`}
                alt="Official Completion Certificate"
                className="max-w-full h-auto max-h-[750px] object-contain rounded-lg shadow-xl border border-slate-200"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl p-12 text-center border border-emerald-200 space-y-4">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Certificate Unlocked!</h3>
          <p className="text-emerald-700 max-w-md mx-auto text-sm">
            Your certificate status is approved. The Admin is currently processing and uploading your official PDF & PNG certificate files. Please check back shortly!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCertificate;
