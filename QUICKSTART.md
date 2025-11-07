# 🚀 Quick Start Guide - GDG Impact Hub Backend

## Setup (5 minutes)

```bash
# 1. Clone and install
git clone <repo-url>
cd gdg-impact-hub-backend
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start database
npm run docker:up

# 4. Setup database (migrate + seed)
npm run db:setup

# 5. Start server
npm run dev
```

**Test:** http://localhost:3000/health

---

## 📖 Code Patterns Cheat Sheet

### ✅ Import Prisma

```javascript
import prisma from '../config/prisma.js';
```

### ✅ Service (Business Logic)

```javascript
import { AppError } from '../middlewares/error.js';

export const getUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
```

### ✅ Controller (Route Handler)

```javascript
import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json({ success: true, data: user });
});
```

### ✅ Route (Protected)

```javascript
import { authenticate, authorize } from '../middlewares/auth.js';

router.get('/', authenticate, getAllUsers);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteUser);
```

### ✅ Validation (Zod)

```javascript
// Define in src/validations/user.validation.js
import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

// Import in router from central export
import { updateUserSchema } from '../validations/index.js';
import { validate } from '../middlewares/validate.js';

router.put('/:id', authenticate, validate(updateUserSchema), updateUser);
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm start                # Production start

# Database
npm run prisma:studio    # Open DB GUI
npm run prisma:seed      # Add test data
npm run db:setup         # Full setup

# Code Quality
npm run format           # Auto-format code
npm run lint:fix         # Fix linting errors

# Docker
npm run docker:up        # Start Postgres
npm run docker:down      # Stop Postgres
```

---

## 🧪 Test Users

```
Admin:   admin@gdg.dev   | Admin123!
Mentor:  mentor@gdg.dev  | Mentor123!
Member:  member@gdg.dev  | Member123!
```

---

## 🏗️ Project Structure

```
src/
├── config/          # Prisma, env, passport, cloudinary
├── middlewares/     # auth.js, error.js, validate.js, upload.js
├── controllers/     # Route handlers (use asyncHandler)
├── services/        # Business logic (throw AppError)
├── routers/         # Route definitions (*.router.js)
├── validations/     # Zod schemas organized by entity
│   ├── index.js    # ✅ Central export (import from here)
│   ├── user.validation.js
│   ├── project.validation.js
│   ├── auth.validation.js
│   └── ...
└── utils/           # asyncHandler, logger, response helpers
```

---

## 🆘 Troubleshooting

**"Prisma Client not found"**

```bash
npm run prisma:generate
```

**"Port already in use"**

```bash
# Change PORT in .env
PORT=3001
```

**"Cannot connect to database"**

```bash
npm run docker:up
# Check DATABASE_URL in .env
```

---

## 📚 Full Docs

- Architecture: `docs/CONTRIBUTING.md`
- Phase 1 Changes: `docs/PHASE1_SUMMARY.md`
