import {
  deleteUserService,
  getAllUsersService,
  getUserService,
  updateAvatarService,
  updateUserService,
} from "../services/user.service.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({ users });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await getUserService(req.params.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateUserService(req.params.id, req.body);
    res.status(200).json({ updatedUser });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await deleteUserService(req.params.id);
    res.status(200).json({ deletedUser });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    console.log("File received:", req.file);
    console.log("Params:", req.params);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedUser = await updateAvatarService(req.params.id, req.file.path);
    res.status(200).json({
      message: "Avatar updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
};
