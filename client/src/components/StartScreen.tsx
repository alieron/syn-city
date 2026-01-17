import { useState } from 'react';

interface Props {
  onStart: (config: { startWord: string; targetWord: string; playerName: string; gameId: string }) => void;
}

export default function StartScreen({ onStart }: Props) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) {
      alert('Please enter your name!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/start', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      const data = await response.json();
      
      onStart({
        startWord: data.startWord,
        targetWord: data.targetWord,
        playerName: name,
        gameId: data.gameId,
      });
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🎯 Synonym Sprint
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Race through synonyms to reach the target word!
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-purple-500"
        />

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? 'Starting game...' : 'Start New Game'}
        </button>
      </div>
    </div>
  );
}
