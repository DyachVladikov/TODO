import Folder from "../models/Folders.js";

export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.userId });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const folder = await Folder.create({
      name,
      userId: req.userId,
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    await Folder.findOneAndDelete({ _id: id, userId: req.userId });
    res.status(200).json({ message: "Folder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
