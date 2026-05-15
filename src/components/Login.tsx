import React from 'react';
import { Delete, Eye, EyeOff } from 'lucide-react';

const PIN_KEY = 'ld_pin';
const USER_KEY = 'ld_user';

interface User { name: string; barNumber: string; court: string; }

interface LoginProps { onSuccess: () => void; }

const ScalesIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none">
    <line x1="50" y1="10" x2="50" y2="90" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="20" y1="20" x2="80" y2="20" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="20" y1="20" x2="10" y2="50" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"/>
    <line x1="20" y1="20" x2="30" y2="50" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"/>
    <line x1="80" y1="20" x2="70" y2="50" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"/>
    <line x1="80" y1="20" x2="90" y2="50" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="20" cy="52" rx="12" ry="5" fill="#d4af37" opacity="0.3" stroke="#d4af37" strokeWidth="2"/>
    <ellipse cx="80" cy="52" rx="12" ry="5" fill="#d4af37" opacity="0.3" stroke="#d4af37" strokeWidth="2"/>
    <line x1="40" y1="90" x2="60" y2="90" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="50" cy="20" r="3" fill="#22c55e"/>
  </svg>
);

export const Login = ({ onSuccess }: LoginProps) => {
  const existingUser = localStorage.getItem(USER_KEY);
  const isFirstTime = !existingUser || !localStorage.getItem(PIN_KEY);

  const [mode, setMode] = React.useState<'signup'|'login'>(isFirstTime ? 'signup' : 'login');
  const [form, setForm] = React.useState({ name: '', barNumber: '', court: '' });
  const [pin, setPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [signupStep, setSignupStep] = React.useState<'details'|'pin'|'confirm'>('details');
  const [error, setError] = React.useState('');
  const [shake, setShake] = React.useState(false);
  const [showForm, setShowForm] = React.useState(true);

  const triggerShake = (msg: string) => {
    setError(msg); setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSignupNext = () => {
    if (!form.name.trim()) { triggerShake('Please enter your full name'); return; }
    if (!form.barNumber.trim()) { triggerShake('Please enter Bar Council number'); return; }
    setSignupStep('pin'); setError('');
  };

  const handlePinKey = (val: string) => {
    setError('');
    if (mode === 'signup') {
      if (signupStep === 'pin') {
        const next = val === 'del' ? pin.slice(0,-1) : pin + val;
        setPin(next);
        if (next.length === 4) { setSignupStep('confirm'); }
      } else {
        const next = val === 'del' ? confirmPin.slice(0,-1) : confirmPin + val;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === pin) {
            localStorage.setItem(PIN_KEY, pin);
            localStorage.setItem(USER_KEY, JSON.stringify(form));
            localStorage.setItem('legal_diary_settings', JSON.stringify({
              advocateName: form.name,
              barNumber: form.barNumber,
              court: form.court,
              phone: '', email: '', city: ''
            }));
            onSuccess();
          } else {
            triggerShake('PINs do not match. Try again.');
            setPin(''); setConfirmPin(''); setSignupStep('pin');
          }
        }
      }
    } else {
      const next = val === 'del' ? pin.slice(0,-1) : pin + val;
      setPin(next);
      if (next.length === 4) {
        if (next === localStorage.getItem(PIN_KEY)) {
          onSuccess();
        } else {
          triggerShake('Incorrect PIN');
          setPin('');
        }
      }
    }
  };

  const currentDots = mode === 'signup'
    ? (signupStep === 'confirm' ? confirmPin : pin)
    : pin;

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a2035 50%, #0f1117 100%)' }}>

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #1a2e1a, #0f1f0f)', border: '1px solid #22c55e33' }}>
            <ScalesIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Legal Diary</h1>
            <p className="text-xs text-emerald-400 uppercase tracking-[0.3em] mt-1 font-semibold">Advocate's Professional Suite</p>
          </div>
        </div>

        {/* Signup Details */}
        {mode === 'signup' && signupStep === 'details' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Create Account</h2>
              <p className="text-zinc-400 text-sm mt-1">Enter your professional details</p>
            </div>
            {['name','barNumber','court'].map((field, i) => (
              <div key={field} className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {field === 'name' ? 'Full Name *' : field === 'barNumber' ? 'Bar Council Number *' : 'Primary Court'}
                </label>
                <input
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm outline-none transition-all"
                  style={{ background: '#1e2533', border: '1px solid #2a3347' }}
                  placeholder={field === 'name' ? 'Adv. Your Full Name' : field === 'barNumber' ? 'UP/1234/2020' : 'District Court, Varanasi'}
                  value={(form as any)[field]}
                  onChange={e => setForm({...form, [field]: e.target.value})}
                />
              </div>
            ))}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button onClick={handleSignupNext}
              className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
              Continue →
            </button>
          </div>
        )}

        {/* PIN Entry */}
        {(mode === 'login' || signupStep === 'pin' || signupStep === 'confirm') && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : signupStep === 'pin' ? 'Set PIN' : 'Confirm PIN'}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {mode === 'login' ? 'Enter your 4-digit PIN' : signupStep === 'pin' ? 'Choose a 4-digit security PIN' : 'Enter PIN again to confirm'}
              </p>
            </div>

            <div className={`flex justify-center gap-4 ${shake ? 'animate-bounce' : ''}`}>
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-5 h-5 rounded-full transition-all duration-300 ${
                  currentDots.length > i
                    ? 'scale-110 shadow-lg shadow-emerald-500/50'
                    : 'opacity-30'
                }`} style={{ background: currentDots.length > i ? '#22c55e' : '#374151', border: '2px solid #374151' }} />
              ))}
            </div>

            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

            <div className="grid grid-cols-3 gap-3">
              {keys.map((k, i) => (
                k === '' ? <div key={i} /> :
                <button key={i} onClick={() => handlePinKey(k)}
                  className="h-16 rounded-2xl font-bold text-xl transition-all active:scale-90 flex items-center justify-center"
                  style={{ background: k === 'del' ? '#1e2533' : '#1e2533', border: '1px solid #2a3347', color: '#e5e7eb' }}>
                  {k === 'del' ? <Delete size={20} /> : k}
                </button>
              ))}
            </div>

            {mode === 'login' && (
              <p className="text-center text-zinc-500 text-xs">
                New device?{' '}
                <button onClick={() => { setMode('signup'); setSignupStep('details'); setPin(''); }}
                  className="text-emerald-400 font-bold">
                  Register again
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
