/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

export const Dashboard = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [stats, setStats] = React.useState(storage.getStats());
  const [cases, setCases] = React.useState(storage.getCases());
  const [filterType, setFilterType] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = () => {
      setStats(storage.getStats());
      setCases(storage.getCases());
    };
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);
  
  const statCards = [
    { id: 'total', label: 'Total Cases', value: stats.totalCases, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'today', label: 'Today Cases', value: stats.todayCases, icon: CalendarIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'upcoming', label: 'Upcoming', value: stats.upcomingHearings, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'urgent', label: 'Urgent', value: stats.urgentCases, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'completed', label: 'Completed', value: stats.completedCases, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const today = new Date().toISOString().split('T')[0];
  const filteredCasesList = React.useMemo(() => {
    if (!filterType) return [];
    if (filterType === 'today') return cases.filter(c => c.nextDate === today);
    if (filterType === 'upcoming') return cases.filter(c => c.nextDate > today);
    if (filterType === 'urgent') return cases.filter(c => c.status === 'Urgent');
    if (filterType === 'completed') return cases.filter(c => c.status === 'Disposed');
    return cases;
  }, [filterType, cases, today]);

  const recentCases = cases.slice(-5).reverse();

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold">Good Morning, Counsel</h2>
          <p className="text-zinc-500 mt-1">Here is the overview of your legal diary for today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-zinc-200 text-sm font-medium cursor-pointer hover:bg-zinc-50">
          <TrendingUp size={16} className="text-green-500" />
          <span>Viewing Performance Summary</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setFilterType(stat.id === filterType ? null : stat.id)}
            className={cn(
              "premium-card p-6 cursor-pointer active:scale-95 transition-all text-left",
              filterType === stat.id ? "ring-2 ring-legal-green bg-legal-green/5" : "hover:border-legal-green"
            )}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-display font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {filterType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-3xl border border-legal-green/20 shadow-xl shadow-legal-green/5 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold capitalize">{filterType} Case Details</h3>
                <button 
                  onClick={() => setFilterType(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <AlertCircle size={20} className="rotate-45" />
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCasesList.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setActiveTab('cases')}
                    className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors cursor-pointer border border-transparent hover:border-zinc-200"
                  >
                    <div>
                      <p className="font-bold">{c.parties.plaintiff} vs {c.parties.defendant}</p>
                      <p className="text-xs text-zinc-500">{c.caseNumber} • {c.court.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-legal-green">{c.nextDate}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{c.currentProceeding}</p>
                    </div>
                  </div>
                ))}
                {filteredCasesList.length === 0 && (
                  <div className="p-8 text-center text-zinc-400 italic">
                    No cases found for this category.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-display font-bold">Recent Case Activities</h3>
            <button 
              onClick={() => setActiveTab('cases')}
              className="text-legal-green text-sm font-semibold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentCases.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => setActiveTab('cases')}
                className="premium-card p-5 flex items-center justify-between cursor-pointer hover:translate-x-1 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">
                    {c.caseNumber.split(' ').pop()?.[0] || 'C'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900">{c.parties.plaintiff} vs {c.parties.defendant}</h4>
                    <p className="text-sm text-zinc-500">{c.caseNumber} • {c.court.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    c.status === 'Urgent' ? "bg-red-100 text-red-700" : 
                    c.status === 'Pending' ? "bg-amber-100 text-amber-700" : 
                    "bg-zinc-100 text-zinc-700"
                  )}>
                    {c.status}
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-tighter">Next: {c.nextDate}</p>
                </div>
              </motion.div>
            ))}
            {recentCases.length === 0 && (
              <div className="p-12 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl">
                <p className="text-zinc-500">No recent activity. Start by adding a case.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-display font-bold">Upcoming Hearings</h3>
          <div className="premium-card overflow-hidden">
            <div className="bg-legal-green p-4 text-white">
              <p className="text-xs uppercase tracking-widest opacity-80">Next 7 Days</p>
              <p className="text-2xl font-display font-bold mt-1">Calendar Preview</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Simplified mini calendar logic */}
              <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-zinc-50 flex items-center justify-center text-xs font-medium relative">
                    {new Date().getDate() + i}
                    {i % 3 === 0 && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-legal-gold rounded-full" />}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab('diary')}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium mt-4 hover:bg-black transition-colors"
              >
                View Full Diary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
