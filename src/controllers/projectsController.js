import {readProjectService,searchProjectsService,editProjectService,addProjectService,deleteProjectService, acceptProjectService,approveProjectService,denyProjectService} from "../services/projectService.js";

export const addProject = async (req, res) => {
const { title, description, category, impactArea, mentorId } = req.body;
try {
const newProject = await addProjectService(title, description, category, impactArea, mentorId);
res.status(201).json({message :"project added",newProject});
} catch (err) { res.status(500).json({ error: "Failed to add project"}); }

};

//
export const readProject = async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }
 try {
  const project = await readProjectService(id);
  res.status(200).json(project);
    } catch (err) { res.status(500).json({ error: "Failed to read project"}); }
};

//
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProjectService(id);
    res.status(200).json({ message: "project deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project"});
  }
};

//
export const editProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, impactArea, mentorId } = req.body;
  try {
  const editedProject = await editProjectService(id, title, description, category, impactArea, mentorId);
  res.status(200).json({message :"project edited",editedProject});
    } catch (err) { res.status(500).json({ error: "Failed to edit project"}); }
};

//
export const searchProjects = async (req,res) => {
  const { title, category, impactArea, mentorId } = req.query;
    try {
  const projects = await searchProjectsService(title, category, impactArea, mentorId);
  res.status(200).json(projects);
    } catch (err) { res.status(500).json({ error: "Failed to search projects"}); }
};


export const approveProject = async (req,res) => {
try {
  const id = req.params.id;
  const updated = await approveProjectService(id)
    res.status(200).json({ message: "Project approved", project: updated });


}catch(error) {
     res.status(500).json({ error: "Failed to approve project", details: error.message });
}}



export const denyProject = async (req,res) => {
try {
  const id = req.params.id;
  const updated = await denyProjectService(id)
    res.status(200).json({ message: "Project denied", project: updated });


}catch(error) {
     res.status(500).json({ error: "Failed to deny project", details: error.message });
}}