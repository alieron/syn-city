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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-950 relative overflow-hidden">
<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
  {/* Logo Icon */}
  <div className="flex justify-center mb-6">
    <div className="relative">
      {/* Connected nodes logo */}
      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
        {/* Connection lines */}
        <line x1="30" y1="30" x2="50" y2="50" stroke="#ab234a" strokeWidth="2" opacity="0.6"/>
        <line x1="70" y1="30" x2="50" y2="50" stroke="#ab234a" strokeWidth="2" opacity="0.6"/>
        <line x1="50" y1="50" x2="50" y2="70" stroke="#ab234a" strokeWidth="2" opacity="0.6"/>
        
        {/* Nodes */}
        <circle cx="30" cy="30" r="8" fill="#f9d0d9" stroke="#791f3e" strokeWidth="2"/>
        <circle cx="70" cy="30" r="8" fill="#f9d0d9" stroke="#791f3e" strokeWidth="2"/>
        <circle cx="50" cy="50" r="10" fill="#791f3e" stroke="#430b1e" strokeWidth="2">
          <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="70" r="8" fill="#10b981" stroke="#059669" strokeWidth="2">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        {/* Sparkle effect */}
        <circle cx="50" cy="50" r="15" fill="none" stroke="#791f3e" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="15;20;15" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  </div>
  
  <h1 className="text-4xl font-bold text-center mb-2 text-maroon-900">
          SYNCITY
        </h1>
        <p className="text-center font-bold text-maroon-700 mb-8">
          Race through synonyms to reach the target word!
        </p>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-maroon-200 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-maroon-800 focus:border-transparent"
        />

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full bg-maroon-900 hover:bg-maroon-800 text-white py-4 rounded-lg transition disabled:opacity-50"
        >
          {isLoading ? 'Starting game...' : 'Start New Game'}
        </button>
      </div>
    </div>
  );
}