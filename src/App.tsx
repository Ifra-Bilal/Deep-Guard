import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PageType, UserProfile, ScanResult } from './types';
import { 
  getStoredUser, 
  apiGetMe, 
  clearAuthSession, 
  apiGetHistory, 
  apiDeleteHistory, 
  apiClearAllHistory,
  calculateDashboardStats 
} from './utils/api';
import { InitialLoader } from './components/InitialLoader';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return getStoredUser() ? 'dashboard' : 'landing';
  });
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load user session and user-specific history on mount or auth change
  const refreshUserHistory = async () => {
    if (!currentUser) {
      setScans([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const records = await apiGetHistory();
      setScans(records);
      if (records.length > 0 && !selectedResult) {
        setSelectedResult(records[0]);
      }
    } catch (e) {
      console.warn('Failed to load user history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await apiGetMe();
        if (user) {
          setCurrentUser(user);
          const history = await apiGetHistory();
          setScans(history);
          if (history.length > 0) {
            setSelectedResult(history[0]);
          }
        } else {
          setCurrentUser(null);
          setScans([]);
        }
      } catch (e) {
        console.warn('Init auth check error:', e);
      }
    };
    initAuth();
  }, []);

  // Compute real-time dashboard statistics from authenticated user scans
  const dashboardStats = calculateDashboardStats(scans);

  // Handle successful login
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    try {
      const history = await apiGetHistory();
      setScans(history);
      if (history.length > 0) {
        setSelectedResult(history[0]);
      } else {
        setSelectedResult(null);
      }
    } catch {
      setScans([]);
    }
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle logout
  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setScans([]);
    setSelectedResult(null);
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Navigation with route protection
  const handleNavigate = (page: PageType) => {
    // Protected routes require authenticated user
    if ((page === 'dashboard' || page === 'history') && !currentUser) {
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Analysis Completed (from Upload page)
  const handleAnalyzeComplete = (newScan: ScanResult) => {
    setScans((prev) => [newScan, ...prev.filter((s) => s.id !== newScan.id)]);
    setSelectedResult(newScan);
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Selecting a scan to view full report
  const handleSelectScanForResults = (scan: ScanResult) => {
    setSelectedResult(scan);
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle deleting a single record
  const handleDeleteScan = async (scanId: string) => {
    const success = await apiDeleteHistory(scanId);
    if (success) {
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      if (selectedResult?.id === scanId) {
        setSelectedResult((prev) => (prev?.id === scanId ? null : prev));
      }
    }
  };

  // Handle clearing all records for the user
  const handleClearHistory = async () => {
    const success = await apiClearAllHistory();
    if (success) {
      setScans([]);
      setSelectedResult(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050B1A] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-500 selection:text-white relative">
      
      {/* Initial Minimalist Loading Screen (ONLY LOGO + PERCENTAGE) */}
      <AnimatePresence>
        {isInitialLoading && (
          <InitialLoader onComplete={() => setIsInitialLoading(false)} />
        )}
      </AnimatePresence>

      {/* Universal Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Dynamic Body */}
      <main className="flex-1 min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {currentPage === 'landing' && (
              <LandingPage
                onNavigate={handleNavigate}
                currentUser={currentUser}
              />
            )}

            {currentPage === 'signup' && (
              <SignUpPage
                onNavigate={handleNavigate}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {currentPage === 'login' && (
              <LoginPage
                onNavigate={handleNavigate}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {currentPage === 'dashboard' && (
              <DashboardPage
                currentUser={currentUser}
                scans={scans}
                stats={dashboardStats}
                onNavigate={handleNavigate}
                onSelectScanForResults={handleSelectScanForResults}
              />
            )}

            {currentPage === 'upload' && (
              <UploadPage
                onAnalyzeComplete={handleAnalyzeComplete}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'results' && (
              <ResultsPage
                result={selectedResult}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'history' && (
              <HistoryPage
                scans={scans}
                onSelectScan={handleSelectScanForResults}
                onDeleteScan={handleDeleteScan}
                onClearHistory={handleClearHistory}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
