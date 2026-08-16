import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Post, Comment, Project } from '../data/types';
import { INITIAL_PROJECTS } from '../data/projects';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  college: string;
  joinedDate: string;
  skills: string[];
  interests: string[];
}

interface AppState {
  /** Set of club IDs the current user has joined */
  joinedClubs: Set<string>;
  /** Set of event IDs the user has RSVP'd to */
  rsvpdEvents: Set<string>;
  /** Set of event IDs the user marked as "Interested" */
  interestedEvents: Set<string>;
  /** College-scoped posts keyed by collegeId */
  collegePosts: Record<string, Post[]>;
  /** Club-scoped posts keyed by clubId */
  clubPosts: Record<string, Post[]>;
  /** All projects (own + browsed) */
  projects: Project[];
  /** Comments keyed by postId */
  comments: Record<string, Comment[]>;
  /** Liked post IDs */
  likedPosts: Set<string>;
  /** Current user profile */
  userProfile: UserProfile;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Kavya Rajput',
  username: 'kvya.x_x',
  bio: 'Building things that matter. Exploring the intersection of design, technology, and community. Always down for a coffee chat. ☕️',
  location: 'Mathura, India',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZWZ6hXOz2o4IibLgz9AtdxXjPUPiNFEJyqza76VKCXd6EarCFBjmLwqJgrFk3dLIwrZxuLyaAeLRf21F4oWlwnn8Z7wyA91tJ4M5R4KoRyq_V6NEmzRYisnXpr3PlVqgFxoecgga1cxgXrCY46RDc_VlzbXejWyRlIQCPCm3oQOGB_vy6rfMwfjOdZn4nw47ClxfDPXvATwEYekYZshmpLmsvHoUfP7qfREcHBKgLg26vmr_BBLFQ',
  college: 'GLA University',
  joinedDate: 'Aug 2026',
  skills: ['React', 'Figma', 'UI/UX', 'TypeScript'],
  interests: ['Design', 'AI', 'Startups', 'Open Source'],
};

