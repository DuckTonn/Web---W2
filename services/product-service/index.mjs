import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/products.db');

export function createProductServiceApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = new DatabaseSync(DB_PATH);
  const getProductByIdStmt = db.prepare('SELECT * FROM products WHERE id = ?');

  let totalQueries = 0;
  let totalRequests = 0;
  let singleCalls = 0;
  let batchCalls = 0;

  // Global chaos simulation settings
  let chaosConfig = {
    enabled: false,
    delayMs: 0,
    faultStatus: null // e.g. 500
  };

  // Chaos middleware / handler helper
  async function applyChaos(req, res) {
    const delay = parseInt(req.headers['x-chaos-delay'] || req.query.delay || chaosConfig.delayMs, 10);
    const fault = parseInt(req.headers['x-chaos-fault'] || req.query.fault || chaosConfig.faultStatus, 10);

    if (delay && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (fault && fault >= 400) {
      res.status(fault).json({
        error: `Simulated Product Service Failure (${fault})`,
        service: 'product-service',
        timestamp: new Date().toISOString()
      });
      return true; // handled
    }

    return false; // continue normal execution
  }

  // Batch Product Fetch (Must be declared BEFORE /products/:id)
  app.get('/products/batch', async (req, res) => {
    return handleBatch(req, res);
  });

  app.get('/products', async (req, res) => {
    return handleBatch(req, res);
  });

  // Single Product Fetch (Used in Baseline & GraphQL N+1 mode)
  app.get('/products/:id', async (req, res) => {
    totalRequests++;
    singleCalls++;

    const isHalted = await applyChaos(req, res);
    if (isHalted) return;

    const { id } = req.params;
    totalQueries++;
    const product = getProductByIdStmt.get(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.setHeader('x-service', 'product-service');
    res.setHeader('x-db-queries', '1');
    return res.json(product);
  });

  async function handleBatch(req, res) {
    totalRequests++;
    batchCalls++;

    const isHalted = await applyChaos(req, res);
    if (isHalted) return;

    const idsParam = req.query.ids;
    if (!idsParam) {
      // Trả về tất cả sản phẩm
      totalQueries++;
      const allStmt = db.prepare('SELECT * FROM products');
      const allProducts = allStmt.all();
      res.setHeader('x-service', 'product-service');
      res.setHeader('x-db-queries', '1');
      return res.json(allProducts);
    }

    const ids = String(idsParam).split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      res.setHeader('x-service', 'product-service');
      res.setHeader('x-db-queries', '0');
      return res.json([]);
    }

    // Single DB query for all IDs: WHERE id IN (?, ?, ...)
    const placeholders = ids.map(() => '?').join(',');
    const batchStmt = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`);

    totalQueries++;
    const products = batchStmt.all(...ids);

    res.setHeader('x-service', 'product-service');
    res.setHeader('x-db-queries', '1');
    return res.json(products);
  }

  // Chaos controls
  app.get('/chaos', (req, res) => {
    res.json(chaosConfig);
  });

  app.post('/chaos', (req, res) => {
    const { enabled, delayMs, faultStatus } = req.body;
    if (enabled !== undefined) chaosConfig.enabled = Boolean(enabled);
    if (delayMs !== undefined) chaosConfig.delayMs = Number(delayMs);
    if (faultStatus !== undefined) chaosConfig.faultStatus = faultStatus ? Number(faultStatus) : null;
    res.json({ message: 'Chaos config updated', config: chaosConfig });
  });

  // Metrics
  app.get('/metrics', (req, res) => {
    res.json({
      service: 'product-service',
      totalRequests,
      totalQueries,
      singleCalls,
      batchCalls,
      chaosConfig
    });
  });

  app.post('/metrics/reset', (req, res) => {
    totalRequests = 0;
    totalQueries = 0;
    singleCalls = 0;
    batchCalls = 0;
    res.json({ ok: true });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = createProductServiceApp();
  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => {
    console.log(`[Product Service] Chạy tại http://localhost:${PORT}`);
  });
}
