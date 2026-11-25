import { uid } from './util';

export type InterviewTrack = 'technical' | 'behavioral' | 'system_design' | 'rapid_fire';
export type InterviewDifficulty = 'intern' | 'junior' | 'senior';

export interface TurnEvaluation {
  overallScore: number;
  accuracyScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  exemplarAnswer: string;
  testedSkills: string[];
  weakSkills: string[];
}

export interface InterviewTurn {
  id: string;
  questionNumber: number;
  question: string;
  category: string;
  testedSkills: string[];
  answer?: string;
  evaluation?: TurnEvaluation;
}

export interface FinalInterviewReport {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Needs Practice';
  finalScore: number;
  readinessBoost: number;
  summary: string;
  strongPoints: string[];
  actionableGaps: string[];
  skillsAssessed: string[];
}

export interface QuestionTemplate {
  question: string;
  category: string;
  testedSkills: string[];
  exemplar: string;
  keywords: string[];
}

const QUESTION_BANK: Record<InterviewTrack, QuestionTemplate[]> = {
  technical: [
    {
      question: 'Explain how you optimize frontend performance when a page renders a large list with thousands of items. What strategies, tools, and browser APIs would you use?',
      category: 'Frontend & Architecture',
      testedSkills: ['React', 'JavaScript', 'Performance Optimization'],
      keywords: ['virtualization', 'windowing', 'pagination', 'debounce', 'memo', 'usememo', 're-render', 'profiler', 'dom'],
      exemplar: 'I would utilize virtual windowing (e.g. react-window or TanStack Virtual) to only mount elements currently in the viewport. Additionally, I would memoize expensive child components using React.memo, decouple state updates with useDeferredValue, and measure rendering bottlenecks using Chrome DevTools Performance tab and React DevTools Profiler.',
    },
    {
      question: 'Walk me through how HTTPS ensures secure data transmission between a client and your backend server. What happens during the TLS handshake?',
      category: 'Networking & Security',
      testedSkills: ['Networking', 'Security', 'Backend Architecture'],
      keywords: ['tls', 'ssl', 'handshake', 'symmetric', 'asymmetric', 'public key', 'private key', 'certificate', 'ca'],
      exemplar: 'The TLS handshake begins with ClientHello and ServerHello exchanging cipher suites. The server presents its SSL/TLS certificate signed by a trusted CA. The client validates the certificate, generates a pre-master secret encrypted with the server public key, and both derive a symmetric session key for efficient, encrypted data transmission.',
    },
    {
      question: 'How do you prevent SQL Injection and Cross-Site Scripting (XSS) in a web application? Give concrete engineering examples.',
      category: 'Application Security',
      testedSkills: ['Security', 'Database Design', 'Backend Engineering'],
      keywords: ['parameterized', 'prepared statements', 'sanitization', 'escaping', 'csp', 'content security policy', 'orm'],
      exemplar: 'To prevent SQL Injection, I always use parameterized queries or trusted ORM abstraction layers rather than string concatenation. For XSS prevention, I sanitize user input with DOMPurify, enforce a strict Content Security Policy (CSP), use HttpOnly Secure cookies for session tokens, and rely on framework auto-escaping.',
    },
    {
      question: 'Explain the difference between optimistic UI updates and pessimistic updates. When would you use each, and how do you handle rollbacks if the network fails?',
      category: 'Client State & UX',
      testedSkills: ['React', 'State Management', 'System Architecture'],
      keywords: ['optimistic', 'pessimistic', 'rollback', 'revert', 'cache', 'mutation', 'toast', 'error state'],
      exemplar: 'Optimistic UI updates immediately update the client interface before the server confirms (great for high-frequency actions like liking a post or toggling an RSVP). If the backend returns an error, we roll back client state to a snapshot taken prior to mutation and surface a toast message. Pessimistic updates wait for confirmation, used for critical operations like payment checkout or deleting an account.',
    },
    {
      question: 'What is Database Indexing? How does a B-Tree index work, and what are the trade-offs of adding too many indexes to a table?',
      category: 'Databases & Performance',
      testedSkills: ['PostgreSQL', 'SQL', 'Database Optimization'],
      keywords: ['b-tree', 'lookup', 'write overhead', 'read', 'insert', 'update', 'binary search', 'index scan'],
      exemplar: 'Database indexing creates a separate data structure (commonly a balanced B-Tree) that allows logarithmic O(log N) lookup instead of a full table scan O(N). The trade-off is write overhead: every INSERT, UPDATE, and DELETE must rebalance the index tree, and indexes consume additional disk memory.',
    },
  ],
  behavioral: [
    {
      question: 'Tell me about a time you faced a difficult technical disagreement or conflicting priority during a team project. How did you resolve it? (Use the STAR method)',
      category: 'Conflict Resolution & Teamwork',
      testedSkills: ['Collaboration', 'Communication', 'Leadership'],
      keywords: ['situation', 'task', 'action', 'result', 'compromise', 'data', 'benchmark', 'empathy', 'team'],
      exemplar: 'Situation: During a capstone project, our frontend team wanted GraphQL while backend wanted REST. Task: I was responsible for API integration and meeting our deadline in 3 weeks. Action: I benchmarked development speed, payload sizes, and team familiarity. I proposed a pragmatic compromise: standard REST endpoints with clean Swagger specs. Result: We shipped on schedule with zero API blocker bugs and maintained great team morale.',
    },
    {
      question: 'Describe a situation where a project deadline was approaching, but requirements changed or an unexpected roadblock appeared. How did you handle it?',
      category: 'Adaptability & Execution',
      testedSkills: ['Problem Solving', 'Time Management', 'Agile'],
      keywords: ['deadline', 'prioritized', 'mvp', 'scope', 'triage', 'delivered', 'stakeholders', 'tradeoff'],
      exemplar: 'Situation: 48 hours before a college hackathon submission, our authentication service failed. Task: I needed to salvage our core product demo. Action: I triaged the MVP features, temporarily decoupled non-essential third-party auth, and implemented a clean mock session fallback while keeping core features fully functional. Result: We won 2nd place and subsequently patched production auth without rush.',
    },
    {
      question: 'Give me an example of a project where you took initiative beyond what was required. What drove you, and what was the impact?',
      category: 'Initiative & Ownership',
      testedSkills: ['Leadership', 'Initiative', 'Self-Motivation'],
      keywords: ['initiative', 'proactive', 'automated', 'improved', 'impact', 'mentored', 'metric'],
      exemplar: 'In our college club portal, event RSVPs were manually entered into spreadsheets. I noticed officers spending 5+ hours weekly on admin work. I took the initiative over a weekend to build an automated export script and QR check-in flow. This reduced check-in queues by 80% and saved 20+ leadership hours every month.',
    },
    {
      question: 'Tell me about a mistake you made in code or communication that caused a problem. How did you address it and what did you learn?',
      category: 'Accountability & Growth',
      testedSkills: ['Accountability', 'Debugging', 'Post-Mortem'],
      keywords: ['mistake', 'owned', 'fixed', 'post-mortem', 'learned', 'prevented', 'tests', 'monitoring'],
      exemplar: 'I once deployed a migration script that dropped a column with incomplete backup verification in staging. I immediately took ownership, informed the team, and used point-in-time recovery to restore the data within 20 minutes. I then authored a pre-deployment checklist and automated backup validation script so the issue could never recur.',
    },
  ],
  system_design: [
    {
      question: 'Design a scalable URL shortening service (like Bitly or TinyURL) that can handle 100 million active URLs. How do you structure the database, generate unique slugs, and handle high read traffic?',
      category: 'System Design & Scalability',
      testedSkills: ['System Design', 'Caching', 'Database Architecture'],
      keywords: ['base62', 'hashing', 'redis', 'cache', 'cdn', 'sharding', 'nosql', 'unique constraint', 'latency'],
      exemplar: 'I would generate 7-character Base62 keys from an auto-incrementing distributed ID generator (e.g. Snowflake or pre-allocated ranges). For high read ratios (e.g. 100:1 read to write), I would cache hot URLs in Redis with LRU eviction and place a CDN in front. The database would use a distributed key-value or partitioned relational DB indexed on the hash key.',
    },
    {
      question: 'How would you design a real-time notification system for a campus social app where thousands of students receive instant alerts for club events and mentions?',
      category: 'Real-Time Architectures',
      testedSkills: ['System Design', 'WebSockets', 'Message Queues'],
      keywords: ['websocket', 'pubsub', 'kafka', 'redis pub/sub', 'sse', 'push notifications', 'queue', 'workers'],
      exemplar: 'I would employ an event-driven architecture using Redis Pub/Sub or Apache Kafka to decouple event producers from notification delivery workers. Clients connect via WebSockets or Server-Sent Events (SSE). Background worker pools batch and deduplicate notifications, update Postgres persistent storage, and trigger Web Push / mobile APNS tokens.',
    },
  ],
  rapid_fire: [
    {
      question: 'Rapid Fire: What is the difference between synchronous execution and asynchronous execution in JavaScript Event Loop? Name Microtasks vs Macrotasks.',
      category: 'JavaScript Core',
      testedSkills: ['JavaScript', 'Concurrency'],
      keywords: ['call stack', 'event loop', 'microtask', 'macrotask', 'promise', 'settimeout', 'queue'],
      exemplar: 'Synchronous code runs sequentially on the single call stack, blocking execution. Asynchronous code offloads operations to Web APIs. When completed, callbacks enter queues: Promises and queueMicrotask enter the Microtask queue (executed immediately after current stack), while setTimeout/setInterval enter the Macrotask queue.',
    },
    {
      question: 'Rapid Fire: Explain HTTP 200, 201, 400, 401, 403, and 500 in one sentence each.',
      category: 'Web Standards & APIs',
      testedSkills: ['APIs', 'HTTP Protocols'],
      keywords: ['200 ok', '201 created', '400 bad request', '401 unauthorized', '403 forbidden', '500 internal server error'],
      exemplar: '200: Request succeeded. 201: New resource created successfully. 400: Malformed client request. 401: Unauthenticated (user must log in). 403: Forbidden (authenticated but lacks permission). 500: Server-side unhandled exception.',
    },
    {
      question: 'Rapid Fire: What is the difference between SQL (Relational) and NoSQL (Document/Key-Value) databases, and when do you choose which?',
      category: 'Data Storage',
      testedSkills: ['SQL', 'NoSQL', 'Database Design'],
      keywords: ['acid', 'schema', 'relational', 'joins', 'horizontal scaling', 'unstructured', 'transactions'],
      exemplar: 'SQL databases are schema-enforced, table-based, and support ACID transactions and complex JOINs (ideal for finance, social graphs, relational data). NoSQL databases offer flexible schemas and effortless horizontal scaling (ideal for unstructured logs, analytics, or rapid prototype caching).',
    },
  ],
};

