/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search as SearchIcon, 
  Filter, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Scale, 
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { storage } from '../lib/storage';
import { LegalCase, CaseStatus } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { exportCasePDF } from '../lib/pdfExport';
interface CaseListProps {
  onAddCase: () => void;
  onEditCase: (c: LegalCase) => void;
  onViewNotes?: (c: LegalCase) => void;
}

export const CaseList = ({ onAddCase, onEditCase }: CaseListProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [cases, setCases] = React.useState<LegalCase[]>(storage.getCases());

  React.useEffect(() => {
    const handleUpdate = () => setCases(storage.getCases());
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.parties.plaintiff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parties.defendant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      storage.deleteCase(id);
    }
  };

  return (
    <div className="p-8 space-y-8 flex flex-col h-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Case Repository</h2>
          <p className="text-zinc-500">Manage and search your entire legal archive.</p>
        </div>
        <button 
          onClick={onAddCase}
          className="flex items-center gap-2 px-6 py-3 bg-legal-green text-white rounded-xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus size={20} />
          <span>New Case Filing</span>
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by party name, case number, court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-legal-green outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Urgent', 'Disposed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                filterStatus === status 
                  ? "bg-zinc-900 text-white border-zinc-900" 
                  : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {status}
            </button>
          ))}
          <button className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-500">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCases.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                onClick={() => onEditCase(c)}
                className="premium-card p-6 flex flex-col group cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-50 text-zinc-400 rounded-xl flex items-center justify-center font-bold text-lg group-hover:bg-legal-green group-hover:text-white transition-colors capitalize">
                      {c.parties.plaintiff[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {c.caseType}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          c.status === 'Urgent' ? 'bg-red-100 text-red-600' : 
                          c.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                        )}>
                          {c.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mt-1 group-hover:text-legal-green transition-colors leading-tight">
                        {c.parties.plaintiff} <span className="text-zinc-400 font-display italic mx-1 font-normal">vs</span> {c.parties.defendant}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleDelete(c.id, e)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
  onClick={(e) => { e.stopPropagation(); exportCasePDF(c); }}
  className="p-2 text-zinc-400 hover:text-legal-green hover:bg-green-50 rounded-lg transition-all"
  title="Download PDF"
>
  <ExternalLink size={18} />
</button>
                    <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Case Number</p>
                    <p className="text-sm font-mono text-zinc-700">{c.caseNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Next Hearing</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                      <CalendarIcon size={14} className="text-legal-gold" />
                      <span>{c.nextDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin size={14} />
                      <span className="truncate max-w-[120px]">{c.court.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Scale size={14} />
                      <span>{c.currentProceeding}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300 group-hover:text-legal-green group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCases.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border-2 border-dashed border-zinc-200">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <SearchIcon size={40} className="text-zinc-200" />
            </div>
            <h3 className="text-xl font-display font-bold">No Cases Found</h3>
            <p className="text-zinc-500 max-w-sm mt-2">
              We couldn't find any cases matching "{searchQuery}". Try a different search term or check your filters.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setFilterStatus('All'); }}
              className="mt-6 text-legal-green font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
