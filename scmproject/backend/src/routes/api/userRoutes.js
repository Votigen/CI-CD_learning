// routes/api/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const authMiddleware = require('../../midllewares/authMidlleware');
//获取所有用户除了uid的信息
router.get('/users2', authMiddleware, userController.getAllUsers_e_uid);
// 获取所有用户
router.get('/users', authMiddleware, userController.getAllUsers);
// 获取用户 by id
router.get('/users/:id', authMiddleware, userController.getUserById);
// 创建用户
router.post('/register', userController.createUser);
// 修改用户
router.put('/users/:id', authMiddleware, userController.updateUser);
// 删除用户
router.delete('/users/:id', authMiddleware, userController.deleteUser);
// 获取用户公开信息
router.get('/public/:id', authMiddleware, userController.getPublicUserInfo);

module.exports = router;