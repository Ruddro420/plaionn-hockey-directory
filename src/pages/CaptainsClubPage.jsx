import React, { useState } from 'react';
import { Users, CheckCircle2, Shield, AlertCircle, ArrowRight, Award } from 'lucide-react';

export default function CaptainsClubPage({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    team_name: '',
    city: 'Toronto',
    home_league: '',
    division: 'Tier 3 Competitive',
    roster_size_estimate: 15,
    preferred_events: 'Tournaments & Champions League',
    marketing_consent: false,
    additional_notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interest_type: 'captain_team',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'captain',
          city: formData.city,
          team_name: formData.team_name,
          home_league: formData.home_league,
          division: formData.division,
          roster_size_estimate: formData.roster_size_estimate,
          marketing_consent: formData.marketing_consent,
          additional_notes: formData.additional_notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit team profile');

      setReceipt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
          <Users className="w-3.5 h-3.5" />
          <span>Captain's Club (Phase 1 Interest)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Less organizing. More hockey.
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Submit your squad to establish an approved public team identity. Captain contact details remain strictly private; once reviewed, your team is listed in the verified GTA directory.
        </p>
      </div>

      {/* Main Grid: Form + Privacy Assurance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {receipt ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Team Submission Received</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {receipt.message}
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-700 inline-block">
                Reference ID: {receipt.submission_id}
              </div>
              <p className="text-[11px] text-slate-400">
                An editorial moderator will check your consent before creating your public team identity.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/teams')}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  View Approved Teams Directory
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Register Your Team
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Captain Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sidney Crosby"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Captain Email (Private) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="captain@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team Name (Public) *</label>
                  <input
                    type="text"
                    required
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    placeholder="e.g. Toronto Maple Beers"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Home City / Municipality *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option>Toronto</option>
                    <option>Vaughan</option>
                    <option>Mississauga</option>
                    <option>Brampton</option>
                    <option>Markham</option>
                    <option>Richmond Hill</option>
                    <option>Whitby</option>
                    <option>Oakville</option>
                    <option>Burlington</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current League or Independent</label>
                  <input
                    type="text"
                    value={formData.home_league}
                    onChange={(e) => setFormData({ ...formData, home_league: e.target.value })}
                    placeholder="e.g. Sports Village, True North, Independent"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Division / Tier</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option>Tier 3 Competitive</option>
                    <option>Tier 4 Recreational</option>
                    <option>Tier 2 Advanced</option>
                    <option>Tier 1 Elite</option>
                    <option>Masters 35+ / 40+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Active Roster Size</label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={formData.roster_size_estimate}
                  onChange={(e) => setFormData({ ...formData, roster_size_estimate: e.target.value })}
                  className="w-full sm:w-32 px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Marketing Opt-in Unchecked */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 text-[11px] leading-tight">
                    (Optional) I consent to receive tournament announcements and sparring invitations from other GTA captains.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1463DF] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting Team...' : 'Submit Team Profile for Approval'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Privacy Guarantee */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Strict Privacy Controls</span>
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              In accordance with Section 5 of the Product & Engineering specification:
            </p>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li>• Captain email and phone are NEVER published in the public directory.</li>
              <li>• Player rosters and personal member names are not requested in Phase 1.</li>
              <li>• Only approved public fields (team name, city, division, home league) are displayed.</li>
            </ul>
          </div>

          <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-5 text-xs space-y-2">
            <h4 className="font-bold text-blue-900">Phase 2 Preview</h4>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              Phase 2 will unlock authenticated captain dashboards, free-agent recruitment postings, and direct cross-league friendly bookings once repeat captain demand is established.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
