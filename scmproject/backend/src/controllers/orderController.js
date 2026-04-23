const { pool } = require('../config/database');
//创建订单
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            supplier_uid,
            title,
            description,
            quantity,
            unit_price,
            order_type = 'purchase',
            product_id,
            duration_days
        } = req.body;

        // 基本验证
        if (!supplier_uid || !title) {
            return res.status(400).json({
                success: false,
                message: '供应商和订单标题为必填项'
            });
        }

        const query = `
            INSERT INTO orders (
                order_id,
                creator_uid,
                customer_uid,
                title,
                description,
                quantity,
                unit_price,
                product_id,
                duration_days,
                order_status,
                order_type
            ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', ?)
        `;

        const values = [
            userId,
            supplier_uid,
            title,
            description || null,
            quantity || null,
            unit_price || null,
            product_id || null,
            duration_days || null,
            order_type
        ];

        const [result] = await pool.execute(query, values);

        // 直接返回成功信息，不查询新订单
        return res.status(201).json({
            success: true,
            message: '采购订单创建成功，等待审批',
            data: {
                order_id: result.insertId ? await getOrderId(result.insertId) : '生成中',
                status: 'pending_approval'
            }
        });

    } catch (error) {
        console.error('创建订单失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};
// 获取我的订单
exports.getOrdersByCreator = async (req, res) => {
    try {
        const userId = req.user.userId;

        const query = `
            SELECT 
                o.order_id,
                o.created_at,
                o.creator_uid,
                o.customer_uid,
                o.title,
                o.description,
                u.username AS customer_username  -- ← 从 users 表获取用户名
            FROM orders o
            LEFT JOIN users u ON o.customer_uid = u.uid  -- ← 关联 users 表
            WHERE o.creator_uid = ?
            ORDER BY o.created_at DESC
        `;

        const [rows] = await pool.execute(query, [userId]);

        return res.status(200).json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('获取我的订单失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误，请稍后重试'
        });
    }
};
// 获取购买人订单
exports.getOrdersByCustomer = async (req, res) => {
    try {
        const userId = req.user.userId;

        const query = `
            SELECT 
                o.order_id,
                o.created_at,
                o.creator_uid,
                o.customer_uid,
                o.title,
                o.description,
                u.username AS creator_username  -- ← 创建者用户名（谁接了你的单）
            FROM orders o
            LEFT JOIN users u ON o.customer_uid = u.uid  -- ← 关联创建者信息
            WHERE o.customer_uid = ?
            ORDER BY o.created_at DESC
        `;

        const [rows] = await pool.execute(query, [userId]);

        return res.status(200).json({
            success: true,
            data: rows,
            count: rows.length
        });

    } catch (error) {
        console.error('获取我发起的订单失败:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误，请稍后重试'
        });
    }
};
// 获取订单by ID
exports.getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM orders WHERE order_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '未找到该订单记录' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('获取订单记录失败:', error);
        res.status(500).json({ message: '获取订单记录失败', error: error.message });
    }
};
// 获取订单by ID 并计算订单价格
exports.getOrderById1 = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM orders WHERE order_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '未找到该订单记录' });
        }

        const order = rows[0];

        // 1. 格式化 created_at 为 YYYY-MM-DD
        const createdAt = order.created_at
            ? new Date(order.created_at).toISOString().split('T')[0]
            : null;

        // 2. 计算 end_at = created_at + duration_days
        let endAt = null;
        if (order.created_at && order.duration_days !== null) {
            const start = new Date(order.created_at);
            const end = new Date(start);
            end.setDate(start.getDate() + order.duration_days);
            endAt = end.toISOString().split('T')[0]; // YYYY-MM-DD
        }

        // 3. 计算总价 = quantity * unit_price
        const totalPrice =
            order.quantity !== null && order.unit_price !== null
                ? order.quantity * order.unit_price
                : null;

        // 4. 构造响应对象（保留原字段，新增计算字段）
        const responseData = {
            ...order,
            created_at: createdAt,     // 覆盖原字段
            end_at: endAt,             // 新增字段
            total_price: totalPrice    // 新增字段
        };

        res.json(responseData);

    } catch (error) {
        console.error('获取订单记录失败:', error);
        res.status(500).json({
            message: '获取订单记录失败',
            error: error.message
        });
    }
};
// 更新订单
exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    const { creator_uid, customer_uid, title, description } = req.body;

    if (!creator_uid || !customer_uid || !title || !description) {
        return res.status(400).json({ message: '所有字段都是必填项' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE orders SET creator_uid = ?, customer_uid = ?, title = ?, description = ? WHERE order_id = ?',
            [creator_uid, customer_uid, title, description, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到该订单记录' });
        }

        res.json({ message: '订单记录更新成功' });
    } catch (error) {
        console.error('更新订单记录失败:', error);
        res.status(500).json({ message: '更新订单记录失败', error: error.message });
    }
};
// 删除订单
exports.deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute(
            'DELETE FROM orders WHERE order_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到该订单记录' });
        }

        res.json({ message: '订单记录删除成功' });
    } catch (error) {
        console.error('删除订单记录失败:', error);
        res.status(500).json({ message: '删除订单记录失败', error: error.message });
    }
};
//分页查询 购买订单
exports.getOrdersWithSearch = async (req, res) => {
    try {
        // 🔥 调试：检查用户信息结构
        console.log('🔍 完整的用户信息:', req.user);
        console.log('🔍 用户信息键名:', Object.keys(req.user || {}));

        // 获取当前登录用户的ID - 根据你的登录接口结构
        let creator_uid;

        if (req.user) {
            // 你的登录接口返回的是 userId，不是 id
            creator_uid = req.user.userId; // 这里应该是 userId，不是 id
            console.log('🔍 提取的用户ID:', creator_uid);
        }

        // 如果还是无法获取用户ID，抛出错误
        if (!creator_uid) {
            console.error('❌ 无法获取用户ID，用户信息结构:', req.user);
            return res.status(401).json({
                success: false,
                message: '用户身份信息不完整'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 获取搜索条件
        const keyword = req.query.keyword || '';
        const status = req.query.status || '';

        // 构建查询条件 - 添加用户ID筛选
        let whereConditions = ['order_type = "purchase"', 'creator_uid = ?'];
        let queryParams = [creator_uid];

        if (keyword) {
            whereConditions.push('(title LIKE ? OR description LIKE ?)');
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (status) {
            whereConditions.push('order_status = ?');
            queryParams.push(status);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        console.log('SQL条件:', whereClause);
        console.log('参数:', queryParams);
        console.log('当前用户ID:', creator_uid);

        // 查询筛选后的总数
        const [totalResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM orders ${whereClause}`,
            queryParams
        );
        const total = totalResult[0].total;

        // 查询当前页数据
        const [orders] = await pool.execute(
            `SELECT * FROM orders 
             ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...queryParams, limit, offset]
        );

        // 查询当前用户的全部采购订单统计数据
        const [statsResult] = await pool.execute(
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(COALESCE(quantity, 0) * COALESCE(unit_price, 0)) as total_amount
             FROM orders WHERE order_type = "purchase" AND creator_uid = ?`,
            [creator_uid]
        );

        console.log('🔍 当前用户统计查询结果:', statsResult[0]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: page,
                    page_size: limit,
                    total: total,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                },
                statistics: {
                    total_orders: statsResult[0].total_orders || 0,
                    pending_orders: statsResult[0].pending_orders || 0,
                    total_amount: parseFloat(statsResult[0].total_amount || 0).toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('查询失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};
//分页查询 供应订单
exports.getSupplyOrdersWithSearch = async (req, res) => {
    try {
        // 获取当前登录用户的ID
        const customer_uid = req.user.userId;

        console.log('🔍 供货页面 - 当前用户ID:', customer_uid);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 获取搜索条件
        const keyword = req.query.keyword || '';
        const status = req.query.status || '';

        // 构建查询条件 - 供货订单：customer_uid 为当前用户
        let whereConditions = ['customer_uid = ?'];
        let queryParams = [customer_uid];

        if (keyword) {
            whereConditions.push('(title LIKE ? OR description LIKE ?)');
            queryParams.push(`%${keyword}%`, `%${keyword}%`);
        }

        if (status) {
            whereConditions.push('order_status = ?');
            queryParams.push(status);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        console.log('🔍 供货页面 SQL条件:', whereClause);
        console.log('🔍 供货页面 参数:', queryParams);

        // 查询筛选后的总数
        const [totalResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM orders ${whereClause}`,
            queryParams
        );
        const total = totalResult[0].total;

        // 查询当前页数据
        const [orders] = await pool.execute(
            `SELECT * FROM orders 
             ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...queryParams, limit, offset]
        );

        // 查询当前用户的全部供货订单统计数据
        const [statsResult] = await pool.execute(
            `SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(COALESCE(quantity, 0) * COALESCE(unit_price, 0)) as total_amount
             FROM orders WHERE customer_uid = ?`,
            [customer_uid]
        );

        console.log('🔍 供货页面统计查询结果:', statsResult[0]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: page,
                    page_size: limit,
                    total: total,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    has_prev: page > 1
                },
                statistics: {
                    total_orders: statsResult[0].total_orders || 0,
                    pending_orders: statsResult[0].pending_orders || 0,
                    total_amount: parseFloat(statsResult[0].total_amount || 0).toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error('供货订单查询失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};
// 获取待审批订单列表
exports.getPendingApprovalOrders = async (req, res) => {
    try {
        const userCompany = req.user.company;

        if (!userCompany) {
            return res.status(401).json({ message: '无法获取公司信息' });
        }

        // 获取状态为 pending_approval 的订单
        const [rows] = await pool.execute(
            `SELECT o.*, u1.username as creator_name, u2.username as customer_name, i.product_name
             FROM orders o 
             LEFT JOIN users u1 ON o.creator_uid = u1.uid 
             LEFT JOIN users u2 ON o.customer_uid = u2.uid
             LEFT JOIN inventory i ON o.product_id = i.product_id
             WHERE o.order_status = 'pending_approval' 
             AND (u1.company = ? OR u2.company = ?)`,
            [userCompany, userCompany]
        );

        res.status(200).json({
            message: '获取待审批订单成功',
            data: rows
        });
    } catch (error) {
        console.error('获取待审批订单失败:', error);
        res.status(500).json({ message: '获取待审批订单失败', error: error.message });
    }
};
// 审批订单
exports.approveOrder = async (req, res) => {
    const { order_id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: '操作类型不正确' });
    }

    try {
        const userCompany = req.user.company;
        const userId = req.user.userId;

        if (!userCompany) {
            return res.status(401).json({ message: '无法获取公司信息' });
        }

        // 检查订单是否存在且状态为待审批
        const [orders] = await pool.execute(
            `SELECT o.* FROM orders o 
             LEFT JOIN users u ON o.creator_uid = u.uid 
             WHERE o.order_id = ? AND o.order_status = 'pending_approval' AND u.company = ?`,
            [order_id, userCompany]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: '订单不存在或无需审批' });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        // 更新订单状态
        const [result] = await pool.execute(
            'UPDATE orders SET order_status = ? WHERE order_id = ?',
            [newStatus, order_id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: '审批操作失败' });
        }

        res.status(200).json({
            message: action === 'approve' ? '订单审批通过' : '订单审批驳回',
            data: { order_id, status: newStatus }
        });
    } catch (error) {
        console.error('审批订单失败:', error);
        res.status(500).json({ message: '审批订单失败', error: error.message });
    }
};
// 辅助函数：获取订单ID
async function getOrderId(insertId) {
    try {
        const [rows] = await pool.execute('SELECT order_id FROM orders WHERE id = ?', [insertId]);
        return rows[0]?.order_id || '未知';
    } catch (error) {
        return '未知';
    }
}