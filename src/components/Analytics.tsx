import React from 'react';
import { TrendingUp, Briefcase, Calendar, AlertCircle, CheckCircle2, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../lib/storage';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { cn } from '../lib/utils';

const DonutChart = ({ segments, total, label }: { segments: { value: number; color: string; name: string }[]; total: number; label: string }) => {
  let offset = 0;
  const r = 40; const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((s, i) => {
            const pct = total > 0 ? s.value / total : 0;
            const dash = pct * circ;
            const el = (
              <circle key={i} cx="50" cy="50" r={r}
                fill="none" stroke={s.color} strokeWidth="16"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset * circ / 360 * (180 / Math.PI)} />
            );
            offset += pct * 360;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-display font-bold text-zinc-900">{total}</p>
          <p className="text-[9px] text-zinc-400 font-bold uppercase">{label}</p>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-xs text-zinc-600">{s.name}</span>
            </div>
            <span className="text-xs font-bold text-zinc-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, max, color }: { data: { label: string; value: number }[]; max: number; color: string }) => (
  <div className="flex items-end gap-1.5 h-20">
    {data.map((d, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[8px] font-bold text-zinc-400">{d.value || ''}</span>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: max > 0 ? `${(d.value / max) * 60}px` : '2px' }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="w-full rounded-t-lg min-h-[2px]"
          style={{ background: d.value > 0 ? color : '#f4f4f5' }} />
        <span className="text-[8px] text-zinc-400 font-bold">{d.label}</span>
      </div>
    ))}
  </div>
);

export const Analytics = () => {
  const cases = storage.getCases();
  const today = new Date();

  const statusCounts = {
    Active: cases.filter(c => c.status === 'Active').length,
    Pending: cases.filter(c => c.status === 'Pending').length,
    Urgent: cases.filter(c => c.status === 'Urgent').length,
    Disposed: cases.filter(c => c.status === 'Disposed').length,
  };

  const typeCounts = cases.reduce((acc, c) => {
    acc[c.caseType] = (acc[c.caseType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const courtCounts = cases.reduce((acc, c) => {
    const name = c.court.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(today, 5 - i);
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    const count = cases.filter(c => {
      if (!c.nextDate) return false;
      const d = new Date(c.nextDate + 'T00:00:00');
      return isWithinInterval(d, { start, end });
    }).length;
    return { label: format(m, 'MMM'), value: count };
  });

  const maxMonthly = Math.max(...last6Months.map(m => m.value), 1);

  const upcoming7Days = cases.filter(c => {
    if (!c.nextDate) return false;
    const d = new Date(c.nextDate + 'T00:00:00');
    return d >= today && d <= addMonths(today, 0.25);
  }).sort((a, b) => (a.nextDate || '').localeCompare(b.nextDate || '')).slice(0, 5);

  const topCourts = Object.entries(courtCounts).sort(([,a],[,b]) => b - a).slice(0, 5);
  const topTypes = Object.entries(typeCounts).sort(([,a],[,b]) => b - a).slice(0, 5);

  const COLORS = ['#16a34a', '#d4af37', '#ef4444', '#6366f1', '#f97316'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 shrink-0" style={{ background: 'linear-gradient(135deg, #0a0f1e, #111827)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <TrendingUp size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-400">Insights</p>
            <h2 className="text-2xl font-display font-bold text-white">Case Analytics</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Cases', value: cases.length, icon: <Briefcase size={18} />, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Active', value: statusCounts.Active, icon: <Scale size={18} />, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Urgent', value: statusCounts.Urgent, icon: <AlertCircle size={18} />, color: '#ef4444', bg: '#fef2f2' },
            { label: 'Disposed', value: statusCounts.Disposed, icon: <CheckCircle2 size={18} />, color: '#6b7280', bg: '#f9fafb' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <p className="text-2xl font-display font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4">Status Distribution</p>
          <DonutChart
            total={cases.length}
            label="Total"
            segments={[
              { name: 'Active', value: statusCounts.Active, color: '#16a34a' },
              { name: 'Pending', value: statusCounts.Pending, color: '#f59e0b' },
              { name: 'Urgent', value: statusCounts.Urgent, color: '#ef4444' },
              { name: 'Disposed', value: statusCounts.Disposed, color: '#9ca3af' },
            ]}
          />
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4">Monthly Hearings (Last 6 Months)</p>
          <BarChart data={last6Months} max={maxMonthly} color="#6366f1" />
        </div>

        {/* Upcoming Hearings */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-gradient-to-r from-zinc-50 to-white flex justify-between items-center">
            <p className="font-display font-bold">Upcoming Hearings</p>
            <span className="text-xs font-bold px-2 py-1 bg-legal-green/10 text-legal-green rounded-full">Next 7 Days</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {upcoming7Days.length === 0 ? (
              <p className="p-6 text-center text-zinc-400 text-sm">No hearings in next 7 days</p>
            ) : upcoming7Days.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 bg-legal-green/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-legal-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{c.parties.plaintiff} vs {c.parties.defendant}</p>
                  <p className="text-xs text-zinc-400">{c.court.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-legal-green">{c.nextDate ? format(new Date(c.nextDate + 'T00:00:00'), 'dd MMM') : '-'}</p>
                  {c.status === 'Urgent' && <p className="text-[9px] text-red-500 font-black">URGENT</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courts */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4">Cases by Court</p>
          <div className="space-y-3">
            {topCourts.map(([court, count], i) => (
              <div key={court} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-700 truncate">{court}</span>
                  <span className="font-bold text-zinc-900 shrink-0 ml-2">{count}</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / cases.length) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Types */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4">Cases by Type</p>
          <div className="space-y-3">
            {topTypes.map(([type, count], i) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <p className="flex-1 text-sm text-zinc-700">{type}</p>
                <span className="text-sm font-bold text-zinc-900">{count}</span>
                <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / cases.length) * 100}%` }}
                    style={{ background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
