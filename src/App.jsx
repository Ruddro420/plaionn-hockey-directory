import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OutboundModal from './components/OutboundModal';
import CorrectionModal from './components/CorrectionModal';

import HomePage from './pages/HomePage';
import LeagueFinderPage from './pages/LeagueFinderPage';
import LeagueProfilePage from './pages/LeagueProfilePage';
import CityGuidePage from './pages/CityGuidePage';
import ChampionsLeaguePage from './pages/ChampionsLeaguePage';
import CaptainsClubPage from './pages/CaptainsClubPage';
import TeamsDirectoryPage from './pages/TeamsDirectoryPage';
import TeamProfilePage from './pages/TeamProfilePage';
import TournamentsPage from './pages/TournamentsPage';
import OperatorsPage from './pages/OperatorsPage';
import RequestALeaguePage from './pages/RequestALeaguePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { PrivacyPage, TermsPage, ContactPage } from './pages/PolicyPages';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Global modals
  const [outboundTarget, setOutboundTarget] = useState(null); // { url, name }
  const [correctionTarget, setCorrectionTarget] = useState(null); // { id, name }

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(path) {
    window.history.pushState(null, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleExternalClick(url, name) {
    setOutboundTarget({ url, name });
  }

  function handleOpenCorrection(programmeId, programmeName) {
    setCorrectionTarget({ id: programmeId, name: programmeName });
  }

  // Routing logic
  function renderPage() {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} onExternalClick={handleExternalClick} />;
    }

    // 2. League Finder
    if (currentPath === '/leagues') {
      return <LeagueFinderPage navigate={navigate} onExternalClick={handleExternalClick} />;
    }

    // 3. League Profile
    if (currentPath.startsWith('/leagues/')) {
      const slug = currentPath.replace('/leagues/', '');
      return (
        <LeagueProfilePage
          slug={slug}
          navigate={navigate}
          onExternalClick={handleExternalClick}
          onOpenCorrection={handleOpenCorrection}
        />
      );
    }

    // 4. Curated City Pages
    if (currentPath.startsWith('/locations/')) {
      const parts = currentPath.split('/').filter(Boolean); // ['locations', 'on', 'city']
      const province = parts[1] || 'on';
      const city = parts[2] || 'toronto';
      return (
        <CityGuidePage
          province={province}
          city={city}
          navigate={navigate}
          onExternalClick={handleExternalClick}
        />
      );
    }

    // 5. Champions League
    if (currentPath === '/champions-league') {
      return <ChampionsLeaguePage navigate={navigate} />;
    }

    // 6. Captain's Club
    if (currentPath === '/captains') {
      return <CaptainsClubPage navigate={navigate} />;
    }

    // 7. Teams
    if (currentPath === '/teams') {
      return <TeamsDirectoryPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/teams/')) {
      const slug = currentPath.replace('/teams/', '');
      return <TeamProfilePage slug={slug} navigate={navigate} />;
    }

    // 8. Tournaments
    if (currentPath === '/tournaments') {
      return <TournamentsPage navigate={navigate} onExternalClick={handleExternalClick} />;
    }

    // 9. For Operators
    if (currentPath === '/operators') {
      return <OperatorsPage navigate={navigate} onOpenCorrection={handleOpenCorrection} />;
    }

    // 10. Listing Request / Claim / Correction directly
    if (currentPath === '/listing-request') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <CorrectionModal
            isOpen={true}
            onClose={() => navigate('/operators')}
            programmeId=""
            programmeName="General Listing Request"
          />
        </div>
      );
    }

    // 11. Request a League
    if (currentPath === '/request-a-league') {
      return <RequestALeaguePage navigate={navigate} />;
    }

    // 12. Email Verification
    if (currentPath === '/verify-email') {
      return <VerifyEmailPage navigate={navigate} />;
    }

    // 13. Admin Console
    if (currentPath === '/admin') {
      return <AdminDashboardPage navigate={navigate} />;
    }

    // 14. Policies & Support
    if (currentPath === '/privacy') return <PrivacyPage />;
    if (currentPath === '/terms') return <TermsPage />;
    if (currentPath === '/contact') return <ContactPage />;

    // 404 fallback
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500">The requested route does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F8FA] text-[#12202B]">
      <div>
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main className="animate-in fade-in duration-150">
          {renderPage()}
        </main>
      </div>

      <Footer navigate={navigate} />

      {/* Outbound Link Notice Modal */}
      {outboundTarget && (
        <OutboundModal
          isOpen={!!outboundTarget}
          onClose={() => setOutboundTarget(null)}
          targetUrl={outboundTarget.url}
          targetName={outboundTarget.name}
        />
      )}

      {/* Report Correction / Claim Modal */}
      {correctionTarget && (
        <CorrectionModal
          isOpen={!!correctionTarget}
          onClose={() => setCorrectionTarget(null)}
          programmeId={correctionTarget.id}
          programmeName={correctionTarget.name}
        />
      )}
    </div>
  );
}