export function getLocalQuestion(
  track: InterviewTrack,
  questionNumber: number,
  targetRole?: string,
): QuestionTemplate {
  const bank = QUESTION_BANK[track] || QUESTION_BANK.technical;
  const index = (questionNumber - 1) % bank.length;
  const base = bank[index];

  if (targetRole && track === 'technical') {
    return {
      ...base,
      question: `[${targetRole} Focus] ${base.question}`,
    };
  }

  return base;
}

export function evaluateAnswerLocally(
  question: QuestionTemplate,
  answer: string,
  studentSkills: string[] = [],
): TurnEvaluation {
  const clean = answer.trim().toLowerCase();
  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  if (wordCount < 10) {
    return {
      overallScore: 35,
      accuracyScore: 30,
      communicationScore: 40,
      problemSolvingScore: 35,
      strengths: ['Attempted to answer promptly.'],
      improvements: [
        'Answer is too brief. Provide technical specifics, terminology, and concrete real-world context.',
        'Use the STAR method (Situation, Task, Action, Result) to give substance to your answers.',
      ],
      exemplarAnswer: question.exemplar,
      testedSkills: question.testedSkills,
      weakSkills: question.testedSkills,
    };
  }

  // Check keyword matches
  const matchedKeywords = question.keywords.filter(k => clean.includes(k));
  const keywordRatio = matchedKeywords.length / Math.max(3, question.keywords.length);

  // Depth bonus based on structured length and depth
  const lengthScore = Math.min(30, Math.floor(wordCount / 4));
  const matchScore = Math.min(50, Math.floor(keywordRatio * 50));

  // STAR indicator
  const hasStarKeywords = ['situation', 'task', 'action', 'result', 'when', 'because', 'first', 'then', 'finally']
    .filter(w => clean.includes(w)).length;
  const starScore = Math.min(20, hasStarKeywords * 5);

  const rawTotal = 40 + matchScore + lengthScore + starScore;
  const overallScore = Math.min(95, Math.max(45, rawTotal));

  const accuracyScore = Math.min(95, Math.max(40, 40 + matchScore + (keywordRatio > 0.4 ? 10 : 0)));
  const communicationScore = Math.min(95, Math.max(45, 45 + starScore + Math.min(15, wordCount > 40 ? 15 : 5)));
  const problemSolvingScore = Math.min(95, Math.max(40, Math.round((accuracyScore + communicationScore) / 2)));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (matchedKeywords.length >= 2) {
    strengths.push(`Strong domain knowledge demonstrated: identified key concepts like ${matchedKeywords.slice(0, 3).join(', ')}.`);
  } else {
    improvements.push(`Include more specific architectural vocabulary (e.g. ${question.keywords.slice(0, 3).join(', ')}).`);
  }

  if (wordCount >= 50) {
    strengths.push('Thorough and articulate response with sufficient context.');
  } else {
    improvements.push('Expand your explanation with a concrete engineering example or tradeoff discussion.');
  }

  if (hasStarKeywords >= 2) {
    strengths.push('Well-structured response showing clear logical progression.');
  } else {
    improvements.push('Structure your answer with clear stages: problem statement, approach/trade-offs, and final result.');
  }

  const weakSkills = overallScore < 75 ? question.testedSkills : [];

  return {
    overallScore,
    accuracyScore,
    communicationScore,
    problemSolvingScore,
    strengths: strengths.length ? strengths : ['Clear baseline understanding of the question.'],
    improvements: improvements.length ? improvements : ['Consider discussing performance implications and monitoring metrics in production.'],
    exemplarAnswer: question.exemplar,
    testedSkills: question.testedSkills,
    weakSkills,
  };
}

