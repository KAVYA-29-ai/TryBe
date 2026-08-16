import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { PEOPLE } from '../data/people';
import { CLUBS } from '../data/clubs';
import { EVENTS } from '../data/events';
import { COLLEGES } from '../data/colleges';
import { useApp } from '../context/AppContext';

type Tab = 'All' | 'People' | 'Clubs' | 'Events' | 'Colleges';
const TABS: Tab[] = ['All', 'People', 'Clubs', 'Events', 'Colleges'];

// ── Filter dropdown state ──────────────────────────────────────

interface FilterState {
  interests: string;
  skills: string;
  location: string;
  college: string;
}

const INTEREST_OPTIONS = ['AI', 'Design', 'Entrepreneurship', 'Sports', 'Music', 'Debate', 'Open Source', 'Data Science'];
const SKILL_OPTIONS = ['Python', 'React', 'Figma', 'Flutter', 'Machine Learning', 'Node.js', 'TypeScript', 'SQL'];
const LOCATION_OPTIONS = ['Mathura', 'Noida', 'New Delhi'];

// ── Helpers ────────────────────────────────────────────────────

function normalize(str: string): string {
  return str.trim().toLowerCase();
}

function matchesQuery(fields: string[], query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  return fields.some(f => normalize(f).includes(q));
}

// ── Sub-views ──────────────────────────────────────────────────

function PeopleView({ people }: { people: typeof PEOPLE }) {
  if (people.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">person_off</span>
        <p className="font-body-md">No people found matching your search.</p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter"
    >
      {people.map((person) => (
        <article
          key={person.id}
          className="rounded-xl p-lg flex flex-col items-center text-center border border-outline-variant hover:border-primary/30 transition-all duration-300 bg-transparent"
        >
          <div className="relative mb-md">
            <img
              alt={person.name}
              className="w-24 h-24 rounded-full object-cover border border-outline-variant"
              src={person.image}
            />
            {person.online && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <h3 className="text-body-lg font-headline-md text-on-surface">{person.name}</h3>
          <p className="text-on-surface-variant font-label-sm text-label-sm mb-1">{person.role}</p>
          <p className="text-on-surface-variant text-[12px] mb-md">{person.college}</p>
          <div className="flex flex-wrap justify-center gap-xs mb-lg">
            {person.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-transparent rounded text-[10px] text-on-surface-variant border border-outline-variant"
              >
                {skill}
              </span>
            ))}
          </div>
          <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:opacity-90 transition-colors text-center block mt-auto shadow-sm">
            Connect
          </button>
        </article>
      ))}
    </motion.div>
  );
}

