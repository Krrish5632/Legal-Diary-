import React from 'react';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  Github, 
  Download, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  Monitor,
  Cpu,
  Terminal
} from 'lucide-react';

export const MobileApp = () => {
  const steps = [
    {
      title: "Step 1: GitHub Se Connect Karein",
      desc: "AI Studio sidebar mein 'Settings' par jayein aur 'Export to GitHub' option chunein. Isse aapka sara code GitHub par upload ho jayega.",
      icon: Github,
      color: "bg-zinc-900",
    },
    {
      title: "Step 2: Code Download Karein",
      desc: "GitHub repository se 'Code' button par click karke ZIP file download karein ya git clone karein.",
      icon: Download,
      color: "bg-blue-600",
    },
    {
      title: "Step 3: Mobile Build (Capacitor/APK)",
      desc: "Vite apps ke liye Capacitor best hai. Ye aapke web code ko native Android app (APK) mein wrap kar deta hai.",
      icon: Cpu,
      color: "bg-purple-600",
    },
    {
      title: "Step 4: Download APK",
      desc: "Build poora hone ke baad 'app-release-unsigned.apk' tayyar ho jayegi, jise aap kisi ko bhi bhej sakte hain.",
      icon: ExternalLink,
      color: "bg-orange-600",
    }
  ];

  const terminalCommands = [
    { cmd: "npm install @capacitor/core @capacitor/cli @capacitor/android", desc: "Native libraries install karein" },
    { cmd: "npx cap init", desc: "Capacitor setup (App name: Legal Diary Pro)" },
    { cmd: "npm run build", desc: "Project ko compile karein" },
    { cmd: "npx cap add android", desc: "Android platform folder banayein" },
    { cmd: "npx cap sync", desc: "Code ko Android folder mein copy karein" },
    { cmd: "npx cap open android", desc: "Android Studio mein APK generate karein" }
  ];

  const termuxCommands = [
    { cmd: "pkg update && pkg upgrade", desc: "System packages update karein" },
    { cmd: "pkg install git nodejs-lts", desc: "Git aur Node.js install karein" },
    { cmd: "git clone https://github.com/Krrish56/Legal-Diary-.git", desc: "Apna repository download karein" },
    { cmd: "cd Legal-Diary-", desc: "Project folder mein jayein" },
    { cmd: "npm install", desc: "Dependencies install karein" },
    { cmd: "npm run dev -- --host", desc: "App start karein aur browser mein kholein" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-600 rounded-full text-xs font-bold uppercase tracking-widest">
          <Github size={14} />
          <span>Direct GitHub Build</span>
        </div>
        <h1 className="text-4xl font-display font-bold">GitHub Se Direct APK Download</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Maine automatic Mobile App (APK) builder setup kar diya hai. 
          Aapko bas GitHub par jaakar 1 button dabana hai.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="premium-card p-8 border-l-4 border-l-purple-600 bg-white shadow-xl">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-xl uppercase">1</div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Actions Tab Mein Jayein</h3>
              <p className="text-zinc-500 text-sm">Apne GitHub repo par jayein aur upar <b>'Actions'</b> button par click karein.</p>
              <div className="p-3 bg-zinc-100 rounded-xl border border-dashed border-zinc-300 text-[10px] text-center font-mono overflow-hidden">
                Krrish56 / Legal-Diary-
              </div>
            </div>
          </div>
        </section>

        <section className="premium-card p-8 border-l-4 border-l-orange-600 bg-white shadow-xl">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 font-bold text-xl uppercase">2</div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Workflow Run Karein</h3>
              <p className="text-zinc-500 text-sm">Sidebar mein <b>'Build Android APK'</b> chunein, fir <b>'Run workflow'</b> click karein.</p>
              <button className="w-full py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-orange-200">
                Run Workflow
              </button>
            </div>
          </div>
        </section>

        <section className="premium-card p-8 border-l-4 border-l-green-600 bg-white shadow-xl md:col-span-2">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shrink-0 font-bold text-xl uppercase">3</div>
            <div className="space-y-4 w-full">
              <h3 className="text-xl font-bold">APK Download Karein</h3>
              <p className="text-zinc-500 text-sm">4-5 minute baad, usi page par niche <b>'Artifacts'</b> section mein <b>'LegalDiary-Android-APK'</b> link milega. Use download karke phone mein install karein.</p>
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <Download className="text-green-600" />
                <div>
                  <p className="font-bold text-green-900 text-sm">LegalDiary-Android-APK.zip</p>
                  <p className="text-xs text-green-700">Click download &rarr; Extract zip &rarr; Install APK</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
        <div className="flex gap-4 items-center mb-6">
          <Terminal className="text-legal-green" size={24} />
          <h2 className="text-2xl font-display font-bold italic">Expert Tip: Termux Method</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Agar aap local server chalana chahte hain toh Termux mein <b>'cd Legal-Diary--main'</b> karke <b>'npm install'</b> aur <b>'npm run dev'</b> karein.</p>
      </div>


      <footer className="text-center p-12 bg-zinc-100 rounded-[2.5rem] border border-dashed border-zinc-200">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="text-legal-green" size={32} />
          </div>
          <h3 className="text-xl font-bold">Aapka App Ready Hai</h3>
          <p className="text-sm text-zinc-500 italic">"Counsel, aapka legal diary system automation ke liye puri tarah taiyar hai."</p>
        </div>
      </footer>
    </div>
  );
};
