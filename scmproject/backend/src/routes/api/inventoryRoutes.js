// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/inventoryController');
const authMiddleware = require('../../midllewares/authMidlleware');
// ✅ 创建库存
router.post('/inventory', authMiddleware, inventoryController.createInventory);

// ✅ 根据 product_id 查询
router.get('/inventory/:id', authMiddleware, inventoryController.getInventoryById);

// ✅ 获取所有库存
router.get('/inventory', authMiddleware, inventoryController.getAllInventory);

// ✅ 更新库存
router.put('/inventory/:id', authMiddleware, inventoryController.updateInventory);

// ✅ 删除库存
router.delete('/inventory/:id', authMiddleware, inventoryController.deleteInventory);

module.exports = router;