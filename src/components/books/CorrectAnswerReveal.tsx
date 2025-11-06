// Stub component - original was minified
interface CorrectAnswerRevealProps {
  correctAnswer?: string;
  userAnswer?: string;
}

export function CorrectAnswerReveal({ correctAnswer, userAnswer }: CorrectAnswerRevealProps) {
  if (!correctAnswer) return null;

  return (
    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm font-semibold text-green-800">Correct answer: {correctAnswer}</p>
      {userAnswer && userAnswer !== correctAnswer && (
        <p className="text-sm text-gray-600 mt-1">Your answer: {userAnswer}</p>
      )}
    </div>
  );
}
