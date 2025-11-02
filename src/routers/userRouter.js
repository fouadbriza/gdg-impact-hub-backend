import express from 'express'

const userRouter = express.Router()

userRouter.get('/')

userRouter.get('/:id')

userRouter.put('/:id')

userRouter.delete('/:id')