interface AppContextValue extends AppState {
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  rsvpEvent: (eventId: string) => void;
  cancelRsvp: (eventId: string) => void;
  markInterested: (eventId: string) => void;
  removeInterested: (eventId: string) => void;
  addCollegePost: (collegeId: string, post: Post) => void;
  addClubPost: (clubId: string, post: Post) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  addComment: (postId: string, comment: Comment) => void;
  addProject: (project: Project) => void;
  getClubMemberCount: (clubId: string, baseCount: number) => number;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

// ─────────────────────────────────────────
// Helpers: localStorage persistence
// ─────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`trybee_${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`trybee_${key}`, JSON.stringify(value));
  } catch {
    // ignore quota errors silently
  }
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('joinedClubs', []))
  );

  const [rsvpdEvents, setRsvpdEvents] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('rsvpdEvents', []))
  );

  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('interestedEvents', []))
  );

  const [collegePosts, setCollegePosts] = useState<Record<string, Post[]>>(
    () => loadFromStorage<Record<string, Post[]>>('collegePosts', {})
  );

  const [clubPosts, setClubPosts] = useState<Record<string, Post[]>>(
    () => loadFromStorage<Record<string, Post[]>>('clubPosts', {})
  );

  const [projects, setProjects] = useState<Project[]>(
    () => {
      const stored = loadFromStorage<Project[]>('projects', []);
      // Merge: keep user-created projects on top, then seed data for non-own
      const storedOwn = stored.filter(p => p.isOwn);
      const nonOwn = INITIAL_PROJECTS.filter(p => !p.isOwn);
      const ownFromSeed = INITIAL_PROJECTS.filter(p => p.isOwn);
      // If user has stored own projects, use those; else use seed own projects
      const ownProjects = storedOwn.length > 0 ? storedOwn : ownFromSeed;
      return [...ownProjects, ...nonOwn];
    }
  );

  const [comments, setComments] = useState<Record<string, Comment[]>>(
    () => loadFromStorage<Record<string, Comment[]>>('comments', {})
  );

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('likedPosts', []))
  );

  const [userProfile, setUserProfile] = useState<UserProfile>(
    () => loadFromStorage<UserProfile>('userProfile', DEFAULT_PROFILE)
  );

  // Persist to localStorage on every state change
  useEffect(() => {
    saveToStorage('joinedClubs', Array.from(joinedClubs));
  }, [joinedClubs]);

  useEffect(() => {
    saveToStorage('rsvpdEvents', Array.from(rsvpdEvents));
  }, [rsvpdEvents]);

  useEffect(() => {
    saveToStorage('interestedEvents', Array.from(interestedEvents));
  }, [interestedEvents]);

  useEffect(() => {
    saveToStorage('collegePosts', collegePosts);
  }, [collegePosts]);

  useEffect(() => {
    saveToStorage('clubPosts', clubPosts);
  }, [clubPosts]);

  useEffect(() => {
    // Only persist own projects to avoid storing the full seed data
    const ownProjects = projects.filter(p => p.isOwn);
    saveToStorage('projects', ownProjects);
  }, [projects]);

  useEffect(() => {
    saveToStorage('comments', comments);
  }, [comments]);

  useEffect(() => {
    saveToStorage('likedPosts', Array.from(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    saveToStorage('userProfile', userProfile);
  }, [userProfile]);

  // ── Actions ────────────────────────────────────────────────

  const joinClub = useCallback((clubId: string) => {
    setJoinedClubs(prev => new Set(prev).add(clubId));
  }, []);

  const leaveClub = useCallback((clubId: string) => {
    setJoinedClubs(prev => {
      const next = new Set(prev);
      next.delete(clubId);
      return next;
    });
  }, []);

  const rsvpEvent = useCallback((eventId: string) => {
    setRsvpdEvents(prev => new Set(prev).add(eventId));
  }, []);

  const cancelRsvp = useCallback((eventId: string) => {
    setRsvpdEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, []);

  const markInterested = useCallback((eventId: string) => {
    setInterestedEvents(prev => new Set(prev).add(eventId));
  }, []);

  const removeInterested = useCallback((eventId: string) => {
    setInterestedEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, []);

  const addCollegePost = useCallback((collegeId: string, post: Post) => {
    setCollegePosts(prev => ({
      ...prev,
      [collegeId]: [post, ...(prev[collegeId] ?? [])],
    }));
  }, []);

  const addClubPost = useCallback((clubId: string, post: Post) => {
    setClubPosts(prev => ({
      ...prev,
      [clubId]: [post, ...(prev[clubId] ?? [])],
    }));
  }, []);

  const likePost = useCallback((postId: string) => {
    setLikedPosts(prev => new Set(prev).add(postId));
    // Update like counts in collegePosts
    setCollegePosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId ? { ...p, likes: p.likes + 1, liked: true } : p
        );
      }
      return next;
    });
    setClubPosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId ? { ...p, likes: p.likes + 1, liked: true } : p
        );
      }
      return next;
    });
  }, []);

  const unlikePost = useCallback((postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
    setCollegePosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
        );
      }
      return next;
    });
    setClubPosts(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(p =>
          p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
        );
      }
      return next;
    });
  }, []);

  const addComment = useCallback((postId: string, comment: Comment) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), comment],
    }));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
  }, []);

  const getClubMemberCount = useCallback(
    (clubId: string, baseCount: number): number => {
      return joinedClubs.has(clubId) ? baseCount + 1 : baseCount;
    },
    [joinedClubs]
  );

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const value: AppContextValue = {
    joinedClubs,
    rsvpdEvents,
    interestedEvents,
    collegePosts,
    clubPosts,
    projects,
    comments,
    likedPosts,
    userProfile,
    joinClub,
    leaveClub,
    rsvpEvent,
    cancelRsvp,
    markInterested,
    removeInterested,
    addCollegePost,
    addClubPost,
    likePost,
    unlikePost,
    addComment,
    addProject,
    getClubMemberCount,
    updateUserProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
