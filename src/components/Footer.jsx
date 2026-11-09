import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-[#12202B] text-slate-400 border-t border-slate-800 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏒</span>
              <span className="font-extrabold text-white tracking-tight">PLAIONN HOCKEY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Greater Toronto's independent discovery directory for adult ice hockey leagues, recreational teams, and tournament competitions.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Launch region: Greater Toronto Area (ON)
            </div>
          </div>

          {/* Player & Captain Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Directory & Play</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/leagues')} className="hover:text-white transition-colors">
                  Find a League (GTA)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/teams')} className="hover:text-white transition-colors">
                  Approved Teams Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/captains')} className="hover:text-white transition-colors">
                  Captain's Club & Team Submission
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tournaments')} className="hover:text-white transition-colors">
                  Upcoming Tournaments
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/champions-league')} className="hover:text-white transition-colors">
                  Plaionn Champions League Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/request-a-league')} className="hover:text-white transition-colors">
                  Request a League (Unmet Demand)
                </button>
              </li>
            </ul>
          </div>

          {/* Curated City Guides */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">GTA Communities</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/locations/on/toronto')} className="hover:text-white transition-colors">
                  Toronto Adult Hockey
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/locations/on/vaughan')} className="hover:text-white transition-colors">
                  Vaughan / Sports Village
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/locations/on/mississauga')} className="hover:text-white transition-colors">
                  Mississauga & CMAHL
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/locations/on/brampton')} className="hover:text-white transition-colors">
                  Brampton / CAA Centre
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/locations/on/whitby')} className="hover:text-white transition-colors">
                  Whitby & Iroquois Park
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/locations/on/markham')} className="hover:text-white transition-colors">
                  Markham & Richmond Hill
                </button>
              </li>
            </ul>
          </div>

          {/* Operators & Governance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Operators & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/operators')} className="hover:text-white transition-colors">
                  For League Operators
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/listing-request')} className="hover:text-white transition-colors">
                  Submit or Claim Listing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy (CASL Compliance)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service & Disclaimers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
                  Support & Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ownership Disclosure & Acceptance Note */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © 2026 Plaionn Sports Group. All rights reserved. Plaionn-operated competitions are transparently identified.
            Independent third-party leagues maintain their own registrations and governance.
          </p>
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Verified GTA Directory v1.0</span>
            <span>•</span>
            <button onClick={() => navigate('/admin')} className="text-blue-400 hover:underline">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
