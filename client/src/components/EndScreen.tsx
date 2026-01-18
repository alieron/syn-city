interface Props {
  result: {
    playerName: string;
    path: string[];
    moves: number;
    timeSeconds: number;
    proximity?: number;
    shortestPathString?: string;
    optimalDistance?: number;
    quit?: boolean;
  };
  onRestart: () => void;
  onShowLeaderboard?: () => void;
}

export default function EndScreen({ result, onRestart, onShowLeaderboard }: Props) {
  const minutes = Math.floor(result.timeSeconds / 60);
  const seconds = result.timeSeconds % 60;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-950 relative overflow-hidden">
      {/* Floating celebration particles */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
      <div className="absolute top-20 right-20 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-maroon-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-10 right-10 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
        {!result.quit && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="text-6xl animate-bounce">🏆</div>
              <div className="absolute -top-2 -right-2 text-2xl animate-spin" style={{ animationDuration: '3s' }}>✨</div>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2 text-maroon-900 animate-pulse">
          {result.quit ? 'Game Over' : 'Congratulations!'}
        </h1>
        <p className="text-xl text-maroon-900 mb-2">{result.playerName}</p>
        <p className="text-maroon-700 mb-8">
          {result.quit ? 'You quit the game.' : 'You reached the target word!'}
        </p>

        <div className="bg-gradient-to-br from-maroon-50 to-maroon-100 rounded-lg p-6 mb-6 border-2 border-maroon-200 shadow-inner">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-maroon-700 uppercase tracking-wide mb-1">Time</p>
              <p className="text-3xl font-bold text-maroon-900">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-xs text-maroon-700 uppercase tracking-wide mb-1">Moves</p>
              <p className="text-3xl font-bold text-maroon-900">{result.moves}</p>
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
          <div className="mt-4 text-xs text-maroon-700 text-center">
            <span className="font-semibold">Optimal path:</span> <span className="font-mono">{result.shortestPathString || 'N/A'}</span>
          </div>
          <div className="mt-4 bg-maroon-50 rounded-lg p-4 border border-maroon-200">
            {result.optimalDistance !== undefined && (
              <p className="text-maroon-800 mb-1">Optimal distance: <span className="font-bold">{result.optimalDistance}</span></p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full bg-maroon-900 hover:bg-maroon-800 text-white py-3 rounded-lg font-semibold transition hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Play Again
          </button>
          <button
            onClick={onShowLeaderboard}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2a2 2 0 012 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 012-2h2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3.13a4 4 0 01-8 0" />
            </svg>
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}