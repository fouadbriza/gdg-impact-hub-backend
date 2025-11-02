import { deleteUserService, getAllUsersService, getUserService, updateUserService } from "../services/userService.js"

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService()
    res.status(200).json({ users })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await getUserService(req.params.id)
    res.status(200).json({ user })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateUserService(req.params.id, req.body)
    res.status(200).json({ updatedUser })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await deleteUserService(req.params.id)
    res.status(200).json({ deletedUser })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
}