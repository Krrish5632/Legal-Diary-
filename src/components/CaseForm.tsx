/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  Scale, 
  MapPin, 
  User, 
  Search as SearchIcon, 
  Shield, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { storage } from '../lib/storage';
import { CourtType, CaseStatus, ProceedingType, LegalCase } from '../types';
import { gemini } from '../lib/gemini';

const schema = z.object({
  caseType: z.string().min(1, 'Required'),
  caseNumber: z.string().min(1, 'Required'),
  filingYear: z.coerce.number().min(1900).max(2100),
  court: z.object({
    name: z.string().min(1, 'Required'),
    number: z.string().default(''),
    judgeName: z.string().default(''),
    district: z.string().default(''),
    state: z.string().default(''),
    type: z.nativeEnum(CourtType),
  }),
  parties: z.object({
    plaintiff: z.string().min(1, 'Required'),
    defendant: z.string().min(1, 'Required'),
    versus: z.string().default('vs'),
    advocateName: z.string().default(''),
    oppositeCounsel: z.string().default(''),
  }),
  nextDate: z.string(),
  status: z.nativeEnum(CaseStatus),
  currentProceeding: z.nativeEnum(ProceedingType),
  legalSections: z.object({
    policeStation: z.string().default(''),
    firNumber: z.string().default(''),
    sections: z.string().default(''),
    ipcSections: z.array(z.string()).default([]),
    crpcSections: z.array(z.string()).default([]),
    evidenceActSections: z.array(z.string()).default([]),
  }),
  notes: z.string().default(''),
});

interface CaseFormProps {
  onClose: () => void;
  initialData?: LegalCase;
}

export const CaseForm = ({ onClose, initialData }: CaseFormProps) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      caseType: '',
      caseNumber: '',
      filingYear: new Date().getFullYear(),
      court: { type: CourtType.CIVIL, name: '', district: '', state: '', number: '', judgeName: '' },
      parties: { plaintiff: '', defendant: '', versus: 'vs', advocateName: '', oppositeCounsel: '' },
      status: CaseStatus.PENDING,
      currentProceeding: ProceedingType.MISCELLANEOUS,
      nextDate: new Date().toISOString().split('T')[0],
      legalSections: initialData?.legalSections || { policeStation: '', firNumber: '', sections: '', ipcSections: [], crpcSections: [], evidenceActSections: [] },
      notes: '',
    }
  });

  const caseType = watch('caseType');
  const isCriminal = caseType?.toLowerCase().includes('criminal');

  const [aiLoading, setAiLoading] = React.useState(false);

  const onSubmit = (data: any) => {
    console.log("Saving case data:", data);
    storage.saveCase({
      ...data,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      history: initialData?.history || [],
      voiceNotes: initialData?.voiceNotes || [],
      documents: initialData?.documents || [],
      priority: initialData?.priority || false,
    });
    onClose();
  };

  const onError = (err: any) => {
    console.error("Validation errors:", err);
    alert("Please check the form for errors. Some required fields might be missing.");
  };

  const handleAiSuggest = async () => {
    const val = watch('caseType') + ' ' + watch('caseNumber');
    if (!val.trim()) return;
    setAiLoading(true);
    const suggestions = await gemini.suggestSections(val);
    alert("AI Suggestions:\n" + suggestions); // Simple alert for now
    setAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white p-6 border-bottom flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold">{initialData ? 'Edit Case' : 'New Case Entry'}</h2>
            <p className="text-zinc-500 text-sm">Enter the legal details of the new filing.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="p-8 space-y-8">
          {/* Case Identification */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-legal-green font-bold uppercase text-xs tracking-widest">
              <Scale size={16} />
              <span>Case Identification</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Case Type</label>
                <input {...register('caseType')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="e.g. Criminal, Civil" />
                {errors.caseType && <span className="text-red-500 text-[10px] font-bold">{String(errors.caseType.message)}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Case Number</label>
                <input {...register('caseNumber')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="152/2026" />
                {errors.caseNumber && <span className="text-red-500 text-[10px] font-bold">{String(errors.caseNumber.message)}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Filing Year</label>
                <input {...register('filingYear')} type="number" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" />
                {errors.filingYear && <span className="text-red-500 text-[10px] font-bold">{String(errors.filingYear.message)}</span>}
              </div>
            </div>
          </section>

          {/* Court Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-legal-green font-bold uppercase text-xs tracking-widest">
              <MapPin size={16} />
              <span>Court Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Court Name</label>
                <input {...register('court.name')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="High Court of..." />
                {errors.court?.name && <span className="text-red-500 text-[10px] font-bold">{String(errors.court.name.message)}</span>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Judge Name</label>
                <input {...register('court.judgeName')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="Hon'ble Justice..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Court Type</label>
                <select {...register('court.type')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none">
                  {Object.values(CourtType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Party Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-legal-green font-bold uppercase text-xs tracking-widest">
              <User size={16} />
              <span>Party Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Plaintiff / Petitioner</label>
                <input {...register('parties.plaintiff')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" />
                {errors.parties?.plaintiff && <span className="text-red-500 text-[10px] font-bold">{String(errors.parties.plaintiff.message)}</span>}
              </div>
              <div className="flex items-end justify-center pb-3">
                <span className="font-display italic text-zinc-400">Versus</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Defendant / Respondent</label>
                <input {...register('parties.defendant')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" />
                {errors.parties?.defendant && <span className="text-red-500 text-[10px] font-bold">{String(errors.parties.defendant.message)}</span>}
              </div>
            </div>
          </section>

          {/* Conditional Criminal Fields */}
          {isCriminal && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-4 border-t border-dashed border-zinc-200"
            >
              <div className="flex items-center gap-2 text-red-600 font-bold uppercase text-xs tracking-widest">
                <Shield size={16} />
                <span>Criminal Case Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Police Station</label>
                  <input {...register('legalSections.policeStation')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="Enter Station Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">FIR Number</label>
                  <input {...register('legalSections.firNumber')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="FIR No." />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Sections (IPC/BNS/CrPC)</label>
                  <input {...register('legalSections.sections')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" placeholder="e.g. 302, 307 IPC" />
                </div>
              </div>
            </motion.section>
          )}

          {/* Next Hearing */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-legal-green font-bold uppercase text-xs tracking-widest">
              <CalendarIcon size={16} />
              <span>Next Hearing Schedule</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Next Date</label>
                <input {...register('nextDate')} type="date" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Proceeding Type</label>
                <select {...register('currentProceeding')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none">
                  {Object.values(ProceedingType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Status</label>
                <select {...register('status')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-legal-green outline-none">
                  {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Accused & Remarks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-xs tracking-widest">
              <span>Accused Details & Legal Remarks</span>
            </div>
            <textarea 
              {...register('notes')}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-legal-green outline-none min-h-[120px]"
              placeholder="Enter accused names, specific details or any other legal comments here..."
            />
          </section>

          <footer className="pt-8 border-t flex flex-col md:flex-row gap-4 items-center justify-between">
            <button 
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Sparkles size={18} className="text-legal-gold" />
              {aiLoading ? 'Analyzing...' : 'AI Section Suggestion'}
            </button>
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-zinc-200 font-bold hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 md:flex-none px-12 py-3 bg-legal-green text-white rounded-xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-opacity"
              >
                Save Case
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};
