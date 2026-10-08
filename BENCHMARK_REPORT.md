# BÁO CÁO KẾT QUẢ ĐO ĐẠC & BENCHMARK (BENCHMARK REPORT)
**Dự án**: Web nâng cao - Tuần 2 - Block 2: API Composition  
**Hệ thống**: Windows 11, Node.js v22.19.0, SQLite Native Engine, Express, GraphQL, DataLoader  
**Ngày thực hiện**: 2026-10-08  
**Phương pháp đo**: Tự động đo 5 lần liên tiếp trên từng kịch bản (Cold Run = lần 1 sau khi khởi động, Warm Runs = lần 2-5). Ghi nhận Median, Min, Max, Client Requests, Internal Calls, DB Queries, Payload Size.

---

## 1. Phương pháp & Cách đếm Metrics

1. **Client Requests**:
   - Được đếm trực tiếp tại tầng Network của Client (Browser / Test Runner).
   - Baseline: Gọi tuần tự 1 request User, 1 request Orders, và N request Products cho từng Order Item.
   - BFF & GraphQL: Client chỉ gửi đúng 1 HTTP request duy nhất đến server ghép dữ liệu.

2. **Internal Service Calls**:
   - Được đếm bởi BFF hoặc GraphQL Resolver khi gọi HTTP downstream tới các microservices (User, Order, Product).
   - Baseline không có internal call giữa các server (0).
   - GraphQL N+1 phát sinh số internal call bằng tổng số Order Items.
   - BFF và GraphQL DataLoader gom các Product ID duy nhất (Deduplication) và chỉ gọi đúng 1 batch call.

3. **Database Queries**:
   - Mỗi microservice độc lập (`user-service`, `order-service`, `product-service`) có bộ đếm truy vấn SQL `DatabaseSync.prepare(...).run() / get() / all()`.
   - Mỗi response trả về header `x-db-queries: N` và metadata telemetry để tổng hợp chính xác 100%.

4. **Thời gian hoàn tất màn hình (Screen Completion Time)**:
   - Đo bằng `performance.now()`.
   - Bắt đầu từ khi client gửi request đầu tiên cho đến khi nhận đủ toàn bộ dữ liệu và ghép xong trên DOM/Client.

5. **Kích thước Payload (Bytes)**:
   - Đo bằng `Buffer.byteLength` của toàn bộ nội dung JSON phản hồi gửi qua mạng tới client.

---

## 2. Dữ liệu đo thô chi tiết (Raw Benchmark Tables)

### 2.1 BỘ DỮ LIỆU NHỎ (Small Dataset: 5 đơn hàng, 3 sản phẩm trùng lặp)

#### A. Web Dashboard (Yêu cầu đầy đủ trường thông tin)
| Biến thể | Client Reqs | Internal Calls | DB Queries | Payload | Cold (1st) | Warm (2-5) | Median (Range) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline** | 10 | 0 | 11 | 4.0 KB | 74 ms | 11, 10, 12, 9 ms | **11 ms** (9-74 ms) |
| **BFF** | 1 | 3 | 4 | 4.7 KB | 8 ms | 7, 6, 7, 7 ms | **7 ms** (6-8 ms) |
| **GraphQL (N+1)** | 1 | 10 | 11 | 5.1 KB | 38 ms | 16, 15, 13, 15 ms | **15 ms** (13-38 ms) |
| **GraphQL (DataLoader)** | 1 | 3 | 4 | 4.4 KB | 9 ms | 7, 7, 8, 10 ms | **8 ms** (7-10 ms) |

#### B. Mobile App (Yêu cầu tinh gọn 4 trường)
| Biến thể | Client Reqs | Internal Calls | DB Queries | Payload | Cold (1st) | Warm (2-5) | Median (Range) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline** | 9 | 0 | 10 | 3.7 KB | 9 ms | 10, 11, 9, 11 ms | **10 ms** (9-11 ms) |
| **BFF** | 1 | 2 | 3 | 1.8 KB | 5 ms | 3, 3, 5, 5 ms | **5 ms** (3-5 ms) |
| **GraphQL (N+1)** | 1 | 9 | 10 | 2.5 KB | 9 ms | 13, 12, 11, 10 ms | **11 ms** (9-13 ms) |
| **GraphQL (DataLoader)** | 1 | 2 | 3 | 1.8 KB | 4 ms | 5, 5, 6, 6 ms | **5 ms** (4-6 ms) |

