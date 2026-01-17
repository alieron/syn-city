import { useState, useCallback } from 'react';

export interface WordWithMetadata {
  word: string;
  definition: string;
  type: 'synonym' | 'antonym' | 'related';
}

interface GameState {
  currentWord: string;
  targetWord: string;
  path: string[];
  words: WordWithMetadata[];
  isLoading: boolean;
  isComplete: boolean;
  proximity: number; // 0-100, higher = closer to target
}

export function useGame(startWord: string, targetWord: string, gameId: string) {
  const [state, setState] = useState<GameState>({
    currentWord: startWord,
    targetWord,
    path: [startWord],
    words: [],
    isLoading: false,
    isComplete: false,
    proximity: 0,
  });

  const calculateProximity = useCallback(async (word: string): Promise<number> => {
    try {
      const response = await fetch('/api/similarity', {
        headers: {
          'X-Game-Id': gameId,
          'X-Current-Word': word,
        },
      });

      if (!response.ok) {
        console.error('Similarity API error:', response.status, await response.text());
        return 50;
      }

      const data = await response.json();
      console.log('Similarity data:', data);
      
      // Convert similarity (0-1 range) to percentage (0-100)
      // Similarity uses cosine similarity where 1 = identical, 0 = unrelated
      const similarity = data.similarity || 0;
      return Math.round(Math.max(0, Math.min(100, similarity * 100)));
    } catch (error) {
      console.error('Failed to calculate proximity:', error);
      return 50;
    }
  }, [gameId]);

  const fetchWords = useCallback(async (word: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/next', {
        headers: {
          'X-Game-Id': gameId,
          'X-Current-Word': word,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }

      const data = await response.json();
      
      // Map backend response to WordWithMetadata format
      const synonyms: WordWithMetadata[] = (data.synonyms || []).map((word: string) => ({
        word,
        definition: 'Synonym',
        type: 'synonym' as const,
      }));
      
      const antonyms: WordWithMetadata[] = (data.antonyms || []).map((word: string) => ({
        word,
        definition: 'Antonym',
        type: 'antonym' as const,
      }));
      
      const related: WordWithMetadata[] = (data.related || []).map((word: string) => ({
        word,
        definition: 'Related word',
        type: 'related' as const,
      }));
      
      const allWords = [...synonyms, ...antonyms, ...related];
      
      // Calculate proximity to target
      const proximity = await calculateProximity(word);
      
      setState(prev => ({
        ...prev,
        words: allWords.length > 0 
          ? allWords 
          : [{ word: 'No words found', definition: '', type: 'synonym' }],
        isLoading: false,
        proximity,
      }));
    } catch (error) {
      console.error('Failed to fetch words:', error);
      setState(prev => ({ 
        ...prev, 
        words: [{ word: 'Error loading words', definition: '', type: 'synonym' }],
        isLoading: false 
      }));
    }
  }, [gameId, calculateProximity]);

  const selectWord = useCallback((word: string) => {
    if (word === 'No words found' || word === 'Error loading words') {
      return;
    }

    setState(prev => {
      const newPath = [...prev.path, word];
      const isComplete = word.toLowerCase() === prev.targetWord.toLowerCase();
      
      return {
        ...prev,
        currentWord: word,
        path: newPath,
        isComplete,
      };
    });
    
    if (word.toLowerCase() !== state.targetWord.toLowerCase()) {
      fetchWords(word);
    }
  }, [state.targetWord, fetchWords]);

  const revertToWord = useCallback((word: string, index: number) => {
    setState(prev => {
      const newPath = prev.path.slice(0, index + 1);
      
      return {
        ...prev,
        currentWord: word,
        path: newPath,
        isComplete: false,
      };
    });
    
    fetchWords(word);
  }, [fetchWords]);

  return {
    ...state,
    fetchWords,
    selectWord,
    revertToWord,
  };
}
