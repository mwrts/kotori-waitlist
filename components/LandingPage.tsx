
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Zap,
  CloudSun,
  Flower,
  Trees,
  X,
  AlertCircle,
  Bookmark,
  Bird,
  Plus,
  Minus,
  Search,
  Clipboard,
  Trophy,
  Sun,
  Moon,
  Cpu,
  RefreshCw
} from 'lucide-react';
import KotoriIcon from './KotoriIcon';
import WaitlistSection from './WaitlistSection';
import { DEMO_SENTENCES } from '../constants';
import { WordStatus } from '../types';

interface LandingPageProps {
  onStart?: () => void;
  theme: 'morning' | 'sakura' | 'forest';
  setTheme: (t: 'morning' | 'sakura' | 'forest') => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
}

const FeatherParticle = ({ delay = 0, x = 0, top = 0 }) => (
  <div
    className="absolute pointer-events-none opacity-[0.05] animate-feather-drift"
    style={{
      left: `${x}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  </div>
);

type BentoPos = 'main' | 'vert' | 'wide' | 'small';

const FEATURES = [
  { id: 'f1', icon: Zap, title: "Instant Definitions", desc: "No more searching. One click gives you translation, pronunciation, and example sentences instantly.", colorClass: "text-orange-400" },
  { id: 'f2', icon: Clipboard, title: "Paste Any Story", desc: "Every word in your pasted text becomes clickable. Kotori handles the translation and everything else.", colorClass: "text-blue-400" },
  { id: 'f3', icon: Trophy, title: "Progress Tracking", desc: "Save words you're learning. We track your frequency and mastery so you never forget.", colorClass: "text-green-400" },
  { id: 'f4', icon: Cpu, title: "Optimized for Efficiency", desc: "Lightweight architecture built for speed. Kotori responds instantly, even on older devices.", colorClass: "text-purple-400" }
];

const BentoCard = React.memo(({
  feature,
  pos,
}: {
  feature: typeof FEATURES[0],
  pos: BentoPos,
}) => {
  const isMain = pos === 'main';
  const { icon: Icon, title, desc, colorClass } = feature;

  return (
    <div
      className={`absolute group bg-card p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-700 ease-out shadow-sm hover:shadow-2xl hover:scale-[1.01] overflow-hidden flex flex-col border-primary/10 ${isMain ? 'ring-2 ring-primary/30 z-10' : 'z-0'}`}
      style={{
        top: `var(--pos-${pos}-t)`,
        left: `var(--pos-${pos}-l)`,
        width: `var(--pos-${pos}-w)`,
        height: `var(--pos-${pos}-h)`,
      } as React.CSSProperties}
    >
      <div className={`flex flex-col h-full relative z-10 transition-all duration-700 ${isMain ? 'items-start' : 'items-center justify-center'}`}>
        <div className={`shrink-0 flex items-center justify-center bg-bgSoft rounded-full shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-primary/10 ${colorClass} ${isMain ? 'w-14 h-14 md:w-16 md:h-16 mb-4 md:mb-6' : 'w-10 h-10 md:w-12 md:h-12'}`}>
          <Icon size={isMain ? 28 : 20} className="md:w-auto md:h-auto" />
        </div>

        <div className={`flex flex-col gap-1 transition-all duration-700 ${isMain ? 'text-left' : 'text-center'}`}>
          <h4 className={`font-black group-hover:text-primary transition-all tracking-tight leading-tight duration-500 ${isMain ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl' : 'text-xs sm:text-sm md:text-base'}`}>
            {title}
          </h4>

          <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isMain ? 'max-h-40 opacity-60 mt-2' : 'max-h-0 opacity-0'}`}>
            <p className="text-sm md:text-lg font-medium group-hover:opacity-80 transition-all leading-relaxed max-w-sm">
              {desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

BentoCard.displayName = 'BentoCard';

const FAQItem = React.memo(({ q, a, index }: { q: string, a: string, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`group bg-card border-2 transition-all duration-500 rounded-[2rem] overflow-hidden ${isOpen ? 'border-primary/30 shadow-xl translate-y-[-4px]' : 'border-primary/5 hover:border-primary/10 shadow-sm'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 sm:p-8 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
            <Search size={20} />
          </div>
          <h4 className="text-lg font-black text-charcoal tracking-tight">{q}</h4>
        </div>
        <div className={`shrink-0 w-8 h-8 rounded-full border-2 border-primary/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary/5 border-primary/30' : ''}`}>
          {isOpen ? <Minus size={16} className="text-primary" /> : <Plus size={16} className="text-primary" />}
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="px-6 pb-8 sm:px-8 sm:pb-10 pl-20">
          <p className="text-charcoal opacity-60 font-medium leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
});

FAQItem.displayName = 'FAQItem';

const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  setTheme,
  isDarkMode,
  setIsDarkMode
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [demoWord, setDemoWord] = useState<string | null>(null);
  const [demoWordStatuses, setDemoWordStatuses] = useState<Record<string, WordStatus>>({});
  const [showDemoHint, setShowDemoHint] = useState(false);
  const [isUnderlineVisible, setIsUnderlineVisible] = useState(false);
  const [isScribbleVisible, setIsScribbleVisible] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // slotMap[featureIndex] = posKey
  const [slotMap, setSlotMap] = useState<BentoPos[]>(['main', 'vert', 'wide', 'small']);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroButtonRef = useRef<HTMLButtonElement>(null);
  const underlineTriggerRef = useRef<HTMLSpanElement>(null);
  const scribbleTriggerRef = useRef<HTMLHeadingElement>(null);

  const hintConsumed = useRef(sessionStorage.getItem('kotori_hint_consumed') === 'true');

  useEffect(() => {
    const observerOptions = { threshold: 0.1, root: containerRef.current };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          if (entry.target.id === 'features' && !hintConsumed.current) {
            setTimeout(() => { if (!hintConsumed.current) setShowDemoHint(true); }, 1200);
          }
        }
      });
    }, observerOptions);

    const navObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
    }, { threshold: 0, root: containerRef.current });

    const underlineObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsUnderlineVisible(true);
      }
    }, { threshold: 0.8 });

    const scribbleObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsScribbleVisible(true);
      }
    }, { threshold: 0.5 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));
    if (heroButtonRef.current) navObserver.observe(heroButtonRef.current);
    if (underlineTriggerRef.current) underlineObserver.observe(underlineTriggerRef.current);
    if (scribbleTriggerRef.current) scribbleObserver.observe(scribbleTriggerRef.current);

    return () => {
      revealObserver.disconnect();
      navObserver.disconnect();
      underlineObserver.disconnect();
      scribbleObserver.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDemoClick = (word: string) => {
    setDemoWord(word);
    setShowDemoHint(false);
    hintConsumed.current = true;
    sessionStorage.setItem('kotori_hint_consumed', 'true');
  };

  const setStatus = (word: string, status: WordStatus) => {
    setDemoWordStatuses(prev => ({
      ...prev,
      [word]: prev[word] === status ? WordStatus.NONE : status
    }));
  };

  // Cycle following diagram: Main -> Wide -> Small -> Vert -> Main
  const rotateSlots = () => {
    setSlotMap(prev => {
      const next = [...prev];
      const mappings: Record<BentoPos, BentoPos> = {
        'main': 'wide',
        'wide': 'small',
        'small': 'vert',
        'vert': 'main'
      };
      return next.map(pos => mappings[pos]);
    });
  };

  const currentDemo = DEMO_SENTENCES[activeTab];

  return (
    <div ref={containerRef} className="h-screen w-full bg-bgSoft text-charcoal overflow-y-auto overflow-x-hidden scroll-smooth relative transition-colors duration-700">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden min-h-[400%]">
        <FeatherParticle x={10} top={2} delay={0} />
        <FeatherParticle x={40} top={12} delay={5} />
        <FeatherParticle x={70} top={25} delay={2} />
        <FeatherParticle x={90} top={35} delay={8} />
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 bg-bgSoft/80 backdrop-blur-md border-b border-primary/10 transition-all duration-700 ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <button type="button" onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all group/logo">
            <div className="group-hover/logo:scale-110 transition-transform"><KotoriIcon size={36} /></div>
            <span className="text-xl sm:text-2xl font-bold text-primary tracking-tight">Kotori</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-primary/10 rounded-full p-1 border border-primary/20 items-center">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full transition-all bg-card text-primary shadow-sm hover:scale-110 active:scale-95">
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <div className="w-[1px] h-4 bg-primary/20 mx-2" />
              <div className="flex gap-0.5">
                <button onClick={() => setTheme('morning')} className={`p-2 rounded-full transition-all ${theme === 'morning' ? 'bg-primary text-white scale-110 shadow-md' : 'opacity-40 text-primary'}`}><CloudSun size={14} /></button>
                <button onClick={() => setTheme('sakura')} className={`p-2 rounded-full transition-all ${theme === 'sakura' ? 'bg-primary text-white scale-110 shadow-md' : 'opacity-40 text-primary'}`}><Flower size={14} /></button>
                <button onClick={() => setTheme('forest')} className={`p-2 rounded-full transition-all ${theme === 'forest' ? 'bg-primary text-white scale-110 shadow-md' : 'opacity-40 text-primary'}`}><Trees size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-16 sm:pt-24 pb-12 px-6 text-center reveal">
        <div className="max-w-4xl mx-auto space-y-12 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-card rounded-full flex items-center justify-center p-4 border-2 border-primary/20 relative group/icon cursor-pointer shadow-2xl shadow-primary/10 transition-all duration-700">
            <div className="group-hover/icon:scale-110 transition-transform duration-500"><KotoriIcon size={100} /></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-charcoal leading-tight tracking-tight">
              Click any word. <br />
              <span className="relative inline-block group/reveal cursor-default">
                <span className="relative z-10 text-primary italic transition-colors duration-500">
                  Learn effortlessly. For free.
                </span>
                <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-[25%] bg-accent/20 rounded-full -z-0"></span>
              </span>
            </h1>
            <p className="text-base sm:text-xl opacity-60 font-medium max-w-2xl mx-auto leading-relaxed px-4">Stop the tab-switching madness. Reading shouldn't feel like a chore. Just click the word you don't know and keep moving. We’ll handle the rest.</p>
          </div>

          <button
            ref={heroButtonRef}
            type="button"
            onClick={() => scrollToSection('workflow')}
            className="group px-10 sm:px-14 py-5 sm:py-6 bg-primary text-white rounded-full text-lg sm:text-xl font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            See How It Works <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <section id="workflow" className="py-20 px-6 bg-card/50 reveal scroll-mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-12">Stop Breaking Your Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-red-900/10 p-8 md:p-10 rounded-[3rem] border border-red-500/20 text-left transition-transform hover:scale-[1.01] hover:shadow-xl duration-500">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-red-500"><AlertCircle size={20} /> Traditional Workflow</h3>
              <div className="space-y-5 opacity-80">
                {["See unknown word", "Copy it manually", "Switch to Translate tab", "Paste and wait for result", "Switch back... wait, where was I?"].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">{i + 1}</span>
                    <p className="font-bold text-sm sm:text-base text-charcoal">{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/10 p-8 md:p-10 rounded-[3rem] border-2 border-primary/20 shadow-xl text-left relative overflow-hidden transition-transform hover:scale-[1.01] hover:shadow-2xl duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-primary"><KotoriIcon size={20} /> Kotori Workflow</h3>
              <div className="space-y-8 relative z-10">
                {["Click unknown word", "See meaning + example instantly", "Keep reading naturally"].map((t, i) => (
                  <div key={i} className="flex items-start gap-4"><span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-primary/20">{i + 1}</span> <p className="font-bold text-base sm:text-lg">{t}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 reveal overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-12 space-y-3">
            <h3 ref={scribbleTriggerRef} className="text-3xl md:text-5xl font-black tracking-tight leading-tight relative z-10">
              Simple. Focused. <br className="sm:hidden" />
              <span className="relative inline-block">
                Perfect.
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[180%] pointer-events-none overflow-visible -z-10 transform rotate-3" viewBox="0 0 140 100" preserveAspectRatio="none">
                  <path
                    d="M 15,45 C 15,5 115,5 115,45 C 115,85 15,85 15,45 C 15,15 125,15 125,50 C 125,85 5,85 5,50"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`scribble-stroke ${isScribbleVisible ? 'draw-scribble' : ''}`}
                    opacity="0.6"
                  />
                </svg>
              </span>
            </h3>
            <p className="text-charcoal opacity-50 font-medium text-base sm:text-lg max-w-xl mx-auto pt-4 italic">The building blocks of Fluency.</p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto h-[550px] md:h-[600px]">
            <div className="bento-container w-full h-full relative">
              {FEATURES.map((feature, idx) => (
                <BentoCard
                  key={feature.id}
                  feature={feature}
                  pos={slotMap[idx]}
                />
              ))}
            </div>

            <button
              onClick={rotateSlots}
              className="absolute bottom-4 right-4 md:bottom-[33%] md:right-[31%] z-30 w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group border-4 border-card"
              aria-label="Cycle Features"
            >
              <RefreshCw size={28} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 overflow-visible scroll-mt-20 reveal">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          <div className="space-y-6 text-center lg:text-left max-w-xl">
            <h2 className="creative-title text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Context is <br className="sm:hidden" />
              <span ref={underlineTriggerRef} className="text-primary relative inline-block whitespace-nowrap">
                everything.
                <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-3 sm:h-4 pointer-events-none overflow-visible" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M5 15 C 50 12, 150 18, 195 14" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" className={`pencil-stroke ${isUnderlineVisible ? 'draw' : ''}`} />
                </svg>
              </span>
            </h2>
            <p className="text-base sm:text-lg opacity-60 font-medium leading-relaxed">Kotori doesn't just translate; it understands. You get the base form of every word, even when it's hidden in complex conjugations.</p>
            <div className="pt-4 border-t border-primary/10">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-3 text-center lg:text-left">Try the Demo:</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {DEMO_SENTENCES.map((s, idx) => (
                  <button key={idx} onClick={() => { setActiveTab(idx); setDemoWord(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase transition-all ${activeTab === idx ? 'bg-primary text-white shadow-md' : 'bg-primary/5 text-primary hover:bg-primary/20'}`}>{s.lang}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center shrink-0 w-full max-w-[360px] sm:max-w-[400px]">
            {showDemoHint && <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl">Click a word!</div>}
            <div className="w-full h-[450px] sm:h-[520px] bg-primary/5 border border-primary/10 rounded-[3rem] p-3 sm:p-5 shadow-inner transform rotate-1 hover:rotate-0 transition-all duration-700 flex flex-col">
              <div className="bg-card rounded-[2.5rem] shadow-2xl overflow-hidden h-full flex flex-col relative group/card border border-primary/10">
                <div className="bg-primary/10 p-4 flex justify-between items-center shrink-0 border-b border-primary/10">
                  <div className="flex items-center gap-2"><KotoriIcon size={20} primaryColor="var(--primary)" /><span className="font-bold text-xs text-primary tracking-tight">Kotori Reader</span></div>
                </div>
                <div className="p-5 flex flex-wrap gap-2 content-start flex-1 overflow-y-auto scrollbar-hide bg-bgSoft/20">
                  {currentDemo.tokens.map((w, idx) => {
                    const status = demoWordStatuses[w.text] || WordStatus.NONE;
                    let cls = 'bg-card border-primary/10 text-charcoal hover:border-primary/40 hover:text-primary';
                    if (status === WordStatus.LEARNING) cls = 'bg-accent text-gray-900 border-accent shadow-md scale-105';
                    else if (status === WordStatus.LEARNED) cls = 'bg-secondary text-white border-secondary shadow-md scale-105';
                    else if (demoWord === w.text) cls = 'bg-primary text-white border-primary shadow-lg scale-105';
                    return <button key={idx} type="button" onClick={() => handleDemoClick(w.text)} className={`px-2.5 py-1 rounded-lg border text-base sm:text-lg font-medium transition-all transform active:scale-90 ${cls}`}>{w.text}</button>;
                  })}
                </div>
                <div className={`absolute inset-x-3 bottom-3 z-10 transition-all duration-700 transform ${demoWord ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
                  <div className="bg-card border-2 border-primary/30 rounded-[2rem] p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl max-h-[260px] overflow-y-auto scrollbar-hide">
                    <button type="button" onClick={() => setDemoWord(null)} className="absolute top-3 right-3 p-1 opacity-30 hover:opacity-100 transition-all hover:scale-110"><X size={16} /></button>
                    {demoWord && (
                      <div className="animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-xl font-black text-primary tracking-tight">{demoWord}</h3>
                          <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{currentDemo.tokens.find(w => w.text === demoWord)?.rom}</span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-base font-bold text-charcoal leading-tight">{currentDemo.tokens.find(w => w.text === demoWord)?.trans}</p>
                          <div className="bg-primary/5 rounded-xl p-3 italic text-[10px] leading-relaxed opacity-80 border border-primary/5">"{currentDemo.tokens.find(w => w.text === demoWord)?.ex}"</div>
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setStatus(demoWord, WordStatus.LEARNING); }} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all ${demoWordStatuses[demoWord] === WordStatus.LEARNING ? 'bg-accent text-gray-900 shadow-lg' : 'bg-bgSoft opacity-60 border border-primary/10 hover:opacity-100'}`}><Bookmark size={14} fill={demoWordStatuses[demoWord] === WordStatus.LEARNING ? "currentColor" : "none"} />Learning</button>
                            <button onClick={(e) => { e.stopPropagation(); setStatus(demoWord, WordStatus.LEARNED); }} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all ${demoWordStatuses[demoWord] === WordStatus.LEARNED ? 'bg-secondary text-white shadow-lg' : 'bg-bgSoft opacity-60 border border-primary/10 hover:opacity-100'}`}><Bird size={14} fill={demoWordStatuses[demoWord] === WordStatus.LEARNED ? "white" : "none"} />Mastered</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal transition-all">
        <WaitlistSection />
      </section>

      <section id="faq" className="py-20 px-6 bg-card/40 reveal scroll-mt-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-center tracking-tight leading-tight">Frequently Chirped Questions</h2>
            <p className="text-charcoal opacity-50 font-medium max-w-xl mx-auto text-base sm:text-lg">Everything you need to know about the bird and the tool.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 max-w-3xl mx-auto">
            {[
              { q: "What languages will Kotori support?", a: "We're launching with full support for Japanese, Spanish, Chinese, and French. We'll add more languages based on waitlist requests!" },
              { q: "When does Kotori launch?", a: "Kotori launches February/March 2026. Join the waitlist for updates and early access before the public release." },
              { q: "How does the waitlist work?", a: "Join the waitlist to get special perks. Plus, you'll be invited to vote on which features we build first. Make your mark on the future of Kotori!" },
              { q: "What's the bird's name?", a: "The non-hatted ones are Namitori and the hatted ones are Kotori! There are many more to discover... Follow our Twitter and Instagram to get sneak peeks on them!" }
            ].map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <footer className="py-16 px-6 border-t border-primary/10 bg-card/60 reveal">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3"><KotoriIcon size={40} /><span className="text-2xl font-black text-primary tracking-tight">Kotori</span></div>
            <p className="opacity-40 font-bold text-[10px] uppercase tracking-[0.2em] text-center md:text-left">Built by Violet, a language learner who knew what was missing.</p>
          </div>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
            <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollToSection('waitlist')} className="hover:text-primary transition-colors">Waitlist</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors">FAQ</button>
          </div>
        </div>
      </footer>

      <style>{`
        /* Bento Morphing Variables */
        :root {
          --pos-main-t: 0%; --pos-main-l: 0%; --pos-main-w: 65%; --pos-main-h: 65%;
          --pos-vert-t: 0%; --pos-vert-l: 67%; --pos-vert-w: 33%; --pos-vert-h: 65%;
          --pos-wide-t: 67%; --pos-wide-l: 0%; --pos-wide-w: 65%; --pos-wide-h: 33%;
          --pos-small-t: 67%; --pos-small-l: 67%; --pos-small-w: 33%; --pos-small-h: 33%;
        }

        @media (max-width: 768px) {
          :root {
            /* Responsive Bento Layout */
            --pos-main-t: 0%; --pos-main-l: 0%; --pos-main-w: 100%; --pos-main-h: 45%;
            --pos-vert-t: 47%; --pos-vert-l: 0%; --pos-vert-w: 48%; --pos-vert-h: 24%;
            --pos-small-t: 47%; --pos-small-l: 52%; --pos-small-w: 48%; --pos-small-h: 24%;
            --pos-wide-t: 73%; --pos-wide-l: 0%; --pos-wide-w: 100%; --pos-wide-h: 27%;
          }
        }

        .bento-container {
          perspective: 1000px;
        }

        .pencil-stroke {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.445, 0.05, 0.55, 0.95);
        }
        .pencil-stroke.draw { stroke-dashoffset: 0; }
        .scribble-stroke {
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          transition: stroke-dashoffset 4.5s cubic-bezier(0.45, 0, 0.55, 1);
        }
        .scribble-stroke.draw-scribble { stroke-dashoffset: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; } 
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } 
        @keyframes feather-drift { 
          0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; } 
          10% { opacity: 0.05; } 
          90% { opacity: 0.03; } 
          100% { transform: translateY(110vh) rotate(360deg) translateX(50px); opacity: 0; } 
        } 
        .animate-feather-drift { animation: feather-drift 28s linear infinite; } 
        @keyframes bounce-subtle { 
          0%, 100% { transform: translate(-50%, 0); } 
          50% { transform: translate(-50%, -15px); } 
        } 
        .animate-bounce { animation: bounce-subtle 2.5s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default LandingPage;

// if you're reading this, please message me on usekotori@gmail.com and let me know how you got access to the code, please. i'm still a novice and still need to learn a lot about security. any flaws in the code are unintentional. thank you!