import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function seedDatabases() {
  console.log('--- Đang khởi tạo và nạp dữ liệu SQLite cho 3 microservices ---');

  function safeOpenDb(filePath) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Bỏ qua nếu file đang bị process khác giữ lock, SQLite vẫn có thể DROP TABLE
    }
    return new DatabaseSync(filePath);
  }

  // 1. USER SERVICE DATABASE
  const userDbPath = path.join(DATA_DIR, 'users.db');
  const userDb = safeOpenDb(userDbPath);

  userDb.exec(`
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      avatar TEXT
    );
  `);

  const insertUser = userDb.prepare(`
    INSERT INTO users (id, name, email, phone, address, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'u1',
    'Alice Nguyen',
    'alice.nguyen@example.com',
    '0901234567',
    '123 Le Loi, Phuong Ben Nghe, Quan 1, TP.HCM',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  );

  insertUser.run(
    'u2',
    'Bob Tran',
    'bob.tran@example.com',
    '0912345678',
    '456 Tran Hung Dao, Phuong 2, Quan 5, TP.HCM',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  );
  userDb.close();
  console.log('✓ User Service DB (users.db) đã được tạo.');

  // 2. PRODUCT SERVICE DATABASE
  const productDbPath = path.join(DATA_DIR, 'products.db');
  const productDb = safeOpenDb(productDbPath);

  productDb.exec(`
    DROP TABLE IF EXISTS products;
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT,
      thumbnailUrl TEXT,
      inStock INTEGER NOT NULL DEFAULT 1
    );
  `);

  const insertProduct = productDb.prepare(`
    INSERT INTO products (id, name, price, description, category, thumbnailUrl, inStock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const productsData = [
    {
      id: 'p1',
      name: 'Bàn phím cơ Không dây Keychron K2',
      price: 1890000,
      description: 'Layout 75%, kết nối Bluetooth 5.1 & Type-C, switch Gateron G Pro',
      category: 'Bàn phím',
      thumbnailUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150',
      inStock: 45
    },
    {
      id: 'p2',
      name: 'Chuột không dây Logitech MX Master 3S',
      price: 2350000,
      description: 'Cảm biến 8K DPI Darkfield, cuộn MagSpeed, chống ồn Quiet Clicks',
      category: 'Chuột',
      thumbnailUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150',
      inStock: 30
    },
    {
      id: 'p3',
      name: 'Tai nghe chống ồn Sony WH-1000XM5',
      price: 6990000,
      description: 'Chống ồn chủ động kép hàng đầu, thời lượng pin 30 giờ, âm thanh Hi-Res',
      category: 'Âm thanh',
      thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
      inStock: 18
    },
    {
      id: 'p4',
      name: 'Màn hình Dell UltraSharp U2723QE 4K',
      price: 13490000,
      description: '27 inch IPS Black, độ phân giải 4K UHD 3840x2160, cổng Type-C 90W',
      category: 'Màn hình',
      thumbnailUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150',
      inStock: 12
    },
    {
      id: 'p5',
      name: 'Đế nâng laptop nhôm công thái học',
      price: 450000,
      description: 'Chất liệu hợp kim nhôm nguyên khối, gập gọn linh hoạt, tản nhiệt tốt',
      category: 'Phụ kiện',
      thumbnailUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=150',
      inStock: 80
    },
    {
      id: 'p6',
      name: 'Hub chuyển đổi Type-C 8-in-1 đa năng',
      price: 890000,
      description: 'Cổng HDMI 4K@60Hz, 3x USB 3.0, khe thẻ SD/TF, sạc nhanh PD 100W',
      category: 'Phụ kiện',
      thumbnailUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=150',
      inStock: 55
    },
    {
      id: 'p7',
      name: 'Đèn treo màn hình bảo vệ mắt Baseus',
      price: 620000,
      description: 'Thiết kế chống chói mắt, 3 chế độ nhiệt độ màu, cảm ứng dimmer',
      category: 'Phụ kiện',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150',
      inStock: 40
    },
    {
      id: 'p8',
      name: 'Webcam 2K chống rung kèm Mic khử ồn',
      price: 1150000,
      description: 'Độ phân giải 2K QHD, micro kép chống ồn AI, nắp che bảo mật',
      category: 'Thiết bị ngoại vi',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=150',
      inStock: 25
    },
    {
      id: 'p9',
      name: 'Thảm da lót bàn làm việc Deskpad 80x40cm',
      price: 250000,
      description: 'Chất liệu da PU chống bám nước, mặt sau nỉ êm ái chống trượt',
      category: 'Phụ kiện',
      thumbnailUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150',
      inStock: 120
    },
    {
      id: 'p10',
      name: 'Loa Bluetooth di động Marshall Emberton II',
      price: 3890000,
      description: 'Âm thanh không gian 360 độ True Stereophonic, pin 30 giờ, chuẩn IP67',
      category: 'Âm thanh',
      thumbnailUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=150',
      inStock: 15
    }
  ];

  for (const p of productsData) {
    insertProduct.run(p.id, p.name, p.price, p.description, p.category, p.thumbnailUrl, p.inStock);
  }
  productDb.close();
  console.log(`✓ Product Service DB (products.db) đã được tạo với ${productsData.length} sản phẩm.`);

  // 3. ORDER SERVICE DATABASE
  const orderDbPath = path.join(DATA_DIR, 'orders.db');
  const orderDb = safeOpenDb(orderDbPath);

  orderDb.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      orderDate TEXT NOT NULL,
      status TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      totalAmount REAL NOT NULL
    );

    CREATE TABLE order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id)
    );
  `);

  const insertOrder = orderDb.prepare(`
    INSERT INTO orders (id, userId, orderDate, status, shippingAddress, paymentMethod, totalAmount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = orderDb.prepare(`
    INSERT INTO order_items (id, orderId, productId, quantity, unitPrice)
    VALUES (?, ?, ?, ?, ?)
  `);

  // --- DỮ LIỆU NHỎ (Small Dataset - User u1): 5 đơn hàng, có product lặp lại p1, p2, p3
  const smallOrders = [
    {
      id: 'o1',
      userId: 'u1',
      orderDate: '2026-10-01 10:30:00',
      status: 'DELIVERED',
      shippingAddress: '123 Le Loi, Phuong Ben Nghe, Quan 1, TP.HCM',
      paymentMethod: 'COD',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 1890000 },
        { productId: 'p2', quantity: 1, unitPrice: 2350000 }
      ]
    },
    {
      id: 'o2',
      userId: 'u1',
      orderDate: '2026-10-03 14:15:00',
      status: 'DELIVERED',
      shippingAddress: '123 Le Loi, Phuong Ben Nghe, Quan 1, TP.HCM',
      paymentMethod: 'Credit Card',
      items: [
        { productId: 'p2', quantity: 2, unitPrice: 2350000 }
      ]
    },
    {
      id: 'o3',
      userId: 'u1',
      orderDate: '2026-10-05 09:00:00',
      status: 'SHIPPED',
      shippingAddress: '123 Le Loi, Phuong Ben Nghe, Quan 1, TP.HCM',
      paymentMethod: 'VNPay',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 1890000 },
        { productId: 'p3', quantity: 1, unitPrice: 6990000 }
      ]
    },
    {
      id: 'o4',
      userId: 'u1',
      orderDate: '2026-10-06 16:45:00',
      status: 'PROCESSING',
      shippingAddress: '123 Le Loi, Phuong Ben Nghe, Quan 1, TP.HCM',
      paymentMethod: 'MoMo',
      items: [
        { productId: 'p3', quantity: 1, unitPrice: 6990000 }
      ]
    },
    {
      id: 'o5',
      userId: 'u1',
      orderDate: '2026-10-07 11:20:00',
      status: 'PENDING',
      shippingAddress: '123 Le Loi, Phuong Ben Nghe, Quan 1, TP.HCM',
      paymentMethod: 'COD',
      items: [
        { productId: 'p1', quantity: 1, unitPrice: 1890000 },
        { productId: 'p2', quantity: 1, unitPrice: 2350000 }
      ]
    }
  ];

  let itemCounter = 1;
  for (const ord of smallOrders) {
    const totalAmount = ord.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    insertOrder.run(ord.id, ord.userId, ord.orderDate, ord.status, ord.shippingAddress, ord.paymentMethod, totalAmount);
    for (const item of ord.items) {
      insertOrderItem.run(`item_${itemCounter++}`, ord.id, item.productId, item.quantity, item.unitPrice);
    }
  }

  // --- DỮ LIỆU LỚN (Large Dataset - User u2): 50 đơn hàng (o101 đến o150)
  const productPriceMap = Object.fromEntries(productsData.map(p => [p.id, p.price]));
  const statuses = ['DELIVERED', 'SHIPPED', 'PROCESSING', 'PENDING'];
  const payments = ['Credit Card', 'VNPay', 'MoMo', 'COD', 'Bank Transfer'];

  for (let i = 1; i <= 50; i++) {
    const orderId = `o10${i < 10 ? '0' + i : i}`;
    const day = (i % 28) + 1;
    const orderDate = `2026-09-${day < 10 ? '0' + day : day} 10:00:00`;
    const status = statuses[i % statuses.length];
    const payment = payments[i % payments.length];
    const shippingAddress = '456 Tran Hung Dao, Phuong 2, Quan 5, TP.HCM';

    // Mỗi đơn hàng có 2-3 sản phẩm ngẫu nhiên chọn từ p1 đến p10 (chắc chắn có trùng lặp)
    const numItems = (i % 2) + 2; // 2 hoặc 3 items
    const selectedProdIds = [];
    for (let k = 0; k < numItems; k++) {
      const pIdx = ((i * 3 + k * 2) % 10) + 1;
      selectedProdIds.push(`p${pIdx}`);
    }

    let totalAmount = 0;
    const items = selectedProdIds.map(pid => {
      const qty = ((i + pid.length) % 3) + 1;
      const price = productPriceMap[pid] || 500000;
      totalAmount += qty * price;
      return { productId: pid, quantity: qty, unitPrice: price };
    });

    insertOrder.run(orderId, 'u2', orderDate, status, shippingAddress, payment, totalAmount);
    for (const item of items) {
      insertOrderItem.run(`item_${itemCounter++}`, orderId, item.productId, item.quantity, item.unitPrice);
    }
  }

  orderDb.close();
  console.log(`✓ Order Service DB (orders.db) đã được tạo với 5 đơn hàng nhỏ (u1) và 50 đơn hàng lớn (u2).`);
  console.log('--- Hoàn tất khởi tạo cơ sở dữ liệu! ---');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabases();
}
