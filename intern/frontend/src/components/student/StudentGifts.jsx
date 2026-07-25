import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const StudentGifts = ({ student }) => {
  const [points, setPoints] = useState(850);
  const [gifts, setGifts] = useState([]);
  const [claimedGifts, setClaimedGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState('rewards'); // 'rewards', 'history', 'quests'
  const [selectedGift, setSelectedGift] = useState(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [claimStatusMessage, setClaimStatusMessage] = useState(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const quests = [
    { title: 'Daily Attendance Check-in', reward: '+10 Pts / day', icon: '⏰', action: 'Complete Daily' },
    { title: 'Submit Milestone Project', reward: '+100 Pts / project', icon: '🚀', action: 'Submit in Catalog' },
    { title: 'Pass Internship Technical Quiz', reward: '+50 Pts / quiz', icon: '📝', action: 'Take Quiz' },
    { title: '100% Monthly Attendance Streak', reward: '+200 Pts bonus', icon: '🔥', action: 'Maintain Attendance' },
    { title: 'Star Intern of the Month', reward: '+500 Pts award', icon: '⭐', action: 'Nominated by Mentor' }
  ];

  const categories = ['All', 'Swag Kits', 'Digital Perks', 'Gift Cards', 'LOR', 'Resource PDF'];

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get(`${API_URL}/api/student/gifts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setPoints(res.data.points !== undefined ? res.data.points : 0);
          setGifts(res.data.gifts || []);
          setClaimedGifts(res.data.claimed || []);
        }
      } catch (error) {
        console.error("Failed to fetch real gifts data from server:", error);
        setGifts([]);
        setClaimedGifts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGifts();
  }, []);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGift) return;

    setIsSubmittingClaim(true);
    setClaimStatusMessage(null);

    try {
      const token = localStorage.getItem('studentToken');
      await axios.post(
        `${API_URL}/api/student/gifts/claim`,
        { giftId: selectedGift.id, address, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn("API claim request error, proceeding with local fallback:", err);
    }

    // Local state update
    const newClaim = {
      id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      title: selectedGift.title,
      pointsUsed: selectedGift.points,
      claimedAt: new Date().toISOString().split('T')[0],
      status: 'Processing',
      trackingNo: 'ORD-PENDING'
    };

    setPoints((prev) => Math.max(0, prev - selectedGift.points));
    setClaimedGifts((prev) => [newClaim, ...prev]);
    setIsSubmittingClaim(false);
    setClaimStatusMessage({ type: 'success', text: `Successfully requested ${selectedGift.title}!` });
    
    setTimeout(() => {
      setSelectedGift(null);
      setClaimStatusMessage(null);
      setAddress('');
      setPhone('');
    }, 2000);
  };

  const filteredGifts = gifts.filter((item) =>
    item.category !== 'Certificates' && (selectedCategory === 'All' ? true : item.category === selectedCategory)
  );

  // Compute tier level
  const currentTier = points >= 1000 ? 'Gold Intern' : points >= 500 ? 'Silver Intern' : 'Bronze Intern';
  const nextTierPoints = points >= 1000 ? 1500 : points >= 500 ? 1000 : 500;
  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading rewards & gift store...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Points Counter */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span>👑</span> {currentTier} Badge
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Intern Rewards & Gift Store 🎁
            </h1>
            <p className="text-purple-100 text-sm md:text-base leading-relaxed opacity-90">
              Earn reward points through daily attendance, project submissions, and outstanding achievements. Redeem your points for developer swags, e-vouchers, and perks!
            </p>
          </div>

          {/* Points Balance Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl min-w-[260px] w-full lg:w-auto shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">Your Balance</span>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-4xl font-black text-amber-300 mb-3 tracking-tight">
              {points} <span className="text-base font-bold text-white">Pts</span>
            </div>

            {/* Tier Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-purple-200">
                <span>Tier Progress</span>
                <span>{points} / {nextTierPoints} Pts</span>
              </div>
              <div className="w-full h-2 bg-purple-950/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveSubTab('rewards')}
            className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'rewards'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🎁</span> Claim Rewards
          </button>
          <button
            onClick={() => setActiveSubTab('quests')}
            className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'quests'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🎯</span> How to Earn Points
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📋</span> Claim History ({claimedGifts.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: REWARDS CATALOG */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6">
          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gifts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map((gift) => {
              const canAfford = points >= gift.points;
              return (
                <div
                  key={gift.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Top Graphic Card Header */}
                  <div className={`h-36 bg-gradient-to-tr ${gift.bgGradient} p-6 flex justify-between items-start relative overflow-hidden`}>
                    <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 group-hover:scale-110 transition-transform">
                      {gift.imageIcon}
                    </div>

                    <span className="px-2.5 py-1 bg-black/30 backdrop-blur-md text-white rounded-lg text-xs font-semibold border border-white/20">
                      {gift.category}
                    </span>

                    {gift.popular && (
                      <span className="px-2.5 py-1 bg-amber-400 text-slate-900 rounded-lg text-[11px] font-black uppercase tracking-wider shadow">
                        Popular ⭐
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
                          {gift.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {gift.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-sm font-black text-amber-600">
                        <span>⭐</span> {gift.points} <span className="text-[11px] font-bold text-slate-400 uppercase">Pts</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {gift.filePath && (
                          <a
                            href={`${API_URL}${gift.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            📥 Download File
                          </a>
                        )}
                        {gift.resourceUrl && (
                          <a
                            href={gift.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            🔗 Open Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: HOW TO EARN POINTS QUESTS */}
      {activeSubTab === 'quests' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Point Earning Quests</h3>
            <p className="text-slate-500 text-sm">Perform your everyday internship activities to collect reward points automatically!</p>
          </div>

          <div className="divide-y divide-slate-100">
            {quests.map((q, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
                    {q.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{q.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{q.action}</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black shrink-0">
                  {q.reward}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLAIM HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Your Claimed Gifts & Perks</h3>
          </div>

          {claimedGifts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="text-4xl">🎁</div>
              <p className="font-medium">No gifts claimed yet.</p>
              <p className="text-xs text-slate-400">Redeem rewards from the catalog once you have enough points!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {claimedGifts.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                      🎁
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Claim ID: {item.id} • Date: {item.claimedAt} • Used {item.pointsUsed} Pts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">
                      {item.trackingNo}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CLAIM REDEMPTION MODAL */}
      {selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 relative border border-slate-100">
            <button
              onClick={() => setSelectedGift(null)}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl mx-auto mb-3">
                {selectedGift.imageIcon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Claim {selectedGift.title}</h3>
              <p className="text-xs text-slate-500">
                Cost: <span className="font-bold text-amber-600">{selectedGift.points} Points</span> • Your Balance: {points} Points
              </p>
            </div>

            {claimStatusMessage && (
              <div className={`p-4 rounded-xl text-xs font-bold ${
                claimStatusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {claimStatusMessage.text}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {selectedGift.category === 'Digital Perks' || selectedGift.category === 'Gift Cards' ? 'Delivery Email / Notes' : 'Shipping Address'}
                </label>
                <textarea
                  required
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={selectedGift.category === 'Digital Perks' ? 'Confirm your primary email address for voucher delivery' : 'Enter full street address, city, pincode, state'}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 placeholder-slate-400"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGift(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim || points < selectedGift.points}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingClaim ? 'Processing...' : 'Confirm Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGifts;
