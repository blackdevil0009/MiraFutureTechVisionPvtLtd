import React from 'react';

const InternshipCard = ({ internship, onApply }) => {
  const isPaid = internship.type === 'Paid';

  return (
    <div className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full transform hover:-translate-y-2 overflow-hidden">
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full -z-0 transition-transform duration-500 group-hover:scale-110 ${isPaid ? 'from-amber-400 to-orange-500' : 'from-blue-400 to-indigo-500'}`}></div>

      <div className="relative z-10 flex-grow">
        <div className="flex justify-between items-start mb-6">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isPaid ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {internship.type}
          </span>
          {internship.popular && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path></svg>
              Hot
            </span>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{internship.title}</h3>
        <p className="text-sm text-slate-500 font-medium mb-4">{internship.category} • {internship.duration}</p>
        
        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
          <p className="text-sm text-slate-600 mb-1">Stipend / Rewards</p>
          <p className="font-bold text-slate-900">{internship.stipend}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Key Features</h4>
          <ul className="space-y-2">
            {internship.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-600 text-sm">
                <svg className={`w-5 h-5 flex-shrink-0 ${isPaid ? 'text-amber-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {internship.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-left">
            {isPaid ? (
              <div>
                <p className="text-xs text-slate-500 font-medium">Application Fee</p>
                <p className="text-lg font-bold text-slate-900">₹{internship.price}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 font-medium">Application Fee</p>
                <p className="text-lg font-bold text-green-600">Free</p>
              </div>
            )}
          </div>
          <button 
            onClick={onApply}
            className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isPaid ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;
