import express from 'express'
import { deleteUser, getAllUsers, getUser, updateUser } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/', getAllUsers)

userRouter.get('/:id', getUser)

userRouter.put('/:id', updateUser)

userRouter.delete('/:id', deleteUser)