import e from "express";
import { approveMentor, setUserRole } from "../controllers/admin.controller.js";

const adminRouter = e.Router()

// User management
adminRouter.put('/users/:id/role', setUserRole)
adminRouter.post('/users/:id/approve-mentor', approveMentor)

// Project management
adminRouter.put('/projects/:id/status', approveProject)
adminRouter.post('/projects/:id/archive', suspendProject)

export default adminRouter