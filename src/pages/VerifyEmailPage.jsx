import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage({ navigate }) {
  const [token, setToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });

  const [status, setStatus] = useState('checking'); // 'checking', 'success', 'error', 'already_used'
  const [message, setMessage] = useState('');
  const [emailForResend, setEmailForResend] = useState('');
  const [resendStatus, setResendStatus] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided in URL.');
      return;
    }

    async function verify() {
      try {
        const res = await fetch('/api/email-verifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been successfully confirmed!');
        } else {
          if (data.code === 'TOKEN_ALREADY_USED') {
            setStatus('already_used');
            setMessage(data.message);
          } else {
            setStatus('error');
            setMessage(data.message || data.error || 'Verification failed.');
          }
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Network error verifying email.');
      }
    }

    verify();
  }, [token]);

  async function handleResend(e) {
    e.preventDefault();
    if (!emailForResend) return;

    try {
      const res = await fetch('/api/email-verifications/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForResend })
      });
      const data = await res.json();
      setResendStatus(data.message || 'A new link has been dispatched.');
    } catch (err) {
      setResendStatus('Error sending link: ' + err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
        {status === 'checking' && (
          <div className="space-y-3 py-6">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-slate-800">Verifying your email token...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {message}
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/leagues')}
                className="w-full bg-[#1463DF] hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <span>Continue to League Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {status === 'already_used' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Already Confirmed</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This verification link has already been verified. Your email is confirmed in our directory.
            </p>
            <button
              onClick={() => navigate('/leagues')}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl text-xs"
            >
              Explore Leagues
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Link Expired or Invalid</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {message}
            </p>

            <form onSubmit={handleResend} className="pt-3 border-t border-slate-100 text-left space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Request New Verification Link</label>
              <input
                type="email"
                required
                value={emailForResend}
                onChange={(e) => setEmailForResend(e.target.value)}
                placeholder="Enter your email"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
              />
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 rounded-lg text-xs"
              >
                Send New Verification Email
              </button>
              {resendStatus && (
                <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded">
                  {resendStatus}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
