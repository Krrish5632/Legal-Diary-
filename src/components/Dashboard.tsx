import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, AlertCircle, CheckCircle2,
  Clock, ChevronRight, Scale, Calendar,
  TrendingUp, Star, Gavel, BookOpen, X
} from 'lucide-react';
import { storage } from '../lib/storage';
import { getSettings } from './Settings';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const ScalesLogo = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <line x1="50" y1="8" x2="50" y2="88" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="82" y2="18" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="6" y2="52" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="30" y2="52" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="82" y1="18" x2="70" y2="52" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="82" y1="18" x2="94" y2="52" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M6 52 Q18 62 30 52" stroke="#16a34a" strokeWidth="2.5" fill="rgba(22,163,74,0.15)" strokeLinecap="round"/>
    <path d="M70 52 Q82 62 94 52" stroke="#16a34a" strokeWidth="2.5" fill="rgba(22,163,74,0.15)" strokeLinecap="round"/>
    <line x1="38" y1="88" x2="62" y2="88" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="50" cy="18" r="4" fill="#d4af37"/>
    <circle cx="18" cy="18" r="3" fill="#16a34a"/>
    <circle cx="82" cy="18" r="3" fill="#16a34a"/>
  </svg>
);

export const Dashboard = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [stats, setStats] = React.useState(storage.getStats());
  const [cases, setCases] = React.useState(storage.getCases());
  const [settings] = React.useState(getSettings());
  const [filterType, setFilterType] = React.useState<string | null>(null);

  React.useEffect(() => {
    const h = () => { setStats(storage.getStats()); setCases(storage.getCases()); };
    window.addEventListener('storage_update', h);
    return () => window.removeEventListener('storage_update', h);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayCases = cases.filter(c => c.nextDate === today);
  const upcomingCases = cases.filter(c => c.nextDate > today).slice(0, 5);
  const recentCases = [...cases].reverse().slice(0, 5);
  const urgentCases = cases.filter(c => c.status === 'Urgent');

  const filteredList = React.useMemo(() => {
    if (!filterType) return [];
    if (filterType === 'today') return cases.filter(c => c.nextDate === today);
    if (filterType === 'upcoming') return cases.filter(c => c.nextDate > today);
    if (filterType === 'urgent') return cases.filter(c => c.status === 'Urgent');
    if (filterType === 'completed') return cases.filter(c => c.status === 'Disposed');
    return cases;
  }, [filterType, cases, today]);

  const statCards = [
    { id: 'total', label: 'Total Cases', value: stats.totalCases, icon: Briefcase, gradient: 'from-blue-600 to-blue-800', glow: 'shadow-blue-500/30' },
    { id: 'today', label: "Today's Hearing", value: stats.todayCases, icon: Calendar, gradient: 'from-emerald-500 to-green-700', glow: 'shadow-emerald-500/30' },
    { id: 'upcoming', label: 'Upcoming', value: stats.upcomingHearings, icon: Clock, gradient: 'from-purple-500 to-purple-800', glow: 'shadow-purple-500/30' },
    { id: 'urgent', label: 'Urgent', value: stats.urgentCases, icon: AlertCircle, gradient: 'from-red-500 to-red-700', glow: 'shadow-red-500/30' },
    { id: 'completed', label: 'Disposed', value: stats.completedCases, icon: CheckCircle2, gradient: 'from-zinc-600 to-zinc-800', glow: 'shadow-zinc-500/30' },
  ];

  const quickActions = [
    { label: 'Legal Diary', icon: Calendar, tab: 'diary', color: 'bg-emerald-500' },
    { label: 'All Cases', icon: Briefcase, tab: 'cases', color: 'bg-blue-500' },
    { label: 'Cause List', icon: Gavel, tab: 'causelist', color: 'bg-amber-500' },
    { label: 'Legal Search', icon: BookOpen, tab: 'search', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0f2318 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 animate-float">
            <Scale size={120} className="text-legal-gold opacity-30" />
          </div>
          <div className="absolute bottom-0 left-8 opacity-20">
            <ScalesLogo size={80} />
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-8 pb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-ring"
              style={{ background: 'linear-gradient(135deg, #1a2e1a, #0f3320)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <ScalesLogo size={40} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-1"
                style={{ color: '#d4af37' }}>Advocate's Professional Suite</p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                {settings.advocateName || 'Legal Diary Pro'}
              </h1>
              {settings.court && (
                <p className="text-zinc-400 text-sm mt-0.5">{settings.court}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)', color: '#4ade80' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </div>
            {urgentCases.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <AlertCircle size={12} />
                {urgentCases.length} Urgent
              </div>
            )}
            {stats.barNumber && (
              <div className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
                {settings.barNumber}
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="relative z-10 px-4 md:px-8 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statCards.map((s, i) => (
              <motion.button key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setFilterType(s.id === filterType ? null : s.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-95 shadow-lg",
                  s.glow, filterType === s.id ? 'ring-2 ring-white/40' : ''
                )}
                style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                <div className={cn("absolute inset-0 bg-gradient-to-br", s.gradient, "opacity-90")} />
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    <s.icon size={16} className="text-white" />
                  </div>
                  <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">{s.label}</p>
                  <p className="text-white text-3xl font-display font-bold mt-0.5">{s.value}</p>
                </div>
                {filterType === s.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {/* Filter Results */}
        <AnimatePresence>
          {filterType && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center"
                  style={{ background: 'linear-gradient(135deg, #0a0f1e, #111827)' }}>
                  <h3 className="text-lg font-display font-bold text-white capitalize">{filterType} Cases</h3>
                  <button onClick={() => setFilterType(null)}
                    className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                    <X size={16} />
                  </button>
                </div>
                <div className="divide-y divide-zinc-100">
                  {filteredList.length === 0 ? (
                    <p className="p-8 text-center text-zinc-400">No cases found.</p>
                  ) : filteredList.map((c, i) => (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{c.parties.plaintiff} vs {c.parties.defendant}</p>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{c.caseNumber} · {c.court.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.nextDate && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-legal-green/10 text-legal-green rounded-lg">
                            {format(new Date(c.nextDate + 'T00:00:00'), 'dd MMM')}
                          </span>
                        )}
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-lg",
                          c.status === 'Urgent' ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-500'
                        )}>{c.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <div>
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-3">Quick Access</p>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <motion.button key={a.tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setActiveTab(a.tab)}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all active:scale-95">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", a.color)}>
                  <a.icon size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-zinc-600 text-center leading-tight">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Hearings */}
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b flex justify-between items-center"
              style={{ background: 'linear-gradient(135deg, #052e16, #14532d)' }}>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-green-400 font-black">Live</p>
                <h3 className="text-lg font-display font-bold text-white">Today's Hearings</h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-400/20 text-green-300 border border-green-400/20">
                {todayCases.length} cases
              </span>
            </div>
            <div className="divide-y divide-zinc-100">
              {todayCases.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 size={32} className="text-zinc-200 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm font-medium">No hearings today</p>
                </div>
              ) : todayCases.map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-legal-green/10 flex items-center justify-center text-xs font-bold text-legal-green">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-zinc-900 leading-tight">{c.parties.plaintiff} vs {c.parties.defendant}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{c.court.name}</p>
                    </div>
                  </div>
                  {c.status === 'Urgent' && (
                    <span className="text-[9px] font-black text-red-500 animate-pulse uppercase">Urgent</span>
                  )}
                </motion.div>
              ))}
            </div>
            {todayCases.length > 0 && (
              <div className="p-4 border-t">
                <button onClick={() => setActiveTab('causelist')}
                  className="w-full py-2.5 text-xs font-bold text-legal-green hover:bg-legal-green/5 rounded-xl transition-all flex items-center justify-center gap-1">
                  View Full Cause List <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Cases */}
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b flex justify-between items-center">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">Schedule</p>
                <h3 className="text-lg font-display font-bold">Upcoming</h3>
              </div>
              <TrendingUp size={20} className="text-legal-gold" />
            </div>
            <div className="divide-y divide-zinc-100">
              {upcomingCases.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar size={32} className="text-zinc-200 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm font-medium">No upcoming cases</p>
                </div>
              ) : upcomingCases.map((c, i) => (
                <motion.div key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-zinc-900 leading-tight">{c.parties.plaintiff} vs {c.parties.defendant}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 font-mono">{c.caseNumber}</p>
                  </div>
                  {c.nextDate && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-legal-gold">{format(new Date(c.nextDate + 'T00:00:00'), 'dd MMM')}</p>
                      <p className="text-[10px] text-zinc-400">{format(new Date(c.nextDate + 'T00:00:00'), 'yyyy')}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t">
              <button onClick={() => setActiveTab('diary')}
                className="w-full py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all flex items-center justify-center gap-1">
                Open Legal Diary <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-black">Recent Activity</p>
              <h3 className="text-lg font-display font-bold">Recent Cases</h3>
            </div>
            <Star size={18} className="text-legal-gold" />
          </div>
          <div className="divide-y divide-zinc-100">
            {recentCases.length === 0 ? (
              <div className="p-10 text-center">
                <Briefcase size={36} className="text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 font-bold">No cases yet</p>
                <p className="text-zinc-300 text-sm mt-1">Add your first case to get started</p>
              </div>
            ) : recentCases.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #0a0f1e, #1a2035)', color: '#d4af37' }}>
                    {c.parties.plaintiff[0]}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm leading-tight">
                      {c.parties.plaintiff} <span className="text-zinc-400 font-normal">vs</span> {c.parties.defendant}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.court.name} · {c.caseType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-full",
                    c.status === 'Urgent' ? 'bg-red-50 text-red-500 border border-red-100' :
                    c.status === 'Disposed' ? 'bg-zinc-100 text-zinc-400' :
                    'bg-legal-green/10 text-legal-green'
                  )}>{c.status}</span>
                  <ChevronRight size={16} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t">
            <button onClick={() => setActiveTab('cases')}
              className="w-full py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all flex items-center justify-center gap-1">
              View All Cases <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
