import express from 'express';
const router = express.Router();
const {addAnouncement ,readAnouncement ,deleteAnouncement ,editAnouncement} = require('../controllers/anouncementsController')


router.get("/",readAnouncement);
router.post("/",addAnouncement);
router.delete("/",deleteAnouncement);
router.put("/",editAnouncement);

export default router;