const User = require("../models/User/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const foundUser = await User.findOne({ username }).lean();
    if (!foundUser || !foundUser.active) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    const userInfo = {
      _id: foundUser._id,
      name: foundUser.name,
      username: foundUser.username,
      email: foundUser.email,
    };

    const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000,
    });

    return res.json({
      message: "Logged In successfully!",
      user: userInfo,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, name, email, phone, birthDate } = req.body;

    if (!name || !username || !password || !birthDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{9,15}$/;

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const duplicate = await User.findOne({ username }).lean();
    if (duplicate) {
      return res.status(409).json({ message: "Duplicate username" });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const userObject = { name, email, username, phone, birthDate, password: hashedPwd };
    const user = await User.create(userObject);

    if (user) {
      return res.status(201).json({ message: `New user ${user.username} created` });
    } else {
      return res.status(400).json({ message: 'Invalid user received' });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const me = (req, res) => {
  const { _id, name, username, email } = req.user;
  res.json({
    id: _id,
    name,
    username,
    email,
  });
};

module.exports = { login, register, logout,me};
