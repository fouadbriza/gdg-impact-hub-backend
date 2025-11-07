import express from 'express'
import {addProject ,readProject ,deleteProject ,editProject, searchProjects,approveProject,denyProject,addMember,removeMember} from '../controllers/projectsController'
import isAdmin from '../middlewares/isAdmin';
import authenticateJWT from '../middlewares/authenticateJWT'
const router = express.Router();

//single operation routes
router.get("/read/:id",readProject);
router.post("/add",addProject);
router.delete("/delete/:id",deleteProject);
router.put("/edit/:id",editProject);

//admin approve or deny project routes
router.patch("/:id/approve", authenticateJWT, isAdmin, approveProject);
router.patch("/:id/deny", authenticateJWT, isAdmin, denyProject);



//multiple search route with filters
router.get("/search",searchProjects);


//add remove user from project
router.patch('/api/team-members/add',addMember);
router.patch('/api/team-members/remove',removeMember);

export default router