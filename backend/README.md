# MVP Backend API

A secure, production-ready MVP backend API built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mvp-db?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
```

### Connect to MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string and replace `<username>`, `<password>`, and `<database>` with your values
5. Add your IP to the whitelist (Network Access → Add IP Address)

### Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## 📡 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user profile | ✅ |

### Tasks
| Method | Endpoint | Description | Auth | Notes |
|--------|----------|-------------|------|-------|
| POST | `/api/tasks` | Create task | ✅ | |
| GET | `/api/tasks` | Get tasks | ✅ | Admin sees all |
| GET | `/api/tasks/:id` | Get single task | ✅ | |
| PUT | `/api/tasks/:id` | Update task | ✅ | Owner only |
| DELETE | `/api/tasks/:id` | Delete task | ✅ | Owner or Admin |

---

## 🧪 Postman-Ready Requests

### 1. Register User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login User
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 3. Get My Profile (Protected)
```http
GET http://localhost:5000/api/users/me
Authorization: Bearer <accessToken>
```

### 4. Create Task (Protected)
```http
POST http://localhost:5000/api/tasks
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "My First Task",
  "description": "This is a demo task"
}
```

### 5. Get All Tasks (Protected)
```http
GET http://localhost:5000/api/tasks
Authorization: Bearer <accessToken>
```

### 6. Update Task (Protected - Owner Only)
```http
PUT http://localhost:5000/api/tasks/<taskId>
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Task Title"
}
```

### 7. Delete Task (Protected - Owner or Admin)
```http
DELETE http://localhost:5000/api/tasks/<taskId>
Authorization: Bearer <accessToken>
```

### 8. Refresh Token
```http
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

### 9. Logout (Protected)
```http
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <accessToken>
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| JWT Authentication | Access Token (15m) + Refresh Token (7d) |
| Input Validation | Zod schemas |
| NoSQL Injection | express-mongo-sanitize |
| HTTP Headers | Helmet |
| CORS | Configurable origin |
| Rate Limiting | 5 login attempts per 15 minutes |
| Safe Logging | Tokens/passwords never logged |
| ObjectId Validation | Zod custom validator |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth handlers
│   │   ├── userController.js  # User handlers
│   │   └── taskController.js  # Task CRUD handlers
│   ├── middlewares/
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── roleMiddleware.js  # Role-based access
│   │   ├── errorHandler.js    # Global error handler
│   │   ├── validateRequest.js # Zod validation
│   │   └── rateLimiter.js     # Rate limiting
│   ├── models/
│   │   ├── User.js            # User model
│   │   └── Task.js            # Task model
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── authRoutes.js      # Auth routes
│   │   ├── userRoutes.js      # User routes
│   │   └── taskRoutes.js      # Task routes
│   ├── services/
│   │   └── authService.js     # Token generation
│   ├── utils/
│   │   ├── logger.js          # Safe logger
│   │   └── validators.js      # Zod schemas
│   └── app.js                 # Express app
├── server.js                  # Entry point
├── package.json
├── .env.example
└── .gitignore
```

---

## 👤 Roles

| Role | Capabilities |
|------|-------------|
| `user` | CRUD own tasks, view own profile |
| `admin` | View all tasks, delete any task |

To create an admin user, update the `role` field directly in MongoDB:
```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 📋 License

ISC
