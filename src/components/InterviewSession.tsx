import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Question, InterviewSession as SessionType, Evaluation } from '../types/interview';
import QuestionCard from './QuestionCard';
import AnswerForm from './AnswerForm';
import FeedbackCard from './FeedbackCard';
import SessionSummary from './SessionSummary';
import { Loader, Trophy } from 'lucide-react';

export default function InterviewSession() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [session, setSession] = useState<SessionType | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionScores, setSessionScores] = useState<number[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('interview_questions')
        .select('*')
        .order('difficulty', { ascending: true });

      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);

      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: null,
          started_at: new Date().toISOString(),
          total_score: 0,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSession(sessionData);
    } catch (error) {
      console.error('Error initializing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateAnswer = async (answer: string) => {
    if (!session || !questions[currentQuestionIndex]) return;

    setIsEvaluating(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/evaluate-answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            question: currentQuestion.question,
            userAnswer: answer,
            idealPoints: currentQuestion.ideal_answer_points,
            category: currentQuestion.category,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const evaluation: Evaluation = await response.json();

      await supabase.from('interview_responses').insert({
        session_id: session.id,
        question_id: currentQuestion.id,
        user_answer: answer,
        ai_score: evaluation.score,
        ai_feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      });

      const newScores = [...sessionScores, evaluation.score];
      setSessionScores(newScores);

      const totalScore = Math.round(
        newScores.reduce((sum, score) => sum + score, 0) / newScores.length
      );

      await supabase
        .from('interview_sessions')
        .update({ total_score: totalScore })
        .eq('id', session.id);

      setCurrentEvaluation(evaluation);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentEvaluation(null);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    if (!session) return;

    await supabase
      .from('interview_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', session.id);

    setIsSessionComplete(true);
  };

  const restartSession = () => {
    setCurrentQuestionIndex(0);
    setCurrentEvaluation(null);
    setSessionScores([]);
    setIsSessionComplete(false);
    initializeSession();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    return <SessionSummary scores={sessionScores} onRestart={restartSession} />;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No questions available.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Session Score: {sessionScores.length > 0
                ? Math.round(sessionScores.reduce((sum, score) => sum + score, 0) / sessionScores.length)
                : 0}/10
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Interview Practice
          </h1>
          <p className="text-gray-600">
            Practice your interview skills with instant AI-powered feedback
          </p>
        </div>

        <div className="space-y-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />

          {!currentEvaluation ? (
            <AnswerForm onSubmit={evaluateAnswer} isEvaluating={isEvaluating} />
          ) : (
            <FeedbackCard
              evaluation={currentEvaluation}
              onNext={handleNextQuestion}
            />
          )}
        </div>
      </div>
    </div>
  );
}
