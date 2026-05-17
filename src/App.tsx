import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CaseList } from './components/CaseList';
import { Diary } from './components/Diary';
import { CauseListView } from './components/CauseListView';
import { Settings } from './components/Settings';
import { CaseForm } from './components/CaseForm';
import { Login } from './components/Login';
import { LegalCase } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Database } from 'lucide-react';
import { format } from 'date-fns';

const SESSION_KEY = 'ld_session';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() =>
    sessionStorage.getItem(SESSION_KEY) === '1'
  );
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedCase, setSelectedCase] = React.useState<LegalCase | undefined>();

  const handleLoginSuccess = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) return <Login onSuccess={handleLoginSuccess} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'cases': return <CaseList onAddCase={() => { setSelectedCase(undefined); setIsFormOpen(true); }} onEditCase={(c) => { setSelectedCase(c); setIsFormOpen(true); }} />;
      case 'diary': return <Diary onAddCase={() => { setSelectedCase(undefined); setIsFormOpen(true); }} />;
      case 'causelist': return <CauseListView />;
      case 'search': return <CaseList onAddCase={() => { setSelectedCase(undefined); setIsFormOpen(true); }} onEditCase={(c) => { setSelectedCase(c); setIsFormOpen(true); }} />;
      case 'library': return <LegalLibrary />;
      case 'settings': return <Settings />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full p-20 text-center">
          <h2 className="text-2xl font-display font-bold">Coming Soon</h2>
          <p className="text-zinc-500 mt-2">Yeh feature jald aayega.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
        <div className="h-14 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 pl-10 lg:pl-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-bold uppercase tracking-wider">
              <Database size={9} /><span>Offline</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-bold uppercase tracking-wider">
              <Shield size={9} /><span>Secure</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-zinc-400">{format(new Date(), 'EEE, dd MMM yyyy')}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <CaseForm
            onClose={() => { setIsFormOpen(false); setSelectedCase(undefined); }}
            initialData={selectedCase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
