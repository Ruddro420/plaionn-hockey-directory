import React, { useState } from 'react';
import { Menu, X, Shield, Search, Trophy, Users, Building, HelpCircle } from 'lucide-react';

export default function Navbar({ currentPath, navigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Find a League', path: '/leagues', icon: Search },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Tournaments', path: '/tournaments', icon: Trophy },
    { label: 'Champions League', path: '/champions-league', badge: 'New', icon: Shield },
    { label: "Captain's Club", path: '/captains', icon: Users },
    { label: 'For Operators', path: '/operators', icon: Building }
  ];

  function handleNavigate(path) {
    navigate(path);
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-[#12202B] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigate('/')}>
            <div className="w-10 h-10 rounded-lg bg-[#1463DF] flex items-center justify-center font-bold text-xl tracking-wider text-white shadow-inner">
              🏒
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight flex items-center gap-1.5 text-white">
                PLAIONN <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">HOCKEY</span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-1 hidden sm:block">Greater Toronto Adult Directory</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const active = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Header Action & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavigate('/admin')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors hidden sm:block"
              title="Editorial & Moderation Console"
            >
              Admin Portal
            </button>

            <button
              onClick={() => handleNavigate('/leagues')}
              className="bg-[#1463DF] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-md shadow transition-colors flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Leagues</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12202B] border-b border-slate-800 px-4 pt-2 pb-5 space-y-1 shadow-xl">
          {navLinks.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-base font-medium flex items-center justify-between ${
                currentPath === item.path
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-slate-400" />
                {item.label}
              </span>
              {item.badge && (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded uppercase">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => handleNavigate('/request-a-league')}
              className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white"
            >
              Unmet Local Demand? Request a League
            </button>
            <button
              onClick={() => handleNavigate('/admin')}
              className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white"
            >
              Editorial Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