---

### 2.2 BỘ DỮ LIỆU LỚN (Large Dataset: 50 đơn hàng, 10 sản phẩm trùng lặp nhiều lần)

#### A. Web Dashboard (Yêu cầu đầy đủ trường thông tin)
| Biến thể | Client Reqs | Internal Calls | DB Queries | Payload | Cold (1st) | Warm (2-5) | Median (Range) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline** | **127** | 0 | 128 | 54.1 KB | 99 ms | 90, 97, 90, 83 ms | **90 ms** (83-99 ms) |
| **BFF** | **1** | **3** | **4** | 58.6 KB | 5 ms | 6, 8, 5, 5 ms | **5 ms** (5-8 ms) |
| **GraphQL (N+1)** | **1** | **127** | **128** | 67.5 KB | 111 ms | 63, 81, 64, 74 ms | **74 ms** (63-111 ms) |
| **GraphQL (DataLoader)** | **1** | **3** | **4** | 53.6 KB | 11 ms | 12, 13, 9, 10 ms | **11 ms** (9-13 ms) |

#### B. Mobile App (Yêu cầu tinh gọn 4 trường)
| Biến thể | Client Reqs | Internal Calls | DB Queries | Payload | Cold (1st) | Warm (2-5) | Median (Range) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline** | **126** | 0 | 127 | 53.8 KB | 75 ms | 77, 79, 78, 82 ms | **78 ms** (75-82 ms) |
| **BFF** | **1** | **2** | **3** | **22.6 KB** | 5 ms | 6, 5, 6, 6 ms | **6 ms** (5-6 ms) |
| **GraphQL (N+1)** | **1** | **126** | **127** | 34.8 KB | 58 ms | 55, 50, 54, 53 ms | **54 ms** (50-58 ms) |
| **GraphQL (DataLoader)** | **1** | **2** | **3** | **20.9 KB** | 7 ms | 8, 7, 5, 8 ms | **7 ms** (5-8 ms) |

---

## 3. Phân tích Chuyên sâu

### 3.1 Bùng nổ N+1 và Hiệu quả của DataLoader
- Ở tập dữ liệu lớn (50 đơn hàng với 125 order items):
  - **GraphQL N+1**: Gửi tới **127 internal calls** và thực thi **128 DB queries**! Mỗi item kích hoạt 1 câu `SELECT * FROM products WHERE id = ?`.
  - **GraphQL DataLoader**: Tự động gom (batch) tất cả ID trong cùng một event loop tick và khử trùng lặp (deduplicate 10 sản phẩm duy nhất). Số internal calls giảm từ 127 xuống **3**, số DB queries giảm từ 128 xuống **4**!
  - Thời gian xử lý của GraphQL giảm từ **74 ms** xuống **11 ms** (giảm gần 7 lần).

### 3.2 Tối ưu hóa Payload cho Mobile Client
- Dung lượng payload trả về cho Mobile App:
  - Web BFF: `58.6 KB`
  - Mobile BFF: `22.6 KB` (Giảm **61.4%** dung lượng payload).
  - Mobile GraphQL: `20.9 KB` (Giảm **64.3%** dung lượng payload).
- Việc cắt giảm các trường thừa (description, price, category, address, phone, email, paymentMethod) giúp tiết kiệm đáng kể băng thông mạng di động và giảm thiểu tải phân tích JSON trên CPU của thiết bị cầm tay.

### 3.3 So sánh Client-side (Baseline) vs Server-side (BFF & GraphQL)
- **Baseline**:
  - Gặp hiện tượng **Chatty Client**: Client phải gửi đến **127 requests** qua mạng. Trên localhost độ trễ đo được là 90ms; tuy nhiên trong môi trường mạng thực tế (với RTT 4G/WiFi ~30-50ms), 127 request tuần tự sẽ gây tắc nghẽn kéo dài nhiều giây.
- **BFF & GraphQL**:
  - Client chỉ tốn đúng **1 request** duy nhất. Toàn bộ quá trình ghép diễn ra trong mạng nội bộ tốc độ cao giữa các server.
