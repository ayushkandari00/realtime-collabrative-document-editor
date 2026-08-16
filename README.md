# CollabDocs — Real-Time Collaborative Document Editor

> A production-quality Google Docs-style collaborative editor 

## ✨ Features

- **Real-time collaboration** — Multiple users edit simultaneously with instant sync
- **TipTap rich text editor** — Bold, italic, headings, lists, links, code blocks, task lists
- **Auto-save** — Saves automatically every 2 seconds with visual indicator
- **Version history** — Saves document snapshots, restore any version
- **Document sharing** — Share by email with Viewer or Editor permissions
- **Live presence** — See who's in the document, typing indicator, join/leave notifications
- **Dark mode** — Full dark mode with system preference detection
- **Export PDF** — Export any document as a PDF file
- **JWT auth** — Register, login, protected routes
- **Responsive design** — Works on all screen sizes

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Rich Editor | TipTap |
| Real-time | Socket.IO |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Security | Helmet, rate-limit, CORS |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### 1. Setup Server

```bash
cd server
copy .env.example .env   # Windows (or cp on Mac/Linux)
# Edit MONGODB_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 2. Setup Client

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

### 3. (Optional) Seed database

```bash
cd server
npm run seed
```

**Seed users:**
- alice@example.com / password123
- bob@example.com / password123
- carol@example.com / password123

## 🌐 URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## 📡 REST API

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/profile
- PUT  /api/auth/profile
- POST /api/auth/logout

### Documents
- GET    /api/documents
- POST   /api/documents
- GET    /api/documents/:id
- PUT    /api/documents/:id
- DELETE /api/documents/:id
- POST   /api/documents/share
- GET    /api/documents/:id/history
- POST   /api/documents/:id/restore/:version

## 🔌 Socket.IO Events

- join-document / leave-document
- send-changes / receive-changes
- save-document / document-saved
- typing / user-typing
- cursor-position / cursor-update
- title-change / title-updated
- user-joined / user-left / active-users

## ⚙️ Environment Variables

### server/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabdocs
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
