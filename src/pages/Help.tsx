import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'How do I join a club?',
    a: 'Go to Clubs in the sidebar, find the club you want, and click "Join Club". Your membership is saved automatically and will persist across sessions.',
  },
  {
    q: 'How do I create a post?',
    a: 'Navigate to My College → Feed tab, then use the "Share campus news or updates..." input at the top. Select a tag, write your post, and click Post.',
  },
  {
    q: 'How do I RSVP to an event?',
    a: 'Open My College → Events tab, or visit any club dashboard → Events tab. Click the "RSVP Now" or "RSVP" button on any event. Your RSVP is saved automatically.',
  },
  {
    q: 'How do I explore other colleges?',
    a: 'Go to My College and scroll down to "Discover Other Colleges". Click Explore on any college card to see their About, Clubs, and Events — without seeing their private feed.',
  },
  {
    q: 'How do I create a project?',
    a: 'Go to Work → My Projects tab and click "Create New Project". Fill in the title, description, technologies, and team requirements. Your project appears in My Projects immediately.',
  },
  {
    q: 'How do I edit my profile?',
    a: 'Click on Profile in the sidebar, then click "Edit Profile". You can update your name, username, bio, location, skills, and interests. Changes are saved instantly.',
  },
  {
    q: 'How does the Discover search work?',
    a: 'Search by any keyword across People, Clubs, Events, and Colleges. Use the Interests, Skills, and Location dropdowns to filter further. Results update in real time as you type.',
  },
  {
    q: 'Why can\'t I see the Feed on other colleges?',
    a: 'The Feed and Discussions tabs are only available on your primary college (GLA University). Other colleges show only About, Clubs, and Events — this is by design to keep feeds college-specific.',
  },
  {
    q: 'Does my data persist after I refresh?',
    a: 'Yes. Joined clubs, RSVPs, created posts, and projects are saved to your browser\'s localStorage and persist across refreshes. Clearing browser data will reset them.',
  },
  {
    q: 'How do I leave a club?',
    a: 'On the Clubs page or any club card, if you\'ve joined, the button changes to "Joined ✓". Click it and it will toggle back to leave. Or open the Club Dashboard and click the Joined button there.',
  },
];

const GUIDES = [
  { icon: 'rocket_launch', title: 'Getting Started', desc: 'New to TRYBEE? Learn the basics in 2 minutes.', color: 'from-purple-500/10 to-pink-500/10' },
  { icon: 'hub', title: 'Clubs Guide', desc: 'How to find, join, and engage with clubs.', color: 'from-blue-500/10 to-cyan-500/10' },
  { icon: 'work', title: 'Work & Projects', desc: 'Create and find student collaboration projects.', color: 'from-amber-500/10 to-orange-500/10' },
  { icon: 'event', title: 'Events & RSVPs', desc: 'Never miss a campus event again.', color: 'from-green-500/10 to-emerald-500/10' },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-outline-variant rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-md text-left hover:bg-surface-container-high transition-colors"
      >
        <span className="font-label-md text-on-surface pr-md">{faq.q}</span>
        <span
          className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-md pb-md font-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/50 pt-md">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const filteredFaqs = FAQS.filter(
    f =>
      !searchQuery ||
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContact = (e: FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setSubmitted(true);
    setContactForm({ subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[900px] mx-auto p-margin-mobile md:p-margin-desktop">
        {/* Header */}
        <div className="flex items-center gap-md mb-xl">
          <Link
            to="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-headline-lg text-on-surface">Help & Support</h1>
            <p className="font-body-sm text-on-surface-variant">Find answers and get in touch</p>
          </div>
        </div>

        {/* Quick guides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
          {GUIDES.map(g => (
            <div
              key={g.title}
              className={`p-md rounded-xl border border-outline-variant bg-gradient-to-br ${g.color} hover:border-primary-container transition-colors cursor-pointer group`}
            >
              <span className="material-symbols-outlined text-primary text-[28px] mb-sm block">{g.icon}</span>
              <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors">{g.title}</h3>
              <p className="font-body-sm text-on-surface-variant mt-xs">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ search */}
        <h2 className="font-headline-md text-on-surface mb-md">Frequently Asked Questions</h2>
        <div className="relative mb-lg">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-sm pl-12 pr-md text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-sm mb-xl">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4 block">search_off</span>
              <p className="font-body-md">No results for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <div key={`faq-${i}`}>
                <FAQItem faq={faq} />
              </div>
            ))
          )}
        </div>

        {/* Contact form */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="font-headline-sm text-on-surface mb-xs">Still need help?</h2>
          <p className="font-body-sm text-on-surface-variant mb-lg">Send us a message and we'll get back to you within 24 hours.</p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-lg text-center"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-md" style={{ fontVariationSettings: '"FILL" 1' }}>
                check_circle
              </span>
              <h3 className="font-headline-sm text-on-surface">Message sent!</h3>
              <p className="font-body-sm text-on-surface-variant mt-xs">We'll get back to you soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleContact} className="flex flex-col gap-md">
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="What do you need help with?"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-xs">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue or question..."
                  required
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-xl py-sm bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-all flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap gap-md justify-center mt-xl text-on-surface-variant font-body-sm">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Community Guidelines</a>
          <a href="mailto:support@trybee.app" className="hover:text-primary transition-colors">support@trybee.app</a>
        </div>
      </div>
    </div>
  );
}
