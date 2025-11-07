import express from 'express';
import authRoutes from './auth.routes.js';
import userRouter from './user.router.js';
import projectRouter from './project.router.js';
import mentorshipRoutes from './mentorship.routes.js';
import announcementRouter from './announcement.router.js';
import votesRouter from './votes.router.js';
import highlightRouter from './highlight.router.js';
import oauthRoutes from "./oauth.routes.js";
import passwordordRoutes from "./password.routes.js";

const router = express.Router();

// Mount all routes under /api/v1
router.use('/auth', authRoutes);
router.use('/users', userRouter);
router.use('/projects', projectRouter);
router.use('/mentorship', mentorshipRoutes);
router.use('/announcements', announcementRouter);
router.use('/votes', votesRouter);
router.use('/highlights', highlightRouter);
router.use("/oauth", oauthRoutes);
router.use("/password", passwordordRoutes);

export default router;
