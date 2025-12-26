import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Star, MessageCircle, Layout, Instagram, Twitter } from 'lucide-react';
// import the client we made earlier
import { supabase } from '../services/supabase';

interface WaitlistSectionProps {
  onSuccess?: () => void;
}

const WaitlistSection: React.FC<WaitlistSectionProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'flying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

const handleJoin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;

  setStatus('flying');
  
  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: email.toLowerCase().trim() }]);

    if (error) {
      // check for your unique constraint violation (code 23505)
      if (error.code === '23505') {
        throw new Error("you're already on the list, birdy.");
      }
      throw error;
    }

    // sync the success state with your bird animation
    setTimeout(() => {
      setStatus('success');
      onSuccess?.();
    }, 1200);

  } catch (err: any) {
    console.error('supabase fail:', err.message);
    alert(err.message); // or use a pretty toast if you aren't lazy
    setStatus('idle');
  }
};

  return (
    <section id="waitlist" className="py-24 px-6 scroll-mt-20 relative overflow-hidden">
      {/* ... keeping your existing layout ... */}
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-card border border-primary/10 rounded-[4rem] p-10 md:p-20 shadow-2xl relative">
          
          {/* ... existing header content ... */}

          <form onSubmit={handleJoin} className="relative max-w-md mx-auto">
            {status !== 'success' ? (
              <div className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-14 pr-6 py-5 bg-bgSoft border-2 border-primary/5 rounded-3xl outline-none focus:border-primary/30 transition-all font-bold text-lg shadow-inner"
                    required
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{errorMessage}</p>
                )}

                <div className="relative group/btn">
                  {/* ... your bird animation logic stays the same ... */}
                  <button
                    type="submit"
                    disabled={status === 'flying'}
                    className={`w-full py-5 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden ${status === 'flying' ? 'cursor-wait opacity-90' : ''}`}
                  >
                    {status === 'flying' ? 'Taking Flight...' : 'Join the Waitlist'}
                    <ArrowRight size={24} />
                  </button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Lock in your early bird discount.</p>
              </div>
            ) : (
              /* ... success state stays the same ... */
              <div className="animate-in zoom-in duration-500 flex flex-col items-center py-4">
                 <CheckCircle2 className="text-secondary w-10 h-10" />
                 <h3 className="text-3xl font-black mb-2">Welcome to the flock!</h3>
                 {/* ... etc ... */}
              </div>
            )}
          </form>
        </div>
      </div>
      {/* ... style tag ... */}
    </section>
  );
};

// ... BirdIcon component ...

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
