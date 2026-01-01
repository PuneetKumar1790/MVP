# MCD HRMS Backend API Documentation

**Base URL**: `http://localhost:5000`  
**Authentication**: JWT Bearer Token in `Authorization` header

---

## Quick Reference

### Authentication
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/auth/register` | ✅ | admin | Register employee |
| POST | `/api/auth/login` | ❌ | - | Login |
| POST | `/api/auth/refresh` | ❌ | - | Refresh token |
| POST | `/api/auth/logout` | ✅ | all | Logout |
| GET | `/api/users/me` | ✅ | all | Get profile |

### Attendance
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/attendance/mark` | ✅ | all | Mark attendance |
| GET | `/api/attendance/my` | ✅ | all | My attendance |
| GET | `/api/attendance` | ✅ | hr, admin | All attendance |

### Leave
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/leave/apply` | ✅ | all | Apply for leave |
| GET | `/api/leave/my` | ✅ | all | My leaves |
| GET | `/api/leave` | ✅ | hr, dept_head, admin | All leaves |
| PATCH | `/api/leave/:id/status` | ✅ | hr, dept_head | Approve/Reject |

### Transfers
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/transfers/request` | ✅ | all | Request transfer |
| GET | `/api/transfers/my` | ✅ | all | My transfers |
| GET | `/api/transfers` | ✅ | hr, admin | All transfers |
| PATCH | `/api/transfers/:id/approve` | ✅ | hr, admin | Approve/Reject |

### Grievances
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/api/grievances` | ✅ | all | File grievance (+ file) |
| GET | `/api/grievances/my` | ✅ | all | My grievances |
| GET | `/api/grievances` | ✅ | hr, admin | All grievances |
| PATCH | `/api/grievances/:id/respond` | ✅ | hr, admin | Respond |

### Files
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/files/my` | ✅ | all | My uploaded files |
| GET | `/api/files/:blobName` | ✅ | owner, hr, admin | Get SAS URL |

---

## Roles

| Role | Description |
|------|-------------|
| `employee` | Regular employee - can manage own data |
| `hr` | HR staff - can manage all employee data |
| `department_head` | Department head - can approve department leaves |
| `admin` | System admin - full access |

---

## Postman-Ready Requests

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mcd.gov.in",
  "password": "password123"
}
```

### 2. Register Employee (Admin Only)
```http
POST /api/auth/register
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh.kumar@mcd.gov.in",
  "password": "password123",
  "role": "employee",
  "employeeId": "MCD-2024-001",
  "department": "Sanitation",
  "designation": "Junior Engineer",
  "dateOfJoining": "2024-01-15"
}
```

### 3. Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "Present",
  "remarks": "On time"
}
```
**Status options**: `Present`, `Absent`, `Late`, `WFH`

### 4. Apply Leave
```http
POST /api/leave/apply
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "leaveType": "casual",
  "fromDate": "2024-02-01",
  "toDate": "2024-02-03",
  "reason": "Family function in hometown"
}
```
**Leave types**: `sick`, `casual`, `earned`, `maternity`, `paternity`, `unpaid`

### 5. Approve/Reject Leave (HR/Dept Head)
```http
PATCH /api/leave/:id/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "approved",
  "approverRemarks": "Approved for 3 days"
}
```

### 6. Request Transfer
```http
POST /api/transfers/request
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "requestedDepartment": "Engineering",
  "reason": "I have relevant experience in civil engineering and would like to contribute to infrastructure projects."
}
```

### 7. Approve Transfer (HR/Admin)
```http
PATCH /api/transfers/:id/approve
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "approved",
  "approverRemarks": "Transfer approved based on department needs",
  "effectiveDate": "2024-03-01"
}
```

### 8. File Grievance (with file upload)
```http
POST /api/grievances
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

category: harassment
description: I am facing continuous harassment from my supervisor regarding work deadlines.
priority: high
file: <PDF/JPEG/PNG file, max 10MB>
```
**Categories**: `harassment`, `discrimination`, `workplace_safety`, `salary`, `benefits`, `management`, `other`

### 9. Respond to Grievance (HR/Admin)
```http
PATCH /api/grievances/:id/respond
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "in_progress",
  "response": "We have initiated an inquiry into this matter. You will be contacted within 3 working days."
}
```

### 10. Get File Access (SAS URL)
```http
GET /api/files/:blobName
Authorization: Bearer <accessToken>
```
**Response**: Returns a 10-minute valid SAS URL to access the file.

---

## File Upload Rules

| Rule | Value |
|------|-------|
| Max size | 10 MB |
| Allowed types | PDF, JPEG, PNG |
| Storage | Azure Blob Storage (private) |
| Access | SAS URL (10 min expiry) |

---

## Standard Response Format

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Field-specific errors"]
}
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Create Admin User
Since registration is admin-only, create the first admin directly in MongoDB:
```javascript
db.users.insertOne({
  name: "System Admin",
  email: "admin@mcd.gov.in",
  password: "$2b$10$...", // bcrypt hash of your password
  role: "admin",
  employeeId: "MCD-ADMIN-001",
  department: "IT",
  createdAt: new Date()
})
```

Or use this Node.js script:
```javascript
const bcrypt = require('bcrypt');
const password = await bcrypt.hash('your-password', 10);
// Use this hash in MongoDB insert
```

### 4. Start Server
```bash
npm run dev
```

---

## Azure Blob Storage Setup

1. Create Azure Storage Account
2. Create a container (set to **Private**)
3. Get Account Name and Account Key
4. Add to `.env`:
```env
AZURE_STORAGE_ACCOUNT_NAME=youraccount
AZURE_STORAGE_ACCOUNT_KEY=yourkey
AZURE_STORAGE_CONTAINER_NAME=hrms-files
```
