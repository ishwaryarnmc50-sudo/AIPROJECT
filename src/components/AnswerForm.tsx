import { useState } from 'react';
import { Send, Loader } from 'lucide-react';

interface AnswerFormProps {
  onSubmit: (answer: string) => Promise<void>;
  isEvaluating: boolean;
}

export default function AnswerForm({ onSubmit, isEvaluating }: AnswerFormProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      await onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
        Your Answer
      </label>
      <textarea
        id="answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here... Be specific and use examples to demonstrate your experience."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={8}
        disabled={isEvaluating}
        required
      />
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {answer.split(/\s+/).filter(word => word.length > 0).length} words
        </span>
        <button
          type="submit"
          disabled={!answer.trim() || isEvaluating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEvaluating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Answer
            </>
          )}
        </button>
      </div>
    </form>
  );
}
