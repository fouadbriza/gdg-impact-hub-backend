import { prisma } from "../server.js"

export const getAllHighlightsService = async () => {
  return await prisma.project.findMany({
    where: { featured: true },
    include: {
      highlights: {
        orderBy: { featuredAt: "desc" },
        take: 1
      }
    }
  })
}

export const approveFeaturedProjectService = async (projectId, reason, featuredBy, expiresAt) => {
  // Mark the project as featured
  await prisma.project.update({
    where: {id: projectId},
    data: { featured: true }
  })

  return await prisma.highlight.create({
    data: {
      projectId,
      reason, 
      featuredBy,
      expiresAt
    }
  })
}

export const deleteFeaturedProjectService =  async (projectId) => {
  // unmark the project
  await prisma.project.update({
    where: { id: projectId },
    data: { featured: false }
  })

  return await prisma.highlight.updateMany({
    where: { projectId },
    data: { expiresAt: new Date() }
  })
}