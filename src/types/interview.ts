export interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  ideal_answer_points: string[];
  created_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string | null;
  started_at: string;
  completed_at: string | null;
  total_score: number;
}

export interface InterviewResponse {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: string;
  ai_score: number | null;
  ai_feedback: string | null;
  strengths: string[];
  improvements: string[];
  answered_at: string;
}

export interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}
