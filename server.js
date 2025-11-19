const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Segurança base
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                 // 100 pedidos por IP
});
app.use(limiter);

const JWT_SECRET = 'super-secret-key'; // em produção → process.env.JWT_SECRET

// "Fake DB" em memória com passwords hashed
const users = [];

function createUser(id, username, password, role) {
  const hashed = bcrypt.hashSync(password, 10);
  users.push({ id, username, password: hashed, role });
}

// seed inicial
createUser(1, 'admin', 'admin123', 'admin');
createUser(2, 'ricardo', '123456', 'user');

// Middleware para autenticar JWT
function auth(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded; // { id, username, role }
    next();
  });
}

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const { password: _, ...safeUser } = user;

  res.json({
    message: 'Login OK',
    token,
    user: safeUser,
  });
});

// GET /users  → só admin, sem password
app.get('/users', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const safeUsers = users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });

  res.json(safeUsers);
});

// GET /users/:id → user só vê a si próprio, admin vê todos
app.get('/users/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
