/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Scale,
  Plus
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { storage } from '../lib/storage';
import { pdfGenerator } from '../lib/pdf';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DiaryProps {
  onAddCase: () => void;
}

export const Diary = ({ onAddCase }: DiaryProps) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [cases, setCases] = React.useState(storage.getCases());

  React.useEffect(() => {
    const handleUpdate = () => setCases(storage.getCases());
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayCases = (day: Date) => {
    const dStr = format(day, 'yyyy-MM-dd');
    return cases.filter(c => c.nextDate === dStr);
  };

  const selectedDayCases = getDayCases(selectedDate);

  const handlePrintCauseList = () => {
    pdfGenerator.generateCauseList(
      format(selectedDate, 'yyyy-MM-dd'),
      selectedDayCases,
      'Adv. Sanjiv Pandey'
    );
  };

  return (
    <div className="p-8 h-full flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Legal Diary</h2>
          <p className="text-zinc-500">Manage your hearings and court schedule.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onAddCase}
            className="flex items-center gap-2 px-4 py-2 bg-legal-green text-white rounded-xl text-sm font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-all"
          >
            <Plus size={18} />
            <span>Add Case</span>
          </button>
          <button 
            onClick={handlePrintCauseList}
            disabled={selectedDayCases.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            <span>Daily Cause List</span>
          </button>
          <button className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50">
            <Printer size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Calendar Side */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-2xl shadow-zinc-200/50">
          <div className="p-8 border-b flex justify-between items-center bg-gradient-to-br from-zinc-50 to-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-legal-green/20 to-transparent animate-shimmer" />
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-legal-green mb-1">Operational View</span>
              <h3 className="text-3xl font-display font-black text-zinc-900 leading-none">
                {format(currentDate, 'MMMM')} <span className="text-zinc-300">{format(currentDate, 'yyyy')}</span>
              </h3>
            </div>

            <div className="flex items-center gap-3 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 shadow-inner">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft size={20} className="text-zinc-600" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-white border border-zinc-200 rounded-xl shadow-sm hover:bg-zinc-50 transition-all active:scale-95"
              >
                Sync
              </button>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90"
              >
                <ChevronRight size={20} className="text-zinc-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b bg-zinc-50/30">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="py-4 text-center text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-r last:border-r-0 border-zinc-100 italic">
                {day.substring(0, 3)}
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
                <motion.button
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005 }}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative h-24 md:h-32 border-r border-b p-2 transition-all hover:bg-legal-green/5 flex flex-col gap-1 items-start group overflow-hidden",
                    !isCurrentMonth && "bg-zinc-50/30 text-zinc-300 opacity-40",
                    isSelected && "bg-legal-green/10 ring-2 ring-inset ring-legal-green z-10"
                  )}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className={cn(
                      "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300",
                      isToday(day) && "bg-legal-green text-white shadow-lg shadow-legal-green/30 rotate-3",
                      isSelected && !isToday(day) && "bg-zinc-900 text-white shadow-xl shadow-black/20"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayCases.length > 0 && (
                      <div className="flex -space-x-1">
                        {hasUrgent && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />}
                        <div className="w-2 h-2 rounded-full bg-legal-gold shadow-sm shadow-legal-gold/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full space-y-1 mt-1 z-10">
                    {dayCases.slice(0, 3).map((c, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "text-[9px] truncate px-1.5 py-1 rounded-lg font-bold border transition-all group-hover:translate-x-0.5",
                          c.status === 'Urgent' 
                            ? "bg-red-50 text-red-700 border-red-100" 
                            : "bg-zinc-50 text-zinc-700 border-zinc-200"
                        )}
                      >
                        {c.parties.plaintiff.split(' ')[0]} v. {c.parties.defendant.split(' ')[0]}
                      </div>
                    ))}
                    {dayCases.length > 3 && (
                      <div className="text-[8px] text-legal-green font-black px-1 uppercase tracking-tighter">
                        +{dayCases.length - 3} More Sessions
                      </div>
                    )}
                  </div>

                  {/* Decorative High-tech element */}
                  {isSelected && (
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-legal-green/10 rounded-full blur-xl" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Agenda Side */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="premium-card p-6 bg-zinc-900 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Scale size={80} className="rotate-12" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-legal-gold font-black mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-legal-gold animate-pulse" />
                Live Schedule
              </p>
              <h3 className="text-2xl font-display font-bold">
                {format(selectedDate, 'do MMMM, yyyy')}
              </h3>
              <div className="flex items-center gap-2 mt-3 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                <Clock size={14} className="text-legal-green" />
                <span>{selectedDayCases.length} ACTIVE HEARINGS</span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {selectedDayCases.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="premium-card p-5 group cursor-pointer hover:border-legal-green transition-all hover:bg-zinc-50/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                      c.status === 'Urgent' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    )}>
                      {c.caseType}
                    </span>
                    <div className="flex items-center gap-2">
                      {c.status === 'Urgent' && (
                        <span className="text-[8px] font-bold text-red-500 animate-pulse">URGENT</span>
                      )}
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        c.status === 'Urgent' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-legal-green shadow-sm shadow-legal-green/50'
                      )} />
                    </div>
                  </div>
                  <h4 className="font-bold text-lg leading-tight group-hover:text-legal-green transition-colors font-display">
                    {c.parties.plaintiff} vs {c.parties.defendant}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Scale size={12} />
                      {c.caseNumber}
                    </p>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-dashed border-zinc-200 grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                        <MapPin size={12} className="text-legal-green" />
                      </div>
                      <span className="font-medium">{c.court.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                        <Scale size={12} className="text-legal-gold" />
                      </div>
                      <span className="font-medium text-zinc-500">Stage: <span className="text-zinc-900">{c.currentProceeding}</span></span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedDayCases.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-zinc-200"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center mb-4">
                  <CalendarIcon size={32} className="text-zinc-300" />
                </div>
                <p className="text-zinc-500 font-bold font-display">Clear Schedule</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-[180px]">No hearings assigned for this tactical period.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
