/**
 * Settings — Apple-design inspired
 *
 * Principles applied (from apple-design.md):
 * - Grouped inset table sections (iOS Settings pattern)
 * - iOS-style toggle: 51×31px, smooth spring transition, green for enabled
 * - Spring transitions on section switch (bounce:0, duration:0.3)
 * - Translucent sidebar with backdrop-filter (§12)
 * - Respond on press: active:scale-[0.98] on buttons (§1)
 * - Tight negative tracking on headings, comfortable body leading (§15)
 * - Spatial consistency: back arrow returns to same origin (§7)
 */
import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

type SettingsSection = 'account' | 'notifications' | 'privacy' | 'appearance' | 'data';

const SECTIONS: { id: SettingsSection; label: string; icon: string }[] = [
  { id: 'account',       label: 'Account',        icon: 'manage_accounts' },
  { id: 'notifications', label: 'Notifications',   icon: 'notifications'   },
  { id: 'privacy',       label: 'Privacy & Safety',icon: 'lock'            },
  { id: 'appearance',    label: 'Appearance',      icon: 'palette'         },
  { id: 'data',          label: 'Data & Storage',  icon: 'database'        },
];

// ── iOS-style toggle (§1: respond on press, §4: spring) ──────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none active:scale-95 ${
        checked ? 'bg-primary' : 'bg-surface-container-highest'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
        className={`inline-block h-[22px] w-[22px] rounded-full bg-white shadow-md ${
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

// ── Grouped list primitives (iOS Settings-style inset cards) ──────────────

function GroupedSection({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mb-xl">
      {label && (
        <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest px-sm mb-xs">
          {label}
        </p>
      )}
      <div className="rounded-2xl border border-outline-variant/60 overflow-hidden bg-surface divide-y divide-outline-variant/40">
        {children}
      </div>
    </div>
  );
}

function Row({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-lg py-sm min-h-[52px] gap-md ${danger ? 'bg-error-container/5' : 'bg-surface'}`}>
      {children}
    </div>
  );
}

function RowLabel({ label, description, danger }: { label: string; description?: string; danger?: boolean }) {
  return (
    <div className="flex-1 min-w-0">
      <p className={`font-label-md text-[14px] leading-tight ${danger ? 'text-error' : 'text-on-surface'}`}>{label}</p>
      {description && <p className="font-body-sm text-[12px] text-on-surface-variant mt-[2px] leading-relaxed">{description}</p>}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: () => void;
}) {
  return (
    <Row>
      <RowLabel label={label} description={description} />
      <Toggle checked={checked} onChange={onChange} label={label} />
    </Row>
  );
}

// ── Input row ─────────────────────────────────────────────────────────────

