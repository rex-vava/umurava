import { getGeminiModel } from '../config/gemini';
import { IScreening, ISkillAssessment, IScreeningCategory } from '../types';
import { logger } from '../utils/logger';

interface ScreeningInput {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  requirements: string[];
  preferredSkills: string[];
  responsibilities: string[];
  experienceLevel: string;
}

interface AIScreeningResult {
  overallScore: number;
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
  summary: string;
  categories: IScreeningCategory[];
  skillAssessments: ISkillAssessment[];
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  cultureFitNotes: string;
  interviewQuestions: string[];
  biasFlags: string[];
  aiConfidence: number;
}

export async function screenCandidate(input: ScreeningInput): Promise<AIScreeningResult> {
  const startTime = Date.now();
  const model = getGeminiModel('gemini-1.5-flash');

  const prompt = buildScreeningPrompt(input);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const parsed = parseAIResponse(text);
    const processingTime = Date.now() - startTime;

    logger.info(`AI screening completed in ${processingTime}ms`, {
      score: parsed.overallScore,
      recommendation: parsed.recommendation,
    });

    return parsed;
  } catch (error) {
    logger.error('AI screening failed:', error);
    throw new Error('AI screening service temporarily unavailable. Please try again.');
  }
}

function buildScreeningPrompt(input: ScreeningInput): string {
  return `You are an expert AI recruitment screening assistant. Your task is to objectively evaluate a candidate's resume against a specific job posting. Be thorough, fair, and provide evidence-based assessments.

IMPORTANT GUIDELINES:
- Be objective and evidence-based. Only assess what is present in the resume.
- Avoid assumptions based on names, demographics, or personal characteristics.
- Focus on skills, experience, and qualifications.
- If information is missing, note it but don't penalize excessively.
- Provide actionable insights for recruiters.

=== JOB POSTING ===
Title: ${input.jobTitle}
Experience Level: ${input.experienceLevel}
Description: ${input.jobDescription}

Key Responsibilities:
${input.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Required Qualifications:
${input.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Preferred Skills:
${input.preferredSkills.map((s, i) => `${i + 1}. ${s}`).join('\n')}

=== CANDIDATE RESUME ===
${input.resumeText}

=== ANALYSIS INSTRUCTIONS ===
Analyze this resume against the job posting and respond in EXACTLY this JSON format (no markdown, no code blocks, just pure JSON):

{
  "overallScore": <number 0-100>,
  "recommendation": "<one of: strong-yes, yes, maybe, no, strong-no>",
  "summary": "<2-3 sentence executive summary of the candidate's fit>",
  "categories": [
    {
      "category": "Technical Skills Match",
      "score": <number 0-100>,
      "weight": 30,
      "details": "<detailed explanation>"
    },
    {
      "category": "Experience Relevance",
      "score": <number 0-100>,
      "weight": 25,
      "details": "<detailed explanation>"
    },
    {
      "category": "Education & Certifications",
      "score": <number 0-100>,
      "weight": 15,
      "details": "<detailed explanation>"
    },
    {
      "category": "Role Alignment",
      "score": <number 0-100>,
      "weight": 20,
      "details": "<detailed explanation>"
    },
    {
      "category": "Communication & Presentation",
      "score": <number 0-100>,
      "weight": 10,
      "details": "<detailed explanation based on resume quality, clarity, and structure>"
    }
  ],
  "skillAssessments": [
    {
      "skill": "<skill name>",
      "score": <number 0-100>,
      "evidence": "<where/how this skill is demonstrated in the resume>",
      "matchType": "<one of: exact, related, transferable, missing>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "skillGaps": ["<missing skill 1>", "<missing skill 2>"],
  "cultureFitNotes": "<assessment based on resume indicators like teamwork, leadership, communication>",
  "interviewQuestions": [
    "<targeted question 1 based on gaps or areas needing clarification>",
    "<targeted question 2>",
    "<targeted question 3>",
    "<targeted question 4>",
    "<targeted question 5>"
  ],
  "biasFlags": ["<any potential biases to be aware of in this evaluation>"],
  "aiConfidence": <number 0-100 representing how confident the AI is in this assessment>
}

Ensure the overallScore is a WEIGHTED average of the category scores. Be thorough in skill assessments - assess EACH required and preferred skill. Generate at least 5 targeted interview questions.`;
}

function parseAIResponse(text: string): AIScreeningResult {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Validate and sanitize the response
    return {
      overallScore: clamp(parsed.overallScore || 0, 0, 100),
      recommendation: validateRecommendation(parsed.recommendation),
      summary: parsed.summary || 'Assessment completed.',
      categories: (parsed.categories || []).map((c: any) => ({
        category: c.category || 'Unknown',
        score: clamp(c.score || 0, 0, 100),
        weight: c.weight || 20,
        details: c.details || 'No details provided.',
      })),
      skillAssessments: (parsed.skillAssessments || []).map((s: any) => ({
        skill: s.skill || 'Unknown',
        score: clamp(s.score || 0, 0, 100),
        evidence: s.evidence || 'No evidence found.',
        matchType: validateMatchType(s.matchType),
      })),
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      skillGaps: parsed.skillGaps || [],
      cultureFitNotes: parsed.cultureFitNotes || 'No culture fit indicators found.',
      interviewQuestions: parsed.interviewQuestions || [],
      biasFlags: parsed.biasFlags || [],
      aiConfidence: clamp(parsed.aiConfidence || 50, 0, 100),
    };
  } catch (error) {
    logger.error('Failed to parse AI response:', { text: text.substring(0, 500), error });
    throw new Error('Failed to parse AI screening results. Please retry.');
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function validateRecommendation(rec: string): AIScreeningResult['recommendation'] {
  const valid = ['strong-yes', 'yes', 'maybe', 'no', 'strong-no'];
  return valid.includes(rec) ? rec as AIScreeningResult['recommendation'] : 'maybe';
}

function validateMatchType(type: string): ISkillAssessment['matchType'] {
  const valid = ['exact', 'related', 'transferable', 'missing'];
  return valid.includes(type) ? type as ISkillAssessment['matchType'] : 'missing';
}

export async function generateCandidateComparison(
  candidates: { name: string; score: number; strengths: string[]; weaknesses: string[] }[],
  jobTitle: string
): Promise<string> {
  const model = getGeminiModel('gemini-1.5-flash');

  const prompt = `You are a recruitment advisor. Compare these candidates for the "${jobTitle}" position and provide a brief, actionable comparison.

Candidates:
${candidates.map((c, i) => `
Candidate ${i + 1}: ${c.name}
- Score: ${c.score}/100
- Strengths: ${c.strengths.join(', ')}
- Weaknesses: ${c.weaknesses.join(', ')}
`).join('\n')}

Provide a concise comparison (max 200 words) highlighting:
1. Who is the strongest candidate and why
2. Key differentiators between candidates
3. Any concerns to investigate further`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error('Candidate comparison failed:', error);
    return 'Unable to generate comparison at this time.';
  }
}
