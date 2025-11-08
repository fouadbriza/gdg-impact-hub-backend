import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import cacheService from '../services/cache.service.js';
import githubService from '../services/github.service.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

// Google OAuth Callback
export function googleLogin(req, res) {
  const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ');

  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  res.redirect(url);
}

//Callback Google
export async function googleCallback(req, res) {
  const code = req.query.code;

  if (!code) return res.status(400).json({ message: 'No code provided' });

  try {
    // get token
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // eslint-disable-next-line no-unused-vars
    const { access_token, id_token } = tokenRes.data;

    // get user info
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // eslint-disable-next-line no-unused-vars
    const { email, name, picture, sub: googleId } = userRes.data;

    // create or get user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          role: 'MEMBER',
          avatarUrl: picture,
        },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Google OAuth failed' });
  }
}

// github OAuth Login
export async function githubLogin(req, res) {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=user:email`;
  res.redirect(githubAuthUrl);
}

// Callback GitHub après autorisation
export async function githubCallback(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).json({ message: 'Code not provided' });

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(400).json({ message: 'Failed to get access token' });

    // Use GitHub service to fetch user data with caching
    const githubUser = await githubService.getGitHubUser(accessToken);

    // Use GitHub service to fetch user emails with caching
    const emails = await githubService.getGitHubUserEmails(accessToken);

    // select primary verified email
    let primaryEmail = emails.find((e) => e.primary && e.verified)?.email;

    if (!primaryEmail && githubUser.email) {
      primaryEmail = githubUser.email;
    }

    if (!primaryEmail) {
      return res
        .status(400)
        .json({
          message:
            'No verified email found. Ensure your GitHub account has a verified email or allowed access to private emails.',
        });
    }

    // Verify if user exists or create new
    let user = await prisma.user.findUnique({ where: { email: primaryEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: githubUser.name || githubUser.login,
          email: primaryEmail,
          role: 'MEMBER',
          avatarUrl: githubUser.avatar_url,
          githubHandle: githubUser.login,
        },
      });
    }

    // Cache the user data in our system too (if needed)
    const userCacheKey = cacheService.generateKey('GITHUB_USER', user.id);
    await cacheService.set(
      userCacheKey,
      user,
      cacheService.getTTL('GITHUB_USER')
    );

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