function InputRow({ label, value, onChange, type = 'text', disabled, placeholder }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <Row>
      <label className="font-label-md text-[14px] text-on-surface shrink-0 w-28">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`flex-1 min-w-0 bg-transparent border-none text-right font-body-md text-[14px] focus:outline-none text-on-surface placeholder:text-on-surface-variant/40 ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      />
    </Row>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[960px] mx-auto p-margin-mobile md:p-margin-desktop">

        {/* Page header */}
        <div className="flex items-center gap-md mb-xl">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant/60 bg-surface/80 backdrop-blur-sm text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h1 className="font-bold text-[22px] text-on-surface tracking-[-0.02em]">Settings</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-xl">

          {/* Sidebar — translucent material (§12) */}
          <nav className="md:w-52 shrink-0">
            <div className="md:sticky md:top-6 rounded-2xl border border-outline-variant/60 overflow-hidden bg-surface/80 backdrop-blur-xl backdrop-saturate-150 divide-y divide-outline-variant/30">
              {SECTIONS.map(s => {
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-sm px-md py-sm text-left transition-colors active:scale-[0.98] ${
                      active
                        ? 'bg-primary-container/25 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[19px]"
                      style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
                    >
                      {s.icon}
                    </span>
                    <span className="font-label-md text-[13px]">{s.label}</span>
                    {active && (
                      <span className="ml-auto material-symbols-outlined text-[14px] text-primary">chevron_right</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content — spring enter (§4) */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              >
                {activeSection === 'account'       && <AccountSettings />}
                {activeSection === 'notifications' && <NotificationSettings />}
                {activeSection === 'privacy'       && <PrivacySettings />}
                {activeSection === 'appearance'    && <AppearanceSettings />}
                {activeSection === 'data'          && <DataSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Account ───────────────────────────────────────────────────────────────

function AccountSettings() {
  const { userProfile, updateUserProfile } = useApp();
  const [email, setEmail] = useState('kavya@gla.ac.in');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saved = savedAt !== null && Date.now() - savedAt < 2000;

  const handleSave = () => {
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  return (
    <>
      <GroupedSection label="Profile">
        <InputRow label="Full Name"  value={userProfile.name}     onChange={v => updateUserProfile({ name: v })}     placeholder="Your name" />
        <InputRow label="Username"   value={`@${userProfile.username}`} onChange={v => updateUserProfile({ username: v.replace(/^@/, '') })} placeholder="@username" />
        <InputRow label="Email"      value={email}                onChange={setEmail}                                type="email" placeholder="email@uni.edu" />
        <InputRow label="College"    value={userProfile.college}  disabled placeholder="GLA University" />
      </GroupedSection>

      <div className="flex justify-end mb-xl -mt-lg">
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
          onClick={handleSave}
          className={`h-9 px-lg rounded-full font-label-md text-[13px] transition-all flex items-center gap-xs ${
            saved
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'bg-primary text-on-primary hover:opacity-90 shadow-sm'
          }`}
        >
          {saved ? <><span className="material-symbols-outlined text-[14px]">check</span> Saved!</> : 'Save Changes'}
        </motion.button>
      </div>

      <GroupedSection label="Security">
        <Row>
          <RowLabel label="Current Password" />
          <input type="password" placeholder="••••••••" className="bg-transparent border-none text-right font-body-md text-[14px] w-36 focus:outline-none text-on-surface placeholder:text-on-surface-variant/40" />
        </Row>
        <Row>
          <RowLabel label="New Password" />
          <input type="password" placeholder="••••••••" className="bg-transparent border-none text-right font-body-md text-[14px] w-36 focus:outline-none text-on-surface placeholder:text-on-surface-variant/40" />
        </Row>
        <Row>
          <div />
          <button className="h-8 px-md rounded-full border border-outline-variant text-on-surface font-label-sm text-[12px] hover:bg-surface-container-high active:scale-95 transition-all">
            Update Password
          </button>
        </Row>
      </GroupedSection>

      <GroupedSection label="Danger Zone">
        <Row danger>
          <RowLabel label="Deactivate Account" description="Temporarily disable. You can reactivate anytime." danger />
          <button className="h-8 px-md rounded-full border border-error/40 text-error font-label-sm text-[12px] hover:bg-error-container/20 active:scale-95 transition-all shrink-0">
            Deactivate
          </button>
        </Row>
      </GroupedSection>
    </>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────

function NotificationSettings() {
  const [p, setP] = useState({
    clubPosts: true, eventReminders: true, newMembers: false,
    projectRequests: true, comments: true, likes: false,
    collegeAnnouncements: true, emailDigest: false,
  });
  const toggle = (k: keyof typeof p) => setP(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <>
      <GroupedSection label="Club & College">
        <ToggleRow label="Club post updates"      description="When someone posts in your clubs" checked={p.clubPosts}            onChange={() => toggle('clubPosts')} />
        <ToggleRow label="New club members"                                                        checked={p.newMembers}            onChange={() => toggle('newMembers')} />
        <ToggleRow label="College announcements"                                                   checked={p.collegeAnnouncements}  onChange={() => toggle('collegeAnnouncements')} />
      </GroupedSection>

      <GroupedSection label="Events">
        <ToggleRow label="Event reminders" description="1 hour before an event you RSVP'd to" checked={p.eventReminders} onChange={() => toggle('eventReminders')} />
      </GroupedSection>

      <GroupedSection label="Social">
        <ToggleRow label="Comments on your posts" checked={p.comments}         onChange={() => toggle('comments')} />
        <ToggleRow label="Likes on your posts"    checked={p.likes}            onChange={() => toggle('likes')} />
        <ToggleRow label="Project join requests"  checked={p.projectRequests}  onChange={() => toggle('projectRequests')} />
      </GroupedSection>

      <GroupedSection label="Email">
        <ToggleRow label="Weekly digest" description="A summary of what's happening on campus" checked={p.emailDigest} onChange={() => toggle('emailDigest')} />
      </GroupedSection>
    </>
  );
}

// ── Privacy ───────────────────────────────────────────────────────────────

function PrivacySettings() {
  const [p, setP] = useState({
    publicProfile: true, showCollege: true, showClubs: true,
    showProjects: true, allowMessages: true, indexProfile: false,
  });
  const toggle = (k: keyof typeof p) => setP(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <>
      <GroupedSection label="Profile Visibility">
        <ToggleRow label="Public profile"    description="Anyone on TRYBEE can view your profile" checked={p.publicProfile} onChange={() => toggle('publicProfile')} />
        <ToggleRow label="Show my college"                                                          checked={p.showCollege}   onChange={() => toggle('showCollege')} />
        <ToggleRow label="Show joined clubs"                                                        checked={p.showClubs}     onChange={() => toggle('showClubs')} />
        <ToggleRow label="Show my projects"                                                         checked={p.showProjects}  onChange={() => toggle('showProjects')} />
      </GroupedSection>

      <GroupedSection label="Messaging">
        <ToggleRow label="Allow messages from anyone" description="If off, only club members can message you" checked={p.allowMessages} onChange={() => toggle('allowMessages')} />
      </GroupedSection>

      <GroupedSection label="Search & Discovery">
        <ToggleRow label="Allow search engine indexing" checked={p.indexProfile} onChange={() => toggle('indexProfile')} />
      </GroupedSection>
    </>
  );
}

// ── Appearance ────────────────────────────────────────────────────────────

function AppearanceSettings() {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <>
      <GroupedSection label="Theme">
        {(['Dark', 'System'] as const).map(theme => (
          <Row key={theme}>
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                {theme === 'Dark' ? 'dark_mode' : 'brightness_auto'}
              </span>
              <RowLabel label={theme} description={theme === 'Dark' ? 'Always dark' : 'Follows your device'} />
            </div>
            {theme === 'Dark' && (
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                check_circle
              </span>
            )}
          </Row>
        ))}
        <Row>
          <RowLabel label="Light Mode" description="Coming soon" />
          <span className="font-label-sm text-[11px] text-on-surface-variant px-sm py-xs rounded-full bg-surface-container-high border border-outline-variant">Soon</span>
        </Row>
      </GroupedSection>

      <GroupedSection label="Text Size">
        <Row>
          <span className="text-[12px] text-on-surface-variant font-body-sm shrink-0">A</span>
          <div className="flex gap-sm flex-1 mx-md">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-xs rounded-lg border font-label-sm text-[12px] capitalize transition-all active:scale-95 ${
                  fontSize === size
                    ? 'border-primary bg-primary-container/20 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-[20px] text-on-surface-variant font-body-lg shrink-0">A</span>
        </Row>
      </GroupedSection>
    </>
  );
}

// ── Data & Storage ────────────────────────────────────────────────────────

function DataSettings() {
  const [cleared, setCleared] = useState(false);

  const clearLocalData = () => {
    Object.keys(localStorage).filter(k => k.startsWith('trybee_')).forEach(k => localStorage.removeItem(k));
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <>
      <GroupedSection label="Local Storage">
        <Row>
          <RowLabel label="Clear local data" description="Removes clubs, posts, RSVPs. Cannot be undone." />
          <button
            onClick={clearLocalData}
            className={`h-8 px-md rounded-full border font-label-sm text-[12px] transition-all active:scale-95 shrink-0 ${
              cleared
                ? 'border-green-600/30 text-green-400 bg-green-600/10'
                : 'border-error/40 text-error hover:bg-error-container/20'
            }`}
          >
            {cleared ? 'Cleared ✓' : 'Clear Data'}
          </button>
        </Row>
      </GroupedSection>

      <GroupedSection label="Export">
        <Row>
          <RowLabel label="Download your data" description="Posts, projects, and profile as JSON." />
          <button className="h-8 px-md rounded-full border border-outline-variant text-on-surface font-label-sm text-[12px] hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-xs shrink-0">
            <span className="material-symbols-outlined text-[14px]">download</span>
            Export
          </button>
        </Row>
      </GroupedSection>

      <GroupedSection label="About">
        <Row>
          <RowLabel label="TRYBEE Version" />
          <span className="font-label-sm text-[12px] text-on-surface-variant">1.0.0</span>
        </Row>
        <Row>
          <RowLabel label="Privacy Policy" />
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">open_in_new</span>
        </Row>
        <Row>
          <RowLabel label="Terms of Service" />
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">open_in_new</span>
        </Row>
      </GroupedSection>
    </>
  );
}
