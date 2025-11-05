import prisma from '../config/prisma.js'

export const retrieveCountsService = async (projectId) => {
  const count = await prisma.vote.count({
    where: { projectId }
  })
  return count
}

export const addVoteService = async () => {

}

export const removeVoteService = async () => {

}