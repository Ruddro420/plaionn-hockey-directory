import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, Send, MapPin, Calendar } from 'lucide-react';

export default function RequestALeaguePage({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Toronto',
    registration_mode: 'individual',
    preferred_nights: ['Monday'],
    skill_description: 'Recreational intermediate',
    roster_size_estimate: 1,
    additional_notes: '',
    marketing_consent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  const nights = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function toggleNight(n) {
    if (formData.preferred_nights.includes(n)) {
      setFormData({
        ...formData,
        preferred_nights: formData.preferred_nights.filter((x) => x !== n)
      });
    } else {
      setFormData({
        ...formData,
        preferred_nights: [...formData.preferred_nights, n]
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interest_type: 'request_a_league',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          registration_mode: formData.registration_mode,
          preferred_nights: formData.preferred_nights,
          skill_description: formData.skill_description,
          roster_size_estimate: formData.roster_size_estimate,
          marketing_consent: formData.marketing_consent,
          additional_notes: formData.additional_notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit demand request');

      setReceipt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Capture Unmet Demand</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Can't find the right league? Request it.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Tell us where and when you want to play. We aggregate player demand to connect you with nearby teams or work with local rink convenors to launch new divisions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {receipt ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">Demand Record Verified</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {receipt.message}
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-700 inline-block">
              Demand Reference ID: {receipt.submission_id}
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/leagues')}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Back to League Finder
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mitch Marner"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="player@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred City / Region *</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option>Toronto (Downtown/Midtown)</option>
                  <option>Etobicoke</option>
                  <option>North York</option>
                  <option>Scarborough</option>
                  <option>Vaughan / Woodbridge</option>
                  <option>Mississauga</option>
                  <option>Brampton</option>
                  <option>Markham / Unionville</option>
                  <option>Richmond Hill</option>
                  <option>Whitby / Oshawa</option>
                  <option>Oakville / Burlington</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Looking as *</label>
                <select
                  value={formData.registration_mode}
                  onChange={(e) => setFormData({ ...formData, registration_mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="individual">Individual Free Agent (Need a team)</option>
                  <option value="team">Full Team (Need league / ice times)</option>
                  <option value="small_group">Small Group of 2-4 Friends</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Preferred Playing Nights (Select all that work)</label>
              <div className="flex flex-wrap gap-1.5">
                {nights.map((n) => {
                  const active = formData.preferred_nights.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNight(n)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Skill Level / Experience *</label>
              <input
                type="text"
                required
                value={formData.skill_description}
                onChange={(e) => setFormData({ ...formData, skill_description: e.target.value })}
                placeholder="e.g. Played minor hockey B/C, casual beer league 5 years, good skater"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Additional Preferences or Rink Requests</label>
              <textarea
                rows={2}
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                placeholder="e.g. Prefer rinks near subway, prefer games starting before 10:30 PM..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.marketing_consent}
                  onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600 text-[11px] leading-tight">
                  (Optional) Send me alerts when new leagues or free-agent drafts launch in my municipality.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1463DF] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Demand...' : 'Submit League Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
