import { Trophy, Award, TrendingUp, RefreshCw } from 'lucide-react';

interface SessionSummaryProps {
  scores: number[];
  onRestart: () => void;
}

export default function SessionSummary({ scores, onRestart }: SessionSummaryProps) {
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  const getPerformanceMessage = (score: number) => {
    if (score >= 8) return { title: 'Outstanding!', message: 'You demonstrated excellent interview skills!', color: 'text-green-600' };
    if (score >= 6) return { title: 'Good Job!', message: 'You showed solid interview performance.', color: 'text-yellow-600' };
    return { title: 'Keep Practicing!', message: 'Practice makes perfect. Keep improving!', color: 'text-blue-600' };
  };

  const performance = getPerformanceMessage(averageScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Trophy className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Session Complete!
            </h1>
            <p className="text-gray-600">
              Here's how you performed
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-3 mb-2">
                <Award className={`w-8 h-8 ${performance.color}`} />
                <span className={`text-5xl font-bold ${performance.color}`}>
                  {averageScore}/10
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                {performance.title}
              </h2>
              <p className="text-gray-700">
                {performance.message}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Questions Answered</span>
              <span className="text-2xl font-bold text-gray-900">{scores.length}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Score</span>
              <span className="text-2xl font-bold text-gray-900">{averageScore}/10</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Individual Scores</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {scores.map((score, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-white rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-600">Q{index + 1}:</span>
                    <span className="ml-1 font-semibold text-gray-900">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for Improvement</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Practice the STAR method (Situation, Task, Action, Result)</li>
              <li>• Use specific examples from your experience</li>
              <li>• Keep answers structured and concise</li>
              <li>• Show self-awareness and growth mindset</li>
              <li>• Research the company and role thoroughly</li>
            </ul>
          </div>

          <button
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Start New Practice Session
          </button>
        </div>
      </div>
    </div>
  );
}
