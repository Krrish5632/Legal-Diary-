import React from 'react';
import { Calculator, Clock, Scale, IndianRupee, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, addYears, addMonths } from 'date-fns';
import { cn } from '../lib/utils';

type CalcType = 'courtfee' | 'limitation' | 'stampduty' | 'penalty';

const LIMITATION_PERIODS = [
  { category: 'Money Recovery', description: 'Recovery of money (on contract)', period: '3 years', section: 'Limitation Act Art. 18', startPoint: 'Date when money becomes due' },
  { category: 'Mortgage Suit', description: 'Foreclosure or redemption of mortgage', period: '30 years', section: 'Limitation Act Art. 61', startPoint: 'Date when right to sue accrues' },
  { category: 'Possession of Property', description: 'Recovery of immovable property', period: '12 years', section: 'Limitation Act Art. 65', startPoint: 'Date of dispossession' },
  { category: 'Tort/Negligence', description: 'Compensation for wrong to person or movable property', period: '3 years', section: 'Limitation Act Art. 75', startPoint: 'Date when wrong is committed' },
  { category: 'Defamation', description: 'Compensation for libel or slander', period: '1 year', section: 'Limitation Act Art. 75', startPoint: 'Date of defamation' },
  { category: 'Cheque Bounce (NI Act)', description: 'Complaint under Section 138', period: '30 days from legal notice expiry', section: 'NI Act S.142', startPoint: '15 days after notice + 30 days' },
  { category: 'Appeal (Civil)', description: 'Appeal from decree in civil suit', period: '30/90 days', section: 'Limitation Act Art. 116', startPoint: 'Date of decree' },
  { category: 'Appeal (Criminal)', description: 'Appeal against conviction', period: '30/60 days', section: 'BNSS / CrPC', startPoint: 'Date of sentence' },
  { category: 'Revision (HC)', description: 'Revision to High Court', period: '90 days', section: 'Limitation Act Art. 131', startPoint: 'Date of order' },
  { category: 'Writ Petition', description: 'Writ to High Court / Supreme Court', period: 'No fixed (laches applies)', section: 'Constitution Art. 226/32', startPoint: 'Cause of action' },
  { category: 'Consumer Complaint', description: 'Complaint to Consumer Forum', period: '2 years', section: 'Consumer Protection Act S.69', startPoint: 'Date of cause of action' },
  { category: 'Labour/Service', description: 'Dispute under Industrial Disputes Act', period: '3 years', section: 'ID Act S.2A', startPoint: 'Date of dispute' },
  { category: 'Motor Accident (MACT)', description: 'Claim before Motor Accident Tribunal', period: '6 months', section: 'MV Act S.166', startPoint: 'Date of accident' },
  { category: 'Execution of Decree', description: 'Application for execution', period: '12 years', section: 'Limitation Act Art. 136', startPoint: 'Date of decree' },
];

const calcCourtFee = (amount: number, court: string): { fee: number; breakdown: string[] } => {
  const breakdown: string[] = [];
  let fee = 0;

  if (court === 'district') {
    if (amount <= 5000) { fee = Math.max(100, amount * 0.08); breakdown.push('Up to ₹5,000: 8%'); }
    else if (amount <= 10000) { fee = 400 + (amount - 5000) * 0.06; breakdown.push('₹5,001-10,000: 6%'); }
    else if (amount <= 50000) { fee = 700 + (amount - 10000) * 0.05; breakdown.push('₹10,001-50,000: 5%'); }
    else if (amount <= 100000) { fee = 2700 + (amount - 50000) * 0.04; breakdown.push('₹50,001-1,00,000: 4%'); }
    else if (amount <= 500000) { fee = 4700 + (amount - 100000) * 0.03; breakdown.push('₹1,00,001-5,00,000: 3%'); }
    else { fee = 16700 + (amount - 500000) * 0.02; breakdown.push('Above ₹5,00,000: 2%'); }
    breakdown.push(`Court: District Court`);
  } else if (court === 'hc') {
    fee = Math.min(amount * 0.025, 100000);
    breakdown.push('High Court: 2.5% (Max ₹1,00,000)');
  } else {
    fee = Math.min(amount * 0.01, 50000);
    breakdown.push('Supreme Court: 1% (Max ₹50,000)');
  }

  return { fee: Math.round(fee), breakdown };
};

