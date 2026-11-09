import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import LeagueCard from '../components/LeagueCard';
import FilterSidebar from '../components/FilterSidebar';

export default function LeagueFinderPage({ navigate, onExternalClick, initialQuery }) {
  const [leagues, setLeagues] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      city: params.get('city') || '',
      category: params.get('category') || '',
      night: params.get('night') || '',
      level: params.get('level') || '',
      reg: params.get('reg') || '',
      sport: params.get('sport') || '',
      sort: params.get('sort') || 'relevance'
    };
  });

  // Sync state to URL and fetch leagues
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.city) params.set('city', filters.city);
    if (filters.category) params.set('category', filters.category);
    if (filters.night) params.set('night', filters.night);
    if (filters.level) params.set('level', filters.level);
    if (filters.reg) params.set('reg', filters.reg);
    if (filters.sport) params.set('sport', filters.sport);
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);

    const queryString = params.toString();
    const newRelativePathQuery = window.location.pathname + (queryString ? `?${queryString}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);

    async function fetchLeagues() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leagues?${queryString}`);
        const data = await res.json();
        setLeagues(data.data || []);
        setTotalMatches(data.pagination?.total || 0);
      } catch (err) {
        console.error('Error fetching leagues:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, [filters]);

  function handleResetFilters() {
    setFilters({
      q: '',
      city: '',
      category: '',
      night: '',
      level: '',
      reg: '',
      sport: '',
      sort: 'relevance'
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Adult Hockey League Finder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified adult recreational, commercial, and oldtimers leagues across the Greater Toronto Area.
          </p>
        </div>

        {/* Top Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex-1 flex items-center px-3 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-colors">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Search by league name, arena name, or municipal alias..."
              className="w-full text-xs sm:text-sm px-2.5 py-2 bg-transparent focus:outline-none"
            />
            {filters.q && (
              <button
                onClick={() => setFilters({ ...filters, q: '' })}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters ({totalMatches})</span>
            </button>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="name">Sort: League Name (A-Z)</option>
              <option value="city">Sort: Municipality</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Filter Sidebar + Leagues List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
            totalMatches={totalMatches}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 p-4 flex justify-end">
            <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Filter Leagues</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs text-slate-500 font-bold p-1"
                >
                  ✕ Close
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                totalMatches={totalMatches}
              />
              <div className="pt-4">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg text-xs"
                >
                  Apply Filters ({totalMatches} Results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listings Result Column */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl h-64 border border-slate-200"></div>
              ))}
            </div>
          ) : leagues.length === 0 ? (
            // Acceptance A02: Empty state with clear filters and unmet demand form
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No leagues matched your active filters</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                We did not find any published leagues for the current criteria. We never fabricate missing leagues.
                You can clear your filters or register unmet local demand for your municipality.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
                <button
                  onClick={() => navigate(`/request-a-league?q=${encodeURIComponent(filters.q || '')}&city=${encodeURIComponent(filters.city || '')}`)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Request a League Here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
