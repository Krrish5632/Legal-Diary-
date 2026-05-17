import React from 'react';
import { Scale, Phone, Mail, MapPin, Building, Share2, Download, Copy, Check } from 'lucide-react';
import { getSettings } from './Settings';
import { motion } from 'motion/react';

const ScalesIcon = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none">
    <line x1="50" y1="8" x2="50" y2="88" stroke="#d4af37" strokeWidth="4" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="82" y2="18" stroke="#d4af37" strokeWidth="4" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="6" y2="52" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
    <line x1="18" y1="18" x2="30" y2="52" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
    <line x1="82" y1="18" x2="70" y2="52" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
    <line x1="82" y1="18" x2="94" y2="52" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
    <path d="M6 52 Q18 60 30 52" stroke="#16a34a" strokeWidth="2.5" fill="rgba(22,163,74,0.1)"/>
    <path d="M70 52 Q82 60 94 52" stroke="#16a34a" strokeWidth="2.5" fill="rgba(22,163,74,0.1)"/>
    <line x1="38" y1="88" x2="62" y2="88" stroke="#d4af37" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="50" cy="18" r="4" fill="#d4af37"/>
  </svg>
);

export const AdvocateCard = () => {
  const settings = getSettings();
  const [copied, setCopied] = React.useState(false);
  const cases = JSON.parse(localStorage.getItem('legal_cases') || '[]');
  const activeCases = cases.filter((c: any) => c.status !== 'Disposed').length;

  const cardText = `*ADVOCATE PROFILE*\n\n👨‍⚖️ ${settings.advocateName}\n📋 Bar No: ${settings.barNumber || 'N/A'}\n🏛️ ${settings.court || 'N/A'}\n📍 ${settings.city || 'N/A'}\n📞 ${settings.phone || 'N/A'}\n📧 ${settings.email || 'N/A'}\n\n_Legal Diary Pro_`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: settings.advocateName, text: cardText });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(cardText)}`, '_blank');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = settings.advocateName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 shrink-0" style={{ background: 'linear-gradient(135deg, #0a0f1e, #1a1035)' }}>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-legal-gold mb-1">Professional</p>
        <h2 className="text-2xl font-display font-bold text-white">Advocate Profile Card</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Digital Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f2318 50%, #1a0a2e 100%)', minHeight: '200px' }}>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4"><Scale size={120} className="text-white" /></div>
          </div>

          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #c5a059)', color: '#0a0f1e' }}>
                  {initials}
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-legal-gold">Advocate</p>
                  <h3 className="text-xl font-display font-bold text-white leading-tight">{settings.advocateName || 'Your Name'}</h3>
                  {settings.barNumber && (
                    <p className="text-zinc-400 text-xs font-mono mt-0.5">Bar No: {settings.barNumber}</p>
                  )}
                </div>
              </div>
              <ScalesIcon />
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 gap-2">
              {settings.court && (
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <Building size={13} className="text-legal-gold shrink-0" />
                  <span>{settings.court}</span>
                </div>
              )}
              {settings.city && (
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <MapPin size={13} className="text-legal-green shrink-0" />
                  <span>{settings.city}</span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <Phone size={13} className="text-blue-400 shrink-0" />
                  <span>{settings.phone}</span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <Mail size={13} className="text-purple-400 shrink-0" />
                  <span>{settings.email}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-legal-gold">{cases.length}</p>
                <p className="text-[9px] text-zinc-500 uppercase font-bold">Total Cases</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-legal-green">{activeCases}</p>
                <p className="text-[9px] text-zinc-500 uppercase font-bold">Active</p>
              </div>
              <div className="flex-1" />
              <div className="self-end text-right">
                <p className="text-[9px] text-zinc-600 font-bold">Legal Diary Pro</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleShare}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all"
            style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}>
            <Share2 size={18} /> Share Card
          </button>
          <button onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-4 bg-zinc-50 text-zinc-600 border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-zinc-100 transition-all">
            {copied ? <><Check size={18} className="text-legal-green" /> Copied!</> : <><Copy size={18} /> Copy Text</>}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-2">💡 Profile Tips</p>
          <ul className="space-y-1">
            {['Settings mein apna naam aur court fill karein', 'Phone number add karein — WhatsApp se share hoga', 'Bar Council number se professional credibility badhti hai'].map((tip, i) => (
              <li key={i} className="text-xs text-amber-600">• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
