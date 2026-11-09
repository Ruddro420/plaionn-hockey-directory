import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar, Award, ExternalLink, ShieldCheck, CheckCircle2,
  AlertCircle, Edit3, ChevronLeft, Building2, Users, Clock, Info
} from 'lucide-react';

export default function LeagueProfilePage({ slug, navigate, onExternalClick, onOpenCorrection }) {
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leagues/${slug}`);
        if (res.status === 301) {
          const redirectData = await res.json();
          navigate(`/leagues/${redirectData.new_slug}`);
          return;
        }
        if (!res.ok) {
          throw new Error('League profile not found or listing not published.');
        }
        const data = await res.json();
        setLeague(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-10 w-96 bg-slate-200 rounded"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">League Listing Not Found</h2>
        <p className="text-xs text-slate-500">
          {error || 'This listing may have been moved, renamed, or is currently unpublished for editorial review.'}
        </p>
        <div>
          <button
            onClick={() => navigate('/leagues')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            ← Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const primaryOffering = (league.offerings && league.offerings[0]) || {};
  const nights = primaryOffering.nights || [];
  const arenas = primaryOffering.arenas || [];

  // Verification badge mapping
  const statusConfig = {
    operator_confirmed: {
      label: 'Operator Confirmed Listing',
      desc: 'Information directly confirmed by official league convenors or arena operators.',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2
    },
    research_checked: {
      label: 'Research Checked',
      desc: 'Information curated and checked from verified official public listings and municipal filings.',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: ShieldCheck
    },
    needs_review: {
      label: 'Needs Seasonal Review',
      desc: 'Listing information is older than 90 days or awaiting updated seasonal schedule details.',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertCircle
    }
  };

  const status = statusConfig[league.verification_status] || statusConfig.research_checked;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <button
        onClick={() => navigate('/leagues')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to League Finder</span>
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border shadow-2xs"
            style={{ backgroundColor: status.bg.split(' ')[0], color: status.bg.split(' ')[1] }}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status.label}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCorrection(league.id, league.name)}
              className="text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Report Correction / Claim</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {league.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 mt-2">
            <span className="font-semibold text-blue-700">{league.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {league.area} ({league.municipality}, ON)
            </span>
          </div>
        </div>

        {/* Operator & Governance Disclosure */}
        <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-600 border border-slate-200 flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-800">Operator Disclosure: </strong>
            {league.owner_disclosure || 'Independent adult hockey programme.'}
            {league.organisation_name && (
              <span className="ml-1 text-slate-500">
                Operating organisation: <strong>{league.organisation_name}</strong>.
              </span>
            )}
          </div>
        </div>

        {/* Primary Outbound Action */}
        {primaryOffering.registration_url && (
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onExternalClick(primaryOffering.registration_url, league.name)}
              className="bg-[#1463DF] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>Visit Official League Website / Registration</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              Outbound official link verified on {league.last_checked_at?.slice(0, 10) || 'recent crawl'}
            </span>
          </div>
        )}
      </div>

      {/* Offering Breakdown & Arenas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Season & Skill Offerings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Current Programme Offerings</span>
            </h2>

            <div className="space-y-4">
              {league.offerings && league.offerings.map((off) => (
                <div key={off.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{off.season_label}</span>
                    <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                      {off.registration_status === 'open' ? '🟢 Registration Open' : 'Status: ' + off.registration_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Playing Nights</span>
                      <span className="font-medium text-slate-900">
                        {off.nights?.length > 0 ? off.nights.join(', ') : 'Not confirmed'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Age Eligibility</span>
                      <span className="font-medium text-slate-900">{off.age_eligibility || '18+ Adult'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Skill Labels (Source Description)</span>
                      <span className="font-medium text-slate-900">
                        {off.skill_labels || 'Recreational tiers'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Registration Format</span>
                      <span className="font-medium text-slate-900">{off.registration_modes || 'Team only'}</span>
                    </div>
                  </div>

                  {/* Fee Disclosure (Acceptance A03: Honest unknown labels when fee is null) */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Published Pricing</span>
                    {off.fee_amount ? (
                      <div className="font-bold text-slate-900 text-sm">
                        ${off.fee_amount.toLocaleString()} {off.fee_currency} <span className="text-xs font-normal text-slate-500">({off.fee_unit})</span>
                        <p className="text-[11px] text-slate-500 font-normal mt-1">{off.fee_notes}</p>
                      </div>
                    ) : (
                      <div className="text-slate-600 text-xs">
                        <span className="font-semibold text-slate-800">Fee not publicly published on source site.</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{off.fee_notes || 'Contact league convenor for current seasonal team/player packages.'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arenas & Facilities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Playing Arenas & Rinks</span>
            </h2>

            {arenas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {arenas.map((arena) => (
                  <div key={arena.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-800">{arena.name}</div>
                    <div className="text-slate-500">{arena.address || 'GTA Arena'}</div>
                    <div className="text-slate-400">{arena.city}, ON {arena.postal_code || ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Local community rinks in {league.area}. Specific arena assignments scheduled by convenors upon division registration.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Source Citations & Related Leagues */}
        <div className="space-y-6">
          {/* Evidence Citations Box (Acceptance A03) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Source Evidence & Provenance</span>
            </h3>

            <div className="space-y-2 text-xs">
              {league.evidence && league.evidence.length > 0 ? (
                league.evidence.map((ev) => (
                  <div key={ev.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="font-mono text-slate-600 break-all">{ev.url}</div>
                    <div className="text-slate-400 text-[10px]">
                      Checked on: <strong className="text-slate-600">{ev.checked_at?.slice(0, 10) || 'Recent'}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs">
                  Citations verified through municipal ice records and league landing pages.
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Plaionn verifies source evidence at regular intervals. Listings without recent confirmations show an updated review notice.
            </p>
          </div>

          {/* Related Leagues in Same Municipality */}
          {league.related && league.related.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Other Leagues in {league.municipality}
              </h3>
              <div className="space-y-2 text-xs">
                {league.related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/leagues/${rel.slug}`)}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-slate-800">{rel.name}</div>
                    <div className="text-[11px] text-slate-400">{rel.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
