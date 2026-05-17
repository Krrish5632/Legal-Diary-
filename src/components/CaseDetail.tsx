import React from 'react';
import {
  X, Calendar, MapPin, Scale, User, Phone,
  ArrowRight, Check, Clock, FileText, Share2,
  ChevronRight, Plus, Trash2, IndianRupee,
  Printer, Edit2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
import { LegalCase } from '../types';
import { getSettings } from './Settings';

const NOTES_KEY = 'legal_hearing_notes';
const FEES_KEY = 'legal_case_fees';

interface HearingNote {
  id: string; date: string; note: string; outcome: string; createdAt: string;
}

interface FeeEntry {
  id: string; date: string; amount: number; type: 'received' | 'pending'; description: string;
}

const getNotes = (id: string): HearingNote[] => {
  const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
  return (all[id] || []).sort((a: HearingNote, b: HearingNote) => b.date.localeCompare(a.date));
};

const getFees = (id: string): FeeEntry[] => {
  const all = JSON.parse(localStorage.getItem(FEES_KEY) || '{}');
  return all[id] || [];
};

const saveFee = (caseId: string, fee: FeeEntry) => {
  const all = JSON.parse(localStorage.getItem(FEES_KEY) || '{}');
  all[caseId] = [...(all[caseId] || []), fee];
  localStorage.setItem(FEES_KEY, JSON.stringify(all));
};

const deleteFee = (caseId: string, feeId: string) => {
  const all = JSON.parse(localStorage.getItem(FEES_KEY) || '{}');
  all[caseId] = (all[caseId] || []).filter((f: FeeEntry) => f.id !== feeId);
  localStorage.setItem(FEES_KEY, JSON.stringify(all));
};

const updateNextDate = (caseId: string, newDate: string) => {
  const cases = JSON.parse(localStorage.getItem('legal_cases') || '[]');
  const updated = cases.map((c: any) => c.id === caseId ? { ...c, nextDate: newDate } : c);
  localStorage.setItem('legal_cases', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage_update'));
};

interface Props {
  legalCase: LegalCase;
  onClose: () => void;
  onEdit?: (c: LegalCase) => void;
}

export const CaseDetail = ({ legalCase, onClose, onEdit }: Props) => {
  const [tab, setTab] = React.useState<'info'|'timeline'|'fees'>('info');
  const [notes, setNotes] = React.useState<HearingNote[]>(getNotes(legalCase.id));
  const [fees, setFees] = React.useState<FeeEntry[]>(getFees(legalCase.id));
  const [forwardDate, setForwardDate] = React.useState('');
  const [showForward, setShowForward] = React.useState(false);
  const [showFeeForm, setShowFeeForm] = React.useState(false);
  const [showNoteForm, setShowNoteForm] = React.useState(false);
  const [nextDate, setNextDate] = React.useState(legalCase.nextDate || '');
  const [feeForm, setFeeForm] = React.useState({ date: format(new Date(), 'yyyy-MM-dd'), amount: '', type: 'received' as const, description: '' });
  const [noteForm, setNoteForm] = React.useState({ date: format(new Date(), 'yyyy-MM-dd'), note: '', outcome: '' });

  const daysUntil = nextDate ? differenceInDays(new Date(nextDate + 'T00:00:00'), new Date()) : null;
  const totalReceived = fees.filter(f => f.type === 'received').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.type === 'pending').reduce((s, f) => s + f.amount, 0);

  const handleForward = () => {
    if (!forwardDate) return;
    updateNextDate(legalCase.id, forwardDate);
    setNextDate(forwardDate);
    setForwardDate('');
    setShowForward(false);
  };

  const handleAddFee = () => {
    if (!feeForm.amount) return;
    const fee: FeeEntry = { id: Date.now().toString(), date: feeForm.date, amount: Number(feeForm.amount), type: feeForm.type, description: feeForm.description };
    saveFee(legalCase.id, fee);
    setFees(getFees(legalCase.id));
    setFeeForm({ date: format(new Date(), 'yyyy-MM-dd'), amount: '', type: 'received', description: '' });
    setShowFeeForm(false);
  };

  const handleAddNote = () => {
    if (!noteForm.note.trim()) return;
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    const newNote = { id: Date.now().toString(), date: noteForm.date, note: noteForm.note, outcome: noteForm.outcome, createdAt: new Date().toISOString() };
    all[legalCase.id] = [...(all[legalCase.id] || []), newNote];
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
    setNotes(getNotes(legalCase.id));
    setNoteForm({ date: format(new Date(), 'yyyy-MM-dd'), note: '', outcome: '' });
    setShowNoteForm(false);
  };

  const handleWhatsApp = () => {
    const settings = getSettings();
    const dateStr = nextDate ? format(new Date(nextDate + 'T00:00:00'), 'dd MMM yyyy') : 'Not fixed';
    const msg = `*CASE INFORMATION*\n\n*Advocate:* ${settings.advocateName}\n*Case:* ${legalCase.parties.plaintiff} vs ${legalCase.parties.defendant}\n*Case No:* ${legalCase.caseNumber}\n*Court:* ${legalCase.court.name}\n*Type:* ${legalCase.caseType}\n*Status:* ${legalCase.status}\n*Next Date:* ${dateStr}\n*Stage:* ${legalCase.currentProceeding}\n\n_Sent from Legal Diary Pro_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const tabs = [
    { id: 'info', label: 'Case Info' },
    { id: 'timeline', label: `Notes (${notes.length})` },
    { id: 'fees', label: `Fees (₹${(totalReceived + totalPending).toLocaleString()})` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[93vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f2318 100%)' }}>
          <div className="absolute top-2 right-2 opacity-10">
            <Scale size={80} className="text-legal-gold" />
          </div>
          <div className="relative z-10 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${legalCase.status === 'Urgent' ? 'bg-red-500/20 text-red-400' : 'bg-legal-green/20 text-legal-green'}`}>
                    {legalCase.status}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">{legalCase.caseType}</span>
                </div>
                <h3 className="text-white font-display font-bold text-xl leading-tight">
                  {legalCase.parties.plaintiff}
                </h3>
                <p className="text-zinc-400 text-sm mt-0.5">vs {legalCase.parties.defendant}</p>
                <p className="text-zinc-500 text-xs font-mono mt-1">{legalCase.caseNumber}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onEdit && (
                  <button onClick={() => onEdit(legalCase)}
                    className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                    <Edit2 size={16} />
                  </button>
                )}
                <button onClick={onClose}
                  className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Next Date + Forward */}
            <div className="mt-4 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Next Hearing</p>
                  <p className="text-white font-bold text-base mt-0.5">
                    {nextDate ? format(new Date(nextDate + 'T00:00:00'), 'dd MMMM yyyy') : 'Not Fixed'}
                  </p>
                  {daysUntil !== null && (
                    <p className={`text-xs font-bold mt-0.5 ${daysUntil < 0 ? 'text-red-400' : daysUntil <= 3 ? 'text-amber-400' : 'text-legal-green'}`}>
                      {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : daysUntil === 0 ? 'Today!' : `In ${daysUntil} days`}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowForward(!showForward)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
                  <ArrowRight size={16} className="text-white" />
                  <span className="text-white">Forward Date</span>
                </button>
              </div>

              <AnimatePresence>
                {showForward && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                      <input
                        type="date"
                        value={forwardDate}
                        onChange={e => setForwardDate(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none font-medium"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                      <button onClick={handleForward} disabled={!forwardDate}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-legal-green text-white rounded-xl font-bold text-sm disabled:opacity-40">
                        <Check size={16} /> Save
                      </button>
                      <button onClick={() => setShowForward(false)}
                        className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3">
              <button onClick={handleWhatsApp}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold flex-1 justify-center transition-all"
                style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}>
                <Share2 size={14} /> WhatsApp Share
              </button>
              <button onClick={() => setTab('timeline')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold flex-1 justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}>
                <FileText size={14} /> Add Note
              </button>
              <button onClick={() => setTab('fees')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold flex-1 justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
                <IndianRupee size={14} /> Track Fee
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${tab === t.id ? 'border-legal-green text-legal-green' : 'border-transparent text-zinc-400'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Case Info Tab */}
          {tab === 'info' && (
            <div className="p-5 space-y-4">
              {[
                { icon: <Scale size={16} className="text-legal-green" />, label: 'Court', value: legalCase.court.name },
                { icon: <User size={16} className="text-legal-gold" />, label: 'Judge', value: legalCase.court.judgeName || 'Not specified' },
                { icon: <MapPin size={16} className="text-blue-500" />, label: 'Court Room', value: legalCase.court.courtRoom || 'Not specified' },
                { icon: <FileText size={16} className="text-purple-500" />, label: 'Current Stage', value: legalCase.currentProceeding },
                { icon: <Clock size={16} className="text-amber-500" />, label: 'Filing Date', value: legalCase.filingDate ? format(new Date(legalCase.filingDate + 'T00:00:00'), 'dd MMM yyyy') : 'Not specified' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-bold text-zinc-800 text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}

              {legalCase.notes && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Case Notes</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{legalCase.notes}</p>
                </div>
              )}

              {/* Parties Detail */}
              <div className="p-4 bg-zinc-900 rounded-2xl text-white">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Parties</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-legal-green font-bold uppercase">Plaintiff / Complainant</p>
                    <p className="font-bold">{legalCase.parties.plaintiff}</p>
                  </div>
                  <div className="border-t border-zinc-700 pt-2">
                    <p className="text-[10px] text-red-400 font-bold uppercase">Defendant / Accused</p>
                    <p className="font-bold">{legalCase.parties.defendant}</p>
                  </div>
                  {legalCase.parties.advocateOpposite && (
                    <div className="border-t border-zinc-700 pt-2">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">Opposite Advocate</p>
                      <p className="font-bold text-zinc-300">{legalCase.parties.advocateOpposite}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline / Notes Tab */}
          {tab === 'timeline' && (
            <div className="p-5 space-y-3">
              <button onClick={() => setShowNoteForm(!showNoteForm)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-legal-green/10 text-legal-green border border-legal-green/20 rounded-2xl font-bold text-sm hover:bg-legal-green/20 transition-all">
                <Plus size={16} /> Add Hearing Note
              </button>

              <AnimatePresence>
                {showNoteForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="p-4 bg-white border-2 border-legal-green rounded-2xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-zinc-400 mb-1 block">Date</label>
                          <input type="date" value={noteForm.date}
                            onChange={e => setNoteForm({ ...noteForm, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-400 mb-1 block">Outcome</label>
                          <select value={noteForm.outcome}
                            onChange={e => setNoteForm({ ...noteForm, outcome: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none">
                            <option value="">Select...</option>
                            {['Arguments Heard','Next Date Fixed','Stayed','Adjourned','Order Reserved','Order Passed','Disposed','Charge Framed','Evidence Recorded','Bailable Warrant','Non-Bailable Warrant'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>
                      <textarea value={noteForm.note}
                        onChange={e => setNoteForm({ ...noteForm, note: e.target.value })}
                        placeholder="What happened in this hearing..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none resize-none" />
                      <div className="flex gap-2">
                        <button onClick={handleAddNote} disabled={!noteForm.note.trim()}
                          className="flex-1 py-2.5 bg-legal-green text-white rounded-xl font-bold text-sm disabled:opacity-40">
                          Save
                        </button>
                        <button onClick={() => setShowNoteForm(false)}
                          className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {notes.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock size={36} className="text-zinc-200 mx-auto mb-3" />
                  <p className="text-zinc-400 font-bold">No hearing notes yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-zinc-100" />
                  <div className="space-y-4">
                    {notes.map((n, i) => (
                      <div key={n.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-white border-2 border-zinc-200 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm">
                          <span className="text-xs font-black text-zinc-400">{i + 1}</span>
                        </div>
                        <div className="flex-1 bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-zinc-500">
                              {format(new Date(n.date + 'T00:00:00'), 'dd MMM yyyy')}
                            </p>
                            <button onClick={() => {
                              const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
                              all[legalCase.id] = (all[legalCase.id] || []).filter((x: any) => x.id !== n.id);
                              localStorage.setItem(NOTES_KEY, JSON.stringify(all));
                              setNotes(getNotes(legalCase.id));
                            }} className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          {n.outcome && (
                            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100 mb-2">
                              {n.outcome}
                            </span>
                          )}
                          <p className="text-sm text-zinc-700 leading-relaxed">{n.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fees Tab */}
          {tab === 'fees' && (
            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-black text-green-600 tracking-wider">Received</p>
                  <p className="text-2xl font-display font-bold text-green-700 mt-1">₹{totalReceived.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-black text-red-500 tracking-wider">Pending</p>
                  <p className="text-2xl font-display font-bold text-red-600 mt-1">₹{totalPending.toLocaleString()}</p>
                </div>
              </div>

              <button onClick={() => setShowFeeForm(!showFeeForm)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all">
                <Plus size={16} /> Add Fee Entry
              </button>

              <AnimatePresence>
                {showFeeForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="p-4 bg-white border-2 border-blue-400 rounded-2xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-zinc-400 mb-1 block">Date</label>
                          <input type="date" value={feeForm.date}
                            onChange={e => setFeeForm({ ...feeForm, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-400 mb-1 block">Amount (₹)</label>
                          <input type="number" value={feeForm.amount} placeholder="0"
                            onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(['received', 'pending'] as const).map(t => (
                          <button key={t} onClick={() => setFeeForm({ ...feeForm, type: t })}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${feeForm.type === t ? t === 'received' ? 'bg-green-500 text-white' : 'bg-red-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <input value={feeForm.description} placeholder="Description (e.g. Appearance fee)"
                        onChange={e => setFeeForm({ ...feeForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none" />
                      <div className="flex gap-2">
                        <button onClick={handleAddFee} disabled={!feeForm.amount}
                          className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:opacity-40">
                          Save
                        </button>
                        <button onClick={() => setShowFeeForm(false)}
                          className="flex-1 py-2.5 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {fees.length === 0 ? (
                <div className="py-10 text-center">
                  <IndianRupee size={36} className="text-zinc-200 mx-auto mb-3" />
                  <p className="text-zinc-400 font-bold">No fee entries yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...fees].reverse().map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                      <div>
                        <p className="font-bold text-sm">{f.description || (f.type === 'received' ? 'Fee Received' : 'Fee Pending')}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{format(new Date(f.date + 'T00:00:00'), 'dd MMM yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-base font-display font-bold ${f.type === 'received' ? 'text-green-600' : 'text-red-500'}`}>
                          {f.type === 'received' ? '+' : '-'}₹{f.amount.toLocaleString()}
                        </span>
                        <button onClick={() => { deleteFee(legalCase.id, f.id); setFees(getFees(legalCase.id)); }}
                          className="p-1.5 text-zinc-300 hover:text-red-500 rounded-lg transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
