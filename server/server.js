const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Увеличиваем лимит, чтобы принимать аудиофайлы в base64
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- MOCK DATA (в будущем это будет заменено на базу данных) ---

const users = {
  'user-0': { id: 'user-0', name: 'You', avatarUrl: 'https://i.pravatar.cc/150?u=user-0', isOnline: true },
  'user-1': { id: 'user-1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=user-1', isOnline: true },
  'user-2': { id: 'user-2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', isOnline: false },
  'user-3': { id: 'user-3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=user-3', isOnline: true },
  'user-4': { id: 'user-4', name: 'Diana', avatarUrl: 'https://i.pravatar.cc/150?u=user-4', isOnline: false },
};

const messagesDB = {
  'chat-1': [
    { id: 'msg-1-1', text: 'Hey, how is it going?', timestamp: new Date(Date.now() - 1000 * 60 * 50), senderId: 'user-1' },
    { id: 'msg-1-2', text: 'Pretty good! Just working on a new React project. You?', timestamp: new Date(Date.now() - 1000 * 60 * 48), senderId: 'user-0' },
    { id: 'msg-1-3', text: 'Oh, nice! I am planning a trip for the weekend.', timestamp: new Date(Date.now() - 1000 * 60 * 45), senderId: 'user-1' },
    { id: 'msg-1-4', text: 'Sounds fun! Where to?', timestamp: new Date(Date.now() - 1000 * 60 * 44), senderId: 'user-0' },
  ],
  'chat-2': [
    { id: 'msg-2-1', text: 'Did you see the latest news about the framework updates?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), senderId: 'user-2' },
    { id: 'msg-2-2', text: 'Not yet, I was busy. Anything major?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), senderId: 'user-0' },
  ],
  'chat-3': [
    { id: 'msg-3-1', text: "Let's catch up tomorrow for lunch.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), senderId: 'user-3' },
  ],
  'chat-4': [
     { id: 'msg-4-1', text: 'Can you review my PR?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), senderId: 'user-4' },
  ],
};

const chatsDB = [
  { id: 'chat-1', users: [users['user-0'], users['user-1']], lastMessage: messagesDB['chat-1'][3], unreadCount: 2 },
  { id: 'chat-2', users: [users['user-0'], users['user-2']], lastMessage: messagesDB['chat-2'][1], unreadCount: 0 },
  { id: 'chat-3', users: [users['user-0'], users['user-3']], lastMessage: messagesDB['chat-3'][0], unreadCount: 1 },
  { id: 'chat-4', users: [users['user-0'], users['user-4']], lastMessage: messagesDB['chat-4'][0], unreadCount: 0 },
];


// --- API Endpoints ---

app.get('/api/chats', (req, res) => {
  const sortedChats = [...chatsDB].sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  res.json(sortedChats);
});

app.get('/api/messages/:chatId', (req, res) => {
  const { chatId } = req.params;
  res.json(messagesDB[chatId] || []);
});

app.post('/api/messages', (req, res) => {
  const { chatId, senderId, text, audio } = req.body;
  
  if (!chatId || (!text && !audio) || !senderId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newMessage = {
    id: `msg-${Date.now()}`,
    text: text || undefined,
    audio: audio || undefined,
    timestamp: new Date(),
    senderId,
  };
  
  // Имитация сохранения в базу данных
  if (messagesDB[chatId]) {
    messagesDB[chatId].push(newMessage);
  } else {
    messagesDB[chatId] = [newMessage];
  }

  const chat = chatsDB.find(c => c.id === chatId);
  if (chat) {
    chat.lastMessage = newMessage;
  }
  
  // В реальном приложении здесь будет отправка сообщения по WebSocket
  
  res.status(201).json(newMessage);
});


app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
