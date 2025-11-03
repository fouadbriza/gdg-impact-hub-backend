import { deleteFromCloudinary } from "../middlewares/upload.js"
import prisma from "../prisma.js"

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
  const allowedFields = [
    "name",
    "bio",
    "avatarUrl",
    "githubHandle",
    "linkedinUrl",
  ]

  const updateData = Object.keys(reqBody)
  .filter((key) => allowedFields.includes(key))
  .reduce((obj, key) => {
    obj[key] = reqBody[key]
    return obj
  }, {})

  // check if there's is any valid fields provided
  if (Object.keys(updateData).length === 0) {
    const error = new Error('No valid fields provided for updates')
    error.statusCode = 400
    throw error
  }

  const updatedUser = await prisma.user.update({
    where: { id: reqId },
    data: reqBody,
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