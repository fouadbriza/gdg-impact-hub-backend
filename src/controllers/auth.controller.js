// src/controllers/auth.controller.js
import {
  registerUserService,
  loginUserService,
  getCurrentUserService,
} from '../services/auth.service.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { user, token } = await registerUserService(req.body);

      res.status(201).json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { user, token } = await loginUserService(req.body);

      res.json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await getCurrentUserService(req.user.id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  logout(req, res) {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Logged out successfully' });
  }
}

export default new AuthController();
