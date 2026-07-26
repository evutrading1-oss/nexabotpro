const jwt = require('jsonwebtoken');

const APP_PASSWORD = process.env.APP_PASSWORD || 'Nexaevu@##800';
const SESSION_SECRET = process.env.SESSION_SECRET || 'nexa-evu-secret';

/**
 * Generate a JWT token for authenticated sessions.
 * Token expires in 24 hours.
 */
function generateToken() {
  return jwt.sign(
    {
      authenticated: true,
      createdAt: new Date().toISOString()
    },
    SESSION_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify a JWT token.
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Middleware to protect routes — requires valid auth token.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No authentication token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  const result = verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }

  req.user = result.decoded;
  next();
}

module.exports = {
  APP_PASSWORD,
  generateToken,
  verifyToken,
  authMiddleware
};
