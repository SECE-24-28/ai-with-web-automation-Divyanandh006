import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(auth);

router.get('/', (req, res) => {
  const chats = db.prepare(`
    SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC
  `).all(req.user.id);
  res.json(chats);
});

router.post('/', (req, res) => {
  const id = uuidv4();
  const { title = 'New Chat' } = req.body;
  
  db.prepare(`INSERT INTO chats (id, title, user_id) VALUES (?, ?, ?)`).run(id, title, req.user.id);
  const chat = db.prepare(`SELECT * FROM chats WHERE id = ?`).get(id);
  res.status(201).json(chat);
});

router.patch('/:id', (req, res) => {
  const { title } = req.body;
  const chatId = req.params.id;

  // Check ownership
  const chat = db.prepare(`SELECT * FROM chats WHERE id = ? AND user_id = ?`).get(chatId, req.user.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found or access denied' });
  }

  db.prepare(`UPDATE chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(title, chatId);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const chatId = req.params.id;

  // Check ownership
  const chat = db.prepare(`SELECT * FROM chats WHERE id = ? AND user_id = ?`).get(chatId, req.user.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found or access denied' });
  }

  db.prepare(`DELETE FROM chats WHERE id = ?`).run(chatId);
  res.json({ success: true });
});

export default router;
