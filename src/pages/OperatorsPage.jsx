import React from 'react';
import { Building, ShieldCheck, Trophy, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OperatorsPage({ navigate, onOpenCorrection }) {
  const benefits = [
    {
      title: 'Free Listing & Referral Traffic',
      desc: 'Get your adult hockey league in front of thousands of active GTA players and captains seeking team slots and individual registration.',
      icon: Users
    },
    {
      title: 'Champions League Partnership',
      desc: 'Offer your division champions something bigger to contest. First-place regular season teams and playoff champions represent your league.',
      icon: Trophy
    },
    {
      title: 'Full Brand Independence',
      desc: 'You keep complete control over your registration fees, schedules, rules, and ice allocation. Plaionn operates as a transparent discovery hub.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero */}
      <div className="bg-[#12202B] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
          <Building className="w-3.5 h-3.5" />
          <span>For Adult League Convenors & Arena Operators</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Keep your league. <br />
          <span className="text-blue-400">Give your teams more to play for.</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Plaionn Hockey Directory exists to strengthen the adult hockey ecosystem in Greater Toronto.
          We partner with independent league operators to fill team rosters, attract free agents, and celebrate division champions.
        </p>

        <div className="pt-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/listing-request')}
            className="bg-[#1463DF] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <span>Submit or Claim Your League Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((b, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <b.icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{b.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Verification & Claiming Standards */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs">
        <h2 className="text-base font-bold text-slate-900">
          Our Directory & Verification Standards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800">Operator Confirmed Badge</h4>
            <p className="text-[11px]">
              When an authorized league convenor confirms current schedule details and official registration links, the listing receives an "Operator Confirmed" badge with priority ranking.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800">Freshness & Accurate Data</h4>
            <p className="text-[11px]">
              We flag listings requiring seasonal schedule updates after 90 days. We never fabricate missing fees or open spots; your official website is always the authoritative source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
