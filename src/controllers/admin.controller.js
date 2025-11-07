import { archiveProjectService, setProjectStatusService, setUserRoleService } from "../services/admin.service.js"


// User Management

// PUT /users/:id/role
export const setUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const user = await setUserRoleService(id, role)

    res.status(200).json({ message: 'User status updated', user })
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user', details: error.message })
  }
}

// POST /users/:id/approve-mentor
export const approveMentor = async (req, res) => {
  try {
    const { id } = req.params
    const user = await approveMentorService(id)
    return res.status(200).json({ message: "User promoted to MENTOR and profile ensured", user })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// Project Management

// PUT /projects/:id/status
export const setProjectStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const project = await setProjectStatusService(id, status)

    res.status(200).json(project)
  } catch (error) {
    res.status(500).json({ error: "Failed to set project's status", details: error.message })
  }
}

// POST /projects/:id/archive
export const archiveProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await archiveProjectService(id)
    return res.status(200).json({ message: "Project archived", project })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}