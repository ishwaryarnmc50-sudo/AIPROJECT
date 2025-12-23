/*
  # Create Interview Practice Platform Schema

  1. New Tables
    - `interview_questions`
      - `id` (uuid, primary key)
      - `question` (text) - The interview question
      - `category` (text) - Question category (behavioral, technical, etc.)
      - `difficulty` (text) - easy, medium, hard
      - `ideal_answer_points` (text array) - Key points for evaluation
      - `created_at` (timestamptz)
    
    - `interview_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users (nullable for anonymous users)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `total_score` (integer) - Overall session score
    
    - `interview_responses`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - References interview_sessions
      - `question_id` (uuid) - References interview_questions
      - `user_answer` (text) - The user's response
      - `ai_score` (integer) - Score from 1-10
      - `ai_feedback` (text) - Detailed feedback
      - `strengths` (text array) - What was good
      - `improvements` (text array) - Areas to improve
      - `answered_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read questions
    - Users can create and read their own sessions and responses
    - Anonymous users can create sessions without user_id
*/

CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  ideal_answer_points text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  total_score integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interview_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES interview_questions(id) NOT NULL,
  user_answer text NOT NULL,
  ai_score integer,
  ai_feedback text,
  strengths text[] DEFAULT '{}',
  improvements text[] DEFAULT '{}',
  answered_at timestamptz DEFAULT now()
);

ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON interview_questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON interview_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own sessions"
  ON interview_sessions FOR SELECT
  TO public
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON interview_sessions FOR UPDATE
  TO public
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Anyone can create responses"
  ON interview_responses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read responses from their sessions"
  ON interview_responses FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions
      WHERE interview_sessions.id = interview_responses.session_id
      AND (interview_sessions.user_id IS NULL OR interview_sessions.user_id = auth.uid())
    )
  );

INSERT INTO interview_questions (question, category, difficulty, ideal_answer_points) VALUES
  ('Tell me about a time when you had to work under pressure.', 'behavioral', 'easy', ARRAY['Specific example', 'Clear problem', 'Actions taken', 'Positive outcome', 'Lessons learned']),
  ('How do you handle conflicts with team members?', 'behavioral', 'medium', ARRAY['Communication approach', 'Active listening', 'Finding common ground', 'Professional attitude', 'Resolution focus']),
  ('Describe a challenging project you worked on and how you overcame obstacles.', 'behavioral', 'medium', ARRAY['Project context', 'Specific challenges', 'Problem-solving approach', 'Collaboration', 'Measurable results']),
  ('What is your greatest weakness and how are you working to improve it?', 'behavioral', 'easy', ARRAY['Genuine weakness', 'Self-awareness', 'Concrete improvement plan', 'Progress made', 'Positive framing']),
  ('Explain the difference between let, const, and var in JavaScript.', 'technical', 'easy', ARRAY['Scope differences', 'Hoisting behavior', 'Reassignment rules', 'Block vs function scope', 'Best practices']),
  ('What is a closure in JavaScript and when would you use one?', 'technical', 'medium', ARRAY['Definition', 'Example code', 'Use cases', 'Memory considerations', 'Practical applications']),
  ('How would you optimize a slow database query?', 'technical', 'hard', ARRAY['Query analysis', 'Indexing strategy', 'Query structure', 'Database tools', 'Monitoring approach']);
