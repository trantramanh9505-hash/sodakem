import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');

// Helpers for reading/writing persistence files safely
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Ensure stats file starts from at least 473
const currentStats = readJsonFile<{ count: number }>(STATS_FILE, { count: 473 });
if (currentStats.count < 473) {
  currentStats.count = 473;
}
writeJsonFile(STATS_FILE, currentStats);

// API Routes

// 1. Visitor Count APIs
app.get('/api/visitor-count', (req, res) => {
  const stats = readJsonFile<{ count: number }>(STATS_FILE, { count: 473 });
  if (stats.count < 473) {
    stats.count = 473;
    writeJsonFile(STATS_FILE, stats);
  }
  res.json(stats);
});

app.post('/api/visitor-count/increment', (req, res) => {
  const stats = readJsonFile<{ count: number }>(STATS_FILE, { count: 473 });
  if (stats.count < 473) {
    stats.count = 473;
  }
  stats.count += 1;
  writeJsonFile(STATS_FILE, stats);
  res.json(stats);
});

// 2. Reviews APIs
app.get('/api/reviews', (req, res) => {
  const reviews = readJsonFile<Record<string, any[]>>(REVIEWS_FILE, {});
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { characterId, review } = req.body;
  if (!characterId || !review) {
    res.status(400).json({ error: 'Missing characterId or review' });
    return;
  }
  const reviews = readJsonFile<Record<string, any[]>>(REVIEWS_FILE, {});
  if (!reviews[characterId]) {
    reviews[characterId] = [];
  }
  reviews[characterId].push(review);
  writeJsonFile(REVIEWS_FILE, reviews);
  res.json({ success: true, reviews: reviews[characterId] });
});

app.put('/api/reviews/:characterId/:reviewId', (req, res) => {
  const { characterId, reviewId } = req.params;
  const { reviewerName, rating, comment } = req.body;
  const reviews = readJsonFile<Record<string, any[]>>(REVIEWS_FILE, {});
  if (reviews[characterId]) {
    reviews[characterId] = reviews[characterId].map((r: any) => {
      if (r.id === reviewId) {
        return {
          ...r,
          reviewerName: reviewerName || r.reviewerName,
          rating: typeof rating === 'number' ? rating : r.rating,
          comment: comment !== undefined ? comment : r.comment,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    writeJsonFile(REVIEWS_FILE, reviews);
  }
  res.json({ success: true, reviews: reviews[characterId] || [] });
});

// 3. Likes APIs
app.get('/api/likes', (req, res) => {
  const likes = readJsonFile<Record<string, number>>(LIKES_FILE, {});
  res.json(likes);
});

app.post('/api/likes', (req, res) => {
  const { characterId, increment } = req.body;
  if (!characterId) {
    res.status(400).json({ error: 'Missing characterId' });
    return;
  }
  const likes = readJsonFile<Record<string, number>>(LIKES_FILE, {});
  const delta = typeof increment === 'number' ? increment : 1;
  const current = likes[characterId] || 0;
  likes[characterId] = Math.max(0, current + delta);
  writeJsonFile(LIKES_FILE, likes);
  res.json({ success: true, likes: likes[characterId] });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
