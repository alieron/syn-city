import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Synonym endpoint
app.get('/api/synonyms/:word', async (req, res) => {
  const word = req.params.word.toLowerCase();
  
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?rel_syn=${word}&max=8`
    );
    const data = await response.json();
    const synonyms = data.map((item: any) => item.word);
    
    res.json({ word, synonyms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch synonyms' });
  }
});

// Mock game submission
app.post('/api/game/submit', (req, res) => {
  const { playerName, path, timeSeconds, moves } = req.body;
  
  console.log('Game submitted:', { playerName, moves, timeSeconds });
  
  res.json({ 
    success: true,
    message: 'Score submitted!',
    rank: Math.floor(Math.random() * 10) + 1
  });
});

// Mock leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json([
    { rank: 1, name: 'Alice', time: 45, moves: 6 },
    { rank: 2, name: 'Bob', time: 52, moves: 7 },
    { rank: 3, name: 'Charlie', time: 58, moves: 8 },
  ]);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
