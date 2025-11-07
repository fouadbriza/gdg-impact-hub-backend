import { addAnnouncementService, readAnnouncementService, deleteAnnouncementService, editAnnouncementService } from '../services/announcementsService.js';

const addAnnouncement = async (req,res) => {
const { title,content,authorId } = req.body;

try {
const newAnnouncement = await addAnnouncementService(title,content,authorId);
res.status(201).json({message :"announcement added",newAnnouncement}); 
} catch (err) { res.status(500).json({ error: "Failed to add announcement"}); }

}

const readAnnouncement = async (req,res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }
    try {  
    const announcement = await readAnnouncementService(id);
    res.status(200).json(announcement);
    } catch (err) { res.status(500).json({ error: "Failed to read announcement"}); }
}

const deleteAnnouncement = async (req,res) => {
    try {
    const { id } = req.params;
    const deleted = await deleteAnnouncementService(id);
    res.status(200).json({ message: "announcement deleted", deleted });
    } catch (err) { res.status(500).json({ error: "Failed to delete announcement"}); }

} 
const editAnnouncement = async (req,res) => {
    const { id } = req.params;
    const { title,content,authorId } = req.body;
    try {  
    const editedAnnouncement = await editAnnouncementService(id,title,content,authorId);
    res.status(200).json({message :"announcement edited",editedAnnouncement});
    } catch (err) { res.status(500).json({ error: "Failed to edit announcement"}); }    


}