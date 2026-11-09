import React, { useState, useEffect } from 'react';
import { MapPin, Building, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import LeagueCard from '../components/LeagueCard';

export default function CityGuidePage({ province, city, navigate, onExternalClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCityGuide() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/locations/${province}/${city}`);
        if (!res.ok) throw new Error('City guide not found.');
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCityGuide();
  }, [province, city]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-12 w-80 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">City Guide Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This municipality guide is not published yet.'}</p>
        <button
          onClick={() => navigate('/leagues')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
        >
          View All GTA Leagues
        </button>
      </div>
    );
  }

  const { meta, leagues } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/leagues')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to GTA League Finder</span>
      </button>

      {/* City Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          <MapPin className="w-3.5 h-3.5" />
          <span>{meta.region} • Ontario</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {meta.headline}
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {meta.description}
        </p>

        {/* Key Arenas */}
        {meta.arenas && meta.arenas.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Major Arenas:</span>
            {meta.arenas.map((a) => (
              <span key={a} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Leagues in this City */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Active Leagues in {meta.name} ({leagues.length})
            </h2>
            <p className="text-xs text-slate-500">Verified adult ice and ball hockey programmes operating in this area</p>
          </div>

          <button
            onClick={() => navigate(`/leagues?city=${encodeURIComponent(meta.name)}`)}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Filter by day / skill in Finder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {leagues.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No published leagues currently indexed in this city. Check nearby GTA regions.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onSelect={(slug) => navigate(`/leagues/${slug}`)}
                onExternalClick={onExternalClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
