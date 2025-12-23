import { Evaluation } from '../types/interview';
import { CheckCircle, AlertCircle, Award } from 'lucide-react';

interface FeedbackCardProps {
  evaluation: Evaluation;
  onNext: () => void;
}

export default function FeedbackCard({ evaluation, onNext }: FeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 8) return 'Excellent Answer!';
    if (score >= 6) return 'Good Answer';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Feedback</h3>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getScoreColor(evaluation.score)}`}>
          <Award className="w-5 h-5" />
          <span className="text-2xl font-bold">{evaluation.score}/10</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          {getScoreMessage(evaluation.score)}
        </h4>
        <p className="text-gray-700 leading-relaxed">{evaluation.feedback}</p>
      </div>

      {evaluation.strengths.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-medium text-gray-900">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {evaluation.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.improvements.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-medium text-gray-900">Areas to Improve</h4>
          </div>
          <ul className="space-y-2">
            {evaluation.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Next Question
      </button>
    </div>
  );
}
