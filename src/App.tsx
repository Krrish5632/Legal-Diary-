/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CaseList } from './components/CaseList';
import { Diary } from './components/Diary';
import { CauseListView } from './components/CauseListView';
import { MobileApp } from './components/MobileApp';
import { CaseForm } from './components/CaseForm';
import { LegalCase } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedCase, setSelectedCase] = React.useState<LegalCase | undefined>();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleEditCase = (c: LegalCase) => {
    setSelectedCase(c);
    setIsFormOpen(true);
  };

  const handleAddCase = () => {
    setSelectedCase(undefined);
    setIsFormOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'cases':
        return <CaseList onAddCase={handleAddCase} onEditCase={handleEditCase} />;
      case 'diary':
        return <Diary onAddCase={handleAddCase} />;
      case 'causelist':
        return <CauseListView />;
      case 'search':
        return <CaseList onAddCase={handleAddCase} onEditCase={handleEditCase} />; // Reuse for now
      case 'mobile':
        return <MobileApp />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-20 text-center">
            <h2 className="text-2xl font-display font-bold">Coming Soon</h2>
            <p className="text-zinc-500 mt-2">We're working hard to bring you more professional legal tools.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header - Global */}
        <div className="h-20 bg-white/50 backdrop-blur-md border-b sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Database size={10} />
              <span>Offline Mode Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Shield size={10} />
              <span>Secure Vault On</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-legal-green text-white rounded-full text-xs font-bold shadow-lg shadow-legal-green/20 hover:scale-105 transition-transform">
               <Sparkles size={14} />
               <span>AI Assistant</span>
             </button>
             <div className="w-px h-6 bg-zinc-200" />
             <p className="text-xs font-bold text-zinc-400">MAY 13, 2026</p>
          </div>
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

