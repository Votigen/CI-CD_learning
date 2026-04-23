// controllers/productDetailsController.js
const { pool } = require('../config/database');

exports.createProductDetail = async (req, res) => {
    const { product_id, order_id, quantity, reference_price, cost_price } = req.body;

    // 检查 inventory 表中是否存在对应的 product_id
    const [inventoryRows] = await pool.execute('SELECT * FROM inventory WHERE product_id = ?', [product_id]);
    if (inventoryRows.length === 0) {
        return res.status(400).json({ message: '库存记录不存在', error: '请先创建库存记录' });
    }

    // 检查 orders 表中是否存在对应的 order_id
    const [orderRows] = await pool.execute('SELECT * FROM orders WHERE order_id = ?', [order_id]);
    if (orderRows.length === 0) {
        return res.status(400).json({ message: '订单记录不存在', error: '请先创建订单记录' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO product_details (product_id, order_id, quantity, reference_price, cost_price) VALUES (?, ?, ?, ?, ?)',
            [product_id, order_id, quantity, reference_price, cost_price]
        );

        res.status(201).json({
            id: result.insertId,
            product_id,
            order_id,
            quantity,
            reference_price,
            cost_price
        });
    } catch (error) {
        console.error('创建产品详情失败:', error);
        res.status(500).json({ message: '创建产品详情失败', error: error.message });
    }
};

exports.getProductDetailById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM product_details WHERE detail_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '未找到该产品详情' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('获取产品详情失败:', error);
        res.status(500).json({ message: '获取产品详情失败', error: error.message });
    }
};

exports.updateProductDetail = async (req, res) => {
    const { id } = req.params;
    const { product_id, order_id, quantity, reference_price, cost_price } = req.body;

    if (!product_id || !order_id || !quantity || !reference_price || !cost_price) {
        return res.status(400).json({ message: '所有字段都是必填项' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE product_details SET product_id = ?, order_id = ?, quantity = ?, reference_price = ?, cost_price = ? WHERE detail_id = ?',
            [product_id, order_id, quantity, reference_price, cost_price, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到该产品详情' });
        }

        res.json({ message: '产品详情更新成功' });
    } catch (error) {
        console.error('更新产品详情失败:', error);
        res.status(500).json({ message: '更新产品详情失败', error: error.message });
    }
};

exports.deleteProductDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute(
            'DELETE FROM product_details WHERE detail_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到该产品详情' });
        }

        res.json({ message: '产品详情删除成功' });
    } catch (error) {
        console.error('删除产品详情失败:', error);
        res.status(500).json({ message: '删除产品详情失败', error: error.message });
    }
};