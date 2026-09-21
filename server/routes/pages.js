import path from 'node:path';
import { Router } from 'express';
import { config } from '../config.js';
import { attachUser } from '../middleware.js';

const sendPage = (res, file) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(config.publicDir, file));
};

const router = Router();

router.get(['/', '/index.html'], attachUser, (req, res) => {
  if (!req.user) return res.redirect('/login.html');
  sendPage(res, 'index.html');
});

router.get('/login.html', attachUser, (req, res) => {
  if (req.user) return res.redirect('/');
  sendPage(res, 'login.html');
});

export default router;
