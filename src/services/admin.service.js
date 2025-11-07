import prisma from '../config/db.js'

// User management
export const setUserRoleService = async (userId, role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  })
}

export const approveMentorService = async (id) => {
  const user = await prisma.user.update({
    where: { id },
    data: { role: 'MENTOR' }
  })

  const existing = await prisma.mentorshipProfile.findUnique({
    where: { id }
  })

  if (!existing) {
    await prisma.mentorshipProfile.create({
      data: {
        id,
        bio: `Mentor profile for ${user.name}`,
        skills: [],
        availability: true,
        hourlyCapacity: 0
      }
    })
  } else {
    // ensures the availability of the mentor
    await prisma.mentorshipProfile.update({
      where: { id },
      data: { availability: true }
    })
  }

  return prisma.user.findUnique({ where: { id }, include: { mentorshipProfile: true }  })
}

// Project management
export const setProjectStatusService = async (id, status) => {
  return await prisma.project.update({
    where: { id },
    data: { status }
  })
}

export const archiveProjectService = async (id) => {
  return prisma.project.update({
    where: { id },
    data: { status: 'ARCHIVED', archivedAt: new Date() }
  })
}