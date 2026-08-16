// ─────────────────────────────────────────
// Core Domain Types for TRYBEE
// ─────────────────────────────────────────

export interface Person {
  id: string;
  name: string;
  role: string;
  college: string;
  collegeId: string;
  image: string;
  skills: string[];
  interests: string[];
  location: string;
  online: boolean;
}

export interface Club {
  id: string;
  title: string;
  description: string;
  category: string;
  collegeId: string;
  college: string;
  members: number;
  icon: string;
  tags: string[];
  isTrending?: boolean;
  president?: string;
  about?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  collegeId: string;
  clubId?: string;
  image?: string;
  isFeatured?: boolean;
  hostName: string;
  hostAvatar?: string;
}

export interface College {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  icon: string;
  image: string;
  students: string;
  activeClubs: number;
  isPrimary: boolean;
  about: string;
  facilities: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  technologies: string[];
  skills: string[];
  projectType: 'academic' | 'personal' | 'startup' | 'research';
  campusType: 'in-campus' | 'off-campus';
  teamRequired: number;
  teamCurrent: number;
  deadline?: string;
  createdAt: string;
  isOwn?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorMajor?: string;
  collegeId?: string;
  clubId?: string;
  content: string;
  image?: string;
  tag: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  createdAt: string;
  isHotTake?: boolean;
  isUpvoteStyle?: boolean;
  badgeStyle?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}
