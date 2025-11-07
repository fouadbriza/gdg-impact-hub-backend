import e from "express";
import { approveMentor, archiveProject, setProjectStatus, setUserRole } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const adminRouter = e.Router()

// User management
adminRouter.put('/users/:id/role',authenticate, authorize(["ADMIN"]), setUserRole)
adminRouter.post('/users/:id/approve-mentor',authenticate, authorize(["ADMIN"]), approveMentor)

// Project management
adminRouter.put('/projects/:id/status',authenticate, authorize(["ADMIN"]), setProjectStatus)
adminRouter.post('/projects/:id/archive',authenticate, authorize(["ADMIN"]), archiveProject)

export default adminRouter