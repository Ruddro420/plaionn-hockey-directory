import React, { useState, useEffect } from 'react';
import { Users, MapPin, Award, PlusCircle, ArrowRight } from 'lucide-react';

export default function TeamsDirectoryPage({ navigate }) {
  const [teams, setTeams] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      try {
        const url = selectedCity ? `/api/teams?city=${encodeURIComponent(selectedCity)}` : '/api/teams';
        const res = await fetch(url);
        const data = await res.json();
        setTeams(data.data || []);
      } catch (err) {
        console.error('Failed to load teams:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Approved Teams Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified team profiles representing adult hockey squads across the Greater Toronto Area.
          </p>
        </div>

        <button
          onClick={() => navigate('/captains')}
          className="bg-[#1463DF] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Your Team</span>
        </button>
      </div>

      {/* Filter by City */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-slate-400 font-medium">Filter City:</span>
        {['', 'Toronto', 'Vaughan', 'Mississauga', 'Oakville', 'Markham'].map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              selectedCity === city
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {city || 'All Cities'}
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl h-44 border border-slate-200"></div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No approved teams found in this city</h3>
          <p className="text-xs text-slate-500">
            Be the first captain to register your squad in this region!
          </p>
          <div>
            <button
              onClick={() => navigate('/captains')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Submit your team here →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => navigate(`/teams/${team.slug}`)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    🏒
                  </div>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {team.division_label || 'Recreational'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{team.city}, ON</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 pt-1">
                  <span className="text-slate-400 block text-[10px]">Affiliated Home League:</span>
                  <span className="font-medium text-slate-800">{team.home_league_name || 'Independent Squad'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-800">
                <span>View Public Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
