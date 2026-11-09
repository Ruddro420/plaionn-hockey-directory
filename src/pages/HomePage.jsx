import React, { useState, useEffect } from 'react';
import { Search, Trophy, Users, Shield, ArrowRight, MapPin, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import LeagueCard from '../components/LeagueCard';

export default function HomePage({ navigate, onExternalClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [featuredLeagues, setFeaturedLeagues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const popularCities = ['Toronto', 'Vaughan', 'Mississauga', 'Brampton', 'Markham', 'Whitby', 'Oakville'];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [leaguesRes, tournamentsRes] = await Promise.all([
          fetch('/api/leagues?limit=6&sort=relevance'),
          fetch('/api/events?limit=3')
        ]);
        const leaguesData = await leaguesRes.json();
        const tournamentsData = await tournamentsRes.json();

        setFeaturedLeagues(leaguesData.data || []);
        setTournaments(tournamentsData.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity) params.set('city', selectedCity);
    navigate(`/leagues?${params.toString()}`);
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#12202B] via-[#162736] to-[#12202B] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle ice background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#1463DF_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Greater Toronto Area • Verified Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your next great season <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              starts right here.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Find adult hockey leagues, join an approved team, and discover upcoming tournaments near you across the GTA.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5 text-slate-900 border border-slate-200"
          >
            <div className="flex-1 flex items-center px-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search league name, arena, or keyword..."
                className="w-full text-xs sm:text-sm px-2 py-2.5 bg-transparent focus:outline-none"
              />
            </div>

            <div className="sm:w-44 flex items-center px-3 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs sm:text-sm py-2.5 bg-transparent focus:outline-none text-slate-700"
              >
                <option value="">All GTA Cities</option>
                {popularCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#1463DF] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Find a League</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-300">
            <span className="text-slate-400">Quick Links:</span>
            <button
              onClick={() => navigate('/captains')}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Register Your Team
            </button>
            <button
              onClick={() => navigate('/tournaments')}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Explore Tournaments
            </button>
            <button
              onClick={() => navigate('/champions-league')}
              className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/40 transition-colors font-medium"
            >
              Champions League Info
            </button>
          </div>
        </div>
      </section>

      {/* Popular GTA Municipalities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curated City Hubs</h2>
            <p className="text-xs text-slate-500">Explore local adult hockey ecosystems by municipality</p>
          </div>
          <button
            onClick={() => navigate('/leagues')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All GTA Leagues</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {popularCities.map((city) => (
            <button
              key={city}
              onClick={() => navigate(`/locations/on/${city.toLowerCase()}`)}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">{city}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Explore guide →</div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured GTA Leagues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Featured Adult Hockey Leagues</h2>
            <p className="text-xs text-slate-500">Verified adult programmes operating across Toronto and York/Peel regions</p>
          </div>
          <button
            onClick={() => navigate('/leagues')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Browse All (79)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl h-64 border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onSelect={(slug) => navigate(`/leagues/${slug}`)}
                onExternalClick={onExternalClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Plaionn Champions League Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#12202B] via-[#1a334d] to-[#12202B] rounded-2xl p-6 sm:p-10 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Champions League & Challengers Cup</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Win your league. <br className="hidden sm:inline" />
              Take on the city.
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              A planned competition connecting adult hockey champions across independent leagues in the Greater Toronto Area.
              Qualify through regular season 1st place or playoff championships. Contested across 5 reviewed skill tiers with season-long ties culminating in a centralized Final Eight.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('/champions-league')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Read Format & Register Interest</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Qualification Rule Box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-xs text-slate-300 w-full lg:w-80 shrink-0 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              How Teams Qualify
            </h4>
            <div className="space-y-2 text-[11px] leading-relaxed">
              <p><strong className="text-amber-300">Champions League:</strong> 1st place regular season OR playoff champion from any GTA division.</p>
              <p><strong className="text-sky-300">Challengers Cup:</strong> Teams finishing 2nd through top half of regular season.</p>
              <p className="text-slate-400 text-[10px] pt-1 border-t border-white/10">
                Placement is reviewed against independent skill tiers. Interest does not promise entry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Captain's Club Value Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Captain's Club</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Less organizing. More hockey.
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We know what it takes to run an adult recreational team — chasing payments, booking spares, and hunting for tournament entries.
              The Captain's Club is our interest programme connecting GTA captains with vetted competitions, verified rosters, and early Champions League access.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Submit your team to build an approved public team identity</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Priority invitations to Plaionn-sanctioned events and cups</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Zero spam: Contact details strictly private; email verification required</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => navigate('/captains')}
                className="bg-[#1463DF] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <span>Register Your Team Interest</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Approved Public Team Directory</h3>
            <p className="text-xs text-slate-500">
              Approved teams showcase their squad identity, home league affiliation, and competitive tier without exposing player names or personal phone numbers.
            </p>
            <div className="space-y-2.5">
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Toronto Maple Beers</div>
                  <div className="text-[11px] text-slate-400">Home: True North Hockey Canada</div>
                </div>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">Tier 3 Rec</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">Vaughan Vipers HC</div>
                  <div className="text-[11px] text-slate-400">Home: Sports Village Hockey League</div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold">Tier 2 Adv</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/teams')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 block text-right w-full"
            >
              Browse all approved teams →
            </button>
          </div>
        </div>
      </section>

      {/* For League Operators Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#12202B] text-white rounded-2xl p-6 sm:p-10 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">For League Operators</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Keep your league. Give your teams more to play for.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We do not compete with independent league convenors. Plaionn provides free discovery, recruitment referral traffic, and a championship pathway that gives your division winners something bigger to contest at season's end.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/operators')}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              Operator Proposition
            </button>
            <button
              onClick={() => navigate('/listing-request')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              Claim or Submit a Listing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
