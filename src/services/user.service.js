import { deleteFromCloudinary } from "../middlewares/upload.js"
import prisma from "../config/db.js"
import updateUserSchema from "../validations/user.validation.js"

export const getAllUsersService = async () => {
  return await prisma.user.findMany(
    { select: { id: true, name: true, email: true, role: true, bio: true,createdAt: true }}
  )
}

export const getUserService = async (reqId) => {
  const user = await prisma.user.findUnique({
    where: { id: reqId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      githubHandle: true,
      linkedinUrl: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  return user
}

export const updateUserService = async (reqId, reqBody) => {
  const validationResult = updateUserSchema.safeParse(reqBody)

  if (!validationResult.success) {
    const error = new Error('Validation failed')
    error.statusCode = 400
    error.details = validationResult.error
    throw error
  }

  const validatedData = validationResult.data

  const updatedUser = await prisma.user.update({
    where: { id: reqId },
    data: validatedData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      githubHandle: true,
      linkedinUrl: true,
      updatedAt: true,
    }
  })

  return updatedUser
}

export const updateAvatarService = async (reqId, avatarUrl) => {
  const user = await prisma.user.findUnique({
    where: { id: reqId },
    select: { avatarUrl: true }
  })

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  // delete the older profile picture if it exists in cloudinary
  if (user.avatarUrl) {
    try {
      await deleteFromCloudinary(user.avatarUrl)
    } catch (error) {
      console.error('Failed to delete old avatar:', error.message)
    }
  }

  const updatedUser = await prisma.user.update({
    where: {id: reqId},
    data: { avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      githubHandle: true,
      linkedinUrl: true,
      updatedAt: true,
    }
  })

  return updatedUser
}

export const deleteUserService = async (reqId) => {
  await prisma.user.delete({ where: { id: reqId } })

  return { message: 'User deleted successfully' }
}