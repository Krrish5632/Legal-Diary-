import React from 'react';
import { Search, BookOpen, Scale, Shield, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { legalSections, searchSections, getSectionsByAct, LegalSection } from '../lib/legalData';
import { cn } from '../lib/utils';

const actColors: Record<string, { bg: string; text: string; border: string }> = {
  IPC:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  BNSS: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  BSA:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  CrPC: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  CPC:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
};

const SectionCard = ({ s }: { s: LegalSection }) => {
  const [open, setOpen] = React.useState(false);
  const c = actColors[s.act] || actColors.IPC;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <button onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn('px-2.5 py-1 rounded-lg text-xs font-black shrink-0 border', c.bg, c.text, c.border)}>
            {s.act} §{s.section}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-zinc-900 text-sm leading-tight">{s.title}</h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {s.cognizable !== undefined && (
                <span className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                  s.cognizable ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
                  {s.cognizable ? 'Cognizable' : 'Non-Cognizable'}
                </span>
              )}
              {s.bailable !== undefined && (
                <span className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded-full',
                  s.bailable ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600')}>
                  {s.bailable ? 'Bailable' : 'Non-Bailable'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 mt-1 text-zinc-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 pt-3">
              <p className="text-sm text-zinc-600 leading-relaxed">{s.description}</p>
              {s.punishment && (
                <div className="flex items-start gap-2 p-3 bg-zinc-50 rounded-xl">
                  <Shield size={14} className="text-legal-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Punishment</p>
                    <p className="text-sm font-bold text-zinc-800 mt-0.5">{s.punishment}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const LegalLibrary = () => {
  const [query, setQuery] = React.useState('');
  const [activeAct, setActiveAct] = React.useState<LegalSection['act'] | 'ALL'>('ALL');
  const [results, setResults] = React.useState<LegalSection[]>([]);
  const [searched, setSearched] = React.useState(false);

  const acts: Array<LegalSection['act'] | 'ALL'> = ['ALL', 'IPC', 'BNSS', 'BSA', 'CPC'];

  const displaySections = React.useMemo(() => {
    if (searched && results.length > 0) return results;
    if (activeAct === 'ALL') return legalSections.slice(0, 15);
    return getSectionsByAct(activeAct);
  }, [searched, results, activeAct]);

  const handleSearch = () => {
    if (!query.trim()) { setSearched(false); setResults([]); return; }
    setSearched(true);
    setResults(searchSections(query));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden p-6 md:p-8 pb-0"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)' }}>
        <div className="absolute top-4 right-4 opacity-10">
          <Scale size={80} className="text-legal-gold" />
        </div>
        <div className="relative z-10 mb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-legal-gold mb-1">Offline Database</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Legal Library</h2>
          <p className="text-zinc-400 text-sm mt-1">IPC · BNSS · BSA · CPC — {legalSections.length} sections</p>
        </div>

        {/* Search */}
        <div className="relative z-10 flex gap-2 pb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Search size={16} className="text-zinc-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm outline-none"
              placeholder="Search section, title, keyword..."
              value={query}
              onChange={e => { setQuery(e.target.value); if (!e.target.value) { setSearched(false); setResults([]); } }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch}
            className="px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
            Search
          </button>
        </div>
      </div>

      {/* Act Filter */}
      <div className="flex gap-2 px-4 md:px-8 py-4 overflow-x-auto bg-white border-b border-zinc-100">
        {acts.map(act => (
          <button key={act}
            onClick={() => { setActiveAct(act); setSearched(false); setResults([]); setQuery(''); }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all',
              activeAct === act
                ? 'bg-zinc-900 text-white shadow-lg'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            )}>
            {act === 'ALL' ? '📚 All' : act}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
        {searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={40} className="text-zinc-200 mb-3" />
            <p className="font-bold text-zinc-400">No sections found</p>
            <p className="text-sm text-zinc-300 mt-1">Try different keywords</p>
          </div>
        )}

        {!searched && (
          <div className="flex items-center gap-2 mb-2">
            <Filter size={12} className="text-zinc-400" />
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {activeAct === 'ALL' ? 'Recent Sections' : `${activeAct} — ${displaySections.length} sections`}
            </p>
          </div>
        )}

        {displaySections.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}>
            <SectionCard s={s} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
