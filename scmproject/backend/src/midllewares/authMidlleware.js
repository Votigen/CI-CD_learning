const jwt = require('jsonwebtoken');
require('dotenv').config();
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: '未提供有效的认证令牌'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.userId, // 将 userId 映射为 id
            userId: decoded.userId, // 保留原始字段
            username: decoded.username,
            role: decoded.role,
            company: decoded.company
        };

        console.log('🔍 标准化后的用户信息:', req.user);
        next();
    } catch (err) {
        console.error('JWT验证错误:', err.message);
        return res.status(403).json({
            message: '令牌无效或已过期'
        });
    }
};
module.exports = authMiddleware;