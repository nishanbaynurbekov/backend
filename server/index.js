import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtNative from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Middleware (уруксаттар жана JSON окуу)
app.use(cors());
app.use(express.json());

// Убактылуу маалымат базасы (эсепти массивге сактайбыз)
// Келечекте муну MongoDB же PostgreSQL'ге туташтырабыз
const users = [];

// ==========================================
// 1. КАТТАЛУУ (REGISTER) ROUTE
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Маалыматтар толук келингенин текшерүү
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Бардык талааларды толтуруңуз!' });
    }

    // Email мурун катталган эмесписи?
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Бул email менен колдонуучу мурда катталган!' });
    }

    // Паролду шифрлөө (Hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Жаңы колдонуучуну түзүү жана сактоо
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
    };
    users.push(newUser);

    console.log('Жаңы катталган колдонуучу:', { id: newUser.id, username, email });

    res.status(201).json({ message: 'Каттоо ийгиликтүү өттү!' });
  } catch (error) {
    res.status(500).json({ message: 'Серверде каталык орун алды' });
  }
});

// ==========================================
// 2. КИРҮҮ (LOGIN) ROUTE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Базадан email боюнча колдонуучуну табуу
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Email же пароль ката!' });
    }

    // Паролду текшерүү (киргизилген пароль менен шифрленген паролду салыштыруу)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email же пароль ката!' });
    }

    // ==========================================
// 3. БАРДЫК КАТТАЛГАНДАРДЫ АЛУУ (GET USERS)
// ==========================================
app.get('/api/users', (req, res) => {
  // Коопсуздук үчүн паролдорун кошпой, аты, email жана id сүн гана кайтарабыз
  const safeUsers = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
  }));

  res.json(safeUsers);
});

    // Коопсуз Токен түзүү (JWT)
    const token = jwt.sign(
  { userId: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '1h' }
);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Серверде каталык орун алды' });
  }
});

// Серверди иштетүү
app.listen(PORT, () => {
  console.log(`🚀 Сервер http://localhost:${PORT} портунда иштеп жатат`);
});