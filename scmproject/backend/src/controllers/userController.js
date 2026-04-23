// controllers/userController.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

// ✅ 获取所有用户
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT uid, username, phone, avatar_url, company, bio, role FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: '数据库错误' });
    }
};

// 获取所有用户除了当前用户的信息
exports.getAllUsers_e_uid = async (req, res) => {
    try {
        const currentUserId = req.user.userId;

        const query = `
            SELECT 
                uid,
                username,
                phone,
                avatar_url,
                company,
                bio,
                role
            FROM users 
            WHERE uid != ?
            ORDER BY username ASC
        `;

        const [rows] = await pool.execute(query, [currentUserId]);

        return res.status(200).json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('获取用户列表失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// ✅ 根据 ID 获取用户
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute('SELECT uid, username, phone, avatar_url, company, bio, role FROM users WHERE uid = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: '数据库错误' });
    }
};

// ✅ 获取公开用户信息
exports.getPublicUserInfo = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT uid, username, phone, company, bio FROM users WHERE uid = ?',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching public user:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};

// ✅ 创建用户（更新：需要手机号、用户名、密码）
exports.createUser = async (req, res) => {
    try {
        // 校验请求体格式
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: '请求体不能为空，且需为 JSON 格式'
            });
        }

        // 清洗并解构参数
        const { username, phone, password } = req.body;
        const cleanUsername = username?.trim() || '';
        const cleanPhone = phone?.trim() || '';
        const cleanPassword = password?.trim() || '';

        // 校验核心字段
        if (!cleanUsername) return res.status(400).json({ success: false, message: '用户名不能为空' });
        if (cleanUsername.length < 3 || cleanUsername.length > 20)
            return res.status(400).json({ success: false, message: '用户名长度需在 3-20 字符之间' });

        if (!cleanPhone) return res.status(400).json({ success: false, message: '手机号不能为空' });
        if (!/^1[3-9]\d{9}$/.test(cleanPhone))
            return res.status(400).json({ success: false, message: '手机号格式不正确' });

        if (!cleanPassword) return res.status(400).json({ success: false, message: '密码不能为空' });
        if (cleanPassword.length < 6)
            return res.status(400).json({ success: false, message: '密码长度不能少于 6 字符' });

        // 校验用户名是否已存在
        const [existingUsers] = await pool.execute(
            'SELECT uid FROM users WHERE username = ? LIMIT 1',
            [cleanUsername]
        );
        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: '用户名已被注册，请更换其他用户名'
            });
        }

        // 校验手机号是否已存在
        const [existingPhones] = await pool.execute(
            'SELECT uid FROM users WHERE phone = ? LIMIT 1',
            [cleanPhone]
        );
        if (existingPhones.length > 0) {
            return res.status(409).json({
                success: false,
                message: '手机号已被注册，请更换其他手机号'
            });
        }

        // 密码加密
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(cleanPassword, saltRounds);

        // 插入数据库（新增 phone 字段）
        const [insertResult] = await pool.execute(
            'INSERT INTO users (username, phone, password, role) VALUES (?, ?, ?, ?)',
            [cleanUsername, cleanPhone, hashedPassword, 'user']
        );

        // 返回注册成功响应
        res.status(201).json({
            success: true,
            message: '用户注册成功',
            data: {
                userId: insertResult.insertId,
                username: cleanUsername,
                phone: cleanPhone,
                role: 'user'
            }
        });

    } catch (error) {
        // 错误日志
        console.error('【用户注册错误】:', error);
        const errorMsg = process.env.NODE_ENV === 'production'
            ? '服务器内部错误，注册失败，请稍后再试'
            : `注册失败：${error.message}`;

        res.status(500).json({
            success: false,
            message: errorMsg,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// ✅ 更新用户（添加 phone 字段）
exports.updateUser = async (req, res) => {
    const { id } = req.params; // uid
    const { username, phone, avatar_url, bio, company } = req.body;

    // ✅ 可更新的字段列表（新增 phone）
    const updatableFields = { username, phone, avatar_url, bio, company };
    const fields = [];
    const values = [];

    // 🟡 动态构建 SET 子句
    Object.keys(updatableFields).forEach(key => {
        if (updatableFields[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updatableFields[key]);
        }
    });

    // ❌ 如果没有要更新的字段
    if (fields.length === 0) {
        return res.status(400).json({ message: '请提供需要更新的字段' });
    }

    // 🔐 把 uid 加到 WHERE 条件
    values.push(id);

    try {
        // 🔍 先检查用户是否存在
        const [existing] = await pool.execute('SELECT uid, role FROM users WHERE uid = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // ⚠️ 如果更新 username，检查是否已存在
        if (username) {
            const [exists] = await pool.execute(
                'SELECT uid FROM users WHERE username = ? AND uid != ?',
                [username, id]
            );
            if (exists.length > 0) {
                return res.status(409).json({ message: '用户名已存在' });
            }
        }

        // ⚠️ 如果更新 phone，检查是否已存在
        if (phone) {
            if (!/^1[3-9]\d{9}$/.test(phone)) {
                return res.status(400).json({ message: '手机号格式不正确' });
            }
            const [exists] = await pool.execute(
                'SELECT uid FROM users WHERE phone = ? AND uid != ?',
                [phone, id]
            );
            if (exists.length > 0) {
                return res.status(409).json({ message: '手机号已被使用' });
            }
        }

        // 🛠 执行更新
        const query = `UPDATE users SET ${fields.join(', ')} WHERE uid = ?`;
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: '更新失败' });
        }

        // ✅ 返回更新后的用户信息
        res.json({
            uid: parseInt(id),
            username,
            phone,
            avatar_url,
            bio,
            company
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: '数据库错误' });
    }
};

// ✅ 删除用户（保持不变）
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM users WHERE uid = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: '数据库错误' });
    }
};

// ✅ 获取系统统计信息
exports.getSystemStatistics = async (req, res) => {
    try {
        console.log('🔍 用户信息:', req.user); // 添加这行来查看用户信息

        // 获取用户总数
        const [userCountResult] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users');

        // 获取商品总数
        const [productCountResult] = await pool.execute('SELECT COUNT(*) as totalProducts FROM products');

        // 获取待审批订单数
        const [pendingOrdersResult] = await pool.execute('SELECT COUNT(*) as pendingOrders FROM orders WHERE status = ?', ['pending']);

        // 获取库存预警商品数
        const [lowStockResult] = await pool.execute('SELECT COUNT(*) as lowStockProducts FROM products WHERE stock_quantity <= ?', [10]);

        const statistics = {
            totalUsers: userCountResult[0].totalUsers,
            totalProducts: productCountResult[0].totalProducts,
            pendingOrders: pendingOrdersResult[0].pendingOrders,
            lowStockProducts: lowStockResult[0].lowStockProducts
        };

        console.log('📊 统计结果:', statistics); // 添加这行查看统计结果

        res.json({
            success: true,
            data: statistics
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: '获取统计信息失败'
        });
    }
};
