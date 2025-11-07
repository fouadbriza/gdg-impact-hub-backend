import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const addAnnouncementService = async (title,content,authorId) => {
  const data = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (authorId !== undefined) data.authorId = authorId; 
    const newAnnouncement = await prisma.announcement.create({
    data: data
  });
  return newAnnouncement;
}


export const readAnnouncementService = async (id) => {
  const announcement = await prisma.announcement.findUnique({
    where: {id}});
  return announcement;
}

export const deleteAnnouncementService = async (id) => {
  const deleted = await prisma.announcement.delete({
    where: { id: id },
  });
  return deleted;
}

export const editAnnouncementService = async (id,title,content,authorId) => {
  const data = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (authorId !== undefined) data.authorId = authorId; 
    const editedAnnouncement = await prisma.announcement.update({ 
    where: { id: id },
    data: data,
  });
  return editedAnnouncement;
}