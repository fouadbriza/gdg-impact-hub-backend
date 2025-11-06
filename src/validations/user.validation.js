import z from "zod";

const updateUserSchema = z.object({
  name: z.string().max(50).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubHandle: z.string().regex(/^([A-Za-z0-9_-]+)$/)
})

export default updateUserSchema