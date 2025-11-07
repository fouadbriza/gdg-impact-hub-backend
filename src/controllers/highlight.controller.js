import {
  approveFeaturedProjectService,
  deleteFeaturedProjectService,
  getAllHighlightsService,
} from '../services/highlight.service.js';

export const approveFeaturedProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason, expiresAt } = req.body;

    if (!reason) {
      res.status(400).json({ message: 'Reason is required' });
    }

    const highlight = await approveFeaturedProjectService(
      projectId,
      reason,
      req.user.userId,
      expiresAt
    );

    res.status(201).json({ message: 'Project successfully featured', highlight });
  } catch (error) {
    res.status(500).json({ error: 'Failed to feature project', details: error.message });
  }
};

export const deleteFeaturedProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    await deleteFeaturedProjectService(projectId);

    res.status(200).json({ message: 'Highlight removed and project un-featured' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove highlight', details: error.message });
  }
};

export const getHighlights = async (req, res) => {
  try {
    const highlights = await getAllHighlightsService();
    res.status(200).json({ highlights });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load highlights', details: error.message });
  }
};
