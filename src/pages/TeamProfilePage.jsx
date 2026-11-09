import React, { useState, useEffect } from 'react';
import { Users, MapPin, Award, ChevronLeft, Shield, Calendar, Trophy } from 'lucide-react';

export default function TeamProfilePage({ slug, navigate }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teams/${slug}`);
        if (!res.ok) throw new Error('Team profile not found or pending review.');
        const data = await res.json();
        setTeam(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-44 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Team Profile Not Available</h2>
        <p className="text-xs text-slate-500">{error || 'This team profile may be pending moderation.'}</p>
        <button
          onClick={() => navigate('/teams')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
        >
          ← Back to Teams Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate('/teams')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Teams</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md">
              🏒
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1">
                <span>Verified Team Profile</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {team.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{team.city}, ON</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[11px] block">Home League Affiliation</span>
            <span className="font-bold text-slate-900 text-sm">{team.home_league_name || 'Independent'}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[11px] block">Competitive Classification</span>
            <span className="font-bold text-slate-900 text-sm">{team.division_label || 'Recreational'}</span>
          </div>
        </div>

        {/* Competition Eligibility Badge */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Plaionn Champions League Status</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Eligible to qualify for the Plaionn Champions League or Challengers Cup based on final regular-season standings or playoff championship in {team.home_league_name || 'home league'}.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          * Private team rosters and captain contact information are protected under Plaionn privacy policies and are not published publicly.
        </div>
      </div>
    </div>
  );
}
