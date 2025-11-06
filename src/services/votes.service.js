import prisma from '../config/db.js'

export const retrieveCountsService = async (projectId) => {
  const count = await prisma.vote.count({
    where: { projectId }
  })
  return count
}

export const addVoteService = async (projectId, userId) => {
  const existedVote = await prisma.vote.findUnique({
    where: { projectId_userId: {projectId, userId} }
  })

  if (existedVote) {
    const error = new Error('Already voted')
    error.statusCode = 400
    throw error
  }

  await prisma.vote.create({
    data: { projectId, userId }
  })

  return { message: "Vote added" }
}

export const removeVoteService = async (projectId, userId) => {
  await prisma.vote.delete({
    where: { projectId_userId: { projectId, userId } }
  })

  return { message: "Vote deleted" }
}