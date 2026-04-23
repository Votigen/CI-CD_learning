const jwt = require('jsonwebtoken');
const { pool } = require('../config/database'); // 引入数据库连接池
const bcrypt = require('bcrypt'); // 或 bcryptjs
// 登录接口：POST /login
exports.login = async (req, res) => {
    const { phone, password } = req.body;

    try {
        // 1. 先查询「用户名对应的加密密码」（不直接用密码当查询条件）
        const [rows] = await pool.execute(
            'SELECT uid, username, password, role ,company FROM users WHERE phone = ?',
            [phone]
        );

        // 2. 校验：用户是否存在
        if (rows.length === 0) {
            return res.status(401).json({ message: '用户不存在' });
        }

        const user = rows[0]; // { uid, username, password: '加密后的哈希值', role }

        // 3. 用 bcrypt 验证「明文密码」和「数据库哈希密码」是否匹配
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 4. 密码验证通过，生成 JWT Token
        const token = jwt.sign(
            {
                role: user.role,
                userId: user.uid,
                username: user.username,
                company: user.company
            },
            process.env.JWT_SECRET, // 从环境变量取密钥（需提前配置）
            { expiresIn: '24h' }   // Token 有效期 24 小时
        );

        res.json({ token }); // 返回 Token，前端需存储用于后续请求

    } catch (error) {
        console.error('登录接口错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};