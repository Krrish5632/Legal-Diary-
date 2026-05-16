import React from 'react';
import {
  ChevronLeft, ChevronRight, Printer, Download,
  Calendar as CalendarIcon, Clock, MapPin, Scale,
  Plus, X, FileText
} from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isSameDay, isToday
} from 'date-fns';
import { storage } from '../lib/storage';
import { pdfGenerator } from '../lib/pdf';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getSettings } from './Settings';

interface DiaryProps { onAddCase: () => void; }

export const Diary = ({ onAddCase }: DiaryProps) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [cases, setCases] = React.useState(storage.getCases());
  const [modalDate, setModalDate] = React.useState<Date | null>(null);
  const [printing, setPrinting] = React.useState(false);

  React.useEffect(() => {
    const handleUpdate = () => setCases(storage.getCases());
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart))
  });

  const getDayCases = (day: Date) =>
    cases.filter(c => c.nextDate === format(day, 'yyyy-MM-dd'));

  const selectedDayCases = getDayCases(selectedDate);
  const modalCases = modalDate ? getDayCases(modalDate) : [];

  const handleDownload = () => {
    const name = getSettings().advocateName || 'Advocate';
    pdfGenerator.generateCauseList(format(selectedDate, 'yyyy-MM-dd'), selectedDayCases, name);
  };

  const handlePrint = async () => {
    if (selectedDayCases.length === 0) return;
    setPrinting(true);
    const name = getSettings().advocateName || 'Advocate';
    pdfGenerator.printCauseList(format(selectedDate, 'yyyy-MM-dd'), selectedDayCases, name);
    setTimeout(() => setPrinting(false), 2000);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    if (getDayCases(day).length > 0) setModalDate(day);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-6">
      <header className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold">Legal Diary</h2>
          <p className="text-zinc-500 text-sm">Manage hearings and court schedule.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onAddCase}
            className="flex items-center gap-2 px-4 py-2 bg-legal-green text-white rounded-xl text-sm font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-all">
            <Plus size={16} /><span>Add Case</span>
          </button>
          <button onClick={handleDownload} disabled={selectedDayCases.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 disabled:opacity-40 transition-all">
            <Download size={16} /><span>PDF</span>
          </button>
          <button onClick={handlePrint} disabled={selectedDayCases.length === 0 || printing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all">
            <Printer size={16} /><span>{printing ? 'Opening...' : 'Print'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xl">
          <div className="p-5 border-b flex justify-between items-center bg-gradient-to-br from-zinc-50 to-white">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-legal-green">Schedule</p>
              <h3 className="text-2xl font-display font-black text-zinc-900">
                {format(currentDate, 'MMMM')} <span className="text-zinc-300">{format(currentDate, 'yyyy')}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-2xl">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-white rounded-xl transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentDate(new Date())}
                className="px-4 py-1.5 text-xs font-black uppercase tracking-widest bg-white rounded-xl shadow-sm">
                Today
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-white rounded-xl transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b bg-zinc-50/50">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-3 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1">
            {calendarDays.map((day, i) => {
              const dayCases = getDayCases(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const hasUrgent = dayCases.some(c => c.status === 'Urgent');

              return (
                <motion.button key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.004 }}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "relative h-16 md:h-24 border-r border-b p-1.5 transition-all flex flex-col gap-1 items-start overflow-hidden",
                    !isCurrentMonth && "opacity-30 bg-zinc-50/30",
                    isSelected && "bg-legal-green/10 ring-2 ring-inset ring-legal-green z-10",
                    dayCases.length > 0 && "cursor-pointer hover:bg-legal-green/5"
                  )}>
                  <span className={cn(
                    "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                    isToday(day) && "bg-legal-green text-white shadow-lg shadow-legal-green/30",
                    isSelected && !isToday(day) && "bg-zinc-900 text-white"
                  )}>
                    {format(day, 'd')}
                  </span>

                  {dayCases.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {hasUrgent && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      <span className="text-[8px] font-bold text-legal-green bg-legal-green/10 px-1.5 py-0.5 rounded-full">
                        {dayCases.length} case{dayCases.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Agenda - Desktop */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 overflow-hidden">
          <div className="p-5 bg-zinc-900 text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Scale size={60} className="rotate-12" />
            </div>
            <p className="text-[9px] uppercase tracking-widest text-legal-green font-black mb-1">Selected</p>
            <h3 className="text-xl font-display font-bold">{format(selectedDate, 'do MMMM yyyy')}</h3>
            <div className="flex items-center gap-2 mt-2 text-zinc-400 text-xs">
              <Clock size={12} className="text-legal-green" />
              <span>{selectedDayCases.length} hearings</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {selectedDayCases.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-zinc-200 p-4 hover:border-legal-green transition-all">
                <p className="text-[9px] uppercase font-bold text-zinc-400 mb-1">{c.caseType}</p>
                <h4 className="font-bold text-zinc-900 text-sm leading-tight">
                  {c.parties.plaintiff} vs {c.parties.defendant}
                </h4>
                <p className="text-xs text-zinc-500 font-mono mt-1">{c.caseNumber}</p>
                <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-600">
                  <MapPin size={11} className="text-legal-green" />
                  <span>{c.court.name}</span>
                </div>
              </motion.div>
            ))}
            {selectedDayCases.length === 0 && (
              <div className="flex flex-col items-center justify-center p-10 text-center rounded-3xl border-2 border-dashed border-zinc-200">
                <CalendarIcon size={28} className="text-zinc-200 mb-3" />
                <p className="text-zinc-400 font-bold text-sm">No hearings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Modal - Mobile & Desktop */}
      <AnimatePresence>
        {modalDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setModalDate(null)}>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>

              <div className="p-5 border-b flex justify-between items-center bg-zinc-900 text-white">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-legal-green font-black">Cause List</p>
                  <h3 className="text-xl font-display font-bold">{format(modalDate, 'do MMMM yyyy')}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-legal-green/20 text-legal-green text-xs font-bold px-3 py-1 rounded-full">
                    {modalCases.length} Cases
                  </span>
                  <button onClick={() => setModalDate(null)}
                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b">
                    <tr className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      <th className="px-4 py-3">Sr.</th>
                      <th className="px-4 py-3">Case No.</th>
                      <th className="px-4 py-3">Parties</th>
                      <th className="px-4 py-3">Court</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {modalCases.map((c, i) => (
                      <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 font-bold">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-600">{c.caseNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-zinc-900 text-xs leading-tight">
                            {c.parties.plaintiff}
                          </p>
                          <p className="text-zinc-400 text-[10px]">vs {c.parties.defendant}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-600">{c.court.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">
                            {c.currentProceeding}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-[10px] font-bold",
                            c.status === 'Urgent' ? "text-red-500" : "text-legal-green"
                          )}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t flex gap-3">
                <button
                  onClick={() => { handleDownload(); setModalDate(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-legal-green text-white rounded-2xl font-bold text-sm">
                  <Download size={16} /> Download PDF
                </button>
                <button
                  onClick={() => { setSelectedDate(modalDate); handlePrint(); setModalDate(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm">
                  <Printer size={16} /> Print
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
