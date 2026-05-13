/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { storage } from '../lib/storage';
import { pdfGenerator } from '../lib/pdf';
import { cn } from '../lib/utils';

export const CauseListView = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [cases, setCases] = React.useState(storage.getCases());

  React.useEffect(() => {
    const handleUpdate = () => setCases(storage.getCases());
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);

  const weekStart = startOfWeek(selectedDate);
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  const dayCases = cases.filter(c => c.nextDate === format(selectedDate, 'yyyy-MM-dd'));

  const handleDownload = () => {
    pdfGenerator.generateCauseList(
      format(selectedDate, 'yyyy-MM-dd'),
      dayCases,
      'Adv. Sanjiv Pandey'
    );
  };

  return (
    <div className="p-8 space-y-8 flex flex-col h-full">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Daily Cause List</h2>
          <p className="text-zinc-500">Professional courtroom schedule for your practice.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            disabled={dayCases.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-legal-green text-white rounded-xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Download size={20} />
            <span>Download PDF</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl font-bold hover:bg-zinc-50 transition-all">
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
      </header>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
        <button 
          onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          className="p-3 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center py-3 rounded-xl transition-all",
                isSameDay(day, selectedDate) 
                  ? "bg-legal-green text-white shadow-lg" 
                  : "hover:bg-zinc-50 text-zinc-500"
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{format(day, 'EEE')}</span>
              <span className="text-lg font-display font-bold">{format(day, 'd')}</span>
            </button>
          ))}
        </div>
        <button 
          onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          className="p-3 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-zinc-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon className="text-legal-green" />
            <h3 className="text-xl font-display font-bold">
              Court Schedule: {format(selectedDate, 'PPP')}
            </h3>
          </div>
          <span className="bg-legal-green/10 text-legal-green text-xs font-bold px-3 py-1 rounded-full">
            {dayCases.length} Cases Today
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {dayCases.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b z-10">
                <tr className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                  <th className="px-6 py-4">Sr.</th>
                  <th className="px-6 py-4">Case Details</th>
                  <th className="px-6 py-4">Court / Judge</th>
                  <th className="px-6 py-4">Proceeding</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {dayCases.map((c, i) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-6 text-sm text-zinc-400 font-medium">{i + 1}</td>
                    <td className="px-6 py-6">
                      <p className="font-bold text-zinc-900 leading-tight">
                        {c.parties.plaintiff} vs {c.parties.defendant}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase">{c.caseNumber}</p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-medium text-zinc-700">{c.court.name}</p>
                      <p className="text-xs text-zinc-500 italic mt-0.5">{c.court.judgeName}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                        {c.currentProceeding}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "text-xs font-bold",
                        c.status === 'Urgent' ? "text-red-500" : "text-zinc-400"
                      )}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <FileText size={40} className="text-zinc-200" />
              </div>
              <h3 className="text-xl font-display font-bold">No Cause List Available</h3>
              <p className="text-zinc-500 max-w-sm mt-2">
                There are no hearings scheduled for this date. You can add cases from the Case Repository.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
