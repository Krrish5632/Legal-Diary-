import React from 'react';
import {
  LayoutDashboard, Calendar, Briefcase, Search,
  FileText, Settings, Scale, Menu, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getSettings, AppSettings } from './Settings';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<AppSettings>(getSettings());

  React.useEffect(() => {
    const handler = () => setSettings(getSettings());
    window.addEventListener('settings_update', handler);
    return () => window.removeEventListener('settings_update', handler);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'diary', icon: Calendar, label: 'Legal Diary' },
    { id: 'cases', icon: Briefcase, label: 'Cases' },
    { id: 'search', icon: Search, label: 'Advanced Search' },
    { id: 'causelist', icon: FileText, label: 'Cause List' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const initials = settings.advocateName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'A';

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-legal-dark text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-legal-green rounded-xl flex items-center justify-center">
            <Scale className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">Legal Diary</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Pro Edition</p>
          </div>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                activeTab === item.id
                  ? "bg-legal-green text-white shadow-lg shadow-legal-green/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-4 right-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-legal-gold flex items-center justify-center font-bold text-sm text-white">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{settings.advocateName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{settings.court || 'Settings mein court daalen'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
