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
}

export default function QuitScreen({ result, onRestart }: Props) {
    const minutes = Math.floor(result.timeSeconds / 60);
    const seconds = result.timeSeconds % 60;
    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Game Over</h1>
                <p className="text-xl text-gray-900 mb-2">{result.playerName}</p>
                <p className="text-gray-700 mb-8">You quit the game.</p>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-inner">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Time</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Moves</p>
                            <p className="text-3xl font-bold text-gray-900">{result.moves}</p>
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-2">Your path:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {result.path.map((word, index) => (
                            <div key={index} className="flex items-center">
                                <span className="bg-gray-100 border border-gray-300 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                                    {word}
                                </span>
                                {index < result.path.length - 1 && (
                                    <span className="text-gray-400 mx-1">→</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Extra stats for quit/gameover */}
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {result.shortestPathString && (
                            <p className="text-gray-800 mb-1">Optimal path: <span className="font-mono">{result.shortestPathString}</span></p>
                        )}
                        {result.optimalDistance !== undefined && (
                            <p className="text-gray-800 mb-1">Optimal distance: <span className="font-bold">{result.optimalDistance}</span></p>
                        )}
                    </div>
                </div>
                <button
                    onClick={onRestart}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Play Again
                </button>
            </div>
        </div>
    );
}