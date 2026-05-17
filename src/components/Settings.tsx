import React from 'react';
import {
  Save, User, MapPin, Phone, Mail, Building,
  Moon, Sun, Download, Upload, Trash2,
  Shield, Database, Info, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const SETTINGS_KEY = 'legal_diary_settings';
const DARK_KEY = 'legal_diary_dark';

export interface AppSettings {
  advocateName: string;
  barNumber: string;
  court: string;
  phone: string;
  email: string;
  city: string;
}

export const defaultSettings: AppSettings = {
  advocateName: 'Advocate',
  barNumber: '',
  court: '',
  phone: '',
  email: '',
  city: '',
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('settings_update'));
};

export const isDarkMode = () => localStorage.getItem(DARK_KEY) === '1';

export const toggleDarkMode = (val: boolean) => {
  localStorage.setItem(DARK_KEY, val ? '1' : '0');
  document.documentElement.classList.toggle('dark', val);
  window.dispatchEvent(new Event('darkmode_update'));
};

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  document.documentElement.classList.toggle('dark', isDarkMode());
}

export const Settings = () => {
  const [form, setForm] = React.useState<AppSettings>(getSettings());
  const [saved, setSaved] = React.useState(false);
  const [dark, setDark] = React.useState(isDarkMode());
  const [restoreMsg, setRestoreMsg] = React.useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const totalCases = JSON.parse(localStorage.getItem('legal_cases') || '[]').length;

  const handleSave = () => {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDark = (val: boolean) => {
    setDark(val);
    toggleDarkMode(val);
  };

  const handleBackup = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: getSettings(),
      cases: JSON.parse(localStorage.getItem('legal_cases') || '[]'),
      notes: JSON.parse(localStorage.getItem('legal_hearing_notes') || '{}'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal_diary_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.cases) localStorage.setItem('legal_cases', JSON.stringify(data.cases));
        if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
        if (data.notes) localStorage.setItem('legal_hearing_notes', JSON.stringify(data.notes));
        window.dispatchEvent(new Event('storage_update'));
        setForm(getSettings());
        setRestoreMsg(`✓ Restored successfully! ${data.cases?.length || 0} cases loaded.`);
        setTimeout(() => setRestoreMsg(''), 4000);
      } catch {
        setRestoreMsg('✗ Invalid backup file. Please try again.');
        setTimeout(() => setRestoreMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAll = () => {
    localStorage.removeItem('legal_cases');
    localStorage.removeItem('legal_hearing_notes');
    window.dispatchEvent(new Event('storage_update'));
    setShowDeleteConfirm(false);
    setRestoreMsg('All data deleted.');
    setTimeout(() => setRestoreMsg(''), 2000);
  };

  const field = (label: string, key: keyof AppSettings, icon: React.ReactNode, placeholder: string) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus-within:border-legal-green transition-colors">
        <span className="text-zinc-400">{icon}</span>
        <input
          className="flex-1 text-sm outline-none bg-transparent dark:text-white"
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 pb-12">
      <header>
        <h2 className="text-3xl font-display font-bold dark:text-white">Settings</h2>
        <p className="text-zinc-500 mt-1 text-sm">Manage your profile, appearance and data.</p>
      </header>

      {/* Profile */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-widest">Advocate Profile</h3>
        {field('Advocate Name', 'advocateName', <User size={16} />, 'Adv. Aapka Naam')}
        {field('Bar Council Number', 'barNumber', <Building size={16} />, 'UP/1234/2020')}
        {field('Primary Court', 'court', <Building size={16} />, 'District Court, Varanasi')}
        {field('City', 'city', <MapPin size={16} />, 'Varanasi')}
        {field('Phone', 'phone', <Phone size={16} />, '+91 98765 43210')}
        {field('Email', 'email', <Mail size={16} />, 'advocate@email.com')}
        <button onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-legal-green text-white rounded-2xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-all">
          <Save size={18} />
          {saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
        <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-widest mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? <Moon size={20} className="text-zinc-400" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="font-bold text-sm dark:text-white">{dark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-zinc-400">Toggle app theme</p>
            </div>
          </div>
          <button onClick={() => handleDark(!dark)}
            className={`w-14 h-7 rounded-full transition-all relative ${dark ? 'bg-legal-green' : 'bg-zinc-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-1 transition-all ${dark ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-widest">Data Backup & Restore</h3>

        {restoreMsg && (
          <div className={`p-3 rounded-xl text-sm font-bold ${restoreMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {restoreMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleBackup}
            className="flex items-center justify-center gap-2 py-3.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all">
            <Download size={18} /> Backup Data
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3.5 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-bold text-sm hover:bg-green-100 transition-all">
            <Upload size={18} /> Restore
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json" onChange={handleRestore} className="hidden" />

        <p className="text-xs text-zinc-400 text-center">Backup saves all cases, notes and settings as a JSON file on your device.</p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all">
            <Trash2 size={16} /> Delete All Data
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              <p className="text-sm font-bold">Are you sure? This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDeleteAll} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Yes, Delete All</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-white text-zinc-600 border rounded-xl text-sm font-bold">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
        <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-widest mb-4">App Info</h3>
        <div className="space-y-3">
          {[
            { icon: <Database size={16} />, label: 'Total Cases', value: totalCases.toString() },
            { icon: <Shield size={16} />, label: 'Data Storage', value: 'Local (Your Device Only)' },
            { icon: <Info size={16} />, label: 'Version', value: 'Legal Diary Pro v2.0' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-zinc-400">
        Your data is stored only on this device. No server. No cloud.
      </p>
    </div>
  );
};
