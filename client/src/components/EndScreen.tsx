interface Props {
  result: {
    playerName: string;
    path: string[];
    moves: number;
    timeSeconds: number;
  };
  onRestart: () => void;
}

export default function EndScreen({ result, onRestart }: Props) {
  const minutes = Math.floor(result.timeSeconds / 60);
  const seconds = result.timeSeconds % 60;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-maroon-950">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2 text-maroon-900">Congratulations!</h1>
        <p className="text-xl text-maroon-900 mb-2">{result.playerName}</p>
        <p className="text-maroon-700 mb-8">You reached the target word!</p>

        <div className="bg-maroon-50 rounded-lg p-6 mb-6 border-2 border-maroon-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-maroon-700">Time</p>
              <p className="text-2xl font-bold text-maroon-900">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            </div>
            <div>
              <p className="text-sm text-maroon-700">Moves</p>
              <p className="text-2xl font-bold text-maroon-900">{result.moves}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-maroon-700 mb-2">Your path:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {result.path.map((word, index) => (
              <div key={index} className="flex items-center">
                <span className="bg-maroon-100 border border-maroon-300 text-maroon-900 px-3 py-1 rounded-full text-sm font-medium">
                  {word}
                </span>
                {index < result.path.length - 1 && (
                  <span className="text-maroon-400 mx-1">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-maroon-900 hover:bg-maroon-800 text-white py-3 rounded-lg font-semibold transition"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}