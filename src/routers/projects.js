import express from 'express'
import {addProject ,readProject ,deleteProject ,editProject, searchProjects} from '../controllers/projectsController'

const router = express.Router();

//single operation routes
router.get("/",readProject);
router.post("/",addProject);
router.delete("/",deleteProject);
router.put("/",editProject);

//multiple search route with filters
router.get("/search",searchProjects);

export default router