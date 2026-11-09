import React from 'react';
import { Shield, FileText, Mail } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Privacy Policy (CASL Compliance)</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-700 leading-relaxed">
        <p><strong>Effective Date:</strong> November 5, 2026 • Version 1.0</p>
        <p>
          Plaionn Sports Group operates the Plaionn Hockey Directory as an independent discovery tool for adult hockey players, captains, and league operators across the Greater Toronto Area.
        </p>
        <h3 className="font-bold text-slate-900 text-sm pt-2">1. Information We Collect</h3>
        <p>
          We collect personal information solely when voluntarily submitted through our forms (such as Captain's Club submissions, tournament interest, unmet demand requests, and listing correction reports). This includes name, email, role, and municipality.
        </p>
        <h3 className="font-bold text-slate-900 text-sm pt-2">2. Strict Isolation of Private Contact Records</h3>
        <p>
          Under our Phase 1 operational specification, captain emails, phone numbers, and private outreach notes are strictly isolated on server-side databases. They are never rendered in public web pages, API endpoints, or search index payloads.
        </p>
        <h3 className="font-bold text-slate-900 text-sm pt-2">3. Canadian Anti-Spam Legislation (CASL) Compliance</h3>
        <p>
          Consent to receive transactional service communications regarding an explicit inquiry is completely decoupled from marketing opt-in. Marketing checkboxes are unchecked by default. You may withdraw marketing consent at any time.
        </p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Terms of Service & Directory Disclaimers</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-700 leading-relaxed">
        <p><strong>Last Updated:</strong> November 5, 2026</p>
        <p>
          The Plaionn Hockey Directory is a curated directory provided for general informational purposes.
        </p>
        <h3 className="font-bold text-slate-900 text-sm pt-2">1. Independent League Governance</h3>
        <p>
          Unless explicitly designated with a "Plaionn Partner" or Plaionn-operated disclosure, listings represent independent third-party leagues, arena facilities, and municipalities. Official schedules, fees, waivers, and player insurance are governed exclusively by each respective league operator.
        </p>
        <h3 className="font-bold text-slate-900 text-sm pt-2">2. Data Provenance & No Guaranteed Availability</h3>
        <p>
          Listing details (nights, skill tiers, fees) are compiled from publicly crawled official websites and municipal ice allocation filings. Where fees or openings are unconfirmed, they are labeled honestly. Listing inclusion does not guarantee team placement or roster spots.
        </p>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Support & Contact</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-xs text-slate-700 leading-relaxed">
        <p>
          Have questions about the directory, need to report an error, or want to discuss tournament partnerships?
        </p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div>
            <strong className="text-slate-900">Editorial & Support Inbox:</strong>
            <div className="text-blue-600 font-mono text-sm">support@plaionn.com</div>
          </div>
          <div>
            <strong className="text-slate-900">Operator Partnerships & Champions League:</strong>
            <div className="text-blue-600 font-mono text-sm">convenor@plaionn.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
