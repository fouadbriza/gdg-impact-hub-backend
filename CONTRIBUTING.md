# 🤝 Contributing to GDG Impact Hub Backend

Thank you for your interest in contributing! This guide will help you understand our project structure, coding standards, and development workflow.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Project Architecture](#project-architecture)
3. [Coding Standards](#coding-standards)
4. [Development Workflow](#development-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **Docker** (for local PostgreSQL)
- **Git**

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/z-sohaib/gdg-impact-hub-backend.git
cd gdg-impact-hub-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start local database
npm run docker:up

# 5. Setup database (generate client, run migrations, seed data)
npm run db:setup

# 6. Start development server
npm run dev
```

### Verify Setup

- Health check: http://localhost:3000/health
- Prisma Studio: `npm run prisma:studio`

---

## 🏗️ Project Architecture

### Directory Structure

```
src/
├── config/           # Configuration files
│   ├── prisma.js    # ✅ ONLY Prisma instance (single source of truth)
│   ├── env.js       # Environment variables
│   ├── passport.js  # OAuth strategies
│   └── cloudinary.js
├── middlewares/     # Express middlewares
│   ├── auth.js      # ✅ Authentication & authorization
│   ├── error.js     # ✅ Error handling (AppError class)
│   ├── validate.js  # ✅ Zod validation wrapper
│   ├── rateLimiter.js
│   └── upload.js
├── controllers/     # Request handlers
│   ├── *.controller.js  # ✅ Use asyncHandler
├── services/        # Business logic layer
│   ├── *.service.js     # ✅ Throw AppError
├── routers/         # Route definitions
│   ├── *.router.js      # ✅ Consistent naming
├── validations/     # Zod validation schemas (organized by entity)
│   ├── index.js     # ✅ Central export point
│   ├── user.validation.js
│   ├── project.validation.js
│   ├── announcement.validation.js
│   ├── mentorship.validation.js
│   ├── auth.validation.js
│   └── common.validation.js
├── utils/           # Utility functions
│   ├── asyncHandler.js  # ✅ Error wrapper
│   ├── response.js      # ✅ Standardized responses
│   └── logger.js        # ✅ Winston logger
└── server.js        # Application entry point
```

### Layered Architecture

```
Request → Router → Middleware → Controller → Service → Prisma → Database
                                     ↓
                              Response Formatter
```

---

## 📐 Coding Standards

### 1. **Prisma Import** (CRITICAL)

✅ **ALWAYS use this:**

```javascript
import prisma from '../config/prisma.js';
```

❌ **NEVER do this:**

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); // ❌ Creates multiple instances

import prisma from '../prisma.js'; // ❌ Wrong path
import { prisma } from '../server.js'; // ❌ Circular dependency
```

---

### 2. **Service Layer** (Business Logic)

✅ **Correct Pattern:**

```javascript
// src/services/user.service.js
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';

/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} User object
 * @throws {AppError} If user not found
 */
export const getUserService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Create new user
 * @param {Object} data - User data
 * @returns {Promise<Object>} Created user
 */
export const createUserService = async (data) => {
  const { name, email, password } = data;

  // Validate required fields
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  // Check if user exists
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new AppError('User already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  return await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};
```

**Service Rules:**

- ✅ Export named functions (not classes)
- ✅ Add JSDoc comments
- ✅ Throw `AppError` for errors
- ✅ Return data directly (no wrapping in response format)
- ✅ Validate inputs
- ✅ Check if resources exist before operating
- ❌ Never use try/catch (let middleware handle errors)
- ❌ Never send responses (that's controller's job)

---

### 3. **Controller Layer** (Request Handlers)

✅ **Correct Pattern:**

```javascript
// src/controllers/user.controller.js
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as userService from '../services/user.service.js';

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserService(req.params.id);
  sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Public
 */
export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUserService(req.body);
  sendSuccess(res, user, 'User created successfully', undefined, 201);
});

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsersService();
  sendSuccess(res, users, 'Users retrieved successfully', users.length);
});
```

**Controller Rules:**

- ✅ **ALWAYS** wrap with `asyncHandler`
- ✅ Use `sendSuccess` for responses
- ✅ Add JSDoc route documentation
- ✅ Keep thin (just call service + send response)
- ❌ **NEVER** use try/catch
- ❌ **NEVER** put business logic here
- ❌ **NEVER** access Prisma directly

---

### 4. **Router Layer** (Route Definitions)

✅ **Correct Pattern:**

```javascript
// src/routers/user.router.js
import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { z } from 'zod';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
});

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize(['ADMIN']), userController.getAllUsers);

/**
 * @route   POST /api/v1/users
 * @desc    Create user
 * @access  Public
 */
router.post('/', validate(createUserSchema), userController.createUser);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, userController.getUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Own profile only)
 */
router.put('/:id', authenticate, validate(updateUserSchema), userController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.deleteUser);

export default router;
```

**Router Rules:**

- ✅ File naming: `*.router.js`
- ✅ Define validation schemas at top
- ✅ Add route documentation comments
- ✅ Use middleware in this order: `authenticate` → `authorize` → `validate` → `controller`
- ✅ All routes under `/api/v1/*` prefix
- ✅ Use consistent HTTP methods (GET, POST, PUT, DELETE)

---

### 5. **Validation with Zod**

**All validation schemas are organized by entity in `src/validations/` folder.**

✅ **Correct Pattern:**

```javascript
// src/validations/project.validation.js
import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  shortDesc: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(500, 'Short description cannot exceed 500 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(2),
  impactArea: z.string().min(2),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  shortDesc: z.string().min(10).max(500).optional(),
  description: z.string().min(20).optional(),
  status: z
    .enum(['IDEA', 'PROTOTYPE', 'LIVE', 'ARCHIVED'], {
      errorMap: () => ({ message: 'Status must be one of: IDEA, PROTOTYPE, LIVE, ARCHIVED' }),
    })
    .optional(),
});
```

**Import from central export point:**

```javascript
// Always import from validations/index.js
import { createProjectSchema, updateUserSchema } from '../validations/index.js';
import { validate } from '../middlewares/validate.js';

router.post('/', authenticate, validate(createProjectSchema), createProject);
```

**Available Validation Files:**

- `user.validation.js` - User schemas
- `project.validation.js` - Project schemas
- `announcement.validation.js` - Announcement schemas
- `mentorship.validation.js` - Mentorship, sessions, evaluations
- `auth.validation.js` - Authentication schemas
- `highlight.validation.js` - Featured projects
- `vote.validation.js` - Voting schemas
- `common.validation.js` - Shared schemas (pagination, etc.)
- `index.js` - ✅ **Central export point (import from here)**

````

**In Routes:**

```javascript
import { validate } from '../middlewares/validate.js';
import { createProjectSchema } from '../validations/index.js';

router.post('/', authenticate, validate(createProjectSchema), createProject);
````

---

### 6. **Authentication & Authorization**

✅ **Correct Pattern:**

```javascript
import { authenticate, authorize } from '../middlewares/auth.js';

// Public route (no auth)
router.get('/projects', getAllProjects);

// Protected route (must be logged in)
router.post('/projects', authenticate, createProject);

// Role-based access (must be ADMIN)
router.delete('/users/:id', authenticate, authorize(['ADMIN']), deleteUser);

// Multiple roles allowed
router.post('/projects/:id/approve', authenticate, authorize(['ADMIN', 'MENTOR']), approveProject);
```

**Available Roles:**

- `MEMBER` - Regular user
- `MENTOR` - Mentorship privileges
- `ADMIN` - Full access

---

### 7. **Error Handling**

✅ **Correct Pattern:**

```javascript
// In Services - Throw AppError
import { AppError } from '../middlewares/error.js';

if (!user) {
  throw new AppError('User not found', 404);
}

if (project.ownerId !== userId) {
  throw new AppError('Not authorized to update this project', 403);
}

if (!title || !description) {
  throw new AppError('Title and description are required', 400);
}

// Validation errors with details
if (!validationResult.success) {
  throw new AppError('Validation failed', 400, validationResult.error.errors);
}
```

**AppError Signature:**

```javascript
new AppError(message: string, statusCode: number, errors?: array);
```

**Common Status Codes:**

- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error (unexpected errors)

---

### 8. **Response Format**

✅ **Use sendSuccess helper:**

```javascript
import { sendSuccess } from '../utils/response.js';

// Standard success
sendSuccess(res, data, 'Success message');

// With count (for lists)
sendSuccess(res, users, 'Users retrieved', users.length);

// Custom status code (default 200)
sendSuccess(res, newUser, 'User created', undefined, 201);

// No data (for DELETE operations)
sendSuccess(res, null, 'Resource deleted');
```

**Response Structure:**

```json
{
  "success": true,
  "message": "Success message",
  "data": {...},
  "count": 10  // Optional, for lists
}
```

**Error Response (handled by middleware):**

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "errors": [...]  // Optional validation errors
  }
}
```

---

### 9. **Logging**

✅ **Use Winston logger:**

```javascript
import logger, { logInfo, logError, logWarn, logDebug } from '../utils/logger.js';

// Standard logging
logInfo('User created successfully', { userId: user.id });
logError('Database connection failed', { error: error.message });
logWarn('Rate limit approaching', { userId, requestCount });
logDebug('Processing request', { method: req.method, path: req.path });

// Or use logger directly
logger.info('Server started', { port: PORT });
logger.error('Critical error', { error, stack: error.stack });
```

❌ **NEVER use:**

```javascript
console.log('...'); // ❌ Use logger instead
console.error('...'); // ❌ Use logError instead
```

---

### 10. **Naming Conventions**

| Type          | Convention       | Example                                 |
| ------------- | ---------------- | --------------------------------------- |
| **Files**     | kebab-case       | `user.service.js`, `auth.controller.js` |
| **Functions** | camelCase        | `getUserService`, `createProject`       |
| **Classes**   | PascalCase       | `AppError`, `MentorshipService`         |
| **Constants** | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`, `JWT_SECRET`      |
| **Routes**    | kebab-case       | `/api/v1/projects`, `/users/:id`        |
| **Database**  | snake_case       | `created_at`, `user_id`                 |

---

## 🔄 Development Workflow

### 1. **Creating a New Feature**

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Create/modify files in this order:
# - Service layer (business logic)
# - Controller layer (request handlers)
# - Router layer (route definitions)
# - Validation schemas (if needed)

# 3. Format code
npm run format

# 4. Check for errors
npm run lint

# 5. Test your endpoints
# Use Postman, curl, or write tests

# 6. Commit with clear message
git add .
git commit -m "feat: add user profile update endpoint"

# 7. Push and create PR
git push origin feature/your-feature-name
```

### 2. **Commit Message Convention**

```
type(scope): subject

feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, semicolons, etc
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

**Examples:**

```
feat(auth): add password reset functionality
fix(projects): resolve duplicate project creation
docs: update API documentation for users endpoint
refactor(services): standardize error handling
test(auth): add login endpoint tests
```

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```javascript
// tests/integration/auth.test.js
import request from 'supertest';
import app from '../../src/server.js';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Test123!',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
```

---

## 📝 Common Patterns

### Pattern 1: List with Pagination

```javascript
// Service
export const getAllProjectsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count(),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Controller
export const getAllProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await projectService.getAllProjectsService(page, limit);
  sendSuccess(res, result.projects, 'Projects retrieved', result.projects.length);
});
```

### Pattern 2: Search/Filter

```javascript
// Service
export const searchProjectsService = async (filters) => {
  const { title, category, status } = filters;

  const where = {};

  if (title) {
    where.title = { contains: title, mode: 'insensitive' };
  }

  if (category) {
    where.category = category;
  }

  if (status) {
    where.status = status;
  }

  return await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};
```

### Pattern 3: File Upload

```javascript
// Router
import { upload } from '../middlewares/upload.js';

router.post('/users/:id/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// Controller
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const user = await userService.updateAvatarService(
    req.params.id,
    req.file.path // Cloudinary URL
  );

  sendSuccess(res, user, 'Avatar uploaded successfully');
});
```

---

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create/apply migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed test data
npm run prisma:reset     # Reset database (⚠️ deletes data)
npm run db:setup         # Full setup (generate + migrate + seed)

# Docker
npm run docker:up        # Start Postgres container
npm run docker:down      # Stop Postgres container

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

---

## 🐛 Troubleshooting

### "Prisma Client not found"

```bash
npm run prisma:generate
```

### "Database connection failed"

```bash
# Check if Postgres is running
npm run docker:up

