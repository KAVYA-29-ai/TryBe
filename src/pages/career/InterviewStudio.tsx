import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCareer } from '../../context/CareerContext';
import { useCareerModals } from '../../components/career/CareerModals';
import {
  type InterviewTrack,
  type InterviewDifficulty,
  type InterviewTurn,
  type FinalInterviewReport,
  getLocalQuestion,
  computeInterviewReportLocally,
} from '../../career/engine/interviewLocal';
import { evaluateInterviewTurn } from '../../ai/mockInterview';
import { uid } from '../../career/engine/util';
import {
  PageShell,
  EmptyState,
  ProgressBar,
  SourceChip,
  Chip,
  btnPrimary,
  btnGhost,
  cardCls,
  toneFor,
} from '../../components/career/ui';

const ROLES_LIST = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI / Machine Learning Engineer',
  'Product Manager',
  'Data Scientist',
  'UI/UX Designer',
  'Cloud & DevOps Engineer',
];

const TRACKS: { id: InterviewTrack; title: string; icon: string; desc: string }[] = [
  {
    id: 'technical',
    title: 'Technical & Architecture',
    icon: 'terminal',
    desc: 'Core CS concepts, algorithms, performance, frameworks & best practices',
  },
  {
    id: 'behavioral',
    title: 'Behavioral & STAR',
    icon: 'groups',
    desc: 'Leadership, conflicts, deadline crunches & high-impact team projects',
  },
  {
    id: 'system_design',
    title: 'System Design',
    icon: 'account_tree',
    desc: 'Scalability, caching, database selection, API design & real-time architecture',
  },
  {
    id: 'rapid_fire',
    title: 'Rapid-Fire Placement',
    icon: 'bolt',
    desc: 'High-frequency screening questions commonly tested in campus interviews',
  },
];