function ClubsView({ clubs }: { clubs: typeof CLUBS }) {
  const { joinedClubs, joinClub, leaveClub, getClubMemberCount } = useApp();

  if (clubs.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">group_off</span>
        <p className="font-body-md">No clubs found matching your search.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter"
    >
      {clubs.map((club) => {
        const joined = joinedClubs.has(club.id);
        const memberCount = getClubMemberCount(club.id, club.members);
        return (
          <article
            key={club.id}
            className="rounded-xl p-lg flex flex-col border border-outline-variant hover:border-primary/30 transition-all duration-300 bg-transparent"
          >
            <div className="flex justify-between items-start mb-lg">
              <div className="w-12 h-12 rounded-lg border border-outline-variant flex items-center justify-center text-primary bg-surface-container-low shrink-0">
                <span className="material-symbols-outlined">{club.icon}</span>
              </div>
              <span className="text-on-surface-variant font-label-sm text-[12px] whitespace-nowrap">
                {memberCount.toLocaleString()} Members
              </span>
            </div>
            <h3 className="text-body-lg font-headline-md text-on-surface mb-1">{club.title}</h3>
            <p className="text-on-surface-variant text-[12px] mb-md">{club.college}</p>
            <p className="text-on-surface-variant text-body-sm font-body-sm mb-lg line-clamp-3">
              {club.description}
            </p>
            <button
              onClick={() => (joined ? leaveClub(club.id) : joinClub(club.id))}
              className={`w-full font-label-md text-label-md py-sm rounded-lg transition-colors text-center block mt-auto shadow-sm ${
                joined
                  ? 'bg-surface-container-high border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container'
                  : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {joined ? 'Joined ✓' : 'Join Club'}
            </button>
          </article>
        );
      })}
    </motion.div>
  );
}

function EventsView({ events }: { events: typeof EVENTS }) {
  const { rsvpdEvents, interestedEvents, rsvpEvent, cancelRsvp, markInterested, removeInterested } = useApp();

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">event_busy</span>
        <p className="font-body-md">No events found matching your search.</p>
      </div>
    );
  }

  const featured = events.find(e => e.isFeatured);
  const rest = events.filter(e => !e.isFeatured);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-lg"
    >
      {featured && (
        <article className="rounded-xl p-0 flex flex-col justify-end min-h-[320px] relative overflow-hidden group border border-outline-variant hover:border-primary/30 transition-all duration-300">
          {featured.image ? (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"
              style={{ backgroundImage: `url('${featured.image}')` }}
            />
          ) : (
            <div className="absolute inset-0 bg-primary-container/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="relative z-10 p-xl">
            <span className="text-primary font-label-sm text-label-sm uppercase tracking-widest font-bold block mb-md">
              Featured Event
            </span>
            <h3 className="text-headline-xl font-headline-xl text-on-surface mb-4">{featured.title}</h3>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-lg">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              {featured.date}, {featured.time}
            </div>
            <button
              onClick={() =>
                rsvpdEvents.has(featured.id) ? cancelRsvp(featured.id) : rsvpEvent(featured.id)
              }
              className={`font-label-md text-label-md px-xl py-sm rounded-lg transition-colors w-max shadow-sm ${
                rsvpdEvents.has(featured.id)
                  ? 'bg-surface-container-high border border-outline-variant text-on-surface'
                  : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {rsvpdEvents.has(featured.id) ? 'RSVP\'d ✓' : 'RSVP Now'}
            </button>
          </div>
        </article>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        {rest.map(event => (
          <article
            key={event.id}
            className="rounded-xl p-lg border border-outline-variant flex flex-col bg-transparent hover:border-primary/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-md">
              <h3 className="text-body-lg font-headline-md text-on-surface flex-1 pr-4 leading-tight">
                {event.title}
              </h3>
              <span className="material-symbols-outlined text-on-surface-variant">event</span>
            </div>
            <p className="text-primary font-label-sm text-[12px] mb-sm">
              {event.date}, {event.time}
            </p>
            <p className="text-on-surface-variant text-[12px] mb-lg flex-1">{event.location}</p>
            <button
              onClick={() =>
                interestedEvents.has(event.id)
                  ? removeInterested(event.id)
                  : markInterested(event.id)
              }
              className={`w-full font-label-md text-label-md py-sm rounded-lg transition-colors ${
                interestedEvents.has(event.id)
                  ? 'bg-primary-container text-on-primary-container border border-primary-container'
                  : 'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container'
              }`}
            >
              {interestedEvents.has(event.id) ? 'Interested ✓' : 'Interested'}
            </button>
          </article>
        ))}
      </div>
    </motion.div>
  );
}

function CollegesView({ colleges }: { colleges: typeof COLLEGES }) {
  const navigate = useNavigate();

  if (colleges.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-4 block">domain_disabled</span>
        <p className="font-body-md">No colleges found matching your search.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter"
    >
      {colleges.map((college) => (
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
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {college.location}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              {college.students} students • {college.activeClubs} clubs
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
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function Discover() {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter dropdown states
  const [filters, setFilters] = useState<FilterState>({
    interests: '',
    skills: '',
    location: '',
    college: '',
  });

  const [openDropdown, setOpenDropdown] = useState<keyof FilterState | null>(null);

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
    setOpenDropdown(null);
  };

  // ── Filtered data ────────────────────────────────────────────
  const filteredPeople = useMemo(() => {
    return PEOPLE.filter(p => {
      const q = matchesQuery(
        [p.name, p.role, p.college, ...p.skills, ...p.interests, p.location],
        searchQuery
      );
      const loc = !filters.location || normalize(p.location).includes(normalize(filters.location));
      const skill = !filters.skills || p.skills.some(s => normalize(s).includes(normalize(filters.skills)));
      const interest = !filters.interests || p.interests.some(i => normalize(i).includes(normalize(filters.interests)));
      const college = !filters.college || normalize(p.college).includes(normalize(filters.college));
      return q && loc && skill && interest && college;
    });
  }, [searchQuery, filters]);

  const filteredClubs = useMemo(() => {
    return CLUBS.filter(c => {
      const q = matchesQuery(
        [c.title, c.description, c.category, c.college, ...c.tags],
        searchQuery
      );
      const college = !filters.college || normalize(c.college).includes(normalize(filters.college));
      const interest = !filters.interests || normalize(c.category).includes(normalize(filters.interests)) ||
        c.tags.some(t => normalize(t).includes(normalize(filters.interests)));
      return q && college && interest;
    });
  }, [searchQuery, filters]);

  const filteredEvents = useMemo(() => {
    return EVENTS.filter(e => {
      const q = matchesQuery([e.title, e.description, e.location, e.hostName], searchQuery);
      return q;
    });
  }, [searchQuery]);

  const filteredColleges = useMemo(() => {
    return COLLEGES.filter(c => {
      const q = matchesQuery([c.name, c.location, c.city, c.state], searchQuery);
      const loc = !filters.location || normalize(c.city).includes(normalize(filters.location));
      return q && loc;
    });
  }, [searchQuery, filters]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const clearFilters = () => {
    setFilters({ interests: '', skills: '', location: '', college: '' });
    setSearchQuery('');
  };

  // ── Render ──────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case 'People':
        return <PeopleView people={filteredPeople} />;
      case 'Clubs':
        return <ClubsView clubs={filteredClubs} />;
      case 'Events':
        return <EventsView events={filteredEvents} />;
      case 'Colleges':
        return <CollegesView colleges={filteredColleges} />;
      case 'All':
      default: {
        const hasAny =
          filteredPeople.length > 0 ||
          filteredClubs.length > 0 ||
          filteredEvents.length > 0 ||
          filteredColleges.length > 0;

        if (!hasAny) {
          return (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4 block">search_off</span>
              <p className="font-body-md">No results found for &ldquo;{searchQuery}&rdquo;</p>
              <button onClick={clearFilters} className="mt-4 text-primary font-label-md hover:underline">
                Clear search &amp; filters
              </button>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-xl">
            {filteredPeople.length > 0 && (
              <section>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">
                  People ({filteredPeople.length})
                </h3>
                <PeopleView people={filteredPeople.slice(0, 4)} />
              </section>
            )}
            {filteredClubs.length > 0 && (
              <section>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">
                  Clubs ({filteredClubs.length})
                </h3>
                <ClubsView clubs={filteredClubs.slice(0, 4)} />
              </section>
            )}
            {filteredEvents.length > 0 && (
              <section>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">
                  Events ({filteredEvents.length})
                </h3>
                <EventsView events={filteredEvents.slice(0, 3)} />
              </section>
            )}
            {filteredColleges.length > 0 && (
              <section>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-md">
                  Colleges ({filteredColleges.length})
                </h3>
                <CollegesView colleges={filteredColleges} />
              </section>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full" onClick={() => setOpenDropdown(null)}>
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-outline-variant pt-lg pb-md px-margin-mobile md:px-margin-desktop">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Discover</h2>
            <div className="relative w-full md:w-[480px] flex items-center gap-sm">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-full py-3 pl-xl pr-sm text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="Search people, clubs, events, colleges..."
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-12 h-12 rounded-full border border-primary bg-primary-container/20 flex items-center justify-center text-primary hover:bg-primary-container transition-colors shrink-0"
                  title="Clear all filters"
                >
                  <span className="material-symbols-outlined">filter_alt_off</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-md overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-md py-xs rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors border ${
                  activeTab === tab
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab}
              </button>
            ))}

            <div className="w-px h-6 bg-outline-variant mx-sm shrink-0" />

            {/* Interests filter */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'interests' ? null : 'interests')}
                className={`flex items-center gap-xs px-md py-xs rounded-full border font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                  filters.interests
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {filters.interests || 'Interests'}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              {openDropdown === 'interests' && (
                <div className="absolute top-full mt-xs left-0 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                  {INTEREST_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilter('interests', opt)}
                      className={`w-full text-left px-md py-sm font-label-sm text-label-sm hover:bg-surface-container-high transition-colors ${
                        filters.interests === opt ? 'text-primary bg-primary-container/20' : 'text-on-surface'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skills filter */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'skills' ? null : 'skills')}
                className={`flex items-center gap-xs px-md py-xs rounded-full border font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                  filters.skills
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {filters.skills || 'Skills'}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              {openDropdown === 'skills' && (
                <div className="absolute top-full mt-xs left-0 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                  {SKILL_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilter('skills', opt)}
                      className={`w-full text-left px-md py-sm font-label-sm text-label-sm hover:bg-surface-container-high transition-colors ${
                        filters.skills === opt ? 'text-primary bg-primary-container/20' : 'text-on-surface'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location filter */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
                className={`flex items-center gap-xs px-md py-xs rounded-full border font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                  filters.location
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {filters.location || 'Location'}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
              {openDropdown === 'location' && (
                <div className="absolute top-full mt-xs left-0 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden">
                  {LOCATION_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilter('location', opt)}
                      className={`w-full text-left px-md py-sm font-label-sm text-label-sm hover:bg-surface-container-high transition-colors ${
                        filters.location === opt ? 'text-primary bg-primary-container/20' : 'text-on-surface'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-xs mt-md">
              {Object.entries(filters).map(([key, value]) =>
                value ? (
                  <span
                    key={key}
                    className="flex items-center gap-xs px-sm py-xs bg-primary-container/20 text-primary rounded-full font-label-sm text-[11px] border border-primary-container"
                  >
                    {key}: {value}
                    <button
                      onClick={() => setFilter(key as keyof FilterState, value as string)}
                      className="hover:text-error"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
      </header>

      <div className="p-margin-mobile md:p-margin-desktop max-w-[1200px] mx-auto w-full">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>
    </div>
  );
}
