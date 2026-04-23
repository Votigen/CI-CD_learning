// routes/api/contactsRoutes.js
const express = require('express');
const router = express.Router();
const contactsController = require('../../controllers/contactsController');
const authMiddleware = require('../../midllewares/authMidlleware');

// 获取我的联系人列表
router.get('/contacts', authMiddleware, contactsController.getContacts);

//创建联系人
router.post('/contacts', authMiddleware, contactsController.createContact);

module.exports = router;