import { requestAiJson, toOutcome, type AiOutcome } from './aiService';
import { extractJson } from './validators';
import {
  type InterviewTrack,
  type InterviewDifficulty,
  type TurnEvaluation,
  type QuestionTemplate,
  evaluateAnswerLocally,
} from '../career/engine/interviewLocal';

interface AiEvaluationResponse {
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

function validateEvaluation(raw: unknown): TurnEvaluation | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  const overallScore = typeof obj.overallScore === 'number' && !isNaN(obj.overallScore) ? Math.min(100, Math.max(0, obj.overallScore)) : null;
  if (overallScore === null) return null;

  const accuracyScore = typeof obj.accuracyScore === 'number' ? Math.min(100, Math.max(0, obj.accuracyScore)) : overallScore;
  const communicationScore = typeof obj.communicationScore === 'number' ? Math.min(100, Math.max(0, obj.communicationScore)) : overallScore;
  const problemSolvingScore = typeof obj.problemSolvingScore === 'number' ? Math.min(100, Math.max(0, obj.problemSolvingScore)) : overallScore;

  const strengths = Array.isArray(obj.strengths)
    ? obj.strengths.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : ['Demonstrated clear problem understanding.'];

  const improvements = Array.isArray(obj.improvements)
    ? obj.improvements.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    : ['Provide more concrete technical depth and metrics.'];

  const exemplarAnswer = typeof obj.exemplarAnswer === 'string' && obj.exemplarAnswer.trim().length > 0
    ? obj.exemplarAnswer
    : 'A strong candidate response includes specific technical trade-offs, architecture choices, and measurable results.';

  const testedSkills = Array.isArray(obj.testedSkills)
    ? obj.testedSkills.filter((s): s is string => typeof s === 'string')
    : [];

  const weakSkills = Array.isArray(obj.weakSkills)
    ? obj.weakSkills.filter((s): s is string => typeof s === 'string')
    : [];

  return {
    overallScore,
    accuracyScore,
    communicationScore,
    problemSolvingScore,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    exemplarAnswer,
    testedSkills,
    weakSkills,
  };
}

export async function evaluateInterviewTurn(
  question: QuestionTemplate,
  answer: string,
  meta: {
    track: InterviewTrack;
    role: string;
    difficulty: InterviewDifficulty;
    studentSkills?: string[];
    fresh?: boolean;
  },
): Promise<AiOutcome<TurnEvaluation>> {
  const fallback = evaluateAnswerLocally(question, answer, meta.studentSkills);

  const system = `You are an elite Staff Engineer and Technical Hiring Director conducting a rigorous mock interview for a ${meta.difficulty} ${meta.role} candidate.
Your objective is to evaluate the student's response objectively, rigorously, and constructively.

Track: ${meta.track}
Role: ${meta.role}
Difficulty level: ${meta.difficulty}

Always respond with a single valid JSON object with the following schema:
{
  "overallScore": number (0-100),
  "accuracyScore": number (0-100),
  "communicationScore": number (0-100, evaluating clarity, structure, and STAR method compliance),
  "problemSolvingScore": number (0-100, evaluating trade-off awareness, depth, and edge cases),
  "strengths": string[] (1-3 specific positive observations on what the candidate did well),
  "improvements": string[] (1-3 actionable, high-impact critiques on what was missing or how to elevate the response),
  "exemplarAnswer": string (a concise 3-5 sentence ideal model answer demonstrating how a top 1% engineer or leader would answer this question),
  "testedSkills": string[] (relevant skill names tested by this question, e.g. ["React", "System Architecture"]),
  "weakSkills": string[] (skills where the candidate showed insufficient depth, if overallScore < 75)
}`;

  const prompt = `QUESTION ASKED:
"${question.question}"

CANDIDATE'S ANSWER:
"${answer}"

TARGET ROLE: ${meta.role}
TRACK: ${meta.track}
DIFFICULTY: ${meta.difficulty}

Evaluate the candidate's answer now. Output JSON only.`;

  const result = await requestAiJson<TurnEvaluation>({
    task: 'interview',
    system,
    prompt,
    fresh: meta.fresh ?? true,
    parse: extractJson,
    validate: validateEvaluation,
  });

  return toOutcome(result, fallback);
}
