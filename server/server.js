const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // В production-среде лучше указать URL вашего фронтенда
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- DATABASE (File-based) ---
const dbPath = path.join(__dirname, 'db.json');

const readDB = () => {
    if (!fs.existsSync(dbPath)) {
        // Create initial DB if it doesn't exist
        const initialData = {
            users: [],
            chats: [],
            messages: {}
        };
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// --- SOCKET.IO ---
const userSockets = new Map(); // Map<userId, socketId>

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSockets.set(userId, socket.id);
    console.log(`User connected: ${userId} with socket ${socket.id}`);
  }

  socket.on('disconnect', () => {
    for (let [key, value] of userSockets.entries()) {
      if (value === socket.id) {
        userSockets.delete(key);
        break;
      }
    }
    console.log(`A user disconnected. Sockets online: ${userSockets.size}`);
  });
});


// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const db = readDB();
        if (db.users.find(u => u.name === name)) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: `user-${Date.now()}`,
            name,
            password: hashedPassword,
            avatarUrl: `https://i.pravatar.cc/150?u=${name}`,
            isOnline: true,
        };
        db.users.push(newUser);
        
        // Find Alice and create a chat
        const alice = db.users.find(u => u.name === 'Alice');
        if (alice && alice.id !== newUser.id) {
          const newChat = {
            id: `chat-${Date.now()}`,
            userIds: [newUser.id, alice.id],
            unreadCount: 0,
          };
          db.chats.push(newChat);
          db.messages[newChat.id] = [];
        }

        writeDB(db);

        const token = jwt.sign({ id: newUser.id, name: newUser.name }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, avatarUrl: newUser.avatarUrl } });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        const db = readDB();
        const user = db.users.find(u => u.name === name);

        if (user == null) {
            return res.status(400).json({ error: 'Cannot find user' });
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl } });
        } else {
            res.status(400).json({ error: 'Not Allowed' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- API Endpoints (Protected) ---

app.get('/api/users/search', authenticateToken, (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json([]);
    }

    const db = readDB();
    const searchResults = db.users.filter(user => 
        user.name.toLowerCase().includes(q.toLowerCase()) && user.id !== req.user.id
    ).map(({ id, name, avatarUrl, isOnline }) => ({ id, name, avatarUrl, isOnline }));

    res.json(searchResults);
});

app.post('/api/chats', authenticateToken, (req, res) => {
    const { partnerId } = req.body;
    const currentUserId = req.user.id;

    if (!partnerId) {
        return res.status(400).json({ error: 'Partner ID is required' });
    }
    if (partnerId === currentUserId) {
        return res.status(400).json({ error: 'Cannot create a chat with yourself' });
    }

    const db = readDB();
    
    const populateChat = (chat) => {
        const users = chat.userIds.map(userId => {
            const user = db.users.find(u => u.id === userId);
            if (!user) return null;
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }).filter(Boolean);

        const messagesForChat = db.messages[chat.id] || [];
        const lastMessage = messagesForChat.length > 0 ? messagesForChat[messagesForChat.length - 1] : {};
        return {...chat, users, lastMessage};
    };

    const existingChat = db.chats.find(chat => 
        chat.userIds.includes(currentUserId) && chat.userIds.includes(partnerId)
    );

    if (existingChat) {
        return res.status(200).json(populateChat(existingChat));
    }

    const newChat = {
        id: `chat-${Date.now()}`,
        userIds: [currentUserId, partnerId],
        unreadCount: 0
    };

    db.chats.push(newChat);
    db.messages[newChat.id] = [];
    writeDB(db);
    
    res.status(201).json(populateChat(newChat));
});

app.get('/api/chats', authenticateToken, (req, res) => {
    const db = readDB();
    const currentUserChats = db.chats.filter(chat => chat.userIds.includes(req.user.id));
    
    const populatedChats = currentUserChats.map(chat => {
      const users = chat.userIds.map(userId => {
        const user = db.users.find(u => u.id === userId);
        if(!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }).filter(Boolean);
      const messagesForChat = db.messages[chat.id] || [];
      const lastMessage = messagesForChat.length > 0 ? messagesForChat[messagesForChat.length - 1] : {};
      return {...chat, users, lastMessage};
    });

    const sortedChats = populatedChats.sort((a, b) => 
      (b.lastMessage.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0) - 
      (a.lastMessage.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0)
    );
    res.json(sortedChats);
});

app.get('/api/messages/:chatId', authenticateToken, (req, res) => {
    const db = readDB();
    const { chatId } = req.params;
    const chat = db.chats.find(c => c.id === chatId);
    if (!chat || !chat.userIds.includes(req.user.id)) {
        return res.status(403).json({ error: "Access denied" });
    }
    res.json(db.messages[chatId] || []);
});

app.post('/api/messages', authenticateToken, (req, res) => {
    const { chatId, text, audio } = req.body;
    const senderId = req.user.id;

    if (!chatId || (!text && !audio)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = readDB();
    const chat = db.chats.find(c => c.id === chatId);
    if (!chat || !chat.userIds.includes(senderId)) {
        return res.status(403).json({ error: "Access denied" });
    }
    
    const newMessage = {
        id: `msg-${Date.now()}`,
        text: text || undefined,
        audio: audio || undefined,
        timestamp: new Date(),
        senderId,
    };
    
    db.messages[chatId] = db.messages[chatId] || [];
    db.messages[chatId].push(newMessage);
    
    writeDB(db);

    // --- Real-time part ---
    const recipientId = chat.userIds.find(id => id !== senderId);
    if (recipientId) {
        const recipientSocketId = userSockets.get(recipientId);
        if (recipientSocketId) {
            // Send the message to the recipient
            io.to(recipientSocketId).emit('newMessage', { ...newMessage, chatId });
        }
    }
    
    res.status(201).json(newMessage);
});

// Use server.listen instead of app.listen
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
