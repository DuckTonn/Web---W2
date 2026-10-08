import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/orders.db');

export function createOrderServiceApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = new DatabaseSync(DB_PATH);
  const getOrdersByUserStmt = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC');

  let totalQueries = 0;
  let totalRequests = 0;

  app.get('/orders', (req, res) => {
    totalRequests++;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    // Query 1: Lấy danh sách orders
    totalQueries++;
    const orders = getOrdersByUserStmt.all(userId);

    let queryCount = 1;

    if (orders.length === 0) {
      res.setHeader('x-service', 'order-service');
      res.setHeader('x-db-queries', String(queryCount));
      return res.json([]);
    }

    // Query 2: Lấy tất cả items thuộc các order trên
    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const getItemsStmt = db.prepare(`SELECT * FROM order_items WHERE orderId IN (${placeholders})`);
    
    totalQueries++;
    queryCount++;
    const allItems = getItemsStmt.all(...orderIds);

    // Ghép items vào từng order
    const itemsByOrderId = new Map();
    for (const item of allItems) {
      if (!itemsByOrderId.has(item.orderId)) {
        itemsByOrderId.set(item.orderId, []);
      }
      itemsByOrderId.get(item.orderId).push(item);
    }

    const result = orders.map(order => ({
      ...order,
      items: itemsByOrderId.get(order.id) || []
    }));

    res.setHeader('x-service', 'order-service');
    res.setHeader('x-db-queries', String(queryCount));
    return res.json(result);
  });

  app.get('/metrics', (req, res) => {
    res.json({
      service: 'order-service',
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
  const app = createOrderServiceApp();
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`[Order Service] Chạy tại http://localhost:${PORT}`);
  });
}
