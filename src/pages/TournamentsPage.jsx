import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, DollarSign, Award, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TournamentsPage({ navigate, onExternalClick }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventForInterest, setSelectedEventForInterest] = useState(null);
  const [interestEmail, setInterestEmail] = useState('');
  const [interestName, setInterestName] = useState('');
  const [interestTeam, setInterestTeam] = useState('');
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [interestReceipt, setInterestReceipt] = useState(null);
  const [interestError, setInterestError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data.data || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  async function handleInterestSubmit(e) {
    e.preventDefault();
    setSubmittingInterest(true);
    setInterestError(null);

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interest_type: 'tournament',
          event_id: selectedEventForInterest.id,
          email: interestEmail,
          name: interestName,
          team_name: interestTeam,
          city: selectedEventForInterest.city
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit event interest');

      setInterestReceipt(data);
    } catch (err) {
      setInterestError(err.message);
    } finally {
      setSubmittingInterest(false);
    }
  }

  const stateBadges = {
    'registration-open': { label: 'Registration Open', bg: 'bg-emerald-100 text-emerald-800' },
    'interest-only': { label: 'Interest Only / TBA', bg: 'bg-amber-100 text-amber-800' },
    'full': { label: 'Sold Out / Full', bg: 'bg-slate-200 text-slate-800' },
    'completed': { label: 'Completed', bg: 'bg-slate-100 text-slate-600' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Adult Hockey Tournaments & Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Published weekend invitationals, showcase cups, and Plaionn Champions League qualification tournaments across the GTA.
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-64 border border-slate-200"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Trophy className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Upcoming Tournaments Published</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            New tournaments are scheduled seasonally. Register your interest for first access to registrations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => {
            const badge = stateBadges[evt.lifecycle_state] || { label: evt.lifecycle_state, bg: 'bg-slate-100 text-slate-700' };
            const isInterestOnly = evt.lifecycle_state === 'interest-only';

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${badge.bg}`}>
                      {badge.label}
                    </span>

                    <span className="text-xs font-bold text-slate-800">
                      {evt.price_amount ? `$${evt.price_amount.toLocaleString()} ${evt.price_currency || 'CAD'} (${evt.price_unit})` : 'TBA'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.start_date ? new Date(evt.start_date).toLocaleDateString() : 'Dates TBA'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.location_name || evt.city}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.divisions || 'Recreational Divisions'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.guaranteed_games ? `${evt.guaranteed_games} Games Guaranteed` : 'Format TBA'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {evt.registration_url && !isInterestOnly ? (
                    <button
                      onClick={() => onExternalClick(evt.registration_url, evt.title)}
                      className="bg-[#1463DF] hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5"
                    >
                      <span>Register on Official Site</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedEventForInterest(evt);
                        setInterestReceipt(null);
                        setInterestError(null);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow transition-colors"
                    >
                      Register Event Interest
                    </button>
                  )}

                  <span className="text-[11px] text-slate-400">
                    Deadline: {evt.registration_deadline ? new Date(evt.registration_deadline).toLocaleDateString() : 'TBA'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Interest Modal */}
      {selectedEventForInterest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedEventForInterest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>

            {interestReceipt ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Interest Recorded</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {interestReceipt.message}
                </p>
                <button
                  onClick={() => setSelectedEventForInterest(null)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleInterestSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Register Tournament Interest
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {selectedEventForInterest.title}
                  </p>
                </div>

                {interestError && (
                  <div className="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-200">
                    {interestError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={interestName}
                    onChange={(e) => setInterestName(e.target.value)}
                    placeholder="e.g. Wayne Gretzky"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={interestEmail}
                    onChange={(e) => setInterestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team Name (if captain)</label>
                  <input
                    type="text"
                    value={interestTeam}
                    onChange={(e) => setInterestTeam(e.target.value)}
                    placeholder="e.g. North York Knights"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForInterest(null)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInterest}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingInterest ? 'Submitting...' : 'Submit Interest'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
