import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (topic: string) => {
    setSelected(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const topics = [
    { id: 'software', label: 'Software Engineering', icon: 'code' },
    { id: 'ai', label: 'AI & Machine Learning', icon: 'smart_toy' },
    { id: 'data', label: 'Data Science', icon: 'data_object' },
    { id: 'ui', label: 'UI/UX Design', icon: 'draw' },
    { id: 'graphic', label: 'Graphic Design', icon: 'palette' },
    { id: 'startup', label: 'Startups', icon: 'rocket_launch' },
    { id: 'gaming', label: 'Gaming', icon: 'sports_esports' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <div className="w-full h-1 bg-surface-container-high fixed top-0 left-0 z-50">
        <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_#ffb2b9]"></div>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-margin-desktop md:py-24">
        <div className="w-full max-w-[800px] flex flex-col gap-xl">
          <div className="flex flex-col gap-sm text-center">
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">Step 2 of 3</span>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Which topics interest you?</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[512px] mx-auto">
              Select a few areas to personalize your Discover feed. The more you pick, the better your connections.
            </p>
          </div>
          <div className="flex flex-wrap gap-md justify-center mt-lg">
            {topics.map(topic => {
              const isSelected = selected.includes(topic.id);
              return (
                <button 
                  key={topic.id}
                  onClick={() => toggleSelection(topic.id)}
                  className={`px-6 py-3 rounded-full border border-outline-variant font-label-md transition-all ${
                    isSelected 
                      ? 'bg-primary-container/20 border-primary text-primary shadow-[0_0_20px_rgba(125,64,71,0.4)] transform -translate-y-[2px]' 
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined align-middle mr-2 text-[18px]" style={{ fontVariationSettings: `"FILL" ${isSelected ? 1 : 0}` }}>{topic.icon}</span>
                  {topic.label}
                </button>
              )
            })}
          </div>
          <div className="mt-xl flex items-center justify-between border-t border-outline-variant pt-lg">
            <button onClick={() => navigate('/home')} className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2">Skip for now</button>
            <div className="flex items-center gap-sm">
              <span className="font-body-sm text-body-sm text-on-surface-variant mr-4 hidden md:inline-block">{selected.length} selected</span>
              <button 
                onClick={() => navigate('/home')}
                disabled={selected.length === 0}
                className={`font-label-md text-label-md px-8 py-4 rounded-full transition-all duration-300 flex items-center group ${
                  selected.length > 0 
                    ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(255,178,185,0.2)] hover:bg-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed'
                }`}
              >
                Next Step
                <span className="material-symbols-outlined ml-2 transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
