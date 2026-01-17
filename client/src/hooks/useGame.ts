import { useState, useCallback } from 'react';

interface WordWithMetadata {
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

export function useGame(startWord: string, targetWord: string) {
  const [state, setState] = useState<GameState>({
    currentWord: startWord,
    targetWord,
    path: [startWord],
    words: [],
    isLoading: false,
    isComplete: false,
    proximity: 0,
  });

  const calculateProximity = useCallback(async (word: string, target: string): Promise<number> => {
    try {
      // Check if the word is in the target's synonyms
      const response = await fetch(
        `https://api.datamuse.com/words?rel_syn=${target}&max=50`
      );
      const data = await response.json();
      const synonyms = data.map((item: any) => item.word.toLowerCase());
      
      if (word.toLowerCase() === target.toLowerCase()) {
        return 100;
      }
      
      if (synonyms.includes(word.toLowerCase())) {
        return 80;
      }
      
      // Check reverse - if target is in word's synonyms
      const reverseResponse = await fetch(
        `https://api.datamuse.com/words?rel_syn=${word}&max=50`
      );
      const reverseData = await reverseResponse.json();
      const reverseSynonyms = reverseData.map((item: any) => item.word.toLowerCase());
      
      if (reverseSynonyms.includes(target.toLowerCase())) {
        return 70;
      }
      
      // Default based on path length - shorter path = better
      return Math.max(0, 50 - state.path.length * 5);
    } catch {
      return 50;
    }
  }, [state.path.length]);

  const fetchWords = useCallback(async (word: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch synonyms, antonyms, and related words in parallel
      const [synonymResponse, antonymResponse, relatedResponse] = await Promise.all([
        fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=4&md=d`),
        fetch(`https://api.datamuse.com/words?rel_ant=${word}&max=2&md=d`),
        fetch(`https://api.datamuse.com/words?rel_trg=${word}&max=2&md=d`),
      ]);
      
      const [synonymData, antonymData, relatedData] = await Promise.all([
        synonymResponse.json(),
        antonymResponse.json(),
        relatedResponse.json(),
      ]);
      
      // Map each type with metadata
      const synonyms: WordWithMetadata[] = synonymData.map((item: any) => ({
        word: item.word,
        definition: item.defs && item.defs.length > 0 
          ? item.defs[0].replace(/^\w+\t/, '')
          : 'No definition available',
        type: 'synonym' as const,
      }));
      
      const antonyms: WordWithMetadata[] = antonymData.map((item: any) => ({
        word: item.word,
        definition: item.defs && item.defs.length > 0 
          ? item.defs[0].replace(/^\w+\t/, '')
          : 'No definition available',
        type: 'antonym' as const,
      }));
      
      const related: WordWithMetadata[] = relatedData.map((item: any) => ({
        word: item.word,
        definition: item.defs && item.defs.length > 0 
          ? item.defs[0].replace(/^\w+\t/, '')
          : 'No definition available',
        type: 'related' as const,
      }));
      
      const allWords = [...synonyms, ...antonyms, ...related];
      
      // Calculate proximity to target
      const proximity = await calculateProximity(word, state.targetWord);
      
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
  }, [state.targetWord, calculateProximity]);

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
