import express from 'express'
import { deleteUser, getAllUsers, getUser, updateUser, uploadAvatar } from '../controllers/userController.js'
import { upload } from '../middlewares/upload.js'

const userRouter = express.Router()

userRouter.get('/', getAllUsers)

userRouter.get('/:id', getUser)

userRouter.put('/:id', updateUser)

userRouter.delete('/:id', deleteUser)

//Cloudinary uploads route
userRouter.put('/:id/avatar', upload.single('avatar'), uploadAvatar)

export default userRouter