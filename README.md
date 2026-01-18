### SYNCITY
---

They say in life it's the journey, not the destination, that matters (we don't actually know who). That is precisely what Syncity is about! 

Embark on a fast-paced word-navigation adventure inspired by WikiRacing, built around semantic relationships instead of hyperlinks. Players start from a random word and must reach a target word by travelling through a network of synonyms, antonyms and related words, choosing the path they believe would bring them closer to greatness. Players race against the clock, track their number of moves, and use a similarity meter to estimate how close they are to the target word. Players may backtrack to rethink their strategy, and successful runs are recorded on a leaderboard.

At every juncture, every decision they make shapes the path that follows. Watch every second. Count every move. Getting lost along your path isn't failure, it's a part of discovering the path you were meant to take.

Beyond gameplay, Syncity encourages vocabulary learning, lateral thinking, and intuition about how ideas relate.


## Inspiration
We were inspired by WikiRacing and the idea that meaning is not linear, but connected. Language forms a web of associations, contrasts, and intuitions, and navigating it trains how we think, not just what we know. Syncity was born from the question: *What if exploring meaning itself became the game?*

---

## How we built it
We modelled language as a semantic graph, where words are nodes connected through linguistic relationships. To estimate closeness between words, we used sentence transformers to generate AI embeddings, allowing us to compute semantic similarity in real time and power the proximity meter.

Tech stack:
- Frontend: TypeScript, React, Vite, Tailwind CSS  
- Backend: Python, Flask  
- Data: Wiktionary (parsed and cleaned)  
- AI: Sentence transformer embeddings for semantic similarity  
- Visualisation: Interactive graph-based word navigation  

---

## Challenges we ran into
- Data quality & safety: Wiktionary data contained profanities and irrelevant entries, requiring careful filtering  
- Data parsing: Wiktionary’s structure was complex and inconsistent, making extraction and normalisation non-trivial  
- Game balance: Balancing dataset size with playability to avoid dead ends while keeping the game challenging  
- Team coordination: Sequencing frontend work carefully to avoid merge conflicts due to overlapping files  
- Version control: Resolving Tailwind CSS version mismatches and improving Git workflows under time pressure  

---

## Accomplishments that we're proud of
- Built a fully playable and polished product, more complete than any of our previous hackathon projects  
- Successfully integrated AI embeddings into real-time gameplay  
- Overcame a long brainstorming block to create a concept all team members were excited about  
- Improved significantly in team coordination, Git usage, and task division  
- Delivered a game that is both fun and intellectually engaging

---

## What we learned
- How to transform unstructured linguistic data into a usable product  
- Practical experience applying AI embeddings in a real interactive system  
- Better collaboration under tight deadlines, especially around version control  
- The importance of early alignment on tools, dependencies, and workflows  
- That strong ideas often emerge after pushing through creative blocks  

---

## What's next for Syncity
- New game modes, including live multiplayer versus mode  
- Hint systems for learning-focused play  
- Displaying the shortest semantic path after each game to compare with the player’s route  
- Expanded datasets and difficulty tiers  
- Educational adaptations for vocabulary learning and language exploration
