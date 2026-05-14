import React from 'react';
import { Scale, Delete, LogIn } from 'lucide-react';

const PIN_KEY = 'legal_diary_pin';
const SETUP_KEY = 'legal_diary_pin_setup';

interface LoginProps {
  onSuccess: () => void;
}

export const Login = ({ onSuccess }: LoginProps) => {
  const isSetup = !localStorage.getItem(SETUP_KEY);
  const [pin, setPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [step, setStep] = React.useState<'enter' | 'confirm'>(isSetup ? 'enter' : 'enter');
  const [mode] = React.useState<'setup' | 'login'>(isSetup ? 'setup' : 'login');
  const [error, setError] = React.useState('');
  const [shake, setShake] = React.useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleKey = (val: string) => {
    if (val === 'del') {
      if (step === 'confirm') setConfirmPin(p => p.slice(0, -1));
      else setPin(p => p.slice(0, -1));
      return;
    }
    if (mode === 'setup') {
      if (step === 'enter') {
        const next = pin + val;
        setPin(next);
        if (next.length === 4) setStep('confirm');
      } else {
        const next = confirmPin + val;
        setConfirmPin(next);
        if (next.length === 4) {
          if (next === pin) {
            localStorage.setItem(PIN_KEY, pin);
            localStorage.setItem(SETUP_KEY, '1');
            onSuccess();
          } else {
            setError('PINs do not match. Try again.');
            triggerShake();
            setPin(''); setConfirmPin(''); setStep('enter');
          }
        }
      }
    } else {
      const next = pin + val;
      setPin(next);
      if (next.length === 4) {
        if (next === localStorage.getItem(PIN_KEY)) {
          onSuccess();
        } else {
          setError('Incorrect PIN. Try again.');
          triggerShake();
          setPin('');
        }
      }
    }
  };

  const currentPin = step === 'confirm' ? confirmPin : pin;

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="min-h-screen bg-legal-dark flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xs space-y-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-legal-green rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-legal-green/30">
            <Scale className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Legal Diary</h1>
          <p className="text-zinc-400 text-sm">
            {mode === 'setup'
              ? step === 'enter' ? 'Set a 4-digit PIN to secure your data' : 'Confirm your PIN'
              : 'Enter your PIN to continue'}
          </p>
        </div>

        <div className={`flex justify-center gap-4 ${shake ? 'animate-bounce' : ''}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              currentPin.length > i ? 'bg-legal-green border-legal-green' : 'border-zinc-600'
            }`} />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm font-medium">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {keys.map((k, i) => (
            k === '' ? <div key={i} /> :
            <button
              key={i}
              onClick={() => handleKey(k)}
              className={`h-16 rounded-2xl font-bold text-xl transition-all active:scale-95 ${
                k === 'del'
                  ? 'bg-zinc-800 text-zinc-300 flex items-center justify-center'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
              }`}
            >
              {k === 'del' ? <Delete size={20} /> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
