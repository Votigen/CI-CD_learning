const { pool } = require('../config/database');
// 创建库存
exports.createInventory = async (req, res) => {
    const { product_id, product_name, quantity, alert_threshold, company } = req.body;

    if (!product_id || !product_name || !quantity || !alert_threshold || !company) {
        return res.status(400).json({ message: '所有字段都是必填项' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO inventory (product_id, product_name, quantity, alert_threshold, company) VALUES (?, ?, ?, ?, ?)',
            [product_id, product_name, quantity, alert_threshold, company]
        );

        res.status(201).json({
            product_id,
            product_name,
            quantity,
            alert_threshold,
            company
        });
    } catch (error) {
        console.error('创建库存记录失败:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: '产品ID已存在' });
        }
        res.status(500).json({ message: '创建库存记录失败', error: error.message });
    }
};

// 获取所有库存（按公司筛选）
exports.getAllInventory = async (req, res) => {
    try {
        // 从token中获取当前登录用户信息
        console.log('req.user:', req.user);

        // 假设用户信息中包含公司信息
        const userCompany = req.user.company || req.user.userCompany || req.user.comp;

        // 验证是否成功获取到公司信息
        if (!userCompany) {
            console.error('无法从token获取公司信息，token内容:', req.user);
            return res.status(401).json({
                message: '无法从令牌中获取公司信息，请重新登录',
                error: 'INVALID_COMPANY_INFO',
                debug: {
                    tokenContent: req.user
                }
            });
        }

        console.log('当前用户所属公司:', userCompany);

        // 查询当前公司的库存记录
        const [rows] = await pool.execute(
            'SELECT * FROM inventory WHERE company = ?',
            [userCompany]
        );

        // 如果没有库存数据
        if (rows.length === 0) {
            return res.status(200).json({
                message: '暂无库存记录',
                data: []
            });
        }

        // 返回成功响应
        res.status(200).json({
            message: '获取库存列表成功',
            data: rows
        });
    } catch (error) {
        console.error('获取库存列表失败:', error);
        res.status(500).json({
            message: '服务器内部错误，获取库存失败',
            error: error.message
        });
    }
};

// 获取单个库存详情
exports.getInventoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const userCompany = req.user.company || req.user.userCompany || req.user.comp;

        if (!userCompany) {
            return res.status(401).json({ message: '无法获取公司信息' });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM inventory WHERE product_id = ? AND company = ?',
            [id, userCompany]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '库存记录不存在' });
        }

        res.status(200).json({
            message: '获取库存详情成功',
            data: rows[0]
        });
    } catch (error) {
        console.error('获取库存详情失败:', error);
        res.status(500).json({ message: '获取库存详情失败', error: error.message });
    }
};

// 更新库存
exports.updateInventory = async (req, res) => {
    const { id } = req.params;
    const { product_name, quantity, alert_threshold } = req.body;

    if (!product_name || quantity === undefined || alert_threshold === undefined) {
        return res.status(400).json({ message: '所有字段都是必填项' });
    }

    try {
        const userCompany = req.user.company || req.user.userCompany || req.user.comp;

        if (!userCompany) {
            return res.status(401).json({ message: '无法获取公司信息' });
        }

        const [result] = await pool.execute(
            'UPDATE inventory SET product_name = ?, quantity = ?, alert_threshold = ? WHERE product_id = ? AND company = ?',
            [product_name, quantity, alert_threshold, id, userCompany]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '库存记录不存在或无权修改' });
        }

        res.status(200).json({
            message: '更新库存成功',
            data: {
                product_id: id,
                product_name,
                quantity,
                alert_threshold,
                company: userCompany
            }
        });
    } catch (error) {
        console.error('更新库存失败:', error);
        res.status(500).json({ message: '更新库存失败', error: error.message });
    }
};

// 删除库存
exports.deleteInventory = async (req, res) => {
    const { id } = req.params;

    try {
        const userCompany = req.user.company || req.user.userCompany || req.user.comp;

        if (!userCompany) {
            return res.status(401).json({ message: '无法获取公司信息' });
        }

        const [result] = await pool.execute(
            'DELETE FROM inventory WHERE product_id = ? AND company = ?',
            [id, userCompany]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '库存记录不存在或无权删除' });
        }

        res.status(200).json({ message: '删除库存成功' });
    } catch (error) {
        console.error('删除库存失败:', error);
        res.status(500).json({ message: '删除库存失败', error: error.message });
    }
};
// 获取单个库存
exports.getInventoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM inventory WHERE product_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '未找到该库存记录' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('获取库存记录失败:', error);
        res.status(500).json({ message: '获取库存记录失败', error: error.message });
    }
};
// 更新库存
exports.updateInventory = async (req, res) => {
    const { id } = req.params;
    const { product_name, quantity, alert_threshold } = req.body;

    if (!product_name || !quantity || !alert_threshold) {
        return res.status(400).json({ message: '所有字段都是必填项' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE inventory SET product_name = ?, quantity = ?, alert_threshold = ? WHERE product_id = ?',
            [product_name, quantity, alert_threshold, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到该库存记录' });
        }

        res.json({ message: '库存记录更新成功' });
    } catch (error) {
        console.error('更新库存记录失败:', error);
        res.status(500).json({ message: '更新库存记录失败', error: error.message });
    }
};
// 删除库存
exports.deleteInventory = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute(
            'DELETE FROM inventory WHERE product_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到该库存记录' });
        }

        res.json({ message: '库存记录删除成功' });
    } catch (error) {
        console.error('删除库存记录失败:', error);
        res.status(500).json({ message: '删除库存记录失败', error: error.message });
    }
};