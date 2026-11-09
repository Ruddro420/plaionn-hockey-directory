import React, { useState } from 'react';
import { Trophy, Shield, CheckCircle2, AlertCircle, ArrowRight, Calendar, Users, Award, HelpCircle } from 'lucide-react';

export default function ChampionsLeaguePage({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Captain',
    city: 'Toronto',
    team_name: '',
    home_league: '',
    division: "Men's Open Tier 3 Competitive",
    marketing_consent: false,
    additional_notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  const tiers = [
    { tier: 'Tier 1 — Elite', desc: 'Highest-level adult hockey; former professionals permitted under published rules.', badge: 'Elite' },
    { tier: 'Tier 2 — Advanced', desc: 'Strong amateur teams, junior or university collegiate experience.', badge: 'Advanced' },
    { tier: 'Tier 3 — Competitive', desc: 'Experienced, highly capable recreational teams. Main launch priority.', badge: 'Launch Priority' },
    { tier: 'Tier 4 — Recreational', desc: 'Lower-intensity, clean recreational hockey. Main launch priority.', badge: 'Launch Priority' },
    { tier: 'Tier 5 — Development', desc: 'Predominantly newer adult players and beginners.', badge: 'Development' }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interest_type: 'champions_league',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          city: formData.city,
          team_name: formData.team_name,
          home_league: formData.home_league,
          division: formData.division,
          marketing_consent: formData.marketing_consent,
          additional_notes: formData.additional_notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit interest');

      setReceipt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#12202B] via-[#162736] to-[#12202B] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Plaionn Competition System • Greater Toronto</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Keep your team. Represent your league. <br className="hidden sm:inline" />
            <span className="text-amber-400">Compete for something bigger.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            The Plaionn Champions League and Challengers Cup connect adult recreational hockey champions across Greater Toronto.
            Earn your invitation through regular-season standings or playoff titles in your home league.
          </p>

          <div className="pt-2">
            <a
              href="#interest-form"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-colors"
            >
              <span>Register Team Interest</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Two Competitions Explained */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Champions League */}
          <div className="bg-white rounded-2xl border-2 border-amber-400/60 p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                Title Championship
              </span>
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Plaionn Champions League
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exclusively for division winners. Regular season 1st place finishers OR playoff champions earn automatic invitations.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Qualification Rule:</h4>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li>• Regular-season 1st place in any division</li>
                <li>• OR division playoff champion</li>
                <li>• Either achievement qualifies independently</li>
                <li>• Double champions (1st + playoffs) receive one invitation; no automatic pass-down</li>
              </ul>
            </div>
          </div>

          {/* Challengers Cup */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full">
                Second Competition
              </span>
              <Shield className="w-6 h-6 text-sky-600" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Plaionn Challengers Cup
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              "Your season isn't over. Take on the best of the rest." Contested by top-half regular-season non-champions.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Qualification Rule:</h4>
              <ul className="space-y-1.5 text-slate-600 text-[11px]">
                <li>• Finish 2nd through floor(division teams ÷ 2)</li>
                <li>• Excludes regular-season 1st place and playoff champion</li>
                <li>• For an 8-team division: 2nd, 3rd, and 4th place qualify</li>
                <li>• Gives competitive contenders their own dedicated championship trophy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Independent Skill Tiers Framework */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Cross-League Classification & 5 Skill Tiers
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Local division letters (A, B, C, D) are not directly comparable across different rinks. A team in one league's C division may play at another's B standard.
            Teams earn entry through results; our convenor committee confirms an independently reviewed competition tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {tiers.map((t, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-700">{t.tier.split('—')[0]}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">{t.badge}</span>
              </div>
              <div className="font-bold text-slate-800 text-xs">{t.tier.split('—')[1]}</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tournament Format & Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12202B] text-white rounded-2xl p-6 sm:p-10 border border-slate-800 space-y-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Competition Structure</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Season-Long Knockout Ties Leading to the Final Eight
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Knockout ties take place alongside your normal domestic league season. Win and advance; lose and exit. Surviving teams meet at a centralized year-end championship weekend.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <div className="text-amber-400 font-bold text-sm">Round 1 (64 Teams)</div>
              <p className="text-slate-400 text-[11px]">Geographic brackets within GTA to keep travel manageable. 32 winners advance.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <div className="text-amber-400 font-bold text-sm">Round 2 (32 Teams)</div>
              <p className="text-slate-400 text-[11px]">Inter-zone knockout ties scheduled within 4-6 week round windows.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <div className="text-amber-400 font-bold text-sm">Round 3 (16 Teams)</div>
              <p className="text-slate-400 text-[11px]">Decisive qualifying round. 8 winners secure berths in the Final Eight.</p>
            </div>
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 space-y-1">
              <div className="text-amber-300 font-bold text-sm">Centralized Final Eight</div>
              <p className="text-slate-300 text-[11px]">Quarterfinals, Semifinals, and Grand Final at premier GTA arena (The Sports Village).</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold text-white">Roster Continuity Guarantee:</span>
              <p className="text-[11px] text-slate-300">
                To preserve integrity, at least 80% of tournament rosters must come from your home league roster, and returning players must have played in at least 40% of regular-season games. Maximum 3 approved additions permitted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interest Submission Form */}
      <section id="interest-form" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Interest Form</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Register Champions League Interest
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Let us know your team's division and home league. We will contact you with qualifying timelines and bracket announcements.
            </p>
          </div>

          {receipt ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Interest Receipt Confirmed</h3>
              <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto">
                {receipt.message}
              </p>
              <div className="bg-white border border-emerald-200 rounded-lg p-2 text-xs font-mono text-slate-700 inline-block">
                Submission ID: {receipt.submission_id}
              </div>
              <p className="text-[11px] text-slate-500">
                Please check your email to verify your address. Interest registration does not guarantee division qualification.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
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
                    placeholder="e.g. Connor McDavid"
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
                    placeholder="captain@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option>Team Captain / GM</option>
                    <option>Player</option>
                    <option>League Convenor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Municipality *</label>
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
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team Name (if captain)</label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    placeholder="e.g. Toronto Beavers"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Home League</label>
                  <input
                    type="text"
                    value={formData.home_league}
                    onChange={(e) => setFormData({ ...formData, home_league: e.target.value })}
                    placeholder="e.g. True North, Sports Village, ASHL York"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Competition Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option>Men's Open Tier 3 Competitive</option>
                    <option>Men's Open Tier 4 Recreational</option>
                    <option>Men's Open Tier 2 Advanced</option>
                    <option>Men's Open Tier 1 Elite</option>
                    <option>Men's 40+ Masters</option>
                    <option>Men's U25</option>
                    <option>Women's Open</option>
                  </select>
                </div>
              </div>

              {/* Acceptance A10: Marketing Opt-in Unchecked by Default */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 text-[11px] leading-tight">
                    (Optional) I consent to receive tournament updates and early-bird notifications from Plaionn Sports Group.
                    You can unsubscribe at any time. A service receipt is sent regardless of this selection.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1463DF] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  <span>{submitting ? 'Recording Interest...' : 'Submit Interest Registration'}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                * Note: Interest registration does not guarantee entry. Qualification and tier placement will be verified against official league standings.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
