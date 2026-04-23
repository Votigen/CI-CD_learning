// routes/api/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../../controllers/statisticsController');
const authMiddleware = require('../../midllewares/authMidlleware');

// 获取仪表盘统计数据
router.get('/dashboard', authMiddleware, statisticsController.getDashboardStatistics);

// 获取订单统计图表数据
router.get('/order-chart', authMiddleware, statisticsController.getOrderChartData);

// 获取库存统计图表数据
router.get('/inventory-chart', authMiddleware, statisticsController.getInventoryChartData);

module.exports = router;