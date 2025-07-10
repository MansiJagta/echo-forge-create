const express = require('express');
const router = express.Router();
const { supabase } = require('../src/integrations/supabase/client.node');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and API key management
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth sign-in
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google sign-in
 */
router.get('/google', async (req, res) => {
  const redirectTo = req.query.redirectTo || 'http://localhost:3000';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) return res.status(500).json({ error: error.message });
  res.redirect(data.url);
});

/**
 * @swagger
 * /api/auth/session:
 *   post:
 *     summary: Store user session info (API keys, login info)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               api_key:
 *                 type: string
 *               provider:
 *                 type: string
 *             required:
 *               - user_id
 *               - api_key
 *     responses:
 *       201:
 *         description: Session info stored
 *       400:
 *         description: Invalid input
 */
router.post('/session', async (req, res) => {
  const { user_id, api_key, provider } = req.body;
  if (!user_id || !api_key) {
    return res.status(400).json({ error: 'user_id and api_key are required' });
  }
  // Store in a table called 'user_api_keys' (create in Supabase if not exists)
  const { data, error } = await supabase.from('user_api_keys').insert([{ user_id, api_key, provider }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

/**
 * @swagger
 * /api/auth/session/{user_id}:
 *   get:
 *     summary: Get stored API keys and login info for a user
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User session info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                 api_key:
 *                   type: string
 *                 provider:
 *                   type: string
 *       404:
 *         description: Not found
 */
router.get('/session/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase.from('user_api_keys').select('*').eq('user_id', user_id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

module.exports = router;