import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const addProjectService = async (title,description,category,impactArea,mentorId) => {
  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (impactArea !== undefined) data.impactArea = impactArea;
  if (mentorId !== undefined) data.mentorId = mentorId;
  data.status ="PENDING"
  
    const newProject = await prisma.project.create({
    data: data
  });
  return newProject;
};

//
export const readProjectService = async (id) => {
  const project = await prisma.project.findUnique({
    where: {
      ...(id && { id }),
    },
  });
  return project;
};

//
export const deleteProjectService = async (id) => {
  const deleted = await prisma.project.delete({
    where: { id: id },
  });
  return deleted;
};

//
export const editProjectService = async (id,title,description,category,impactArea,mentorId) => {
  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (impactArea !== undefined) data.impactArea = impactArea;
  if (mentorId !== undefined) data.mentorId = mentorId;

  const editedProject = await prisma.project.update({
    where: { id: id },
    data: data,
  });
  return editedProject;
};

//
export const searchProjectsService = async (title,category,impactArea,mentorId) => {
  const projects = await prisma.project.findMany({
    where: {
      ...(title && {
        title: { contains: title, mode: "insensitive" },
      }),
      ...(category && { category }),
      ...(impactArea && { impactArea }),
      ...(mentorId && { mentorId }),
    },
    orderBy: { createdAt: "desc" },
  });
  return projects;
};

export const approveProjectService = async (id) => {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: "APPROVED",
      },
    });
    return(updated);
}


export const denyProjectService = async (id) => {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: "DENIED",
      },
    });
    return(updated);
}

export const addMemberService = async (userid,projectid,role) => {
  const record = await prisma.teamMember.create({
  data: {
    userId: userid,
    projectId: projectid,
    role: role,
  },
});
return record

}


export const removeMemberService = async (teamMemberId) => {
  const record = await prisma.teamMember.delete({
  where: { id: teamMemberId },
});

return record 

}