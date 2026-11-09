import React from 'react';
import { ExternalLink, ShieldAlert, X } from 'lucide-react';

export default function OutboundModal({ isOpen, onClose, targetUrl, targetName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-snug">
              Visiting External Official Site
            </h3>
            <p className="text-xs text-slate-500">Leaving Plaionn Hockey Directory</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          You are heading directly to the official website for <strong className="text-slate-900">{targetName}</strong>:
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-mono break-all mb-4">
          {targetUrl}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-6 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Plaionn is an independent directory. Registrations, fee payments, and player eligibility are handled directly by the official league operator.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-colors flex items-center gap-1.5"
          >
            <span>Proceed to Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
