// routes/index.js
const express = require('express');
const router = express.Router();

const userRoutes = require('./api/userRoutes');
const productDetails = require('./api/productDetailsRoutes');
const orderRoutes = require('./api/orderRoutes');
const inventoryRoutes = require('./api/inventoryRoutes');
const authRoutes = require('./api/authRoutes');
const contactsRoutes = require('./api/contactsRoutes');
const statisticsRoutes = require('./api/statisticsRoutes');
// ✅ 给每个子路由分配独立前缀
router.use('/users', userRoutes);           // → /api/users/*
router.use('/product-details', productDetails); // → /api/product-details/*
router.use('/orders', orderRoutes);         // → /api/orders/*
router.use('/inventory', inventoryRoutes);  // → /api/inventory/*
router.use('/login', authRoutes);            // → /api/auth/login
router.use('/contacts', contactsRoutes);    // → /api/contacts
router.use('/statistics', statisticsRoutes);

module.exports = router;