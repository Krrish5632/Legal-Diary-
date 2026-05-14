import React from 'react';
import { Save, User, MapPin, Phone, Mail, Building } from 'lucide-react';

const SETTINGS_KEY = 'legal_diary_settings';

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

export const Settings = () => {
  const [form, setForm] = React.useState<AppSettings>(getSettings());
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (
    label: string,
    key: keyof AppSettings,
    icon: React.ReactNode,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-zinc-200 rounded-xl focus-within:border-legal-green transition-colors">
        <span className="text-zinc-400">{icon}</span>
        <input
          className="flex-1 text-sm outline-none bg-transparent"
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold">Settings</h2>
        <p className="text-zinc-500 mt-1">Apni professional details yahan save karein.</p>
      </header>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-zinc-700 text-sm uppercase tracking-widest">Advocate Profile</h3>
        {field('Advocate Name', 'advocateName', <User size={16} />, 'Adv. Aapka Naam')}
        {field('Bar Council Number', 'barNumber', <Building size={16} />, 'UP/1234/2020')}
        {field('Primary Court', 'court', <Building size={16} />, 'District Court, Varanasi')}
        {field('City', 'city', <MapPin size={16} />, 'Varanasi')}
        {field('Phone', 'phone', <Phone size={16} />, '+91 98765 43210')}
        {field('Email', 'email', <Mail size={16} />, 'advocate@email.com')}
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-4 bg-legal-green text-white rounded-2xl font-bold shadow-lg shadow-legal-green/20 hover:opacity-90 transition-all"
      >
        <Save size={18} />
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      <p className="text-center text-xs text-zinc-400">
        Yeh details sirf aapke phone mein save hoti hain.
      </p>
    </div>
  );
};
