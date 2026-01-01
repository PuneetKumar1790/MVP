# MCD HRMS Backend

Secure HRMS (Human Resource Management System) backend for **Municipal Corporation of Delhi** built with Node.js, Express, MongoDB, JWT, and Azure Blob Storage.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB & Azure credentials

# Start development server
npm run dev
```

Server runs at `http://localhost:5000`

---

## 📁 Project Structure

```
├── src/
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Route handlers (6 files)
│   ├── middlewares/           # Auth, validation, upload (6 files)
│   ├── models/                # Mongoose schemas (6 files)
│   ├── routes/                # API routes (8 files)
│   ├── services/              # Auth & Azure Blob services
│   ├── utils/                 # Logger & validators
│   └── app.js                 # Express app
├── server.js                  # Entry point
├── API_DOCS.md                # Full API documentation
└── .env.example               # Environment template
```

---

## 🔐 Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT (Access 15m + Refresh 7d) |
| **Roles** | employee, hr, department_head, admin |
| **Attendance** | Mark & track daily attendance |
| **Leave** | Apply, approve, reject leaves |
| **Transfers** | Request & approve department transfers |
| **Grievances** | File complaints with file attachments |
| **File Upload** | Azure Blob Storage (10MB, PDF/JPEG/PNG) |

---

## 📡 API Endpoints (17 total)

| Module | Endpoints |
|--------|-----------|
| Auth | `/api/auth/login`, `/register`, `/refresh`, `/logout` |
| Users | `/api/users/me` |
| Attendance | `/api/attendance/mark`, `/my`, `/` |
| Leave | `/api/leave/apply`, `/my`, `/:id/status` |
| Transfers | `/api/transfers/request`, `/my`, `/:id/approve` |
| Grievances | `/api/grievances`, `/my`, `/:id/respond` |
| Files | `/api/files/:blobName` |

See [API_DOCS.md](./API_DOCS.md) for full documentation with Postman examples.

---

## 🔧 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
CORS_ORIGIN=http://localhost:3000
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key
AZURE_STORAGE_CONTAINER_NAME=your-container
```

---

## 🛡️ Security

- bcrypt password hashing (10 rounds)
- JWT authentication with refresh tokens
- Zod input validation
- Helmet security headers
- Rate limiting (5 login attempts per minute)
- MongoDB injection prevention
- Private Azure Blob with SAS URLs

---

## 📋 Test Users

```
Employee: testuser@mcd.gov.in / password123
Admin:    admin@mcd.gov.in / admin123
```

---

## 📜 License

ISC
