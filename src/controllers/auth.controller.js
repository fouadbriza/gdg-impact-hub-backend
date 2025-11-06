// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role = 'MEMBER' } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Hash password with debug logging
      console.log('Original password:', password);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('Hashed password:', hashedPassword);

      // Create user with password hash
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log('Login attempt for email:', email);
      console.log('Provided password:', password);

      // Find user with password hash
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          role: true
        }
      });

      console.log('Found user:', user ? 'Yes' : 'No');
      if (user) {
        console.log('Stored hash:', user.passwordHash);
      }

      if (!user || !user.passwordHash) {
        console.log('User not found or missing password hash');
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      console.log('Comparing password with hash...');
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('Password match:', isMatch);
      if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
