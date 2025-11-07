import e from "express";
import { approveFeaturedProject, deleteFeaturedProject, getHighlights } from "../controllers/highlight.controller.js";

const highlightRouter = e.Router()

highlightRouter.get('/', getHighlights)
highlightRouter.post('/:id', approveFeaturedProject)
highlightRouter.delete('/:id', deleteFeaturedProject)

export default highlightRouter