export default function InterviewStudio() {
  const { snapshot, student, recordAssessment, addGapToRoadmap } = useCareer();
  const { openProfile } = useCareerModals();

  const userRole = snapshot.role?.title || 'Software Engineer';

  // Config State
  const [selectedRole, setSelectedRole] = useState(userRole);
  const [customRole, setCustomRole] = useState('');
  const [track, setTrack] = useState<InterviewTrack>('technical');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('intern');
  const [maxTurns, setMaxTurns] = useState<number>(3);

  // Session State
  const [stage, setStage] = useState<'setup' | 'live' | 'summary'>('setup');
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [report, setReport] = useState<FinalInterviewReport | null>(null);
  const [recordedToCareer, setRecordedToCareer] = useState(false);
  const [addedGaps, setAddedGaps] = useState<Set<string>>(new Set());
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const activeRole = customRole.trim() || selectedRole;

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCurrentAnswer(prev => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer effect for live session
  useEffect(() => {
    if (stage === 'live') {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [stage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your answer in the box.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const startInterview = () => {
    const firstQ = getLocalQuestion(track, 1, activeRole);
    setTurns([
      {
        id: uid('turn'),
        questionNumber: 1,
        question: firstQ.question,
        category: firstQ.category,
        testedSkills: firstQ.testedSkills,
      },
    ]);
    setCurrentTurnIndex(0);
    setCurrentAnswer('');
    setSecondsElapsed(0);
    setReport(null);
    setRecordedToCareer(false);
    setAddedGaps(new Set());
    setStage('live');
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isSubmitting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsSubmitting(true);
    const activeTurn = turns[currentTurnIndex];
    const questionTemplate = getLocalQuestion(track, activeTurn.questionNumber, activeRole);

    try {
      const outcome = await evaluateInterviewTurn(questionTemplate, currentAnswer, {
        track,
        role: activeRole,
        difficulty,
        studentSkills: snapshot.skills.map(s => s.name),
        fresh: true,
      });

      const updatedTurn: InterviewTurn = {
        ...activeTurn,
        answer: currentAnswer,
        evaluation: outcome.data,
      };

      const nextTurns = [...turns];
      nextTurns[currentTurnIndex] = updatedTurn;
      setTurns(nextTurns);

      const nextIndex = currentTurnIndex + 1;
      if (nextIndex < maxTurns) {
        // Queue next question
        const nextQ = getLocalQuestion(track, nextIndex + 1, activeRole);
        nextTurns.push({
          id: uid('turn'),
          questionNumber: nextIndex + 1,
          question: nextQ.question,
          category: nextQ.category,
          testedSkills: nextQ.testedSkills,
        });
        setTurns(nextTurns);
        setCurrentTurnIndex(nextIndex);
        setCurrentAnswer('');
      } else {
        // Complete interview
        const finalReport = computeInterviewReportLocally(nextTurns, activeRole);
        setReport(finalReport);
        setStage('summary');
      }
    } catch (err) {
      console.error('Interview evaluation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommitReadiness = () => {
    if (!report || recordedToCareer) return;
    recordAssessment(activeRole, report.finalScore, 'manual');
    setRecordedToCareer(true);
  };

  const handleAddGap = (skill: string) => {
    addGapToRoadmap(skill);
    setAddedGaps(prev => new Set(prev).add(skill));
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!snapshot.completeness.complete && !snapshot.role) {
    return (
      <PageShell
        title="AI Mock Interview Studio"
        subtitle="Practice real technical & behavioral interview questions with instant evaluation."
      >
        <EmptyState
          icon="psychology"
          title="Complete your career profile first"
          body="Add your target role and skills so the AI Interviewer can tailor realistic interview questions and map feedback directly to your career roadmap."
          action={
            <button type="button" onClick={openProfile} className={btnPrimary}>
              Complete Career Profile
            </button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="AI Mock Interview Studio"
      subtitle="Interactive technical and behavioral interview practice with instant AI feedback & readiness integration."
    >
      <div className="space-y-6">
        {/* ============================================================
            STAGE 1: INTERVIEW SETUP
        ============================================================ */}
        {stage === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-container-high to-surface p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Next-Gen AI Interviewer
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-on-surface">
                    Real-Time Mock Interview Simulation
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-2xl">
                    Choose your track, target role, and difficulty level. The AI acts as a Staff Engineer / Hiring Lead,
                    grading your answers on technical depth, STAR communication, and problem solving.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-on-surface-variant font-medium">Your Target Role</p>
                    <p className="text-sm font-bold text-primary">{userRole}</p>
                  </div>
                  <Link
                    to="/career/readiness"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-container-highest hover:bg-surface-container text-on-surface border border-outline-variant flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">query_stats</span>
                    View Readiness ({snapshot.analysis?.readiness ?? 0}%)
                  </Link>
                </div>
              </div>
            </div>

            {/* Setup Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 & 2: Track & Role */}
              <div className="lg:col-span-2 space-y-6">
                {/* Track Selection */}
                <div className={cardCls}>
                  <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                    1. Choose Interview Track
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRACKS.map(t => {
                      const isSelected = track === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTrack(t.id)}
                          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-outline-variant/60 bg-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <span
                              className={`material-symbols-outlined text-[20px] ${
                                isSelected ? 'text-primary' : 'text-on-surface-variant'
                              }`}
                            >
                              {t.icon}
                            </span>
                            <span className="font-bold text-sm text-on-surface">{t.title}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant line-clamp-2">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Role Selection */}
                <div className={cardCls}>
                  <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">work</span>
                    2. Select Target Role
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ROLES_LIST.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r);
                          setCustomRole('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          selectedRole === r && !customRole
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-on-surface-variant block mb-1">
                      Or enter custom specialization:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Systems Engineer, Blockchain Architect..."
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Column 3: Difficulty & Length */}
              <div className="space-y-6">
                <div className={cardCls}>
                  <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                    3. Settings
                  </h3>

                  {/* Difficulty */}
                  <div className="space-y-2 mb-5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                      Target Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['intern', 'junior', 'senior'] as InterviewDifficulty[]).map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`py-2 px-2 text-center rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer border ${
                            difficulty === d
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-surface border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Turn count */}
                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                      Questions in Session
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 8].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMaxTurns(n)}
                          className={`py-2 text-center rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                            maxTurns === n
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-surface border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {n} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    type="button"
                    onClick={startInterview}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary text-on-primary hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                    Start Simulation ({maxTurns} Questions)
                  </button>
                </div>

                {/* Info Card */}
                <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface-variant space-y-2">
                  <p className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                    Live Evaluation Rubric
                  </p>
                  <p>
                    Every response is scored across <strong>Technical Accuracy</strong>, <strong>STAR Communication</strong>,
                    and <strong>Problem Solving</strong>. Scores directly sync to your Career Readiness index.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            STAGE 2: LIVE INTERVIEW IN PROGRESS
        ============================================================ */}
        {stage === 'live' && turns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Bar Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">Maya — Senior Technical Interviewer</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {activeRole} • {track.replace('_', ' ').toUpperCase()} • Question {currentTurnIndex + 1} of {maxTurns}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-mono font-medium text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
                  {formatTimer(secondsElapsed)}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('End the interview session early and view report?')) {
                      const finalReport = computeInterviewReportLocally(turns, activeRole);
                      setReport(finalReport);
                      setStage('summary');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error/10 border border-error/30 transition-colors"
                >
                  End Early
                </button>
              </div>
            </div>

            {/* Current Question & Active Turn */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Question & Answer Box */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl border border-primary/20 bg-surface p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-bold text-xs uppercase">
                      Question {currentTurnIndex + 1}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {turns[currentTurnIndex]?.category}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-on-surface leading-relaxed">
                    {turns[currentTurnIndex]?.question}
                  </h3>

                  {turns[currentTurnIndex]?.testedSkills && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {turns[currentTurnIndex].testedSkills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant text-[11px] font-medium"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input Box */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Your Response
                      </label>
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isListening ? 'mic' : 'mic_none'}
                        </span>
                        {isListening ? 'Listening (Speak Now)...' : 'Voice Dictation'}
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      placeholder="Type your structured answer here (tip: use the STAR method or explain technical tradeoffs)..."
                      className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm leading-relaxed focus:outline-none focus:border-primary resize-y"
                      disabled={isSubmitting}
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-on-surface-variant">
                        {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentAnswer('')}
                          disabled={isSubmitting || !currentAnswer}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          Clear
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmitAnswer}
                          disabled={!currentAnswer.trim() || isSubmitting}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:opacity-95 shadow-sm disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="material-symbols-outlined text-[16px] animate-spin">
                                progress_activity
                              </span>
                              AI Evaluating...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">send</span>
                              Submit Answer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Answer Reviews */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                  Turn History & Feedback
                </h4>

                {turns.filter(t => t.evaluation).length === 0 ? (
                  <div className="p-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest text-center space-y-2">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">
                      rate_review
                    </span>
                    <p className="text-xs text-on-surface-variant">
                      Submit your first answer to see immediate AI grading, rubrics, and model exemplar answers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {turns
                      .filter(t => t.evaluation)
                      .map((t, idx) => (
                        <div
                          key={t.id}
                          className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-on-surface">
                              Q{idx + 1} Score: {t.evaluation?.overallScore}%
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (t.evaluation?.overallScore ?? 0) >= 75
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}
                            >
                              {(t.evaluation?.overallScore ?? 0) >= 75 ? 'Pass' : 'Needs Polish'}
                            </span>
                          </div>

                          {/* Metric bars */}
                          <div className="grid grid-cols-3 gap-2 text-[10px] text-on-surface-variant">
                            <div>
                              <span>Accuracy</span>
                              <div className="h-1.5 rounded-full bg-surface-container-highest mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${t.evaluation?.accuracyScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <span>STAR</span>
                              <div className="h-1.5 rounded-full bg-surface-container-highest mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-secondary rounded-full"
                                  style={{ width: `${t.evaluation?.communicationScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <span>Problem Solving</span>
                              <div className="h-1.5 rounded-full bg-surface-container-highest mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-tertiary rounded-full"
                                  style={{ width: `${t.evaluation?.problemSolvingScore}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Strengths */}
                          {t.evaluation?.strengths && t.evaluation.strengths.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-semibold text-emerald-600 flex items-center gap-1 text-[11px]">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                What you did well
                              </p>
                              <ul className="list-disc list-inside text-on-surface-variant text-[11px] space-y-0.5">
                                {t.evaluation.strengths.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Improvements */}
                          {t.evaluation?.improvements && t.evaluation.improvements.length > 0 && (
                            <div className="text-xs space-y-1">
                              <p className="font-semibold text-amber-600 flex items-center gap-1 text-[11px]">
                                <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                                How to elevate
                              </p>
                              <ul className="list-disc list-inside text-on-surface-variant text-[11px] space-y-0.5">
                                {t.evaluation.improvements.map((im, i) => (
                                  <li key={i}>{im}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Exemplar Toggle */}
                          {t.evaluation?.exemplarAnswer && (
                            <details className="text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/40">
                              <summary className="font-semibold text-primary cursor-pointer hover:underline">
                                View Model Exemplar Answer
                              </summary>
                              <p className="mt-1.5 p-2 rounded bg-surface-container-high text-on-surface leading-relaxed italic">
                                "{t.evaluation.exemplarAnswer}"
                              </p>
                            </details>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            STAGE 3: PERFORMANCE REPORT CARD
        ============================================================ */}
        {stage === 'summary' && report && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Header Badge Card */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-container-high to-surface p-8 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                    Simulation Complete
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-on-surface">
                    Mock Interview Performance Report
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-xl">{report.summary}</p>
                </div>

                {/* Score & Grade Display */}
                <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/60 shadow-sm">
                  <div className="h-16 w-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-3xl font-black shadow-md">
                    {report.grade}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-on-surface">{report.finalScore}%</div>
                    <p className="text-xs text-on-surface-variant">Overall Proficiency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Integration with Career System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Career Readiness Integration */}
              <div className={cardCls}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">trending_up</span>
                  <h3 className="text-base font-bold text-on-surface">Boost Career Readiness</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Syncing this verified mock interview assessment directly updates your Trybe Career Readiness score,
                  increasing your visibility to recruiters and mentors.
                </p>

                {recordedToCareer ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Assessment successfully saved to Career Profile! Score boosted.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCommitReadiness}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-on-primary hover:opacity-95 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Save Assessment ({report.finalScore}%) & Boost Readiness
                  </button>
                )}
              </div>

              {/* Roadmap Gap Sync */}
              <div className={cardCls}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">route</span>
                  <h3 className="text-base font-bold text-on-surface">Target Improvement Gaps</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  Convert areas of improvement identified during the interview into actionable tasks on your personalized learning roadmap.
                </p>

                {report.actionableGaps.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">
                    No major skill gaps detected! Excellent interview performance.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {report.actionableGaps.map(gap => {
                      const isAdded = addedGaps.has(gap);
                      return (
                        <button
                          key={gap}
                          type="button"
                          onClick={() => handleAddGap(gap)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isAdded
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 cursor-default'
                              : 'bg-surface border-outline-variant hover:border-primary text-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isAdded ? 'check' : 'add'}
                          </span>
                          {gap}
                          {isAdded && ' (Added to Roadmap)'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Strengths & Assessed Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cardCls}>
                <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">thumb_up</span>
                  Observed Strengths
                </h4>
                <ul className="space-y-2 text-xs text-on-surface-variant">
                  {report.strongPoints.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cardCls}>
                <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  Skills Assessed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.skillsAssessed.map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-surface-container-highest text-on-surface text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStage('setup')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                Start Another Simulation
              </button>

              <div className="flex items-center gap-3">
                <Link
                  to="/career/roadmap"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container-highest hover:bg-surface-container text-on-surface flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">route</span>
                  View Roadmap
                </Link>
                <Link
                  to="/career/readiness"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:opacity-95 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                  Career Readiness Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
