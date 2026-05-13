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
  Cpu
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
      title: "Step 3: Mobile Build (Expo)",
      desc: "Agar aap actual APK chahte hain toh Expo settings file add karke 'EAS Build' ka use karein. Yeh process aapke code ko native Android app mein badal dega.",
      icon: Cpu,
      color: "bg-purple-600",
    },
    {
      title: "Shortcut: PWA Install",
      desc: "Sabse aasaan tarika: Browser menu (3 dots) par tap karein aur 'Add to Home Screen' select karein. Yeh bilkul app ki tarah kaam karega.",
      icon: Smartphone,
      color: "bg-legal-green",
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-legal-green/10 text-legal-green rounded-full text-xs font-bold uppercase tracking-widest">
          <Smartphone size={14} />
          <span>Mobile Installation Guide</span>
        </div>
        <h1 className="text-4xl font-display font-bold">Apne Phone Par Install Karein</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Legal Diary Pro ko mobile app (APK) mein badalne ke liye neeche diye gaye steps follow karein. 
          Hum GitHub ka use karke ise professional app mein convert karenge.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card p-8 flex flex-col gap-6 hover:border-legal-green transition-all group"
          >
            <div className={`w-14 h-14 ${step.color} text-white rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200 group-hover:scale-110 transition-transform`}>
              <step.icon size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display">{step.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="space-y-8">
        <h2 className="text-3xl font-display font-bold text-center">Expo Mobile Build: Step-by-Step</h2>
        
        <div className="space-y-6">
          <div className="premium-card p-8 bg-white border-l-4 border-l-purple-600">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">1</span>
              Environment Setup
            </h3>
            <div className="bg-zinc-900 rounded-xl p-4 text-zinc-300 font-mono text-xs mb-4">
              npm install -g expo-cli eas-cli
            </div>
            <p className="text-sm text-zinc-600">Apne computer par Terminal kholein aur Expo CLI install karein. Iske baad <code className="bg-zinc-100 px-1 rounded">eas login</code> karke apna Expo account connect karein.</p>
          </div>

          <div className="premium-card p-8 bg-white border-l-4 border-l-blue-600">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
              Configure app.json
            </h3>
            <p className="text-sm text-zinc-600 mb-4">Project root mein <code className="font-bold">app.json</code> file banayein aur ye content dalein:</p>
            <div className="bg-zinc-900 rounded-xl p-4 text-zinc-300 font-mono text-[10px] overflow-x-auto">
              <pre>{`{
  "expo": {
    "name": "Legal Diary Pro",
    "slug": "legal-diary-pro",
    "version": "1.0.0",
    "icon": "./public/icon.svg",
    "splash": { "image": "./public/icon.svg", "resizeMode": "contain" },
    "android": { "package": "com.legalpro.diary" }
  }
}`}</pre>
            </div>
          </div>

          <div className="premium-card p-8 bg-white border-l-4 border-l-legal-green">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">3</span>
              Build the APK
            </h3>
            <p className="text-sm text-zinc-600 mb-4">Ye command run karein APK generate karne ke liye:</p>
            <div className="bg-zinc-900 rounded-xl p-4 text-zinc-300 font-mono text-xs">
              eas build -p android --profile preview
            </div>
            <p className="text-sm text-zinc-600 mt-4 italic text-zinc-400">Scan the QR code or follow the link to download your installable APK file.</p>
          </div>
        </div>
      </section>

      <section className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Monitor size={200} className="rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold">GitHub Export Detail Instructions</h2>
            <p className="text-zinc-400">Professional development workflow follow karein:</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold">1</div>
              <div>
                <p className="font-bold">Repository Create Karein</p>
                <p className="text-sm text-zinc-500">AI Studio ke 'Settings' menu mein jayein, 'Export' section dhundhein aur GitHub account connect karke 'Push to Repo' karein.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold">2</div>
              <div>
                <p className="font-bold">Bubblewrap ya Expo Use Karein</p>
                <p className="text-sm text-zinc-500">Apne computer par PWA ko APK mein convert karne ke liye `@bubblewrap/cli` ka use karein. Yeh aapke web-app ko shareable APK bana dega.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold">3</div>
              <div>
                <p className="font-bold">Play Store Ready</p>
                <p className="text-sm text-zinc-500">Ek baar APK banne ke baad, aap ise Google Play Console par upload kar sakte hain ya directly APK file share kar sakte hain.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-legal-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-xl shadow-legal-green/20">
              <ExternalLink size={18} />
              GitHub Dashboard Kholein
            </button>
            <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20">
              Technical Guide PDF
            </button>
          </div>
        </div>
      </section>

      <footer className="text-center p-12 bg-zinc-100 rounded-[2.5rem] border border-dashed border-zinc-200">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="text-legal-green" size={32} />
          </div>
          <h3 className="text-xl font-bold">Aapka App Ready Hai</h3>
          <p className="text-sm text-zinc-500 italic">"Counsel, aapka legal diary system automation ke liye puri tarah taiyar hai. Mobile install karne se aap field mein bhi update reh sakte hain."</p>
        </div>
      </footer>
    </div>
  );
};
