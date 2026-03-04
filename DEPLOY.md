# 🚀 Hướng Dẫn Deploy Signify

## Kiến Trúc Deploy

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel (Free) │     │  Render (Free)  │     │  Render (Free)  │
│                 │     │                 │     │                 │
│   Frontend      │────▶│   Backend API   │────▶│   PostgreSQL    │
│   React App     │     │   Node.js       │     │   Database      │
│                 │     │   + WebSocket   │     │                 │
└─────────────────┘     │                 │     └─────────────────┘
                        │        │        │
                        │        ▼        │     ┌─────────────────┐
                        │   Redis Cloud   │────▶│  Redis (Free)   │
                        │   (Cache+Auth)  │     │  redis.io       │
                        └─────────────────┘     └─────────────────┘
```

---

## Bước 0: Chuẩn Bị

### Tạo tài khoản (miễn phí):
1. **Vercel**: https://vercel.com/signup (đăng nhập bằng GitHub)
2. **Render**: https://render.com/signup (đăng nhập bằng GitHub)
3. **Redis Cloud**: https://redis.io/try-free (free 30MB)

### Push code lên GitHub:
```bash
cd e:\project\signify
git init
git add .
git commit -m "Signify - ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/signify.git
git push -u origin main
```

---

## Bước 1: Deploy PostgreSQL trên Render

1. Vào **Render Dashboard** → **New** → **PostgreSQL**
2. Điền thông tin:
   - **Name**: `signify-db`
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Plan**: Free
3. Bấm **Create Database**
4. Đợi tạo xong → Copy **Internal Database URL** và **External Database URL**
   - Dạng: `postgres://user:password@host:5432/dbname`

> ⚠️ **Lưu ý**: Free plan sẽ bị xóa sau 90 ngày. Backup data thường xuyên!

---

## Bước 2: Setup Redis Cloud

1. Vào https://redis.io/try-free → Tạo tài khoản
2. Tạo **New Database** (Free tier - 30MB)
   - **Cloud**: AWS
   - **Region**: ap-southeast-1 (Singapore)
3. Sau khi tạo xong, copy:
   - **Host**: `redis-xxxxx.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com`
   - **Port**: `xxxxx`
   - **Password**: `xxxxxxx`
4. Connection string: `redis://default:PASSWORD@HOST:PORT`

---

## Bước 3: Deploy Backend trên Render

### 3.1 Tạo Web Service
1. Vào **Render Dashboard** → **New** → **Web Service**
2. Connect GitHub repo → chọn repo `signify`
3. Cấu hình:
   - **Name**: `signify-backend`
   - **Region**: Singapore
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free

### 3.2 Thêm Environment Variables
Vào **Environment** tab, thêm các biến:

| Key | Value | Mô tả |
|-----|-------|--------|
| `NODE_ENV` | `production` | Môi trường production |
| `PORT` | `4000` | Port (Render tự assign, nhưng set backup) |
| `DB_NAME` | `signify_db_xxxx` | Từ Render PostgreSQL |
| `DB_USER` | `signify_db_xxxx_user` | Từ Render PostgreSQL |
| `DB_PASSWORD` | `xxxxxx` | Từ Render PostgreSQL |
| `DB_HOST` | `dpg-xxxxx-a.singapore-postgres.render.com` | Internal host |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `JWT_SECRET` | `your-super-secret-key-change-this-123!` | Tự tạo, phải phức tạp |
| `REDIS_URL` | `redis://default:pass@host:port` | Từ Redis Cloud |
| `REACT_API` | `https://your-frontend.vercel.app` | URL frontend (thêm sau) |

### 3.3 Deploy
- Bấm **Create Web Service**
- Đợi build + deploy (~3-5 phút)
- Sau khi xong, bạn sẽ có URL dạng: `https://signify-backend.onrender.com`

> ⚠️ **Render Free**: Server sẽ "ngủ" sau 15 phút không hoạt động. Request đầu tiên sẽ mất ~30-50s để "đánh thức".

---

## Bước 4: Deploy Frontend trên Vercel

### 4.1 Import Project
1. Vào **Vercel Dashboard** → **Add New** → **Project**
2. Import GitHub repo `signify`
3. Cấu hình:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 4.2 Thêm Environment Variables
| Key | Value |
|-----|-------|
| `REACT_APP_SERVER_URL` | `https://signify-backend.onrender.com/api` |
| `REACT_APP_WS_URL` | `wss://signify-backend.onrender.com` |

### 4.3 Deploy
- Bấm **Deploy**
- Đợi build (~2-3 phút)
- URL dạng: `https://signify-xxxx.vercel.app`

---

## Bước 5: Cập Nhật CORS (Quan Trọng!)

Sau khi có URL frontend từ Vercel, quay lại Render:

1. Vào **signify-backend** → **Environment**
2. Cập nhật biến `REACT_API`:
   ```
   REACT_API=https://signify-xxxx.vercel.app
   ```
3. Bấm **Save Changes** → backend sẽ tự restart

---

## Bước 6: Cập Nhật Redis Config

File `backend/src/config/redis.js` cần hỗ trợ `REDIS_URL`:

Kiểm tra file redis.js hiện tại đã hỗ trợ REDIS_URL chưa.

---

## Bước 7: Verify

### Test Backend:
```
https://signify-backend.onrender.com/api/meetings
→ Phải trả về 401 (Unauthorized) = Backend hoạt động!
```

### Test Frontend:
```
https://signify-xxxx.vercel.app
→ Phải hiện Landing Page
→ Thử đăng ký + đăng nhập
```

---

## Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|---------|-------------|-----------|
| Frontend 500 khi gọi API | CORS chưa cấu hình | Thêm URL frontend vào `REACT_API` env |
| Backend "Application Error" | DB chưa connect | Kiểm tra DB env variables |
| WebSocket không kết nối | Dùng `ws://` thay vì `wss://` | Frontend phải dùng `wss://` cho HTTPS |
| Login lỗi | JWT_SECRET chưa set | Thêm JWT_SECRET vào env |
| Chậm lần đầu (~30s) | Render free sleep | Bình thường, dùng UptimeRobot để ping |

### Giữ server "thức" (Optional):
1. Vào https://uptimerobot.com (free)
2. Thêm monitor: `https://signify-backend.onrender.com/api/meetings`
3. Interval: 14 phút
4. Server sẽ không bao giờ "ngủ"

---

## Checklist Deploy (Vercel + Render)

- [ ] PostgreSQL đã tạo trên Render
- [ ] Redis Cloud đã setup
- [ ] Backend deployed trên Render
- [ ] Environment variables đã set đầy đủ
- [ ] Frontend deployed trên Vercel
- [ ] REACT_API đã cập nhật trên Render
- [ ] CORS hoạt động (frontend gọi được API)
- [ ] WebSocket kết nối thành công
- [ ] Đăng ký/Đăng nhập hoạt động
- [ ] Tạo meeting hoạt động

---
---

# 🐳 Deploy bằng Docker

## Kiến Trúc Docker

```
┌───────────────────────────────────────────────────┐
│                Docker Compose                      │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Frontend │  │ Backend  │  │   PostgreSQL   │  │
│  │  Nginx   │  │ Node.js  │  │   Port: 5432   │  │
│  │ Port:3000│─▶│ Port:8080│─▶│                │  │
│  └──────────┘  │          │  └────────────────┘  │
│                │          │                       │
│                │          │  ┌────────────────┐  │
│                │          │─▶│     Redis      │  │
│                │          │  │   Port: 6379   │  │
│                └──────────┘  └────────────────┘  │
└───────────────────────────────────────────────────┘
```

## Yêu cầu

- **Docker Desktop**: https://docker.com/products/docker-desktop
- **Docker Compose**: Đi kèm Docker Desktop

## Cách 1: Chạy toàn bộ (Khuyến nghị)

### Một lệnh duy nhất:

```bash
cd e:\project\signify
docker-compose up -d --build
```

Xong! Truy cập:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8080/api
- 🗄️ **PostgreSQL**: localhost:5432
- 📦 **Redis**: localhost:6379

### Các lệnh hữu ích:

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs của 1 service cụ thể
docker-compose logs -f backend

# Dừng tất cả
docker-compose down

# Dừng + xóa data (reset database)
docker-compose down -v

# Rebuild sau khi sửa code
docker-compose up -d --build

# Xem trạng thái
docker-compose ps
```

## Cách 2: Chạy từng service riêng

### 2.1 PostgreSQL
```bash
docker run -d \
  --name signify-db \
  -e POSTGRES_DB=signify \
  -e POSTGRES_USER=signify_user \
  -e POSTGRES_PASSWORD=signify_password_123 \
  -p 5432:5432 \
  -v signify_pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### 2.2 Redis
```bash
docker run -d \
  --name signify-redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass signify_redis_123
```

### 2.3 Backend
```bash
cd backend
docker build -t signify-backend .
docker run -d \
  --name signify-backend \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=signify \
  -e DB_USER=signify_user \
  -e DB_PASSWORD=signify_password_123 \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PASSWORD=signify_redis_123 \
  -e JWT_SECRET=your-secret-key \
  -e NODE_ENV=production \
  -e REACT_API=http://localhost:3000 \
  signify-backend
```

### 2.4 Frontend
```bash
cd frontend
docker build -t signify-frontend \
  --build-arg REACT_APP_SERVER_URL=http://localhost:8080/api \
  --build-arg REACT_APP_WEBSOCKET_URL=ws://localhost:8080 \
  .
docker run -d \
  --name signify-frontend \
  -p 3000:80 \
  signify-frontend
```

## Deploy lên Server/VPS với Docker

### Bước 1: Cài Docker trên VPS (Ubuntu)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y
```

### Bước 2: Clone repo
```bash
git clone https://github.com/MaiDucDuy05/Signify.git
cd Signify
```

### Bước 3: Sửa URLs cho production
Trong `docker-compose.yml`, thay đổi:
```yaml
frontend:
  build:
    args:
      REACT_APP_SERVER_URL: https://your-domain.com/api
      REACT_APP_WEBSOCKET_URL: wss://your-domain.com

backend:
  environment:
    REACT_API: https://your-domain.com
    JWT_SECRET: your-strong-production-secret
```

### Bước 4: Deploy
```bash
docker compose up -d --build
```

## Troubleshooting Docker

| Vấn đề | Lệnh kiểm tra | Giải pháp |
|---------|---------------|-----------|
| Container crash | `docker-compose logs backend` | Xem error message |
| DB connection refused | `docker-compose ps` | Đợi postgres healthy |
| Port already in use | `netstat -ano \| findstr :8080` | Kill process hoặc đổi port |
| Build lỗi | `docker-compose build --no-cache` | Rebuild từ đầu |
| Hết disk space | `docker system prune -a` | Xóa images/containers cũ |

## Checklist Deploy Docker

- [ ] Docker Desktop đã cài và chạy
- [ ] `docker-compose up -d --build` thành công
- [ ] Tất cả 4 containers running (`docker-compose ps`)
- [ ] Frontend accessible tại http://localhost:3000
- [ ] Backend API tại http://localhost:8080/api
- [ ] Đăng ký/Đăng nhập hoạt động
- [ ] Tạo meeting hoạt động
- [ ] WebSocket kết nối thành công

