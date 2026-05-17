import React from 'react';
import { X, Plus, Trash2, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { LegalCase } from '../types';

const NOTES_KEY = 'legal_hearing_notes';

interface HearingNote {
  id: string;
  date: string;
  note: string;
  outcome: string;
  createdAt: string;
}

const getNotes = (caseId: string): HearingNote[] => {
  const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
  return all[caseId] || [];
};

const saveNote = (caseId: string, note: HearingNote) => {
  const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
  all[caseId] = [...(all[caseId] || []), note];
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
};

const deleteNote = (caseId: string, noteId: string) => {
  const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
  all[caseId] = (all[caseId] || []).filter((n: HearingNote) => n.id !== noteId);
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
};

interface Props {
  legalCase: LegalCase;
  onClose: () => void;
}

export const HearingNotes = ({ legalCase, onClose }: Props) => {
  const [notes, setNotes] = React.useState<HearingNote[]>(getNotes(legalCase.id));
  const [showAdd, setShowAdd] = React.useState(false);
  const [form, setForm] = React.useState({ date: format(new Date(), 'yyyy-MM-dd'), note: '', outcome: '' });

  const handleAdd = () => {
    if (!form.note.trim()) return;
    const newNote: HearingNote = {
      id: Date.now().toString(),
      date: form.date,
      note: form.note,
      outcome: form.outcome,
      createdAt: new Date().toISOString(),
    };
    saveNote(legalCase.id, newNote);
    setNotes(getNotes(legalCase.id));
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), note: '', outcome: '' });
    setShowAdd(false);
  };

  const handleDelete = (noteId: string) => {
    deleteNote(legalCase.id, noteId);
    setNotes(getNotes(legalCase.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b dark:border-zinc-700 flex justify-between items-start"
          style={{ background: 'linear-gradient(135deg, #0a0f1e, #111827)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-legal-green font-black">Hearing Notes</p>
            <h3 className="text-white font-display font-bold text-lg leading-tight mt-0.5 truncate">
              {legalCase.parties.plaintiff} vs {legalCase.parties.defendant}
            </h3>
            <p className="text-zinc-400 text-xs font-mono mt-0.5">{legalCase.caseNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl text-white ml-3 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 && !showAdd && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={36} className="text-zinc-200 mb-3" />
              <p className="font-bold text-zinc-400">No hearing notes yet</p>
              <p className="text-xs text-zinc-300 mt-1">Add notes for each hearing date</p>
            </div>
          )}

          {[...notes].reverse().map(n => (
            <motion.div key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-legal-green" />
                  <span className="text-xs font-bold text-zinc-500">
                    {format(new Date(n.date + 'T00:00:00'), 'dd MMM yyyy')}
                  </span>
                </div>
                <button onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
              {n.outcome && (
                <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100 mb-2">
                  {n.outcome}
                </span>
              )}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{n.note}</p>
            </motion.div>
          ))}

          {/* Add Note Form */}
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl border-2 border-legal-green p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-legal-green">New Hearing Note</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block">Hearing Date</label>
                    <input type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-legal-green dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 mb-1 block">Outcome</label>
                    <select value={form.outcome}
                      onChange={e => setForm({ ...form, outcome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-legal-green dark:bg-zinc-700 dark:border-zinc-600 dark:text-white">
                      <option value="">Select...</option>
                      <option>Arguments Heard</option>
                      <option>Next Date Fixed</option>
                      <option>Stayed</option>
                      <option>Adjourned</option>
                      <option>Order Reserved</option>
                      <option>Order Passed</option>
                      <option>Disposed</option>
                      <option>Charge Framed</option>
                      <option>Evidence Recorded</option>
                      <option>Bailable Warrant</option>
                      <option>Non-Bailable Warrant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">Notes</label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    placeholder="What happened in today's hearing..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-legal-green resize-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-white" />
                </div>

                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={!form.note.trim()}
                    className="flex-1 py-2.5 bg-legal-green text-white rounded-xl font-bold text-sm disabled:opacity-40">
                    Save Note
                  </button>
                  <button onClick={() => setShowAdd(false)}
                    className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!showAdd && (
          <div className="p-4 border-t dark:border-zinc-700">
            <button onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-legal-green text-white rounded-2xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-all">
              <Plus size={18} /> Add Hearing Note
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
