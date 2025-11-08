import cacheService from './cache.service.js';
import logger from '../utils/logger.js';

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
  }

  /**
   * Fetch and cache GitHub user data
   * @param {string} accessToken - GitHub access token
   * @returns {Promise<Object>} GitHub user data
   */
  async getGitHubUser(accessToken) {
    try {
      // Create cache key based on access token (hashed for security)
      const tokenHash = this.hashString(accessToken);
      const cacheKey = `github:user:token:${tokenHash}`;

      // Try to get from cache first
      let githubUser = await cacheService.get(cacheKey);
      
      if (githubUser) {
        logger.debug('GitHub user data retrieved from cache', { cacheKey });
        return githubUser;
      }

      // If not in cache, fetch from GitHub API
      const response = await fetch(`${this.baseURL}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      githubUser = await response.json();

      // Cache the result
      await cacheService.set(
        cacheKey,
        githubUser,
        cacheService.getTTL('GITHUB_USER')
      );

      logger.info('GitHub user data fetched and cached', { 
        cacheKey, 
        login: githubUser.login 
      });

      return githubUser;
    } catch (error) {
      logger.error('Error fetching GitHub user', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetch and cache GitHub user emails
   * @param {string} accessToken - GitHub access token
   * @returns {Promise<Array>} GitHub user emails
   */
  async getGitHubUserEmails(accessToken) {
    try {
      const tokenHash = this.hashString(accessToken);
      const cacheKey = `github:emails:token:${tokenHash}`;

      // Try to get from cache first
      let emails = await cacheService.get(cacheKey);
      
      if (emails) {
        logger.debug('GitHub emails retrieved from cache', { cacheKey });
        return emails;
      }

      // If not in cache, fetch from GitHub API
      const response = await fetch(`${this.baseURL}/user/emails`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      emails = await response.json();

      // Cache the result for a shorter time as emails might change
      await cacheService.set(
        cacheKey,
        emails,
        cacheService.getTTL('SHORT') // 5 minutes
      );

      logger.info('GitHub emails fetched and cached', { cacheKey, count: emails.length });

      return emails;
    } catch (error) {
      logger.error('Error fetching GitHub emails', { error: error.message });
      throw error;
    }
  }

  /**
   * Fetch and cache GitHub repository data
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} accessToken - GitHub access token (optional)
   * @returns {Promise<Object>} GitHub repository data
   */
  async getGitHubRepo(owner, repo, accessToken = null) {
    try {
      const cacheKey = `github:repo:${owner}:${repo}`;

      // Try to get from cache first
      let repoData = await cacheService.get(cacheKey);
      
      if (repoData) {
        logger.debug('GitHub repo data retrieved from cache', { cacheKey });
        return repoData;
      }

      // If not in cache, fetch from GitHub API
      const headers = {
        Accept: 'application/json',
      };
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      repoData = await response.json();

      // Cache the result
      await cacheService.set(
        cacheKey,
        repoData,
        cacheService.getTTL('LONG') // 24 hours for repo data
      );

      logger.info('GitHub repo data fetched and cached', { 
        cacheKey, 
        repo: `${owner}/${repo}` 
      });

      return repoData;
    } catch (error) {
      logger.error('Error fetching GitHub repo', { 
        owner, 
        repo, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Hash a string for cache key security
   * @param {string} str - String to hash
   * @returns {string} Hashed string
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Clear GitHub-related cache for a specific user
   * @param {string} githubLogin - GitHub username/login
   */
  async clearUserCache(githubLogin) {
    const patterns = [
      `github:user:${githubLogin}`,
      `github:user:token:*`,
      `github:emails:token:*`
    ];

    let totalCleared = 0;
    for (const pattern of patterns) {
      const cleared = await cacheService.deletePattern(pattern);
      totalCleared += cleared;
    }

    logger.info('GitHub user cache cleared', { githubLogin, totalCleared });

    return totalCleared;
  }
}

export default new GitHubService();