export function computeInterviewReportLocally(
  turns: InterviewTurn[],
  role: string,
): FinalInterviewReport {
  if (turns.length === 0) {
    return {
      grade: 'Needs Practice',
      finalScore: 50,
      readinessBoost: 3,
      summary: 'Interview completed with limited responses.',
      strongPoints: ['Initiated mock interview practice session.'],
      actionableGaps: ['Complete more turns with in-depth technical answers.'],
      skillsAssessed: [],
    };
  }

  const scoredTurns = turns.filter(t => t.evaluation);
  const avgScore = scoredTurns.length
    ? Math.round(scoredTurns.reduce((acc, t) => acc + (t.evaluation?.overallScore ?? 50), 0) / scoredTurns.length)
    : 60;

  let grade: FinalInterviewReport['grade'] = 'Needs Practice';
  if (avgScore >= 90) grade = 'A+';
  else if (avgScore >= 82) grade = 'A';
  else if (avgScore >= 74) grade = 'B+';
  else if (avgScore >= 65) grade = 'B';
  else if (avgScore >= 55) grade = 'C';

  const readinessBoost = Math.max(5, Math.min(25, Math.round(avgScore * 0.2)));

  const allStrengths = scoredTurns.flatMap(t => t.evaluation?.strengths ?? []);
  const allImprovements = scoredTurns.flatMap(t => t.evaluation?.improvements ?? []);
  const weakSkills = Array.from(new Set(scoredTurns.flatMap(t => t.evaluation?.weakSkills ?? [])));
  const allTestedSkills = Array.from(new Set(scoredTurns.flatMap(t => t.evaluation?.testedSkills ?? [])));

  return {
    grade,
    finalScore: avgScore,
    readinessBoost,
    summary: `Completed ${scoredTurns.length}-question simulation for ${role}. Average performance: ${avgScore}% (${grade}). Demonstrated strong foundation with actionable areas identified for target interview rounds.`,
    strongPoints: allStrengths.slice(0, 4),
    actionableGaps: weakSkills.length ? weakSkills : allImprovements.slice(0, 3),
    skillsAssessed: allTestedSkills,
  };
}
