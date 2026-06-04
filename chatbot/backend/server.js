import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from './routes/auth.js';
import chatsRouter from './routes/chats.js';
import messagesRouter from './routes/messages.js';

const app = express();
const PORT = process.env.PORT || 3002; // Backend runs on 3002 as configured in .env

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/messages', messagesRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
