const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(required = true) {
  return async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ error: 'Unauthorized' });
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub).select('-passwordHash');
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

module.exports = { auth, signToken };
