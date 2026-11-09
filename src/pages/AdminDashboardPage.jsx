import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, AlertCircle, RefreshCw, Upload,
  Users, Building, FileSpreadsheet, Play, Check, X, Eye, EyeOff,
  Lock, LogOut, KeyRound, User, ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage({ navigate }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('plaionn_admin_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('plaionn_admin_user') || 'null');
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('plaionn_admin_token'));

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'requests', 'teams', 'import', 'tests'
  const [overview, setOverview] = useState(null);
  const [requests, setRequests] = useState([]);
  const [pendingTeams, setPendingTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Import state
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [committing, setCommitting] = useState(false);

  // Test suite state
  const [testResults, setTestResults] = useState(null);
  const [runningTests, setRunningTests] = useState(false);

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      loadTabData(activeTab);
    }
  }, [activeTab, isAuthenticated, adminToken]);

  async function apiFetch(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken,
      ...(options.headers || {})
    };
    return fetch(endpoint, { ...options, headers });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('plaionn_admin_token', data.token);
      localStorage.setItem('plaionn_admin_user', JSON.stringify(data.user));
      setAdminToken(data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('plaionn_admin_token');
    localStorage.removeItem('plaionn_admin_user');
    setAdminToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setOverview(null);
    setRequests([]);
    setPendingTeams([]);
    setImportPreview(null);
    setTestResults(null);
  }

  async function loadTabData(tab) {
    setLoading(true);
    setActionMessage(null);
    try {
      if (tab === 'overview') {
        const res = await apiFetch('/api/admin/overview');
        if (res.status === 401) {
          handleLogout();
          return;
        }
        const data = await res.json();
        setOverview(data);
      } else if (tab === 'requests') {
        const res = await apiFetch('/api/admin/requests');
        if (res.status === 401) {
          handleLogout();
          return;
        }
        const data = await res.json();
        setRequests(data.data || []);
      } else if (tab === 'teams') {
        const res = await apiFetch('/api/admin/teams/pending');
        if (res.status === 401) {
          handleLogout();
          return;
        }
        const data = await res.json();
        setPendingTeams(data.data || []);
      }
    } catch (err) {
      console.error('Admin API error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestDecision(id, decision) {
    try {
      const res = await apiFetch(`/api/admin/requests/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision, admin_notes: `Processed via Admin Portal as ${decision}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(`Request ${id} marked ${decision}`);
      loadTabData('requests');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleTeamApproval(interestId, teamName, city, division, homeLeague) {
    try {
      const res = await apiFetch(`/api/admin/teams/${interestId}/decision`, {
        method: 'POST',
        body: JSON.stringify({
          decision: 'approved',
          approved_name: teamName,
          approved_city: city,
          approved_division: division,
          home_league_name: homeLeague
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(`Team "${teamName}" approved into public directory!`);
      loadTabData('teams');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handlePreviewImport() {
    if (!csvText.trim()) {
      alert('Please paste CSV data or load sample rows.');
      return;
    }

    setLoading(true);
    try {
      const lines = csvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = (cols[idx] || '').replace(/^"|"$/g, '').trim();
        });
        rows.push(rowObj);
      }

      const res = await apiFetch('/api/admin/imports/preview', {
        method: 'POST',
        body: JSON.stringify({
          filename: 'upload.csv',
          sourceName: 'Admin CSV Upload',
          rows
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportPreview(data);
    } catch (err) {
      alert('Import preview failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCommitImport() {
    if (!importPreview) return;
    setCommitting(true);
    try {
      const rowIds = importPreview.stagedRows.map(r => r.id);
      const res = await apiFetch(`/api/admin/imports/${importPreview.batchId}/commit`, {
        method: 'POST',
        body: JSON.stringify({ approvedRowIds: rowIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(`Import committed: ${data.createdCount} created, ${data.updatedCount} updated, ${data.skippedCount} skipped.`);
      setImportPreview(null);
      setCsvText('');
    } catch (err) {
      alert('Commit failed: ' + err.message);
    } finally {
      setCommitting(false);
    }
  }

  function loadSampleCsv() {
    const sample = `League,Area,Category,Source,Attached research notes
H.E.T.I. Adults,Toronto,Adult ice applicant – unverified,https://www.toronto.ca/ice-alloc.pdf,unresolved applicant from ice allocation PDF
Sports Village Hockey League,Vaughan,Arena-run adult ice,https://www.sportsvillage.ca,Direct arena league
New East York Rec League,Toronto,Independent ice,https://example.com/eastyork,Newly formed 2026 rec division`;
    setCsvText(sample);
  }

  async function handleRunAcceptanceTests() {
    setRunningTests(true);
    try {
      const res = await apiFetch('/api/admin-tests/run');
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      alert('Test runner error: ' + err.message);
    } finally {
      setRunningTests(false);
    }
  }

  // ==========================================
  // VIEW 1: DEDICATED LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Top subtle blue accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500"></div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#12202B] text-white flex items-center justify-center text-2xl mx-auto shadow-md">
              🏒
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Plaionn Operations Console
            </h1>
            <p className="text-xs text-slate-500">
              Restricted access for league convenors, editors, and platform administrators.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Username or Email</span>
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white text-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Security Key / Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 focus:bg-white text-slate-900 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#1463DF] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{loginLoading ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
              </button>
            </div>
          </form>

          {/* Quick Credential Hint for Local Environment */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Default Local Credentials:</span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 pl-4">
              Username: <strong className="text-slate-700">admin</strong> • Key: <strong className="text-slate-700">plaionn-admin-key</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center leading-relaxed">
            Protected under Acceptance Scenario A12. All login attempts and mutations are recorded to the immutable audit trail.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN OPERATIONS DASHBOARD
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Title Bar with Logout & Session Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Plaionn Editorial & Operations Console
            </h1>
            <p className="text-xs text-slate-500">Moderation, Freshness Alerts, Import Staging & Acceptance Suite</p>
          </div>
        </div>

        {/* User Badge & Sign Out Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{currentUser?.name || 'Administrator'}</span>
            <span className="text-slate-400">({currentUser?.role || 'Super Admin'})</span>
          </div>

          <button
            onClick={() => loadTabData(activeTab)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            title="Refresh current view"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="End admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'overview', label: 'Overview & Freshness', icon: Shield },
          { id: 'requests', label: 'Listing Requests & Claims', icon: Building },
          { id: 'teams', label: 'Captain Submissions', icon: Users },
          { id: 'import', label: 'Spreadsheet Staging Tool', icon: FileSpreadsheet },
          { id: 'tests', label: 'Acceptance Matrix (A01-A22)', icon: Play }
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Freshness */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Counters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">Published Leagues</span>
              <span className="text-2xl font-extrabold text-slate-900">{overview.counts.totalLeagues}</span>
              <span className="text-[10px] text-slate-500 block">({overview.counts.draftLeagues} unverified applicants in draft)</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">Freshness Alerts (&gt;90d)</span>
              <span className={`text-2xl font-extrabold ${overview.counts.staleLeaguesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {overview.counts.staleLeaguesCount}
              </span>
              <span className="text-[10px] text-slate-500 block">Require seasonal re-check</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">Pending Moderation</span>
              <span className="text-2xl font-extrabold text-blue-600">{overview.counts.pendingRequests}</span>
              <span className="text-[10px] text-slate-500 block">Claims & corrections</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">Verified vs Tentative Leads</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {overview.counts.verifiedLeads} <span className="text-xs font-normal text-slate-400">/ {overview.counts.totalLeads}</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block">{overview.counts.verifiedLeads} Email Confirmed</span>
            </div>
          </div>

          {/* Stale Listings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Listing Freshness Watchlist (Older than 90 Days)
                </h3>
                <p className="text-xs text-slate-500">
                  Acceptance Section 3 requirement: League facts must be reviewed within 90 days before a new playing season.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {overview.staleLeagues.length} Stale Listings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                    <th className="pb-2">League Name</th>
                    <th className="pb-2">Municipality</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Last Checked</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.staleLeagues.slice(0, 10).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-800">{l.name}</td>
                      <td className="py-2.5 text-slate-600">{l.municipality}</td>
                      <td className="py-2.5">
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                          {l.verification_status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">{l.last_checked_at?.slice(0, 10) || 'Never'}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => navigate(`/leagues/${l.slug}`)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          View Listing →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Listing Requests & Claims */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Listing Moderation Queue</h3>
              <p className="text-xs text-slate-500">Review claims, corrections, and new addition submissions with evidence verification.</p>
            </div>
            <span className="text-xs font-semibold text-slate-600">Total: {requests.length}</span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Queue is currently empty.</div>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                        r.request_type === 'claim' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.request_type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        Target Listing: {r.current_programme_name || r.suggested_name || 'New Addition'}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      r.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                    <div>Requester: <strong>{r.requester_name}</strong> ({r.requester_role})</div>
                    <div>Email: <strong className="font-mono">{r.requester_email}</strong></div>
                    <div>Date: <span>{new Date(r.created_at).toLocaleDateString()}</span></div>
                  </div>

                  {r.evidence_url && (
                    <div className="text-[11px] bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 font-semibold mr-1">Evidence URL:</span>
                      <a href={r.evidence_url} target="_blank" rel="noreferrer" className="text-blue-600 underline font-mono break-all">
                        {r.evidence_url}
                      </a>
                    </div>
                  )}

                  {r.message && (
                    <div className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 text-[11px] leading-relaxed">
                      "{r.message}"
                    </div>
                  )}

                  {r.status === 'pending' && (
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => handleRequestDecision(r.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-xs"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleRequestDecision(r.id, 'approved')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                      >
                        Approve & Verify
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Captain Submissions */}
      {activeTab === 'teams' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Captain Submissions & Team Approvals</h3>
              <p className="text-xs text-slate-500">
                Acceptance A15: Approving a team publishes only approved fields (name, city, division, home league). Captain contacts remain strictly private.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600">Pending: {pendingTeams.length}</span>
          </div>

          {pendingTeams.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No captain submissions awaiting moderation.</div>
          ) : (
            <div className="space-y-4">
              {pendingTeams.map((team) => (
                <div key={team.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{team.team_name}</h4>
                      <p className="text-slate-500 text-[11px]">{team.city}, ON • {team.division || 'Recreational'}</p>
                    </div>

                    <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                      Captain Email: {team.verification_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div>Captain: <strong>{team.captain_name}</strong> (<span className="font-mono">{team.captain_email}</span>)</div>
                    <div>Home League: <strong>{team.home_league_or_independent || 'Independent'}</strong></div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleTeamApproval(team.id, team.team_name, team.city, team.division, team.home_league_or_independent)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                    >
                      Approve & Publish Team Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Spreadsheet Staging Importer */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Research Workbook / CSV Staging Importer</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Follows Section 4 workflow: Upload → Validate Headers → Staged Preview → Duplicate & Applicant Detection → Transactional Commit.
              Raw CRM fields are quarantined and never published.
            </p>
          </div>

          {/* Paste CSV or load sample */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700">Paste CSV or load sample test rows:</label>
              <button
                type="button"
                onClick={loadSampleCsv}
                className="text-blue-600 hover:underline font-semibold"
              >
                Load Sample Test Case Rows
              </button>
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="League,Area,Category,Source,Attached research notes..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handlePreviewImport}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                {loading ? 'Analyzing...' : 'Parse & Generate Staging Preview'}
              </button>
            </div>
          </div>

          {/* Staged Preview */}
          {importPreview && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Staged Import Batch: {importPreview.batchId}
                  </h4>
                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    <span>Total Rows: <strong>{importPreview.summary.total}</strong></span>
                    <span className="text-amber-600 font-semibold">Applicant Leads: {importPreview.summary.applicantLeads}</span>
                    <span className="text-blue-600 font-semibold">Existing Duplicates: {importPreview.summary.duplicateCandidates}</span>
                  </div>
                </div>

                <button
                  onClick={handleCommitImport}
                  disabled={committing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  {committing ? 'Committing...' : 'Commit Approved Rows to Live'}
                </button>
              </div>

              <div className="space-y-3">
                {importPreview.stagedRows.map((row) => (
                  <div key={row.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">{row.candidateName || 'Unnamed Row'}</span>
                      <div className="flex gap-1.5">
                        {row.flags.map((f) => (
                          <span key={f} className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                            {f.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Area: <strong>{row.candidateArea}</strong> | Category: <strong>{row.candidateCategory}</strong>
                    </div>
                    {row.conflictInfo && (
                      <div className="text-amber-700 bg-amber-50 p-2 rounded text-[11px] border border-amber-200">
                        ⚠️ {row.conflictInfo.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Acceptance Matrix (A01 - A22) */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Automated Acceptance Matrix (A01 through A22)
              </h3>
              <p className="text-xs text-slate-500">
                Runs live end-to-end tests against the database, URL persistence, concurrency control, and private field protections.
              </p>
            </div>

            <button
              onClick={handleRunAcceptanceTests}
              disabled={runningTests}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{runningTests ? 'Running Matrix...' : 'Run All 22 Acceptance Tests'}</span>
            </button>
          </div>

          {testResults && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
                testResults.allPassed ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
              }`}>
                <span>Matrix Execution Result: {testResults.passed} / {testResults.total} Tests Passed</span>
                {testResults.allPassed && <span>🏆 100% SPEC COMPLIANT</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testResults.results.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">[{t.id}] {t.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{t.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
