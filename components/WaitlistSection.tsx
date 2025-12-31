import { supabase } from '../services/supabase';
import React, { useState } from 'react';
import { Envelope, ArrowRight, CheckCircle, Star, ChatCircle, Layout, InstagramLogo, TwitterLogo } from '@phosphor-icons/react';

interface WaitlistSectionProps {
  onSuccess?: () => void;
}

const WaitlistSection: React.FC<WaitlistSectionProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'flying' | 'success'>('idle');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('flying');

    try {
      // 1. fetch the user's public ip
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // 2. check how many times this ip has signed up
      const { count, error: countError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_ip', ip);

      if (count !== null && count >= 2) {
        alert("The nest is full. Only two signups per nest.");
        setStatus('idle');
        return;
      }

      // 3. insert with the ip address
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, user_ip: ip }]);

      if (error) {
        // handle error as before...
      } else {
        setTimeout(() => {
          setStatus('success');
          onSuccess?.();
        }, 1200);
      }
    } catch (err) {
      console.error("ip fetch failed", err);
      // fallback: just try to insert without ip or show error
    }
  };

  return (
    <section id="waitlist" className="py-32 px-6 scroll-mt-20 relative overflow-hidden reveal">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-card border border-primary/10 rounded-[4rem] p-10 md:p-20 shadow-2xl relative">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
            Get notified when the bird leaves its nest
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">
            Expect the messenger pigeon to be at your door by <span className="text-primary">February/March 2026.</span> Be there. Please..?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left max-w-3xl mx-auto">
            <div className="p-5 bg-bgSoft/60 rounded-2xl flex gap-3 items-start border border-primary/5 transition-transform hover:scale-105 duration-300">
              <Star className="text-accent shrink-0" size={20} weight="fill" />
              <p className="text-xs font-bold leading-relaxed opacity-70">A discount at launch. Not 100% though, don't get your hopes up.</p>
            </div>
            <div className="p-5 bg-bgSoft/60 rounded-2xl flex gap-3 items-start border border-primary/5 transition-transform hover:scale-105 duration-300">
              <ChatCircle className="text-primary shrink-0" size={20} weight="fill" />
              <p className="text-xs font-bold leading-relaxed opacity-70">Vote on future languages & features.</p>
            </div>
            <div className="p-5 bg-bgSoft/60 rounded-2xl flex gap-3 items-start border border-primary/5 transition-transform hover:scale-105 duration-300">
              <Layout className="text-secondary shrink-0" size={20} weight="fill" />
              <p className="text-xs font-bold leading-relaxed opacity-70">Know how the development is going live.</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="relative max-w-md mx-auto">
            {status !== 'success' ? (
              <div className="space-y-6">
                <div className="relative group">
                  <Envelope className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} weight="bold" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-14 pr-6 py-5 bg-bgSoft border-2 border-primary/10 rounded-3xl outline-none focus:border-primary/40 transition-all font-bold text-lg shadow-inner text-charcoal"
                    required
                  />
                </div>

                <div className="relative group/btn">
                  {status === 'idle' && (
                    <div className="absolute -top-6 inset-x-0 flex justify-center items-end gap-6 pointer-events-none">
                      <div className="animate-[bounce_3s_infinite_ease-in-out]">
                        <BirdIcon color="var(--primary)" size={24} />
                      </div>
                      <div className="animate-[bounce_3.5s_infinite_ease-in-out_0.2s]">
                        <BirdIcon color="var(--secondary)" size={24} />
                      </div>
                    </div>
                  )}

                  {status === 'flying' && (
                    <div className="absolute -top-6 inset-x-0 flex justify-center items-end gap-6 pointer-events-none">
                      <div className="animate-fly-left">
                        <BirdIcon color="var(--primary)" size={24} />
                      </div>
                      <div className="animate-fly-up">
                        <BirdIcon color="var(--secondary)" size={24} />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-5 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden ${status === 'flying' ? 'cursor-wait opacity-90' : ''}`}
                  >
                    {status === 'flying' ? 'Taking Flight...' : 'Join the Waitlist'}
                    <ArrowRight size={24} weight="bold" />
                  </button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">No spam. I have better things to do than that.</p>
              </div>
            ) : (
              <div className="animate-in zoom-in duration-500 flex flex-col items-center py-4">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6 border border-secondary/20">
                  <CheckCircle className="text-secondary w-10 h-10" weight="fill" />
                </div>
                <h3 className="text-3xl font-black mb-2 tracking-tight text-charcoal">Welcome to the flock!</h3>
                <p className="opacity-60 font-bold mb-6 text-charcoal">You're on the list. Keep an eye on your inbox.</p>
                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 max-w-sm text-xs font-bold leading-relaxed mb-8 text-charcoal">
                  We'll invite you to vote on our first official expansion language in the coming weeks!
                </div>

                <div className="flex gap-8">
                  <a href="https://www.instagram.com/kotoriapp/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all">
                    <InstagramLogo size={18} weight="fill" />
                    @kotoriapp
                  </a>
                  <a href="https://x.com/kotoriapp" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all">
                    <TwitterLogo size={18} weight="fill" />
                    @kotoriapp
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fly-left {
          0% { transform: translate(0, 0) scale(1) rotate(0); opacity: 1; }
          100% { transform: translate(-250px, -400px) scale(1.5) rotate(-45deg); opacity: 0; }
        }
        @keyframes fly-up {
          0% { transform: translate(0, 0) scale(1) rotate(0); opacity: 1; }
          100% { transform: translate(0, -500px) scale(2) rotate(15deg); opacity: 0; }
        }
        .animate-fly-left { animation: fly-left 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-fly-up { animation: fly-up 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </section>
  );
};

const BirdIcon = ({ color, size = 32 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill={color} stroke="#3D3D3D" strokeWidth="4" />
    <circle cx="50" cy="65" r="20" fill="white" fillOpacity="0.2" />
    <circle cx="35" cy="45" r="8" fill="white" stroke="#3D3D3D" strokeWidth="2" />
    <circle cx="35" cy="45" r="4" fill="#3D3D3D" />
    <circle cx="65" cy="45" r="8" fill="white" stroke="#3D3D3D" strokeWidth="2" />
    <circle cx="65" cy="45" r="4" fill="#3D3D3D" />
    <path d="M45 55C45 52 55 52 55 55C55 60 50 63 50 63C50 63 45 60 45 55Z" fill="#FFA726" stroke="#3D3D3D" strokeWidth="2" />
  </svg>
);

export default WaitlistSection;
