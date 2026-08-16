import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { RightSidebar } from '../components/college/RightSidebar';
import { FeedTab } from '../components/college/FeedTab';
import { ClubsTab } from '../components/college/ClubsTab';
import { EventsTab } from '../components/college/EventsTab';
import { AboutTab } from '../components/college/AboutTab';
import { DiscussionsTab } from '../components/college/DiscussionsTab';
import { COLLEGES } from '../data/colleges';
import { PRIMARY_COLLEGE_ID } from '../data/colleges';

const OTHER_COLLEGES = COLLEGES.filter(c => c.id !== PRIMARY_COLLEGE_ID);

export default function MyCollege() {
  const navigate = useNavigate();
  const [view, setView] = useState<'overview' | 'dashboard'>('overview');
  const [activeTab, setActiveTab] = useState<'Feed' | 'Clubs' | 'Events' | 'About' | 'Discussions'>('Feed');

  const tabs = ['Feed', 'Clubs', 'Events', 'About', 'Discussions'] as const;

  if (view === 'overview') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-margin-mobile md:p-margin-desktop">
          {/* Top Section: Your College */}
          <section className="mb-xl">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-md">Your College</h1>
            <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant group min-h-[400px] flex flex-col justify-end p-lg md:p-xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGxytKOaHObzqo9XfI7c2kw2SgDayFpE5scvrXJFd_ir6J0zUkbngQXVPmovaGG9ec-LPRFuCu3rwf_mff3HXDK4hkkSbBzJR29yR2h2uJkAMHKtpf3skUNU4HZSSdogHOQJm8WAYrB4b2XGVoH65K3_U5wpeOBOfzstEES9U4fOEy5PNZ-d0eZ7VEhQRxvOG0o7b14EeXRcgYPzyEYbHMdwfvVIaMImyncySiaSpJuUJS4XGcJL0x')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/80 to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-lg">
                <div>
                  <div className="flex items-center gap-sm mb-sm">
                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-outline-variant shadow-[0_0_20px_rgba(125,64,71,0.3)]">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                        school
                      </span>
                    </div>
                    <span className="px-sm py-base bg-secondary-container/50 text-on-secondary-container font-label-sm text-label-sm rounded-full border border-primary-container backdrop-blur-md">
                      Verified Primary
                    </span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface mb-xs drop-shadow-lg">GLA University</h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    Mathura, Uttar Pradesh
                  </p>
                </div>
                <div className="flex flex-col gap-sm">
                  <div className="flex gap-md bg-surface/40 backdrop-blur-md p-sm rounded-lg border border-outline-variant">
                    <div className="text-center px-sm border-r border-outline-variant">
                      <div className="font-headline-md text-headline-md text-primary">15k+</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Students</div>
                    </div>
                    <div className="text-center px-sm">
                      <div className="font-headline-md text-headline-md text-primary">45</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Active Clubs</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('dashboard')}
                    className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-fixed-dim transition-all duration-300 active:scale-95 flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(200,92,104,0.4)]"
                  >
                    View Dashboard <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Discover Other Colleges */}
          <section>
            <div className="flex justify-between items-end mb-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Discover Other Colleges</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                  Expand your kinetic connections beyond your campus.
                </p>
              </div>
              <button
                onClick={() => navigate('/discover?tab=Colleges')}
                className="hidden md:flex text-primary font-label-md text-label-md items-center gap-xs hover:text-primary-fixed-dim transition-colors"
              >
                View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {OTHER_COLLEGES.map(college => (
                <div
                  key={college.id}
                  className="bg-surface rounded-xl border border-outline-variant overflow-hidden hover:border-primary-container transition-colors duration-300 group"
                >
                  <div className="h-32 w-full relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${college.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                  </div>
                  <div className="p-md relative">
                    <div className="absolute -top-10 right-md w-12 h-12 bg-surface rounded-lg border border-outline-variant flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-secondary">{college.icon}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{college.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mb-md">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {college.location}
                    </p>
                    <button
                      onClick={() => navigate(`/college/${college.id}`)}
                      className="w-full bg-transparent border border-outline-variant text-on-surface font-label-md text-label-md py-sm rounded-lg hover:bg-surface-container-high transition-colors active:scale-95"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ── Dashboard view ──────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="w-full bg-surface-container border-b border-outline-variant relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-primary-container to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-xl relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
          <div className="flex items-center gap-lg">
            <div
              className="w-20 h-20 rounded-xl bg-surface border border-outline flex items-center justify-center p-sm shadow-lg shadow-primary-container/20 cursor-pointer"
              onClick={() => setView('overview')}
            >
              <span className="material-symbols-outlined text-4xl text-primary">account_balance</span>
            </div>
            <div className="flex flex-col gap-xs">
              <div className="flex items-center gap-sm">
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                  GLA University
                </h1>
                <span className="px-sm py-base bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm flex items-center gap-base border border-on-secondary-fixed-variant">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    verified
                  </span>
                  Primary
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">Mathura, Uttar Pradesh • 12K+ Members</p>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <button className="px-md py-sm bg-surface-variant text-on-surface rounded-lg font-label-md text-label-md border border-outline-variant hover:bg-surface-container-high transition-colors">
              Directory
            </button>
            <button className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-colors">
              Invite
            </button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex items-center gap-lg overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-sm font-label-md text-label-md relative transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface border-b-2 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex gap-lg items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex w-full"
            >
              {activeTab === 'Feed' && <FeedTab />}
              {activeTab === 'Clubs' && <ClubsTab />}
              {activeTab === 'Events' && <EventsTab />}
              {activeTab === 'About' && <AboutTab />}
              {activeTab === 'Discussions' && <DiscussionsTab />}
            </motion.div>
          </AnimatePresence>

          {activeTab !== 'Discussions' && <RightSidebar />}
        </div>
      </div>
    </div>
  );
}
