import { retrieveCountsService } from "../services/votes.service.js"

export const retrieveCounts = async (req, res) => {
  try {
    const { projectId } = req.params
    const count = await retrieveCountsService(projectId)
    res.status(200).json({ projectId, votes: count })
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: "Failed to fetch the vote count", details: error.message })
  }
}

export const addVote = async () => {
  
}

export const removeVote = async () => {
  
}