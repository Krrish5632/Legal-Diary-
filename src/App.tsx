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
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  });
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedCase, setSelectedCase] = React.useState<LegalCase | undefined>();

  const handleLoginSuccess = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIsLoggedIn(true);
  };

  const handleEditCase = (c: LegalCase) => {
    setSelectedCase(c);
    setIsFormOpen(true);
  };

  const handleAddCase = () => {
    setSelectedCase(undefined);
    setIsFormOpen(true);
  };

  if (!isLoggedIn) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'cases': return <CaseList onAddCase={handleAddCase} onEditCase={handleEditCase} />;
      case 'diary': return <Diary onAddCase={handleAddCase} />;
      case 'causelist': return <CauseListView />;
      case 'search': return <CaseList onAddCase={handleAddCase} onEditCase={handleEditCase} />;
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
        <div className="h-16 bg-white/50 backdrop-blur-md border-b sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Database size={10} />
              <span>Offline</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Shield size={10} />
              <span>Secure</span>
            </div>
          </div>
          <p className="text-xs font-bold text-zinc-400">{format(new Date(), 'dd MMM yyyy')}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
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
