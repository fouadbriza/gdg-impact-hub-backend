import e from "express";
import { addVote, removeVote, retrieveCounts } from "../controllers/votes.controller.js";

const votesRouter = e.Router()

votesRouter.get('/:id', retrieveCounts)
votesRouter.post('/:id', addVote)
votesRouter.delete('/:id', removeVote)

export default votesRouter