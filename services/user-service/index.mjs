import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/users.db');

export function createUserServiceApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = new DatabaseSync(DB_PATH);
  const getUserStmt = db.prepare('SELECT * FROM users WHERE id = ?');

  let totalQueries = 0;
  let totalRequests = 0;

  app.get('/users/:id', (req, res) => {
    totalRequests++;
    const { id } = req.params;
    totalQueries++;
    const user = getUserStmt.get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.setHeader('x-service', 'user-service');
    res.setHeader('x-db-queries', '1');
    return res.json(user);
  });

  app.get('/metrics', (req, res) => {
    res.json({
      service: 'user-service',
      totalRequests,
      totalQueries
    });
  });

  app.post('/metrics/reset', (req, res) => {
    totalRequests = 0;
    totalQueries = 0;
    res.json({ ok: true });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = createUserServiceApp();
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`[User Service] Chạy tại http://localhost:${PORT}`);
  });
}
