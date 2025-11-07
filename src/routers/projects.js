import express from 'express'
import {addProject ,readProject ,deleteProject ,editProject, searchProjects,approveProject,denyProject} from '../controllers/projectsController'
import isAdmin from '../middlewares/isAdmin';
import authenticateJWT from '../middlewares/authenticateJWT'
const router = express.Router();

//single operation routes
router.get("/",readProject);
router.post("/",addProject);
router.delete("/",deleteProject);
router.put("/",editProject);

//admin approve or deny project routes
router.patch("/:id/approve", authenticateJWT, isAdmin, approveProject);
router.patch("/:id/deny", authenticateJWT, isAdmin, denyProject);



//multiple search route with filters
router.get("/search",searchProjects);

export default router