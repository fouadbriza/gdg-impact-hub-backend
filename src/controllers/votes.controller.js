import { addVoteService, removeVoteService, retrieveCountsService } from "../services/votes.service.js"

export const retrieveCounts = async (req, res) => {
  try {
    const { projectId } = req.params
    const count = await retrieveCountsService(projectId)
    res.status(200).json({ projectId, votes: count })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the vote count", details: error.message })
  }
}

export const addVote = async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user.id
    const result = await addVoteService(projectId, userId)
    res.status(200).json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: "unable to add the vote", details: error.message })
  }
}

export const removeVote = async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user.id
    const result = await removeVoteService(projectId, userId)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}