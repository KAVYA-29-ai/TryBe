import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Post, Comment, Project, ConnectionStatus, Notification } from '../data/types';
import { INITIAL_PROJECTS } from '../data/projects';
import type { CareerProfile } from '../career/types';
import { supabase } from '../lib/supabase';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface UserProfile {
  id?: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  college: string;
  joinedDate: string;
  skills: string[];
  interests: string[];
  /** Career-specific data (target role, skill ratings, preferences). See src/career. */
  career?: CareerProfile;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppState {
  isAuthenticated: boolean;
  userProfile: UserProfile;
  joinedClubs: Set<string>;
  rsvpdEvents: Set<string>;
  interestedEvents: Set<string>;
  collegePosts: Record<string, Post[]>;
  clubPosts: Record<string, Post[]>;
  homePosts: Post[];
  projects: Project[];
  comments: Record<string, Comment[]>;
  likedPosts: Set<string>;
  connections: Record<string, ConnectionStatus>;
  notifications: Notification[];
  toast: ToastMessage | null;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  username: 'student',
  bio: 'College student exploring campus life, tech, and opportunities.',
  location: 'GLA University',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  college: 'GLA University',
  joinedDate: '2026',
  skills: [],
  interests: [],
};

// No pre-seeded fake posts — real posts come from Supabase on login
const INITIAL_HOME_POSTS: Post[] = [];

// No pre-seeded fake comments — real comments come from Supabase
const INITIAL_COMMENTS: Record<string, Comment[]> = {};

// No pre-seeded fake notifications — real notifications come from Supabase
const INITIAL_NOTIFICATIONS: Notification[] = [];

interface AppContextValue extends AppState {
  login: (email?: string, name?: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  joinClub: (clubId: string) => void;
  leaveClub: (clubId: string) => void;
  rsvpEvent: (eventId: string) => void;
  cancelRsvp: (eventId: string) => void;
  markInterested: (eventId: string) => void;
  removeInterested: (eventId: string) => void;
  addCollegePost: (collegeId: string, post: Post) => void;
  addClubPost: (clubId: string, post: Post) => void;
  addHomePost: (post: Post) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  addComment: (postId: string, comment: Comment) => void;
  addProject: (project: Project) => void;
  setConnectionStatus: (personId: string, status: ConnectionStatus) => void;
  getClubMemberCount: (clubId: string, baseCount: number) => number;
  updateUserProfile: (updates: Partial<UserProfile>, silent?: boolean) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// ----------------------------------------------------------------------------
// Helpers: localStorage persistence & fallback
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => loadFromStorage<boolean>('auth', false)
  );

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

  const [homePosts, setHomePosts] = useState<Post[]>(
    () => loadFromStorage<Post[]>('homePosts', [])
  );

  const [projects, setProjects] = useState<Project[]>(
    () => {
      const stored = loadFromStorage<Project[]>('projects', []);
      const storedOwn = stored.filter(p => p.isOwn);
      const nonOwn = INITIAL_PROJECTS.filter(p => !p.isOwn);
      return [...storedOwn, ...nonOwn];
    }
  );

  const [comments, setComments] = useState<Record<string, Comment[]>>(
    () => loadFromStorage<Record<string, Comment[]>>('comments', {})
  );

  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    () => new Set<string>(loadFromStorage<string[]>('likedPosts', []))
  );

  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>(
    () => loadFromStorage<Record<string, ConnectionStatus>>('connections', {})
  );

  const [notifications, setNotifications] = useState<Notification[]>(
    () => loadFromStorage<Notification[]>('notifications', [])
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(
    () => loadFromStorage<UserProfile>('userProfile', DEFAULT_PROFILE)
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(curr => curr?.id === id ? null : curr);
    }, 3000);
  }, []);

  // Sync to Supabase in Background + Sync to localStorage for Offline Cache
  useEffect(() => {
    saveToStorage('auth', isAuthenticated);
    saveToStorage('joinedClubs', Array.from(joinedClubs));
    saveToStorage('rsvpdEvents', Array.from(rsvpdEvents));
    saveToStorage('interestedEvents', Array.from(interestedEvents));
    saveToStorage('collegePosts', collegePosts);
    saveToStorage('clubPosts', clubPosts);
    saveToStorage('homePosts', homePosts);
    saveToStorage('projects', projects.filter(p => p.isOwn));
    saveToStorage('comments', comments);
    saveToStorage('likedPosts', Array.from(likedPosts));
    saveToStorage('connections', connections);
    saveToStorage('notifications', notifications);
    saveToStorage('userProfile', userProfile);
  }, [
    isAuthenticated,
    joinedClubs,
    rsvpdEvents,
    interestedEvents,
    collegePosts,
    clubPosts,
    homePosts,
    projects,
    comments,
    likedPosts,
    connections,
    notifications,
    userProfile,
  ]);

  // Supabase Auth Listener & Live Data Hydration
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);

          // Fetch user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUserProfile(prev => ({
              ...prev,
              id: profile.id,
              name: profile.display_name || prev.name,
              username: profile.username || prev.username,
              bio: profile.bio || prev.bio,
              avatar: profile.avatar_url || prev.avatar,
            }));
          }

          // Fetch posts from Supabase posts table
          const { data: dbPosts } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              reactions_count,
              comments_count,
              created_at,
              author:profiles!posts_author_id_fkey(display_name, username, avatar_url)
            `)
            .eq('status', 'published')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(20);

          if (dbPosts && dbPosts.length > 0) {
            const mappedPosts: Post[] = dbPosts.map(p => ({
              id: p.id,
              authorId: (p.author as unknown as { username: string })?.username || 'user',
              authorName: (p.author as unknown as { display_name: string })?.display_name || 'Anonymous',
              authorAvatar: (p.author as unknown as { avatar_url: string })?.avatar_url || DEFAULT_PROFILE.avatar,
              createdAt: 'Recently',
              tag: 'General',
              category: 'General',
              content: p.content || '',
              likes: p.reactions_count || 0,
              liked: false,
              commentsCount: p.comments_count || 0,
            }));

            // Replace feed with real Supabase posts (deduplicated)
            setHomePosts(prev => {
              const realIds = new Set(mappedPosts.map(p => p.id));
              const userPosts = prev.filter(p => !realIds.has(p.id));
              return [...mappedPosts, ...userPosts];
            });
          }
        }
      } catch (err) {
        console.warn('Supabase session initialization note:', err);
      }
    };

    checkSupabaseSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth Actions
  const login = useCallback(async (email?: string, name?: string) => {
    setIsAuthenticated(true);
    if (name || email) {
      const resolvedName = name || (email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Student');
      const resolvedUsername = email ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '') : 'student';
      setUserProfile(prev => ({
        ...prev,
        name: resolvedName,
        username: resolvedUsername,
      }));
    }
    showToast(`Welcome back, ${name || userProfile.name || 'Student'}!`);
  }, [showToast, userProfile.name]);

  const signup = useCallback(async (name: string, email: string) => {
    setIsAuthenticated(true);
    const cleanUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '') || 'student';
    const freshProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      name: name.trim(),
      username: cleanUsername,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setUserProfile(freshProfile);
    setJoinedClubs(new Set());
    setRsvpdEvents(new Set());
    setLikedPosts(new Set());
    setConnections({});
    setNotifications([
      {
        id: `welcome-${Date.now()}`,
        type: 'mention',
        title: 'Welcome to TRYBE! 🎓',
        time: 'Just now',
        read: false,
        author: 'TRYBE Campus',
        avatar: '/logo.png',
        detail: 'Welcome to your campus network! Explore clubs, join events, and build your AI-powered career roadmap.',
      },
    ]);
    showToast(`Account created successfully! Welcome to TRYBE.`);
  }, [showToast]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUserProfile(DEFAULT_PROFILE);
    setJoinedClubs(new Set());
    setRsvpdEvents(new Set());
    setInterestedEvents(new Set());
    setLikedPosts(new Set());
    setConnections({});
    setNotifications([]);
    setHomePosts([]);
    setComments({});

    const keysToRemove = [
      'auth',
      'userProfile',
      'joinedClubs',
      'rsvpdEvents',
      'interestedEvents',
      'likedPosts',
      'connections',
      'notifications',
      'homePosts',
      'comments',
      'projects',
      'career_roadmap',
      'career_assessments',
      'career_opp_status',
      'career_sessions',
      'career_action_done',
      'career_thread',
      'direct_messages',
    ];

    for (const k of keysToRemove) {
      try {
        localStorage.removeItem(`trybee_${k}`);
      } catch {
        // ignore
      }
    }

    await supabase.auth.signOut().then(null, () => null);
    showToast('Logged out successfully.', 'info');
  }, [showToast]);

  // Club & Event Actions (Optimistic UI + Background Supabase Sync)
  const joinClub = useCallback((clubId: string) => {
    setJoinedClubs(prev => new Set(prev).add(clubId));
    showToast('Joined club successfully!');

    // Async sync with Supabase
    supabase.rpc('join_club', { p_club_id: clubId }).then(null, () => null);
  }, [showToast]);

  const leaveClub = useCallback((clubId: string) => {
    setJoinedClubs(prev => {
      const next = new Set(prev);
      next.delete(clubId);
      return next;
    });
    showToast('Left club.', 'info');

    // Async sync with Supabase
    supabase.rpc('leave_club', { p_club_id: clubId }).then(null, () => null);
  }, [showToast]);

  const rsvpEvent = useCallback((eventId: string) => {
    setRsvpdEvents(prev => new Set(prev).add(eventId));
    showToast('RSVP confirmed! Added to your schedule.');

    // Async sync with Supabase
    supabase.rpc('rsvp_event', { p_event_id: eventId, p_status: 'going' }).then(null, () => null);
  }, [showToast]);

  const cancelRsvp = useCallback((eventId: string) => {
    setRsvpdEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
    showToast('RSVP cancelled.', 'info');

    // Async sync with Supabase
    supabase.rpc('cancel_rsvp', { p_event_id: eventId }).then(null, () => null);
  }, [showToast]);

  const markInterested = useCallback((eventId: string) => {
    setInterestedEvents(prev => new Set(prev).add(eventId));
    showToast('Saved to interested events!');
  }, [showToast]);

  const removeInterested = useCallback((eventId: string) => {
    setInterestedEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, []);

  // Post Actions (Optimistic UI + Background Supabase Sync)
  const addCollegePost = useCallback((collegeId: string, post: Post) => {
    setCollegePosts(prev => ({
      ...prev,
      [collegeId]: [post, ...(prev[collegeId] ?? [])],
    }));
    showToast('Post published to college feed!');
  }, [showToast]);

  const addClubPost = useCallback((clubId: string, post: Post) => {
    setClubPosts(prev => ({
      ...prev,
      [clubId]: [post, ...(prev[clubId] ?? [])],
    }));
    showToast('Post published to club feed!');
  }, [showToast]);

  const addHomePost = useCallback(async (post: Post) => {
    setHomePosts(prev => [post, ...prev]);
    showToast('Post created successfully!');

    // Async sync with Supabase
    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      await supabase.from('posts').insert({
        author_id: user.user.id,
        content: post.content,
        visibility: 'public',
      }).then(null, console.error);
    }
  }, [showToast]);

  const likePost = useCallback((postId: string) => {
    setLikedPosts(prev => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });

    setHomePosts(prev => prev.map(p =>
      p.id === postId && !p.liked ? { ...p, likes: p.likes + 1, liked: true } : p
    ));

    // Sync reaction to Supabase atomically
    supabase.rpc('toggle_post_reaction', { p_post_id: postId, p_reaction: 'like' }).then(null, () => null);
  }, []);

  const unlikePost = useCallback((postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });

    setHomePosts(prev => prev.map(p =>
      p.id === postId && p.liked ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
    ));

    // Sync reaction to Supabase atomically
    supabase.rpc('toggle_post_reaction', { p_post_id: postId, p_reaction: 'like' }).then(null, () => null);
  }, []);

  const addComment = useCallback((postId: string, comment: Comment) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), comment],
    }));

    setHomePosts(prev => prev.map(p =>
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));

    showToast('Comment added!');

    // Async sync with Supabase
    supabase.rpc('add_comment', { p_post_id: postId, p_content: comment.text }).then(null, () => null);
  }, [showToast]);

  const addProject = useCallback(async (project: Project) => {
    setProjects(prev => [project, ...prev]);
    showToast('Project posted successfully!');

    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      await supabase.from('projects').insert({
        owner_id: user.user.id,
        title: project.title,
        description: project.description,
      }).then(null, console.error);
    }
  }, [showToast]);

  const setConnectionStatus = useCallback((personId: string, status: ConnectionStatus) => {
    setConnections(prev => ({ ...prev, [personId]: status }));
    if (status === 'pending') {
      showToast('Connection request sent!');
    } else if (status === 'connected') {
      showToast('Connected successfully!');
    } else if (status === 'none') {
      showToast('Connection removed.', 'info');
    }
  }, [showToast]);

  const getClubMemberCount = useCallback(
    (clubId: string, baseCount: number): number => {
      return joinedClubs.has(clubId) ? baseCount + 1 : baseCount;
    },
    [joinedClubs]
  );

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>, silent = false) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    if (!silent) {
      showToast('Profile updated successfully!');
    }

    const { data: user } = await supabase.auth.getUser();
    if (user?.user) {
      await supabase.from('profiles').update({
        display_name: updates.name,
        bio: updates.bio,
        avatar_url: updates.avatar,
      }).eq('id', user.user.id).then(null, () => null);
    }
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: AppContextValue = {
    isAuthenticated,
    login,
    logout,
    signup,
    showToast,
    toast,
    joinedClubs,
    rsvpdEvents,
    interestedEvents,
    collegePosts,
    clubPosts,
    homePosts,
    projects,
    comments,
    likedPosts,
    connections,
    notifications,
    userProfile,
    joinClub,
    leaveClub,
    rsvpEvent,
    cancelRsvp,
    markInterested,
    removeInterested,
    addCollegePost,
    addClubPost,
    addHomePost,
    likePost,
    unlikePost,
    addComment,
    addProject,
    setConnectionStatus,
    getClubMemberCount,
    updateUserProfile,
    markNotificationRead,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
