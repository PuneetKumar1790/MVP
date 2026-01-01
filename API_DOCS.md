# MVP Backend API Documentation

**Base URL**: `http://localhost:5000`

**Authentication**: JWT Bearer Token in `Authorization` header

---

## Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | ❌ | Health check |
| `/api/auth/register` | POST | ❌ | Register user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/auth/refresh` | POST | ❌ | Refresh tokens |
| `/api/auth/logout` | POST | ✅ | Logout user |
| `/api/users/me` | GET | ✅ | Get profile |
| `/api/tasks` | POST | ✅ | Create task |
| `/api/tasks` | GET | ✅ | Get tasks |
| `/api/tasks/:id` | GET | ✅ | Get task |
| `/api/tasks/:id` | PUT | ✅ | Update task |
| `/api/tasks/:id` | DELETE | ✅ | Delete task |

---

## Authentication Flow

```
1. Register/Login → Get accessToken + refreshToken
2. Use accessToken in requests: Authorization: Bearer <accessToken>
3. When accessToken expires (15min), call /refresh with refreshToken
4. On logout, call /logout to invalidate refreshToken
```

---

## Endpoints Detail

### Health Check

```http
GET /health
```

**Response** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T16:00:00.000Z"
}
```

---

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation**:
- `name`: Required, max 100 chars
- `email`: Required, valid email format
- `password`: Required, min 8 chars

**Response** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "6956a1f71079da99f6bbaffa",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-01-01T16:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors**:
- `400` - Validation error or email already exists

---

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6956a1f71079da99f6bbaffa",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-01-01T16:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors**:
- `401` - Invalid email or password
- `429` - Too many login attempts (rate limited: 5 per 15 min)

---

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors**:
- `401` - Invalid or expired refresh token

---

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get My Profile

```http
GET /api/users/me
Authorization: Bearer <accessToken>
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6956a1f71079da99f6bbaffa",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-01-01T16:00:00.000Z"
    }
  }
}
```

---

### Create Task

```http
POST /api/tasks
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "My Task",
  "description": "Task description (optional)"
}
```

**Validation**:
- `title`: Required, max 200 chars
- `description`: Optional, max 2000 chars

**Response** `201 Created`
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "6956b2f81079da99f6bbb000",
      "title": "My Task",
      "description": "Task description",
      "owner": "6956a1f71079da99f6bbaffa",
      "createdAt": "2026-01-01T16:30:00.000Z",
      "updatedAt": "2026-01-01T16:30:00.000Z"
    }
  }
}
```

---

### Get Tasks

```http
GET /api/tasks
Authorization: Bearer <accessToken>
```

**Note**: Regular users see only their tasks. Admin users see all tasks.

**Response** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": {
    "tasks": [
      {
        "_id": "6956b2f81079da99f6bbb000",
        "title": "My Task",
        "description": "Task description",
        "owner": {
          "_id": "6956a1f71079da99f6bbaffa",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2026-01-01T16:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Single Task

```http
GET /api/tasks/:id
Authorization: Bearer <accessToken>
```

**Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "6956b2f81079da99f6bbb000",
      "title": "My Task",
      "description": "Task description",
      "owner": {
        "_id": "6956a1f71079da99f6bbaffa",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2026-01-01T16:30:00.000Z"
    }
  }
}
```

**Errors**:
- `403` - Not authorized (not owner, not admin)
- `404` - Task not found

---

### Update Task

```http
PUT /api/tasks/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Note**: Only the task owner can update (even admins cannot update others' tasks)

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "6956b2f81079da99f6bbb000",
      "title": "Updated Title",
      "description": "Updated description",
      "owner": "6956a1f71079da99f6bbaffa",
      "createdAt": "2026-01-01T16:30:00.000Z",
      "updatedAt": "2026-01-01T16:35:00.000Z"
    }
  }
}
```

**Errors**:
- `403` - Not authorized (not owner)
- `404` - Task not found

---

### Delete Task

```http
DELETE /api/tasks/:id
Authorization: Bearer <accessToken>
```

**Note**: Owner can delete their own tasks. Admin can delete any task.

**Response** `200 OK`
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Errors**:
- `403` - Not authorized (not owner, not admin)
- `404` - Task not found

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Field-specific errors (if validation)"]
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Validation error / Bad request |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not found |
| `429` | Too many requests (rate limited) |
| `500` | Server error |

---

## Frontend Integration Tips

### 1. Store Tokens Securely
```javascript
// After login/register
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
```

### 2. Add Auth Header to Requests
```javascript
const response = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Handle Token Refresh
```javascript
// When you get 401, try refreshing
if (response.status === 401) {
  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
  });
  
  if (refreshRes.ok) {
    const { data } = await refreshRes.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // Retry original request
  } else {
    // Redirect to login
  }
}
```

### 4. Clear Tokens on Logout
```javascript
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

## Roles

| Role | Permissions |
|------|-------------|
| `user` | CRUD own tasks, view own profile |
| `admin` | View all tasks, delete any task |
