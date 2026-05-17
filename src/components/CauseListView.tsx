import React from 'react';
import {
  FileText, Download, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Printer,
  addMonths, subMonths
} from 'lucide-react';
import { format, addDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, isWithinInterval, addMonths as addM, subMonths as subM } from 'date-fns';
import { storage } from '../lib/storage';
import { pdfGenerator } from '../lib/pdf';
import { cn } from '../lib/utils';
import { getSettings } from './Settings';
import { motion, AnimatePresence } from 'motion/react';
import { CaseDetail } from './CaseDetail';
import { LegalCase } from '../types';

export const CauseListView = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [cases, setCases] = React.useState(storage.getCases());
  const [downloading, setDownloading] = React.useState(false);
  const [view, setView] = React.useState<'daily'|'monthly'>('daily');
  const [selectedCase, setSelectedCase] = React.useState<LegalCase | null>(null);

  React.useEffect(() => {
    const handleUpdate = () => setCases(storage.getCases());
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const dayCases = cases.filter(c => c.nextDate === format(selectedDate, 'yyyy-MM-dd'));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthlyCases = cases.filter(c => {
    if (!c.nextDate) return false;
    const d = new Date(c.nextDate + 'T00:00:00');
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const displayCases = view === 'daily' ? dayCases : monthlyCases;

  const handleDownload = async () => {
    setDownloading(true);
    const name = getSettings().advocateName || 'Advocate';
    try {
      if (view === 'daily') {
        await pdfGenerator.generateCauseList(format(selectedDate, 'yyyy-MM-dd'), dayCases, name);
      } else {
        await pdfGenerator.generateMonthlyCauseList(currentMonth, monthlyCases, name);
      }
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-5 flex flex-col h-full">
      <header className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold">Cause List</h2>
          <p className="text-zinc-500 text-sm">Tap any case to view details and forward date.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} disabled={displayCases.length === 0 || downloading}
            className="flex items-center gap-2 px-4 py-2 bg-legal-green text-white rounded-xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 disabled:opacity-40 text-sm">
            <Download size={16} />
            {downloading ? 'Downloading...' : `${view === 'daily' ? 'Daily' : 'Monthly'} PDF`}
          </button>
          <button
            onClick={() => view === 'daily' && pdfGenerator.printCauseList(format(selectedDate, 'yyyy-MM-dd'), dayCases, getSettings().advocateName || 'Advocate')}
            disabled={dayCases.length === 0 || view !== 'daily'}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-40 text-sm">
            <Printer size={16} /> Print
          </button>
        </div>
      </header>

      {/* View Toggle */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-2xl w-fit">
        {(['daily', 'monthly'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={cn('px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize',
              view === v ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500')}>
            {v === 'daily' ? '📅 Daily' : '📆 Monthly'}
          </button>
        ))}
      </div>

      {/* Daily - Week Strip */}
      {view === 'daily' && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="p-2 hover:bg-zinc-100 rounded-xl"><ChevronLeft size={18} /></button>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {weekDays.map(day => {
              const count = cases.filter(c => c.nextDate === format(day, 'yyyy-MM-dd')).length;
              return (
                <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                  className={cn('flex flex-col items-center py-2 rounded-xl transition-all',
                    isSameDay(day, selectedDate) ? 'bg-legal-green text-white shadow-lg' : 'hover:bg-zinc-50 text-zinc-500')}>
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">{format(day, 'EEE')}</span>
                  <span className="text-base font-display font-bold">{format(day, 'd')}</span>
                  {count > 0 && <span className={cn('text-[9px] font-bold px-1.5 rounded-full mt-0.5', isSameDay(day, selectedDate) ? 'bg-white/20 text-white' : 'bg-legal-green/10 text-legal-green')}>{count}</span>}
                </button>
              );
            })}
          </div>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 hover:bg-zinc-100 rounded-xl"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* Monthly Navigation */}
      {view === 'monthly' && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
          <button onClick={() => setCurrentMonth(subM(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-xl"><ChevronLeft size={18} /></button>
          <div className="text-center">
            <p className="font-display font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</p>
            <p className="text-xs text-zinc-500">{monthlyCases.length} cases scheduled</p>
          </div>
          <button onClick={() => setCurrentMonth(addM(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-xl"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* Cases */}
      <div className="flex-1 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-zinc-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-legal-green" size={18} />
            <h3 className="font-display font-bold">
              {view === 'daily' ? format(selectedDate, 'dd MMM yyyy') : format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>
          <span className="bg-legal-green/10 text-legal-green text-xs font-bold px-3 py-1 rounded-full">{displayCases.length} Cases</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayCases.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {displayCases.map((c, i) => (
                <motion.button key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedCase(c)}
                  className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors group">
                  <div className="w-9 h-9 rounded-2xl bg-legal-green/10 flex items-center justify-center font-bold text-sm text-legal-green shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 text-sm leading-tight truncate">
                      {c.parties.plaintiff} <span className="text-zinc-400 font-normal">vs</span> {c.parties.defendant}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 font-mono">{c.caseNumber} · {c.court.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full',
                      c.status === 'Urgent' ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-500')}>
                      {c.status}
                    </span>
                    {view === 'monthly' && c.nextDate && (
                      <p className="text-[10px] text-legal-green font-bold mt-1">
                        {format(new Date(c.nextDate + 'T00:00:00'), 'dd MMM')}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-zinc-200 group-hover:text-zinc-400 transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <FileText size={32} className="text-zinc-200 mb-3" />
              <h3 className="font-display font-bold">No Cases</h3>
              <p className="text-zinc-400 text-sm mt-1">{view === 'daily' ? 'No hearing on this date.' : 'No cases this month.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDetail
            legalCase={selectedCase}
            onClose={() => { setSelectedCase(null); setCases(storage.getCases()); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
