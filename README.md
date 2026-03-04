<p align="center">
  <h1 align="center">🎥 Signify</h1>
  <p align="center">
    <strong>A modern video conferencing platform built with React & Node.js</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#api-reference">API Reference</a>
  </p>
</p>

---

##  Features

| Feature | Description |
|---|---|
| **Video Calling** | Real-time peer-to-peer video calls using WebRTC |
| **Screen Sharing** | Share your screen with meeting participants |
|  **Virtual Background** | Blur background or set custom background images (MediaPipe AI) |
| **In-Meeting Chat** | Real-time messaging during meetings via WebSocket |
| **Meeting Scheduler** | Schedule meetings with day/week/month calendar views |
| **Waiting Room** | Preview camera & mic before joining a meeting |
| **Authentication** | JWT-based signup/login with bcrypt password hashing |

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **React Router v7** | Client-side routing |
| **SCSS Modules** | Component-scoped styling |
| **Ant Design** | UI component library |
| **WebRTC** | Peer-to-peer video/audio |
| **MediaPipe** | AI-powered virtual background |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **WebSocket (ws)** | Real-time signaling & chat |
| **PostgreSQL** | Primary database |
| **Sequelize ORM** | Database management |
| **Redis** | Session caching |
| **JWT + bcrypt** | Authentication & security |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting |
| **Render** | Backend + PostgreSQL hosting |
| **Docker Compose** | Self-hosted deployment |


##  Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **Redis** (optional for local dev)
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/zuyxt05/signify.git
cd signify
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
DB_NAME=signify_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_ALTER=true
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_key
PORT=4000
REACT_API=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file:

```env
REACT_APP_SERVER_URL=http://localhost:4000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:4000
```

Start the frontend:

```bash
npm start
```

### 4. Quick Start with Docker (Alternative)

```bash
docker-compose up -d
```

This starts all services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login & get JWT token |

### Users
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/:id` | Get user by ID |
| `PUT` | `/api/users/:id` | Update user profile |

### Meetings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/meetings` | Create a new meeting |
| `GET` | `/api/meetings/user/:userId` | Get meetings by user |
| `GET` | `/api/meetings/code/:meetingCode` | Get meeting by code |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/messages/:meetingId` | Get messages for a meeting |
| `POST` | `/api/messages` | Send a message |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/ping` | Server health check (keep-alive) |

## 🔌 WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `join-room` | Client → Server | Join a meeting room |
| `user-joined` | Server → Client | Notify when user joins |
| `user-left` | Server → Client | Notify when user leaves |
| `offer` | Client ↔ Server | WebRTC SDP offer |
| `answer` | Client ↔ Server | WebRTC SDP answer |
| `ice-candidate` | Client ↔ Server | ICE candidate exchange |
| `chat-message` | Client ↔ Server | Real-time chat message |

## 🌐 Deployment

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Add environment variables:
   - `REACT_APP_SERVER_URL` = your backend URL + `/api`
   - `REACT_APP_WEBSOCKET_URL` = your backend WebSocket URL

### Backend → Render
1. Create a new **Web Service** on Render
2. Set **Root Directory** to `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/server.js`
5. Add environment variables (DB, Redis, JWT, CORS)

> See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## Testing

```bash
cd backend
npm test
```

## Demo Accounts

| Email | Password |
|---|---|
| `duy@signify.com` | `123456` |


