import express from 'express'
import userRouter from './user.router.js'
import votesRouter from './votes.router.js'

const router = express.Router()

router.use('/users', userRouter)
router.use('/votes', votesRouter)


export default router