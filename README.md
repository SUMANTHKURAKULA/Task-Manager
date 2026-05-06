# ◈ TeamFlow — Team Task Manager

A full-stack role-based task management application built with the **MERN stack** (MongoDB, Express, React, Node.js).

---

## ✦ Features

### Authentication
- JWT-based signup/login with bcrypt password hashing
- Persistent sessions via localStorage
- Auto-redirect on token expiry

### Role-Based Access Control
| Feature | Admin | Member |
|---|---|---|
| Create/Delete Projects | ✅ | ❌ |
| Manage Team Members | ✅ | ❌ |
| Create/Edit/Delete Tasks | ✅ | ❌ |
| Assign Tasks | ✅ | ❌ |
| View All Tasks | ✅ | Own only |
| Update Task Status | ✅ | ✅ |
| View Dashboard Stats | ✅ (all) | ✅ (own) |

### Project Management
- Create, update, delete projects
- Add/remove team members per project
- Progress tracking (completed/total tasks)

### Task Management
- Full CRUD with title, description, assignee, status, priority, due date
- Status: Pending / In Progress / Completed
- Priority: Low / Medium / High
- Overdue detection

### Dashboard
- Total, completed, pending, overdue task counts
- Pie chart visualization of task distribution
- Recent tasks feed

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── projectController.js   # Project CRUD
│   │   ├── taskController.js      # Task CRUD + stats
│   │   └── userController.js      # User management
│   ├── middleware/
│   │   └── auth.js                # JWT verify + role guard
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Project.js             # Project schema
│   │   └── Task.js                # Task schema
│   ├── routes/
│   │   ├── auth.js                # POST /signup, /login, GET /me
│   │   ├── projects.js            # Full CRUD + members
│   │   ├── tasks.js               # Full CRUD + stats
│   │   └── users.js               # User management (admin)
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js           # Axios instance + interceptors
│   │   │   └── services.js        # API functions per resource
│   │   ├── components/
│   │   │   ├── Navbar.js          # Top navigation bar
│   │   │   ├── ProtectedRoute.js  # Route guards
│   │   │   └── UI.js              # Reusable components
│   │   ├── context/
│   │   │   └── AuthContext.js     # Global auth state
│   │   ├── pages/
│   │   │   ├── AuthPage.js        # Login/Signup
│   │   │   ├── Dashboard.js       # Stats + charts
│   │   │   ├── ProjectsPage.js    # Projects list
│   │   │   ├── ProjectDetailPage.js # Single project + tasks
│   │   │   ├── TasksPage.js       # All tasks with filters
│   │   │   └── UsersPage.js       # Team management (admin)
│   │   ├── utils/
│   │   │   └── helpers.js         # Formatters + config
│   │   ├── App.js                 # Routes
│   │   ├── index.js               # Entry point
│   │   └── index.css              # Global styles + CSS variables
│   └── package.json
│
├── package.json                   # Root scripts (run both servers)
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Clone / Download the project
```bash
cd team-task-manager
```

### 2. Install dependencies
```bash
npm run install:all
# This installs root, backend, and frontend packages
```

Or manually:
```bash
# Root
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Configure environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

For **MongoDB Atlas**, replace MONGO_URI with your connection string:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/team-task-manager
```

### 4. Run the application
```bash
# From root — runs backend + frontend together
npm run dev

# Or separately:
npm run dev:backend   # Backend on http://localhost:5000
npm run dev:frontend  # Frontend on http://localhost:3000
```

### 5. Open the app
Navigate to **http://localhost:3000**

---

## 🔐 First-time Setup

1. Go to **http://localhost:3000**
2. Click **Sign Up**
3. Choose **Admin** role to create the first admin account
4. Start creating projects and inviting team members

> **Tip**: Create one Admin account first, then create Member accounts by signing up again (select Member role) and add them to projects.

---

## 🌐 API Reference

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |

### Projects
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Private | List projects |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Private | List tasks (filtered) |
| GET | `/api/tasks/stats` | Private | Dashboard stats |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Private | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Users
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| PUT | `/api/users/:id/role` | Admin | Change role |
| DELETE | `/api/users/:id` | Admin | Remove user |

---

## 🛠 Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- express-validator

**Frontend**
- React 18
- React Router v6
- Axios
- Recharts (charts)
- date-fns (date formatting)
- CSS Variables (no Tailwind dependency)

---

## 📝 Notes

- The frontend proxies `/api` requests to `http://localhost:5000` via the `proxy` field in `frontend/package.json`
- In production, set `REACT_APP_API_URL` to your backend URL
- JWT tokens are stored in `localStorage` and attached via Axios interceptors
- Members can only view and update status on their own tasks
- Admins see all tasks, all projects, and manage all users
