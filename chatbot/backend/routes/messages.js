import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '../db.js';
import auth from '../middleware/auth.js';
import 'dotenv/config';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Protect all message routes
router.use(auth);

router.get('/:chatId', (req, res) => {
  const { chatId } = req.params;

  // Check chat ownership
  const chat = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?').get(chatId, req.user.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found or access denied' });
  }

  const messages = db.prepare(`
    SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC
  `).all(chatId);
  res.json(messages);
});

router.post('/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });

  // Check chat ownership
  const chat = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?').get(chatId, req.user.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found or access denied' });
  }

  const userMsgId = uuidv4();
  db.prepare(`INSERT INTO messages (id, chat_id, role, content) VALUES (?, ?, 'user', ?)`)
    .run(userMsgId, chatId, content);

  if (chat.title === 'New Chat') {
    const shortTitle = content.slice(0, 50);
    db.prepare(`UPDATE chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(shortTitle, chatId);
  } else {
    db.prepare(`UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(chatId);
  }

  const history = db.prepare(`
    SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC
  `).all(chatId);

  // Convert role 'model' from db to 'model' for Gemini (user stays user)
  const geminiHistory = history.slice(0, -1).map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat_session = model.startChat({
      history: geminiHistory,
      generationConfig: { maxOutputTokens: 2048 }
    });

    const result = await chat_session.sendMessage(content);
    const aiResponse = result.response.text();

    const aiMsgId = uuidv4();
    db.prepare(`INSERT INTO messages (id, chat_id, role, content) VALUES (?, ?, 'model', ?)`)
      .run(aiMsgId, chatId, aiResponse);

    res.json({
      userMessage: { id: userMsgId, chat_id: chatId, role: 'user', content },
      aiMessage: { id: aiMsgId, chat_id: chatId, role: 'model', content: aiResponse }
    });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

export default router;
