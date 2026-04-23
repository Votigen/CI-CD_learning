// controllers/statisticsController.js
const { pool } = require('../config/database');

// 获取仪表盘统计数据
exports.getDashboardStatistics = async (req, res) => {
    try {
        // 1. 查询用户总数
        const [userResult] = await pool.execute('SELECT COUNT(*) AS total FROM users');
        const totalUsers = parseInt(userResult[0].total);

        // 2. 查询产品总数（从inventory表统计，因inventory存储产品信息）
        const [productResult] = await pool.execute('SELECT COUNT(*) AS total FROM inventory');
        const totalProducts = parseInt(productResult[0].total);

        // 3. 查询待审批订单数
        const [pendingOrdersResult] = await pool.execute(
            'SELECT COUNT(*) AS total FROM orders WHERE order_status = ?',
            ['pending_approval']
        );
        const pendingOrders = parseInt(pendingOrdersResult[0].total);

        // 4. 查询库存不足产品数（库存数量 <= 预警阈值）
        const [lowStockResult] = await pool.execute(
            'SELECT COUNT(*) AS total FROM inventory WHERE quantity <= alert_threshold'
        );
        const lowStockProducts = parseInt(lowStockResult[0].total);

        // 返回统计结果
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                pendingOrders,
                lowStockProducts
            }
        });

    } catch (error) {
        console.error('获取仪表盘统计数据失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误，获取统计数据失败'
        });
    }
};

// 获取订单统计图表数据
exports.getOrderChartData = async (req, res) => {
    try {
        // 获取查询参数，设置默认值
        const range = req.query.range || 'monthly';
        const year = parseInt(req.query.year) || new Date().getFullYear();

        // 基础查询条件
        const baseWhere = `YEAR(created_at) = ? AND order_status NOT IN ('draft', 'cancelled')`;

        // 根据时间范围确定分组方式
        let groupByClause, categories;

        switch (range) {
            case 'monthly':
                groupByClause = 'MONTH(created_at)';
                categories = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
                break;
            case 'quarterly':
                groupByClause = 'QUARTER(created_at)';
                categories = ["Q1", "Q2", "Q3", "Q4"];
                break;
            case 'yearly':
                groupByClause = 'YEAR(created_at)';
                // 对于年度统计，我们获取近12年的数据
                categories = Array.from({ length: 12 }, (_, i) => (year - 11 + i).toString());
                break;
            default:
                groupByClause = 'MONTH(created_at)';
                categories = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
        }

        // 查询采购订单
        const [purchaseResults] = await pool.execute(
            `SELECT ${groupByClause} as period, COUNT(*) as count 
             FROM orders 
             WHERE order_type = 'purchase' AND ${baseWhere}
             GROUP BY ${groupByClause}
             ORDER BY period`,
            [year]
        );

        // 查询销售订单
        const [saleResults] = await pool.execute(
            `SELECT ${groupByClause} as period, COUNT(*) as count 
             FROM orders 
             WHERE order_type = 'sale' AND ${baseWhere}
             GROUP BY ${groupByClause}
             ORDER BY period`,
            [year]
        );

        // 初始化数据数组
        const purchaseOrders = new Array(categories.length).fill(0);
        const saleOrders = new Array(categories.length).fill(0);

        // 填充采购订单数据
        purchaseResults.forEach(item => {
            // 数组索引从0开始，周期从1开始，需要减1
            const index = item.period - 1;
            if (index >= 0 && index < categories.length) {
                purchaseOrders[index] = parseInt(item.count);
            }
        });

        // 填充销售订单数据
        saleResults.forEach(item => {
            const index = item.period - 1;
            if (index >= 0 && index < categories.length) {
                saleOrders[index] = parseInt(item.count);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                categories,
                purchaseOrders,
                saleOrders
            }
        });

    } catch (error) {
        console.error('获取订单图表数据失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误，获取订单图表数据失败'
        });
    }
};

// 获取库存统计图表数据（修复无category字段问题）
exports.getInventoryChartData = async (req, res) => {
    try {
        // 1. 获取当前用户所属公司（从认证信息中提取）
        const userCompany = req.user.company;
        if (!userCompany) {
            return res.status(400).json({
                success: false,
                message: '无法获取用户所属公司信息'
            });
        }

        // 2. 查询当前公司所有库存数据（仅查产品名和数量）
        const [inventoryResults] = await pool.execute(
            `SELECT product_name, quantity 
             FROM inventory 
             WHERE company = ?`,
            [userCompany]
        );

        // 3. 定义分类规则（按产品名称关键词匹配）
        const categoryRules = {
            '电子产品': ['电子', '手机', '电脑', '平板', '耳机', '充电器'],
            '办公用品': ['办公', '文具', '纸张', '打印机', '文件夹', '笔'],
            '原材料': ['原料', '材料', '配件', '零件', '组件'],
            '成品': ['成品', '商品', '设备', '机器'],
            '其他': [] // 默认分类
        };

        // 4. 初始化分类统计数据
        const categoryStats = {
            '电子产品': 0,
            '办公用品': 0,
            '原材料': 0,
            '成品': 0,
            '其他': 0
        };

        // 5. 按产品名称匹配分类并累加数量
        inventoryResults.forEach(item => {
            const productName = item.product_name.toLowerCase();
            let categorized = false;

            // 遍历分类规则匹配关键词
            Object.entries(categoryRules).forEach(([category, keywords]) => {
                if (keywords.some(keyword => productName.includes(keyword.toLowerCase()))) {
                    categoryStats[category] += parseInt(item.quantity);
                    categorized = true;
                }
            });

            // 未匹配到任何关键词，归入"其他"
            if (!categorized) {
                categoryStats['其他'] += parseInt(item.quantity);
            }
        });

        // 6. 格式化响应数据
        const responseData = Object.entries(categoryStats).map(([name, value]) => ({
            name,
            value
        }));

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('获取库存图表数据失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误，获取库存图表数据失败'
        });
    }
};