# Verify DATABASE_URL in .env
# Should be: postgresql://user:password@localhost:5432/gdg_impact_hub
```

### "Port already in use"

```bash
# Change PORT in .env
PORT=3001

# Or kill the process using the port (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Validation failed" in tests

```bash
# Make sure test database is clean
npm run prisma:reset
npm run prisma:seed
```

---

## ✅ Pre-Commit Checklist

Before committing your code:

- [ ] Code formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] All new files follow naming conventions
- [ ] Services use `AppError` for errors
- [ ] Controllers use `asyncHandler`
- [ ] Routes have validation middleware
- [ ] JSDoc comments added
- [ ] Tested endpoints manually or with tests
- [ ] No `console.log` (use `logger`)
- [ ] Prisma imported from `config/prisma.js`

---

## 🎯 Quick Reference

### Import Cheatsheet

```javascript
// ✅ Correct imports
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import logger from '../utils/logger.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
```

### File Creation Order

1. **Service** (`services/*.service.js`)
2. **Controller** (`controllers/*.controller.js`)
3. **Router** (`routers/*.router.js`)
4. **Validation** (`validations/*.validation.js`)

### Testing Credentials

After running `npm run db:setup`:

```
Admin:  admin@gdg.dev   | Admin123!
Mentor: mentor@gdg.dev  | Mentor123!
Member: member@gdg.dev  | Member123!
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Zod Documentation](https://zod.dev)
- [Winston Logging](https://github.com/winstonjs/winston)

---

## 🤝 Getting Help

- Check existing code for examples
- Read error messages carefully
- Search GitHub issues
- Ask in team chat

---

**Happy Coding! 🚀**
