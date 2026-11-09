import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, onReset, totalMatches }) {
  const municipalities = [
    'Toronto', 'Vaughan', 'Brampton', 'Mississauga', 'Markham',
    'Richmond Hill', 'Whitby', 'Oakville', 'Burlington', 'Oshawa', 'Newmarket'
  ];

  const nights = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const levels = [
    { label: 'Tier 1 — Elite / Former Junior', val: 'Tier 1' },
    { label: 'Tier 2 — Advanced Amateur', val: 'Tier 2' },
    { label: 'Tier 3 — Competitive Rec', val: 'Tier 3' },
    { label: 'Tier 4 — Recreational', val: 'Tier 4' },
    { label: 'Masters (35+ / 40+ / Oldtimers)', val: 'Masters' }
  ];

  function toggleCity(city) {
    const current = filters.city ? filters.city.split(',').map(c => c.trim()).filter(Boolean) : [];
    let updated;
    if (current.includes(city)) {
      updated = current.filter(c => c !== city);
    } else {
      updated = [...current, city];
    }
    setFilters({ ...filters, city: updated.join(',') });
  }

  function hasActiveFilters() {
    return !!(filters.q || filters.city || filters.night || filters.level || filters.reg || filters.sport);
  }

  return (
    <aside className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filter Leagues</h3>
        </div>

        {hasActiveFilters() && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Results Count Banner */}
      <div className="bg-blue-50 text-blue-900 text-xs px-3 py-2 rounded-lg font-medium flex items-center justify-between">
        <span>Matching Listings:</span>
        <span className="font-bold text-sm">{totalMatches}</span>
      </div>

      {/* Sport Category Switcher */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sport Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFilters({ ...filters, sport: filters.sport === 'ice_hockey' ? '' : 'ice_hockey' })}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
              filters.sport === 'ice_hockey'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Ice Hockey
          </button>
          <button
            onClick={() => setFilters({ ...filters, sport: filters.sport === 'ball_hockey' ? '' : 'ball_hockey' })}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
              filters.sport === 'ball_hockey'
                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Ball Hockey
          </button>
        </div>
      </div>

      {/* Municipality / Area */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          GTA Municipality
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {municipalities.map((city) => {
            const activeCities = filters.city ? filters.city.split(',').map(c => c.trim()) : [];
            const isChecked = activeCities.includes(city);
            return (
              <label
                key={city}
                className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none py-0.5"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCity(city)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className={isChecked ? 'font-semibold text-blue-900' : ''}>{city}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Playing Nights */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Playing Night
        </label>
        <div className="flex flex-wrap gap-1.5">
          {nights.map((n) => {
            const isSelected = filters.night === n;
            return (
              <button
                key={n}
                onClick={() => setFilters({ ...filters, night: isSelected ? '' : n })}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {n.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill / Division Level */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Skill Tier
        </label>
        <div className="space-y-1 text-xs">
          {levels.map((lvl) => {
            const isSelected = filters.level === lvl.val;
            return (
              <button
                key={lvl.val}
                onClick={() => setFilters({ ...filters, level: isSelected ? '' : lvl.val })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{lvl.label}</span>
                {isSelected && <span className="text-blue-600 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Registration Mode */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Registration Format
        </label>
        <div className="space-y-1 text-xs">
          {[
            { label: 'All Formats', val: '' },
            { label: 'Individual Free Agents Welcome', val: 'Individual' },
            { label: 'Full Team Entry', val: 'Team only' }
          ].map((mode) => (
            <button
              key={mode.val}
              onClick={() => setFilters({ ...filters, reg: mode.val })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                filters.reg === mode.val
                  ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
