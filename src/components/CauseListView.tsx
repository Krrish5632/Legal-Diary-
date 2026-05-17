import React from 'react';
import {
  FileText, Download, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Printer, CalendarDays,
  ArrowRight, Check, X
} from 'lucide-react';
import { format, addDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { storage } from '../lib/storage';
import { pdfGenerator } from '../lib/pdf';
import { cn } from '../lib/utils';
import { getSettings } from './Settings';
import { motion, AnimatePresence } from 'motion/react';
import { LegalCase } from '../types';

export const CauseListView = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [cases, setCases] = React.useState(storage.getCases());
  const [forwardingId, setForwardingId] = React.useState<string | null>(null);
  const [forwardDate, setForwardDate] = React.useState('');
  const [downloading, setDownloading] = React.useState(false);
  const [view, setView] = React.useState<'daily'|'monthly'>('daily');

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

  const handleForwardDate = (c: LegalCase) => {
    const updatedCase = { ...c, nextDate: forwardDate };
    const allCases = cases.map(x => x.id === c.id ? updatedCase : x);
    localStorage.setItem('legal_cases', JSON.stringify(allCases));
    window.dispatchEvent(new Event('storage_update'));
    setForwardingId(null);
    setForwardDate('');
  };

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

  const displayCases = view === 'daily' ? dayCases : monthlyCases;

  return (
    <div className="p-4 md:p-8 space-y-5 flex flex-col h-full">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold">Cause List</h2>
          <p className="text-zinc-500 text-sm">Daily and monthly hearing schedule.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDownload}
            disabled={displayCases.length === 0 || downloading}
            className="flex items-center gap-2 px-4 py-2 bg-legal-green text-white rounded-xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 disabled:opacity-40 transition-all text-sm">
            <Download size={16} />
            <span>{downloading ? 'Downloading...' : `${view === 'daily' ? 'Daily' : 'Monthly'} PDF`}</span>
          </button>
          <button
            onClick={() => { if (view === 'daily') pdfGenerator.printCauseList(format(selectedDate, 'yyyy-MM-dd'), dayCases, getSettings().advocateName || 'Advocate'); }}
            disabled={dayCases.length === 0 || view !== 'daily'}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-40 transition-all text-sm">
            <Printer size={16} /><span>Print</span>
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

      {/* Daily View - Week Strip */}
      {view === 'daily' && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="p-2 hover:bg-zinc-100 rounded-xl">
            <ChevronLeft size={18} />
          </button>
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
          <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 hover:bg-zinc-100 rounded-xl">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Monthly View - Month Navigation */}
      {view === 'monthly' && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-xl">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-display font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</p>
            <p className="text-xs text-zinc-500">{monthlyCases.length} cases scheduled</p>
          </div>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 rounded-xl">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Cases Table */}
      <div className="flex-1 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-zinc-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-legal-green" size={18} />
            <h3 className="font-display font-bold">
              {view === 'daily' ? format(selectedDate, 'dd MMM yyyy') : format(currentMonth, 'MMMM yyyy')}
            </h3>
          </div>
          <span className="bg-legal-green/10 text-legal-green text-xs font-bold px-3 py-1 rounded-full">
            {displayCases.length} Cases
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayCases.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b z-10">
                <tr className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                  <th className="px-3 py-3">Sr.</th>
                  <th className="px-3 py-3">Case</th>
                  <th className="px-3 py-3">Court</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Next Date</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {displayCases.map((c, i) => (
                  <React.Fragment key={c.id}>
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="px-3 py-3 text-sm text-zinc-400 font-bold">{i + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-zinc-900 text-xs leading-tight">{c.parties.plaintiff} vs {c.parties.defendant}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{c.caseNumber}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-zinc-600">{c.court.name}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">
                          {c.currentProceeding}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-bold text-legal-green">
                        {c.nextDate ? format(new Date(c.nextDate + 'T00:00:00'), 'dd/MM/yy') : '-'}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => { setForwardingId(c.id); setForwardDate(c.nextDate || ''); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all border border-blue-100">
                          <ArrowRight size={11} />
                          Forward
                        </button>
                      </td>
                    </tr>
                    {/* Forward Date Row */}
                    <AnimatePresence>
                      {forwardingId === c.id && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}>
                          <td colSpan={6} className="px-3 py-3 bg-blue-50">
                            <div className="flex items-center gap-3">
                              <CalendarDays size={16} className="text-blue-500 shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-blue-700 mb-1.5">Set New Next Date for this Case</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="date"
                                    value={forwardDate}
                                    onChange={e => setForwardDate(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-xl border border-blue-200 text-sm outline-none focus:border-blue-400 bg-white"
                                  />
                                  <button
                                    onClick={() => handleForwardDate(c)}
                                    disabled={!forwardDate}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-blue-700 transition-all">
                                    <Check size={14} /> Save
                                  </button>
                                  <button
                                    onClick={() => { setForwardingId(null); setForwardDate(''); }}
                                    className="p-2 bg-white text-zinc-400 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all">
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-zinc-200" />
              </div>
              <h3 className="text-lg font-display font-bold">No Cases</h3>
              <p className="text-zinc-500 text-sm mt-1">
                {view === 'daily' ? 'No hearing on this date.' : 'No cases this month.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
