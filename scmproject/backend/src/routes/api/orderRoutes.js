// routes/api/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const authMiddleware = require('../../midllewares/authMidlleware');

// ✅ 创建订单
router.post('/orders', authMiddleware, orderController.createOrder);

// ✅ 根据 order_id 查询
router.get('/orders/:id', authMiddleware, orderController.getOrderById);

// ✅ 根据 order_id 查询 并计算
router.get('/orderss/:id', authMiddleware, orderController.getOrderById1);

// ✅ 获取购买人订单(我创建的)
router.get('/buy', authMiddleware, orderController.getOrdersWithSearch);

// ✅ 获取我的订单(我请求的)
// router.get('/supply', authMiddleware, orderController.getOrdersByCustomer);

// ✅ 更新订单
router.put('/orders/:id', authMiddleware, orderController.updateOrder);

// ✅ 删除订单
router.delete('/orders/:id', authMiddleware, orderController.deleteOrder);

// ✅ 分页查询购买订单
router.get('/purchase', authMiddleware, orderController.getOrdersWithSearch);

// ✅ 分页查询供应订单
router.get('/supply', authMiddleware, orderController.getSupplyOrdersWithSearch);

// ✅ 获取待审核的订单
router.get('/approval/pending', authMiddleware, orderController.getPendingApprovalOrders);

// ✅ 审核订单
router.post('/:order_id/approve', authMiddleware, orderController.approveOrder);

module.exports = router;