export const LegalCalculator = () => {
  const [activeCalc, setActiveCalc] = React.useState<CalcType>('courtfee');
  const [courtFeeAmount, setCourtFeeAmount] = React.useState('');
  const [courtFeeType, setCourtFeeType] = React.useState('district');
  const [courtFeeResult, setCourtFeeResult] = React.useState<{ fee: number; breakdown: string[] } | null>(null);
  const [limFromDate, setLimFromDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [limPeriod, setLimPeriod] = React.useState('');
  const [limResult, setLimResult] = React.useState<Date | null>(null);
  const [penaltyAmount, setPenaltyAmount] = React.parameter = React.useState('');
  const [penaltyRate, setPenaltyRate] = React.useState('18');
  const [penaltyDays, setPenaltyDays] = React.useState('');
  const [penaltyResult, setPenaltyResult] = React.useState<number | null>(null);

  const calcTabs = [
    { id: 'courtfee', label: 'Court Fee', icon: <Scale size={16} /> },
    { id: 'limitation', label: 'Limitation', icon: <Clock size={16} /> },
    { id: 'stampduty', label: 'Stamp Duty', icon: <IndianRupee size={16} /> },
    { id: 'penalty', label: 'Penalty/Interest', icon: <Calculator size={16} /> },
  ];

  const handleCourtFee = () => {
    const amt = parseFloat(courtFeeAmount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) return;
    setCourtFeeResult(calcCourtFee(amt, courtFeeType));
  };

  const handleLimitation = () => {
    const periodDays: Record<string, number> = {
      '1year': 365, '2years': 730, '3years': 1095,
      '6months': 180, '30days': 30, '60days': 60,
      '90days': 90, '12years': 4380, '30years': 10950,
    };
    const days = periodDays[limPeriod];
    if (!days || !limFromDate) return;
    setLimResult(addDays(new Date(limFromDate + 'T00:00:00'), days));
  };

  const handlePenalty = () => {
    const amt = parseFloat(penaltyAmount);
    const rate = parseFloat(penaltyRate);
    const days = parseFloat(penaltyDays);
    if (isNaN(amt) || isNaN(rate) || isNaN(days)) return;
    const interest = (amt * rate * days) / (100 * 365);
    setPenaltyResult(Math.round(interest));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 shrink-0" style={{ background: 'linear-gradient(135deg, #0a0f1e, #1a2035)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Calculator size={24} className="text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-400">Legal Tools</p>
            <h2 className="text-2xl font-display font-bold text-white">Legal Calculator</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white shrink-0 overflow-x-auto">
        {calcTabs.map(t => (
          <button key={t.id} onClick={() => setActiveCalc(t.id as CalcType)}
            className={cn('flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all',
              activeCalc === t.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-zinc-400')}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* Court Fee Calculator */}
        {activeCalc === 'courtfee' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-lg">Court Fee Calculator</h3>
              <p className="text-xs text-zinc-500">CPC Order VII Rule 1 — Ad valorem court fee calculation</p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Claim Amount (₹)</label>
                  <input type="number" value={courtFeeAmount} onChange={e => setCourtFeeAmount(e.target.value)}
                    placeholder="Enter claim amount"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Court Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[['district', 'District Court'], ['hc', 'High Court'], ['sc', 'Supreme Court']].map(([v, l]) => (
                      <button key={v} onClick={() => setCourtFeeType(v)}
                        className={cn('py-2.5 rounded-xl text-xs font-bold transition-all',
                          courtFeeType === v ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-600')}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCourtFee}
                  className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all">
                  Calculate Court Fee
                </button>
              </div>

              {courtFeeResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-amber-600 tracking-widest">Court Fee Payable</p>
                  <p className="text-4xl font-display font-bold text-amber-700 mt-1">
                    ₹{courtFeeResult.fee.toLocaleString()}
                  </p>
                  <div className="mt-3 pt-3 border-t border-amber-200 space-y-1">
                    {courtFeeResult.breakdown.map((b, i) => (
                      <p key={i} className="text-xs text-amber-700">• {b}</p>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-500 mt-2">* Approximate. Verify with court registry. State-specific rates may vary.</p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Limitation Calculator */}
        {activeCalc === 'limitation' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-lg">Limitation Period Calculator</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Start Date (Cause of Action)</label>
                  <input type="date" value={limFromDate} onChange={e => setLimFromDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Limitation Period</label>
                  <select value={limPeriod} onChange={e => setLimPeriod(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm outline-none focus:border-amber-400">
                    <option value="">Select period...</option>
                    <option value="30days">30 Days</option>
                    <option value="60days">60 Days</option>
                    <option value="90days">90 Days</option>
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="3years">3 Years (Standard)</option>
                    <option value="12years">12 Years (Property)</option>
                    <option value="30years">30 Years (Mortgage)</option>
                  </select>
                </div>
                <button onClick={handleLimitation}
                  className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all">
                  Calculate Deadline
                </button>
              </div>

              {limResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('p-5 rounded-2xl border', limResult < new Date() ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                  <p className={cn('text-[10px] uppercase font-black tracking-widest', limResult < new Date() ? 'text-red-500' : 'text-green-600')}>
                    {limResult < new Date() ? '⚠️ Limitation Expired!' : '✓ Last Date to File'}
                  </p>
                  <p className={cn('text-3xl font-display font-bold mt-1', limResult < new Date() ? 'text-red-600' : 'text-green-700')}>
                    {format(limResult, 'dd MMMM yyyy')}
                  </p>
                  <p className={cn('text-sm mt-1', limResult < new Date() ? 'text-red-500' : 'text-green-600')}>
                    {limResult < new Date()
                      ? `⚠️ Barred by limitation! Condonation of delay needed.`
                      : `${Math.ceil((limResult.getTime() - Date.now()) / 86400000)} days remaining`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">* Section 5 Limitation Act allows condonation for sufficient cause. Sundays/holidays may extend deadline.</p>
                </motion.div>
              )}
            </div>

            {/* Reference Table */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-zinc-50">
                <h3 className="font-bold text-sm">Limitation Period Reference</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                {LIMITATION_PERIODS.map((l, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-zinc-900">{l.category}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{l.description}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">{l.section}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                          {l.period}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-1">📍 {l.startPoint}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stamp Duty */}
        {activeCalc === 'stampduty' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-4">Stamp Duty Reference (UP)</h3>
              {[
                { doc: 'Vakalatnama', duty: '₹10 (Non-Judicial)' },
                { doc: 'Affidavit', duty: '₹10' },
                { doc: 'Power of Attorney (General)', duty: '₹100-500' },
                { doc: 'Power of Attorney (Specific)', duty: '₹500-1000' },
                { doc: 'Sale Deed (Immovable Property)', duty: '7% of value' },
                { doc: 'Gift Deed (Blood Relation)', duty: '1% of value' },
                { doc: 'Gift Deed (Others)', duty: '5% of value' },
                { doc: 'Agreement to Sale', duty: '₹100' },
                { doc: 'Lease Deed (Up to 1 year)', duty: '₹50' },
                { doc: 'Lease Deed (1-5 years)', duty: '2% of annual rent' },
                { doc: 'Lease Deed (5-10 years)', duty: '4% of annual rent' },
                { doc: 'Promissory Note', duty: '₹5-50 based on amount' },
                { doc: 'Adoption Deed', duty: '₹100' },
                { doc: 'Will', duty: 'Nil (but Rs.200 for probate)' },
                { doc: 'Partition Deed', duty: '2% of share value' },
                { doc: 'Partnership Deed', duty: '₹300' },
                { doc: 'Indemnity Bond', duty: '₹100' },
                { doc: 'Surety Bond', duty: '₹50-200' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-zinc-50 last:border-0">
                  <p className="text-sm text-zinc-700">{s.doc}</p>
                  <p className="text-sm font-bold text-amber-600">{s.duty}</p>
                </div>
              ))}
              <p className="text-xs text-zinc-400 mt-4">* UP Stamp Act rates. Other states may vary. Verify with local stamp vendor.</p>
            </div>
          </div>
        )}

        {/* Penalty/Interest Calculator */}
        {activeCalc === 'penalty' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-lg">Penalty & Interest Calculator</h3>
              <p className="text-xs text-zinc-500">Simple interest calculation for decree, cheque bounce, money suits</p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Principal Amount (₹)</label>
                  <input type="number" value={penaltyAmount} onChange={e => setPenaltyAmount(e.target.value)}
                    placeholder="Enter principal amount"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Annual Interest Rate (%)</label>
                  <div className="flex gap-2">
                    {['6', '9', '12', '18', '24'].map(r => (
                      <button key={r} onClick={() => setPenaltyRate(r)}
                        className={cn('flex-1 py-2 rounded-xl text-xs font-bold transition-all',
                          penaltyRate === r ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-600')}>
                        {r}%
                      </button>
                    ))}
                  </div>
                  <input type="number" value={penaltyRate} onChange={e => setPenaltyRate(e.target.value)}
                    placeholder="Custom rate"
                    className="w-full mt-2 px-4 py-3 rounded-2xl border border-zinc-200 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Number of Days</label>
                  <input type="number" value={penaltyDays} onChange={e => setPenaltyDays(e.target.value)}
                    placeholder="Days from default to today"
                    className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm outline-none focus:border-amber-400" />
                </div>
                <button onClick={handlePenalty}
                  className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all">
                  Calculate Interest
                </button>
              </div>

              {penaltyResult !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-black text-amber-600 tracking-widest">Interest Amount</p>
                    <p className="text-4xl font-display font-bold text-amber-700">₹{penaltyResult.toLocaleString()}</p>
                  </div>
                  <div className="pt-3 border-t border-amber-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Principal</span>
                      <span className="font-bold">₹{parseFloat(penaltyAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-zinc-600">Interest</span>
                      <span className="font-bold text-amber-600">₹{penaltyResult.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-amber-200">
                      <span>Total Claim</span>
                      <span className="text-amber-700">₹{(parseFloat(penaltyAmount) + penaltyResult).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
