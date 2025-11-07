import express from 'express';
import userRouter from './user.router.js';
import votesRouter from './votes.router.js';
import highlightRouter from './highlight.router.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/votes', votesRouter);
router.use('/highlights', highlightRouter);

export default router;
