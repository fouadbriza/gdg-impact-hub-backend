import express from 'express';
const router = express.Router();
const {addAnouncement ,readAnouncement ,deleteAnouncement ,editAnouncement} = require('../controllers/anouncementsController')


router.get("/read/:id",readAnouncement);
router.post("/add",addAnouncement);
router.delete("/delete/:id",deleteAnouncement);
router.put("/edit/:id",editAnouncement);

export default router;