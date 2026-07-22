import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Redis } from '@upstash/redis';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Upstash KV if environment variables KV_REST_API_URL and KV_REST_API_TOKEN are set
const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const kv = hasKvConfig
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

if (hasKvConfig) {
  console.log('✅ Connected to Upstash Vercel KV database');
} else {
  console.log('ℹ️ Running with local JSON fallback persistence (Set KV_REST_API_URL & KV_REST_API_TOKEN for Upstash KV)');
}

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');

// Helpers for reading/writing persistence files safely as local fallback
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

// 1. Visitor Count Helpers
async function getVisitorCount(): Promise<number> {
  if (kv) {
    try {
      const val = await kv.get<number | string>('sodakem:visitor_count');
      let count = typeof val === 'number' ? val : parseInt(String(val || 473), 10);
      if (isNaN(count) || count < 473) {
        count = 473;
        await kv.set('sodakem:visitor_count', count);
      }
      return count;
    } catch (err) {
      console.error('Error reading visitor count from Upstash KV:', err);
    }
  }
  const stats = readJsonFile<{ count: number }>(STATS_FILE, { count: 473 });
  if (stats.count < 473) {
    stats.count = 473;
    writeJsonFile(STATS_FILE, stats);
  }
  return stats.count;
}

async function incrementVisitorCount(): Promise<number> {
  if (kv) {
    try {
      let current = await getVisitorCount();
      current += 1;
      await kv.set('sodakem:visitor_count', current);
      writeJsonFile(STATS_FILE, { count: current });
      return current;
    } catch (err) {
      console.error('Error incrementing visitor count on Upstash KV:', err);
    }
  }
  const stats = readJsonFile<{ count: number }>(STATS_FILE, { count: 473 });
  if (stats.count < 473) stats.count = 473;
  stats.count += 1;
  writeJsonFile(STATS_FILE, stats);
  return stats.count;
}

// 2. Reviews Helpers
async function getReviewsData(): Promise<Record<string, any[]>> {
  if (kv) {
    try {
      const data = await kv.get<Record<string, any[]>>('sodakem:reviews');
      if (data && typeof data === 'object') {
        return data;
      }
    } catch (err) {
      console.error('Error reading reviews from Upstash KV:', err);
    }
  }
  return readJsonFile<Record<string, any[]>>(REVIEWS_FILE, {});
}

async function saveReviewsData(reviews: Record<string, any[]>): Promise<void> {
  writeJsonFile(REVIEWS_FILE, reviews);
  if (kv) {
    try {
      await kv.set('sodakem:reviews', reviews);
    } catch (err) {
      console.error('Error saving reviews to Upstash KV:', err);
    }
  }
}

// 3. Likes Helpers
async function getLikesData(): Promise<Record<string, number>> {
  if (kv) {
    try {
      const data = await kv.get<Record<string, number>>('sodakem:likes');
      if (data && typeof data === 'object') {
        return data;
      }
    } catch (err) {
      console.error('Error reading likes from Upstash KV:', err);
    }
  }
  return readJsonFile<Record<string, number>>(LIKES_FILE, {});
}

async function saveLikesData(likes: Record<string, number>): Promise<void> {
  writeJsonFile(LIKES_FILE, likes);
  if (kv) {
    try {
      await kv.set('sodakem:likes', likes);
    } catch (err) {
      console.error('Error saving likes to Upstash KV:', err);
    }
  }
}

// API Routes

// 1. Visitor Count APIs
app.get('/api/visitor-count', async (req, res) => {
  const count = await getVisitorCount();
  res.json({ count });
});

app.post('/api/visitor-count/increment', async (req, res) => {
  const count = await incrementVisitorCount();
  res.json({ count });
});

// 2. Reviews APIs
app.get('/api/reviews', async (req, res) => {
  const reviews = await getReviewsData();
  res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
  const { characterId, review } = req.body;
  if (!characterId || !review) {
    res.status(400).json({ error: 'Missing characterId or review' });
    return;
  }
  const reviews = await getReviewsData();
  if (!reviews[characterId]) {
    reviews[characterId] = [];
  }
  reviews[characterId].push(review);
  await saveReviewsData(reviews);
  res.json({ success: true, reviews: reviews[characterId] });
});

app.put('/api/reviews/:characterId/:reviewId', async (req, res) => {
  const { characterId, reviewId } = req.params;
  const { reviewerName, rating, comment } = req.body;
  const reviews = await getReviewsData();
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
    await saveReviewsData(reviews);
  }
  res.json({ success: true, reviews: reviews[characterId] || [] });
});

// 3. Likes APIs
app.get('/api/likes', async (req, res) => {
  const likes = await getLikesData();
  res.json(likes);
});

app.post('/api/likes', async (req, res) => {
  const { characterId, increment } = req.body;
  if (!characterId) {
    res.status(400).json({ error: 'Missing characterId' });
    return;
  }
  const likes = await getLikesData();
  const delta = typeof increment === 'number' ? increment : 1;
  const current = likes[characterId] || 0;
  likes[characterId] = Math.max(0, current + delta);
  await saveLikesData(likes);
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

