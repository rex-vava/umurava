import fs from 'fs';
import path from 'path';

export async function parseResume(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
    }
  }

  // For DOC/DOCX, return a basic text extraction notice
  // In production, use mammoth or similar library
  if (ext === '.doc' || ext === '.docx') {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      // Basic text extraction from docx (which is essentially XML/ZIP)
      return dataBuffer.toString('utf-8').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch {
      throw new Error('Failed to parse document. Please upload a PDF for best results.');
    }
  }

  throw new Error(`Unsupported file format: ${ext}`);
}

export function extractBasicInfo(resumeText: string): {
  email?: string;
  phone?: string;
  skills: string[];
} {
  // Extract email
  const emailMatch = resumeText.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Extract phone
  const phoneMatch = resumeText.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  // Extract common tech skills
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Next\\.js', 'Vue', 'Angular', 'Svelte', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    'REST', 'GraphQL', 'gRPC', 'WebSocket',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch',
    'Tailwind', 'Bootstrap', 'SASS', 'CSS', 'HTML',
    'Figma', 'Adobe', 'UI/UX',
    'Agile', 'Scrum', 'Jira', 'Confluence',
    'Linux', 'Nginx', 'Apache',
  ];

  const foundSkills: string[] = [];
  for (const skill of commonSkills) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(resumeText)) {
      foundSkills.push(skill.replace(/\\\+/g, '+').replace(/\\\./g, '.'));
    }
  }

  return { email, phone, skills: foundSkills };
}
