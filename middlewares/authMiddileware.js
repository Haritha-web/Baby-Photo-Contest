import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js'; // Make sure the path is correct

const SECRET_KEY = process.env.JWT_SECRET || 'mysecret';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        logger.warn(`Unauthorized access attempt: No token provided`);
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        logger.info(`Token verified for user: ${decoded.email || decoded.id}`);
        console.log(req.user);
        next();
    } catch (error) {
        logger.error(`Invalid or expired token: ${error.message}`);
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
};

export {
    verifyToken
};