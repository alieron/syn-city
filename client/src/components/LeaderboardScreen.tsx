interface LeaderboardEntry {
    playerName: string;
    timeSeconds: number;
    moves: number;
    optimalDistance: number;
    score: number;
}

interface Props {
    leaderboard: LeaderboardEntry[];
    onRestart: () => void;
}

export default function LeaderboardScreen({ leaderboard, onRestart }: Props) {
    // Sort by score ascending (smaller is better)
    const sorted = [...leaderboard].sort((a, b) => a.score - b.score);
    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-100 relative overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center relative">
                <h1 className="text-4xl font-bold mb-6 text-yellow-900">Leaderboard</h1>
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-yellow-200">
                            <th className="py-2 px-4 rounded-tl-2xl">Rank</th>
                            <th className="py-2 px-4">Player</th>
                            <th className="py-2 px-4">Time (s)</th>
                            <th className="py-2 px-4">Moves</th>
                            <th className="py-2 px-4 rounded-tr-2xl">Optimal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((entry, i) => (
                            <tr key={i} className={i === 0 ? 'bg-yellow-100 font-bold' : ''}>
                                <td className="py-2 px-4">{i + 1}</td>
                                <td className="py-2 px-4">{entry.playerName}</td>
                                <td className="py-2 px-4">{entry.timeSeconds}</td>
                                <td className="py-2 px-4">{entry.moves}</td>
                                <td className="py-2 px-4">{entry.optimalDistance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={onRestart}
                    className="w-full bg-yellow-900 hover:bg-yellow-800 text-white py-3 rounded-lg font-semibold transition hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
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