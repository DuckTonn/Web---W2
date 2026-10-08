import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createUserServiceApp } from './services/user-service/index.mjs';
import { createOrderServiceApp } from './services/order-service/index.mjs';
import { createProductServiceApp } from './services/product-service/index.mjs';
import { createBffServiceApp } from './services/bff-service/index.mjs';
import { createGraphqlServiceApp } from './services/graphql-service/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startAllServers() {
  const servers = {};

  // 1. User Service - Port 4001
  const userApp = createUserServiceApp();
  servers.userService = userApp.listen(4001, () => {
    console.log(' [1/6] User Service:     http://localhost:4001');
  });

  // 2. Order Service - Port 4002
  const orderApp = createOrderServiceApp();
  servers.orderService = orderApp.listen(4002, () => {
    console.log(' [2/6] Order Service:    http://localhost:4002');
  });

  // 3. Product Service - Port 4003
  const productApp = createProductServiceApp();
  servers.productService = productApp.listen(4003, () => {
    console.log(' [3/6] Product Service:  http://localhost:4003');
  });

  // 4. BFF Service - Port 4004
  const bffApp = createBffServiceApp();
  servers.bffService = bffApp.listen(4004, () => {
    console.log(' [4/6] BFF Service:      http://localhost:4004');
  });

  // 5. GraphQL Service - Port 4005
  const graphqlApp = createGraphqlServiceApp();
  servers.graphqlService = graphqlApp.listen(4005, () => {
    console.log(' [5/6] GraphQL Service:  http://localhost:4005');
  });

  // 6. Web Dashboard Frontend - Port 3000
  const webApp = express();
  webApp.use(express.static(path.join(__dirname, 'public')));
  // Fallback to index.html
  webApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  servers.webServer = webApp.listen(3000, () => {
    console.log(' [6/6] Web UI & Testing: http://localhost:3000');
    console.log('\n======================================================');
    console.log(' HỆ THỐNG ĐÃ SẴN SÀNG! MỞ TRÌNH DUYỆT TẠI:');
    console.log('           http://localhost:3000                      ');
    console.log('======================================================\n');
  });

  return servers;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Đang khởi động toàn bộ hệ thống API Composition...');
  startAllServers();
}
